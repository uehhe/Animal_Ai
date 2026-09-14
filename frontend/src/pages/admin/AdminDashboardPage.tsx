import React, { useState, useEffect } from 'react';
import { Users, PawPrint, CalendarClock, MessageSquare, HeartPulse, Syringe } from 'lucide-react';
import { adminApi, AdminStats } from '../../services/admin.service.js';
import { useToast } from '../../contexts/ToastContext.js';
import { PageHeader } from '../../components/common/PageHeader.js';
import { StatCard } from '../../components/common/StatCard.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { formatDateTime } from '../../utils/date.js';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export const AdminDashboardPage: React.FC = () => {
  const { error } = useToast();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await adminApi.getStats();
        setStats(data);
      } catch (err: any) {
        error(err.message || 'Lỗi tải thống kê hệ thống.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [error]);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner size="lg" text="Đang tải dữ liệu quản trị..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Tổng Quan Hệ Thống"
        subtitle="Giám sát người dùng, lượng dữ liệu thú cưng và các lượt gọi dịch vụ AI"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="Người dùng"
          value={stats?.totalUsers || 0}
          icon={Users}
          color="sky"
          subtitle="Tài khoản đăng ký"
        />
        <StatCard
          title="Thú cưng"
          value={stats?.totalPets || 0}
          icon={PawPrint}
          color="emerald"
          subtitle="Đang quản lý"
        />
        <StatCard
          title="Lịch chăm sóc"
          value={stats?.totalSchedules || 0}
          icon={CalendarClock}
          color="amber"
          subtitle="Tổng số lịch"
        />
        <StatCard
          title="Lượt chat AI"
          value={stats?.totalAIMessages || 0}
          icon={MessageSquare}
          color="purple"
          subtitle="Tin nhắn trao đổi"
        />
        <StatCard
          title="Hồ sơ bệnh án"
          value={stats?.totalHealthRecords || 0}
          icon={HeartPulse}
          color="rose"
          subtitle="Lần khám sức khỏe"
        />
        <StatCard
          title="Mũi tiêm phòng"
          value={stats?.totalVaccinations || 0}
          icon={Syringe}
          color="emerald"
          subtitle="Mũi vaccine"
        />
      </div>

      {/* Charts & Recent Users */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Chart: Species Breakdown */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Phân Loại Thú Cưng Hệ Thống</h3>
            <p className="text-xs text-slate-400">Số lượng phân bổ theo loài (Chó, Mèo, Khác)</p>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.speciesBreakdown || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '12px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" name="Số lượng" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Registrations Table */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Người Dùng Mới Đăng Ký</h3>
            <p className="text-xs text-slate-400">5 tài khoản tham gia gần đây nhất</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px]">
                  <th className="pb-3 font-semibold">Tên & Email</th>
                  <th className="pb-3 font-semibold">Vai trò</th>
                  <th className="pb-3 font-semibold">Ngày tham gia</th>
                  <th className="pb-3 font-semibold">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {stats?.recentUsers.map((u) => (
                  <tr key={u.id}>
                    <td className="py-3">
                      <p className="font-semibold text-slate-800">{u.name}</p>
                      <p className="text-[11px] text-slate-400">{u.email}</p>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-700'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500">{formatDateTime(u.createdAt)}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${u.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                        {u.isActive ? 'Hoạt động' : 'Đã khóa'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
