import { api } from './api.js';
import { Pet, ApiResponse } from '../types/index.js';

export const petApi = {
  getPets: async (params?: { search?: string; species?: string; healthStatus?: string }) => {
    const res = await api.get<ApiResponse<Pet[]>>('/pets', { params });
    return res.data.data;
  },

  getPetById: async (id: string) => {
    const res = await api.get<ApiResponse<Pet>>(`/pets/${id}`);
    return res.data.data;
  },

  createPet: async (data: Partial<Pet>) => {
    const res = await api.post<ApiResponse<Pet>>('/pets', data);
    return res.data.data;
  },

  updatePet: async (id: string, data: Partial<Pet>) => {
    const res = await api.put<ApiResponse<Pet>>(`/pets/${id}`, data);
    return res.data.data;
  },

  deletePet: async (id: string) => {
    const res = await api.delete<ApiResponse<{ message: string }>>(`/pets/${id}`);
    return res.data.data;
  },
};
