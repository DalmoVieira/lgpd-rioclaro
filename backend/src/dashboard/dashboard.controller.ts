import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { TenantId } from '../tenants/tenant.decorator';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get()
  @Roles('DPO', 'COMITE_PRIVACIDADE', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Obter resumo do dashboard' })
  getSummary(@TenantId() tenantId: string) {
    return this.service.getSummary(tenantId);
  }
}
