import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Syringe, Calendar, AlertTriangle } from 'lucide-react';
import { vaccinationApi } from '../../services/vaccination.service.js';
import { Vaccination } from '../../types/index.js';
import { useToast } from '../../contexts/ToastContext.js';
import { usePet } from '../../contexts/PetContext.js';
import { PageHeader } from '../../components/common/PageHeader.js';
import { Badge } from '../../components/common/Badge.js';
import { VaccinationModal } from '../../components/vaccinations/VaccinationModal.js';
import { ConfirmDialog } from '../../components/common/ConfirmDialog.js';
import { EmptyState } from '../../components/common/EmptyState.js';
import { CardSkeleton } from '../../components/common/LoadingSpinner.js';
import { formatVaccinationStatus } from '../../utils/format.js';
import { formatDate } from '../../utils/date.js';

export const VaccinationsPage: React.FC = () => {
  const { success, error } = useToast();
  const { pets, selectedPetId, selectPet } = usePet();

  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVac, setEditingVac] = useState<Vaccination | null>(null);
  const [deletingVac, setDeletingVac] = useState<Vaccination | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchVaccinations = useCallback(async () => {
    if (!selectedPetId) {
      if (pets.length > 0) {
        selectPet(pets[0].id);
      } else {
        setLoading(false);
      }
      return;
    }

    try {
      setLoading(true);
      const data = await vaccinationApi.getVaccinations(selectedPetId);
      setVaccinations(data);
    } catch (err: any) {
      error(err.message || 'Lỗi tải danh sách tiêm phòng.');
    } finally {
      setLoading(false);
    }
  }, [selectedPetId, pets, selectPet, error]);

  useEffect(() => {
    fetchVaccinations();
  }, [fetchVaccinations]);

  const handleSave = async (values: any) => {
    if (!selectedPetId) return;
    setIsSaving(true);
    try {
      if (editingVac) {
        await vaccinationApi.updateVaccination(editingVac.id, values);
        success('Cập nhật mũi tiêm thành công!');
      } else {
        await vaccinationApi.createVaccination(selectedPetId, values);
        success('Ghi nhận mũi tiêm vaccine thành công! 💉');
      }
      setIsModalOpen(false);
      setEditingVac(null);
      fetchVaccinations();
    } catch (err: any) {
      error(err.message || 'Lỗi lưu thông tin tiêm phòng');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingVac) return;
    setIsSaving(true);
    try {
      await vaccinationApi.deleteVaccination(deletingVac.id);
      success('Đã xóa thông tin mũi tiêm.');
      setDeletingVac(null);
      fetchVaccinations();
    } catch (err: any) {
      error(err.message || 'Lỗi xóa mũi tiêm');
    } finally {
      setIsSaving(false);
    }
  };

  const currentPet = pets.find((p) => p.id === selectedPetId);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Quản Lý Tiêm Phòng"
        subtitle="Theo dõi sổ tiêm chủng, ngày tiêm nhắc và các mũi phòng dại, 7 bệnh"
      >
        <button
          onClick={() => {
            setEditingVac(null);
            setIsModalOpen(true);
          }}
          disabled={!selectedPetId}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Ghi nhận mũi tiêm</span>
        </button>
      </PageHeader>

      {/* Pet Selector Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {pets.map((p) => (
          <button
            key={p.id}
            onClick={() => selectPet(p.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold transition-all shrink-0 border ${
              selectedPetId === p.id
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <img
              src={p.avatar || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=100&q=80'}
              alt={p.name}
              className="w-5 h-5 rounded-full object-cover"
            />
            <span>{p.name}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <CardSkeleton count={3} />
      ) : vaccinations.length === 0 ? (
        <EmptyState
          icon={Syringe}
          title={`Chưa có dữ liệu tiêm phòng cho ${currentPet?.name || 'thú cưng'}`}
          description="Ghi nhận các mũi tiêm định kỳ để bảo vệ thú cưng khỏi các bệnh truyền nhiễm nguy hiểm."
          actionText="Thêm mũi tiêm ngay"
          onAction={() => {
            setEditingVac(null);
            setIsModalOpen(true);
          }}
          actionIcon={Plus}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {vaccinations.map((vac) => {
            const statusMeta = formatVaccinationStatus(vac.status);
            return (
              <div
                key={vac.id}
                className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <h4 className="text-base font-bold text-slate-900">{vac.vaccineName}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Ngày tiêm: <strong>{formatDate(vac.administeredDate)}</strong>
                      </p>
                    </div>
                    <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                        Hạn tiêm nhắc lại
                      </span>
                      <span className="font-bold text-emerald-700">
                        {formatDate(vac.nextDueDate)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                        Bác sĩ tiêm
                      </span>
                      <span className="font-semibold text-slate-700 truncate block">
                        {vac.veterinarian || 'Chưa rõ'}
                      </span>
                    </div>
                  </div>

                  {vac.clinicName && (
                    <p className="text-xs text-slate-500">
                      Cơ sở thú y: <strong>{vac.clinicName}</strong>
                    </p>
                  )}

                  {vac.notes && (
                    <p className="text-xs text-slate-500 bg-emerald-50/40 p-2.5 rounded-xl border border-emerald-100/60 leading-relaxed">
                      {vac.notes}
                    </p>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      setEditingVac(vac);
                      setIsModalOpen(true);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => setDeletingVac(vac)}
                    className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Form */}
      <VaccinationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingVac(null);
        }}
        onSubmit={handleSave}
        initialData={editingVac}
        isLoading={isSaving}
      />

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={!!deletingVac}
        onClose={() => setDeletingVac(null)}
        onConfirm={handleDelete}
        title="Xác nhận xóa mũi tiêm"
        message="Bạn có chắc chắn muốn xóa bản ghi tiêm phòng này không? Thao tác không thể hoàn tác."
        isLoading={isSaving}
      />
    </div>
  );
};
