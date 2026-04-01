import { Router } from 'express';
import pool from '../db';

const router = Router();

// ─── LISTAR USUÁRIOS (DPO/ADMIN) ──────────────────────────────
router.get('/', async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nome, email, perfil, ativo, criado_em FROM usuarios_internos ORDER BY criado_em DESC'
    );
    res.json({ usuarios: result.rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── CADASTRAR USUÁRIO (ADMIN) ────────────────────────────────
router.post('/', async (req, res) => {
  const { nome, email, senha, perfil } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO usuarios_internos (nome, email, senha_hash, perfil) 
       VALUES ($1, $2, crypt($3, gen_salt('bf')), $4) 
       RETURNING id, nome, email, perfil`,
      [nome, email, senha, perfil]
    );
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    if (err.code === '23505') {
       return res.status(400).json({ error: 'E-mail já cadastrado.' });
    }
    res.status(500).json({ error: err.message });
  }
});

// ─── TROCAR SENHA (SELF) ──────────────────────────────────────
router.patch('/senha', async (req, res) => {
  const { email, senhaAtual, novaSenha } = req.body;

  try {
    // Verifica senha atual
    const check = await pool.query(
      "SELECT id FROM usuarios_internos WHERE email = $1 AND senha_hash = crypt($2, senha_hash)",
      [email, senhaAtual]
    );

    if (check.rows.length === 0) {
      return res.status(401).json({ error: 'Senha atual incorreta.' });
    }

    // Atualiza para nova senha
    await pool.query(
      "UPDATE usuarios_internos SET senha_hash = crypt($1, gen_salt('bf')) WHERE email = $2",
      [novaSenha, email]
    );

    res.json({ message: 'Senha atualizada com sucesso.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── ESQUECI MINHA SENHA (TOKEN) ─────────────────────────────
router.post('/esqueci-senha', async (req, res) => {
  const { email } = req.body;
  const token = Math.floor(100000 + Math.random() * 900000).toString(); // Token de 6 dígitos

  try {
    const result = await pool.query(
      "UPDATE usuarios_internos SET recuperar_token = $1, recuperar_expira = NOW() + INTERVAL '1 hour' WHERE email = $2 RETURNING id",
      [token, email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'E-mail não encontrado.' });
    }

    // SIMULAÇÃO: Em produção enviaria e-mail. Aqui apenas retornamos para o usuário (DEV ONLY)
    res.json({ message: 'Token de recuperação gerado.', token }); 
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── RESETAR SENHA ───────────────────────────────────────────
router.post('/resetar-senha', async (req, res) => {
  const { email, token, novaSenha } = req.body;

  try {
    const result = await pool.query(
      "UPDATE usuarios_internos SET senha_hash = crypt($1, gen_salt('bf')), recuperar_token = NULL, recuperar_expira = NULL WHERE email = $2 AND recuperar_token = $3 AND recuperar_expira > NOW() RETURNING id",
      [novaSenha, email, token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Token inválido ou expirado.' });
    }

    res.json({ message: 'Senha resetada com sucesso.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
