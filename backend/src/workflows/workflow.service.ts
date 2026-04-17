import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit-logs/audit.service';
import { WorkflowProcessType, Role } from '@prisma/client';

@Injectable()
export class WorkflowService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  // Resolve o workflow ativo para o tenant ou fallback para o default
  async resolveWorkflow(tenantId: string, processType: WorkflowProcessType) {
    // Primeiro tenta workflow customizado do tenant
    let workflow = await this.prisma.workflowDefinition.findFirst({
      where: {
        tenantId,
        processType,
        isActive: true,
      },
      include: {
        steps: { orderBy: { order: 'asc' } },
        transitions: {
          include: {
            fromStep: true,
            toStep: true,
          },
        },
      },
      orderBy: { version: 'desc' },
    });

    // Fallback: workflow default de qualquer tenant
    if (!workflow) {
      workflow = await this.prisma.workflowDefinition.findFirst({
        where: {
          processType,
          isDefault: true,
          isActive: true,
        },
        include: {
          steps: { orderBy: { order: 'asc' } },
          transitions: {
            include: {
              fromStep: true,
              toStep: true,
            },
          },
        },
        orderBy: { version: 'desc' },
      });
    }

    if (!workflow) {
      throw new NotFoundException(
        `Nenhum workflow encontrado para ${processType}`,
      );
    }

    return workflow;
  }

  // Inicia uma execução de workflow
  async startExecution(
    tenantId: string,
    processType: WorkflowProcessType,
    entityType: string,
    entityId: string,
    userId: string,
    ipAddress?: string,
  ) {
    const workflow = await this.resolveWorkflow(tenantId, processType);

    const initialStep = workflow.steps.find((s) => s.isInitial);
    if (!initialStep) {
      throw new BadRequestException('Workflow sem etapa inicial definida');
    }

    const execution = await this.prisma.workflowExecution.create({
      data: {
        tenantId,
        workflowDefinitionId: workflow.id,
        entityType,
        entityId,
        currentStepId: initialStep.id,
      },
      include: {
        currentStep: true,
        workflowDefinition: true,
      },
    });

    // Registrar no histórico
    await this.prisma.workflowExecutionHistory.create({
      data: {
        executionId: execution.id,
        toStepId: initialStep.id,
        userId,
        comment: 'Workflow iniciado',
      },
    });

    // Auditoria
    await this.auditService.log({
      tenantId,
      userId,
      action: 'WORKFLOW_TRANSITION',
      entity: entityType,
      entityId,
      diff: {
        workflowId: workflow.id,
        toStep: initialStep.key,
        action: 'START',
      },
      ipAddress,
    });

    return execution;
  }

  // Realiza uma transição de etapa
  async transition(
    executionId: string,
    toStepKey: string,
    userId: string,
    userRole: string,
    options?: {
      comment?: string;
      attachmentId?: string;
      ipAddress?: string;
    },
  ) {
    const execution = await this.prisma.workflowExecution.findUnique({
      where: { id: executionId },
      include: {
        currentStep: true,
        workflowDefinition: {
          include: {
            steps: true,
            transitions: {
              include: {
                fromStep: true,
                toStep: true,
              },
            },
          },
        },
      },
    });

    if (!execution) {
      throw new NotFoundException('Execução de workflow não encontrada');
    }

    if (execution.completedAt) {
      throw new BadRequestException('Workflow já finalizado');
    }

    // Encontrar etapa destino
    const toStep = execution.workflowDefinition.steps.find(
      (s) => s.key === toStepKey,
    );
    if (!toStep) {
      throw new BadRequestException(`Etapa '${toStepKey}' não encontrada`);
    }

    // Validar transição permitida
    const transition = execution.workflowDefinition.transitions.find(
      (t) =>
        t.fromStepId === execution.currentStepId && t.toStepId === toStep.id,
    );

    if (!transition) {
      throw new BadRequestException(
        `Transição de '${execution.currentStep.key}' para '${toStepKey}' não é permitida`,
      );
    }

    // Validar role
    if (
      transition.allowedRoles.length > 0 &&
      !transition.allowedRoles.includes(userRole as Role)
    ) {
      throw new ForbiddenException(
        `Papel '${userRole}' não tem permissão para esta transição`,
      );
    }

    // Validar requisitos da etapa destino
    if (toStep.requiresComment && !options?.comment) {
      throw new BadRequestException(
        `Etapa '${toStep.label}' exige comentário`,
      );
    }
    if (toStep.requiresAttachment && !options?.attachmentId) {
      throw new BadRequestException(`Etapa '${toStep.label}' exige anexo`);
    }

    // Executar transição
    const updatedExecution = await this.prisma.workflowExecution.update({
      where: { id: executionId },
      data: {
        currentStepId: toStep.id,
        completedAt: toStep.isFinal ? new Date() : undefined,
      },
      include: {
        currentStep: true,
      },
    });

    // Registrar no histórico
    await this.prisma.workflowExecutionHistory.create({
      data: {
        executionId: execution.id,
        fromStepId: execution.currentStepId,
        toStepId: toStep.id,
        userId,
        comment: options?.comment,
        attachmentId: options?.attachmentId,
      },
    });

    // Auditoria
    await this.auditService.log({
      tenantId: execution.tenantId,
      userId,
      action: 'WORKFLOW_TRANSITION',
      entity: execution.entityType,
      entityId: execution.entityId,
      diff: {
        executionId,
        fromStep: execution.currentStep.key,
        toStep: toStepKey,
        comment: options?.comment,
      },
      ipAddress: options?.ipAddress,
    });

    return updatedExecution;
  }

  // Transições disponíveis para o usuário atual
  async getAvailableTransitions(executionId: string, userRole: string) {
    const execution = await this.prisma.workflowExecution.findUnique({
      where: { id: executionId },
      include: {
        currentStep: true,
        workflowDefinition: {
          include: {
            transitions: {
              include: {
                fromStep: true,
                toStep: true,
              },
            },
          },
        },
      },
    });

    if (!execution || execution.completedAt) return [];

    return execution.workflowDefinition.transitions
      .filter(
        (t) =>
          t.fromStepId === execution.currentStepId &&
          (t.allowedRoles.length === 0 ||
            t.allowedRoles.includes(userRole as Role)),
      )
      .map((t) => ({
        transitionId: t.id,
        toStep: {
          id: t.toStep.id,
          key: t.toStep.key,
          label: t.toStep.label,
          color: t.toStep.color,
          requiresComment: t.toStep.requiresComment,
          requiresAttachment: t.toStep.requiresAttachment,
          requiresApproval: t.toStep.requiresApproval,
          isFinal: t.toStep.isFinal,
        },
      }));
  }

  // Histórico de execução
  async getExecutionHistory(executionId: string) {
    return this.prisma.workflowExecutionHistory.findMany({
      where: { executionId },
      include: {
        fromStep: true,
        toStep: true,
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  // Status atual
  async getExecutionStatus(executionId: string) {
    const execution = await this.prisma.workflowExecution.findUnique({
      where: { id: executionId },
      include: {
        currentStep: true,
        workflowDefinition: {
          include: {
            steps: { orderBy: { order: 'asc' } },
          },
        },
      },
    });

    if (!execution) {
      throw new NotFoundException('Execução não encontrada');
    }

    // Calcular SLA
    const history = await this.prisma.workflowExecutionHistory.findFirst({
      where: { executionId, toStepId: execution.currentStepId },
      orderBy: { createdAt: 'desc' },
    });

    let slaDeadline: Date | null = null;
    if (execution.currentStep.slaHours && history) {
      slaDeadline = new Date(history.createdAt);
      slaDeadline.setHours(
        slaDeadline.getHours() + execution.currentStep.slaHours,
      );
    }

    return {
      execution,
      currentStep: execution.currentStep,
      allSteps: execution.workflowDefinition.steps,
      slaDeadline,
      isOverdue: slaDeadline ? new Date() > slaDeadline : false,
      isCompleted: !!execution.completedAt,
    };
  }

  // CRUD de WorkflowDefinition (para admin)
  async findDefinitionsByTenant(tenantId: string) {
    return this.prisma.workflowDefinition.findMany({
      where: { tenantId },
      include: {
        steps: { orderBy: { order: 'asc' } },
        transitions: {
          include: { fromStep: true, toStep: true },
        },
      },
      orderBy: [{ processType: 'asc' }, { version: 'desc' }],
    });
  }

  async findDefinitionById(id: string) {
    const def = await this.prisma.workflowDefinition.findUnique({
      where: { id },
      include: {
        steps: { orderBy: { order: 'asc' } },
        transitions: {
          include: { fromStep: true, toStep: true },
        },
      },
    });
    if (!def) throw new NotFoundException('Workflow não encontrado');
    return def;
  }
}
