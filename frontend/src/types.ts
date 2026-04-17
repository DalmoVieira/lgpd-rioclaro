export interface User {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  role: Role;
  departmentId?: string;
  isActive: boolean;
  createdAt: string;
}

export type Role =
  | 'SUPER_ADMIN'
  | 'DPO'
  | 'ADMIN'
  | 'COMITE_PRIVACIDADE'
  | 'GESTOR_SETORIAL'
  | 'OPERADOR'
  | 'ETIR'
  | 'AUDITOR';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  isActive: boolean;
}

export interface TenantSettings {
  id: string;
  tenantId: string;
  primaryColor: string;
  logoUrl?: string;
  municipalityName: string;
  state: string;
  dpoName: string;
  dpoEmail: string;
  dpoPhone?: string;
  privacyPortalTitle?: string;
  privacyPortalDescription?: string;
}

export interface Department {
  id: string;
  tenantId: string;
  name: string;
  acronym?: string;
  isActive: boolean;
}

export interface DataSubjectRequest {
  id: string;
  tenantId: string;
  protocol: string;
  type: string;
  status: string;
  requesterName: string;
  requesterEmail: string;
  requesterCpf: string;
  description: string;
  deadline: string;
  createdAt: string;
}

export interface DataProcessingActivity {
  id: string;
  tenantId: string;
  name: string;
  purpose: string;
  legalBasis: string;
  dataTypes: string[];
  isActive: boolean;
  createdAt: string;
}

export interface RiskAssessment {
  id: string;
  tenantId: string;
  title: string;
  riskLevel: string;
  status: string;
  createdAt: string;
}

export interface SecurityIncident {
  id: string;
  tenantId: string;
  title: string;
  severity: string;
  status: string;
  anpdDeadline?: string;
  createdAt: string;
}

export interface ActionPlan {
  id: string;
  tenantId: string;
  title: string;
  priority: string;
  status: string;
  dueDate?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  tenantId?: string;
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  createdAt: string;
  user?: { name: string };
}

export interface DashboardData {
  requests: { total: number; open: number };
  incidents: { total: number; open: number; overdue: number };
  risks: { total: number; highCritical: number };
  actionPlans: { total: number; open: number };
  activities: { total: number };
  ripd: { pending: number };
  charts: {
    requestsByType: Array<{ type: string; _count: number }>;
    risksByLevel: Array<{ riskLevel: string; _count: number }>;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface LoginPayload {
  email: string;
  password: string;
  tenantSlug: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}
