import { prisma } from '../prisma/client.js';
import { AppError } from '../utils/response.js';
import { CareType, RepeatType, ScheduleStatus, Prisma } from '@prisma/client';

export interface ScheduleFilters {
  petId?: string;
  careType?: CareType;
  status?: ScheduleStatus;
  date?: string; // 'today' | 'upcoming' | YYYY-MM-DD
  startDate?: string;
  endDate?: string;
}

export class ScheduleService {
  async getSchedules(userId: string, filters?: ScheduleFilters, isAdmin = false) {
    const where: Prisma.CareScheduleWhereInput = {
      pet: isAdmin ? undefined : { userId },
      ...(filters?.petId && { petId: filters.petId }),
      ...(filters?.careType && { careType: filters.careType }),
      ...(filters?.status && { status: filters.status }),
    };

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    if (filters?.date === 'today') {
      where.scheduledDate = {
        gte: startOfToday,
        lte: endOfToday,
      };
    } else if (filters?.date === 'upcoming') {
      where.scheduledDate = {
        gte: startOfToday,
      };
    } else if (filters?.startDate && filters?.endDate) {
      where.scheduledDate = {
        gte: new Date(filters.startDate),
        lte: new Date(filters.endDate),
      };
    }

    return prisma.careSchedule.findMany({
      where,
      orderBy: [{ scheduledDate: 'asc' }, { scheduledTime: 'asc' }],
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            breed: true,
            avatar: true,
          },
        },
      },
    });
  }

  async getScheduleById(userId: string, id: string, isAdmin = false) {
    const schedule = await prisma.careSchedule.findUnique({
      where: { id },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            avatar: true,
            userId: true,
          },
        },
      },
    });

    if (!schedule) {
      throw new AppError('Không tìm thấy lịch chăm sóc.', 404);
    }

    if (!isAdmin && schedule.pet.userId !== userId) {
      throw new AppError('Bạn không có quyền truy cập lịch chăm sóc này.', 403);
    }

    return schedule;
  }

  async createSchedule(userId: string, petId: string, data: {
    title: string;
    careType?: CareType;
    scheduledDate: string;
    scheduledTime?: string | null;
    repeat?: RepeatType;
    status?: ScheduleStatus;
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
      throw new AppError('Bạn không có quyền tạo lịch cho thú cưng này.', 403);
    }

    return prisma.careSchedule.create({
      data: {
        petId,
        title: data.title.trim(),
        careType: data.careType || 'OTHER',
        scheduledDate: new Date(data.scheduledDate),
        scheduledTime: data.scheduledTime ?? null,
        repeat: data.repeat || 'NONE',
        status: data.status || 'PENDING',
        notes: data.notes?.trim() ?? null,
      },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            avatar: true,
          },
        },
      },
    });
  }

  async updateSchedule(userId: string, id: string, data: Partial<{
    title?: string;
    careType?: CareType;
    scheduledDate?: string;
    scheduledTime?: string | null;
    repeat?: RepeatType;
    status?: ScheduleStatus;
    notes?: string | null;
  }>, isAdmin = false) {
    const schedule = await prisma.careSchedule.findUnique({
      where: { id },
      include: { pet: { select: { userId: true } } },
    });

    if (!schedule) {
      throw new AppError('Không tìm thấy lịch chăm sóc.', 404);
    }

    if (!isAdmin && schedule.pet.userId !== userId) {
      throw new AppError('Bạn không có quyền chỉnh sửa lịch này.', 403);
    }

    return prisma.careSchedule.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title.trim() }),
        ...(data.careType && { careType: data.careType }),
        ...(data.scheduledDate && { scheduledDate: new Date(data.scheduledDate) }),
        ...(data.scheduledTime !== undefined && { scheduledTime: data.scheduledTime }),
        ...(data.repeat && { repeat: data.repeat }),
        ...(data.status && { status: data.status }),
        ...(data.notes !== undefined && { notes: data.notes?.trim() ?? null }),
      },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            avatar: true,
          },
        },
      },
    });
  }

  async completeSchedule(userId: string, id: string, isAdmin = false) {
    const schedule = await prisma.careSchedule.findUnique({
      where: { id },
      include: { pet: { select: { userId: true, name: true, id: true } } },
    });

    if (!schedule) {
      throw new AppError('Không tìm thấy lịch chăm sóc.', 404);
    }

    if (!isAdmin && schedule.pet.userId !== userId) {
      throw new AppError('Bạn không có quyền thao tác trên lịch này.', 403);
    }

    // Đánh dấu hoàn thành lịch hiện tại
    const updated = await prisma.careSchedule.update({
      where: { id },
      data: { status: 'COMPLETED' },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            avatar: true,
          },
        },
      },
    });

    // Nếu có thiết lập lặp lại, tự động tạo lịch kế tiếp
    if (schedule.repeat !== 'NONE') {
      const nextDate = new Date(schedule.scheduledDate);
      if (schedule.repeat === 'DAILY') {
        nextDate.setDate(nextDate.getDate() + 1);
      } else if (schedule.repeat === 'WEEKLY') {
        nextDate.setDate(nextDate.getDate() + 7);
      } else if (schedule.repeat === 'MONTHLY') {
        nextDate.setMonth(nextDate.getMonth() + 1);
      }

      await prisma.careSchedule.create({
        data: {
          petId: schedule.pet.id,
          title: schedule.title,
          careType: schedule.careType,
          scheduledDate: nextDate,
          scheduledTime: schedule.scheduledTime,
          repeat: schedule.repeat,
          status: 'PENDING',
          notes: schedule.notes,
        },
      });
    }

    return updated;
  }

  async deleteSchedule(userId: string, id: string, isAdmin = false) {
    const schedule = await prisma.careSchedule.findUnique({
      where: { id },
      include: { pet: { select: { userId: true } } },
    });

    if (!schedule) {
      throw new AppError('Không tìm thấy lịch chăm sóc để xóa.', 404);
    }

    if (!isAdmin && schedule.pet.userId !== userId) {
      throw new AppError('Bạn không có quyền xóa lịch này.', 403);
    }

    await prisma.careSchedule.delete({ where: { id } });
    return { message: 'Đã xóa lịch chăm sóc thành công.' };
  }
}

export const scheduleService = new ScheduleService();
