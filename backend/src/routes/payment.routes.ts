import { Router } from 'express';
import { createOrder, verifyPayment, webhook, getHistory, getInvoice } from '../controllers/payment.controller.js';
import { auth } from '../middleware/auth.js';
import { requireApproved } from '../middleware/requireApproved.js';
import { validate } from '../middleware/validate.js';
import { createOrderSchema, verifyPaymentSchema } from '../schemas/payment.schema.js';
import { paymentLimiter } from '../middleware/rateLimiter.js';
import express from 'express';

const router = Router();

// Webhook must use raw body — mounted before json parser in app.ts
router.post('/webhook', express.raw({ type: 'application/json' }), webhook);

router.use(auth, requireApproved, paymentLimiter);

router.post('/order', validate(createOrderSchema), createOrder);
router.post('/verify', validate(verifyPaymentSchema), verifyPayment);
router.get('/history', getHistory);
router.get('/:id/invoice', getInvoice);

export default router;
