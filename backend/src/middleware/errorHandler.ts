import type { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger.js';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  logger.error({ err, path: req.path, method: req.method }, 'Unhandled error');

  if (err.message === 'Only JPEG, PNG, and WebP images are allowed') {
    res.status(400).json({ error: err.message });
    return;
  }

  if (err.name === 'MulterError') {
    res.status(400).json({ error: `Upload error: ${err.message}` });
    return;
  }

  res.status(500).json({ error: 'Internal server error' });
}
