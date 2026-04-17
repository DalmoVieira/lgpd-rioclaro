import { Controller, Get, Put, Delete, Param, Body, UseGuards, Req, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';
import { SystemSettingsService } from './system-settings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { TenantId } from '../tenants/tenant.decorator';
import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class SetSettingDto {
  @ApiProperty() @IsString() key: string;
  @ApiProperty() value: any;
}

@ApiTags('System Settings')
@Controller('system-settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
@ApiBearerAuth()
export class SystemSettingsController {
  constructor(private readonly service: SystemSettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar configurações do tenant' })
  getAll(@TenantId() tenantId: string) {
    return this.service.getAll(tenantId);
  }

  @Get('global')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Listar configurações globais' })
  getAllGlobal() {
    return this.service.getAll(null);
  }

  @Get(':key')
  @ApiOperation({ summary: 'Obter configuração por chave' })
  get(@Param('key') key: string, @TenantId() tenantId: string) {
    return this.service.get(key, tenantId);
  }

  @Put()
  @ApiOperation({ summary: 'Definir configuração do tenant' })
  set(@TenantId() tenantId: string, @Body() dto: SetSettingDto, @Req() req: Request) {
    return this.service.set(dto.key, dto.value, tenantId, (req as any).user?.id);
  }

  @Put('global')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Definir configuração global' })
  setGlobal(@Body() dto: SetSettingDto, @Req() req: Request) {
    return this.service.set(dto.key, dto.value, null, (req as any).user?.id);
  }

  @Delete(':key')
  @ApiOperation({ summary: 'Excluir configuração do tenant' })
  delete(@Param('key') key: string, @TenantId() tenantId: string, @Req() req: Request) {
    return this.service.delete(key, tenantId, (req as any).user?.id);
  }
}
