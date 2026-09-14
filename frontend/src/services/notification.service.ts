import { api } from './api.js';
import { NotificationItem, ApiResponse } from '../types/index.js';

export const notificationApi = {
  getNotifications: async () => {
    const res = await api.get<ApiResponse<{ notifications: NotificationItem[]; unreadCount: number }>>('/notifications');
    return res.data.data;
  },

  markAsRead: async (id: string) => {
    const res = await api.patch<ApiResponse<NotificationItem>>(`/notifications/${id}/read`);
    return res.data.data;
  },

  markAllAsRead: async () => {
    const res = await api.patch<ApiResponse<{ message: string }>>('/notifications/read-all');
    return res.data.data;
  },

  deleteNotification: async (id: string) => {
    const res = await api.delete<ApiResponse<{ message: string }>>(`/notifications/${id}`);
    return res.data.data;
  },
};
