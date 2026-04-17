import { Module } from '@nestjs/common';
import { ActionPlansService } from './action-plans.service';
import { ActionPlansController } from './action-plans.controller';
import { AuditModule } from '../audit-logs/audit.module';
import { WorkflowModule } from '../workflows/workflow.module';

@Module({
  imports: [AuditModule, WorkflowModule],
  providers: [ActionPlansService],
  controllers: [ActionPlansController],
  exports: [ActionPlansService],
})
export class ActionPlansModule {}
