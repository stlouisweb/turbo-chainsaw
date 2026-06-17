import { getPool } from './index.js';

export async function runMigrations(): Promise<void> {
  const pool = getPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS notes (
      id         SERIAL PRIMARY KEY,
      title      TEXT NOT NULL DEFAULT 'Untitled',
      content    TEXT NOT NULL DEFAULT '',
      user_id    INTEGER,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}
