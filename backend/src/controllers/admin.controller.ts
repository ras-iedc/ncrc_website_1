import type { Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { generateMembershipId } from '../utils/membershipId.js';
import { generateToken, hashToken } from '../utils/hash.js';
import { sendMail, sendBulkMail } from '../services/email.service.js';
import { approvedTemplate, rejectedTemplate, inviteTemplate } from '../emails/templates.js';
import { logAdminAction } from '../services/audit.service.js';
import { env } from '../config/env.js';
import { Readable } from 'node:stream';

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const status = req.query.status as string | undefined;
  const role = req.query.role as string | undefined;
  const search = req.query.search as string | undefined;

  const where: Record<string, unknown> = { deletedAt: null };
  if (status) where.status = status;
  if (role) where.role = role;
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
      { membershipId: { contains: search } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, email: true, role: true, status: true,
        membershipId: true, phone: true, emailVerified: true, createdAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  res.json({ users, total, page, pages: Math.ceil(total / limit) });
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { status, role, reason } = req.body;

  const user = await prisma.user.findUnique({ where: { id, deletedAt: null } });
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const data: Record<string, unknown> = {};

  if (status === 'APPROVED' && user.status !== 'APPROVED') {
    data.status = 'APPROVED';
    if (!user.membershipId) {
      data.membershipId = await generateMembershipId();
    }
  } else if (status) {
    data.status = status;
  }

  if (role) data.role = role;

  const updated = await prisma.user.update({ where: { id }, data });

  // Send notification email
  if (status === 'APPROVED') {
    await sendMail({
      to: user.email,
      subject: 'Membership Approved',
      html: approvedTemplate(user.name, updated.membershipId || ''),
    });
  } else if (status === 'REJECTED') {
    await sendMail({
      to: user.email,
      subject: 'Application Update',
      html: rejectedTemplate(user.name, reason),
    });
  }

  await logAdminAction({
    adminId: req.user!.id,
    action: status ? `USER_${status}` : `ROLE_CHANGE_${role}`,
    targetId: id,
    metadata: { reason, previousStatus: user.status, previousRole: user.role },
    req,
  });

  res.json({ message: 'User updated', user: updated });
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  await prisma.user.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  await logAdminAction({
    adminId: req.user!.id,
    action: 'USER_SOFT_DELETE',
    targetId: id,
    req,
  });

  res.json({ message: 'User deleted' });
});

export const getMembersReport = asyncHandler(async (req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    select: { name: true, email: true, membershipId: true, status: true, role: true, phone: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="members.csv"');

  const header = 'Name,Email,Membership ID,Status,Role,Phone,Joined\n';
  const rows = users.map((u) =>
    `"${u.name}","${u.email}","${u.membershipId || ''}","${u.status}","${u.role}","${u.phone || ''}","${u.createdAt.toISOString()}"`
  ).join('\n');

  Readable.from(header + rows).pipe(res);
});

export const getPaymentsReport = asyncHandler(async (req: Request, res: Response) => {
  const payments = await prisma.payment.findMany({
    include: { user: { select: { name: true, email: true, membershipId: true } } },
    orderBy: { createdAt: 'desc' },
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="payments.csv"');

  const header = 'Member,Email,Amount,Status,Razorpay ID,Date\n';
  const rows = payments.map((p) =>
    `"${p.user.name}","${p.user.email}","${(p.amount / 100).toFixed(2)}","${p.status}","${p.razorpayPaymentId || ''}","${p.createdAt.toISOString()}"`
  ).join('\n');

  Readable.from(header + rows).pipe(res);
});

export const sendBulkEmail = asyncHandler(async (req: Request, res: Response) => {
  const { subject, html, cohort } = req.body;

  const where: Record<string, unknown> = { deletedAt: null };
  if (cohort === 'APPROVED') where.status = 'APPROVED';
  else if (cohort === 'PENDING') where.status = 'PENDING';

  const users = await prisma.user.findMany({ where, select: { email: true } });
  const emails = users.map((u) => u.email);

  await sendBulkMail(emails, subject, html);

  await logAdminAction({
    adminId: req.user!.id,
    action: 'BULK_EMAIL',
    metadata: { subject, cohort, recipientCount: emails.length },
    req,
  });

  res.json({ message: `Email sent to ${emails.length} recipients` });
});

export const createInvite = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  const token = generateToken();

  await prisma.inviteToken.create({
    data: {
      email,
      token: hashToken(token),
      expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
      createdById: req.user!.id,
    },
  });

  const inviteLink = `${env.FRONTEND_URL}/register?invite=${token}`;
  await sendMail({
    to: email,
    subject: `Invitation to join ${env.CLUB_NAME}`,
    html: inviteTemplate(inviteLink),
  });

  await logAdminAction({
    adminId: req.user!.id,
    action: 'INVITE_CREATED',
    metadata: { email },
    req,
  });

  res.json({ message: 'Invite sent' });
});

export const getFeedback = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  const [feedbacks, total] = await Promise.all([
    prisma.feedback.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.feedback.count(),
  ]);

  res.json({ feedbacks, total, page, pages: Math.ceil(total / limit) });
});

export const getAuditLog = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        admin: { select: { name: true, email: true } },
        target: { select: { name: true, email: true } },
      },
    }),
    prisma.auditLog.count(),
  ]);

  res.json({ logs, total, page, pages: Math.ceil(total / limit) });
});
