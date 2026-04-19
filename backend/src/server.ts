import app from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { startCronJobs } from './services/cron.service.js';
import { prisma } from './config/db.js';
import fs from 'node:fs';
import path from 'node:path';

// Ensure storage directories exist (skip on Vercel — uses /tmp, handled per-request)
if (!env.IS_VERCEL) {
  const dirs = [
    path.join(env.STORAGE_PATH, 'avatars'),
    path.join(env.STORAGE_PATH, 'invoices'),
    env.LOG_PATH,
  ];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

// Start server (not used on Vercel — see api/index.ts)
const server = app.listen(env.PORT, () => {
  logger.info(`Server running on port ${env.PORT} [${env.NODE_ENV}]`);
  // Cron jobs only run on traditional server, not on Vercel (uses Vercel Cron)
  if (!env.IS_VERCEL) {
    startCronJobs();
  }
});

// Graceful shutdown
const shutdown = async (signal: string) => {
  logger.info(`${signal} received, shutting down...`);
  server.close(async () => {
    await prisma.$disconnect();
    logger.info('Server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled rejection');
});

process.on('uncaughtException', (error) => {
  logger.fatal({ error }, 'Uncaught exception');
  process.exit(1);
});
