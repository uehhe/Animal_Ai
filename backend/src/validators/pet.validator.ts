import { z } from 'zod';

export const createPetSchema = z.object({
  name: z.string().min(1, 'Tên thú cưng không được để trống').max(50, 'Tên thú cưng tối đa 50 ký tự'),
  species: z.enum(['DOG', 'CAT', 'OTHER'], {
    errorMap: () => ({ message: 'Loài phải là Chó (DOG), Mèo (CAT) hoặc Khác (OTHER)' }),
  }),
  breed: z.string().min(1, 'Giống thú cưng không được để trống').max(50),
  gender: z.enum(['MALE', 'FEMALE', 'UNKNOWN']).default('UNKNOWN'),
  birthDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional().nullable(),
  age: z.number().int().min(0, 'Tuổi phải lớn hơn hoặc bằng 0').optional().nullable(),
  weight: z.number().min(0, 'Cân nặng phải lớn hơn hoặc bằng 0').optional().nullable(),
  color: z.string().max(50).optional().nullable(),
  avatar: z.string().url('Đường dẫn ảnh không hợp lệ').or(z.literal('')).optional().nullable(),
  microchipId: z.string().max(50).optional().nullable(),
  healthStatus: z.enum(['HEALTHY', 'SICK', 'RECOVERING', 'CHRONIC', 'UNKNOWN']).default('HEALTHY'),
  notes: z.string().max(500).optional().nullable(),
});

export const updatePetSchema = createPetSchema.partial();
