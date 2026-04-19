import type { Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getPosts = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const type = req.query.type as string | undefined;

  const where: Record<string, unknown> = { deletedAt: null, published: true };
  if (type) where.type = type;

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { name: true } } },
    }),
    prisma.post.count({ where }),
  ]);

  res.json({ posts, total, page, pages: Math.ceil(total / limit) });
});

export const getPost = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const post = await prisma.post.findUnique({
    where: { id, deletedAt: null },
    include: { author: { select: { name: true } } },
  });

  if (!post) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }

  res.json({ post });
});

export const createPost = asyncHandler(async (req: Request, res: Response) => {
  const post = await prisma.post.create({
    data: {
      ...req.body,
      authorId: req.user!.id,
    },
  });

  res.status(201).json({ post });
});

export const updatePost = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const post = await prisma.post.findUnique({
    where: { id, deletedAt: null },
  });

  if (!post) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }

  const updated = await prisma.post.update({
    where: { id },
    data: req.body,
  });

  res.json({ post: updated });
});

export const deletePost = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  await prisma.post.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  res.json({ message: 'Post deleted' });
});
