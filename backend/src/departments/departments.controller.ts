import { Controller, Get, Post, Patch, Param, Body, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';
import { DepartmentsService } from './departments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { TenantId } from '../tenants/tenant.decorator';
import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CreateDepartmentDto {
  @ApiProperty() @IsString() name: string;
  @ApiPropertyOptional() @IsOptional() @IsString() acronym?: string;
}

@ApiTags('Departments')
@Controller('departments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DepartmentsController {
  constructor(private readonly service: DepartmentsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Criar departamento' })
  create(@TenantId() tenantId: string, @Body() dto: CreateDepartmentDto, @Req() req: Request) {
    return this.service.create(tenantId, dto, (req as any).user?.id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar departamentos do tenant' })
  findAll(@TenantId() tenantId: string) {
    return this.service.findAll(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter departamento por ID' })
  findById(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.service.findById(id, tenantId);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Atualizar departamento' })
  update(@Param('id') id: string, @TenantId() tenantId: string, @Body() dto: any, @Req() req: Request) {
    return this.service.update(id, tenantId, dto, (req as any).user?.id);
  }
}
