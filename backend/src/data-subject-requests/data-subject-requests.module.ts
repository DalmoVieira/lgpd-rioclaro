import { Module } from '@nestjs/common';
import { DataSubjectRequestsService } from './data-subject-requests.service';
import { DataSubjectRequestsController } from './data-subject-requests.controller';
import { AuditModule } from '../audit-logs/audit.module';
import { WorkflowModule } from '../workflows/workflow.module';

@Module({
  imports: [AuditModule, WorkflowModule],
  providers: [DataSubjectRequestsService],
  controllers: [DataSubjectRequestsController],
  exports: [DataSubjectRequestsService],
})
export class DataSubjectRequestsModule {}
