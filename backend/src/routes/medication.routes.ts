import { Router } from 'express';
import { medicationController } from '../controllers/medication.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { createMedicationSchema, updateMedicationSchema } from '../validators/medication.validator.js';

const router = Router();

router.use(authenticateToken);

// Direct /api/medications/:id
router.put('/:id', validateRequest(updateMedicationSchema), (req, res, next) => medicationController.updateMedication(req, res, next));
router.delete('/:id', (req, res, next) => medicationController.deleteMedication(req, res, next));

export default router;

// Pet-nested router: /api/pets/:petId/medications
export const petMedicationRouter = Router({ mergeParams: true });
petMedicationRouter.use(authenticateToken);
petMedicationRouter.get('/', (req, res, next) => medicationController.getMedications(req, res, next));
petMedicationRouter.post('/', validateRequest(createMedicationSchema), (req, res, next) => medicationController.createMedication(req, res, next));
