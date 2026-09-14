import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { aiService } from './ai.service.js';
import { sendSuccess } from '../utils/response.js';

export class AIController {
  async getConversations(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const conversations = await aiService.getConversations(req.user!.id);
      return sendSuccess(res, conversations);
    } catch (error) {
      return next(error);
    }
  }

  async getConversationById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const conversation = await aiService.getConversationById(req.user!.id, req.params.id);
      return sendSuccess(res, conversation);
    } catch (error) {
      return next(error);
    }
  }

  async createConversation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const conversation = await aiService.createConversation(req.user!.id, req.body);
      return sendSuccess(res, conversation, 201, 'Tạo cuộc trò chuyện mới thành công.');
    } catch (error) {
      return next(error);
    }
  }

  async deleteConversation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await aiService.deleteConversation(req.user!.id, req.params.id);
      return sendSuccess(res, result, 200, 'Đã xóa cuộc trò chuyện.');
    } catch (error) {
      return next(error);
    }
  }

  async chat(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await aiService.chat(req.user!.id, req.body);
      return sendSuccess(res, result, 200);
    } catch (error) {
      return next(error);
    }
  }
}

export const aiController = new AIController();
