import { Router } from 'express';
import { register, verifyEmail, login, logout, refresh, forgotPassword, resetPassword, getMe } from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.js';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../schemas/auth.schema.js';
import { auth } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.use(authLimiter);

router.post('/register', validate(registerSchema), register);
router.get('/verify-email', verifyEmail);
router.post('/login', validate(loginSchema), login);
router.post('/logout', auth, logout);
router.post('/refresh', refresh);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);
router.get('/me', auth, getMe);

export default router;
