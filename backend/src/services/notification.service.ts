import { prisma } from '../prisma/client.js';
import { AppError } from '../utils/response.js';

export class NotificationService {
  async getNotifications(userId: string) {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false },
    });

    return { notifications, unreadCount };
  }

  async markAsRead(userId: string, id: string) {
    const notif = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notif) {
      throw new AppError('Không tìm thấy thông báo.', 404);
    }

    if (notif.userId !== userId) {
      throw new AppError('Bạn không có quyền truy cập thông báo này.', 403);
    }

    return prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return { message: 'Đã đánh dấu đọc tất cả thông báo.' };
  }

  async deleteNotification(userId: string, id: string) {
    const notif = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notif) {
      throw new AppError('Không tìm thấy thông báo.', 404);
    }

    if (notif.userId !== userId) {
      throw new AppError('Bạn không có quyền xóa thông báo này.', 403);
    }

    await prisma.notification.delete({ where: { id } });
    return { message: 'Đã xóa thông báo thành công.' };
  }
}

export const notificationService = new NotificationService();
