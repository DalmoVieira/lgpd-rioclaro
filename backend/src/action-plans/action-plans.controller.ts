import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';
import { ActionPlansService } from './action-plans.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { TenantId } from '../tenants/tenant.decorator';

@ApiTags('Action Plans')
@Controller('action-plans')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ActionPlansController {
  constructor(private readonly service: ActionPlansService) {}

  @Post()
  @Roles('DPO', 'COMITE_PRIVACIDADE', 'GESTOR_SETORIAL', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Criar plano de ação' })
  create(@TenantId() tenantId: string, @Body() dto: any, @Req() req: Request) {
    return this.service.create(tenantId, dto, (req as any).user.id, req.ip);
  }

  @Get()
  @Roles('DPO', 'COMITE_PRIVACIDADE', 'GESTOR_SETORIAL', 'OPERADOR', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Listar planos de ação' })
  findAll(@TenantId() tenantId: string, @Query('page') page?: number, @Query('limit') limit?: number, @Query('status') status?: string, @Query('priority') priority?: string) {
    return this.service.findAll(tenantId, page, limit, { status, priority });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter plano por ID' })
  findById(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.service.findById(id, tenantId);
  }

  @Patch(':id')
  @Roles('DPO', 'COMITE_PRIVACIDADE', 'GESTOR_SETORIAL', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Atualizar plano de ação' })
  update(@Param('id') id: string, @TenantId() tenantId: string, @Body() dto: any, @Req() req: Request) {
    return this.service.update(id, tenantId, dto, (req as any).user.id, req.ip);
  }

  @Post(':id/evidences')
  @Roles('DPO', 'COMITE_PRIVACIDADE', 'GESTOR_SETORIAL', 'OPERADOR', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Adicionar evidência' })
  addEvidence(@Param('id') id: string, @TenantId() tenantId: string, @Body() dto: any) {
    return this.service.addEvidence(id, tenantId, dto);
  }
}
