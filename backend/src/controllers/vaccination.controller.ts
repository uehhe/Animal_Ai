import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { vaccinationService } from '../services/vaccination.service.js';
import { sendSuccess } from '../utils/response.js';

export class VaccinationController {
  async getVaccinations(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const vaccinations = await vaccinationService.getVaccinations(req.user!.id, req.params.petId, req.user?.role === 'ADMIN');
      return sendSuccess(res, vaccinations);
    } catch (error) {
      return next(error);
    }
  }

  async createVaccination(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const vac = await vaccinationService.createVaccination(req.user!.id, req.params.petId, req.body, req.user?.role === 'ADMIN');
      return sendSuccess(res, vac, 201, 'Ghi nhận mũi tiêm thành công.');
    } catch (error) {
      return next(error);
    }
  }

  async updateVaccination(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const vac = await vaccinationService.updateVaccination(req.user!.id, req.params.id, req.body, req.user?.role === 'ADMIN');
      return sendSuccess(res, vac, 200, 'Cập nhật mũi tiêm thành công.');
    } catch (error) {
      return next(error);
    }
  }

  async deleteVaccination(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await vaccinationService.deleteVaccination(req.user!.id, req.params.id, req.user?.role === 'ADMIN');
      return sendSuccess(res, result, 200, 'Đã xóa mũi tiêm thành công.');
    } catch (error) {
      return next(error);
    }
  }
}

export const vaccinationController = new VaccinationController();
