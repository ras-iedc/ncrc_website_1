import cron from 'node-cron';
import { prisma } from '../config/db.js';
import { sendMail } from './email.service.js';
import { birthdayTemplate, renewalReminderTemplate } from '../emails/templates.js';
import { logger } from '../config/logger.js';

export function startCronJobs(): void {
  // Birthday greetings — daily at 8:00 AM IST
  cron.schedule('0 8 * * *', async () => {
    try {
      const today = new Date();
      const month = today.getMonth() + 1;
      const day = today.getDate();

      const users = await prisma.user.findMany({
        where: {
          status: 'APPROVED',
          deletedAt: null,
          dob: { not: null },
        },
        select: { name: true, email: true, dob: true },
      });

      for (const user of users) {
        if (!user.dob) continue;
        const dob = new Date(user.dob);
        if (dob.getMonth() + 1 === month && dob.getDate() === day) {
          await sendMail({
            to: user.email,
            subject: `Happy Birthday, ${user.name}! 🎂`,
            html: birthdayTemplate(user.name),
          });
        }
      }

      logger.info('Birthday cron completed');
    } catch (error) {
      logger.error({ error }, 'Birthday cron failed');
    }
  }, { timezone: 'Asia/Kolkata' });

  // Renewal reminders — daily at 9:00 AM IST
  cron.schedule('0 9 * * *', async () => {
    try {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      // Find users whose latest payment was about a year ago (membership renewal)
      const users = await prisma.user.findMany({
        where: {
          status: 'APPROVED',
          deletedAt: null,
        },
        include: {
          payments: {
            where: { status: 'CAPTURED' },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });

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
        }
      }

      logger.info('Renewal reminder cron completed');
    } catch (error) {
      logger.error({ error }, 'Renewal reminder cron failed');
    }
  }, { timezone: 'Asia/Kolkata' });

  logger.info('Cron jobs started');
}
