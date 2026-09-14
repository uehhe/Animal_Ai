import { Router } from 'express';
import { petController } from '../controllers/pet.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { createPetSchema, updatePetSchema } from '../validators/pet.validator.js';

const router = Router();

router.use(authenticateToken);

router.get('/', (req, res, next) => petController.getPets(req, res, next));
router.get('/:id', (req, res, next) => petController.getPetById(req, res, next));
router.post('/', validateRequest(createPetSchema), (req, res, next) => petController.createPet(req, res, next));
router.put('/:id', validateRequest(updatePetSchema), (req, res, next) => petController.updatePet(req, res, next));
router.delete('/:id', (req, res, next) => petController.deletePet(req, res, next));

export default router;
