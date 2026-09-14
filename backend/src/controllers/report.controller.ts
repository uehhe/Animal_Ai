import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { reportService } from '../services/report.service.js';
import { sendSuccess } from '../utils/response.js';

export class ReportController {
  async getDashboardSummary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const petId = req.query.petId as string;
      const data = await reportService.getDashboardSummary(req.user!.id, petId);
      return sendSuccess(res, data);
    } catch (error) {
      return next(error);
    }
  }

  async getHealthReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const petId = req.query.petId as string;
      const range = (req.query.range as string) || '30d';
      const data = await reportService.getHealthReport(req.user!.id, petId, range);
      return sendSuccess(res, data);
    } catch (error) {
      return next(error);
    }
  }

  async getCareReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const petId = req.query.petId as string;
      const range = (req.query.range as string) || '30d';
      const data = await reportService.getCareReport(req.user!.id, petId, range);
      return sendSuccess(res, data);
    } catch (error) {
      return next(error);
    }
  }
}

export const reportController = new ReportController();
