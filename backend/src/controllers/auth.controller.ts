import type { Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { supabaseAdmin } from '../config/supabase.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { env } from '../config/env.js';
import { generateMembershipId } from '../utils/membershipId.js';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, phone, dob, address } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ error: 'Email already registered' });
    return;
  }

  // Create user in Supabase Auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: false,
    user_metadata: { name },
  });

  if (authError) {
    res.status(400).json({ error: authError.message });
    return;
  }

  // Create user in our database
  await prisma.user.create({
    data: {
      name,
      email,
      supabaseId: authData.user.id,
      phone,
      dob: dob ? new Date(dob) : null,
      address,
    },
  });

  res.status(201).json({ message: 'Registration successful. Please check your email to verify.' });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Sign in via Supabase Auth
  const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password });

  if (error || !data.session) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  // Ensure user exists in our DB
  let user = await prisma.user.findFirst({
    where: { OR: [{ supabaseId: data.user.id }, { email }], deletedAt: null },
    select: { id: true, name: true, email: true, role: true, status: true, supabaseId: true },
  });

  if (!user) {
    // Auto-create from Supabase user (e.g. Google sign-in)
    user = await prisma.user.create({
      data: {
        name: data.user.user_metadata?.name || email.split('@')[0],
        email,
        supabaseId: data.user.id,
        emailVerified: !!data.user.email_confirmed_at,
      },
      select: { id: true, name: true, email: true, role: true, status: true, supabaseId: true },
    });
  } else if (!user.supabaseId) {
    await prisma.user.update({ where: { id: user.id }, data: { supabaseId: data.user.id } });
  }

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    },
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  // Supabase sign out is client-side; we just acknowledge
  res.json({ message: 'Logged out' });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    res.status(401).json({ error: 'Refresh token required' });
    return;
  }

  const { data, error } = await supabaseAdmin.auth.refreshSession({ refresh_token: refreshToken });
  if (error || !data.session) {
    res.status(401).json({ error: 'Invalid or expired refresh token' });
    return;
  }

  res.json({
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
  });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  // Use Supabase password reset — it sends the email
  await supabaseAdmin.auth.resetPasswordForEmail(email, {
    redirectTo: `${env.FRONTEND_URL}/reset-password`,
  });

  res.json({ message: 'If the email exists, a reset link has been sent.' });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { accessToken, password } = req.body;

  // After Supabase redirect, the frontend has a session. Use the access token to update password.
  const { error } = await supabaseAdmin.auth.admin.updateUserById(
    // We need to extract the user ID from the access token
    (await supabaseAdmin.auth.getUser(accessToken)).data.user!.id,
    { password }
  );

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  res.json({ message: 'Password reset successful. Please log in.' });
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  // Supabase handles email verification via its own flow
  // This endpoint can confirm the status in our DB
  const token = req.query.token as string;
  if (!token) {
    res.status(400).json({ error: 'Token required' });
    return;
  }

  // Supabase verification is handled by its own redirect
  res.json({ message: 'Email verification is handled by Supabase Auth redirect.' });
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
