import {
  Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';
import { DataInventoryService } from './data-inventory.service';
import { CreateDataProcessingActivityDto, UpdateDataProcessingActivityDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { TenantId } from '../tenants/tenant.decorator';

@ApiTags('Data Inventory')
@Controller('data-inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DataInventoryController {
  constructor(private readonly service: DataInventoryService) {}

  @Post()
  @Roles('DPO', 'COMITE_PRIVACIDADE', 'GESTOR_SETORIAL', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Criar atividade de tratamento' })
  create(@TenantId() tenantId: string, @Body() dto: CreateDataProcessingActivityDto, @Req() req: Request) {
    const user = (req as any).user;
    return this.service.create(tenantId, dto, user.id, req.ip);
  }

  @Get()
  @Roles('DPO', 'COMITE_PRIVACIDADE', 'GESTOR_SETORIAL', 'OPERADOR', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Listar atividades de tratamento' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  findAll(@TenantId() tenantId: string, @Query('page') page?: number, @Query('limit') limit?: number, @Query('search') search?: string) {
    return this.service.findAll(tenantId, page, limit, search);
  }

  @Get(':id')
  @Roles('DPO', 'COMITE_PRIVACIDADE', 'GESTOR_SETORIAL', 'OPERADOR', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Obter atividade por ID' })
  findById(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.service.findById(id, tenantId);
  }

  @Patch(':id')
  @Roles('DPO', 'COMITE_PRIVACIDADE', 'GESTOR_SETORIAL', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Atualizar atividade' })
  update(@Param('id') id: string, @TenantId() tenantId: string, @Body() dto: UpdateDataProcessingActivityDto, @Req() req: Request) {
    const user = (req as any).user;
    return this.service.update(id, tenantId, dto, user.id, req.ip);
  }
}
