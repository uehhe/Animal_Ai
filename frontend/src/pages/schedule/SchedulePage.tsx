import React, { useState, useEffect, useCallback } from 'react';
import { Plus, CalendarClock, CheckCircle2, Clock, Trash2, Edit2 } from 'lucide-react';
import { scheduleApi } from '../../services/schedule.service.js';
import { CareSchedule } from '../../types/index.js';
import { useToast } from '../../contexts/ToastContext.js';
import { usePet } from '../../contexts/PetContext.js';
import { PageHeader } from '../../components/common/PageHeader.js';
import { ScheduleModal } from '../../components/schedules/ScheduleModal.js';
import { ConfirmDialog } from '../../components/common/ConfirmDialog.js';
import { EmptyState } from '../../components/common/EmptyState.js';
import { CardSkeleton } from '../../components/common/LoadingSpinner.js';
import { formatCareType, formatRepeat } from '../../utils/format.js';
import { formatDate } from '../../utils/date.js';

export const SchedulePage: React.FC = () => {
  const { success, error } = useToast();
  const { pets, selectedPetId, selectPet } = usePet();

  const [schedules, setSchedules] = useState<CareSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'today' | 'upcoming'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<CareSchedule | null>(null);
  const [deletingSchedule, setDeletingSchedule] = useState<CareSchedule | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSchedules = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedPetId) params.petId = selectedPetId;
      if (activeFilter !== 'all') params.date = activeFilter;
      if (typeFilter !== 'ALL') params.careType = typeFilter;

      const data = await scheduleApi.getSchedules(params);
      setSchedules(data);
    } catch (err: any) {
      error(err.message || 'Lỗi tải danh sách lịch chăm sóc.');
    } finally {
      setLoading(false);
    }
  }, [selectedPetId, activeFilter, typeFilter, error]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const handleComplete = async (id: string) => {
    try {
      await scheduleApi.completeSchedule(id);
      success('Đã hoàn thành lịch chăm sóc! 🎉');
      fetchSchedules();
    } catch (err: any) {
      error(err.message || 'Lỗi cập nhật lịch');
    }
  };

  const handleSave = async (values: any) => {
    setIsSaving(true);
    try {
      if (editingSchedule) {
        await scheduleApi.updateSchedule(editingSchedule.id, values);
        success('Cập nhật lịch chăm sóc thành công!');
      } else {
        await scheduleApi.createSchedule(values);
        success('Tạo lịch chăm sóc mới thành công! ⏰');
      }
      setIsModalOpen(false);
      setEditingSchedule(null);
      fetchSchedules();
    } catch (err: any) {
      error(err.message || 'Lỗi lưu lịch chăm sóc');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingSchedule) return;
    setIsSaving(true);
    try {
      await scheduleApi.deleteSchedule(deletingSchedule.id);
      success('Đã xóa lịch chăm sóc.');
      setDeletingSchedule(null);
      fetchSchedules();
    } catch (err: any) {
      error(err.message || 'Lỗi xóa lịch');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Lịch Chăm Sóc Thú Cưng"
        subtitle="Quản lý lịch cho ăn, đi dạo, uống thuốc, tắm rửa và các công việc định kỳ"
      >
        <button
          onClick={() => {
            setEditingSchedule(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo lịch mới</span>
        </button>
      </PageHeader>

      {/* Pet Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => selectPet(null)}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 border ${
            !selectedPetId
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          Tất cả ({pets.length})
        </button>
        {pets.map((p) => (
          <button
            key={p.id}
            onClick={() => selectPet(p.id)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 border ${
              selectedPetId === p.id
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <img
              src={p.avatar || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=100&q=80'}
              alt={p.name}
              className="w-4 h-4 rounded-full object-cover"
            />
            <span>{p.name}</span>
          </button>
        ))}
      </div>

      {/* Date & Type Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Date Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100 w-full sm:w-auto">
          <button
            onClick={() => setActiveFilter('all')}
            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeFilter === 'all'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setActiveFilter('today')}
            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeFilter === 'today'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Hôm nay
          </button>
          <button
            onClick={() => setActiveFilter('upcoming')}
            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeFilter === 'upcoming'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sắp tới
          </button>
        </div>

        {/* Care Type Select */}
        <div className="w-full sm:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full sm:w-48 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-500 bg-white"
          >
            <option value="ALL">Tất cả loại hoạt động</option>
            <option value="FEEDING">Cho ăn</option>
            <option value="MEDICATION">Uống thuốc</option>
            <option value="BATHING">Tắm rửa</option>
            <option value="GROOMING">Chải lông</option>
            <option value="NAIL_TRIMMING">Cắt móng</option>
            <option value="WALKING">Đi dạo</option>
            <option value="CLEANING">Vệ sinh</option>
            <option value="VET_VISIT">Khám thú y</option>
            <option value="VACCINATION">Tiêm vaccine</option>
            <option value="OTHER">Khác</option>
          </select>
        </div>
      </div>

      {/* Schedule List */}
      {loading ? (
        <CardSkeleton count={3} />
      ) : schedules.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="Không tìm thấy lịch chăm sóc nào"
          description="Hãy tạo lịch chăm sóc đầu tiên hoặc điều chỉnh bộ lọc để xem các lịch khác."
          actionText="Tạo lịch mới ngay"
          onAction={() => {
            setEditingSchedule(null);
            setIsModalOpen(true);
          }}
          actionIcon={Plus}
        />
      ) : (
        <div className="space-y-3">
          {schedules.map((schedule) => (
            <div
              key={schedule.id}
              className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                schedule.status === 'COMPLETED'
                  ? 'border-slate-200/60 bg-slate-50/50 opacity-75'
                  : 'border-slate-100 shadow-sm hover:border-emerald-200 hover:shadow-md'
              }`}
            >
              <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                    schedule.status === 'COMPLETED'
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Clock className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4
                      className={`text-sm font-bold truncate ${
                        schedule.status === 'COMPLETED'
                          ? 'line-through text-slate-500'
                          : 'text-slate-800'
                      }`}
                    >
                      {schedule.title}
                    </h4>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-semibold border border-emerald-100">
                      {formatCareType(schedule.careType)}
                    </span>
                    {schedule.repeat !== 'NONE' && (
                      <span className="text-[10px] bg-sky-50 text-sky-700 px-2 py-0.5 rounded-md font-semibold border border-sky-100">
                        🔄 {formatRepeat(schedule.repeat)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-600">{schedule.pet?.name}</span>
                    <span>•</span>
                    <span>{formatDate(schedule.scheduledDate)}</span>
                    {schedule.scheduledTime && (
                      <>
                        <span>lúc</span>
                        <strong className="text-slate-700">{schedule.scheduledTime}</strong>
                      </>
                    )}
                    {schedule.notes && (
                      <>
                        <span>•</span>
                        <span className="text-slate-500 italic max-w-xs truncate">{schedule.notes}</span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                {schedule.status === 'COMPLETED' ? (
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Đã hoàn thành
                  </span>
                ) : (
                  <button
                    onClick={() => handleComplete(schedule.id)}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-all shadow-sm shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Hoàn thành</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setEditingSchedule(schedule);
                    setIsModalOpen(true);
                  }}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                  title="Chỉnh sửa"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setDeletingSchedule(schedule)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  title="Xóa"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      <ScheduleModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSchedule(null);
        }}
        onSubmit={handleSave}
        initialData={editingSchedule}
        defaultPetId={selectedPetId || undefined}
        isLoading={isSaving}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingSchedule}
        onClose={() => setDeletingSchedule(null)}
        onConfirm={handleDelete}
        title="Xác nhận xóa lịch chăm sóc"
        message="Bạn có chắc chắn muốn xóa lịch hẹn chăm sóc này không? Thao tác không thể hoàn tác."
        isLoading={isSaving}
      />
    </div>
  );
};
