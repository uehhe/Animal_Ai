import { prisma } from '../prisma/client.js';
import { AppError } from '../utils/response.js';

export class AdminService {
  async getSystemStats() {
    const totalUsers = await prisma.user.count();
    const totalPets = await prisma.pet.count();
    const totalSchedules = await prisma.careSchedule.count();
    const totalAIMessages = await prisma.aIMessage.count();
    const totalHealthRecords = await prisma.healthRecord.count();
    const totalVaccinations = await prisma.vaccination.count();

    // Phân loại thú cưng theo loài
    const dogCount = await prisma.pet.count({ where: { species: 'DOG' } });
    const catCount = await prisma.pet.count({ where: { species: 'CAT' } });
    const otherCount = await prisma.pet.count({ where: { species: 'OTHER' } });

    // Hoạt động mới nhất
    const recentUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, name: true, email: true, role: true, createdAt: true, isActive: true },
    });

    return {
      totalUsers,
      totalPets,
      totalSchedules,
      totalAIMessages,
      totalHealthRecords,
      totalVaccinations,
      speciesBreakdown: [
        { name: 'Chó (Dog)', count: dogCount },
        { name: 'Mèo (Cat)', count: catCount },
        { name: 'Khác (Other)', count: otherCount },
      ],
      recentUsers,
    };
  }

  async getAllUsers(search?: string) {
    return prisma.user.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            pets: true,
            aiConversations: true,
          },
        },
      },
    });
  }

  async toggleUserStatus(adminUserId: string, targetUserId: string) {
    if (adminUserId === targetUserId) {
      throw new AppError('Bạn không thể tự khóa tài khoản quản trị của chính mình.', 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!user) {
      throw new AppError('Người dùng không tồn tại.', 404);
    }

    const updated = await prisma.user.update({
      where: { id: targetUserId },
      data: { isActive: !user.isActive },
      select: { id: true, email: true, isActive: true },
    });

    return {
      message: `Tài khoản đã được ${updated.isActive ? 'mở khóa' : 'khóa'} thành công.`,
      user: updated,
    };
  }

  async getAllPets() {
    return prisma.pet.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        _count: {
          select: {
            healthRecords: true,
            vaccinations: true,
            careSchedules: true,
          },
        },
      },
    });
  }
}

export const adminService = new AdminService();
