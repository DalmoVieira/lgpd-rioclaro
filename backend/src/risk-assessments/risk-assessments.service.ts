import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit-logs/audit.service';
import { RiskLevel } from '@prisma/client';

@Injectable()
export class RiskAssessmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async create(tenantId: string, data: any, userId: string, ip?: string) {
    // Auto-recomendar RIPD para alto/crítico
    const ripdRecommended = ['ALTO', 'CRITICO'].includes(data.riskLevel);

    const risk = await this.prisma.riskAssessment.create({
      data: { tenantId, ...data, ripdRecommended },
    });

    // Se RIPD recomendado, verificar dado sensível em larga escala
    if (ripdRecommended && data.dataProcessingActivityId) {
      const activity = await this.prisma.dataProcessingActivity.findUnique({
        where: { id: data.dataProcessingActivityId },
      });
      if (activity && activity.dataType === 'SENSIVEL') {
        // Criar RIPD automaticamente
        await this.prisma.rIPDReport.create({
          data: {
            tenantId,
            riskAssessmentId: risk.id,
            dataProcessingActivityId: data.dataProcessingActivityId,
            treatmentDescription: activity.purpose || '',
            purpose: activity.purpose,
            legalBasis: activity.legalBasis,
            status: 'RASCUNHO',
            createdByUserId: userId,
          },
        });
      }
    }

    await this.auditService.log({
      tenantId, userId, action: 'CREATE',
      entity: 'RiskAssessment', entityId: risk.id, ipAddress: ip,
    });

    return risk;
  }

  async findAll(tenantId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.riskAssessment.findMany({
        where: { tenantId }, skip, take: limit,
        include: {
          dataProcessingActivity: { select: { id: true, name: true } },
          responsibleUser: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.riskAssessment.count({ where: { tenantId } }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string, tenantId: string) {
    const risk = await this.prisma.riskAssessment.findFirst({
      where: { id, tenantId },
      include: {
        dataProcessingActivity: true,
        responsibleUser: { select: { id: true, name: true } },
        ripdReports: true,
        actionPlans: true,
      },
    });
    if (!risk) throw new NotFoundException('Avaliação não encontrada');
    return risk;
  }

  async update(id: string, tenantId: string, data: any, userId: string, ip?: string) {
    await this.findById(id, tenantId);
    const risk = await this.prisma.riskAssessment.update({ where: { id }, data });
    await this.auditService.log({
      tenantId, userId, action: 'UPDATE',
      entity: 'RiskAssessment', entityId: id, diff: data, ipAddress: ip,
    });
    return risk;
  }
}
