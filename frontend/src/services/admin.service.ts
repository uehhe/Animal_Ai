import { api } from './api.js';
import { User, Pet, ApiResponse } from '../types/index.js';

export interface AdminStats {
  totalUsers: number;
  totalPets: number;
  totalSchedules: number;
  totalAIMessages: number;
  totalHealthRecords: number;
  totalVaccinations: number;
  speciesBreakdown: Array<{ name: string; count: number }>;
  recentUsers: User[];
}

export const adminApi = {
  getStats: async () => {
    const res = await api.get<ApiResponse<AdminStats>>('/admin/stats');
    return res.data.data;
  },

  getUsers: async (search?: string) => {
    const res = await api.get<ApiResponse<User[]>>('/admin/users', { params: { search } });
    return res.data.data;
  },

  toggleUserStatus: async (userId: string) => {
    const res = await api.patch<ApiResponse<{ message: string; user: User }>>(`/admin/users/${userId}/toggle-status`);
    return res.data.data;
  },

  getAllPets: async () => {
    const res = await api.get<ApiResponse<Pet[]>>('/admin/pets');
    return res.data.data;
  },
};
