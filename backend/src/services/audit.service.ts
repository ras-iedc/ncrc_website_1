import { prisma } from '../config/db.js';
import type { Request } from 'express';

interface AuditData {
  adminId: string;
  action: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  req: Request;
}

export async function logAdminAction({ adminId, action, targetId, metadata, req }: AuditData): Promise<void> {
  const ip = Array.isArray(req.ip) ? req.ip[0] : req.ip || req.socket.remoteAddress || null;
  const userAgent = Array.isArray(req.headers['user-agent']) ? req.headers['user-agent'][0] : req.headers['user-agent'] || null;

  await prisma.auditLog.create({
    data: {
      adminId,
      action,
      targetId,
      metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
      ip,
      userAgent,
    },
  });
}
