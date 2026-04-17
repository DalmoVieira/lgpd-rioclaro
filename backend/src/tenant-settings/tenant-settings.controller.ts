import { Controller, Get, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';
import { TenantSettingsService } from './tenant-settings.service';
import { UpdateTenantSettingsDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { TenantId } from '../tenants/tenant.decorator';

@ApiTags('Tenant Settings')
@Controller('tenant-settings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TenantSettingsController {
  constructor(private readonly service: TenantSettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Obter configurações do tenant' })
  find(@TenantId() tenantId: string) {
    return this.service.findByTenant(tenantId);
  }

  @Patch()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Atualizar configurações do tenant' })
  update(
    @TenantId() tenantId: string,
    @Body() dto: UpdateTenantSettingsDto,
    @Req() req: Request,
  ) {
    const user = (req as any).user;
    return this.service.update(tenantId, dto, user.id, req.ip);
  }
}
