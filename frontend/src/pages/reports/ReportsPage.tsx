import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import { BarChart3, TrendingUp, CheckCircle2, HeartPulse, PieChart as PieIcon } from 'lucide-react';
import { reportApi, HealthReportData, CareReportData } from '../../services/report.service.js';
import { useToast } from '../../contexts/ToastContext.js';
import { usePet } from '../../contexts/PetContext.js';
import { PageHeader } from '../../components/common/PageHeader.js';
import { StatCard } from '../../components/common/StatCard.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { formatCareType } from '../../utils/format.js';

export const ReportsPage: React.FC = () => {
  const { error } = useToast();
  const { pets, selectedPetId, selectPet } = usePet();

  const [range, setRange] = useState<'7d' | '30d' | '3m' | '6m' | '1y'>('30d');
  const [healthData, setHealthData] = useState<HealthReportData | null>(null);
  const [careData, setCareData] = useState<CareReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const [hRes, cRes] = await Promise.all([
        reportApi.getHealthReport(selectedPetId || undefined, range),
        reportApi.getCareReport(selectedPetId || undefined, range),
      ]);
      setHealthData(hRes);
      setCareData(cRes);
    } catch (err: any) {
      error(err.message || 'Lỗi tải dữ liệu báo cáo.');
    } finally {
      setLoading(false);
    }
  }, [selectedPetId, range, error]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const COLORS = ['#10b981', '#0ea5e9', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];

  const typeDistributionFormatted =
    careData?.typeDistribution.map((item) => ({
      name: formatCareType(item.type as any),
      value: item.count,
    })) || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Báo Cáo & Phân Tích Chăm Sóc"
        subtitle="Tổng hợp thống kê tiến độ chăm sóc, diễn biến cân nặng và tần suất hoạt động"
      >
        {/* Time Range Selector */}
        <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          {[
            { key: '7d', label: '7 Ngày' },
            { key: '30d', label: '30 Ngày' },
            { key: '3m', label: '3 Tháng' },
            { key: '6m', label: '6 Tháng' },
            { key: '1y', label: '1 Năm' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setRange(item.key as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                range === item.key
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
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
          Tất cả thú cưng
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

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tổng lịch trong kỳ"
          value={careData?.total || 0}
          icon={BarChart3}
          color="sky"
          subtitle="Số lần lên kế hoạch"
        />
        <StatCard
          title="Đã hoàn thành"
          value={careData?.completed || 0}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Lịch thực hiện xong"
        />
        <StatCard
          title="Tỷ lệ hoàn thành"
          value={`${careData?.completionRate || 0}%`}
          icon={TrendingUp}
          color="purple"
          subtitle="Hiệu suất chăm sóc"
        />
        <StatCard
          title="Số lần khám bệnh"
          value={healthData?.totalVisits || 0}
          icon={HeartPulse}
          color="amber"
          subtitle="Ghi nhận y tế"
        />
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" text="Đang xử lý số liệu biểu đồ..." />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Chart 1: Biểu đồ diễn biến cân nặng */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Diễn Biến Cân Nặng (kg)</h3>
              <p className="text-xs text-slate-400">Theo dõi xu hướng thể trọng của thú cưng theo thời gian</p>
            </div>

            <div className="h-72 w-full pt-4">
              {healthData?.weightHistory && healthData.weightHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={healthData.weightHistory}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} domain={['auto', 'auto']} unit="kg" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        borderRadius: '12px',
                        color: '#fff',
                        border: 'none',
                        fontSize: '12px',
                      }}
                      formatter={(val: any) => [`${val} kg`, 'Cân nặng']}
                    />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ r: 5, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-xs text-slate-400">
                  Chưa có đủ dữ liệu cân nặng trong khoảng thời gian này.
                </div>
              )}
            </div>
          </div>

          {/* Chart 2: Phân bố loại hoạt động chăm sóc */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Phân Loại Hoạt Động Chăm Sóc</h3>
              <p className="text-xs text-slate-400">Cơ cấu tỷ lệ các nhóm việc (cho ăn, đi dạo, tắm, thuốc...)</p>
            </div>

            <div className="h-72 w-full pt-4">
              {typeDistributionFormatted.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={typeDistributionFormatted}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {typeDistributionFormatted.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        borderRadius: '12px',
                        color: '#fff',
                        border: 'none',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-xs text-slate-400">
                  Chưa có dữ liệu hoạt động trong khoảng thời gian này.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
