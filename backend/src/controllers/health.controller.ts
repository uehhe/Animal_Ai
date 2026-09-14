import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { healthService } from '../services/health.service.js';
import { sendSuccess } from '../utils/response.js';

export class HealthController {
  async getHealthRecords(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const records = await healthService.getHealthRecords(req.user!.id, req.params.petId, req.user?.role === 'ADMIN');
      return sendSuccess(res, records);
    } catch (error) {
      return next(error);
    }
  }

  async createHealthRecord(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const record = await healthService.createHealthRecord(req.user!.id, req.params.petId, req.body, req.user?.role === 'ADMIN');
      return sendSuccess(res, record, 201, 'Thêm hồ sơ khám bệnh thành công.');
    } catch (error) {
      return next(error);
    }
  }

  async updateHealthRecord(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const record = await healthService.updateHealthRecord(req.user!.id, req.params.id, req.body, req.user?.role === 'ADMIN');
      return sendSuccess(res, record, 200, 'Cập nhật hồ sơ khám bệnh thành công.');
    } catch (error) {
      return next(error);
    }
  }

  async deleteHealthRecord(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await healthService.deleteHealthRecord(req.user!.id, req.params.id, req.user?.role === 'ADMIN');
      return sendSuccess(res, result, 200, 'Đã xóa hồ sơ khám bệnh thành công.');
    } catch (error) {
      return next(error);
    }
  }
}

export const healthController = new HealthController();
