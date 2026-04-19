import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { birthdayCron, renewalCron } from '../controllers/cron.controller.js';

const router = Router();

// Protect cron routes — only Vercel Cron or requests with CRON_SECRET can call these
function verifyCron(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;

  // Vercel sets this header automatically for cron invocations
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    next();
    return;
  }

  res.status(401).json({ error: 'Unauthorized' });
}

router.use(verifyCron);

router.get('/birthday', birthdayCron);
router.get('/renewal', renewalCron);

export default router;
