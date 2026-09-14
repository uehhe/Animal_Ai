import React, { useState, useEffect, useCallback } from 'react';
import { Plus, HeartPulse, Weight, Thermometer, Calendar, AlertCircle } from 'lucide-react';
import { healthApi } from '../../services/health.service.js';
import { petApi } from '../../services/pet.service.js';
import { HealthRecord, Pet } from '../../types/index.js';
import { useToast } from '../../contexts/ToastContext.js';
import { usePet } from '../../contexts/PetContext.js';
import { PageHeader } from '../../components/common/PageHeader.js';
import { HealthRecordModal } from '../../components/health/HealthRecordModal.js';
import { ConfirmDialog } from '../../components/common/ConfirmDialog.js';
import { EmptyState } from '../../components/common/EmptyState.js';
import { CardSkeleton } from '../../components/common/LoadingSpinner.js';
import { formatDate } from '../../utils/date.js';

export const HealthPage: React.FC = () => {
  const { success, error } = useToast();
  const { pets, selectedPetId, selectPet } = usePet();

  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<HealthRecord | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<HealthRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchRecords = useCallback(async () => {
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
      const data = await healthApi.getHealthRecords(selectedPetId);
      setRecords(data);
    } catch (err: any) {
      error(err.message || 'Lỗi tải hồ sơ sức khỏe.');
    } finally {
      setLoading(false);
    }
  }, [selectedPetId, pets, selectPet, error]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleSave = async (values: any) => {
    if (!selectedPetId) return;
    setIsSaving(true);
    try {
      if (editingRecord) {
        await healthApi.updateHealthRecord(editingRecord.id, values);
        success('Cập nhật hồ sơ khám bệnh thành công!');
      } else {
        await healthApi.createHealthRecord(selectedPetId, values);
        success('Ghi nhận hồ sơ khám bệnh thành công! 🩺');
      }
      setIsModalOpen(false);
      setEditingRecord(null);
      fetchRecords();
    } catch (err: any) {
      error(err.message || 'Lỗi lưu thông tin sức khỏe');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingRecord) return;
    setIsSaving(true);
    try {
      await healthApi.deleteHealthRecord(deletingRecord.id);
      success('Đã xóa hồ sơ khám bệnh.');
      setDeletingRecord(null);
      fetchRecords();
    } catch (err: any) {
      error(err.message || 'Lỗi xóa hồ sơ khám bệnh');
    } finally {
      setIsSaving(false);
    }
  };

  const currentPet = pets.find((p) => p.id === selectedPetId);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Quản Lý Sức Khỏe"
        subtitle="Lưu trữ lịch sử khám thú y, theo dõi cân nặng và phác đồ điều trị"
      >
        <button
          onClick={() => {
            setEditingRecord(null);
            setIsModalOpen(true);
          }}
          disabled={!selectedPetId}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm hồ sơ khám</span>
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

      {/* Medical Safety Disclaimer Note */}
      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3 text-amber-900 text-xs leading-relaxed">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Lưu ý y tế quan trọng: </span>
          Mọi chẩn đoán và hướng dẫn điều trị trong hệ thống phải do Bác sĩ Thú y có chuyên môn cung cấp. Trợ lý AI tuyệt đối không tự ý chẩn đoán hay kê đơn thuốc thay thế phòng khám.
        </div>
      </div>

      {/* Health Records List */}
      {loading ? (
        <CardSkeleton count={3} />
      ) : records.length === 0 ? (
        <EmptyState
          icon={HeartPulse}
          title={`Chưa có hồ sơ khám bệnh nào cho ${currentPet?.name || 'thú cưng'}`}
          description="Ghi lại các lần khám sức khỏe định kỳ để theo dõi sát sao thể trạng của bé."
          actionText="Thêm lần khám đầu tiên"
          onAction={() => {
            setEditingRecord(null);
            setIsModalOpen(true);
          }}
          actionIcon={Plus}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {records.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span>{formatDate(r.date)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {r.weight && (
                      <span className="text-xs font-bold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 flex items-center gap-1">
                        <Weight className="w-3.5 h-3.5 text-emerald-600" />
                        {r.weight} kg
                      </span>
                    )}
                    {r.temperature && (
                      <span className="text-xs font-bold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 flex items-center gap-1">
                        <Thermometer className="w-3.5 h-3.5 text-rose-500" />
                        {r.temperature}°C
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-base font-bold text-slate-900">{r.diagnosis}</h4>
                  {r.symptoms && (
                    <p className="text-xs text-slate-500 mt-1">
                      <strong>Triệu chứng:</strong> {r.symptoms}
                    </p>
                  )}
                  {r.treatment && (
                    <div className="mt-2.5 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100/60 text-xs text-emerald-900 leading-relaxed">
                      <strong>Chỉ định điều trị:</strong> {r.treatment}
                    </div>
                  )}
                </div>

                {(r.clinicName || r.veterinarian) && (
                  <p className="text-[11px] text-slate-400 pt-2">
                    Khám tại: <strong>{r.clinicName || 'Phòng khám thú y'}</strong>
                    {r.veterinarian && ` • BS. ${r.veterinarian}`}
                  </p>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    setEditingRecord(r);
                    setIsModalOpen(true);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Sửa
                </button>
                <button
                  onClick={() => setDeletingRecord(r)}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      <HealthRecordModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRecord(null);
        }}
        onSubmit={handleSave}
        initialData={editingRecord}
        isLoading={isSaving}
      />

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={!!deletingRecord}
        onClose={() => setDeletingRecord(null)}
        onConfirm={handleDelete}
        title="Xác nhận xóa hồ sơ khám"
        message="Bạn có chắc chắn muốn xóa bản ghi khám sức khỏe này không? Thao tác không thể hoàn tác."
        isLoading={isSaving}
      />
    </div>
  );
};
