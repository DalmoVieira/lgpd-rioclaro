import { Module } from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { IncidentsController } from './incidents.controller';
import { AuditModule } from '../audit-logs/audit.module';
import { WorkflowModule } from '../workflows/workflow.module';

@Module({
  imports: [AuditModule, WorkflowModule],
  providers: [IncidentsService],
  controllers: [IncidentsController],
  exports: [IncidentsService],
})
export class IncidentsModule {}
