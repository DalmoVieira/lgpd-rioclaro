import { Module } from '@nestjs/common';
import { DataInventoryService } from './data-inventory.service';
import { DataInventoryController } from './data-inventory.controller';
import { AuditModule } from '../audit-logs/audit.module';

@Module({
  imports: [AuditModule],
  providers: [DataInventoryService],
  controllers: [DataInventoryController],
  exports: [DataInventoryService],
})
export class DataInventoryModule {}
