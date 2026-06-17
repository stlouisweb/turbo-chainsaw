import type { FastifyInstance } from 'fastify';
import { getPool } from '../db/index.js';

interface Note {
  id: number;
  title: string;
  content: string;
  user_id: number | null;
  created_at: string;
  updated_at: string;
}

const noteSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    title: { type: 'string' },
    content: { type: 'string' },
    user_id: { type: 'integer', nullable: true },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' },
  },
} as const;

const errorSchema = {
  type: 'object',
  properties: { message: { type: 'string' } },
} as const;

export async function notesRoutes(app: FastifyInstance): Promise<void> {
  const pool = getPool();

  app.get('/notes', {
    schema: {
      summary: 'List all notes',
      tags: ['Notes'],
      response: { 200: { type: 'array', items: noteSchema } },
    },
    handler: async (_req, reply) => {
      const { rows } = await pool.query<Note>('SELECT * FROM notes ORDER BY updated_at DESC');
      return reply.send(rows);
    },
  });

  app.get<{ Params: { id: string } }>('/notes/:id', {
    schema: {
      summary: 'Get a note by ID',
      tags: ['Notes'],
      params: {
        type: 'object',
        properties: { id: { type: 'string' } },
        required: ['id'],
      },
      response: { 200: noteSchema, 404: errorSchema },
    },
    handler: async (req, reply) => {
      const { rows, rowCount } = await pool.query<Note>(
        'SELECT * FROM notes WHERE id = $1',
        [req.params.id],
      );
      if (!rowCount) return reply.code(404).send({ message: 'Note not found' });
      return reply.send(rows[0]);
    },
  });

  app.post<{ Body: { title?: string; content?: string } }>('/notes', {
    schema: {
      summary: 'Create a note',
      tags: ['Notes'],
      body: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          content: { type: 'string' },
        },
      },
      response: { 201: noteSchema },
    },
    handler: async (req, reply) => {
      const { title = 'Untitled', content = '' } = req.body;
      const { rows } = await pool.query<Note>(
        'INSERT INTO notes (title, content) VALUES ($1, $2) RETURNING *',
        [title, content],
      );
      return reply.code(201).send(rows[0]);
    },
  });

  app.put<{ Params: { id: string }; Body: { title?: string; content?: string } }>('/notes/:id', {
    schema: {
      summary: 'Update a note',
      tags: ['Notes'],
      params: {
        type: 'object',
        properties: { id: { type: 'string' } },
        required: ['id'],
      },
      body: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          content: { type: 'string' },
        },
      },
      response: { 200: noteSchema, 404: errorSchema },
    },
    handler: async (req, reply) => {
      const { title, content } = req.body;
      const { rows, rowCount } = await pool.query<Note>(
        `UPDATE notes
         SET title      = COALESCE($1, title),
             content    = COALESCE($2, content),
             updated_at = NOW()
         WHERE id = $3
         RETURNING *`,
        [title ?? null, content ?? null, req.params.id],
      );
      if (!rowCount) return reply.code(404).send({ message: 'Note not found' });
      return reply.send(rows[0]);
    },
  });

  app.delete<{ Params: { id: string } }>('/notes/:id', {
    schema: {
      summary: 'Delete a note',
      tags: ['Notes'],
      params: {
        type: 'object',
        properties: { id: { type: 'string' } },
        required: ['id'],
      },
      response: { 404: errorSchema },
    },
    handler: async (req, reply) => {
      const { rowCount } = await pool.query(
        'DELETE FROM notes WHERE id = $1',
        [req.params.id],
      );
      if (!rowCount) return reply.code(404).send({ message: 'Note not found' });
      return reply.code(204).send();
    },
  });
}
