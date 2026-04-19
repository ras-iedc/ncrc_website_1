import { env } from '../config/env.js';

function wrapper(content: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;">
  <tr><td style="padding:20px;text-align:center;background:#1a1a2e;">
    ${env.CLUB_LOGO_URL ? `<img src="${env.CLUB_LOGO_URL}" alt="${env.CLUB_NAME}" style="max-height:60px;">` : `<h1 style="color:#ffffff;margin:0;">${env.CLUB_NAME}</h1>`}
  </td></tr>
  <tr><td style="padding:30px 20px;">${content}</td></tr>
  <tr><td style="padding:15px 20px;text-align:center;background:#f0f0f0;font-size:12px;color:#666;">
    <p style="margin:0;">${env.CLUB_NAME} &bull; ${env.CLUB_EMAIL}</p>
    <p style="margin:5px 0 0;">This is an automated message. Please do not reply.</p>
  </td></tr>
</table>
</body></html>`;
}

export function emailVerificationTemplate(name: string, link: string): string {
  return wrapper(`
    <h2 style="color:#1a1a2e;">Verify Your Email</h2>
    <p>Hello ${name},</p>
    <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
    <p style="text-align:center;margin:30px 0;">
      <a href="${link}" style="background:#e94560;color:#ffffff;text-decoration:none;padding:12px 30px;border-radius:5px;display:inline-block;">Verify Email</a>
    </p>
    <p>This link expires in 24 hours.</p>
    <p>If you didn't create an account, you can safely ignore this email.</p>
  `);
}

export function approvedTemplate(name: string, membershipId: string): string {
  return wrapper(`
    <h2 style="color:#1a1a2e;">Membership Approved!</h2>
    <p>Hello ${name},</p>
    <p>Great news! Your membership has been approved.</p>
    <p><strong>Membership ID:</strong> ${membershipId}</p>
    <p style="text-align:center;margin:30px 0;">
      <a href="${env.FRONTEND_URL}/dashboard" style="background:#e94560;color:#ffffff;text-decoration:none;padding:12px 30px;border-radius:5px;display:inline-block;">Go to Dashboard</a>
    </p>
  `);
}

export function rejectedTemplate(name: string, reason?: string): string {
  return wrapper(`
    <h2 style="color:#1a1a2e;">Application Update</h2>
    <p>Hello ${name},</p>
    <p>We regret to inform you that your membership application has not been approved at this time.</p>
    ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
    <p>If you have questions, please contact us at ${env.CLUB_EMAIL}.</p>
  `);
}

export function passwordResetTemplate(name: string, link: string): string {
  return wrapper(`
    <h2 style="color:#1a1a2e;">Password Reset</h2>
    <p>Hello ${name},</p>
    <p>You requested a password reset. Click the button below to set a new password:</p>
    <p style="text-align:center;margin:30px 0;">
      <a href="${link}" style="background:#e94560;color:#ffffff;text-decoration:none;padding:12px 30px;border-radius:5px;display:inline-block;">Reset Password</a>
    </p>
    <p>This link expires in 15 minutes.</p>
    <p>If you didn't request this, you can safely ignore this email.</p>
  `);
}

export function paymentReceiptTemplate(name: string, amount: number, paymentId: string, description: string, invoiceLink: string): string {
  return wrapper(`
    <h2 style="color:#1a1a2e;">Payment Receipt</h2>
    <p>Hello ${name},</p>
    <p>We have received your payment. Here are the details:</p>
    <table style="width:100%;border-collapse:collapse;margin:20px 0;">
      <tr><td style="padding:8px;border-bottom:1px solid #eee;"><strong>Amount</strong></td><td style="padding:8px;border-bottom:1px solid #eee;">₹${(amount / 100).toFixed(2)}</td></tr>
      <tr><td style="padding:8px;border-bottom:1px solid #eee;"><strong>Payment ID</strong></td><td style="padding:8px;border-bottom:1px solid #eee;">${paymentId}</td></tr>
      <tr><td style="padding:8px;border-bottom:1px solid #eee;"><strong>Description</strong></td><td style="padding:8px;border-bottom:1px solid #eee;">${description}</td></tr>
    </table>
    <p style="text-align:center;margin:30px 0;">
      <a href="${invoiceLink}" style="background:#e94560;color:#ffffff;text-decoration:none;padding:12px 30px;border-radius:5px;display:inline-block;">Download Invoice</a>
    </p>
  `);
}

export function inviteTemplate(link: string): string {
  return wrapper(`
    <h2 style="color:#1a1a2e;">You're Invited!</h2>
    <p>You have been invited to join ${env.CLUB_NAME}.</p>
    <p style="text-align:center;margin:30px 0;">
      <a href="${link}" style="background:#e94560;color:#ffffff;text-decoration:none;padding:12px 30px;border-radius:5px;display:inline-block;">Accept Invitation</a>
    </p>
    <p>This invitation expires in 72 hours.</p>
  `);
}

export function birthdayTemplate(name: string): string {
  return wrapper(`
    <h2 style="color:#1a1a2e;">Happy Birthday! 🎂</h2>
    <p>Dear ${name},</p>
    <p>Wishing you a very happy birthday from all of us at ${env.CLUB_NAME}!</p>
    <p>We hope you have a wonderful day.</p>
  `);
}

export function renewalReminderTemplate(name: string, daysLeft: number): string {
  return wrapper(`
    <h2 style="color:#1a1a2e;">Membership Renewal Reminder</h2>
    <p>Hello ${name},</p>
    <p>Your membership is expiring in <strong>${daysLeft} days</strong>. Please renew to continue enjoying club benefits.</p>
    <p style="text-align:center;margin:30px 0;">
      <a href="${env.FRONTEND_URL}/payments" style="background:#e94560;color:#ffffff;text-decoration:none;padding:12px 30px;border-radius:5px;display:inline-block;">Renew Now</a>
    </p>
  `);
}
