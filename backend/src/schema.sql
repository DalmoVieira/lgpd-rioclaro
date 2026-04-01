-- ============================================================
-- LGPD Rio Claro — Schema do Banco de Dados
-- Banco: lgpd | Usuário: lgpd_user
-- ============================================================

-- ─── Extensões ───────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Tabela: ropa ────────────────────────────────────────────
-- Registro de Operações de Tratamento de Dados (Art. 37 LGPD)
CREATE TABLE IF NOT EXISTS ropa (
  id                        SERIAL PRIMARY KEY,

  -- Identificação
  nome_processo             TEXT        NOT NULL,
  secretaria                TEXT        NOT NULL,
  dpo_responsavel           TEXT        NOT NULL DEFAULT 'A definir',

  -- Classificação
  sistema                   TEXT        NOT NULL DEFAULT 'A definir',
  finalidade                TEXT        NOT NULL,
  descricao_fluxo           TEXT,

  -- Dados e Titulares
  categorias                TEXT[]      NOT NULL DEFAULT '{}',
  categorias_sensiveis      TEXT[]      NOT NULL DEFAULT '{}',
  titulares                 TEXT,

  -- Base Legal
  base_legal                TEXT        NOT NULL,
  hipotese_tratamento       TEXT,

  -- Armazenamento e Retenção
  armazenamento             TEXT        NOT NULL DEFAULT 'A definir',
  retencao                  TEXT        NOT NULL DEFAULT 'Indeterminado',

  -- Operadores e Compartilhamento
  operador                  TEXT,
  compartilhamento          TEXT        NOT NULL DEFAULT 'Nenhum',
  transferencia_internacional BOOLEAN   NOT NULL DEFAULT FALSE,
  pais_destino              TEXT,

  -- Segurança
  medidas_seguranca         TEXT        NOT NULL DEFAULT 'A definir',

  -- Metadados
  criado_em                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Tabela: dsr_requisicoes ─────────────────────────────────
-- Requisições de Direitos dos Titulares (Art. 18 LGPD)
CREATE TABLE IF NOT EXISTS dsr_requisicoes (
  id               TEXT        PRIMARY KEY,  -- Formato: RC-XXXXXX

  -- Dados do Titular
  nome             TEXT        NOT NULL,
  cpf              TEXT        NOT NULL,     -- Armazenado sem máscara
  email            TEXT        NOT NULL,

  -- Requisição
  tipo             TEXT        NOT NULL CHECK (tipo IN (
                     'Acesso', 'Correção', 'Eliminação',
                     'Portabilidade', 'Revogação', 'Oposição', 'Anonimização'
                   )),
  descricao        TEXT        NOT NULL DEFAULT '',
  status           TEXT        NOT NULL DEFAULT 'Pendente' CHECK (status IN (
                     'Pendente', 'Em Análise', 'Concluído', 'Indeferido'
                   )),

  -- Prazos
  data_criacao     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  prazo_legal      TIMESTAMPTZ NOT NULL,     -- data_criacao + 15 dias
  data_conclusao   TIMESTAMPTZ,

  -- DPO
  observacoes_dpo  TEXT
);

-- ─── Tabela: usuarios_internos ───────────────────────────────
-- Servidores autorizados a acessar o painel DPO
CREATE TABLE IF NOT EXISTS usuarios_internos (
  id               SERIAL      PRIMARY KEY,
  nome             TEXT        NOT NULL,
  email            TEXT        NOT NULL UNIQUE,
  senha_hash       TEXT        NOT NULL,
  perfil           TEXT        NOT NULL DEFAULT 'servidor' CHECK (perfil IN ('dpo', 'servidor', 'admin')),
  ativo            BOOLEAN     NOT NULL DEFAULT TRUE,
  recuperar_token  TEXT,
  recuperar_expira TIMESTAMPTZ,
  criado_em        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Usuário Administrador (Senha: admin@2026) ────────────────
-- Perfil admin para gerenciar outros usuários
INSERT INTO usuarios_internos (nome, email, senha_hash, perfil)
VALUES (
  'Administrador LGPD',
  'admin@rioclaro.rj.gov.br',
  crypt('admin@2026', gen_salt('bf')),
  'admin'
)
ON CONFLICT (email) DO NOTHING;

-- ─── Índices de Performance ───────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_dsr_status      ON dsr_requisicoes (status);
CREATE INDEX IF NOT EXISTS idx_dsr_cpf         ON dsr_requisicoes (cpf);
CREATE INDEX IF NOT EXISTS idx_dsr_data        ON dsr_requisicoes (data_criacao DESC);
CREATE INDEX IF NOT EXISTS idx_ropa_secretaria ON ropa (secretaria);

-- ─── Trigger: atualiza atualizado_em automaticamente ─────────
CREATE OR REPLACE FUNCTION set_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ropa_atualizado_em ON ropa;
CREATE TRIGGER trg_ropa_atualizado_em
  BEFORE UPDATE ON ropa
  FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();

-- ─── Usuário DPO padrão (senha: lgpd@2026) ───────────────────
-- IMPORTANTE: Trocar a senha em produção!
INSERT INTO usuarios_internos (nome, email, senha_hash, perfil)
VALUES (
  'Encarregado DPO',
  'dpo@rioclaro.rj.gov.br',
  crypt('lgpd@2026', gen_salt('bf')),
  'dpo'
)
ON CONFLICT (email) DO NOTHING;

-- Confirmação
SELECT 'Schema LGPD Rio Claro criado com sucesso!' AS resultado;
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
