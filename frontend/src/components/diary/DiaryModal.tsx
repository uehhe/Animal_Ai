import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../common/Modal.js';
import { Diary } from '../../types/index.js';

const diarySchema = z.object({
  date: z.string().min(1, 'Vui lòng chọn ngày'),
  title: z.string().min(1, 'Vui lòng nhập tiêu đề nhật ký').max(150),
  content: z.string().min(1, 'Vui lòng nhập nội dung nhật ký').max(2000),
  mood: z.enum(['HAPPY', 'ENERGETIC', 'TIRED', 'ANXIOUS', 'SICK']),
  activity: z.string().max(200).optional().nullable(),
  weight: z.coerce.number().min(0).optional().nullable(),
  imageUrl: z.string().url('Đường dẫn ảnh không hợp lệ').or(z.literal('')).optional().nullable(),
});

type DiaryFormValues = z.infer<typeof diarySchema>;

interface DiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: DiaryFormValues) => Promise<void>;
  initialData?: Diary | null;
  isLoading?: boolean;
}

export const DiaryModal: React.FC<DiaryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}) => {
  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DiaryFormValues>({
    resolver: zodResolver(diarySchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      title: '',
      content: '',
      mood: 'HAPPY',
      activity: '',
      weight: 0,
      imageUrl: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        date: initialData.date ? initialData.date.split('T')[0] : '',
        title: initialData.title,
        content: initialData.content,
        mood: initialData.mood,
        activity: initialData.activity || '',
        weight: initialData.weight ?? 0,
        imageUrl: initialData.imageUrl || '',
      });
    } else {
      reset({
        date: new Date().toISOString().split('T')[0],
        title: '',
        content: '',
        mood: 'HAPPY',
        activity: '',
        weight: 0,
        imageUrl: '',
      });
    }
  }, [initialData, reset, isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Chỉnh sửa nhật ký' : 'Viết nhật ký mới'}
      subtitle="Lưu lại những khoảnh khắc, hoạt động và cảm xúc của thú cưng"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Tiêu đề bài viết <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="VD: Buổi chiều chạy nhảy ở công viên Yên Sở..."
            {...register('title')}
            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none ${
              errors.title ? 'border-rose-300' : 'border-slate-200 focus:border-emerald-500'
            }`}
          />
          {errors.title && <p className="text-xs text-rose-500 mt-1">{errors.title.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Ngày ghi chép <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              {...register('date')}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Tâm trạng của bé
            </label>
            <select
              {...register('mood')}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 bg-white"
            >
              <option value="HAPPY">😊 Vui vẻ (Happy)</option>
              <option value="ENERGETIC">⚡ Năng động (Energetic)</option>
              <option value="TIRED">😴 Mệt mỏi (Tired)</option>
              <option value="ANXIOUS">🥺 Lo âu (Anxious)</option>
              <option value="SICK">🤒 Bị ốm (Sick)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Hoạt động nổi bật
            </label>
            <input
              type="text"
              placeholder="Bơi lội, leo trèo, ném bóng..."
              {...register('activity')}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Cân nặng ghi nhận (kg)
            </label>
            <input
              type="number"
              step="0.1"
              placeholder="VD: 24.5"
              {...register('weight')}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Đường dẫn ảnh khoảnh khắc (URL)
          </label>
          <input
            type="url"
            placeholder="https://images.unsplash.com/..."
            {...register('imageUrl')}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Nội dung câu chuyện <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={4}
            placeholder="Hôm nay bé làm quen với bạn cún mới, ăn hết suất cơm..."
            {...register('content')}
            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none ${
              errors.content ? 'border-rose-300' : 'border-slate-200 focus:border-emerald-500'
            }`}
          />
          {errors.content && <p className="text-xs text-rose-500 mt-1">{errors.content.message}</p>}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-emerald-500/20 disabled:opacity-50"
          >
            {isLoading ? 'Đang lưu...' : isEditing ? 'Lưu cập nhật' : 'Đăng nhật ký'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
