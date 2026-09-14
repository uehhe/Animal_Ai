import { prisma } from '../prisma/client.js';

export class ReportService {
  async getDashboardSummary(userId: string, petId?: string) {
    const petWhere = {
      userId,
      ...(petId && { id: petId }),
    };

    // 1. Thống kê số lượng pet
    const totalPets = await prisma.pet.count({ where: petWhere });

    // 2. Lấy danh sách pet IDs
    const userPets = await prisma.pet.findMany({
      where: petWhere,
      select: { id: true, name: true, species: true, breed: true, avatar: true, healthStatus: true, weight: true },
    });
    const petIds = userPets.map((p) => p.id);

    if (petIds.length === 0) {
      return {
        totalPets: 0,
        todaySchedulesCount: 0,
        upcomingVaccinesCount: 0,
        activeMedicationsCount: 0,
        healthAlertsCount: 0,
        todaySchedules: [],
        upcomingVaccinations: [],
        activeMedications: [],
        recentActivities: [],
        schedulesByDay: [],
        pets: [],
      };
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Lịch hôm nay
    const todaySchedules = await prisma.careSchedule.findMany({
      where: {
        petId: { in: petIds },
        scheduledDate: { gte: startOfToday, lte: endOfToday },
      },
      include: {
        pet: { select: { id: true, name: true, avatar: true, species: true } },
      },
      orderBy: { scheduledTime: 'asc' },
    });

    // Tiêm phòng sắp tới hoặc quá hạn
    const upcomingVaccinations = await prisma.vaccination.findMany({
      where: {
        petId: { in: petIds },
        OR: [
          { status: 'UPCOMING' },
          { nextDueDate: { lte: in30Days } },
        ],
      },
      include: {
        pet: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { nextDueDate: 'asc' },
      take: 5,
    });

    // Đơn thuốc đang sử dụng
    const activeMedications = await prisma.medication.findMany({
      where: {
        petId: { in: petIds },
        status: { in: ['ACTIVE', 'EXPIRING_SOON'] },
      },
      include: {
        pet: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { startDate: 'desc' },
      take: 5,
    });

    // Cảnh báo sức khỏe (thú cưng có healthStatus !== HEALTHY hoặc vaccine quá hạn)
    const healthAlertsCount = userPets.filter((p) => p.healthStatus !== 'HEALTHY').length +
      upcomingVaccinations.filter((v) => v.nextDueDate && new Date(v.nextDueDate) < now).length;

    // Biểu đồ: Lịch chăm sóc 7 ngày gần nhất (Completed vs Pending)
    const schedulesByDay = [];
    const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

      const completed = await prisma.careSchedule.count({
        where: {
          petId: { in: petIds },
          scheduledDate: { gte: dayStart, lte: dayEnd },
          status: 'COMPLETED',
        },
      });

      const pending = await prisma.careSchedule.count({
        where: {
          petId: { in: petIds },
          scheduledDate: { gte: dayStart, lte: dayEnd },
          status: 'PENDING',
        },
      });

      schedulesByDay.push({
        day: daysOfWeek[d.getDay()],
        date: `${d.getDate()}/${d.getMonth() + 1}`,
        completed,
        pending,
      });
    }

    // Hoạt động gần đây (gộp từ Diary và HealthRecord)
    const recentDiaries = await prisma.diary.findMany({
      where: { petId: { in: petIds } },
      orderBy: { date: 'desc' },
      take: 5,
      include: { pet: { select: { name: true } } },
    });

    const recentActivities = recentDiaries.map((d) => ({
      id: d.id,
      title: d.title,
      petName: d.pet.name,
      date: d.date,
      type: 'DIARY',
      content: d.content,
      mood: d.mood,
    }));

    return {
      totalPets,
      todaySchedulesCount: todaySchedules.length,
      upcomingVaccinesCount: upcomingVaccinations.length,
      activeMedicationsCount: activeMedications.length,
      healthAlertsCount,
      todaySchedules,
      upcomingVaccinations,
      activeMedications,
      recentActivities,
      schedulesByDay,
      pets: userPets,
    };
  }

  async getHealthReport(userId: string, petId?: string, range = '30d') {
    const petWhere = {
      userId,
      ...(petId && { id: petId }),
    };

    const userPets = await prisma.pet.findMany({
      where: petWhere,
      select: { id: true, name: true },
    });
    const petIds = userPets.map((p) => p.id);

    const now = new Date();
    let startDate = new Date();
    if (range === '7d') startDate.setDate(now.getDate() - 7);
    else if (range === '30d') startDate.setDate(now.getDate() - 30);
    else if (range === '3m') startDate.setMonth(now.getMonth() - 3);
    else if (range === '6m') startDate.setMonth(now.getMonth() - 6);
    else if (range === '1y') startDate.setFullYear(now.getFullYear() - 1);

    const healthRecords = await prisma.healthRecord.findMany({
      where: {
        petId: { in: petIds },
        date: { gte: startDate },
      },
      include: { pet: { select: { name: true } } },
      orderBy: { date: 'asc' },
    });

    // Nhóm cân nặng theo mốc thời gian để vẽ biểu đồ line
    const weightHistory = healthRecords
      .filter((r) => r.weight !== null)
      .map((r) => ({
        date: new Date(r.date).toLocaleDateString('vi-VN'),
        weight: r.weight,
        petName: r.pet.name,
        diagnosis: r.diagnosis,
      }));

    return {
      healthRecords,
      weightHistory,
      totalVisits: healthRecords.length,
    };
  }

  async getCareReport(userId: string, petId?: string, range = '30d') {
    const petWhere = {
      userId,
      ...(petId && { id: petId }),
    };

    const userPets = await prisma.pet.findMany({
      where: petWhere,
      select: { id: true, name: true },
    });
    const petIds = userPets.map((p) => p.id);

    const now = new Date();
    let startDate = new Date();
    if (range === '7d') startDate.setDate(now.getDate() - 7);
    else if (range === '30d') startDate.setDate(now.getDate() - 30);
    else if (range === '3m') startDate.setMonth(now.getMonth() - 3);
    else if (range === '6m') startDate.setMonth(now.getMonth() - 6);
    else if (range === '1y') startDate.setFullYear(now.getFullYear() - 1);

    const schedules = await prisma.careSchedule.findMany({
      where: {
        petId: { in: petIds },
        scheduledDate: { gte: startDate },
      },
    });

    const total = schedules.length;
    const completed = schedules.filter((s) => s.status === 'COMPLETED').length;
    const pending = schedules.filter((s) => s.status === 'PENDING').length;

    // Phân loại theo CareType
    const byType: Record<string, number> = {};
    schedules.forEach((s) => {
      byType[s.careType] = (byType[s.careType] || 0) + 1;
    });

    const typeDistribution = Object.entries(byType).map(([type, count]) => ({
      type,
      count,
    }));

    return {
      total,
      completed,
      pending,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      typeDistribution,
    };
  }
}

export const reportService = new ReportService();
