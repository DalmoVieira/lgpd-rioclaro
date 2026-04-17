import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditAction } from '@prisma/client';

export interface AuditLogInput {
  tenantId?: string;
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  diff?: any;
  ipAddress?: string;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(input: AuditLogInput) {
    return this.prisma.auditLog.create({
      data: {
        tenantId: input.tenantId,
        userId: input.userId,
        action: input.action as AuditAction,
        entity: input.entity,
        entityId: input.entityId,
        diff: input.diff,
        ipAddress: input.ipAddress,
      },
    });
  }

  async findByTenant(
    tenantId: string,
    options?: {
      page?: number;
      limit?: number;
      entity?: string;
      action?: string;
      userId?: string;
      startDate?: Date;
      endDate?: Date;
    },
  ) {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { tenantId };

    if (options?.entity) where.entity = options.entity;
    if (options?.action) where.action = options.action;
    if (options?.userId) where.userId = options.userId;
    if (options?.startDate || options?.endDate) {
      where.createdAt = {};
      if (options?.startDate) where.createdAt.gte = options.startDate;
      if (options?.endDate) where.createdAt.lte = options.endDate;
    }

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
