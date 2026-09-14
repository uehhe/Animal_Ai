import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { adminService } from '../services/admin.service.js';
import { sendSuccess } from '../utils/response.js';

export class AdminController {
  async getSystemStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const stats = await adminService.getSystemStats();
      return sendSuccess(res, stats);
    } catch (error) {
      return next(error);
    }
  }

  async getAllUsers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const search = req.query.search as string;
      const users = await adminService.getAllUsers(search);
      return sendSuccess(res, users);
    } catch (error) {
      return next(error);
    }
  }

  async toggleUserStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await adminService.toggleUserStatus(req.user!.id, req.params.id);
      return sendSuccess(res, result);
    } catch (error) {
      return next(error);
    }
  }

  async getAllPets(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const pets = await adminService.getAllPets();
      return sendSuccess(res, pets);
    } catch (error) {
      return next(error);
    }
  }
}

export const adminController = new AdminController();
