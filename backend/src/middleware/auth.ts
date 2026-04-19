import type { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
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
  const token =
    req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null;
  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  try {
    // Verify the Supabase access token
    const { data: { user: supabaseUser }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !supabaseUser) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    // Find the app user linked to this Supabase user
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { supabaseId: supabaseUser.id },
          { email: supabaseUser.email },
        ],
        deletedAt: null,
      },
      select: { id: true, role: true, status: true, email: true, supabaseId: true },
    });

    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    // Auto-link supabaseId if not set yet
    if (!user.supabaseId) {
      await prisma.user.update({
        where: { id: user.id },
        data: { supabaseId: supabaseUser.id, emailVerified: true },
      });
    }

    req.user = { id: user.id, role: user.role, status: user.status, email: user.email };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
