import { Router } from 'express';
import db from '../db';
import type { RopaRegistro } from '../types';

const router = Router();

// ─── GET /api/ropa — Listar todos os registros ───────────────
router.get('/', async (_req, res) => {
  try {
    const result = await db.query(
      `SELECT
         id,
         nome_processo             AS "nomeProcesso",
         secretaria,
         dpo_responsavel           AS "dpoResponsavel",
         sistema,
         finalidade,
         descricao_fluxo           AS "descricaoFluxo",
         categorias,
         categorias_sensiveis      AS "categoriasSensiveis",
         titulares,
         base_legal                AS "baseLegal",
         hipotese_tratamento       AS "hipoteseTratamento",
         armazenamento,
         retencao,
         operador,
         compartilhamento,
         transferencia_internacional AS "transferenciaInternacional",
         pais_destino              AS "paisDestino",
         medidas_seguranca         AS "medidasSeguranca",
         TO_CHAR(criado_em,    'YYYY-MM-DD') AS "criadoEm",
         TO_CHAR(atualizado_em, 'YYYY-MM-DD') AS "atualizadoEm"
       FROM ropa
       ORDER BY criado_em DESC`
    );

    return res.json({ total: result.rowCount, registros: result.rows });
  } catch (err: any) {
    console.error('[ROPA] Erro ao listar:', err.message);
    return res.status(500).json({ error: 'Erro interno ao listar os registros ROPA.' });
  }
});

// ─── GET /api/ropa/:id — Buscar registro por ID ──────────────
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID inválido. Deve ser um número inteiro.' });
  }

  try {
    const result = await db.query(
      `SELECT
         id,
         nome_processo             AS "nomeProcesso",
         secretaria,
         dpo_responsavel           AS "dpoResponsavel",
         sistema,
         finalidade,
         descricao_fluxo           AS "descricaoFluxo",
         categorias,
         categorias_sensiveis      AS "categoriasSensiveis",
         titulares,
         base_legal                AS "baseLegal",
         hipotese_tratamento       AS "hipoteseTratamento",
         armazenamento,
         retencao,
         operador,
         compartilhamento,
         transferencia_internacional AS "transferenciaInternacional",
         pais_destino              AS "paisDestino",
         medidas_seguranca         AS "medidasSeguranca",
         TO_CHAR(criado_em,    'YYYY-MM-DD') AS "criadoEm",
         TO_CHAR(atualizado_em, 'YYYY-MM-DD') AS "atualizadoEm"
       FROM ropa WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: `Registro ROPA #${id} não encontrado.` });
    }

    return res.json(result.rows[0]);
  } catch (err: any) {
    console.error('[ROPA] Erro ao buscar:', err.message);
    return res.status(500).json({ error: 'Erro interno ao buscar o registro.' });
  }
});

// ─── POST /api/ropa — Criar novo registro ────────────────────
router.post('/', async (req, res) => {
  const {
    nomeProcesso, secretaria, finalidade, baseLegal,
    dpoResponsavel, sistema, descricaoFluxo,
    categorias, categoriasSensiveis, titulares, hipoteseTratamento,
    armazenamento, retencao, operador, compartilhamento,
    transferenciaInternacional, paisDestino, medidasSeguranca,
  } = req.body;

  if (!nomeProcesso || !secretaria || !finalidade || !baseLegal) {
    return res.status(400).json({
      error: 'Campos obrigatórios ausentes.',
      camposObrigatorios: ['nomeProcesso', 'secretaria', 'finalidade', 'baseLegal'],
    });
  }

  try {
    const result = await db.query(
      `INSERT INTO ropa (
         nome_processo, secretaria, dpo_responsavel, sistema,
         finalidade, descricao_fluxo, categorias, categorias_sensiveis,
         titulares, base_legal, hipotese_tratamento, armazenamento,
         retencao, operador, compartilhamento, transferencia_internacional,
         pais_destino, medidas_seguranca
       ) VALUES (
         $1,  $2,  $3,  $4,
         $5,  $6,  $7,  $8,
         $9,  $10, $11, $12,
         $13, $14, $15, $16,
         $17, $18
       ) RETURNING id`,
      [
        nomeProcesso,
        secretaria,
        dpoResponsavel    ?? 'A definir',
        sistema           ?? 'A definir',
        finalidade,
        descricaoFluxo    ?? '',
        categorias        ?? [],
        categoriasSensiveis ?? [],
        titulares         ?? '',
        baseLegal,
        hipoteseTratamento ?? '',
        armazenamento     ?? 'A definir',
        retencao          ?? 'Indeterminado',
        operador          ?? secretaria,
        compartilhamento  ?? 'Nenhum',
        transferenciaInternacional === true,
        paisDestino       ?? null,
        medidasSeguranca  ?? 'A definir',
      ]
    );

    const novoId = result.rows[0].id;
    console.log(`[ROPA] Novo registro criado: #${novoId} — ${nomeProcesso} (${secretaria})`);

    return res.status(201).json({
      message: 'Registro ROPA criado com sucesso.',
      id: novoId,
    });
  } catch (err: any) {
    console.error('[ROPA] Erro ao criar:', err.message);
    return res.status(500).json({ error: 'Erro interno ao criar o registro ROPA.' });
  }
});

