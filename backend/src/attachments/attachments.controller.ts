import {
  Controller, Get, Post, Delete, Param, Query, Req, Res,
  UseGuards, UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AttachmentsService } from './attachments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantId } from '../tenants/tenant.decorator';

@ApiTags('Attachments')
@Controller('attachments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AttachmentsController {
  constructor(private readonly service: AttachmentsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        entityType: { type: 'string' },
        entityId: { type: 'string' },
      },
    },
  })
  @ApiOperation({ summary: 'Fazer upload de anexo' })
  async upload(
    @TenantId() tenantId: string,
    @UploadedFile() file: Express.Multer.File,
    @Query('entityType') entityType: string,
    @Query('entityId') entityId: string,
    @Req() req: Request,
  ) {
    return this.service.upload(tenantId, file, {
      entityType,
      entityId,
      userId: (req as any).user?.id,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Listar anexos por entidade' })
  findByEntity(
    @TenantId() tenantId: string,
    @Query('entityType') entityType: string,
    @Query('entityId') entityId: string,
  ) {
    return this.service.findByEntity(tenantId, entityType, entityId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter metadados do anexo' })
  findById(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.service.findById(id, tenantId);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download do anexo' })
  async download(@Param('id') id: string, @TenantId() tenantId: string, @Res() res: Response) {
    const attachment = await this.service.findById(id, tenantId);
    const filePath = this.service.getFilePath(attachment);
    res.download(filePath, attachment.fileName);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir anexo' })
  async delete(@Param('id') id: string, @TenantId() tenantId: string, @Req() req: Request) {
    await this.service.delete(id, tenantId, (req as any).user?.id);
    return { message: 'Anexo excluído' };
  }
}
