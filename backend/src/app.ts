import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { globalLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './config/logger.js';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import adminRoutes from './routes/admin.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import postRoutes from './routes/post.routes.js';
import shopRoutes from './routes/shop.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import feedbackRoutes from './routes/feedback.routes.js';
import healthRoutes from './routes/health.routes.js';
import cronRoutes from './routes/cron.routes.js';

const app = express();

// Security
app.use(helmet());
app.use(cors({
  origin: env.ALLOWED_ORIGINS,
  credentials: true,
}));
app.use(globalLimiter);

// Body parsing — webhook route needs raw body, handled in payment.routes.ts
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, _res, next) => {
  logger.info({ method: req.method, url: req.url }, 'request');
  next();
});

// Static files — avatars only (invoices are auth-gated)
app.use('/avatars', express.static(`${env.STORAGE_PATH}/avatars`));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/cron', cronRoutes);

// Error handler
app.use(errorHandler);

export default app;
