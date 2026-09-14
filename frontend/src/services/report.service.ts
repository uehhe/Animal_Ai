import { api } from './api.js';
import { DashboardSummary, ApiResponse } from '../types/index.js';

export interface HealthReportData {
  healthRecords: any[];
  weightHistory: Array<{ date: string; weight: number; petName: string; diagnosis: string }>;
  totalVisits: number;
}

export interface CareReportData {
  total: number;
  completed: number;
  pending: number;
  completionRate: number;
  typeDistribution: Array<{ type: string; count: number }>;
}

export const reportApi = {
  getDashboardSummary: async (petId?: string) => {
    const res = await api.get<ApiResponse<DashboardSummary>>('/reports/dashboard', {
      params: { petId },
    });
    return res.data.data;
  },

  getHealthReport: async (petId?: string, range = '30d') => {
    const res = await api.get<ApiResponse<HealthReportData>>('/reports/health', {
      params: { petId, range },
    });
    return res.data.data;
  },

  getCareReport: async (petId?: string, range = '30d') => {
    const res = await api.get<ApiResponse<CareReportData>>('/reports/care', {
      params: { petId, range },
    });
    return res.data.data;
  },
};
