import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../common/Modal.js';
import { CareSchedule } from '../../types/index.js';
import { usePet } from '../../contexts/PetContext.js';

const scheduleSchema = z.object({
  petId: z.string().min(1, 'Vui lòng chọn thú cưng'),
  title: z.string().min(1, 'Vui lòng nhập tiêu đề lịch chăm sóc').max(150),
  careType: z.enum([
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
  ]),
  scheduledDate: z.string().min(1, 'Vui lòng chọn ngày'),
  scheduledTime: z.string().optional().nullable(),
  repeat: z.enum(['NONE', 'DAILY', 'WEEKLY', 'MONTHLY']),
  notes: z.string().max(500).optional().nullable(),
});

type ScheduleFormValues = z.infer<typeof scheduleSchema>;

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: ScheduleFormValues) => Promise<void>;
  initialData?: CareSchedule | null;
  defaultPetId?: string;
  isLoading?: boolean;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  defaultPetId,
  isLoading = false,
}) => {
  const isEditing = !!initialData;
  const { pets } = usePet();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      petId: defaultPetId || (pets[0]?.id ?? ''),
      title: '',
      careType: 'OTHER',
      scheduledDate: new Date().toISOString().split('T')[0],
      scheduledTime: '08:00',
      repeat: 'NONE',
      notes: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        petId: initialData.petId,
        title: initialData.title,
        careType: initialData.careType,
        scheduledDate: initialData.scheduledDate ? initialData.scheduledDate.split('T')[0] : '',
        scheduledTime: initialData.scheduledTime || '',
        repeat: initialData.repeat,
        notes: initialData.notes || '',
      });
    } else {
      reset({
        petId: defaultPetId || (pets[0]?.id ?? ''),
        title: '',
        careType: 'FEEDING',
        scheduledDate: new Date().toISOString().split('T')[0],
        scheduledTime: '08:00',
        repeat: 'NONE',
        notes: '',
      });
    }
  }, [initialData, defaultPetId, pets, reset, isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Chỉnh sửa lịch chăm sóc' : 'Tạo lịch chăm sóc mới'}
      subtitle="Đặt lịch cho ăn, đi dạo, tắm rửa hoặc khám bệnh định kỳ"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Select Pet */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Chọn thú cưng <span className="text-rose-500">*</span>
          </label>
          <select
            {...register('petId')}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 bg-white"
          >
            {pets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.breed})
              </option>
            ))}
          </select>
          {errors.petId && <p className="text-xs text-rose-500 mt-1">{errors.petId.message}</p>}
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Tiêu đề lịch trình <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="VD: Dắt Bella đi dạo công viên, Tắm sấy Mimi..."
            {...register('title')}
            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none ${
              errors.title ? 'border-rose-300' : 'border-slate-200 focus:border-emerald-500'
            }`}
          />
          {errors.title && <p className="text-xs text-rose-500 mt-1">{errors.title.message}</p>}
        </div>

        {/* Care Type & Repeat */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Loại hoạt động <span className="text-rose-500">*</span>
            </label>
            <select
              {...register('careType')}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 bg-white"
            >
              <option value="FEEDING">Cho ăn</option>
              <option value="MEDICATION">Uống thuốc</option>
              <option value="BATHING">Tắm rửa</option>
              <option value="GROOMING">Chải lông</option>
              <option value="NAIL_TRIMMING">Cắt móng</option>
              <option value="WALKING">Đi dạo / Vận động</option>
              <option value="CLEANING">Vệ sinh khay/chuồng</option>
              <option value="VET_VISIT">Khám thú y</option>
              <option value="VACCINATION">Tiêm vaccine</option>
              <option value="OTHER">Khác</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Lặp lại
            </label>
            <select
              {...register('repeat')}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 bg-white"
            >
              <option value="NONE">Không lặp lại</option>
              <option value="DAILY">Hàng ngày (Daily)</option>
              <option value="WEEKLY">Hàng tuần (Weekly)</option>
              <option value="MONTHLY">Hàng tháng (Monthly)</option>
            </select>
          </div>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Ngày hẹn <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              {...register('scheduledDate')}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Thời gian (giờ:phút)
            </label>
            <input
              type="time"
              {...register('scheduledTime')}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Ghi chú chi tiết
          </label>
          <textarea
            rows={2}
            placeholder="Khẩu phần ăn 250g, mang theo bóng đồ chơi..."
            {...register('notes')}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
          />
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
            {isLoading ? 'Đang lưu...' : isEditing ? 'Lưu cập nhật' : 'Tạo lịch hẹn'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
