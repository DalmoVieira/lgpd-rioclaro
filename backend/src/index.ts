import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

// Routers
import dsrRouter  from './routes/dsr';
import ropaRouter from './routes/ropa';
import usuariosRouter from './routes/usuarios';

// Pool de conexão (inicializa e valida ao importar)
import './db';

const app  = express();
const port = process.env.PORT || 3001;

// ─── Middlewares ──────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(morgan('dev'));
app.use(express.json());

// ─── Health Check ─────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date(), version: '1.0.0' });
});

// ─── Rotas ────────────────────────────────────────────────────
app.use('/api/dsr',      dsrRouter);
app.use('/api/ropa',     ropaRouter);
app.use('/api/usuarios', usuariosRouter);

// ─── 404 Handler ──────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Rota não encontrada.' });
});

// ─── Error Handler ────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[SERVER] Erro não tratado:', err.message);
  res.status(500).json({ error: 'Erro interno do servidor.' });
});

// ─── Start ────────────────────────────────────────────────────
app.listen(port, () => {
  console.log(`\n🛡️  LGPD Backend — Prefeitura de Rio Claro, RJ`);
  console.log(`   Rodando em: http://localhost:${port}`);
  console.log(`   Banco:      ${process.env.DATABASE_URL?.split('@')[1] ?? 'não configurado'}\n`);
  console.log(`   DSR:  POST   /api/dsr`);
  console.log(`         GET    /api/dsr          (lista – DPO)`);
  console.log(`         GET    /api/dsr/:protocolo`);
  console.log(`         PATCH  /api/dsr/:protocolo`);
  console.log(`   ROPA: GET    /api/ropa`);
  console.log(`         GET    /api/ropa/:id`);
  console.log(`         POST   /api/ropa`);
  console.log(`         PUT    /api/ropa/:id`);
  console.log(`         DELETE /api/ropa/:id\n`);
});
