import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { validate } from '../middleware/validate.js';
import { updateUserStatusSchema, createInviteSchema, bulkEmailSchema } from '../schemas/admin.schema.js';
import {
  getUsers, updateUser, deleteUser,
  getMembersReport, getPaymentsReport,
  sendBulkEmail, createInvite,
  getFeedback, getAuditLog,
} from '../controllers/admin.controller.js';
import { adminGetProducts, createProduct, updateProduct, deleteProduct } from '../controllers/shop.controller.js';

const router = Router();

router.use(auth, requireRole('ADMIN'));

router.get('/users', getUsers);
router.patch('/users/:id', validate(updateUserStatusSchema), updateUser);
router.delete('/users/:id', deleteUser);
router.get('/reports/members', getMembersReport);
router.get('/reports/payments', getPaymentsReport);
router.post('/email/bulk', validate(bulkEmailSchema), sendBulkEmail);
router.post('/invites', validate(createInviteSchema), createInvite);
router.get('/feedback', getFeedback);
router.get('/audit', getAuditLog);

// Product management
router.get('/products', adminGetProducts);
router.post('/products', createProduct);
router.patch('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

export default router;
