import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { scheduleService, ScheduleFilters } from '../services/schedule.service.js';
import { sendSuccess } from '../utils/response.js';

export class ScheduleController {
  async getSchedules(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const petId = req.params.petId || (req.query.petId as string);
      const filters: ScheduleFilters = {
        petId: petId || undefined,
        careType: req.query.careType as ScheduleFilters['careType'],
        status: req.query.status as ScheduleFilters['status'],
        date: req.query.date as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
      };

      const schedules = await scheduleService.getSchedules(req.user!.id, filters, req.user?.role === 'ADMIN');
      return sendSuccess(res, schedules);
    } catch (error) {
      return next(error);
    }
  }

  async getScheduleById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const schedule = await scheduleService.getScheduleById(req.user!.id, req.params.id, req.user?.role === 'ADMIN');
      return sendSuccess(res, schedule);
    } catch (error) {
      return next(error);
    }
  }

  async createSchedule(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const petId = req.params.petId || req.body.petId;
      const schedule = await scheduleService.createSchedule(req.user!.id, petId, req.body, req.user?.role === 'ADMIN');
      return sendSuccess(res, schedule, 201, 'Tạo lịch chăm sóc mới thành công.');
    } catch (error) {
      return next(error);
    }
  }

  async updateSchedule(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const schedule = await scheduleService.updateSchedule(req.user!.id, req.params.id, req.body, req.user?.role === 'ADMIN');
      return sendSuccess(res, schedule, 200, 'Cập nhật lịch chăm sóc thành công.');
    } catch (error) {
      return next(error);
    }
  }

  async completeSchedule(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const schedule = await scheduleService.completeSchedule(req.user!.id, req.params.id, req.user?.role === 'ADMIN');
      return sendSuccess(res, schedule, 200, 'Đã đánh dấu hoàn thành lịch chăm sóc.');
    } catch (error) {
      return next(error);
    }
  }

  async deleteSchedule(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await scheduleService.deleteSchedule(req.user!.id, req.params.id, req.user?.role === 'ADMIN');
      return sendSuccess(res, result, 200, 'Đã xóa lịch chăm sóc thành công.');
    } catch (error) {
      return next(error);
    }
  }
}

export const scheduleController = new ScheduleController();
