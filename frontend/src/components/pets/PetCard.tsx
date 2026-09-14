import React from 'react';
import { Link } from 'react-router-dom';
import { Pet } from '../../types/index.js';
import { Badge } from '../common/Badge.js';
import { formatSpecies, formatGender, formatHealthStatus } from '../../utils/format.js';
import { Edit2, Trash2, CalendarClock, HeartPulse, Syringe, Pill } from 'lucide-react';

interface PetCardProps {
  pet: Pet;
  onEdit: (pet: Pet) => void;
  onDelete: (pet: Pet) => void;
}

export const PetCard: React.FC<PetCardProps> = ({ pet, onEdit, onDelete }) => {
  const healthMeta = formatHealthStatus(pet.healthStatus);

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        {/* Top: Avatar & Action Buttons */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <Link to={`/pets/${pet.id}`} className="relative shrink-0">
            <img
              src={pet.avatar || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=300&q=80'}
              alt={pet.name}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-500/20 group-hover:ring-emerald-500 transition-all shadow-sm"
            />
          </Link>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(pet)}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              title="Chỉnh sửa thú cưng"
              aria-label={`Chỉnh sửa thông tin ${pet.name}`}
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(pet)}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              title="Xóa thú cưng"
              aria-label={`Xóa thú cưng ${pet.name}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Info */}
        <div>
          <div className="flex items-center justify-between gap-2">
            <Link
              to={`/pets/${pet.id}`}
              className="text-lg font-bold text-slate-900 hover:text-emerald-600 transition-colors truncate"
            >
              {pet.name}
            </Link>
            <Badge variant={healthMeta.variant}>{healthMeta.label}</Badge>
          </div>

          <p className="text-xs text-slate-500 mt-1 font-medium">
            {formatSpecies(pet.species)} • {pet.breed}
          </p>

          <div className="grid grid-cols-2 gap-2 mt-4 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100/80">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Giới tính</span>
              <span className="font-semibold text-slate-700">{formatGender(pet.gender)}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Tuổi</span>
              <span className="font-semibold text-slate-700">{pet.age ? `${pet.age} tuổi` : 'Chưa rõ'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Cân nặng</span>
              <span className="font-semibold text-slate-700">{pet.weight ? `${pet.weight} kg` : 'Chưa rõ'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Màu lông</span>
              <span className="font-semibold text-slate-700 truncate block">{pet.color || 'Chưa rõ'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Metrics & Detail Link */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1" title="Số lịch chăm sóc">
            <CalendarClock className="w-3.5 h-3.5 text-emerald-500" />
            {pet._count?.careSchedules ?? 0}
          </span>
          <span className="flex items-center gap-1" title="Số mũi tiêm vaccine">
            <Syringe className="w-3.5 h-3.5 text-amber-500" />
            {pet._count?.vaccinations ?? 0}
          </span>
          <span className="flex items-center gap-1" title="Đơn thuốc">
            <Pill className="w-3.5 h-3.5 text-purple-500" />
            {pet._count?.medications ?? 0}
          </span>
          <span className="flex items-center gap-1" title="Hồ sơ sức khỏe">
            <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
            {pet._count?.healthRecords ?? 0}
          </span>
        </div>

        <Link
          to={`/pets/${pet.id}`}
          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          Hồ sơ →
        </Link>
      </div>
    </div>
  );
};
