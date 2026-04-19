import type { Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { env } from '../config/env.js';
import sharp from 'sharp';
import { fileTypeFromBuffer } from 'file-type';
import fs from 'node:fs';
import path from 'node:path';

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
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

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const { name, phone, dob, address } = req.body;

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: {
      ...(name !== undefined && { name }),
      ...(phone !== undefined && { phone }),
      ...(dob !== undefined && { dob: dob ? new Date(dob) : null }),
      ...(address !== undefined && { address }),
    },
    select: {
      id: true, name: true, email: true, role: true, status: true,
      phone: true, dob: true, address: true, membershipId: true,
      avatarPath: true, createdAt: true,
    },
  });

  res.json({ user });
});

export const uploadAvatar = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }

  // Get buffer — from memory (Vercel) or disk (traditional)
  const buffer = req.file.buffer ?? fs.readFileSync(req.file.path);
  const type = await fileTypeFromBuffer(buffer);
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];

  if (!type || !allowed.includes(type.mime)) {
    if (req.file.path) fs.unlinkSync(req.file.path);
    res.status(400).json({ error: 'Invalid file type' });
    return;
  }

  // Process with sharp — strip EXIF, resize
  const processed = await sharp(buffer)
    .resize(400, 400, { fit: 'cover' })
    .removeAlpha()
    .jpeg({ quality: 80 })
    .toBuffer();

  const filename = `${req.user!.id}-${Date.now()}.jpg`;
  const avatarDir = path.join(env.STORAGE_PATH, 'avatars');
  if (!fs.existsSync(avatarDir)) fs.mkdirSync(avatarDir, { recursive: true });

  const outputPath = path.join(avatarDir, filename);
  fs.writeFileSync(outputPath, processed);
  if (req.file.path) fs.unlinkSync(req.file.path);

  // Delete old avatar
  const existing = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { avatarPath: true },
  });
  if (existing?.avatarPath) {
    const oldPath = path.resolve(existing.avatarPath);
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }

  const relativePath = path.relative('.', outputPath);
  await prisma.user.update({
    where: { id: req.user!.id },
    data: { avatarPath: relativePath },
  });

  res.json({ avatarPath: relativePath });
});
