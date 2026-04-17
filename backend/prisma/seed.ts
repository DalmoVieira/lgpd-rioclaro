import { PrismaClient, Role, WorkflowProcessType, DataType, LegalBasis, Severity, Priority, RiskLevel } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // ==================== TENANT 1: Rio Claro ====================
  const tenant1 = await prisma.tenant.create({
    data: {
      name: 'Prefeitura de Rio Claro - RJ',
      slug: 'rio-claro-rj',
      domain: 'rioclaro.rj.gov.br',
      isActive: true,
    },
  });

  await prisma.tenantSettings.create({
    data: {
      tenantId: tenant1.id,
      officialName: 'Prefeitura Municipal de Rio Claro',
      shortName: 'PM Rio Claro',
      municipality: 'Rio Claro',
      city: 'Rio Claro',
      state: 'RJ',
      address: 'Rua Principal, 100, Centro, Rio Claro - RJ',
      cnpj: '00.000.000/0001-00',
      email: 'lgpd@rioclaro.rj.gov.br',
      dpoName: 'Maria Silva',
      dpoEmail: 'dpo@rioclaro.rj.gov.br',
      primaryColor: '#1e40af',
      secondaryColor: '#1e3a5f',
      accentColor: '#f59e0b',
    },
  });

  // ==================== TENANT 2: Demo ====================
  const tenant2 = await prisma.tenant.create({
    data: {
      name: 'Prefeitura Demo',
      slug: 'demo',
      domain: null,
      isActive: true,
    },
  });

  await prisma.tenantSettings.create({
    data: {
      tenantId: tenant2.id,
      officialName: 'Prefeitura Municipal Demo',
      municipality: 'Demo City',
      city: 'Demo City',
      state: 'SP',
      dpoName: 'João Demo',
      dpoEmail: 'dpo@demo.gov.br',
    },
  });

  // ==================== SUPER ADMIN (global) ====================
  const passwordHash = await bcrypt.hash('Admin@123', 10);

  const superAdmin = await prisma.user.create({
    data: {
      tenantId: tenant1.id,
      email: 'superadmin@lgpd.gov.br',
      passwordHash,
      name: 'Super Administrador',
      role: Role.SUPER_ADMIN,
    },
  });

  // ==================== DEPARTMENTS (Tenant 1) ====================
  const depTI = await prisma.department.create({
    data: { tenantId: tenant1.id, name: 'Tecnologia da Informação', acronym: 'TI' },
  });

  const depSaude = await prisma.department.create({
    data: { tenantId: tenant1.id, name: 'Saúde', acronym: 'SMS' },
  });

  const depEducacao = await prisma.department.create({
    data: { tenantId: tenant1.id, name: 'Educação', acronym: 'SME' },
  });

  const depAdmin = await prisma.department.create({
    data: { tenantId: tenant1.id, name: 'Administração', acronym: 'SMA' },
  });

  // ==================== USERS (Tenant 1) ====================
  const dpo = await prisma.user.create({
    data: {
      tenantId: tenant1.id, email: 'dpo@rioclaro.rj.gov.br',
      passwordHash, name: 'Maria Silva (DPO)', role: Role.DPO,
    },
  });

  const admin = await prisma.user.create({
    data: {
      tenantId: tenant1.id, email: 'admin@rioclaro.rj.gov.br',
      passwordHash, name: 'Carlos Admin', role: Role.ADMIN,
    },
  });

  const comite = await prisma.user.create({
    data: {
      tenantId: tenant1.id, email: 'comite@rioclaro.rj.gov.br',
      passwordHash, name: 'Ana Comitê', role: Role.COMITE_PRIVACIDADE,
    },
  });

  const gestor = await prisma.user.create({
    data: {
      tenantId: tenant1.id, email: 'gestor@rioclaro.rj.gov.br',
      passwordHash, name: 'Pedro Gestor', role: Role.GESTOR_SETORIAL,
      departmentId: depSaude.id,
    },
  });

  const operador = await prisma.user.create({
    data: {
      tenantId: tenant1.id, email: 'operador@rioclaro.rj.gov.br',
      passwordHash, name: 'Julia Operadora', role: Role.OPERADOR,
      departmentId: depTI.id,
    },
  });

  const etir = await prisma.user.create({
    data: {
      tenantId: tenant1.id, email: 'etir@rioclaro.rj.gov.br',
      passwordHash, name: 'Lucas ETIR', role: Role.ETIR,
      departmentId: depTI.id,
    },
  });

  // ==================== USERS (Tenant 2) ====================
  await prisma.user.create({
    data: {
      tenantId: tenant2.id, email: 'admin@demo.gov.br',
      passwordHash, name: 'Admin Demo', role: Role.ADMIN,
    },
  });

  await prisma.user.create({
    data: {
      tenantId: tenant2.id, email: 'dpo@demo.gov.br',
      passwordHash, name: 'DPO Demo', role: Role.DPO,
    },
  });

  // ==================== WORKFLOW: Data Subject Request ====================
  const wfDSR = await prisma.workflowDefinition.create({
    data: {
      tenantId: tenant1.id,
      processType: WorkflowProcessType.DATA_SUBJECT_REQUEST,
      name: 'Fluxo Padrão - Solicitações de Titulares',
      key: 'dsr-default',
      version: 1,
      isActive: true,
      isDefault: true,
    },
  });

  const dsrSteps = await Promise.all([
    prisma.workflowStep.create({ data: { workflowDefinitionId: wfDSR.id, key: 'aberto', label: 'Aberto', color: '#3b82f6', order: 0, isInitial: true } }),
    prisma.workflowStep.create({ data: { workflowDefinitionId: wfDSR.id, key: 'em_analise', label: 'Em Análise', color: '#f59e0b', order: 1 } }),
    prisma.workflowStep.create({ data: { workflowDefinitionId: wfDSR.id, key: 'parecer_dpo', label: 'Parecer do DPO', color: '#8b5cf6', order: 2, requiresComment: true } }),
    prisma.workflowStep.create({ data: { workflowDefinitionId: wfDSR.id, key: 'respondido', label: 'Respondido', color: '#10b981', order: 3, requiresComment: true } }),
    prisma.workflowStep.create({ data: { workflowDefinitionId: wfDSR.id, key: 'encerrado', label: 'Encerrado', color: '#6b7280', order: 4, isFinal: true } }),
  ]);

  // Transitions: aberto→em_analise, em_analise→parecer_dpo, parecer_dpo→respondido, respondido→encerrado
  await prisma.workflowTransition.createMany({
    data: [
      { workflowDefinitionId: wfDSR.id, fromStepId: dsrSteps[0].id, toStepId: dsrSteps[1].id, allowedRoles: [Role.DPO, Role.ADMIN, Role.COMITE_PRIVACIDADE] },
      { workflowDefinitionId: wfDSR.id, fromStepId: dsrSteps[1].id, toStepId: dsrSteps[2].id, allowedRoles: [Role.DPO, Role.COMITE_PRIVACIDADE] },
      { workflowDefinitionId: wfDSR.id, fromStepId: dsrSteps[2].id, toStepId: dsrSteps[3].id, allowedRoles: [Role.DPO] },
      { workflowDefinitionId: wfDSR.id, fromStepId: dsrSteps[3].id, toStepId: dsrSteps[4].id, allowedRoles: [Role.DPO, Role.ADMIN] },
      // devolver para análise
      { workflowDefinitionId: wfDSR.id, fromStepId: dsrSteps[2].id, toStepId: dsrSteps[1].id, allowedRoles: [Role.DPO, Role.COMITE_PRIVACIDADE] },
    ],
  });

  // ==================== WORKFLOW: Security Incident ====================
  const wfIncident = await prisma.workflowDefinition.create({
    data: {
      tenantId: tenant1.id,
      processType: WorkflowProcessType.SECURITY_INCIDENT,
      name: 'Fluxo Padrão - Incidentes de Segurança',
      key: 'incident-default',
      version: 1,
      isActive: true,
      isDefault: true,
    },
  });

  const incSteps = await Promise.all([
    prisma.workflowStep.create({ data: { workflowDefinitionId: wfIncident.id, key: 'registrado', label: 'Registrado', color: '#ef4444', order: 0, isInitial: true } }),
    prisma.workflowStep.create({ data: { workflowDefinitionId: wfIncident.id, key: 'em_investigacao', label: 'Em Investigação', color: '#f59e0b', order: 1 } }),
    prisma.workflowStep.create({ data: { workflowDefinitionId: wfIncident.id, key: 'avaliacao_impacto', label: 'Avaliação de Impacto', color: '#8b5cf6', order: 2, requiresComment: true } }),
    prisma.workflowStep.create({ data: { workflowDefinitionId: wfIncident.id, key: 'notificacao', label: 'Notificação ANPD', color: '#3b82f6', order: 3, slaHours: 72 } }),
    prisma.workflowStep.create({ data: { workflowDefinitionId: wfIncident.id, key: 'encerrado', label: 'Encerrado', color: '#6b7280', order: 4, isFinal: true, requiresComment: true } }),
  ]);

  await prisma.workflowTransition.createMany({
    data: [
      { workflowDefinitionId: wfIncident.id, fromStepId: incSteps[0].id, toStepId: incSteps[1].id, allowedRoles: [Role.ETIR, Role.DPO, Role.ADMIN] },
      { workflowDefinitionId: wfIncident.id, fromStepId: incSteps[1].id, toStepId: incSteps[2].id, allowedRoles: [Role.ETIR, Role.DPO] },
      { workflowDefinitionId: wfIncident.id, fromStepId: incSteps[2].id, toStepId: incSteps[3].id, allowedRoles: [Role.DPO] },
      { workflowDefinitionId: wfIncident.id, fromStepId: incSteps[3].id, toStepId: incSteps[4].id, allowedRoles: [Role.DPO, Role.ADMIN] },
    ],
  });

  // ==================== WORKFLOW: Action Plan ====================
  const wfActionPlan = await prisma.workflowDefinition.create({
    data: {
      tenantId: tenant1.id,
      processType: WorkflowProcessType.ACTION_PLAN,
      name: 'Fluxo Padrão - Planos de Ação',
      key: 'action-plan-default',
      version: 1,
      isActive: true,
      isDefault: true,
    },
  });

  const apSteps = await Promise.all([
    prisma.workflowStep.create({ data: { workflowDefinitionId: wfActionPlan.id, key: 'aberto', label: 'Aberto', color: '#3b82f6', order: 0, isInitial: true } }),
    prisma.workflowStep.create({ data: { workflowDefinitionId: wfActionPlan.id, key: 'em_execucao', label: 'Em Execução', color: '#f59e0b', order: 1 } }),
    prisma.workflowStep.create({ data: { workflowDefinitionId: wfActionPlan.id, key: 'em_verificacao', label: 'Em Verificação', color: '#8b5cf6', order: 2, requiresAttachment: true } }),
    prisma.workflowStep.create({ data: { workflowDefinitionId: wfActionPlan.id, key: 'concluido', label: 'Concluído', color: '#10b981', order: 3, isFinal: true } }),
  ]);

  await prisma.workflowTransition.createMany({
    data: [
      { workflowDefinitionId: wfActionPlan.id, fromStepId: apSteps[0].id, toStepId: apSteps[1].id, allowedRoles: [Role.DPO, Role.GESTOR_SETORIAL, Role.ADMIN] },
      { workflowDefinitionId: wfActionPlan.id, fromStepId: apSteps[1].id, toStepId: apSteps[2].id, allowedRoles: [Role.GESTOR_SETORIAL, Role.OPERADOR] },
      { workflowDefinitionId: wfActionPlan.id, fromStepId: apSteps[2].id, toStepId: apSteps[3].id, allowedRoles: [Role.DPO, Role.COMITE_PRIVACIDADE] },
      // devolver para execução
      { workflowDefinitionId: wfActionPlan.id, fromStepId: apSteps[2].id, toStepId: apSteps[1].id, allowedRoles: [Role.DPO, Role.COMITE_PRIVACIDADE] },
    ],
  });

  // ==================== WORKFLOW: Risk Assessment ====================
  const wfRisk = await prisma.workflowDefinition.create({
    data: {
      tenantId: tenant1.id,
      processType: WorkflowProcessType.RISK_ASSESSMENT,
      name: 'Fluxo Padrão - Avaliação de Riscos',
      key: 'risk-default',
      version: 1,
      isActive: true,
      isDefault: true,
    },
  });

  const riskSteps = await Promise.all([
    prisma.workflowStep.create({ data: { workflowDefinitionId: wfRisk.id, key: 'identificado', label: 'Identificado', color: '#ef4444', order: 0, isInitial: true } }),
    prisma.workflowStep.create({ data: { workflowDefinitionId: wfRisk.id, key: 'em_avaliacao', label: 'Em Avaliação', color: '#f59e0b', order: 1 } }),
    prisma.workflowStep.create({ data: { workflowDefinitionId: wfRisk.id, key: 'mitigado', label: 'Mitigado', color: '#10b981', order: 2, requiresComment: true } }),
    prisma.workflowStep.create({ data: { workflowDefinitionId: wfRisk.id, key: 'aceito', label: 'Aceito', color: '#6b7280', order: 3, isFinal: true } }),
  ]);

  await prisma.workflowTransition.createMany({
    data: [
      { workflowDefinitionId: wfRisk.id, fromStepId: riskSteps[0].id, toStepId: riskSteps[1].id, allowedRoles: [Role.DPO, Role.COMITE_PRIVACIDADE] },
      { workflowDefinitionId: wfRisk.id, fromStepId: riskSteps[1].id, toStepId: riskSteps[2].id, allowedRoles: [Role.DPO, Role.COMITE_PRIVACIDADE] },
      { workflowDefinitionId: wfRisk.id, fromStepId: riskSteps[2].id, toStepId: riskSteps[3].id, allowedRoles: [Role.DPO] },
    ],
  });

  // ==================== SAMPLE DATA (Tenant 1) ====================

  // Data Processing Activities
  await prisma.dataProcessingActivity.create({
    data: {
      tenantId: tenant1.id,
      name: 'Cadastro de Pacientes - SUS',
      departmentId: depSaude.id,
      purpose: 'Cadastro e atendimento de pacientes no sistema de saúde',
      dataSubjectCategory: 'Pacientes do SUS',
      dataCategory: 'Dados de saúde, CPF, endereço, contato',
      dataType: DataType.SENSIVEL,
      source: 'Unidades Básicas de Saúde',
      storage: 'Servidor local criptografado',
      legalBasis: LegalBasis.TUTELA_DA_SAUDE,
      consentStatus: 'NAO_EXIGIDO_PELA_LEI',
      securityMeasures: 'Criptografia AES-256, controle de acesso RBAC, backup diário',
      createdByUserId: dpo.id,
    },
  });

  await prisma.dataProcessingActivity.create({
    data: {
      tenantId: tenant1.id,
      name: 'Matrícula Escolar',
      departmentId: depEducacao.id,
      purpose: 'Gestão de matrículas e dados de alunos da rede municipal',
      dataSubjectCategory: 'Alunos e responsáveis',
      dataCategory: 'Nome, CPF, endereço, dados do responsável',
      dataType: DataType.PESSOAL,
      source: 'Formulário online e presencial',
      storage: 'Sistema SIGED na nuvem',
      legalBasis: LegalBasis.EXECUCAO_DE_POLITICAS_PUBLICAS,
      consentStatus: 'NAO_EXIGIDO_PELA_LEI',
      createdByUserId: dpo.id,
    },
  });

  await prisma.dataProcessingActivity.create({
    data: {
      tenantId: tenant1.id,
      name: 'Folha de Pagamento',
      departmentId: depAdmin.id,
      purpose: 'Processamento de folha de pagamento dos servidores',
      dataSubjectCategory: 'Servidores públicos',
      dataType: DataType.PESSOAL,
      source: 'Sistema RH',
      storage: 'Servidor on-premise',
      legalBasis: LegalBasis.OBRIGACAO_LEGAL,
      consentStatus: 'NAO_EXIGIDO_PELA_LEI',
      createdByUserId: admin.id,
    },
  });

  console.log('✅ Seed concluído!');
  console.log('');
  console.log('📋 Credenciais:');
  console.log('   Todos os usuários usam a senha: Admin@123');
  console.log('   Tenant slug: rio-claro-rj');
  console.log('');
  console.log('   Super Admin: superadmin@lgpd.gov.br');
  console.log('   DPO:         dpo@rioclaro.rj.gov.br');
  console.log('   Admin:       admin@rioclaro.rj.gov.br');
  console.log('   Comitê:      comite@rioclaro.rj.gov.br');
  console.log('   Gestor:      gestor@rioclaro.rj.gov.br');
  console.log('   Operador:    operador@rioclaro.rj.gov.br');
  console.log('   ETIR:        etir@rioclaro.rj.gov.br');
  console.log('');
  console.log('   Tenant Demo: admin@demo.gov.br / dpo@demo.gov.br');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
