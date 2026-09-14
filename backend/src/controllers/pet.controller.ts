import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { petService } from '../services/pet.service.js';
import { sendSuccess } from '../utils/response.js';
import { Species, HealthStatus } from '@prisma/client';

export class PetController {
  async getPets(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { search, species, healthStatus } = req.query;
      const filters = {
        search: search as string,
        species: species as Species,
        healthStatus: healthStatus as HealthStatus,
      };
      const pets = await petService.getPets(req.user!.id, filters);
      return sendSuccess(res, pets);
    } catch (error) {
      return next(error);
    }
  }

  async getPetById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const pet = await petService.getPetById(req.user!.id, req.params.id, req.user?.role === 'ADMIN');
      return sendSuccess(res, pet);
    } catch (error) {
      return next(error);
    }
  }

  async createPet(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const pet = await petService.createPet(req.user!.id, req.body);
      return sendSuccess(res, pet, 201, 'Thêm thú cưng mới thành công.');
    } catch (error) {
      return next(error);
    }
  }

  async updatePet(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const pet = await petService.updatePet(req.user!.id, req.params.id, req.body, req.user?.role === 'ADMIN');
      return sendSuccess(res, pet, 200, 'Cập nhật thông tin thú cưng thành công.');
    } catch (error) {
      return next(error);
    }
  }

  async deletePet(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await petService.deletePet(req.user!.id, req.params.id, req.user?.role === 'ADMIN');
      return sendSuccess(res, result, 200, 'Đã xóa thú cưng thành công.');
    } catch (error) {
      return next(error);
    }
  }
}

export const petController = new PetController();
