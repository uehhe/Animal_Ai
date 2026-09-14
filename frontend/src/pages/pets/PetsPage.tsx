import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, PawPrint } from 'lucide-react';
import { petApi } from '../../services/pet.service.js';
import { Pet, Species } from '../../types/index.js';
import { useToast } from '../../contexts/ToastContext.js';
import { usePet } from '../../contexts/PetContext.js';
import { PageHeader } from '../../components/common/PageHeader.js';
import { PetCard } from '../../components/pets/PetCard.js';
import { PetFormModal } from '../../components/pets/PetFormModal.js';
import { ConfirmDialog } from '../../components/common/ConfirmDialog.js';
import { CardSkeleton } from '../../components/common/LoadingSpinner.js';
import { EmptyState } from '../../components/common/EmptyState.js';

export const PetsPage: React.FC = () => {
  const { success, error } = useToast();
  const { refreshPets } = usePet();

  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState<string>('ALL');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [deletingPet, setDeletingPet] = useState<Pet | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchPets = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (search.trim()) params.search = search.trim();
      if (speciesFilter !== 'ALL') params.species = speciesFilter;

      const data = await petApi.getPets(params);
      setPets(data);
    } catch (err: any) {
      error(err.message || 'Không thể tải danh sách thú cưng.');
    } finally {
      setLoading(false);
    }
  }, [search, speciesFilter, error]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPets();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchPets]);

  const handleOpenCreate = () => {
    setEditingPet(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pet: Pet) => {
    setEditingPet(pet);
    setIsModalOpen(true);
  };

  const handleSavePet = async (values: any) => {
    setIsSaving(true);
    try {
      if (editingPet) {
        await petApi.updatePet(editingPet.id, values);
        success(`Cập nhật thông tin bé ${values.name} thành công!`);
      } else {
        await petApi.createPet(values);
        success(`Thêm bé ${values.name} vào danh sách thành công! 🎉`);
      }
      setIsModalOpen(false);
      setEditingPet(null);
      fetchPets();
      refreshPets();
    } catch (err: any) {
      error(err.message || 'Lỗi lưu thông tin thú cưng');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePet = async () => {
    if (!deletingPet) return;
    setIsSaving(true);
    try {
      await petApi.deletePet(deletingPet.id);
      success(`Đã xóa hồ sơ bé ${deletingPet.name}.`);
      setDeletingPet(null);
      fetchPets();
      refreshPets();
    } catch (err: any) {
      error(err.message || 'Không thể xóa thú cưng.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <PageHeader
        title="Danh Sách Thú Cưng"
        subtitle="Quản lý và theo dõi thông tin tất cả các người bạn nhỏ của bạn"
      >
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm thú cưng</span>
        </button>
      </PageHeader>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, giống, ghi chú..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        {/* Species Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-100 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setSpeciesFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${speciesFilter === 'ALL'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
              }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setSpeciesFilter('DOG')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${speciesFilter === 'DOG'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
              }`}
          >
            Chó (Dog)
          </button>
          <button
            onClick={() => setSpeciesFilter('CAT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${speciesFilter === 'CAT'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
              }`}
          >
            Mèo (Cat)
          </button>
          <button
            onClick={() => setSpeciesFilter('OTHER')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${speciesFilter === 'OTHER'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
              }`}
          >
            Khác
          </button>
        </div>
      </div>

      {/* Pet Cards Grid */}
      {loading ? (
        <CardSkeleton count={4} />
      ) : pets.length === 0 ? (
        <EmptyState
          icon={PawPrint}
          title="Không tìm thấy thú cưng nào"
          description={
            search || speciesFilter !== 'ALL'
              ? 'Không có kết quả nào phù hợp với điều kiện tìm kiếm và bộ lọc của bạn.'
              : 'Bạn chưa thêm thú cưng nào vào hệ thống. Hãy thêm hồ sơ đầu tiên ngay nhé!'
          }
          actionText={search || speciesFilter !== 'ALL' ? undefined : 'Thêm thú cưng ngay'}
          onAction={handleOpenCreate}
          actionIcon={Plus}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pets.map((pet) => (
            <PetCard
              key={pet.id}
              pet={pet}
              onEdit={handleOpenEdit}
              onDelete={(p) => setDeletingPet(p)}
            />
          ))}
        </div>
      )}

      {/* Pet Form Modal */}
      <PetFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPet(null);
        }}
        onSubmit={handleSavePet}
        initialData={editingPet}
        isLoading={isSaving}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!deletingPet}
        onClose={() => setDeletingPet(null)}
        onConfirm={handleDeletePet}
        title="Xác nhận xóa thú cưng"
        message={`Bạn có chắc chắn muốn xóa hồ sơ bé "${deletingPet?.name}" không? Mọi dữ liệu về sức khỏe, tiêm phòng, thuốc và lịch chăm sóc liên quan sẽ bị xóa vĩnh viễn.`}
        confirmText="Xác nhận xóa"
        cancelText="Hủy bỏ"
        isLoading={isSaving}
        variant="danger"
      />
    </div>
  );
};
