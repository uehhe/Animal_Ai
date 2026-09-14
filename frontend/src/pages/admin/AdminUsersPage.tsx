import React, { useState, useEffect, useCallback } from 'react';
import { Users, Search, ShieldCheck, User as UserIcon, Lock, Unlock, MessageSquare, PawPrint, CheckCircle2, AlertTriangle } from 'lucide-react';
import { adminApi } from '../../services/admin.service.js';
import { User } from '../../types/index.js';
import { useAuth } from '../../contexts/AuthContext.js';
import { useToast } from '../../contexts/ToastContext.js';
import { PageHeader } from '../../components/common/PageHeader.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { EmptyState } from '../../components/common/EmptyState.js';
import { ConfirmDialog } from '../../components/common/ConfirmDialog.js';
import { formatDateTime } from '../../utils/date.js';

interface UserWithCount extends User {
  _count?: {
    pets: number;
    aiConversations: number;
  };
}

export const AdminUsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { success, error } = useToast();

  const [users, setUsers] = useState<UserWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [togglingUser, setTogglingUser] = useState<UserWithCount | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = (await adminApi.getUsers(search.trim() || undefined)) as UserWithCount[];
      setUsers(data);
    } catch (err: any) {
      error(err.message || 'Lỗi tải danh sách người dùng.');
    } finally {
      setLoading(false);
    }
  }, [search, error]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 350);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handleToggleStatus = async () => {
    if (!togglingUser) return;
    setIsProcessing(true);
    try {
      const res = await adminApi.toggleUserStatus(togglingUser.id);
      success(res.message);
      setTogglingUser(null);
      fetchUsers();
    } catch (err: any) {
      error(err.message || 'Lỗi thay đổi trạng thái tài khoản.');
    } finally {
      setIsProcessing(false);
    }
  };

  const totalAdmins = users.filter((u) => u.role === 'ADMIN').length;
  const totalActive = users.filter((u) => u.isActive !== false).length;
  const totalLocked = users.length - totalActive;

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      <PageHeader
        title="Quản Lý Người Dùng"
        subtitle="Danh sách người dùng đã đăng ký tài khoản, tìm kiếm và quản trị trạng thái hoạt động"
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">{users.length}</p>
            <p className="text-xs text-slate-400 font-medium">Tổng người dùng</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">{totalAdmins}</p>
            <p className="text-xs text-slate-400 font-medium">Quản trị viên</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">{totalActive}</p>
            <p className="text-xs text-slate-400 font-medium">Đang hoạt động</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">{totalLocked}</p>
            <p className="text-xs text-slate-400 font-medium">Bị tạm khóa</p>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên hoặc email..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div className="text-xs text-slate-400 font-medium">
            Hiển thị {users.length} tài khoản
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" text="Đang tải dữ liệu người dùng..." />
          </div>
        ) : users.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Không tìm thấy người dùng"
            description="Không có tài khoản nào khớp với từ khóa tìm kiếm của bạn."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="pb-3.5 font-semibold">Tài khoản & Email</th>
                  <th className="pb-3.5 font-semibold">Vai trò</th>
                  <th className="pb-3.5 font-semibold text-center">Thú cưng</th>
                  <th className="pb-3.5 font-semibold text-center">Chat AI</th>
                  <th className="pb-3.5 font-semibold">Ngày tham gia</th>
                  <th className="pb-3.5 font-semibold">Trạng thái</th>
                  <th className="pb-3.5 font-semibold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map((u) => {
                  const isCurrent = currentUser?.id === u.id;
                  const isActive = u.isActive !== false;

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(u.name)}`}
                            alt={u.name}
                            className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200 bg-slate-100"
                          />
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">{u.name}</p>
                            <p className="text-[11px] text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase ${
                            u.role === 'ADMIN'
                              ? 'bg-indigo-100 text-indigo-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      <td className="py-3.5 text-center">
                        <div className="inline-flex items-center gap-1 text-slate-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]">
                          <PawPrint className="w-3 h-3 text-emerald-600" />
                          <span>{u._count?.pets || 0}</span>
                        </div>
                      </td>

                      <td className="py-3.5 text-center">
                        <div className="inline-flex items-center gap-1 text-slate-600 font-semibold bg-purple-50 px-2 py-0.5 rounded-md text-[11px]">
                          <MessageSquare className="w-3 h-3 text-purple-600" />
                          <span>{u._count?.aiConversations || 0}</span>
                        </div>
                      </td>

                      <td className="py-3.5 text-slate-500 text-[11px]">
                        {formatDateTime(u.createdAt)}
                      </td>

                      <td className="py-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                              : 'bg-rose-50 text-rose-700 border border-rose-200/50'
                          }`}
                        >
                          {isActive ? 'Hoạt động' : 'Đã khóa'}
                        </span>
                      </td>

                      <td className="py-3.5 text-right">
                        {isCurrent ? (
                          <span className="text-[11px] text-slate-400 italic">Tài khoản của bạn</span>
                        ) : (
                          <button
                            onClick={() => setTogglingUser(u)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                              isActive
                                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {isActive ? (
                              <>
                                <Lock className="w-3.5 h-3.5" />
                                <span>Khóa</span>
                              </>
                            ) : (
                              <>
                                <Unlock className="w-3.5 h-3.5" />
                                <span>Mở khóa</span>
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!togglingUser}
        title={togglingUser?.isActive !== false ? 'Xác nhận khóa tài khoản' : 'Xác nhận mở khóa tài khoản'}
        message={
          togglingUser?.isActive !== false
            ? `Bạn có chắc chắn muốn khóa tài khoản "${togglingUser?.name}" (${togglingUser?.email})? Người dùng sẽ không thể đăng nhập vào ứng dụng.`
            : `Mở khóa tài khoản cho "${togglingUser?.name}" (${togglingUser?.email}) để người dùng tiếp tục đăng nhập?`
        }
        confirmText={togglingUser?.isActive !== false ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
        variant={togglingUser?.isActive !== false ? 'danger' : 'primary'}
        isLoading={isProcessing}
        onConfirm={handleToggleStatus}
        onClose={() => setTogglingUser(null)}
      />
    </div>
  );
};
