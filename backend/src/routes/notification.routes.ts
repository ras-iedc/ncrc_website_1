import { Router } from 'express';
import { getNotifications, markRead } from '../controllers/notification.controller.js';
import { auth } from '../middleware/auth.js';

const router = Router();

router.use(auth);
router.get('/', getNotifications);
router.patch('/:id/read', markRead);

export default router;
