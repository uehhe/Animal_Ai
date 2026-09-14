import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../common/Modal.js';
import { HealthRecord } from '../../types/index.js';

const healthSchema = z.object({
  date: z.string().min(1, 'Vui lòng chọn ngày khám'),
  weight: z.coerce.number().min(0, 'Cân nặng không thể âm').optional().nullable(),
  temperature: z.coerce.number().min(30, 'Nhiệt độ không hợp lệ').max(45, 'Nhiệt độ không hợp lệ').optional().nullable(),
  symptoms: z.string().max(500).optional().nullable(),
  diagnosis: z.string().min(1, 'Vui lòng nhập chẩn đoán của bác sĩ thú y').max(500),
  treatment: z.string().max(500).optional().nullable(),
  clinicName: z.string().max(100).optional().nullable(),
  veterinarian: z.string().max(100).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

type HealthFormValues = z.infer<typeof healthSchema>;

interface HealthRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: HealthFormValues) => Promise<void>;
  initialData?: HealthRecord | null;
  isLoading?: boolean;
}

export const HealthRecordModal: React.FC<HealthRecordModalProps> = ({
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
  } = useForm<HealthFormValues>({
    resolver: zodResolver(healthSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      weight: 0,
      temperature: 38.5,
      symptoms: '',
      diagnosis: '',
      treatment: '',
      clinicName: '',
      veterinarian: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        date: initialData.date ? initialData.date.split('T')[0] : new Date().toISOString().split('T')[0],
        weight: initialData.weight ?? 0,
        temperature: initialData.temperature ?? 38.5,
        symptoms: initialData.symptoms || '',
        diagnosis: initialData.diagnosis,
        treatment: initialData.treatment || '',
        clinicName: initialData.clinicName || '',
        veterinarian: initialData.veterinarian || '',
        notes: initialData.notes || '',
      });
    } else {
      reset({
        date: new Date().toISOString().split('T')[0],
        weight: 0,
        temperature: 38.5,
        symptoms: '',
        diagnosis: '',
        treatment: '',
        clinicName: '',
        veterinarian: '',
        notes: '',
      });
    }
  }, [initialData, reset, isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Chỉnh sửa hồ sơ khám bệnh' : 'Thêm hồ sơ khám bệnh mới'}
      subtitle="Ghi nhận triệu chứng, chẩn đoán thú y và phác đồ điều trị"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Date & Vitals */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Ngày khám <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              {...register('date')}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
            />
            {errors.date && <p className="text-xs text-rose-500 mt-1">{errors.date.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Cân nặng (kg)
            </label>
            <input
              type="number"
              step="0.1"
              placeholder="VD: 24.5"
              {...register('weight')}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Thân nhiệt (°C)
            </label>
            <input
              type="number"
              step="0.1"
              placeholder="VD: 38.5"
              {...register('temperature')}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Symptoms */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Triệu chứng quan sát được
          </label>
          <input
            type="text"
            placeholder="VD: Gãi tai nhiều, lười ăn, ho nhẹ..."
            {...register('symptoms')}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Diagnosis */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Chẩn đoán của bác sĩ <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="VD: Viêm tai ngoài nhẹ, thể trạng bình thường..."
            {...register('diagnosis')}
            className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none ${
              errors.diagnosis ? 'border-rose-300' : 'border-slate-200 focus:border-emerald-500'
            }`}
          />
          {errors.diagnosis && <p className="text-xs text-rose-500 mt-1">{errors.diagnosis.message}</p>}
        </div>

        {/* Treatment */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Phác đồ điều trị / Hướng dẫn
          </label>
          <textarea
            rows={2}
            placeholder="VD: Nhỏ thuốc tai 2 lần/ngày, kiêng nước vào tai..."
            {...register('treatment')}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Clinic & Vet */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Cơ sở thú y / Bệnh viện
            </label>
            <input
              type="text"
              placeholder="VD: Bệnh Viện Thú Y PetCare"
              {...register('clinicName')}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Bác sĩ khám
            </label>
            <input
              type="text"
              placeholder="VD: BS. Lê Minh Tuấn"
              {...register('veterinarian')}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
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
            {isLoading ? 'Đang lưu...' : isEditing ? 'Lưu cập nhật' : 'Thêm hồ sơ'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
