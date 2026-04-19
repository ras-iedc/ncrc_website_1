import { Router } from 'express';
import { getProducts, createShopOrder, verifyShopOrder, getMyOrders } from '../controllers/shop.controller.js';
import { auth } from '../middleware/auth.js';
import { requireApproved } from '../middleware/requireApproved.js';
import { validate } from '../middleware/validate.js';
import { createShopOrderSchema, verifyShopOrderSchema } from '../schemas/shop.schema.js';

const router = Router();

router.get('/products', getProducts);

router.use(auth, requireApproved);
router.post('/orders', validate(createShopOrderSchema), createShopOrder);
router.post('/orders/verify', validate(verifyShopOrderSchema), verifyShopOrder);
router.get('/orders/me', getMyOrders);

export default router;
