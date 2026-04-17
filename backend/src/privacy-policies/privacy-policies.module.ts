import { Module } from '@nestjs/common';
import { PrivacyPoliciesService } from './privacy-policies.service';
import { PrivacyPoliciesController } from './privacy-policies.controller';
import { AuditModule } from '../audit-logs/audit.module';

@Module({
  imports: [AuditModule],
  providers: [PrivacyPoliciesService],
  controllers: [PrivacyPoliciesController],
  exports: [PrivacyPoliciesService],
})
export class PrivacyPoliciesModule {}
