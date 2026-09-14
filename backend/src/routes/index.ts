import { Router } from 'express';
import authRoutes from './auth.routes.js';
import petRoutes from './pet.routes.js';
import healthRoutes, { petHealthRouter } from './health.routes.js';
import vaccinationRoutes, { petVaccinationRouter } from './vaccination.routes.js';
import medicationRoutes, { petMedicationRouter } from './medication.routes.js';
import scheduleRoutes, { petScheduleRouter } from './schedule.routes.js';
import diaryRoutes, { petDiaryRouter } from './diary.routes.js';
import notificationRoutes from './notification.routes.js';
import reportRoutes from './report.routes.js';
import adminRoutes from './admin.routes.js';
import aiRoutes from '../ai/ai.routes.js';

const router = Router();

// 1. Auth routes
router.use('/auth', authRoutes);

// 2. Nested Pet sub-resources
router.use('/pets/:petId/health', petHealthRouter);
router.use('/pets/:petId/vaccinations', petVaccinationRouter);
router.use('/pets/:petId/medications', petMedicationRouter);
router.use('/pets/:petId/schedules', petScheduleRouter);
router.use('/pets/:petId/diary', petDiaryRouter);

// 3. Flat CRUD resources
router.use('/pets', petRoutes);
router.use('/health', healthRoutes);
router.use('/vaccinations', vaccinationRoutes);
router.use('/medications', medicationRoutes);
router.use('/schedules', scheduleRoutes);
router.use('/diary', diaryRoutes);
router.use('/notifications', notificationRoutes);
router.use('/reports', reportRoutes);
router.use('/admin', adminRoutes);

// 4. AI Assistant
router.use('/ai', aiRoutes);

export default router;
