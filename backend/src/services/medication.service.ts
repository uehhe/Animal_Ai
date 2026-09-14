import { prisma } from '../prisma/client.js';
import { AppError } from '../utils/response.js';
import { MedicationStatus } from '@prisma/client';

export class MedicationService {
  async getMedications(userId: string, petId: string, isAdmin = false) {
    const pet = await prisma.pet.findUnique({
      where: { id: petId },
      select: { userId: true },
    });

    if (!pet) {
      throw new AppError('Không tìm thấy thú cưng.', 404);
    }

    if (!isAdmin && pet.userId !== userId) {
      throw new AppError('Bạn không có quyền xem thông tin thuốc của thú cưng này.', 403);
    }

    const medications = await prisma.medication.findMany({
      where: { petId },
      orderBy: { startDate: 'desc' },
    });

    // Cập nhật trạng thái EXPIRING_SOON nếu còn <= 3 ngày là hết hạn
    const now = new Date();
    return medications.map((med) => {
      if (med.status === 'ACTIVE' && med.endDate) {
        const diffDays = Math.ceil((new Date(med.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 0) {
          return { ...med, status: 'COMPLETED' as MedicationStatus };
        }
        if (diffDays <= 3) {
          return { ...med, status: 'EXPIRING_SOON' as MedicationStatus };
        }
      }
      return med;
    });
  }

  async createMedication(userId: string, petId: string, data: {
    name: string;
    dosage: string;
    unit: string;
    frequency: string;
    startDate: string;
    endDate?: string | null;
    instructions?: string | null;
    prescribedBy?: string | null;
    status?: MedicationStatus;
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
      throw new AppError('Bạn không có quyền thêm thuốc cho thú cưng này.', 403);
    }

    const med = await prisma.medication.create({
      data: {
        petId,
        name: data.name.trim(),
        dosage: data.dosage.trim(),
        unit: data.unit.trim(),
        frequency: data.frequency.trim(),
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        instructions: data.instructions?.trim() ?? null,
        prescribedBy: data.prescribedBy?.trim() ?? null,
        status: data.status || 'ACTIVE',
        notes: data.notes?.trim() ?? null,
      },
    });

    // Tạo thông báo nhắc nhở uống thuốc
    await prisma.notification.create({
      data: {
        userId,
        title: `Đơn thuốc mới: ${pet.name}`,
        message: `${pet.name} vừa được thêm đơn thuốc "${data.name}" (${data.dosage} ${data.unit}, ${data.frequency}).`,
        type: 'MEDICATION',
        link: '/medications',
      },
    });

    return med;
  }

  async updateMedication(userId: string, id: string, data: Partial<{
    name?: string;
    dosage?: string;
    unit?: string;
    frequency?: string;
    startDate?: string;
    endDate?: string | null;
    instructions?: string | null;
    prescribedBy?: string | null;
    status?: MedicationStatus;
    notes?: string | null;
  }>, isAdmin = false) {
    const med = await prisma.medication.findUnique({
      where: { id },
      include: { pet: { select: { userId: true } } },
    });

    if (!med) {
      throw new AppError('Không tìm thấy đơn thuốc.', 404);
    }

    if (!isAdmin && med.pet.userId !== userId) {
      throw new AppError('Bạn không có quyền chỉnh sửa đơn thuốc này.', 403);
    }

    return prisma.medication.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.dosage && { dosage: data.dosage.trim() }),
        ...(data.unit && { unit: data.unit.trim() }),
        ...(data.frequency && { frequency: data.frequency.trim() }),
        ...(data.startDate && { startDate: new Date(data.startDate) }),
        ...(data.endDate !== undefined && { endDate: data.endDate ? new Date(data.endDate) : null }),
        ...(data.instructions !== undefined && { instructions: data.instructions?.trim() ?? null }),
        ...(data.prescribedBy !== undefined && { prescribedBy: data.prescribedBy?.trim() ?? null }),
        ...(data.status && { status: data.status }),
        ...(data.notes !== undefined && { notes: data.notes?.trim() ?? null }),
      },
    });
  }

  async deleteMedication(userId: string, id: string, isAdmin = false) {
    const med = await prisma.medication.findUnique({
      where: { id },
      include: { pet: { select: { userId: true } } },
    });

    if (!med) {
      throw new AppError('Không tìm thấy đơn thuốc để xóa.', 404);
    }

    if (!isAdmin && med.pet.userId !== userId) {
      throw new AppError('Bạn không có quyền xóa đơn thuốc này.', 403);
    }

    await prisma.medication.delete({ where: { id } });
    return { message: 'Đã xóa đơn thuốc thành công.' };
  }
}

export const medicationService = new MedicationService();
