import { z } from 'zod';

export const createHealthRecordSchema = z.object({
  date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).default(() => new Date().toISOString()),
  weight: z.number().min(0, 'Cân nặng phải lớn hơn hoặc bằng 0').optional().nullable(),
  temperature: z.number().min(30, 'Nhiệt độ không hợp lệ').max(45, 'Nhiệt độ không hợp lệ').optional().nullable(),
  symptoms: z.string().max(500, 'Triệu chứng tối đa 500 ký tự').optional().nullable(),
  diagnosis: z.string().min(1, 'Chẩn đoán của bác sĩ thú y không được để trống').max(500),
  treatment: z.string().max(500).optional().nullable(),
  clinicName: z.string().max(100).optional().nullable(),
  veterinarian: z.string().max(100).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

export const updateHealthRecordSchema = createHealthRecordSchema.partial();
