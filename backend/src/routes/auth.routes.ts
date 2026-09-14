import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { registerSchema, loginSchema, updateProfileSchema, changePasswordSchema } from '../validators/auth.validator.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { authLimiter } from '../middleware/rateLimit.middleware.js';

const router = Router();

router.post('/register', authLimiter, validateRequest(registerSchema), (req, res, next) => authController.register(req, res, next));
router.post('/login', authLimiter, validateRequest(loginSchema), (req, res, next) => authController.login(req, res, next));
router.get('/me', authenticateToken, (req, res, next) => authController.getMe(req, res, next));
router.put('/profile', authenticateToken, validateRequest(updateProfileSchema), (req, res, next) => authController.updateProfile(req, res, next));
router.put('/change-password', authenticateToken, validateRequest(changePasswordSchema), (req, res, next) => authController.changePassword(req, res, next));

export default router;
