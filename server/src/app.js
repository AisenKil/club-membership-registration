import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pool from './db.js';
import membersRouter from './routes/members.js';
import { requestLogger } from './middleware/logger.js';

const app = express();
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// Middleware is registered before the API routes.
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '30kb' }));
app.use(requestLogger);

export function getHealth(req, res) {
  return res.status(200).json({ status: 'ok', service: 'club-membership-api' });
}

app.get('/api/health', getHealth);
app.use('/api/members', membersRouter);

app.use((req, res) => {
  return res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error instanceof SyntaxError && 'body' in error) {
    return res.status(400).json({ message: 'Request body must contain valid JSON.' });
  }
  console.error('Unhandled server error:', error);
  return res.status(500).json({ message: 'Unexpected server error.' });
});

const port = Number(process.env.PORT || 3000);
const server = app.listen(port, () => {
  process.stdout.write(`Club Membership API listening on port ${port}\n`);
});

server.on('close', () => {
  void pool.end();
});

export default app;
