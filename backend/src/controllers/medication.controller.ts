import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { medicationService } from '../services/medication.service.js';
import { sendSuccess } from '../utils/response.js';

export class MedicationController {
  async getMedications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const medications = await medicationService.getMedications(req.user!.id, req.params.petId, req.user?.role === 'ADMIN');
      return sendSuccess(res, medications);
    } catch (error) {
      return next(error);
    }
  }

  async createMedication(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const med = await medicationService.createMedication(req.user!.id, req.params.petId, req.body, req.user?.role === 'ADMIN');
      return sendSuccess(res, med, 201, 'Thêm đơn thuốc thành công.');
    } catch (error) {
      return next(error);
    }
  }

  async updateMedication(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const med = await medicationService.updateMedication(req.user!.id, req.params.id, req.body, req.user?.role === 'ADMIN');
      return sendSuccess(res, med, 200, 'Cập nhật đơn thuốc thành công.');
    } catch (error) {
      return next(error);
    }
  }

  async deleteMedication(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await medicationService.deleteMedication(req.user!.id, req.params.id, req.user?.role === 'ADMIN');
      return sendSuccess(res, result, 200, 'Đã xóa đơn thuốc thành công.');
    } catch (error) {
      return next(error);
    }
  }
}

export const medicationController = new MedicationController();
