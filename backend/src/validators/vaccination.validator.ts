import { z } from 'zod';

export const createVaccinationSchema = z.object({
  vaccineName: z.string().min(1, 'Tên vaccine không được để trống').max(100),
  administeredDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  expirationDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional().nullable(),
  nextDueDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional().nullable(),
  clinicName: z.string().max(100).optional().nullable(),
  veterinarian: z.string().max(100).optional().nullable(),
  status: z.enum(['COMPLETED', 'UPCOMING', 'OVERDUE']).default('COMPLETED'),
  notes: z.string().max(500).optional().nullable(),
});

export const updateVaccinationSchema = createVaccinationSchema.partial();
