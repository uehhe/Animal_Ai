import { Router } from 'express';
import { reportController } from '../controllers/report.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/dashboard', (req, res, next) => reportController.getDashboardSummary(req, res, next));
router.get('/health', (req, res, next) => reportController.getHealthReport(req, res, next));
router.get('/care', (req, res, next) => reportController.getCareReport(req, res, next));

export default router;
