import { prisma } from '../prisma/client.js';
import { AppError } from '../utils/response.js';

export class HealthService {
  async getHealthRecords(userId: string, petId: string, isAdmin = false) {
    const pet = await prisma.pet.findUnique({
      where: { id: petId },
      select: { userId: true },
    });

    if (!pet) {
      throw new AppError('Không tìm thấy thú cưng.', 404);
    }

    if (!isAdmin && pet.userId !== userId) {
      throw new AppError('Bạn không có quyền xem hồ sơ sức khỏe này.', 403);
    }

    return prisma.healthRecord.findMany({
      where: { petId },
      orderBy: { date: 'desc' },
    });
  }

  async createHealthRecord(userId: string, petId: string, data: {
    date: string;
    weight?: number | null;
    temperature?: number | null;
    symptoms?: string | null;
    diagnosis: string;
    treatment?: string | null;
    clinicName?: string | null;
    veterinarian?: string | null;
    notes?: string | null;
  }, isAdmin = false) {
    const pet = await prisma.pet.findUnique({
      where: { id: petId },
      select: { userId: true },
    });

    if (!pet) {
      throw new AppError('Không tìm thấy thú cưng.', 404);
    }

    if (!isAdmin && pet.userId !== userId) {
      throw new AppError('Bạn không có quyền thêm hồ sơ sức khỏe cho thú cưng này.', 403);
    }

    const record = await prisma.healthRecord.create({
      data: {
        petId,
        date: new Date(data.date),
        weight: data.weight ?? null,
        temperature: data.temperature ?? null,
        symptoms: data.symptoms?.trim() ?? null,
        diagnosis: data.diagnosis.trim(),
        treatment: data.treatment?.trim() ?? null,
        clinicName: data.clinicName?.trim() ?? null,
        veterinarian: data.veterinarian?.trim() ?? null,
        notes: data.notes?.trim() ?? null,
      },
    });

    // Cập nhật cân nặng mới nhất cho Pet nếu có ghi nhận
    if (data.weight) {
      await prisma.pet.update({
        where: { id: petId },
        data: { weight: data.weight },
      });
    }

    return record;
  }

  async updateHealthRecord(userId: string, id: string, data: Partial<{
    date?: string;
    weight?: number | null;
    temperature?: number | null;
    symptoms?: string | null;
    diagnosis?: string;
    treatment?: string | null;
    clinicName?: string | null;
    veterinarian?: string | null;
    notes?: string | null;
  }>, isAdmin = false) {
    const record = await prisma.healthRecord.findUnique({
      where: { id },
      include: { pet: { select: { userId: true, id: true } } },
    });

    if (!record) {
      throw new AppError('Không tìm thấy hồ sơ sức khỏe.', 404);
    }

    if (!isAdmin && record.pet.userId !== userId) {
      throw new AppError('Bạn không có quyền chỉnh sửa hồ sơ này.', 403);
    }

    const updated = await prisma.healthRecord.update({
      where: { id },
      data: {
        ...(data.date && { date: new Date(data.date) }),
        ...(data.weight !== undefined && { weight: data.weight }),
        ...(data.temperature !== undefined && { temperature: data.temperature }),
        ...(data.symptoms !== undefined && { symptoms: data.symptoms?.trim() ?? null }),
        ...(data.diagnosis && { diagnosis: data.diagnosis.trim() }),
        ...(data.treatment !== undefined && { treatment: data.treatment?.trim() ?? null }),
        ...(data.clinicName !== undefined && { clinicName: data.clinicName?.trim() ?? null }),
        ...(data.veterinarian !== undefined && { veterinarian: data.veterinarian?.trim() ?? null }),
        ...(data.notes !== undefined && { notes: data.notes?.trim() ?? null }),
      },
    });

    if (data.weight) {
      await prisma.pet.update({
        where: { id: record.pet.id },
        data: { weight: data.weight },
      });
    }

    return updated;
  }

  async deleteHealthRecord(userId: string, id: string, isAdmin = false) {
    const record = await prisma.healthRecord.findUnique({
      where: { id },
      include: { pet: { select: { userId: true } } },
    });

    if (!record) {
      throw new AppError('Không tìm thấy hồ sơ sức khỏe để xóa.', 404);
    }

    if (!isAdmin && record.pet.userId !== userId) {
      throw new AppError('Bạn không có quyền xóa hồ sơ này.', 403);
    }

    await prisma.healthRecord.delete({ where: { id } });
    return { message: 'Đã xóa hồ sơ sức khỏe thành công.' };
  }
}

export const healthService = new HealthService();
