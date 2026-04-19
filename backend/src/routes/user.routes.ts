import { Router } from 'express';
import { getProfile, updateProfile, uploadAvatar } from '../controllers/user.controller.js';
import { auth } from '../middleware/auth.js';
import { requireApproved } from '../middleware/requireApproved.js';
import { validate } from '../middleware/validate.js';
import { updateProfileSchema } from '../schemas/user.schema.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.use(auth);

router.get('/me', getProfile);
router.patch('/me', validate(updateProfileSchema), updateProfile);
router.post('/me/avatar', requireApproved, upload.single('avatar'), uploadAvatar);

export default router;
