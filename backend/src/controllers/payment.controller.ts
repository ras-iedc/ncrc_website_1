import type { Request, Response } from 'express';
import crypto from 'node:crypto';
import { prisma } from '../config/db.js';
import { razorpay } from '../config/razorpay.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { env } from '../config/env.js';
import { generateInvoice } from '../services/invoice.service.js';
import { sendMail } from '../services/email.service.js';
import { paymentReceiptTemplate } from '../emails/templates.js';
import { logger } from '../config/logger.js';
import path from 'node:path';
import fs from 'node:fs';

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const { amount, description } = req.body;

  const order = await razorpay.orders.create({
    amount,
    currency: 'INR',
    receipt: `rcpt_${Date.now()}`,
  });

  await prisma.pendingPayment.create({
    data: {
      userId: req.user!.id,
      razorpayOrderId: order.id,
      amount,
      currency: 'INR',
      description,
    },
  });

  res.json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    key: env.RAZORPAY_KEY_ID,
  });
});

export const verifyPayment = asyncHandler(async (req: Request, res: Response) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expected = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expected !== razorpay_signature) {
    res.status(400).json({ error: 'Invalid payment signature' });
    return;
  }

  const pending = await prisma.pendingPayment.findUnique({
    where: { razorpayOrderId: razorpay_order_id },
  });

  if (!pending) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: pending.userId },
    select: { name: true, email: true, membershipId: true },
  });

  const payment = await prisma.payment.create({
    data: {
      userId: pending.userId,
      amount: pending.amount,
      currency: pending.currency,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      status: 'CAPTURED',
      description: pending.description,
    },
  });

  // Generate invoice
  const invoicePath = await generateInvoice({
    paymentId: payment.id,
    userId: pending.userId,
    memberName: user!.name,
    membershipId: user!.membershipId || 'N/A',
    amount: pending.amount,
    currency: pending.currency,
    razorpayPaymentId: razorpay_payment_id,
    description: pending.description || 'Membership Payment',
    date: new Date(),
  });

  await prisma.payment.update({
    where: { id: payment.id },
    data: { invoicePath },
  });

  // Delete pending
  await prisma.pendingPayment.delete({ where: { id: pending.id } });

  // Send receipt
  const invoiceLink = `${env.APP_URL}/api/payments/${payment.id}/invoice`;
  await sendMail({
    to: user!.email,
    subject: 'Payment Receipt',
    html: paymentReceiptTemplate(
      user!.name,
      pending.amount,
      razorpay_payment_id,
      pending.description || 'Membership Payment',
      invoiceLink
    ),
  });

  // Create notification
  await prisma.notification.create({
    data: {
      userId: pending.userId,
      title: 'Payment Received',
      message: `Your payment of ₹${(pending.amount / 100).toFixed(2)} has been received.`,
    },
  });

  res.json({ message: 'Payment verified', paymentId: payment.id });
});

export const webhook = asyncHandler(async (req: Request, res: Response) => {
  const signature = req.headers['x-razorpay-signature'] as string;
  if (!signature) {
    res.status(400).json({ error: 'Missing signature' });
    return;
  }

  const body = JSON.stringify(req.body);
  const expected = crypto
    .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
    .update(body)
    .digest('hex');

  if (expected !== signature) {
    res.status(400).json({ error: 'Invalid signature' });
    return;
  }

  const event = req.body.event;
  const paymentEntity = req.body.payload?.payment?.entity;

  if (!paymentEntity) {
    res.json({ status: 'ok' });
    return;
  }

  // Idempotency check
  const existing = await prisma.payment.findUnique({
    where: { razorpayPaymentId: paymentEntity.id },
  });

  if (existing) {
    res.json({ status: 'ok', message: 'Already processed' });
    return;
  }

  if (event === 'payment.captured' || event === 'order.paid') {
    const pending = await prisma.pendingPayment.findUnique({
      where: { razorpayOrderId: paymentEntity.order_id },
    });

    if (pending) {
      await prisma.payment.create({
        data: {
          userId: pending.userId,
          amount: paymentEntity.amount,
          currency: paymentEntity.currency,
          razorpayOrderId: paymentEntity.order_id,
          razorpayPaymentId: paymentEntity.id,
          status: 'CAPTURED',
          description: pending.description,
        },
      });

      await prisma.pendingPayment.delete({ where: { id: pending.id } });
    }
  } else if (event === 'payment.failed') {
    logger.warn({ paymentId: paymentEntity.id, orderId: paymentEntity.order_id }, 'Payment failed webhook');
  }

  res.json({ status: 'ok' });
});

export const getHistory = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where: { userId: req.user!.id },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.payment.count({ where: { userId: req.user!.id } }),
  ]);

  res.json({ payments, total, page, pages: Math.ceil(total / limit) });
});

export const getInvoice = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const payment = await prisma.payment.findUnique({ where: { id } });
  if (!payment || payment.userId !== req.user!.id) {
    res.status(404).json({ error: 'Invoice not found' });
    return;
  }

  if (!payment.invoicePath) {
    res.status(404).json({ error: 'Invoice not generated' });
    return;
  }

  const filePath = path.resolve(payment.invoicePath);
  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: 'Invoice file not found' });
    return;
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="invoice-${id}.pdf"`);
  fs.createReadStream(filePath).pipe(res);
});
