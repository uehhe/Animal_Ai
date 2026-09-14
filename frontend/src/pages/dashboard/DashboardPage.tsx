import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PawPrint,
  CalendarClock,
  Syringe,
  Pill,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Plus,
  Clock,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useAuth } from '../../contexts/AuthContext.js';
import { usePet } from '../../contexts/PetContext.js';
import { useToast } from '../../contexts/ToastContext.js';
import { reportApi } from '../../services/report.service.js';
import { scheduleApi } from '../../services/schedule.service.js';
import { DashboardSummary } from '../../types/index.js';
import { StatCard } from '../../components/common/StatCard.js';
import { Badge } from '../../components/common/Badge.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { EmptyState } from '../../components/common/EmptyState.js';
import { formatCareType, formatVaccinationStatus, formatMedicationStatus, formatMood } from '../../utils/format.js';
import { formatRelativeTime } from '../../utils/date.js';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { pets, selectedPetId, selectPet } = usePet();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardSummary | null>(null);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await reportApi.getDashboardSummary(selectedPetId || undefined);
      setData(res);
    } catch (err: any) {
      error(err.message || 'Lỗi tải dữ liệu Dashboard');
    } finally {
      setLoading(false);
    }
  }, [selectedPetId, error]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleCompleteSchedule = async (id: string) => {
    try {
      await scheduleApi.completeSchedule(id);
      success('Đã hoàn thành lịch chăm sóc! 🎉');
      loadDashboard();
    } catch (err: any) {
      error(err.message || 'Không thể hoàn thành lịch');
    }
  };

  const handleAskAI = (promptText: string) => {
    navigate('/ai-assistant', { state: { quickPrompt: promptText, petId: selectedPetId } });
  };

  const selectedPet = pets.find((p) => p.id === selectedPetId);
  const petDisplayName = selectedPet ? selectedPet.name : 'những người bạn nhỏ';

  if (loading && !data) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner size="lg" text="Đang tải dữ liệu tổng quan..." />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Welcome & Pet Context Bar */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-600/10 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-12 translate-y-8">
          <PawPrint className="w-80 h-80" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-md mb-3 text-emerald-100">
              <Sparkles className="w-3.5 h-3.5" />
              Tổng Quan Chăm Sóc Thú Cưng
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Xin chào, {user?.name} 👋
            </h1>
            <p className="text-sm sm:text-base text-emerald-100/90 mt-1 max-w-xl leading-relaxed">
              Hãy cùng chăm sóc {petDisplayName} thật chu đáo và khỏe mạnh hôm nay.
            </p>
          </div>

          {/* Quick Pet Switcher Pills */}
          <div className="bg-black/20 p-1.5 rounded-2xl backdrop-blur-md flex items-center gap-1.5 self-start md:self-auto overflow-x-auto max-w-full">
            <button
              onClick={() => selectPet(null)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                !selectedPetId
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              Tất cả ({pets.length})
            </button>
            {pets.map((pet) => (
              <button
                key={pet.id}
                onClick={() => selectPet(pet.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                  selectedPetId === pet.id
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <img
                  src={pet.avatar || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=100&q=80'}
                  alt={pet.name}
                  className="w-4 h-4 rounded-full object-cover"
                />
                <span>{pet.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Thú cưng"
          value={data?.totalPets || 0}
          icon={PawPrint}
          color="emerald"
          subtitle="Đang quản lý"
        />
        <StatCard
          title="Lịch hôm nay"
          value={data?.todaySchedulesCount || 0}
          icon={CalendarClock}
          color="sky"
          subtitle="Việc cần thực hiện"
        />
        <StatCard
          title="Tiêm phòng"
          value={data?.upcomingVaccinesCount || 0}
          icon={Syringe}
          color="amber"
          subtitle="Sắp tới hạn"
        />
        <StatCard
          title="Thuốc đang uống"
          value={data?.activeMedicationsCount || 0}
          icon={Pill}
          color="purple"
          subtitle="Đơn đang áp dụng"
        />
        <StatCard
          title="Cảnh báo"
          value={data?.healthAlertsCount || 0}
          icon={AlertTriangle}
          color={data && data.healthAlertsCount > 0 ? 'rose' : 'emerald'}
          subtitle={data && data.healthAlertsCount > 0 ? 'Cần chú ý' : 'Bình thường'}
        />
      </div>

      {/* 3. AI Quick Action Card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Bạn muốn hỏi Trợ lý AI điều gì về {petDisplayName}?</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                AI có thể tra cứu hồ sơ bệnh án, lịch uống thuốc và phân tích nhu cầu dinh dưỡng ngay lập tức.
              </p>
            </div>
          </div>
          <Link
            to="/ai-assistant"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold transition-all self-start md:self-auto shrink-0 shadow-md shadow-emerald-500/20"
          >
            <span>Mở Trợ lý AI Chat</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Quick prompt buttons */}
        <div className="mt-5 pt-4 border-t border-slate-700/60 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          <button
            onClick={() => handleAskAI(`Hôm nay ${petDisplayName} cần làm gì và có lịch uống thuốc nào không?`)}
            className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs text-left text-slate-200 transition-colors flex items-center justify-between group"
          >
            <span className="truncate">"Hôm nay {petDisplayName} cần làm gì?"</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1" />
          </button>
          <button
            onClick={() => handleAskAI(`Dựa trên lịch sử chăm sóc của ${petDisplayName}, hãy tạo routine 7 ngày chi tiết.`)}
            className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs text-left text-slate-200 transition-colors flex items-center justify-between group"
          >
            <span className="truncate">"Tạo routine chăm sóc 7 ngày."</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1" />
          </button>
          <button
            onClick={() => handleAskAI(`Tóm tắt sức khỏe và lưu ý thể trạng của ${petDisplayName}.`)}
            className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs text-left text-slate-200 transition-colors flex items-center justify-between group"
          >
            <span className="truncate">"Tóm tắt hồ sơ sức khỏe."</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1" />
          </button>
          <button
            onClick={() => handleAskAI(`Nhắc tôi các lịch tiêm phòng và uống thuốc sắp đến hạn của ${petDisplayName}.`)}
            className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs text-left text-slate-200 transition-colors flex items-center justify-between group"
          >
            <span className="truncate">"Nhắc tôi các lịch sắp tới."</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1" />
          </button>
        </div>
      </div>

      {/* 4. Two Columns: Today Schedules & Weekly Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 7 cols: Today Schedules */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">Lịch Chăm Sóc Hôm Nay</h3>
                <p className="text-xs text-slate-400">Các hoạt động cần thực hiện trong ngày</p>
              </div>
              <Link
                to="/schedule"
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <span>Xem tất cả</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {data?.todaySchedules.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title="Hôm nay không có lịch hẹn nào"
                description="Bạn đã hoàn thành tất cả hoặc chưa tạo lịch chăm sóc cho ngày hôm nay."
                actionText="Thêm lịch mới"
                onAction={() => navigate('/schedule')}
                actionIcon={Plus}
              />
            ) : (
              <div className="space-y-3">
                {data?.todaySchedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                      schedule.status === 'COMPLETED'
                        ? 'bg-slate-50 border-slate-200/60 opacity-70'
                        : 'bg-white border-slate-100 shadow-sm hover:border-emerald-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          schedule.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-600'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Clock className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p
                            className={`text-sm font-semibold truncate ${
                              schedule.status === 'COMPLETED'
                                ? 'line-through text-slate-500'
                                : 'text-slate-800'
                            }`}
                          >
                            {schedule.title}
                          </p>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                            {formatCareType(schedule.careType)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                          <span>{schedule.pet?.name}</span>
                          <span>•</span>
                          <span>{schedule.scheduledTime || 'Cả ngày'}</span>
                          {schedule.notes && (
                            <>
                              <span>•</span>
                              <span className="truncate max-w-[150px]">{schedule.notes}</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <div>
                      {schedule.status === 'COMPLETED' ? (
                        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Đã xong
                        </span>
                      ) : (
                        <button
                          onClick={() => handleCompleteSchedule(schedule.id)}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Hoàn thành
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 5 cols: Chart Weekly Care */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Lịch Chăm Sóc Tuần Này</h3>
                <p className="text-xs text-slate-400">Tỷ lệ hoàn thành công việc chăm sóc</p>
              </div>
            </div>

            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.schedulesByDay || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#fff',
                      border: 'none',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="completed" name="Đã hoàn thành" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pending" name="Chờ thực hiện" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Two Columns: Upcoming Vaccines & Active Medications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Upcoming Vaccines */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Syringe className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Tiêm Phòng Sắp Tới Hạn</h3>
            </div>
            <Link to="/vaccinations" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
              Quản lý →
            </Link>
          </div>

          {data?.upcomingVaccinations.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Không có mũi tiêm nào sắp tới hạn. Thú cưng đã được tiêm phòng an toàn!
            </div>
          ) : (
            <div className="space-y-3">
              {data?.upcomingVaccinations.map((vac) => {
                const statusMeta = formatVaccinationStatus(vac.status);
                return (
                  <div key={vac.id} className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{vac.vaccineName}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {vac.pet?.name} • Hạn nhắc:{' '}
                        {vac.nextDueDate ? new Date(vac.nextDueDate).toLocaleDateString('vi-VN') : 'Định kỳ'}
                      </p>
                    </div>
                    <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Active Medications */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Pill className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Thuốc Đang Sử Dụng</h3>
            </div>
            <Link to="/medications" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
              Quản lý →
            </Link>
          </div>

          {data?.activeMedications.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Hiện tại thú cưng không cần dùng thuốc điều trị nào.
            </div>
          ) : (
            <div className="space-y-3">
              {data?.activeMedications.map((med) => {
                const medStatus = formatMedicationStatus(med.status);
                return (
                  <div key={med.id} className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{med.name}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {med.pet?.name} • {med.dosage} {med.unit} ({med.frequency})
                      </p>
                    </div>
                    <Badge variant={medStatus.variant}>{medStatus.label}</Badge>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 6. Recent Diary Activity */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Hoạt Động Gần Đây</h3>
            <p className="text-xs text-slate-400">Nhật ký và những khoảnh khắc đáng nhớ</p>
          </div>
          <Link to="/diary" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
            Xem nhật ký →
          </Link>
        </div>

        {data?.recentActivities.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Chưa có nhật ký hoạt động nào. Hãy ghi lại nhật ký đầu tiên cho thú cưng!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data?.recentActivities.map((act) => {
              const moodMeta = formatMood(act.mood);
              return (
                <div key={act.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/40 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-emerald-700">{act.petName}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${moodMeta.color}`}>
                      {moodMeta.label}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-800 mb-1">{act.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{act.content}</p>
                  <span className="text-[10px] text-slate-400 block mt-2">
                    {formatRelativeTime(act.date)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
