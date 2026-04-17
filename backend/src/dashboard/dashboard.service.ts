import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(tenantId: string) {
    const [
      totalRequests,
      openRequests,
      totalIncidents,
      openIncidents,
      totalRisks,
      highCriticalRisks,
      totalActionPlans,
      openActionPlans,
      totalActivities,
      pendingRipd,
    ] = await Promise.all([
      this.prisma.dataSubjectRequest.count({ where: { tenantId } }),
      this.prisma.dataSubjectRequest.count({ where: { tenantId, status: { not: 'ENCERRADO' } } }),
      this.prisma.securityIncident.count({ where: { tenantId } }),
      this.prisma.securityIncident.count({ where: { tenantId, status: { not: 'ENCERRADO' } } }),
      this.prisma.riskAssessment.count({ where: { tenantId } }),
      this.prisma.riskAssessment.count({ where: { tenantId, riskLevel: { in: ['ALTO', 'CRITICO'] } } }),
      this.prisma.actionPlan.count({ where: { tenantId } }),
      this.prisma.actionPlan.count({ where: { tenantId, status: { not: 'CONCLUIDO' } } }),
      this.prisma.dataProcessingActivity.count({ where: { tenantId, isActive: true } }),
      this.prisma.rIPDReport.count({ where: { tenantId, status: 'RASCUNHO' } }),
    ]);

    // SLAs vencidos (incidentes com deadline ANPD ultrapassado)
    const overdueIncidents = await this.prisma.securityIncident.count({
      where: {
        tenantId,
        notifiedAnpd: false,
        anpdDeadline: { lt: new Date() },
        status: { not: 'ENCERRADO' },
      },
    });

    // Solicitações por tipo
    const requestsByType = await this.prisma.dataSubjectRequest.groupBy({
      by: ['type'],
      where: { tenantId },
      _count: true,
    });

    // Riscos por nível
    const risksByLevel = await this.prisma.riskAssessment.groupBy({
      by: ['riskLevel'],
      where: { tenantId },
      _count: true,
    });

    return {
      requests: { total: totalRequests, open: openRequests },
      incidents: { total: totalIncidents, open: openIncidents, overdue: overdueIncidents },
      risks: { total: totalRisks, highCritical: highCriticalRisks },
      actionPlans: { total: totalActionPlans, open: openActionPlans },
      activities: { total: totalActivities },
      ripd: { pending: pendingRipd },
      charts: { requestsByType, risksByLevel },
    };
  }
}
