import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTenantDto, UpdateTenantDto } from './dto';

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTenantDto) {
    return this.prisma.tenant.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        domain: dto.domain,
        settings: {
          create: {
            officialName: dto.name,
            municipality: dto.municipality,
            city: dto.city,
            state: dto.state,
          },
        },
      },
      include: { settings: true },
    });
  }

  async findAll() {
    return this.prisma.tenant.findMany({
      include: { settings: true },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: { settings: true, brandingAssets: true },
    });
    if (!tenant) throw new NotFoundException('Tenant não encontrado');
    return tenant;
  }

  async findBySlug(slug: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
      include: { settings: true, brandingAssets: true },
    });
    if (!tenant) throw new NotFoundException('Tenant não encontrado');
    return tenant;
  }

  async update(id: string, dto: UpdateTenantDto) {
    await this.findById(id);
    return this.prisma.tenant.update({
      where: { id },
      data: dto,
      include: { settings: true },
    });
  }

  async deactivate(id: string) {
    await this.findById(id);
    return this.prisma.tenant.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async activate(id: string) {
    await this.findById(id);
    return this.prisma.tenant.update({
      where: { id },
      data: { isActive: true },
    });
  }
}