// ─── PUT /api/ropa/:id — Atualizar registro completo ─────────
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID inválido.' });
  }

  const {
    nomeProcesso, secretaria, finalidade, baseLegal,
    dpoResponsavel, sistema, descricaoFluxo,
    categorias, categoriasSensiveis, titulares, hipoteseTratamento,
    armazenamento, retencao, operador, compartilhamento,
    transferenciaInternacional, paisDestino, medidasSeguranca,
  } = req.body;

  if (!nomeProcesso || !secretaria || !finalidade || !baseLegal) {
    return res.status(400).json({
      error: 'Campos obrigatórios ausentes.',
      camposObrigatorios: ['nomeProcesso', 'secretaria', 'finalidade', 'baseLegal'],
    });
  }

  try {
    const result = await db.query(
      `UPDATE ropa SET
         nome_processo             = $1,
         secretaria                = $2,
         dpo_responsavel           = $3,
         sistema                   = $4,
         finalidade                = $5,
         descricao_fluxo           = $6,
         categorias                = $7,
         categorias_sensiveis      = $8,
         titulares                 = $9,
         base_legal                = $10,
         hipotese_tratamento       = $11,
         armazenamento             = $12,
         retencao                  = $13,
         operador                  = $14,
         compartilhamento          = $15,
         transferencia_internacional = $16,
         pais_destino              = $17,
         medidas_seguranca         = $18
       WHERE id = $19
       RETURNING id`,
      [
        nomeProcesso, secretaria,
        dpoResponsavel ?? 'A definir', sistema ?? 'A definir',
        finalidade, descricaoFluxo ?? '',
        categorias ?? [], categoriasSensiveis ?? [],
        titulares ?? '', baseLegal, hipoteseTratamento ?? '',
        armazenamento ?? 'A definir', retencao ?? 'Indeterminado',
        operador ?? secretaria, compartilhamento ?? 'Nenhum',
        transferenciaInternacional === true, paisDestino ?? null,
        medidasSeguranca ?? 'A definir', id,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: `Registro ROPA #${id} não encontrado.` });
    }

    console.log(`[ROPA] Registro #${id} atualizado.`);
    return res.json({ message: `Registro ROPA #${id} atualizado com sucesso.` });
  } catch (err: any) {
    console.error('[ROPA] Erro ao atualizar:', err.message);
    return res.status(500).json({ error: 'Erro interno ao atualizar o registro.' });
  }
});

// ─── DELETE /api/ropa/:id — Excluir registro ─────────────────
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID inválido.' });
  }

  try {
    const result = await db.query('DELETE FROM ropa WHERE id = $1 RETURNING id', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: `Registro ROPA #${id} não encontrado.` });
    }

    console.log(`[ROPA] Registro #${id} excluído.`);
    return res.json({ message: `Registro ROPA #${id} excluído com sucesso.` });
  } catch (err: any) {
    console.error('[ROPA] Erro ao excluir:', err.message);
    return res.status(500).json({ error: 'Erro interno ao excluir o registro.' });
  }
});

export default router;
