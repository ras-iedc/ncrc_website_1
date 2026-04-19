import { z } from 'zod';

export const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(50000),
  type: z.enum(['NEWS', 'NOTICE', 'TOURNAMENT']).default('NEWS'),
  published: z.boolean().default(true),
});

export const updatePostSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).max(50000).optional(),
  type: z.enum(['NEWS', 'NOTICE', 'TOURNAMENT']).optional(),
  published: z.boolean().optional(),
});
