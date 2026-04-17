import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit-logs/audit.service';
import { UpdateTenantSettingsDto } from './dto';

@Injectable()
export class TenantSettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async findByTenant(tenantId: string) {
    const settings = await this.prisma.tenantSettings.findUnique({
      where: { tenantId },
    });
    if (!settings) throw new NotFoundException('Configurações não encontradas');
    return settings;
  }

  async update(tenantId: string, dto: UpdateTenantSettingsDto, userId?: string, ip?: string) {
    const settings = await this.prisma.tenantSettings.upsert({
      where: { tenantId },
      update: dto,
      create: { tenantId, ...dto },
    });

    await this.auditService.log({
      tenantId, userId, action: 'SETTINGS_CHANGE',
      entity: 'TenantSettings', entityId: settings.id,
      diff: dto, ipAddress: ip,
    });

    return settings;
  }
}
