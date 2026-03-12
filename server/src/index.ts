import * as dotenv from 'dotenv';
dotenv.config();

import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import transactionsRouter from './routes/transactions';

const app = new Hono();

// Enterprise Middleware Stack
app.use('*', logger());
app.use('*', secureHeaders());
app.use('*', cors({
  origin: 'http://localhost:5173', // Strictly bind to the Vite client URL
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Route Mounting
const routes = app.route('/api/transactions', transactionsRouter);

// Exporting the API signature for compiler-only RPC mapping
export type AppType = typeof routes;

// Global Error Handler
app.onError((err, c) => {
  console.error(`[Server Error] ${err.message}`);
  return c.json({ success: false, error: 'Internal Server Error' }, 500);
});

const port = 3000;
console.log(`📡 Hono RPC Server listening on port ${port} | Connected to Supabase DB`);

serve({
  fetch: app.fetch,
  port
});