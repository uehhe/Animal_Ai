import React, { useState, useEffect, useCallback } from 'react';
import { PawPrint, Search, HeartPulse, Syringe, CalendarClock, User, Filter } from 'lucide-react';
import { adminApi } from '../../services/admin.service.js';
import { Pet } from '../../types/index.js';
import { useToast } from '../../contexts/ToastContext.js';
import { PageHeader } from '../../components/common/PageHeader.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { EmptyState } from '../../components/common/EmptyState.js';
import { formatSpecies, formatHealthStatus } from '../../utils/format.js';
import { formatDate } from '../../utils/date.js';

interface AdminPetItem extends Pet {
  user: {
    id: string;
    name: string;
    email: string;
  };
  _count?: {
    healthRecords: number;
    vaccinations: number;
    careSchedules: number;
  };
}

export const AdminPetsPage: React.FC = () => {
  const { error } = useToast();

  const [pets, setPets] = useState<AdminPetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState<string>('ALL');

  const fetchPets = useCallback(async () => {
    try {
      setLoading(true);
      const data = (await adminApi.getAllPets()) as AdminPetItem[];
      setPets(data);
    } catch (err: any) {
      error(err.message || 'Lỗi tải danh sách thú cưng.');
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  const filteredPets = pets.filter((p) => {
    const matchesSpecies = speciesFilter === 'ALL' || p.species === speciesFilter;
    const query = search.toLowerCase().trim();
    const matchesSearch =
      !query ||
      p.name.toLowerCase().includes(query) ||
      p.breed.toLowerCase().includes(query) ||
      p.user?.name.toLowerCase().includes(query) ||
      p.user?.email.toLowerCase().includes(query);
    return matchesSpecies && matchesSearch;
  });

  const dogCount = pets.filter((p) => p.species === 'DOG').length;
  const catCount = pets.filter((p) => p.species === 'CAT').length;
  const otherCount = pets.filter((p) => p.species === 'OTHER').length;

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      <PageHeader
        title="Thú Cưng Hệ Thống"
        subtitle="Giám sát và kiểm tra toàn bộ hồ sơ thú cưng được tạo và chăm sóc bởi người dùng"
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <PawPrint className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">{pets.length}</p>
            <p className="text-xs text-slate-400 font-medium">Tổng thú cưng</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <span className="text-lg font-bold">🐶</span>
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">{dogCount}</p>
            <p className="text-xs text-slate-400 font-medium">Loài Chó</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <span className="text-lg font-bold">🐱</span>
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">{catCount}</p>
            <p className="text-xs text-slate-400 font-medium">Loài Mèo</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <span className="text-lg font-bold">🐾</span>
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">{otherCount}</p>
            <p className="text-xs text-slate-400 font-medium">Loài Khác</p>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên bé, giống, chủ sở hữu..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            {['ALL', 'DOG', 'CAT', 'OTHER'].map((s) => (
              <button
                key={s}
                onClick={() => setSpeciesFilter(s)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  speciesFilter === s
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {s === 'ALL' ? 'Tất cả' : s === 'DOG' ? 'Chó' : s === 'CAT' ? 'Mèo' : 'Khác'}
              </button>
            ))}
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" text="Đang tải dữ liệu thú cưng..." />
          </div>
        ) : filteredPets.length === 0 ? (
          <EmptyState
            icon={PawPrint}
            title="Không tìm thấy thú cưng"
            description="Không có thú cưng nào khớp với điều kiện lọc."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="pb-3.5 font-semibold">Thú cưng & Giống</th>
                  <th className="pb-3.5 font-semibold">Loài</th>
                  <th className="pb-3.5 font-semibold">Chủ sở hữu</th>
                  <th className="pb-3.5 font-semibold">Sức khỏe</th>
                  <th className="pb-3.5 font-semibold text-center">Bệnh án</th>
                  <th className="pb-3.5 font-semibold text-center">Tiêm phòng</th>
                  <th className="pb-3.5 font-semibold text-center">Lịch chăm sóc</th>
                  <th className="pb-3.5 font-semibold">Ngày tạo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredPets.map((p) => {
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.avatar || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=100&q=80'}
                            alt={p.name}
                            className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200"
                          />
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{p.name}</p>
                            <p className="text-[11px] text-slate-400">{p.breed}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5">
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                          {formatSpecies(p.species)}
                        </span>
                      </td>

                      <td className="py-3.5">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <div>
                            <p className="font-semibold text-slate-700">{p.user?.name}</p>
                            <p className="text-[10px] text-slate-400">{p.user?.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                            p.healthStatus === 'HEALTHY'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {formatHealthStatus(p.healthStatus).label}
                        </span>
                      </td>

                      <td className="py-3.5 text-center">
                        <div className="inline-flex items-center gap-1 text-slate-600 font-semibold bg-rose-50 px-2 py-0.5 rounded-md text-[11px]">
                          <HeartPulse className="w-3 h-3 text-rose-500" />
                          <span>{p._count?.healthRecords || 0}</span>
                        </div>
                      </td>

                      <td className="py-3.5 text-center">
                        <div className="inline-flex items-center gap-1 text-slate-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]">
                          <Syringe className="w-3 h-3 text-emerald-600" />
                          <span>{p._count?.vaccinations || 0}</span>
                        </div>
                      </td>

                      <td className="py-3.5 text-center">
                        <div className="inline-flex items-center gap-1 text-slate-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-md text-[11px]">
                          <CalendarClock className="w-3 h-3 text-amber-600" />
                          <span>{p._count?.careSchedules || 0}</span>
                        </div>
                      </td>

                      <td className="py-3.5 text-slate-500 text-[11px]">
                        {formatDate(p.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
