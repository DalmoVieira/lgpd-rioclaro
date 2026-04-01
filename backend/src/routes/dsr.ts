import { Router } from 'express';
import db from '../db';

const router = Router();

// ─── POST /api/dsr ───────────────────────────────────────────
// Submeter nova requisição de titular
router.post('/', async (req, res) => {
  const { nome, cpf, email, tipo, descricao } = req.body;

  if (!nome || !cpf || !email || !tipo) {
    return res.status(400).json({
      error: 'Campos obrigatórios ausentes.',
      camposObrigatorios: ['nome', 'cpf', 'email', 'tipo'],
    });
  }

  const tiposValidos = ['Acesso', 'Correção', 'Eliminação', 'Portabilidade', 'Revogação', 'Oposição', 'Anonimização'];
  if (!tiposValidos.includes(tipo)) {
    return res.status(400).json({
      error: `Tipo inválido. Valores aceitos: ${tiposValidos.join(', ')}`,
    });
  }

  // Gera protocolo RC-XXXXXX e calcula prazo legal de 15 dias
  const protocolo   = `RC-${Date.now().toString().slice(-6)}`;
  const prazoLegal  = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
  const cpfLimpo    = cpf.replace(/\D/g, '');

  try {
    await db.query(
      `INSERT INTO dsr_requisicoes
         (id, nome, cpf, email, tipo, descricao, status, prazo_legal)
       VALUES ($1, $2, $3, $4, $5, $6, 'Pendente', $7)`,
      [protocolo, nome, cpfLimpo, email, tipo, descricao || '', prazoLegal]
    );

    console.log(`[DSR] Nova requisição criada: ${protocolo} | ${tipo} | ${email}`);

    return res.status(201).json({
      message: 'Requisição recebida com sucesso.',
      protocolo,
      prazoLegal: prazoLegal.toLocaleDateString('pt-BR'),
    });
  } catch (err: any) {
    console.error('[DSR] Erro ao salvar:', err.message);
    return res.status(500).json({ error: 'Erro interno ao registrar a requisição.' });
  }
});

// ─── GET /api/dsr/:protocolo ─────────────────────────────────
// Consultar status de uma requisição pelo protocolo
router.get('/:protocolo', async (req, res) => {
  const { protocolo } = req.params;

  if (!protocolo.match(/^RC-\d{6}$/i)) {
    return res.status(400).json({
      error: 'Protocolo inválido. Formato esperado: RC-XXXXXX (6 dígitos).',
    });
  }

  try {
    const result = await db.query(
      `SELECT
         id              AS protocolo,
         tipo,
         status,
         data_criacao    AS "dataCriacao",
         prazo_legal     AS "prazoLegal",
         data_conclusao  AS "dataConclusao",
         observacoes_dpo AS "mensagem"
       FROM dsr_requisicoes
       WHERE UPPER(id) = UPPER($1)`,
      [protocolo]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Protocolo não encontrado. Verifique o número e tente novamente.',
      });
    }

    const req_ = result.rows[0];

    // Mensagem padrão caso o DPO não tenha preenchido observações
    if (!req_.mensagem) {
      const mensagensPadrao: Record<string, string> = {
        'Pendente'    : 'Sua requisição foi recebida e está aguardando análise pelo DPO.',
        'Em Análise'  : 'Sua requisição está sendo analisada. Em caso de dúvidas, entre em contato com o DPO.',
        'Concluído'   : 'Sua requisição foi atendida. Verifique seu e-mail para mais detalhes.',
        'Indeferido'  : 'Sua requisição foi indeferida. Entre em contato com o DPO para mais informações.',
      };
      req_.mensagem = mensagensPadrao[req_.status] ?? 'Status atual da requisição.';
    }

    return res.json(req_);
  } catch (err: any) {
    console.error('[DSR] Erro ao consultar:', err.message);
    return res.status(500).json({ error: 'Erro interno ao consultar a requisição.' });
  }
});

// ─── GET /api/dsr — Listar todas (uso interno/DPO) ──────────
router.get('/', async (_req, res) => {
  try {
    const result = await db.query(
      `SELECT
         id              AS protocolo,
         nome,
         email,
         tipo,
         status,
         data_criacao    AS "dataCriacao",
         prazo_legal     AS "prazoLegal",
         data_conclusao  AS "dataConclusao"
       FROM dsr_requisicoes
       ORDER BY data_criacao DESC`
    );

    return res.json({ total: result.rowCount, requisicoes: result.rows });
  } catch (err: any) {
    console.error('[DSR] Erro ao listar:', err.message);
    return res.status(500).json({ error: 'Erro interno ao listar as requisições.' });
  }
});

// ─── PATCH /api/dsr/:protocolo — Atualizar status (DPO) ─────
router.patch('/:protocolo', async (req, res) => {
  const { protocolo } = req.params;
  const { status, observacoesDpo } = req.body;

  const statusValidos = ['Pendente', 'Em Análise', 'Concluído', 'Indeferido'];
  if (!status || !statusValidos.includes(status)) {
    return res.status(400).json({
      error: `Status inválido. Valores aceitos: ${statusValidos.join(', ')}`,
    });
  }

  try {
    const dataConclusao = ['Concluído', 'Indeferido'].includes(status) ? new Date() : null;

    const result = await db.query(
      `UPDATE dsr_requisicoes
       SET status = $1, observacoes_dpo = $2, data_conclusao = $3
       WHERE UPPER(id) = UPPER($4)
       RETURNING id`,
      [status, observacoesDpo ?? null, dataConclusao, protocolo]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Protocolo não encontrado.' });
    }

    console.log(`[DSR] Status atualizado: ${protocolo} → ${status}`);
    return res.json({ message: `Requisição ${protocolo} atualizada para: ${status}` });
  } catch (err: any) {
    console.error('[DSR] Erro ao atualizar:', err.message);
    return res.status(500).json({ error: 'Erro interno ao atualizar a requisição.' });
  }
});

export default router;
