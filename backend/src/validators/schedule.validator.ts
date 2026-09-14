import { z } from 'zod';

export const careTypeEnum = z.enum([
  'FEEDING',
  'MEDICATION',
  'BATHING',
  'GROOMING',
  'NAIL_TRIMMING',
  'WALKING',
  'CLEANING',
  'VET_VISIT',
  'VACCINATION',
  'OTHER',
]);

export const repeatTypeEnum = z.enum(['NONE', 'DAILY', 'WEEKLY', 'MONTHLY']);
export const scheduleStatusEnum = z.enum(['PENDING', 'COMPLETED', 'CANCELLED']);

export const createScheduleSchema = z.object({
  petId: z.string().uuid('Mã thú cưng không hợp lệ').optional(), // can be in body or route param
  title: z.string().min(1, 'Tiêu đề lịch chăm sóc không được để trống').max(150),
  careType: careTypeEnum.default('OTHER'),
  scheduledDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  scheduledTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Giờ không đúng định dạng (HH:mm)').optional().nullable(),
  repeat: repeatTypeEnum.default('NONE'),
  status: scheduleStatusEnum.default('PENDING'),
  notes: z.string().max(500).optional().nullable(),
});

export const updateScheduleSchema = createScheduleSchema.partial();
