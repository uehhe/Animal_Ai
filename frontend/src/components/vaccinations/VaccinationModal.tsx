import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../common/Modal.js';
import { Vaccination } from '../../types/index.js';

const vaccineSchema = z.object({
  vaccineName: z.string().min(1, 'Vui lòng nhập tên vaccine').max(100),
  administeredDate: z.string().min(1, 'Vui lòng chọn ngày tiêm'),
  expirationDate: z.string().optional().nullable(),
  nextDueDate: z.string().optional().nullable(),
  clinicName: z.string().max(100).optional().nullable(),
  veterinarian: z.string().max(100).optional().nullable(),
  status: z.enum(['COMPLETED', 'UPCOMING', 'OVERDUE']),
  notes: z.string().max(500).optional().nullable(),
});

type VaccineFormValues = z.infer<typeof vaccineSchema>;

interface VaccinationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: VaccineFormValues) => Promise<void>;
  initialData?: Vaccination | null;
  isLoading?: boolean;
}

export const VaccinationModal: React.FC<VaccinationModalProps> = ({
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
  } = useForm<VaccineFormValues>({
    resolver: zodResolver(vaccineSchema),
    defaultValues: {
      vaccineName: '',
      administeredDate: new Date().toISOString().split('T')[0],
      expirationDate: '',
      nextDueDate: '',
      clinicName: '',
      veterinarian: '',
      status: 'COMPLETED',
      notes: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        vaccineName: initialData.vaccineName,
        administeredDate: initialData.administeredDate ? initialData.administeredDate.split('T')[0] : '',
        expirationDate: initialData.expirationDate ? initialData.expirationDate.split('T')[0] : '',
        nextDueDate: initialData.nextDueDate ? initialData.nextDueDate.split('T')[0] : '',
        clinicName: initialData.clinicName || '',
        veterinarian: initialData.veterinarian || '',
        status: initialData.status,
        notes: initialData.notes || '',
      });
    } else {
      reset({
        vaccineName: '',
        administeredDate: new Date().toISOString().split('T')[0],
        expirationDate: '',
        nextDueDate: '',
        clinicName: '',
        veterinarian: '',
        status: 'COMPLETED',
        notes: '',
      });
    }
  }, [initialData, reset, isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Chỉnh sửa mũi tiêm phòng' : 'Ghi nhận mũi tiêm vaccine mới'}
      subtitle="Theo dõi lịch tiêm phòng định kỳ và các mũi tiêm phòng dại, 7 bệnh"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Tên loại vaccine <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="VD: Vaccine 7 bệnh Vanguard Plus, Vaccine Dại Rabisin..."
            {...register('vaccineName')}
            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
              errors.vaccineName ? 'border-rose-300' : 'border-slate-200 focus:border-emerald-500'
            }`}
          />
          {errors.vaccineName && <p className="text-xs text-rose-500 mt-1">{errors.vaccineName.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Ngày tiêm <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              {...register('administeredDate')}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Hạn tiêm nhắc lại
            </label>
            <input
              type="date"
              {...register('nextDueDate')}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Trạng thái
            </label>
            <select
              {...register('status')}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 bg-white"
            >
              <option value="COMPLETED">Đã tiêm (Completed)</option>
              <option value="UPCOMING">Sắp đến hạn (Upcoming)</option>
              <option value="OVERDUE">Quá hạn (Overdue)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Bác sĩ thực hiện
            </label>
            <input
              type="text"
              placeholder="BS. Lê Minh Tuấn"
              {...register('veterinarian')}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Cơ sở thú y
          </label>
          <input
            type="text"
            placeholder="Bệnh Viện Thú Y PetCare Hà Nội"
            {...register('clinicName')}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Ghi chú (phản ứng sau tiêm, chỉ dẫn...)
          </label>
          <textarea
            rows={2}
            placeholder="Không sốt, ăn uống bình thường..."
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
            {isLoading ? 'Đang lưu...' : isEditing ? 'Lưu cập nhật' : 'Thêm mũi tiêm'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
