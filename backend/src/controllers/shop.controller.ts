import type { Request, Response } from 'express';
import crypto from 'node:crypto';
import { prisma } from '../config/db.js';
import { razorpay } from '../config/razorpay.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { env } from '../config/env.js';

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const products = await prisma.product.findMany({
    where: { active: true, deletedAt: null },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ products });
});

export const createShopOrder = asyncHandler(async (req: Request, res: Response) => {
  const { items } = req.body;

  const productIds = items.map((i: { productId: string }) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, active: true, deletedAt: null },
  });

  if (products.length !== productIds.length) {
    res.status(400).json({ error: 'Some products are unavailable' });
    return;
  }

  let totalAmount = 0;
  for (const item of items) {
    const product = products.find((p: { id: string; stock: number; price: number; name: string }) => p.id === item.productId)!;
    if (product.stock < item.quantity) {
      res.status(400).json({ error: `Insufficient stock for ${product.name}` });
      return;
    }
    totalAmount += product.price * item.quantity;
  }

  const order = await razorpay.orders.create({
    amount: totalAmount,
    currency: 'INR',
    receipt: `shop_${Date.now()}`,
  });

  const shopOrder = await prisma.shopOrder.create({
    data: {
      userId: req.user!.id,
      totalAmount,
      razorpayOrderId: order.id,
      items: {
        create: items.map((item: { productId: string; quantity: number }) => {
          const product = products.find((p: { id: string; price: number }) => p.id === item.productId)!;
          return {
            productId: item.productId,
            quantity: item.quantity,
            price: product.price,
          };
        }),
      },
    },
  });

  res.json({
    orderId: order.id,
    shopOrderId: shopOrder.id,
    amount: totalAmount,
    currency: 'INR',
    key: env.RAZORPAY_KEY_ID,
  });
});

export const verifyShopOrder = asyncHandler(async (req: Request, res: Response) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expected = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expected !== razorpay_signature) {
    res.status(400).json({ error: 'Invalid signature' });
    return;
  }

  const shopOrder = await prisma.shopOrder.findUnique({
    where: { razorpayOrderId: razorpay_order_id },
    include: { items: true },
  });

  if (!shopOrder) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  // Update stock
  for (const item of shopOrder.items) {
    await prisma.product.update({
      where: { id: item.productId },
      data: { stock: { decrement: item.quantity } },
    });
  }

  await prisma.shopOrder.update({
    where: { id: shopOrder.id },
    data: {
      razorpayPaymentId: razorpay_payment_id,
      status: 'PAID',
    },
  });

  res.json({ message: 'Order confirmed' });
});

export const getMyOrders = asyncHandler(async (req: Request, res: Response) => {
  const orders = await prisma.shopOrder.findMany({
    where: { userId: req.user!.id },
    include: { items: { include: { product: { select: { name: true } } } } },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ orders });
});

// Admin product CRUD
export const adminGetProducts = asyncHandler(async (_req: Request, res: Response) => {
  const products = await prisma.product.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ products });
});

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, price, imageUrl, stock } = req.body;
  const product = await prisma.product.create({
    data: { name, description, price: Number(price), imageUrl, stock: Number(stock) || 0 },
  });
  res.status(201).json({ product });
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { name, description, price, imageUrl, stock, active } = req.body;
  const data: Record<string, unknown> = {};
  if (name !== undefined) data.name = name;
  if (description !== undefined) data.description = description;
  if (price !== undefined) data.price = Number(price);
  if (imageUrl !== undefined) data.imageUrl = imageUrl;
  if (stock !== undefined) data.stock = Number(stock);
  if (active !== undefined) data.active = Boolean(active);
  const product = await prisma.product.update({ where: { id }, data });
  res.json({ product });
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  await prisma.product.update({ where: { id }, data: { deletedAt: new Date(), active: false } });
  res.json({ message: 'Product deleted' });
});
