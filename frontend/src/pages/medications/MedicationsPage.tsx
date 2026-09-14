import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Pill } from 'lucide-react';
import { medicationApi } from '../../services/medication.service.js';
import { Medication } from '../../types/index.js';
import { useToast } from '../../contexts/ToastContext.js';
import { usePet } from '../../contexts/PetContext.js';
import { PageHeader } from '../../components/common/PageHeader.js';
import { Badge } from '../../components/common/Badge.js';
import { MedicationModal } from '../../components/medications/MedicationModal.js';
import { ConfirmDialog } from '../../components/common/ConfirmDialog.js';
import { EmptyState } from '../../components/common/EmptyState.js';
import { CardSkeleton } from '../../components/common/LoadingSpinner.js';
import { formatMedicationStatus } from '../../utils/format.js';
import { formatDate } from '../../utils/date.js';

export const MedicationsPage: React.FC = () => {
  const { success, error } = useToast();
  const { pets, selectedPetId, selectPet } = usePet();

  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);
  const [deletingMed, setDeletingMed] = useState<Medication | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchMedications = useCallback(async () => {
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
      const data = await medicationApi.getMedications(selectedPetId);
      setMedications(data);
    } catch (err: any) {
      error(err.message || 'Lỗi tải danh sách đơn thuốc.');
    } finally {
      setLoading(false);
    }
  }, [selectedPetId, pets, selectPet, error]);

  useEffect(() => {
    fetchMedications();
  }, [fetchMedications]);

  const handleSave = async (values: any) => {
    if (!selectedPetId) return;
    setIsSaving(true);
    try {
      if (editingMed) {
        await medicationApi.updateMedication(editingMed.id, values);
        success('Cập nhật đơn thuốc thành công!');
      } else {
        await medicationApi.createMedication(selectedPetId, values);
        success('Thêm đơn thuốc mới thành công! 💊');
      }
      setIsModalOpen(false);
      setEditingMed(null);
      fetchMedications();
    } catch (err: any) {
      error(err.message || 'Lỗi lưu đơn thuốc');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingMed) return;
    setIsSaving(true);
    try {
      await medicationApi.deleteMedication(deletingMed.id);
      success('Đã xóa đơn thuốc.');
      setDeletingMed(null);
      fetchMedications();
    } catch (err: any) {
      error(err.message || 'Lỗi xóa đơn thuốc');
    } finally {
      setIsSaving(false);
    }
  };

  const currentPet = pets.find((p) => p.id === selectedPetId);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Quản Lý Đơn Thuốc"
        subtitle="Theo dõi liệu trình dùng thuốc, liều lượng và hướng dẫn sử dụng an toàn"
      >
        <button
          onClick={() => {
            setEditingMed(null);
            setIsModalOpen(true);
          }}
          disabled={!selectedPetId}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Kê đơn thuốc mới</span>
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
      ) : medications.length === 0 ? (
        <EmptyState
          icon={Pill}
          title={`Chưa có đơn thuốc nào cho ${currentPet?.name || 'thú cưng'}`}
          description="Ghi nhận đơn thuốc để theo dõi nhắc giờ uống và liệu trình của bác sĩ."
          actionText="Thêm đơn thuốc ngay"
          onAction={() => {
            setEditingMed(null);
            setIsModalOpen(true);
          }}
          actionIcon={Plus}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {medications.map((med) => {
            const statusMeta = formatMedicationStatus(med.status);
            return (
              <div
                key={med.id}
                className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <h4 className="text-base font-bold text-slate-900">{med.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Liều dùng: <strong className="text-emerald-700">{med.dosage} {med.unit}</strong>
                      </p>
                    </div>
                    <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs text-slate-600 space-y-1">
                    <p>⏰ Tần suất: <strong>{med.frequency}</strong></p>
                    <p>🗓️ Liệu trình: <strong>{formatDate(med.startDate)}</strong> {med.endDate ? `đến ${formatDate(med.endDate)}` : '(Duy trì)'}</p>
                    {med.prescribedBy && <p>👨‍⚕️ Bác sĩ chỉ định: <strong>{med.prescribedBy}</strong></p>}
                  </div>

                  {med.instructions && (
                    <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-100/60 text-xs text-purple-900 leading-relaxed">
                      <strong>Hướng dẫn dùng:</strong> {med.instructions}
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      setEditingMed(med);
                      setIsModalOpen(true);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => setDeletingMed(med)}
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
      <MedicationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingMed(null);
        }}
        onSubmit={handleSave}
        initialData={editingMed}
        isLoading={isSaving}
      />

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={!!deletingMed}
        onClose={() => setDeletingMed(null)}
        onConfirm={handleDelete}
        title="Xác nhận xóa đơn thuốc"
        message="Bạn có chắc chắn muốn xóa đơn thuốc này không? Thao tác không thể hoàn tác."
        isLoading={isSaving}
      />
    </div>
  );
};
