import { z } from 'zod';

export const moodEnum = z.enum(['HAPPY', 'ENERGETIC', 'TIRED', 'ANXIOUS', 'SICK']);

export const createDiarySchema = z.object({
  date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).default(() => new Date().toISOString()),
  title: z.string().min(1, 'Tiêu đề nhật ký không được để trống').max(150),
  content: z.string().min(1, 'Nội dung nhật ký không được để trống').max(2000),
  mood: moodEnum.default('HAPPY'),
  activity: z.string().max(200).optional().nullable(),
  weight: z.number().min(0).optional().nullable(),
  imageUrl: z.string().url('Đường dẫn ảnh không hợp lệ').or(z.literal('')).optional().nullable(),
});

export const updateDiarySchema = createDiarySchema.partial();
