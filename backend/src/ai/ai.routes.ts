import { Router } from 'express';
import { aiController } from './ai.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { aiRateLimiter } from '../middleware/rateLimit.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { z } from 'zod';

const router = Router();

const chatSchema = z.object({
  conversationId: z.string().uuid().optional(),
  petId: z.string().uuid().optional(),
  message: z.string().min(1, 'Nội dung tin nhắn không được để trống').max(2000, 'Tin nhắn tối đa 2000 ký tự'),
});

const createConversationSchema = z.object({
  petId: z.string().uuid().optional(),
  title: z.string().max(100).optional(),
});

router.use(authenticateToken);

router.get('/conversations', (req, res, next) => aiController.getConversations(req, res, next));
router.get('/conversations/:id', (req, res, next) => aiController.getConversationById(req, res, next));
router.post('/conversations', validateRequest(createConversationSchema), (req, res, next) => aiController.createConversation(req, res, next));
router.delete('/conversations/:id', (req, res, next) => aiController.deleteConversation(req, res, next));

// Endpoint chat có gắn Rate Limiter bảo vệ
router.post('/chat', aiRateLimiter, validateRequest(chatSchema), (req, res, next) => aiController.chat(req, res, next));

export default router;
