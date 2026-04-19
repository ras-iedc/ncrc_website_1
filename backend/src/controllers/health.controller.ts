import type { Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const healthCheck = asyncHandler(async (_req: Request, res: Response) => {
  let dbOk = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbOk = true;
  } catch { /* empty */ }

  res.json({
    status: dbOk ? 'healthy' : 'degraded',
    uptime: process.uptime(),
    dbPing: dbOk,
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});
