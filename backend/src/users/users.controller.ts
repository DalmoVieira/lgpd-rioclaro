import {
  Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { TenantId } from '../tenants/tenant.decorator';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Post()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Criar usuário' })
  create(
    @TenantId() tenantId: string,
    @Body() dto: CreateUserDto,
    @Req() req: Request,
  ) {
    const user = (req as any).user;
    return this.service.create(tenantId, dto, user.id, req.ip);
  }

  @Get()
  @Roles('ADMIN', 'DPO', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Listar usuários do tenant' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @TenantId() tenantId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.service.findAll(tenantId, page, limit, search);
  }

  @Get(':id')
  @Roles('ADMIN', 'DPO', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Obter usuário por ID' })
  findById(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.service.findById(id, tenantId);
  }

  @Patch(':id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Atualizar usuário' })
  update(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @Body() dto: UpdateUserDto,
    @Req() req: Request,
  ) {
    const user = (req as any).user;
    return this.service.update(id, tenantId, dto, user.id, req.ip);
  }
}
