import { transporter, mailDefaults } from '../config/email.js';
import { logger } from '../config/logger.js';

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendMail({ to, subject, html }: SendMailOptions): Promise<void> {
  try {
    await transporter.sendMail({
      ...mailDefaults,
      to,
      subject,
      html,
    });
    logger.info({ to, subject }, 'Email sent');
  } catch (error) {
    logger.error({ error, to, subject }, 'Failed to send email');
    throw error;
  }
}

export async function sendBulkMail(
  recipients: string[],
  subject: string,
  html: string
): Promise<void> {
  const batchSize = 50;
  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);
    try {
      await transporter.sendMail({
        ...mailDefaults,
        bcc: batch.join(','),
        subject,
        html,
      });
      logger.info({ batchIndex: i / batchSize, count: batch.length }, 'Bulk email batch sent');
    } catch (error) {
      logger.error({ error, batchIndex: i / batchSize }, 'Bulk email batch failed');
    }
  }
}
