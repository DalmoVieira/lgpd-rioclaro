import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Pool de conexões ao PostgreSQL
export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,               // máximo de conexões simultâneas
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Teste de conexão na inicialização
db.connect()
  .then((client) => {
    console.log('[DB] ✅ Conectado ao PostgreSQL:', process.env.DATABASE_URL?.split('@')[1]);
    client.release();
  })
  .catch((err) => {
    console.error('[DB] ❌ Falha ao conectar:', err.message);
    console.error('[DB] Verifique DATABASE_URL no .env');
  });

export default db;
