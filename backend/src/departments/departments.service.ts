import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit-logs/audit.service';

@Injectable()
export class DepartmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async create(tenantId: string, data: { name: string; acronym?: string }, userId?: string) {
    const dept = await this.prisma.department.create({
      data: { tenantId, name: data.name, acronym: data.acronym },
    });
    await this.auditService.log({ tenantId, userId, action: 'CREATE', entity: 'Department', entityId: dept.id });
    return dept;
  }

  async findAll(tenantId: string) {
    return this.prisma.department.findMany({
      where: { tenantId, isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string, tenantId: string) {
    const dept = await this.prisma.department.findFirst({ where: { id, tenantId } });
    if (!dept) throw new NotFoundException('Departamento não encontrado');
    return dept;
  }

  async update(id: string, tenantId: string, data: { name?: string; acronym?: string; isActive?: boolean }, userId?: string) {
    await this.findById(id, tenantId);
    const dept = await this.prisma.department.update({ where: { id }, data });
    await this.auditService.log({ tenantId, userId, action: 'UPDATE', entity: 'Department', entityId: id, diff: data });
    return dept;
  }
}
