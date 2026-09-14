import { z } from 'zod';

export const createMedicationSchema = z.object({
  name: z.string().min(1, 'Tên thuốc không được để trống').max(100),
  dosage: z.string().min(1, 'Liều lượng không được để trống').max(50),
  unit: z.string().min(1, 'Đơn vị tính không được để trống').max(30),
  frequency: z.string().min(1, 'Tần suất uống thuốc không được để trống').max(100),
  startDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  endDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional().nullable(),
  instructions: z.string().max(500).optional().nullable(),
  prescribedBy: z.string().max(100).optional().nullable(),
  status: z.enum(['ACTIVE', 'EXPIRING_SOON', 'COMPLETED']).default('ACTIVE'),
  notes: z.string().max(500).optional().nullable(),
});

export const updateMedicationSchema = createMedicationSchema.partial();
