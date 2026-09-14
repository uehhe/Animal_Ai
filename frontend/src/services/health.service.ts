import { api } from './api.js';
import { HealthRecord, ApiResponse } from '../types/index.js';

export const healthApi = {
  getHealthRecords: async (petId: string) => {
    const res = await api.get<ApiResponse<HealthRecord[]>>(`/pets/${petId}/health`);
    return res.data.data;
  },

  createHealthRecord: async (petId: string, data: Partial<HealthRecord>) => {
    const res = await api.post<ApiResponse<HealthRecord>>(`/pets/${petId}/health`, data);
    return res.data.data;
  },

  updateHealthRecord: async (id: string, data: Partial<HealthRecord>) => {
    const res = await api.put<ApiResponse<HealthRecord>>(`/health/${id}`, data);
    return res.data.data;
  },

  deleteHealthRecord: async (id: string) => {
    const res = await api.delete<ApiResponse<{ message: string }>>(`/health/${id}`);
    return res.data.data;
  },
};
