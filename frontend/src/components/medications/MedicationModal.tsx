import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../common/Modal.js';
import { Medication } from '../../types/index.js';

const medSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên thuốc').max(100),
  dosage: z.string().min(1, 'Vui lòng nhập liều lượng').max(50),
  unit: z.string().min(1, 'Vui lòng nhập đơn vị tính').max(30),
  frequency: z.string().min(1, 'Vui lòng nhập tần suất dùng thuốc').max(100),
  startDate: z.string().min(1, 'Vui lòng chọn ngày bắt đầu'),
  endDate: z.string().optional().nullable(),
  instructions: z.string().max(500).optional().nullable(),
  prescribedBy: z.string().max(100).optional().nullable(),
  status: z.enum(['ACTIVE', 'EXPIRING_SOON', 'COMPLETED']),
  notes: z.string().max(500).optional().nullable(),
});

type MedFormValues = z.infer<typeof medSchema>;

interface MedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: MedFormValues) => Promise<void>;
  initialData?: Medication | null;
  isLoading?: boolean;
}

export const MedicationModal: React.FC<MedicationModalProps> = ({
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
  } = useForm<MedFormValues>({
    resolver: zodResolver(medSchema),
    defaultValues: {
      name: '',
      dosage: '',
      unit: 'Viên',
      frequency: '2 lần / ngày sau ăn',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      instructions: '',
      prescribedBy: '',
      status: 'ACTIVE',
      notes: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        dosage: initialData.dosage,
        unit: initialData.unit,
        frequency: initialData.frequency,
        startDate: initialData.startDate ? initialData.startDate.split('T')[0] : '',
        endDate: initialData.endDate ? initialData.endDate.split('T')[0] : '',
        instructions: initialData.instructions || '',
        prescribedBy: initialData.prescribedBy || '',
        status: initialData.status,
        notes: initialData.notes || '',
      });
    } else {
      reset({
        name: '',
        dosage: '1',
        unit: 'Viên',
        frequency: '2 lần / ngày sau ăn',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        instructions: '',
        prescribedBy: '',
        status: 'ACTIVE',
        notes: '',
      });
    }
  }, [initialData, reset, isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Chỉnh sửa đơn thuốc' : 'Thêm đơn thuốc mới'}
      subtitle="Quản lý liều lượng, giờ uống thuốc và chỉ định của bác sĩ"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Tên thuốc / Thực phẩm chức năng <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="VD: Men tiêu hóa Bio-Lactic, Kháng sinh Amox..."
            {...register('name')}
            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none ${
              errors.name ? 'border-rose-300' : 'border-slate-200 focus:border-emerald-500'
            }`}
          />
          {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Liều lượng <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="VD: 1, 2.5..."
              {...register('dosage')}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Đơn vị tính <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="VD: Viên, Gói, Giọt, ml..."
              {...register('unit')}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Tần suất sử dụng <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="VD: 2 lần / ngày (Sáng & Tối sau ăn 30 phút)..."
            {...register('frequency')}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Ngày bắt đầu <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              {...register('startDate')}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Ngày kết thúc
            </label>
            <input
              type="date"
              {...register('endDate')}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Trạng thái
            </label>
            <select
              {...register('status')}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 bg-white"
            >
              <option value="ACTIVE">Đang sử dụng (Active)</option>
              <option value="EXPIRING_SOON">Sắp hết (Expiring soon)</option>
              <option value="COMPLETED">Đã kết thúc (Completed)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Bác sĩ kê đơn
            </label>
            <input
              type="text"
              placeholder="BS. Lê Minh Tuấn"
              {...register('prescribedBy')}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Hướng dẫn cho uống thuốc
          </label>
          <textarea
            rows={2}
            placeholder="Trộn vào thức ăn ướt hoặc hòa với một chút nước ấm..."
            {...register('instructions')}
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
            {isLoading ? 'Đang lưu...' : isEditing ? 'Lưu cập nhật' : 'Thêm đơn thuốc'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
