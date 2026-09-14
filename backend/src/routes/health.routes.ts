import { Router } from 'express';
import { healthController } from '../controllers/health.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { createHealthRecordSchema, updateHealthRecordSchema } from '../validators/health.validator.js';

const router = Router();

router.use(authenticateToken);

// Direct /api/health/:id routes
router.put('/:id', validateRequest(updateHealthRecordSchema), (req, res, next) => healthController.updateHealthRecord(req, res, next));
router.delete('/:id', (req, res, next) => healthController.deleteHealthRecord(req, res, next));

export default router;

// Pet-nested router: /api/pets/:petId/health
export const petHealthRouter = Router({ mergeParams: true });
petHealthRouter.use(authenticateToken);
petHealthRouter.get('/', (req, res, next) => healthController.getHealthRecords(req, res, next));
petHealthRouter.post('/', validateRequest(createHealthRecordSchema), (req, res, next) => healthController.createHealthRecord(req, res, next));
