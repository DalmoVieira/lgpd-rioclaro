import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit-logs/audit.service';
import { WorkflowService } from '../workflows/workflow.service';

@Injectable()
export class IncidentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly workflowService: WorkflowService,
  ) {}

  // Calcula 3 dias úteis a partir de uma data
  private calculateBusinessDaysDeadline(from: Date, days: number): Date {
    const result = new Date(from);
    let added = 0;
    while (added < days) {
      result.setDate(result.getDate() + 1);
      const dayOfWeek = result.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        added++;
      }
    }
    return result;
  }

  async create(tenantId: string, data: any, userId: string, ip?: string) {
    const detectedAt = new Date(data.detectedAt);
    const anpdDeadline = this.calculateBusinessDaysDeadline(detectedAt, 3);

    const incident = await this.prisma.securityIncident.create({
      data: {
        tenantId,
        title: data.title,
        description: data.description,
        detectedAt,
        dataCategories: data.dataCategories,
        estimatedAffectedCount: data.estimatedAffectedCount,
        severity: data.severity,
        anpdDeadline,
        reportedByUserId: userId,
      },
    });

    // Iniciar workflow
    try {
      const execution = await this.workflowService.startExecution(
        tenantId, 'SECURITY_INCIDENT', 'SecurityIncident',
        incident.id, userId, ip,
      );
      await this.prisma.securityIncident.update({
        where: { id: incident.id },
        data: { workflowExecutionId: execution.id },
      });
    } catch { /* workflow não configurado */ }

    await this.auditService.log({
      tenantId, userId, action: 'CREATE',
      entity: 'SecurityIncident', entityId: incident.id, ipAddress: ip,
    });

    return incident;
  }

  async findAll(tenantId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.securityIncident.findMany({
        where: { tenantId }, skip, take: limit,
        include: {
          reportedByUser: { select: { id: true, name: true } },
        },
        orderBy: { detectedAt: 'desc' },
      }),
      this.prisma.securityIncident.count({ where: { tenantId } }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string, tenantId: string) {
    const incident = await this.prisma.securityIncident.findFirst({
      where: { id, tenantId },
      include: {
        reportedByUser: { select: { id: true, name: true } },
        notifications: true,
        actionPlans: true,
      },
    });
    if (!incident) throw new NotFoundException('Incidente não encontrado');
    return incident;
  }

  async update(id: string, tenantId: string, data: any, userId: string, ip?: string) {
    await this.findById(id, tenantId);
    const incident = await this.prisma.securityIncident.update({ where: { id }, data });
    await this.auditService.log({
      tenantId, userId, action: 'UPDATE',
      entity: 'SecurityIncident', entityId: id, diff: data, ipAddress: ip,
    });
    return incident;
  }

  async notifyAnpd(id: string, tenantId: string, content: string, userId: string) {
    await this.findById(id, tenantId);
    await this.prisma.securityIncident.update({
      where: { id },
      data: { notifiedAnpd: true, anpdNotificationDate: new Date() },
    });
    await this.prisma.incidentNotification.create({
      data: { tenantId, incidentId: id, type: 'ANPD', sentAt: new Date(), content },
    });
    await this.auditService.log({
      tenantId, userId, action: 'STATUS_CHANGE',
      entity: 'SecurityIncident', entityId: id,
      diff: { notifiedAnpd: true },
    });
  }
}
