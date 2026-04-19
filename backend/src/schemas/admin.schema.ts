import { z } from 'zod';

export const updateUserStatusSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']).optional(),
  role: z.enum(['MEMBER', 'ADMIN']).optional(),
  reason: z.string().max(500).optional(),
});

export const createInviteSchema = z.object({
  email: z.string().email().transform((v) => v.toLowerCase()),
});

export const bulkEmailSchema = z.object({
  subject: z.string().min(1).max(200),
  html: z.string().min(1).max(50000),
  cohort: z.enum(['ALL', 'APPROVED', 'PENDING']).default('ALL'),
});
