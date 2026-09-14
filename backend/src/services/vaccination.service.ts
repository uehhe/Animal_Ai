import { prisma } from '../prisma/client.js';
import { AppError } from '../utils/response.js';
import { VaccinationStatus } from '@prisma/client';

export class VaccinationService {
  async getVaccinations(userId: string, petId: string, isAdmin = false) {
    const pet = await prisma.pet.findUnique({
      where: { id: petId },
      select: { userId: true },
    });

    if (!pet) {
      throw new AppError('Không tìm thấy thú cưng.', 404);
    }

    if (!isAdmin && pet.userId !== userId) {
      throw new AppError('Bạn không có quyền xem thông tin tiêm phòng này.', 403);
    }

    const vaccinations = await prisma.vaccination.findMany({
      where: { petId },
      orderBy: { administeredDate: 'desc' },
    });

    // Tự động kiểm tra và cập nhật trạng thái nếu quá hạn
    const now = new Date();
    return vaccinations.map((vac) => {
      if (vac.status !== 'COMPLETED' && vac.nextDueDate && new Date(vac.nextDueDate) < now) {
        return { ...vac, status: 'OVERDUE' as VaccinationStatus };
      }
      return vac;
    });
  }

  async createVaccination(userId: string, petId: string, data: {
    vaccineName: string;
    administeredDate: string;
    expirationDate?: string | null;
    nextDueDate?: string | null;
    clinicName?: string | null;
    veterinarian?: string | null;
    status?: VaccinationStatus;
    notes?: string | null;
  }, isAdmin = false) {
    const pet = await prisma.pet.findUnique({
      where: { id: petId },
      select: { userId: true, name: true },
    });

    if (!pet) {
      throw new AppError('Không tìm thấy thú cưng.', 404);
    }

    if (!isAdmin && pet.userId !== userId) {
      throw new AppError('Bạn không có quyền thêm tiêm phòng cho thú cưng này.', 403);
    }

    const vac = await prisma.vaccination.create({
      data: {
        petId,
        vaccineName: data.vaccineName.trim(),
        administeredDate: new Date(data.administeredDate),
        expirationDate: data.expirationDate ? new Date(data.expirationDate) : null,
        nextDueDate: data.nextDueDate ? new Date(data.nextDueDate) : null,
        clinicName: data.clinicName?.trim() ?? null,
        veterinarian: data.veterinarian?.trim() ?? null,
        status: data.status || 'COMPLETED',
        notes: data.notes?.trim() ?? null,
      },
    });

    // Nếu có lịch tiêm nhắc trong vòng 30 ngày tới, tự động tạo Notification
    if (data.nextDueDate) {
      const nextDue = new Date(data.nextDueDate);
      const diffDays = Math.ceil((nextDue.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays > 0 && diffDays <= 30) {
        await prisma.notification.create({
          data: {
            userId,
            title: `Lịch tiêm phòng sắp tới: ${pet.name}`,
            message: `${pet.name} có lịch tiêm nhắc lại vaccine ${data.vaccineName} vào ngày ${nextDue.toLocaleDateString('vi-VN')}.`,
            type: 'VACCINATION',
            link: '/vaccinations',
          },
        });
      }
    }

    return vac;
  }

  async updateVaccination(userId: string, id: string, data: Partial<{
    vaccineName?: string;
    administeredDate?: string;
    expirationDate?: string | null;
    nextDueDate?: string | null;
    clinicName?: string | null;
    veterinarian?: string | null;
    status?: VaccinationStatus;
    notes?: string | null;
  }>, isAdmin = false) {
    const vac = await prisma.vaccination.findUnique({
      where: { id },
      include: { pet: { select: { userId: true } } },
    });

    if (!vac) {
      throw new AppError('Không tìm thấy hồ sơ tiêm phòng.', 404);
    }

    if (!isAdmin && vac.pet.userId !== userId) {
      throw new AppError('Bạn không có quyền chỉnh sửa hồ sơ này.', 403);
    }

    return prisma.vaccination.update({
      where: { id },
      data: {
        ...(data.vaccineName && { vaccineName: data.vaccineName.trim() }),
        ...(data.administeredDate && { administeredDate: new Date(data.administeredDate) }),
        ...(data.expirationDate !== undefined && { expirationDate: data.expirationDate ? new Date(data.expirationDate) : null }),
        ...(data.nextDueDate !== undefined && { nextDueDate: data.nextDueDate ? new Date(data.nextDueDate) : null }),
        ...(data.clinicName !== undefined && { clinicName: data.clinicName?.trim() ?? null }),
        ...(data.veterinarian !== undefined && { veterinarian: data.veterinarian?.trim() ?? null }),
        ...(data.status && { status: data.status }),
        ...(data.notes !== undefined && { notes: data.notes?.trim() ?? null }),
      },
    });
  }

  async deleteVaccination(userId: string, id: string, isAdmin = false) {
    const vac = await prisma.vaccination.findUnique({
      where: { id },
      include: { pet: { select: { userId: true } } },
    });

    if (!vac) {
      throw new AppError('Không tìm thấy hồ sơ tiêm phòng để xóa.', 404);
    }

    if (!isAdmin && vac.pet.userId !== userId) {
      throw new AppError('Bạn không có quyền xóa hồ sơ này.', 403);
    }

    await prisma.vaccination.delete({ where: { id } });
    return { message: 'Đã xóa hồ sơ tiêm phòng thành công.' };
  }
}

export const vaccinationService = new VaccinationService();
