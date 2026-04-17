import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit-logs/audit.service';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class AttachmentsService {
  private readonly uploadDir = path.resolve(process.cwd(), 'uploads');

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async upload(
    tenantId: string,
    file: { originalname: string; mimetype: string; buffer: Buffer; size: number },
    opts: { entityType?: string; entityId?: string; userId?: string },
  ) {
    const tenantDir = path.join(this.uploadDir, tenantId);
    if (!fs.existsSync(tenantDir)) {
      fs.mkdirSync(tenantDir, { recursive: true });
    }

    const ext = path.extname(file.originalname);
    const storedName = `${randomUUID()}${ext}`;
    const filePath = path.join(tenantDir, storedName);

    fs.writeFileSync(filePath, file.buffer);

    const attachment = await this.prisma.attachment.create({
      data: {
        tenantId,
        fileName: file.originalname,
        filePath: `uploads/${tenantId}/${storedName}`,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        uploadedByUserId: opts.userId,
        entityType: opts.entityType,
        entityId: opts.entityId,
      },
    });

    await this.auditService.log({
      tenantId,
      userId: opts.userId,
      action: 'CREATE',
      entity: 'Attachment',
      entityId: attachment.id,
    });

    return attachment;
  }

  async findByEntity(tenantId: string, entityType: string, entityId: string) {
    return this.prisma.attachment.findMany({
      where: { tenantId, entityType, entityId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, tenantId: string) {
    const attachment = await this.prisma.attachment.findFirst({ where: { id, tenantId } });
    if (!attachment) throw new NotFoundException('Anexo não encontrado');
    return attachment;
  }

  async delete(id: string, tenantId: string, userId?: string) {
    const attachment = await this.findById(id, tenantId);
    const fullPath = path.resolve(process.cwd(), attachment.filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
    await this.prisma.attachment.delete({ where: { id } });
    await this.auditService.log({
      tenantId,
      userId,
      action: 'DELETE',
      entity: 'Attachment',
      entityId: id,
    });
  }

  getFilePath(attachment: { filePath: string }) {
    return path.resolve(process.cwd(), attachment.filePath);
  }
}
