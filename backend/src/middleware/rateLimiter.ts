import type { Request, Response, NextFunction } from 'express';
import { Ratelimit } from '@upstash/ratelimit';
import { redis } from '../config/redis.js';

function createLimiter(prefix: string, maxRequests: number, windowSec: number) {
  const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(maxRequests, `${windowSec} s`),
    prefix: `rl:${prefix}`,
  });

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const key = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
    const { success, limit, remaining, reset } = await ratelimit.limit(key);

    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', reset);

    if (!success) {
      res.status(429).json({ error: 'Too many requests, please try again later' });
      return;
    }

    next();
  };
}

// 10 requests per 15 min for auth endpoints
export const authLimiter = createLimiter('auth', 10, 900);

// 20 requests per 15 min for payment endpoints
export const paymentLimiter = createLimiter('payment', 20, 900);

// 200 requests per 15 min globally
export const globalLimiter = createLimiter('global', 200, 900);
