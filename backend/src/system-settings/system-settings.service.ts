import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit-logs/audit.service';

@Injectable()
export class SystemSettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async get(key: string, tenantId?: string | null) {
    const setting = await this.prisma.systemSetting.findUnique({
      where: { tenantId_key: { tenantId: tenantId ?? '', key } },
    });
    return setting?.value ?? null;
  }

  async getAll(tenantId?: string | null) {
    return this.prisma.systemSetting.findMany({
      where: { tenantId: tenantId ?? null },
      orderBy: { key: 'asc' },
    });
  }

  async set(key: string, value: any, tenantId?: string | null, userId?: string) {
    const setting = await this.prisma.systemSetting.upsert({
      where: { tenantId_key: { tenantId: tenantId ?? '', key } },
      update: { value },
      create: { tenantId: tenantId ?? null, key, value },
    });
    await this.auditService.log({
      tenantId: tenantId ?? undefined,
      userId,
      action: 'UPDATE',
      entity: 'SystemSetting',
      entityId: setting.id,
      diff: { key, value },
    });
    return setting;
  }

  async delete(key: string, tenantId?: string | null, userId?: string) {
    const setting = await this.prisma.systemSetting.findUnique({
      where: { tenantId_key: { tenantId: tenantId ?? '', key } },
    });
    if (!setting) throw new NotFoundException('Configuração não encontrada');
    await this.prisma.systemSetting.delete({ where: { id: setting.id } });
    await this.auditService.log({
      tenantId: tenantId ?? undefined,
      userId,
      action: 'DELETE',
      entity: 'SystemSetting',
      entityId: setting.id,
    });
  }
}
