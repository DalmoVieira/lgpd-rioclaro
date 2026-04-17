import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';
import { RiskAssessmentsService } from './risk-assessments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { TenantId } from '../tenants/tenant.decorator';

@ApiTags('Risk Assessments')
@Controller('risk-assessments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class RiskAssessmentsController {
  constructor(private readonly service: RiskAssessmentsService) {}

  @Post()
  @Roles('DPO', 'COMITE_PRIVACIDADE', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Criar avaliação de risco' })
  create(@TenantId() tenantId: string, @Body() dto: any, @Req() req: Request) {
    return this.service.create(tenantId, dto, (req as any).user.id, req.ip);
  }

  @Get()
  @Roles('DPO', 'COMITE_PRIVACIDADE', 'GESTOR_SETORIAL', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Listar avaliações de risco' })
  findAll(@TenantId() tenantId: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.service.findAll(tenantId, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter avaliação por ID' })
  findById(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.service.findById(id, tenantId);
  }

  @Patch(':id')
  @Roles('DPO', 'COMITE_PRIVACIDADE', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Atualizar avaliação de risco' })
  update(@Param('id') id: string, @TenantId() tenantId: string, @Body() dto: any, @Req() req: Request) {
    return this.service.update(id, tenantId, dto, (req as any).user.id, req.ip);
  }
}
