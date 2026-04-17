# Sistema de Governança e Gestão de Privacidade — LGPD

Sistema multi-tenant para gestão de privacidade e conformidade LGPD em municípios brasileiros.

## Arquitetura

```
├── backend/          NestJS + Prisma + PostgreSQL
├── frontend/         React + Vite + Tailwind CSS
└── docker-compose.yml
```

## Funcionalidades

- **Multi-tenant** — isolamento lógico por `tenantId`, resolução por slug/header/subdomínio
- **RBAC** — 8 perfis: Super Admin, DPO, Admin, Comitê de Privacidade, Gestor Setorial, Operador, ETIR, Auditor
- **Portal do Titular** — acesso público para exercício de direitos (acesso, correção, exclusão, portabilidade)
- **Solicitações de Titulares** — protocolo automático, prazos legais, workflow configurável
- **Inventário de Dados (ROPA)** — atividades de tratamento com base legal LGPD
- **Avaliação de Riscos** — classificação por nível, geração automática de RIPD quando alto/crítico
- **Incidentes de Segurança** — gestão com prazo de 3 dias úteis para ANPD
- **Planos de Ação** — acompanhamento com evidências
- **Workflow Engine** — motor configurável com SLA, transições e roles por etapa
- **Documentos** — templates Handlebars com geração dinâmica
- **Políticas de Privacidade** — versionamento com publicação
- **Consentimento de Cookies** — registro e estatísticas
- **Trilha de Auditoria** — log completo de ações
- **Dashboard** — visão consolidada com indicadores

## Requisitos

- Node.js 20+
- PostgreSQL 16+

## Setup Local

### 1. Banco de Dados

```bash
# Via Homebrew (macOS)
brew services start postgresql@16
createuser -s lgpd
createdb -O lgpd lgpd_db
psql -d lgpd_db -c "ALTER USER lgpd PASSWORD 'lgpd_secret';"
```

### 2. Backend

```bash
cd backend
cp ../.env.example .env    # ou use o .env da raiz
npm install
npx prisma migrate dev
npx prisma db seed
npm run start:dev
```

API disponível em `http://localhost:3000/api`
Swagger em `http://localhost:3000/api/docs`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Aplicação em `http://localhost:5173`

## Deploy com Docker

```bash
docker compose up -d --build
```

- Frontend: `http://localhost:8080`
- Backend API: `http://localhost:3000/api`
- PostgreSQL: `localhost:5432`

## Credenciais Padrão (Seed)

| Tenant        | E-mail                      | Senha      | Perfil      |
|---------------|------------------------------|------------|-------------|
| rio-claro-rj  | admin@rioclaro.rj.gov.br     | Admin@123  | SUPER_ADMIN |
| rio-claro-rj  | dpo@rioclaro.rj.gov.br       | Admin@123  | DPO         |
| rio-claro-rj  | gestor@rioclaro.rj.gov.br    | Admin@123  | ADMIN       |
| demo          | admin@demo.lgpd.gov.br       | Admin@123  | SUPER_ADMIN |

## API Endpoints Principais

| Recurso                | Método | Rota                                    |
|------------------------|--------|-----------------------------------------|
| Login                  | POST   | `/api/auth/login`                       |
| Usuário logado         | GET    | `/api/auth/me`                          |
| Dashboard              | GET    | `/api/dashboard`                        |
| Solicitações           | GET    | `/api/data-subject-requests`            |
| Nova solicitação (pub) | POST   | `/api/data-subject-requests/public`     |
| Inventário de dados    | GET    | `/api/data-inventory`                   |
| Riscos                 | GET    | `/api/risk-assessments`                 |
| Incidentes             | GET    | `/api/incidents`                        |
| Planos de ação         | GET    | `/api/action-plans`                     |
| Usuários               | GET    | `/api/users`                            |
| Departamentos          | GET    | `/api/departments`                      |
| Workflow definitions   | GET    | `/api/workflows/definitions`            |
| Templates              | GET    | `/api/documents/templates`              |
| Políticas              | GET    | `/api/privacy-policies`                 |
| Cookie consent (pub)   | POST   | `/api/cookie-consent/record`            |
| Auditoria              | GET    | `/api/audit-logs`                       |
| Configurações          | GET    | `/api/system-settings`                  |
| Tenant settings        | GET    | `/api/tenant-settings`                  |
| Anexos                 | POST   | `/api/attachments`                      |

## Tecnologias

**Backend:** Node.js, TypeScript, NestJS 11, Prisma 7, PostgreSQL 16, JWT, Passport, bcrypt, Handlebars, class-validator, Swagger/OpenAPI

**Frontend:** React 19, TypeScript, Vite, Tailwind CSS 4, React Router 7, TanStack Query, Axios, Lucide Icons

## Licença

Uso restrito — Prefeitura Municipal de Rio Claro/RJ.
