import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { notificationService } from '../services/notification.service.js';
import { sendSuccess } from '../utils/response.js';

export class NotificationController {
  async getNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await notificationService.getNotifications(req.user!.id);
      return sendSuccess(res, result);
    } catch (error) {
      return next(error);
    }
  }

  async markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const notif = await notificationService.markAsRead(req.user!.id, req.params.id);
      return sendSuccess(res, notif, 200, 'Đã đánh dấu đã đọc.');
    } catch (error) {
      return next(error);
    }
  }

  async markAllAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await notificationService.markAllAsRead(req.user!.id);
      return sendSuccess(res, result, 200, 'Đã đánh dấu đọc tất cả thông báo.');
    } catch (error) {
      return next(error);
    }
  }

  async deleteNotification(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await notificationService.deleteNotification(req.user!.id, req.params.id);
      return sendSuccess(res, result, 200, 'Đã xóa thông báo.');
    } catch (error) {
      return next(error);
    }
  }
}

export const notificationController = new NotificationController();
