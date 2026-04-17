import { Controller, Get, Post, Body, Query, UseGuards, Req, Ip } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';
import { CookieConsentService } from './cookie-consent.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantId } from '../tenants/tenant.decorator';
import { IsBoolean, IsOptional, IsObject, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class RecordConsentDto {
  @ApiProperty() @IsString() tenantSlug: string;
  @ApiPropertyOptional() @IsOptional() @IsString() sessionId?: string;
  @ApiProperty() @IsBoolean() consentGiven: boolean;
  @ApiPropertyOptional() @IsOptional() @IsObject() categories?: Record<string, boolean>;
}

@ApiTags('Cookie Consent')
@Controller('cookie-consent')
export class CookieConsentController {
  constructor(private readonly service: CookieConsentService) {}

  // Public endpoint - no auth
  @Post('record')
  @ApiOperation({ summary: 'Registrar consentimento de cookies (público)' })
  record(@Body() dto: RecordConsentDto, @Ip() ip: string) {
    return this.service.resolveAndRecord(dto.tenantSlug, {
      sessionId: dto.sessionId,
      ipAddress: ip,
      consentGiven: dto.consentGiven,
      categories: dto.categories,
    });
  }

  // Authenticated endpoints
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar registros de consentimento' })
  findAll(
    @TenantId() tenantId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.service.findAll(tenantId, page, limit);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Estatísticas de consentimento de cookies' })
  getStats(@TenantId() tenantId: string) {
    return this.service.getStats(tenantId);
  }
}
