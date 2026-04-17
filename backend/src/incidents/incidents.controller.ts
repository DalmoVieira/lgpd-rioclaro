import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';
import { IncidentsService } from './incidents.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { TenantId } from '../tenants/tenant.decorator';

@ApiTags('Security Incidents')
@Controller('incidents')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class IncidentsController {
  constructor(private readonly service: IncidentsService) {}

  @Post()
  @Roles('DPO', 'ETIR', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Registrar incidente de segurança' })
  create(@TenantId() tenantId: string, @Body() dto: any, @Req() req: Request) {
    return this.service.create(tenantId, dto, (req as any).user.id, req.ip);
  }

  @Get()
  @Roles('DPO', 'ETIR', 'COMITE_PRIVACIDADE', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Listar incidentes' })
  findAll(@TenantId() tenantId: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.service.findAll(tenantId, page, limit);
  }

  @Get(':id')
  @Roles('DPO', 'ETIR', 'COMITE_PRIVACIDADE', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Obter incidente por ID' })
  findById(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.service.findById(id, tenantId);
  }

  @Patch(':id')
  @Roles('DPO', 'ETIR', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Atualizar incidente' })
  update(@Param('id') id: string, @TenantId() tenantId: string, @Body() dto: any, @Req() req: Request) {
    return this.service.update(id, tenantId, dto, (req as any).user.id, req.ip);
  }

  @Post(':id/notify-anpd')
  @Roles('DPO', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Notificar ANPD sobre o incidente' })
  notifyAnpd(@Param('id') id: string, @TenantId() tenantId: string, @Body('content') content: string, @Req() req: Request) {
    return this.service.notifyAnpd(id, tenantId, content, (req as any).user.id);
  }
}
