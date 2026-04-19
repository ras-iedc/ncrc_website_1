import { z } from 'zod';

export const feedbackSchema = z.object({
  subject: z.string().min(1).max(200),
  message: z.string().min(1).max(5000),
});
