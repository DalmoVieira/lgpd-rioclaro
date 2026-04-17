import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CookieConsentService {
  constructor(private readonly prisma: PrismaService) {}

  async resolveAndRecord(
    tenantSlug: string,
    data: { sessionId?: string; ipAddress?: string; consentGiven: boolean; categories?: Record<string, boolean> },
  ) {
    const tenant = await this.prisma.tenant.findUnique({ where: { slug: tenantSlug } });
    if (!tenant) throw new NotFoundException('Tenant não encontrado');
    return this.record(tenant.id, data);
  }

  async record(
    tenantId: string,
    data: { sessionId?: string; ipAddress?: string; consentGiven: boolean; categories?: Record<string, boolean> },
  ) {
    return this.prisma.cookieConsentRecord.create({
      data: {
        tenantId,
        sessionId: data.sessionId,
        ipAddress: data.ipAddress,
        consentGiven: data.consentGiven,
        categories: data.categories ?? {},
      },
    });
  }

  async findAll(tenantId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.cookieConsentRecord.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.cookieConsentRecord.count({ where: { tenantId } }),
    ]);
    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async getStats(tenantId: string) {
    const [total, consented] = await Promise.all([
      this.prisma.cookieConsentRecord.count({ where: { tenantId } }),
      this.prisma.cookieConsentRecord.count({ where: { tenantId, consentGiven: true } }),
    ]);
    return {
      total,
      consented,
      denied: total - consented,
      consentRate: total > 0 ? Math.round((consented / total) * 100) : 0,
    };
  }
}
