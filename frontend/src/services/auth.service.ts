import { api } from './api.js';
import { User, ApiResponse } from '../types/index.js';

export interface AuthResponseData {
  user: User;
  token: string;
}

export const authApi = {
  login: async (data: { email: string; password: string }) => {
    const res = await api.post<ApiResponse<AuthResponseData>>('/auth/login', data);
    return res.data.data;
  },

  register: async (data: { name: string; email: string; password: string }) => {
    const res = await api.post<ApiResponse<AuthResponseData>>('/auth/register', data);
    return res.data.data;
  },

  getMe: async () => {
    const res = await api.get<ApiResponse<User>>('/auth/me');
    return res.data.data;
  },

  updateProfile: async (data: { name?: string; avatar?: string }) => {
    const res = await api.put<ApiResponse<User>>('/auth/profile', data);
    return res.data.data;
  },

  changePassword: async (data: { oldPassword: string; newPassword: string }) => {
    const res = await api.put<ApiResponse<{ message: string }>>('/auth/change-password', data);
    return res.data.data;
  },
};
