import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { diaryService } from '../services/diary.service.js';
import { sendSuccess } from '../utils/response.js';

export class DiaryController {
  async getDiaries(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const diaries = await diaryService.getDiaries(req.user!.id, req.params.petId, req.user?.role === 'ADMIN');
      return sendSuccess(res, diaries);
    } catch (error) {
      return next(error);
    }
  }

  async createDiary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const diary = await diaryService.createDiary(req.user!.id, req.params.petId, req.body, req.user?.role === 'ADMIN');
      return sendSuccess(res, diary, 201, 'Thêm nhật ký thành công.');
    } catch (error) {
      return next(error);
    }
  }

  async updateDiary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const diary = await diaryService.updateDiary(req.user!.id, req.params.id, req.body, req.user?.role === 'ADMIN');
      return sendSuccess(res, diary, 200, 'Cập nhật nhật ký thành công.');
    } catch (error) {
      return next(error);
    }
  }

  async deleteDiary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await diaryService.deleteDiary(req.user!.id, req.params.id, req.user?.role === 'ADMIN');
      return sendSuccess(res, result, 200, 'Đã xóa nhật ký thành công.');
    } catch (error) {
      return next(error);
    }
  }
}

export const diaryController = new DiaryController();
