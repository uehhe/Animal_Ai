import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { authService } from '../services/auth.service.js';
import { sendSuccess } from '../utils/response.js';

export class AuthController {
  async register(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      return sendSuccess(res, result, 201, 'Đăng ký tài khoản thành công.');
    } catch (error) {
      return next(error);
    }
  }

  async login(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      return sendSuccess(res, result, 200, 'Đăng nhập thành công.');
    } catch (error) {
      return next(error);
    }
  }

  async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await authService.getCurrentUser(req.user!.id);
      return sendSuccess(res, user, 200);
    } catch (error) {
      return next(error);
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await authService.updateProfile(req.user!.id, req.body);
      return sendSuccess(res, user, 200, 'Cập nhật thông tin hồ sơ thành công.');
    } catch (error) {
      return next(error);
    }
  }

  async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await authService.changePassword(req.user!.id, req.body);
      return sendSuccess(res, result, 200, 'Đổi mật khẩu thành công.');
    } catch (error) {
      return next(error);
    }
  }
}

export const authController = new AuthController();
