import dotenv from 'dotenv';
dotenv.config();

const required = [
  'DATABASE_URL',
  'JWT_SECRET',
  'ALLOWED_ORIGINS',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD',
  'APP_URL',
  'FRONTEND_URL',
  'CLUB_NAME',
  'CLUB_EMAIL',
] as const;

const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  throw new Error(`Missing required environment variables:\n  ${missing.join('\n  ')}`);
}

export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_ACCESS_EXPIRY: process.env.JWT_ACCESS_EXPIRY || '15m',
  JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || '7d',
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS!.split(',').map((s) => s.trim()),
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || '',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || '',
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || '',
  SMTP_HOST: process.env.SMTP_HOST!,
  SMTP_PORT: parseInt(process.env.SMTP_PORT!, 10),
  SMTP_USER: process.env.SMTP_USER!,
  SMTP_PASS: process.env.SMTP_PASS!,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL!,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD!,
  PORT: parseInt(process.env.PORT || '3001', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  APP_URL: process.env.APP_URL!,
  FRONTEND_URL: process.env.FRONTEND_URL!,
  CLUB_NAME: process.env.CLUB_NAME!,
  CLUB_EMAIL: process.env.CLUB_EMAIL!,
  CLUB_LOGO_URL: process.env.CLUB_LOGO_URL || '',
  STORAGE_PATH: process.env.STORAGE_PATH || (process.env.VERCEL ? '/tmp' : './storage'),
  LOG_PATH: process.env.LOG_PATH || (process.env.VERCEL ? '/tmp/logs' : './logs'),
  IS_VERCEL: !!process.env.VERCEL,
} as const;
