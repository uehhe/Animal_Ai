import { Router } from 'express';
import { adminController } from '../controllers/admin.controller.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// Tất cả route Admin bắt buộc đăng nhập VÀ có quyền ADMIN
router.use(authenticateToken);
router.use(requireAdmin);

router.get('/stats', (req, res, next) => adminController.getSystemStats(req, res, next));
router.get('/users', (req, res, next) => adminController.getAllUsers(req, res, next));
router.patch('/users/:id/toggle-status', (req, res, next) => adminController.toggleUserStatus(req, res, next));
router.get('/pets', (req, res, next) => adminController.getAllPets(req, res, next));

export default router;
