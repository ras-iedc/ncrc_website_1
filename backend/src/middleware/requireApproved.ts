import type { Request, Response, NextFunction } from 'express';

export function requireApproved(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  if (req.user.status !== 'APPROVED') {
    res.status(403).json({ error: 'Account not yet approved' });
    return;
  }

  next();
}
