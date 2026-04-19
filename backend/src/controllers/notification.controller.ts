import type { Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  res.json({ notifications });
});

export const markRead = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification || notification.userId !== req.user!.id) {
    res.status(404).json({ error: 'Notification not found' });
    return;
  }

  await prisma.notification.update({
    where: { id },
    data: { read: true },
  });

  res.json({ message: 'Marked as read' });
});
