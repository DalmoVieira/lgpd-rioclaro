import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit-logs/audit.service';
import { CreateUserDto, UpdateUserDto } from './dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async create(tenantId: string, dto: CreateUserDto, actorId?: string, ip?: string) {
    const existing = await this.prisma.user.findUnique({
      where: { tenantId_email: { tenantId, email: dto.email } },
    });
    if (existing) throw new ConflictException('E-mail já cadastrado neste tenant');

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        tenantId,
        email: dto.email,
        name: dto.name,
        passwordHash,
        role: dto.role,
        departmentId: dto.departmentId,
      },
      select: {
        id: true, email: true, name: true, role: true,
        tenantId: true, departmentId: true, isActive: true,
        createdAt: true,
      },
    });

    await this.auditService.log({
      tenantId, userId: actorId, action: 'CREATE',
      entity: 'User', entityId: user.id, ipAddress: ip,
    });

    return user;
  }

  async findAll(tenantId: string, page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where, skip, take: limit,
        select: {
          id: true, email: true, name: true, role: true,
          departmentId: true, isActive: true, lastLoginAt: true,
          createdAt: true, department: { select: { id: true, name: true } },
        },
        orderBy: { name: 'asc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string, tenantId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, tenantId },
      select: {
        id: true, email: true, name: true, role: true,
        tenantId: true, departmentId: true, isActive: true,
        lastLoginAt: true, createdAt: true, updatedAt: true,
        department: { select: { id: true, name: true } },
      },
    });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  async update(id: string, tenantId: string, dto: UpdateUserDto, actorId?: string, ip?: string) {
    await this.findById(id, tenantId);
    const user = await this.prisma.user.update({
      where: { id },
      data: dto,
      select: {
        id: true, email: true, name: true, role: true,
        tenantId: true, departmentId: true, isActive: true,
      },
    });

    await this.auditService.log({
      tenantId, userId: actorId, action: 'UPDATE',
      entity: 'User', entityId: id, diff: dto, ipAddress: ip,
    });

    return user;
  }
}
