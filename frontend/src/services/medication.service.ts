import { api } from './api.js';
import { Medication, ApiResponse } from '../types/index.js';

export const medicationApi = {
  getMedications: async (petId: string) => {
    const res = await api.get<ApiResponse<Medication[]>>(`/pets/${petId}/medications`);
    return res.data.data;
  },

  createMedication: async (petId: string, data: Partial<Medication>) => {
    const res = await api.post<ApiResponse<Medication>>(`/pets/${petId}/medications`, data);
    return res.data.data;
  },

  updateMedication: async (id: string, data: Partial<Medication>) => {
    const res = await api.put<ApiResponse<Medication>>(`/medications/${id}`, data);
    return res.data.data;
  },

  deleteMedication: async (id: string) => {
    const res = await api.delete<ApiResponse<{ message: string }>>(`/medications/${id}`);
    return res.data.data;
  },
};
