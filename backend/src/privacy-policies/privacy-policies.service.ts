import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit-logs/audit.service';
import { PolicyType } from '@prisma/client';

@Injectable()
export class PrivacyPoliciesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async create(
    tenantId: string,
    data: { type: PolicyType; version: string; title: string; content: string },
    userId?: string,
  ) {
    const policy = await this.prisma.privacyPolicyVersion.create({
      data: { tenantId, ...data, createdByUserId: userId },
    });
    await this.auditService.log({ tenantId, userId, action: 'CREATE', entity: 'PrivacyPolicyVersion', entityId: policy.id });
    return policy;
  }

  async findAll(tenantId: string, type?: PolicyType) {
    return this.prisma.privacyPolicyVersion.findMany({
      where: { tenantId, ...(type ? { type } : {}) },
      include: { createdByUser: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, tenantId: string) {
    const policy = await this.prisma.privacyPolicyVersion.findFirst({
      where: { id, tenantId },
      include: { createdByUser: { select: { name: true, email: true } } },
    });
    if (!policy) throw new NotFoundException('Política não encontrada');
    return policy;
  }

  async findActive(tenantId: string, type: PolicyType) {
    return this.prisma.privacyPolicyVersion.findFirst({
      where: { tenantId, type, isActive: true },
    });
  }

  async publish(id: string, tenantId: string, userId?: string) {
    const policy = await this.findById(id, tenantId);

    // Deactivate current active policy of same type
    await this.prisma.privacyPolicyVersion.updateMany({
      where: { tenantId, type: policy.type, isActive: true },
      data: { isActive: false },
    });

    const updated = await this.prisma.privacyPolicyVersion.update({
      where: { id },
      data: { isActive: true, publishedAt: new Date() },
    });

    await this.auditService.log({ tenantId, userId, action: 'UPDATE', entity: 'PrivacyPolicyVersion', entityId: id, diff: { action: 'publish' } });
    return updated;
  }

  async update(
    id: string,
    tenantId: string,
    data: { title?: string; content?: string },
    userId?: string,
  ) {
    await this.findById(id, tenantId);
    const policy = await this.prisma.privacyPolicyVersion.update({ where: { id }, data });
    await this.auditService.log({ tenantId, userId, action: 'UPDATE', entity: 'PrivacyPolicyVersion', entityId: id, diff: data });
    return policy;
  }

  // Public endpoint - no auth required
  async getPublicPolicy(tenantSlug: string, type: PolicyType) {
    const tenant = await this.prisma.tenant.findUnique({ where: { slug: tenantSlug } });
    if (!tenant) throw new NotFoundException('Tenant não encontrado');
    const policy = await this.prisma.privacyPolicyVersion.findFirst({
      where: { tenantId: tenant.id, type, isActive: true },
      select: { title: true, content: true, version: true, publishedAt: true, type: true },
    });
    if (!policy) throw new NotFoundException('Política não publicada');
    return policy;
  }
}
