import { z } from 'zod';

export const createOrderSchema = z.object({
  amount: z.number().int().positive(),
  description: z.string().max(200).optional(),
});

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});
