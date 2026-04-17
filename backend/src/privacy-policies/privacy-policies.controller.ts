import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';
import { PrivacyPoliciesService } from './privacy-policies.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { TenantId } from '../tenants/tenant.decorator';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PolicyType } from '@prisma/client';

class CreatePolicyDto {
  @ApiProperty({ enum: PolicyType }) @IsEnum(PolicyType) type: PolicyType;
  @ApiProperty() @IsString() version: string;
  @ApiProperty() @IsString() title: string;
  @ApiProperty() @IsString() content: string;
}

class UpdatePolicyDto {
  @ApiPropertyOptional() @IsOptional() @IsString() title?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() content?: string;
}

@ApiTags('Privacy Policies')
@Controller('privacy-policies')
export class PrivacyPoliciesController {
  constructor(private readonly service: PrivacyPoliciesService) {}

  // Public endpoints
  @Get('public/:slug/:type')
  @ApiOperation({ summary: 'Obter política pública ativa por slug do tenant' })
  getPublicPolicy(@Param('slug') slug: string, @Param('type') type: PolicyType) {
    return this.service.getPublicPolicy(slug, type);
  }

  // Authenticated endpoints
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'DPO')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar versão de política' })
  create(@TenantId() tenantId: string, @Body() dto: CreatePolicyDto, @Req() req: Request) {
    return this.service.create(tenantId, dto, (req as any).user?.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar versões de políticas' })
  findAll(@TenantId() tenantId: string, @Query('type') type?: PolicyType) {
    return this.service.findAll(tenantId, type);
  }

  @Get('active/:type')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter política ativa por tipo' })
  findActive(@TenantId() tenantId: string, @Param('type') type: PolicyType) {
    return this.service.findActive(tenantId, type);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter versão de política por ID' })
  findById(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.service.findById(id, tenantId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'DPO')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar versão de política (rascunho)' })
  update(@Param('id') id: string, @TenantId() tenantId: string, @Body() dto: UpdatePolicyDto, @Req() req: Request) {
    return this.service.update(id, tenantId, dto, (req as any).user?.id);
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'DPO')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publicar versão de política (desativa anterior)' })
  publish(@Param('id') id: string, @TenantId() tenantId: string, @Req() req: Request) {
    return this.service.publish(id, tenantId, (req as any).user?.id);
  }
}
