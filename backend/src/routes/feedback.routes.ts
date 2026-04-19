import { Router } from 'express';
import { submitFeedback } from '../controllers/feedback.controller.js';
import { auth } from '../middleware/auth.js';
import { requireApproved } from '../middleware/requireApproved.js';
import { validate } from '../middleware/validate.js';
import { feedbackSchema } from '../schemas/feedback.schema.js';

const router = Router();

router.use(auth, requireApproved);
router.post('/', validate(feedbackSchema), submitFeedback);

export default router;
