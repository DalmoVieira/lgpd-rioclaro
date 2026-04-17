import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit-logs/audit.service';
import { WorkflowService } from '../workflows/workflow.service';

@Injectable()
export class ActionPlansService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly workflowService: WorkflowService,
  ) {}

  async create(tenantId: string, data: any, userId: string, ip?: string) {
    const plan = await this.prisma.actionPlan.create({
      data: {
        tenantId,
        title: data.title,
        description: data.description,
        linkedEntityType: data.linkedEntityType,
        linkedEntityId: data.linkedEntityId,
        riskAssessmentId: data.riskAssessmentId,
        securityIncidentId: data.securityIncidentId,
        responsibleUserId: data.responsibleUserId || userId,
        priority: data.priority || 'MEDIA',
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      },
    });

    try {
      const execution = await this.workflowService.startExecution(
        tenantId, 'ACTION_PLAN', 'ActionPlan', plan.id, userId, ip,
      );
      await this.prisma.actionPlan.update({
        where: { id: plan.id },
        data: { workflowExecutionId: execution.id },
      });
    } catch { /* workflow não configurado */ }

    await this.auditService.log({
      tenantId, userId, action: 'CREATE',
      entity: 'ActionPlan', entityId: plan.id, ipAddress: ip,
    });

    return plan;
  }

  async findAll(tenantId: string, page = 1, limit = 20, filters?: { status?: string; priority?: string }) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (filters?.status) where.status = filters.status;
    if (filters?.priority) where.priority = filters.priority;

    const [data, total] = await Promise.all([
      this.prisma.actionPlan.findMany({
        where, skip, take: limit,
        include: {
          responsibleUser: { select: { id: true, name: true } },
          riskAssessment: { select: { id: true, title: true } },
          securityIncident: { select: { id: true, title: true } },
          _count: { select: { evidences: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.actionPlan.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string, tenantId: string) {
    const plan = await this.prisma.actionPlan.findFirst({
      where: { id, tenantId },
      include: {
        responsibleUser: { select: { id: true, name: true } },
        riskAssessment: true,
        securityIncident: true,
        evidences: true,
      },
    });
    if (!plan) throw new NotFoundException('Plano de ação não encontrado');
    return plan;
  }

  async update(id: string, tenantId: string, data: any, userId: string, ip?: string) {
    await this.findById(id, tenantId);
    const plan = await this.prisma.actionPlan.update({ where: { id }, data });
    await this.auditService.log({
      tenantId, userId, action: 'UPDATE',
      entity: 'ActionPlan', entityId: id, diff: data, ipAddress: ip,
    });
    return plan;
  }

  async addEvidence(planId: string, tenantId: string, data: { description?: string; attachmentId?: string }) {
    await this.findById(planId, tenantId);
    return this.prisma.actionPlanEvidence.create({
      data: { actionPlanId: planId, ...data },
    });
  }
}
