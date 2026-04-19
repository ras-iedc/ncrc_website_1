import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';
import { prisma } from '../config/db.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        status: string;
        email: string;
      };
    }
  }
}

export async function auth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token = req.cookies?.accessToken;
  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  try {
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId, deletedAt: null },
      select: { id: true, role: true, status: true, email: true },
    });

    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
