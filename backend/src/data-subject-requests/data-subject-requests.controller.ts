import {
  Controller, Get, Post, Param, Body, Query, UseGuards, Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';
import { DataSubjectRequestsService } from './data-subject-requests.service';
import { CreateDataSubjectRequestDto, CreateMessageDto, LookupRequestDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { TenantId } from '../tenants/tenant.decorator';

@ApiTags('Data Subject Requests')
@Controller('data-subject-requests')
export class DataSubjectRequestsController {
  constructor(private readonly service: DataSubjectRequestsService) {}

  // === ROTAS PÚBLICAS ===

  @Post('public')
  @ApiOperation({ summary: 'Criar solicitação do titular (público)' })
  createPublic(
    @TenantId() tenantId: string,
    @Body() dto: CreateDataSubjectRequestDto,
    @Req() req: Request,
  ) {
    return this.service.create(tenantId, dto, req.ip);
  }

  @Post('public/lookup')
  @ApiOperation({ summary: 'Consultar solicitação por protocolo (público)' })
  lookup(@TenantId() tenantId: string, @Body() dto: LookupRequestDto) {
    return this.service.findByProtocol(tenantId, dto.protocol, dto.email);
  }

  // === ROTAS AUTENTICADAS ===

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DPO', 'COMITE_PRIVACIDADE', 'OPERADOR', 'ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar solicitações do tenant' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @TenantId() tenantId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('search') search?: string,
  ) {
    return this.service.findAll(tenantId, page, limit, { status, type, search });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DPO', 'COMITE_PRIVACIDADE', 'OPERADOR', 'ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter solicitação por ID' })
  findById(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.service.findById(id, tenantId);
  }

  @Post(':id/messages')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DPO', 'COMITE_PRIVACIDADE', 'OPERADOR', 'ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Adicionar mensagem/resposta' })
  addMessage(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @Body() dto: CreateMessageDto,
    @Req() req: Request,
  ) {
    const user = (req as any).user;
    return this.service.addMessage(id, tenantId, dto, 'OPERATOR', user.name);
  }

  @Post(':id/assign/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DPO', 'ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atribuir solicitação a um usuário' })
  assign(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @TenantId() tenantId: string,
    @Req() req: Request,
  ) {
    const actor = (req as any).user;
    return this.service.assignTo(id, tenantId, userId, actor.id);
  }
}
