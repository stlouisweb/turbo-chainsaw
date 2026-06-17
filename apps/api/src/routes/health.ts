import type { FastifyPluginAsync } from 'fastify';
import { getPool } from '../db/index.js';

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get('/health', {
    schema: {
      tags: ['Health'],
      summary: 'Health check',
      description: 'Returns API and database connectivity status',
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['ok'] },
            database: { type: 'string', enum: ['connected'] },
            timestamp: { type: 'string' },
          },
        },
        503: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['error'] },
            database: { type: 'string', enum: ['disconnected'] },
            error: { type: 'string' },
            timestamp: { type: 'string' },
          },
        },
      },
    },
    handler: async (_req, reply) => {
      try {
        const pool = getPool();
        await pool.query('SELECT 1');
        return reply.send({
          status: 'ok',
          database: 'connected',
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Unknown error';
        return reply.status(503).send({
          status: 'error',
          database: 'disconnected',
          error,
          timestamp: new Date().toISOString(),
        });
      }
    },
  });
};
