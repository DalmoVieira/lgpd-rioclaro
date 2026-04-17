import { Module } from '@nestjs/common';
import { RiskAssessmentsService } from './risk-assessments.service';
import { RiskAssessmentsController } from './risk-assessments.controller';
import { AuditModule } from '../audit-logs/audit.module';

@Module({
  imports: [AuditModule],
  providers: [RiskAssessmentsService],
  controllers: [RiskAssessmentsController],
  exports: [RiskAssessmentsService],
})
export class RiskAssessmentsModule {}
