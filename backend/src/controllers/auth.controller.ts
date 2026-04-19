import type { Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { hashPassword, comparePassword, generateToken, hashToken } from '../utils/hash.js';
import { signAccessToken, signRefreshToken } from '../utils/jwt.js';
import { sendMail } from '../services/email.service.js';
import { emailVerificationTemplate, passwordResetTemplate } from '../emails/templates.js';
import { env } from '../config/env.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, phone, dob, address } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ error: 'Email already registered' });
    return;
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      phone,
      dob: dob ? new Date(dob) : null,
      address,
    },
  });

  // Send verification email
  const token = generateToken();
  await prisma.emailVerification.create({
    data: {
      userId: user.id,
      token: hashToken(token),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  const verifyLink = `${env.FRONTEND_URL}/verify-email?token=${token}`;
  await sendMail({
    to: email,
    subject: 'Verify your email',
    html: emailVerificationTemplate(name, verifyLink),
  });

  res.status(201).json({ message: 'Registration successful. Please check your email.' });
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.query;
  if (!token || typeof token !== 'string') {
    res.status(400).json({ error: 'Token required' });
    return;
  }

  const hashed = hashToken(token);
  const record = await prisma.emailVerification.findUnique({ where: { token: hashed } });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    res.status(400).json({ error: 'Invalid or expired token' });
    return;
  }

  await prisma.$transaction([
    prisma.emailVerification.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    prisma.user.update({ where: { id: record.userId }, data: { emailVerified: true } }),
  ]);

  res.json({ message: 'Email verified successfully' });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email, deletedAt: null } });
  if (!user || !user.passwordHash) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const accessToken = signAccessToken({ userId: user.id, role: user.role });
  const refreshToken = signRefreshToken({ userId: user.id, role: user.role });

  await prisma.session.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      userAgent: req.headers['user-agent'] || null,
      ip: req.ip || null,
    },
  });

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000,
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/auth/refresh',
  });

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    },
    accessToken,
    refreshToken,
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;
  if (refreshToken) {
    const hashed = hashToken(refreshToken);
    await prisma.session.deleteMany({ where: { tokenHash: hashed } });
  }

  res.clearCookie('accessToken');
  res.clearCookie('refreshToken', { path: '/api/auth/refresh' });
  res.json({ message: 'Logged out' });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const oldRefreshToken = req.cookies?.refreshToken;
  if (!oldRefreshToken) {
    res.status(401).json({ error: 'No refresh token' });
    return;
  }

  const hashed = hashToken(oldRefreshToken);
  const session = await prisma.session.findFirst({ where: { tokenHash: hashed } });

  if (!session || session.expiresAt < new Date()) {
    res.status(401).json({ error: 'Invalid or expired session' });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId, deletedAt: null },
    select: { id: true, role: true },
  });

  if (!user) {
    res.status(401).json({ error: 'User not found' });
    return;
  }

  // Rotate refresh token
  const newRefreshToken = signRefreshToken({ userId: user.id, role: user.role });
  const newAccessToken = signAccessToken({ userId: user.id, role: user.role });

  await prisma.session.update({
    where: { id: session.id },
    data: {
      tokenHash: hashToken(newRefreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  res.cookie('accessToken', newAccessToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000,
  });

  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/auth/refresh',
  });

  res.json({ message: 'Token refreshed' });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email, deletedAt: null } });

  // Always return success to prevent email enumeration
  if (!user) {
    res.json({ message: 'If the email exists, a reset link has been sent.' });
    return;
  }

  const token = generateToken();
  await prisma.passwordReset.create({
    data: {
      userId: user.id,
      token: hashToken(token),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    },
  });

  const resetLink = `${env.FRONTEND_URL}/reset-password?token=${token}`;
  await sendMail({
    to: email,
    subject: 'Password Reset',
    html: passwordResetTemplate(user.name, resetLink),
  });

  res.json({ message: 'If the email exists, a reset link has been sent.' });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body;
  const hashed = hashToken(token);

  const record = await prisma.passwordReset.findUnique({ where: { token: hashed } });
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    res.status(400).json({ error: 'Invalid or expired token' });
    return;
  }

  const passwordHash = await hashPassword(password);
  await prisma.$transaction([
    prisma.passwordReset.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.session.deleteMany({ where: { userId: record.userId } }),
  ]);

  res.json({ message: 'Password reset successful. Please log in.' });
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true, name: true, email: true, role: true, status: true,
      phone: true, dob: true, address: true, membershipId: true,
      avatarPath: true, emailVerified: true, createdAt: true,
    },
  });

  res.json({ user });
});
