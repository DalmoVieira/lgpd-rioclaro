import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    let tenantSlug: string | undefined;

    // 1. Header explícito
    tenantSlug = req.headers['x-tenant-slug'] as string;

    // 2. Query param
    if (!tenantSlug) {
      tenantSlug = req.query['tenant'] as string;
    }

    // 3. Subdomínio
    if (!tenantSlug) {
      const host = req.headers.host || '';
      const parts = host.split('.');
      if (parts.length >= 3) {
        tenantSlug = parts[0];
      }
    }

    if (tenantSlug) {
      const tenant = await this.prisma.tenant.findUnique({
        where: { slug: tenantSlug },
      });

      if (!tenant) {
        throw new BadRequestException(`Tenant '${tenantSlug}' não encontrado`);
      }

      if (!tenant.isActive) {
        throw new BadRequestException(`Tenant '${tenantSlug}' está inativo`);
      }

      (req as any).tenantId = tenant.id;
      (req as any).tenantSlug = tenant.slug;
    }

    next();
  }
}
