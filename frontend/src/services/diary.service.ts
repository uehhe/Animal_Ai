import { api } from './api.js';
import { Diary, ApiResponse } from '../types/index.js';

export const diaryApi = {
  getDiaries: async (petId: string) => {
    const res = await api.get<ApiResponse<Diary[]>>(`/pets/${petId}/diary`);
    return res.data.data;
  },

  createDiary: async (petId: string, data: Partial<Diary>) => {
    const res = await api.post<ApiResponse<Diary>>(`/pets/${petId}/diary`, data);
    return res.data.data;
  },

  updateDiary: async (id: string, data: Partial<Diary>) => {
    const res = await api.put<ApiResponse<Diary>>(`/diary/${id}`, data);
    return res.data.data;
  },

  deleteDiary: async (id: string) => {
    const res = await api.delete<ApiResponse<{ message: string }>>(`/diary/${id}`);
    return res.data.data;
  },
};
