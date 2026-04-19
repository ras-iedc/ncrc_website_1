import type { Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { sendMail } from '../services/email.service.js';
import { birthdayTemplate, renewalReminderTemplate } from '../emails/templates.js';
import { logger } from '../config/logger.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const birthdayCron = asyncHandler(async (_req: Request, res: Response) => {
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  const users = await prisma.user.findMany({
    where: { status: 'APPROVED', deletedAt: null, dob: { not: null } },
    select: { name: true, email: true, dob: true },
  });

  let sent = 0;
  for (const user of users) {
    if (!user.dob) continue;
    const dob = new Date(user.dob);
    if (dob.getMonth() + 1 === month && dob.getDate() === day) {
      await sendMail({
        to: user.email,
        subject: `Happy Birthday, ${user.name}! 🎂`,
        html: birthdayTemplate(user.name),
      });
      sent++;
    }
  }

  logger.info(`Birthday cron completed — ${sent} emails sent`);
  res.json({ ok: true, sent });
});

export const renewalCron = asyncHandler(async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    where: { status: 'APPROVED', deletedAt: null },
    include: {
      payments: {
        where: { status: 'CAPTURED' },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  let sent = 0;
  for (const user of users) {
    const lastPayment = user.payments[0];
    if (!lastPayment) continue;

    const expiryDate = new Date(lastPayment.createdAt);
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    const daysLeft = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysLeft === 30 || daysLeft === 7 || daysLeft === 1) {
      await sendMail({
        to: user.email,
        subject: `Membership Renewal Reminder - ${daysLeft} days left`,
        html: renewalReminderTemplate(user.name, daysLeft),
      });
      sent++;
    }
  }

  logger.info(`Renewal cron completed — ${sent} emails sent`);
  res.json({ ok: true, sent });
});
