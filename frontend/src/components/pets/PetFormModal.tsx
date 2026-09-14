import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../common/Modal.js';
import { Pet } from '../../types/index.js';

const petFormSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên thú cưng').max(50),
  species: z.enum(['DOG', 'CAT', 'OTHER']),
  breed: z.string().min(1, 'Vui lòng nhập giống thú cưng').max(50),
  gender: z.enum(['MALE', 'FEMALE', 'UNKNOWN']),
  birthDate: z.string().optional().nullable(),
  age: z.coerce.number().min(0, 'Tuổi không thể âm').optional().nullable(),
  weight: z.coerce.number().min(0, 'Cân nặng không thể âm').optional().nullable(),
  color: z.string().max(50).optional().nullable(),
  avatar: z.string().url('Đường dẫn ảnh không hợp lệ').or(z.literal('')).optional().nullable(),
  microchipId: z.string().max(50).optional().nullable(),
  healthStatus: z.enum(['HEALTHY', 'SICK', 'RECOVERING', 'CHRONIC', 'UNKNOWN']),
  notes: z.string().max(500).optional().nullable(),
});

type PetFormValues = z.infer<typeof petFormSchema>;

interface PetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: PetFormValues) => Promise<void>;
  initialData?: Pet | null;
  isLoading?: boolean;
}

export const PetFormModal: React.FC<PetFormModalProps> = ({
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
  } = useForm<PetFormValues>({
    resolver: zodResolver(petFormSchema),
    defaultValues: {
      name: '',
      species: 'DOG',
      breed: '',
      gender: 'UNKNOWN',
      birthDate: '',
      age: 0,
      weight: 0,
      color: '',
      avatar: '',
      microchipId: '',
      healthStatus: 'HEALTHY',
      notes: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        species: initialData.species,
        breed: initialData.breed,
        gender: initialData.gender,
        birthDate: initialData.birthDate ? initialData.birthDate.split('T')[0] : '',
        age: initialData.age ?? 0,
        weight: initialData.weight ?? 0,
        color: initialData.color || '',
        avatar: initialData.avatar || '',
        microchipId: initialData.microchipId || '',
        healthStatus: initialData.healthStatus,
        notes: initialData.notes || '',
      });
    } else {
      reset({
        name: '',
        species: 'DOG',
        breed: '',
        gender: 'UNKNOWN',
        birthDate: '',
        age: 0,
        weight: 0,
        color: '',
        avatar: '',
        microchipId: '',
        healthStatus: 'HEALTHY',
        notes: '',
      });
    }
  }, [initialData, reset, isOpen]);

  const handleFormSubmit = async (values: PetFormValues) => {
    await onSubmit(values);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Cập nhật thông tin: ${initialData?.name}` : 'Thêm thú cưng mới'}
      subtitle="Quản lý hồ sơ, loài giống và tình trạng sức khỏe ban đầu"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Row 1: Name & Species */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Tên thú cưng <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="VD: Bella, Mimi..."
              {...register('name')}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                errors.name
                  ? 'border-rose-300 focus:ring-rose-200 bg-rose-50/20'
                  : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-100'
              }`}
            />
            {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Loài <span className="text-rose-500">*</span>
            </label>
            <select
              {...register('species')}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 bg-white"
            >
              <option value="DOG">Chó (Dog)</option>
              <option value="CAT">Mèo (Cat)</option>
              <option value="OTHER">Khác (Other)</option>
            </select>
          </div>
        </div>

        {/* Row 2: Breed & Gender */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Giống loài <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="VD: Golden Retriever, Mèo Anh..."
              {...register('breed')}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                errors.breed
                  ? 'border-rose-300 focus:ring-rose-200 bg-rose-50/20'
                  : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-100'
              }`}
            />
            {errors.breed && <p className="text-xs text-rose-500 mt-1">{errors.breed.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Giới tính
            </label>
            <select
              {...register('gender')}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 bg-white"
            >
              <option value="MALE">Đực (Male)</option>
              <option value="FEMALE">Cái (Female)</option>
              <option value="UNKNOWN">Chưa rõ</option>
            </select>
          </div>
        </div>

        {/* Row 3: Age & Weight */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Tuổi (năm)
            </label>
            <input
              type="number"
              step="1"
              min="0"
              placeholder="VD: 2"
              {...register('age')}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Cân nặng (kg)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              placeholder="VD: 24.5"
              {...register('weight')}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
        </div>

        {/* Row 4: Color, Health Status & Microchip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Màu lông
            </label>
            <input
              type="text"
              placeholder="VD: Vàng kim, Xám bạc..."
              {...register('color')}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Trạng thái sức khỏe
            </label>
            <select
              {...register('healthStatus')}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 bg-white"
            >
              <option value="HEALTHY">Khỏe mạnh</option>
              <option value="RECOVERING">Đang hồi phục</option>
              <option value="SICK">Đang ốm</option>
              <option value="CHRONIC">Mãn tính</option>
              <option value="UNKNOWN">Chưa rõ</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Mã Microchip
            </label>
            <input
              type="text"
              placeholder="VD: VN-9820001..."
              {...register('microchipId')}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
        </div>

        {/* Row 5: Avatar Image URL */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Đường dẫn ảnh đại diện (URL)
          </label>
          <input
            type="url"
            placeholder="https://images.unsplash.com/..."
            {...register('avatar')}
            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
              errors.avatar
                ? 'border-rose-300 focus:ring-rose-200 bg-rose-50/20'
                : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-100'
            }`}
          />
          {errors.avatar && <p className="text-xs text-rose-500 mt-1">{errors.avatar.message}</p>}
        </div>

        {/* Row 6: Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Ghi chú / Thói quen đặc biệt
          </label>
          <textarea
            rows={3}
            placeholder="Tính cách, sở thích, thói quen ăn uống..."
            {...register('notes')}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
          >
            {isLoading ? 'Đang lưu...' : isEditing ? 'Cập nhật thú cưng' : 'Thêm thú cưng'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
