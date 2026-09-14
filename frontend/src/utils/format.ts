import { Species, Gender, HealthStatus, VaccinationStatus, MedicationStatus, CareType, Mood, RepeatType } from '../types/index.js';

export const formatSpecies = (species?: Species): string => {
  switch (species) {
    case 'DOG':
      return 'Chó';
    case 'CAT':
      return 'Mèo';
    case 'OTHER':
    default:
      return 'Khác';
  }
};

export const formatGender = (gender?: Gender): string => {
  switch (gender) {
    case 'MALE':
      return 'Đực';
    case 'FEMALE':
      return 'Cái';
    case 'UNKNOWN':
    default:
      return 'Chưa rõ';
  }
};

export const formatHealthStatus = (status?: HealthStatus): { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'default' } => {
  switch (status) {
    case 'HEALTHY':
      return { label: 'Khỏe mạnh', variant: 'success' };
    case 'RECOVERING':
      return { label: 'Đang hồi phục', variant: 'info' };
    case 'SICK':
      return { label: 'Đang ốm', variant: 'danger' };
    case 'CHRONIC':
      return { label: 'Bệnh mãn tính', variant: 'warning' };
    case 'UNKNOWN':
    default:
      return { label: 'Chưa rõ', variant: 'default' };
  }
};

export const formatVaccinationStatus = (status?: VaccinationStatus): { label: string; variant: 'success' | 'warning' | 'danger' } => {
  switch (status) {
    case 'COMPLETED':
      return { label: 'Đã tiêm', variant: 'success' };
    case 'UPCOMING':
      return { label: 'Sắp đến hạn', variant: 'warning' };
    case 'OVERDUE':
      return { label: 'Quá hạn', variant: 'danger' };
    default:
      return { label: 'Chưa rõ', variant: 'warning' };
  }
};

export const formatMedicationStatus = (status?: MedicationStatus): { label: string; variant: 'success' | 'warning' | 'default' } => {
  switch (status) {
    case 'ACTIVE':
      return { label: 'Đang sử dụng', variant: 'success' };
    case 'EXPIRING_SOON':
      return { label: 'Sắp hết', variant: 'warning' };
    case 'COMPLETED':
      return { label: 'Đã kết thúc', variant: 'default' };
    default:
      return { label: 'Chưa rõ', variant: 'default' };
  }
};

export const formatCareType = (type?: CareType): string => {
  switch (type) {
    case 'FEEDING':
      return 'Cho ăn';
    case 'MEDICATION':
      return 'Uống thuốc';
    case 'BATHING':
      return 'Tắm';
    case 'GROOMING':
      return 'Chải lông';
    case 'NAIL_TRIMMING':
      return 'Cắt móng';
    case 'WALKING':
      return 'Đi dạo';
    case 'CLEANING':
      return 'Vệ sinh';
    case 'VET_VISIT':
      return 'Khám thú y';
    case 'VACCINATION':
      return 'Tiêm vaccine';
    case 'OTHER':
    default:
      return 'Khác';
  }
};

export const formatRepeat = (repeat?: RepeatType): string => {
  switch (repeat) {
    case 'DAILY':
      return 'Hàng ngày';
    case 'WEEKLY':
      return 'Hàng tuần';
    case 'MONTHLY':
      return 'Hàng tháng';
    case 'NONE':
    default:
      return 'Không lặp lại';
  }
};

export const formatMood = (mood?: Mood): { label: string; color: string } => {
  switch (mood) {
    case 'HAPPY':
      return { label: 'Vui vẻ', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
    case 'ENERGETIC':
      return { label: 'Năng động', color: 'text-sky-600 bg-sky-50 border-sky-200' };
    case 'TIRED':
      return { label: 'Mệt mỏi', color: 'text-amber-600 bg-amber-50 border-amber-200' };
    case 'ANXIOUS':
      return { label: 'Lo âu', color: 'text-purple-600 bg-purple-50 border-purple-200' };
    case 'SICK':
      return { label: 'Bị ốm', color: 'text-rose-600 bg-rose-50 border-rose-200' };
    default:
      return { label: 'Bình thường', color: 'text-slate-600 bg-slate-50 border-slate-200' };
  }
};
