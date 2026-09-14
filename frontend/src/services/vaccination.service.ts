import { api } from './api.js';
import { Vaccination, ApiResponse } from '../types/index.js';

export const vaccinationApi = {
  getVaccinations: async (petId: string) => {
    const res = await api.get<ApiResponse<Vaccination[]>>(`/pets/${petId}/vaccinations`);
    return res.data.data;
  },

  createVaccination: async (petId: string, data: Partial<Vaccination>) => {
    const res = await api.post<ApiResponse<Vaccination>>(`/pets/${petId}/vaccinations`, data);
    return res.data.data;
  },

  updateVaccination: async (id: string, data: Partial<Vaccination>) => {
    const res = await api.put<ApiResponse<Vaccination>>(`/vaccinations/${id}`, data);
    return res.data.data;
  },

  deleteVaccination: async (id: string) => {
    const res = await api.delete<ApiResponse<{ message: string }>>(`/vaccinations/${id}`);
    return res.data.data;
  },
};
