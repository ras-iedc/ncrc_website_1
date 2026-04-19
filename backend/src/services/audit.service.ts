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
  await prisma.auditLog.create({
    data: {
      adminId,
      action,
      targetId,
      metadata: metadata ?? undefined,
      ip: req.ip || req.socket.remoteAddress || null,
      userAgent: req.headers['user-agent'] || null,
    },
  });
}
