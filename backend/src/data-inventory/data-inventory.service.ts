import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit-logs/audit.service';
import { CreateDataProcessingActivityDto, UpdateDataProcessingActivityDto } from './dto';
import { ConsentStatus } from '@prisma/client';

@Injectable()
export class DataInventoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async create(tenantId: string, dto: CreateDataProcessingActivityDto, userId: string, ip?: string) {
    // Regra: EXECUCAO_DE_POLITICAS_PUBLICAS → NAO_EXIGIDO_PELA_LEI
    let consentStatus: ConsentStatus = 'PENDENTE';
    if (dto.legalBasis === 'EXECUCAO_DE_POLITICAS_PUBLICAS') {
      consentStatus = 'NAO_EXIGIDO_PELA_LEI';
    }

    const activity = await this.prisma.dataProcessingActivity.create({
      data: {
        tenantId,
        ...dto,
        consentStatus,
        createdByUserId: userId,
      },
    });

    await this.auditService.log({
      tenantId, userId, action: 'CREATE',
      entity: 'DataProcessingActivity', entityId: activity.id, ipAddress: ip,
    });

    return activity;
  }

  async findAll(tenantId: string, page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { purpose: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.dataProcessingActivity.findMany({
        where, skip, take: limit,
        include: { department: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.dataProcessingActivity.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string, tenantId: string) {
    const activity = await this.prisma.dataProcessingActivity.findFirst({
      where: { id, tenantId },
      include: {
        department: true,
        riskAssessments: true,
        createdByUser: { select: { id: true, name: true } },
      },
    });
    if (!activity) throw new NotFoundException('Atividade não encontrada');
    return activity;
  }

  async update(id: string, tenantId: string, dto: UpdateDataProcessingActivityDto, userId: string, ip?: string) {
    await this.findById(id, tenantId);

    const data: any = { ...dto };
    // Regra de negócio
    if (dto.legalBasis === 'EXECUCAO_DE_POLITICAS_PUBLICAS') {
      data.consentStatus = 'NAO_EXIGIDO_PELA_LEI';
    }

    const activity = await this.prisma.dataProcessingActivity.update({
      where: { id }, data,
    });

    await this.auditService.log({
      tenantId, userId, action: 'UPDATE',
      entity: 'DataProcessingActivity', entityId: id, diff: dto, ipAddress: ip,
    });

    return activity;
  }
}
