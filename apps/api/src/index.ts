import 'dotenv/config';
import { buildApp } from './app.js';
import { closePool } from './db/index.js';

const app = await buildApp();

const port = parseInt(process.env.API_PORT ?? '3000', 10);
const host = process.env.API_HOST ?? '0.0.0.0';

try {
  await app.listen({ port, host });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}

const shutdown = async () => {
  await app.close();
  await closePool();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
