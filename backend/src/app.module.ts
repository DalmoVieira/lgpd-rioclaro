import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { TenantsModule } from './tenants/tenants.module';
import { AuthModule } from './auth/auth.module';
import { AuditModule } from './audit-logs/audit.module';
import { WorkflowModule } from './workflows/workflow.module';
import { UsersModule } from './users/users.module';
import { TenantSettingsModule } from './tenant-settings/tenant-settings.module';
import { DepartmentsModule } from './departments/departments.module';
import { DataSubjectRequestsModule } from './data-subject-requests/data-subject-requests.module';
import { DataInventoryModule } from './data-inventory/data-inventory.module';
import { RiskAssessmentsModule } from './risk-assessments/risk-assessments.module';
import { IncidentsModule } from './incidents/incidents.module';
import { ActionPlansModule } from './action-plans/action-plans.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AttachmentsModule } from './attachments/attachments.module';
import { DocumentsModule } from './documents/documents.module';
import { PrivacyPoliciesModule } from './privacy-policies/privacy-policies.module';
import { CookieConsentModule } from './cookie-consent/cookie-consent.module';
import { SystemSettingsModule } from './system-settings/system-settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    TenantsModule,
    AuthModule,
    AuditModule,
    WorkflowModule,
    UsersModule,
    TenantSettingsModule,
    DepartmentsModule,
    DataSubjectRequestsModule,
    DataInventoryModule,
    RiskAssessmentsModule,
    IncidentsModule,
    ActionPlansModule,
    DashboardModule,
    AttachmentsModule,
    DocumentsModule,
    PrivacyPoliciesModule,
    CookieConsentModule,
    SystemSettingsModule,
  ],
})
export class AppModule {}
