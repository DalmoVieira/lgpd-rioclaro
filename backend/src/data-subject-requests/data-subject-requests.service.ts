import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit-logs/audit.service';
import { WorkflowService } from '../workflows/workflow.service';
import { CreateDataSubjectRequestDto, CreateMessageDto } from './dto';

@Injectable()
export class DataSubjectRequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly workflowService: WorkflowService,
  ) {}

  private async generateProtocol(tenantId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.dataSubjectRequest.count({
      where: { tenantId, protocol: { startsWith: `LGPD-${year}` } },
    });
    const seq = String(count + 1).padStart(4, '0');
    return `LGPD-${year}-${seq}`;
  }

  async create(tenantId: string, dto: CreateDataSubjectRequestDto, ip?: string) {
    const protocol = await this.generateProtocol(tenantId);

    const request = await this.prisma.dataSubjectRequest.create({
      data: {
        tenantId,
        protocol,
        type: dto.type,
        requesterName: dto.requesterName,
        requesterEmail: dto.requesterEmail,
        requesterCpf: dto.requesterCpf,
        requesterPhone: dto.requesterPhone,
        description: dto.description,
      },
    });

    // Iniciar workflow
    try {
      const execution = await this.workflowService.startExecution(
        tenantId, 'DATA_SUBJECT_REQUEST', 'DataSubjectRequest',
        request.id, 'SYSTEM', ip,
      );
      await this.prisma.dataSubjectRequest.update({
        where: { id: request.id },
        data: { workflowExecutionId: execution.id },
      });
    } catch {
      // Workflow não configurado — segue sem
    }

    await this.auditService.log({
      tenantId, action: 'CREATE', entity: 'DataSubjectRequest',
      entityId: request.id, ipAddress: ip,
    });

    return { protocol: request.protocol, id: request.id, message: 'Solicitação registrada com sucesso' };
  }

  // Consulta pública por protocolo + email
  async findByProtocol(tenantId: string, protocol: string, email: string) {
    const request = await this.prisma.dataSubjectRequest.findFirst({
      where: { tenantId, protocol, requesterEmail: email },
      select: {
        id: true, protocol: true, type: true, status: true,
        createdAt: true, updatedAt: true,
        messages: {
          select: { id: true, senderType: true, message: true, createdAt: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!request) throw new NotFoundException('Solicitação não encontrada');
    return request;
  }

  async findAll(tenantId: string, page = 1, limit = 20, filters?: { status?: string; type?: string; search?: string }) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (filters?.status) where.status = filters.status;
    if (filters?.type) where.type = filters.type;
    if (filters?.search) {
      where.OR = [
        { protocol: { contains: filters.search, mode: 'insensitive' } },
        { requesterName: { contains: filters.search, mode: 'insensitive' } },
        { requesterEmail: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.dataSubjectRequest.findMany({
        where, skip, take: limit,
        include: {
          assignedTo: { select: { id: true, name: true } },
          _count: { select: { messages: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.dataSubjectRequest.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string, tenantId: string) {
    const request = await this.prisma.dataSubjectRequest.findFirst({
      where: { id, tenantId },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        messages: {
          include: { },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!request) throw new NotFoundException('Solicitação não encontrada');
    return request;
  }

  async addMessage(id: string, tenantId: string, dto: CreateMessageDto, senderType: string, senderName?: string) {
    await this.findById(id, tenantId);
    return this.prisma.dataSubjectRequestMessage.create({
      data: {
        requestId: id,
        senderType,
        senderName,
        message: dto.message,
        attachmentId: dto.attachmentId,
      },
    });
  }

  async assignTo(id: string, tenantId: string, userId: string, actorId: string) {
    await this.findById(id, tenantId);
    const updated = await this.prisma.dataSubjectRequest.update({
      where: { id },
      data: { assignedToId: userId },
    });
    await this.auditService.log({
      tenantId, userId: actorId, action: 'UPDATE',
      entity: 'DataSubjectRequest', entityId: id,
      diff: { assignedToId: userId },
    });
    return updated;
  }
}
