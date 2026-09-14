import React, { useState, useEffect, useCallback } from 'react';
import { Plus, BookOpen } from 'lucide-react';
import { diaryApi } from '../../services/diary.service.js';
import { Diary } from '../../types/index.js';
import { useToast } from '../../contexts/ToastContext.js';
import { usePet } from '../../contexts/PetContext.js';
import { PageHeader } from '../../components/common/PageHeader.js';
import { DiaryModal } from '../../components/diary/DiaryModal.js';
import { ConfirmDialog } from '../../components/common/ConfirmDialog.js';
import { EmptyState } from '../../components/common/EmptyState.js';
import { CardSkeleton } from '../../components/common/LoadingSpinner.js';
import { formatMood } from '../../utils/format.js';
import { formatDateTime } from '../../utils/date.js';

export const DiaryPage: React.FC = () => {
  const { success, error } = useToast();
  const { pets, selectedPetId, selectPet } = usePet();

  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDiary, setEditingDiary] = useState<Diary | null>(null);
  const [deletingDiary, setDeletingDiary] = useState<Diary | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchDiaries = useCallback(async () => {
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
      const data = await diaryApi.getDiaries(selectedPetId);
      setDiaries(data);
    } catch (err: any) {
      error(err.message || 'Lỗi tải nhật ký.');
    } finally {
      setLoading(false);
    }
  }, [selectedPetId, pets, selectPet, error]);

  useEffect(() => {
    fetchDiaries();
  }, [fetchDiaries]);

  const handleSave = async (values: any) => {
    if (!selectedPetId) return;
    setIsSaving(true);
    try {
      if (editingDiary) {
        await diaryApi.updateDiary(editingDiary.id, values);
        success('Cập nhật bài viết thành công!');
      } else {
        await diaryApi.createDiary(selectedPetId, values);
        success('Đăng bài nhật ký mới thành công! 📸');
      }
      setIsModalOpen(false);
      setEditingDiary(null);
      fetchDiaries();
    } catch (err: any) {
      error(err.message || 'Lỗi lưu bài nhật ký');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingDiary) return;
    setIsSaving(true);
    try {
      await diaryApi.deleteDiary(deletingDiary.id);
      success('Đã xóa bài nhật ký.');
      setDeletingDiary(null);
      fetchDiaries();
    } catch (err: any) {
      error(err.message || 'Lỗi xóa bài nhật ký');
    } finally {
      setIsSaving(false);
    }
  };

  const currentPet = pets.find((p) => p.id === selectedPetId);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Nhật Ký Thú Cưng"
        subtitle="Lưu giữ hành trình lớn lên, những kỷ niệm đẹp và trạng thái tâm lý của các bé"
      >
        <button
          onClick={() => {
            setEditingDiary(null);
            setIsModalOpen(true);
          }}
          disabled={!selectedPetId}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Viết nhật ký mới</span>
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

      {/* Diary Timeline Content */}
      {loading ? (
        <CardSkeleton count={2} />
      ) : diaries.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={`Chưa có bài nhật ký nào cho ${currentPet?.name || 'thú cưng'}`}
          description="Lưu lại những khoảnh khắc đáng yêu đầu tiên cùng hình ảnh sinh động."
          actionText="Viết nhật ký ngay"
          onAction={() => {
            setEditingDiary(null);
            setIsModalOpen(true);
          }}
          actionIcon={Plus}
        />
      ) : (
        <div className="max-w-3xl mx-auto space-y-6">
          {diaries.map((diary) => {
            const moodMeta = formatMood(diary.mood);
            return (
              <div
                key={diary.id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
              >
                {diary.imageUrl && (
                  <div className="w-full h-64 sm:h-80 overflow-hidden bg-slate-100">
                    <img
                      src={diary.imageUrl}
                      alt={diary.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}

                <div className="p-6 sm:p-8 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">{formatDateTime(diary.date)}</span>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${moodMeta.color}`}>
                      {moodMeta.label}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900">{diary.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{diary.content}</p>

                  {(diary.activity || diary.weight) && (
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      {diary.activity && <span>🎯 <strong>Hoạt động:</strong> {diary.activity}</span>}
                      {diary.weight && <span>⚖️ <strong>Cân nặng:</strong> {diary.weight} kg</span>}
                    </div>
                  )}

                  <div className="pt-3 flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        setEditingDiary(diary);
                        setIsModalOpen(true);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => setDeletingDiary(diary)}
                      className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Form Modal */}
      <DiaryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingDiary(null);
        }}
        onSubmit={handleSave}
        initialData={editingDiary}
        isLoading={isSaving}
      />

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={!!deletingDiary}
        onClose={() => setDeletingDiary(null)}
        onConfirm={handleDelete}
        title="Xác nhận xóa nhật ký"
        message="Bạn có chắc chắn muốn xóa bài nhật ký này không? Thao tác không thể hoàn tác."
        isLoading={isSaving}
      />
    </div>
  );
};
