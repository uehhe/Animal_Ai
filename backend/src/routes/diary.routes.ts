import { Router } from 'express';
import { diaryController } from '../controllers/diary.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { createDiarySchema, updateDiarySchema } from '../validators/diary.validator.js';

const router = Router();

router.use(authenticateToken);

// Direct /api/diary/:id
router.put('/:id', validateRequest(updateDiarySchema), (req, res, next) => diaryController.updateDiary(req, res, next));
router.delete('/:id', (req, res, next) => diaryController.deleteDiary(req, res, next));

export default router;

// Nested /api/pets/:petId/diary
export const petDiaryRouter = Router({ mergeParams: true });
petDiaryRouter.use(authenticateToken);
petDiaryRouter.get('/', (req, res, next) => diaryController.getDiaries(req, res, next));
petDiaryRouter.post('/', validateRequest(createDiarySchema), (req, res, next) => diaryController.createDiary(req, res, next));
