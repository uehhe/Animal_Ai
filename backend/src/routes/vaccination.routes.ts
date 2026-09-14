import { Router } from 'express';
import { vaccinationController } from '../controllers/vaccination.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { createVaccinationSchema, updateVaccinationSchema } from '../validators/vaccination.validator.js';

const router = Router();

router.use(authenticateToken);

// Direct /api/vaccinations/:id
router.put('/:id', validateRequest(updateVaccinationSchema), (req, res, next) => vaccinationController.updateVaccination(req, res, next));
router.delete('/:id', (req, res, next) => vaccinationController.deleteVaccination(req, res, next));

export default router;

// Pet-nested router: /api/pets/:petId/vaccinations
export const petVaccinationRouter = Router({ mergeParams: true });
petVaccinationRouter.use(authenticateToken);
petVaccinationRouter.get('/', (req, res, next) => vaccinationController.getVaccinations(req, res, next));
petVaccinationRouter.post('/', validateRequest(createVaccinationSchema), (req, res, next) => vaccinationController.createVaccination(req, res, next));
