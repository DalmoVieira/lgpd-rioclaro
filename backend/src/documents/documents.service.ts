import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit-logs/audit.service';
import { DocumentType } from '@prisma/client';
import * as Handlebars from 'handlebars';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  // ==================== TEMPLATES ====================

  async createTemplate(
    tenantId: string,
    data: { name: string; type: DocumentType; content: string },
    userId?: string,
  ) {
    const template = await this.prisma.documentTemplate.create({
      data: { tenantId, ...data },
    });
    await this.auditService.log({ tenantId, userId, action: 'CREATE', entity: 'DocumentTemplate', entityId: template.id });
    return template;
  }

  async findTemplates(tenantId: string, type?: DocumentType) {
    return this.prisma.documentTemplate.findMany({
      where: { tenantId, isActive: true, ...(type ? { type } : {}) },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findTemplateById(id: string, tenantId: string) {
    const tpl = await this.prisma.documentTemplate.findFirst({ where: { id, tenantId } });
    if (!tpl) throw new NotFoundException('Template não encontrado');
    return tpl;
  }

  async updateTemplate(
    id: string,
    tenantId: string,
    data: { name?: string; content?: string; isActive?: boolean },
    userId?: string,
  ) {
    await this.findTemplateById(id, tenantId);
    const tpl = await this.prisma.documentTemplate.update({ where: { id }, data });
    await this.auditService.log({ tenantId, userId, action: 'UPDATE', entity: 'DocumentTemplate', entityId: id, diff: data });
    return tpl;
  }

  // ==================== GENERATED DOCUMENTS ====================

  async generate(
    tenantId: string,
    data: {
      templateId?: string;
      type: DocumentType;
      title: string;
      variables?: Record<string, any>;
      entityType?: string;
      entityId?: string;
    },
    userId?: string,
  ) {
    let renderedContent: string | undefined;

    if (data.templateId) {
      const template = await this.findTemplateById(data.templateId, tenantId);
      const compiled = Handlebars.compile(template.content);
      renderedContent = compiled(data.variables ?? {});
    }

    const doc = await this.prisma.generatedDocument.create({
      data: {
        tenantId,
        templateId: data.templateId,
        type: data.type,
        title: data.title,
        metadata: { variables: data.variables ?? {}, renderedContent },
        entityType: data.entityType,
        entityId: data.entityId,
        generatedByUserId: userId,
      },
    });

    await this.auditService.log({ tenantId, userId, action: 'GENERATE_DOCUMENT', entity: 'GeneratedDocument', entityId: doc.id });
    return { ...doc, renderedContent };
  }

  async findDocuments(tenantId: string, entityType?: string, entityId?: string) {
    return this.prisma.generatedDocument.findMany({
      where: {
        tenantId,
        ...(entityType ? { entityType } : {}),
        ...(entityId ? { entityId } : {}),
      },
      include: { template: { select: { name: true } }, generatedByUser: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findDocumentById(id: string, tenantId: string) {
    const doc = await this.prisma.generatedDocument.findFirst({
      where: { id, tenantId },
      include: { template: true, generatedByUser: { select: { name: true, email: true } } },
    });
    if (!doc) throw new NotFoundException('Documento não encontrado');
    return doc;
  }

  async renderPreview(templateId: string, tenantId: string, variables: Record<string, any>) {
    const template = await this.findTemplateById(templateId, tenantId);
    const compiled = Handlebars.compile(template.content);
    return { html: compiled(variables) };
  }
}
