import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';
import { WorkflowService } from './workflow.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { TenantId } from '../tenants/tenant.decorator';
import { TransitionDto } from './dto';

@ApiTags('Workflows')
@Controller('workflows')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WorkflowController {
  constructor(private readonly service: WorkflowService) {}

  @Get('definitions')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'DPO', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Listar definições de workflow do tenant' })
  findDefinitions(@TenantId() tenantId: string) {
    return this.service.findDefinitionsByTenant(tenantId);
  }

  @Get('definitions/:id')
  @ApiOperation({ summary: 'Obter definição de workflow por ID' })
  findDefinition(@Param('id') id: string) {
    return this.service.findDefinitionById(id);
  }

  @Get('executions/:id/status')
  @ApiOperation({ summary: 'Status atual de execução de workflow' })
  getStatus(@Param('id') id: string) {
    return this.service.getExecutionStatus(id);
  }

  @Get('executions/:id/transitions')
  @ApiOperation({ summary: 'Transições disponíveis para o usuário' })
  getTransitions(@Param('id') id: string, @Req() req: Request) {
    const user = (req as any).user;
    return this.service.getAvailableTransitions(id, user.role);
  }

  @Get('executions/:id/history')
  @ApiOperation({ summary: 'Histórico de execução do workflow' })
  getHistory(@Param('id') id: string) {
    return this.service.getExecutionHistory(id);
  }

  @Post('executions/:id/transition')
  @ApiOperation({ summary: 'Executar transição de workflow' })
  transition(
    @Param('id') id: string,
    @Body() dto: TransitionDto,
    @Req() req: Request,
  ) {
    const user = (req as any).user;
    return this.service.transition(id, dto.toStepKey, user.id, user.role, {
      comment: dto.comment,
      attachmentId: dto.attachmentId,
      ipAddress: req.ip,
    });
  }
}
