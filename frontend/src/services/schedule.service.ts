import { api } from './api.js';
import { CareSchedule, ApiResponse } from '../types/index.js';

export const scheduleApi = {
  getSchedules: async (params?: {
    petId?: string;
    careType?: string;
    status?: string;
    date?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const res = await api.get<ApiResponse<CareSchedule[]>>('/schedules', { params });
    return res.data.data;
  },

  getScheduleById: async (id: string) => {
    const res = await api.get<ApiResponse<CareSchedule>>(`/schedules/${id}`);
    return res.data.data;
  },

  createSchedule: async (data: Partial<CareSchedule>) => {
    const res = await api.post<ApiResponse<CareSchedule>>('/schedules', data);
    return res.data.data;
  },

  updateSchedule: async (id: string, data: Partial<CareSchedule>) => {
    const res = await api.put<ApiResponse<CareSchedule>>(`/schedules/${id}`, data);
    return res.data.data;
  },

  completeSchedule: async (id: string) => {
    const res = await api.patch<ApiResponse<CareSchedule>>(`/schedules/${id}/complete`);
    return res.data.data;
  },

  deleteSchedule: async (id: string) => {
    const res = await api.delete<ApiResponse<{ message: string }>>(`/schedules/${id}`);
    return res.data.data;
  },
};
