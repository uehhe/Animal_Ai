import { prisma } from '../prisma/client.js';
import { AppError } from '../utils/response.js';
import { Mood } from '@prisma/client';

export class DiaryService {
  async getDiaries(userId: string, petId: string, isAdmin = false) {
    const pet = await prisma.pet.findUnique({
      where: { id: petId },
      select: { userId: true },
    });

    if (!pet) {
      throw new AppError('Không tìm thấy thú cưng.', 404);
    }

    if (!isAdmin && pet.userId !== userId) {
      throw new AppError('Bạn không có quyền xem nhật ký của thú cưng này.', 403);
    }

    return prisma.diary.findMany({
      where: { petId },
      orderBy: { date: 'desc' },
    });
  }

  async createDiary(userId: string, petId: string, data: {
    date?: string;
    title: string;
    content: string;
    mood?: Mood;
    activity?: string | null;
    weight?: number | null;
    imageUrl?: string | null;
  }, isAdmin = false) {
    const pet = await prisma.pet.findUnique({
      where: { id: petId },
      select: { userId: true },
    });

    if (!pet) {
      throw new AppError('Không tìm thấy thú cưng.', 404);
    }

    if (!isAdmin && pet.userId !== userId) {
      throw new AppError('Bạn không có quyền thêm nhật ký cho thú cưng này.', 403);
    }

    const diary = await prisma.diary.create({
      data: {
        petId,
        date: data.date ? new Date(data.date) : new Date(),
        title: data.title.trim(),
        content: data.content.trim(),
        mood: data.mood || 'HAPPY',
        activity: data.activity?.trim() ?? null,
        weight: data.weight ?? null,
        imageUrl: data.imageUrl ?? null,
      },
    });

    // Cập nhật cân nặng nếu có
    if (data.weight) {
      await prisma.pet.update({
        where: { id: petId },
        data: { weight: data.weight },
      });
    }

    return diary;
  }

  async updateDiary(userId: string, id: string, data: Partial<{
    date?: string;
    title?: string;
    content?: string;
    mood?: Mood;
    activity?: string | null;
    weight?: number | null;
    imageUrl?: string | null;
  }>, isAdmin = false) {
    const diary = await prisma.diary.findUnique({
      where: { id },
      include: { pet: { select: { userId: true, id: true } } },
    });

    if (!diary) {
      throw new AppError('Không tìm thấy nhật ký.', 404);
    }

    if (!isAdmin && diary.pet.userId !== userId) {
      throw new AppError('Bạn không có quyền chỉnh sửa nhật ký này.', 403);
    }

    const updated = await prisma.diary.update({
      where: { id },
      data: {
        ...(data.date && { date: new Date(data.date) }),
        ...(data.title && { title: data.title.trim() }),
        ...(data.content && { content: data.content.trim() }),
        ...(data.mood && { mood: data.mood }),
        ...(data.activity !== undefined && { activity: data.activity?.trim() ?? null }),
        ...(data.weight !== undefined && { weight: data.weight }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
      },
    });

    if (data.weight) {
      await prisma.pet.update({
        where: { id: diary.pet.id },
        data: { weight: data.weight },
      });
    }

    return updated;
  }

  async deleteDiary(userId: string, id: string, isAdmin = false) {
    const diary = await prisma.diary.findUnique({
      where: { id },
      include: { pet: { select: { userId: true } } },
    });

    if (!diary) {
      throw new AppError('Không tìm thấy nhật ký để xóa.', 404);
    }

    if (!isAdmin && diary.pet.userId !== userId) {
      throw new AppError('Bạn không có quyền xóa nhật ký này.', 403);
    }

    await prisma.diary.delete({ where: { id } });
    return { message: 'Đã xóa nhật ký thành công.' };
  }
}

export const diaryService = new DiaryService();
