import { Router } from 'express';
import { scheduleController } from '../controllers/schedule.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { createScheduleSchema, updateScheduleSchema } from '../validators/schedule.validator.js';

const router = Router();

router.use(authenticateToken);

// Direct /api/schedules
router.get('/', (req, res, next) => scheduleController.getSchedules(req, res, next));
router.get('/:id', (req, res, next) => scheduleController.getScheduleById(req, res, next));
router.post('/', validateRequest(createScheduleSchema), (req, res, next) => scheduleController.createSchedule(req, res, next));
router.put('/:id', validateRequest(updateScheduleSchema), (req, res, next) => scheduleController.updateSchedule(req, res, next));
router.patch('/:id/complete', (req, res, next) => scheduleController.completeSchedule(req, res, next));
router.delete('/:id', (req, res, next) => scheduleController.deleteSchedule(req, res, next));

export default router;

// Nested /api/pets/:petId/schedules
export const petScheduleRouter = Router({ mergeParams: true });
petScheduleRouter.use(authenticateToken);
petScheduleRouter.get('/', (req, res, next) => scheduleController.getSchedules(req, res, next));
petScheduleRouter.post('/', validateRequest(createScheduleSchema), (req, res, next) => scheduleController.createSchedule(req, res, next));
