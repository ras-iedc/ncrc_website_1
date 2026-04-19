import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().transform((v) => v.toLowerCase()),
  password: z.string().min(8).max(128),
  phone: z.string().optional(),
  dob: z.string().optional(),
  address: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email().transform((v) => v.toLowerCase()),
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email().transform((v) => v.toLowerCase()),
});

export const resetPasswordSchema = z.object({
  token: z.string().length(64),
  password: z.string().min(8).max(128),
});
