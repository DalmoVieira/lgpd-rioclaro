import { Module } from '@nestjs/common';
import { TenantSettingsService } from './tenant-settings.service';
import { TenantSettingsController } from './tenant-settings.controller';
import { AuditModule } from '../audit-logs/audit.module';

@Module({
  imports: [AuditModule],
  providers: [TenantSettingsService],
  controllers: [TenantSettingsController],
  exports: [TenantSettingsService],
})
export class TenantSettingsModule {}
