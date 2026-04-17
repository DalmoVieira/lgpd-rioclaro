import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { TenantId } from '../tenants/tenant.decorator';
import { IsString, IsOptional, IsEnum, IsObject, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentType } from '@prisma/client';

class CreateTemplateDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty({ enum: DocumentType }) @IsEnum(DocumentType) type: DocumentType;
  @ApiProperty() @IsString() content: string;
}

class UpdateTemplateDto {
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() content?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
}

class GenerateDocumentDto {
  @ApiPropertyOptional() @IsOptional() @IsString() templateId?: string;
  @ApiProperty({ enum: DocumentType }) @IsEnum(DocumentType) type: DocumentType;
  @ApiProperty() @IsString() title: string;
  @ApiPropertyOptional() @IsOptional() @IsObject() variables?: Record<string, any>;
  @ApiPropertyOptional() @IsOptional() @IsString() entityType?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() entityId?: string;
}

class PreviewDto {
  @ApiProperty() @IsObject() variables: Record<string, any>;
}

@ApiTags('Documents')
@Controller('documents')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DocumentsController {
  constructor(private readonly service: DocumentsService) {}

  // Templates
  @Post('templates')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'DPO')
  @ApiOperation({ summary: 'Criar template de documento' })
  createTemplate(@TenantId() tenantId: string, @Body() dto: CreateTemplateDto, @Req() req: Request) {
    return this.service.createTemplate(tenantId, dto, (req as any).user?.id);
  }

  @Get('templates')
  @ApiOperation({ summary: 'Listar templates' })
  findTemplates(@TenantId() tenantId: string, @Query('type') type?: DocumentType) {
    return this.service.findTemplates(tenantId, type);
  }

  @Get('templates/:id')
  @ApiOperation({ summary: 'Obter template por ID' })
  findTemplateById(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.service.findTemplateById(id, tenantId);
  }

  @Patch('templates/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'DPO')
  @ApiOperation({ summary: 'Atualizar template' })
  updateTemplate(@Param('id') id: string, @TenantId() tenantId: string, @Body() dto: UpdateTemplateDto, @Req() req: Request) {
    return this.service.updateTemplate(id, tenantId, dto, (req as any).user?.id);
  }

  @Post('templates/:id/preview')
  @ApiOperation({ summary: 'Pré-visualizar template renderizado' })
  preview(@Param('id') id: string, @TenantId() tenantId: string, @Body() dto: PreviewDto) {
    return this.service.renderPreview(id, tenantId, dto.variables);
  }

  // Generated Documents
  @Post('generate')
  @ApiOperation({ summary: 'Gerar documento a partir de template' })
  generate(@TenantId() tenantId: string, @Body() dto: GenerateDocumentDto, @Req() req: Request) {
    return this.service.generate(tenantId, dto, (req as any).user?.id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar documentos gerados' })
  findDocuments(
    @TenantId() tenantId: string,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
  ) {
    return this.service.findDocuments(tenantId, entityType, entityId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter documento gerado por ID' })
  findDocumentById(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.service.findDocumentById(id, tenantId);
  }
}
