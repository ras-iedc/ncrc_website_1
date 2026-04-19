import type { Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const submitFeedback = asyncHandler(async (req: Request, res: Response) => {
  const { subject, message } = req.body;

  await prisma.feedback.create({
    data: {
      userId: req.user!.id,
      subject,
      message,
    },
  });

  res.status(201).json({ message: 'Feedback submitted' });
});
