import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarClock,
  HeartPulse,
  Syringe,
  Pill,
  BookOpen,
  Plus,
  Clock,
  Sparkles,
  Weight,
  Thermometer,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { petApi } from '../../services/pet.service.js';
import { scheduleApi } from '../../services/schedule.service.js';
import { Pet } from '../../types/index.js';
import { Badge } from '../../components/common/Badge.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { EmptyState } from '../../components/common/EmptyState.js';
import { useToast } from '../../contexts/ToastContext.js';
import { formatSpecies, formatGender, formatHealthStatus, formatCareType, formatVaccinationStatus, formatMedicationStatus, formatMood } from '../../utils/format.js';
import { formatDate, formatDateTime, formatRelativeTime } from '../../utils/date.js';

// Modals for tabs
import { HealthRecordModal } from '../../components/health/HealthRecordModal.js';
import { healthApi } from '../../services/health.service.js';
import { VaccinationModal } from '../../components/vaccinations/VaccinationModal.js';
import { vaccinationApi } from '../../services/vaccination.service.js';
import { MedicationModal } from '../../components/medications/MedicationModal.js';
import { medicationApi } from '../../services/medication.service.js';
import { ScheduleModal } from '../../components/schedules/ScheduleModal.js';
import { DiaryModal } from '../../components/diary/DiaryModal.js';
import { diaryApi } from '../../services/diary.service.js';

export const PetDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [pet, setPet] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'health' | 'vaccines' | 'medications' | 'schedules' | 'diary'>('overview');

  // Tab Modal states
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);
  const [isVaccineModalOpen, setIsVaccineModalOpen] = useState(false);
  const [isMedModalOpen, setIsMedModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isDiaryModalOpen, setIsDiaryModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchPetDetail = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await petApi.getPetById(id);
      setPet(data);
    } catch (err: any) {
      error(err.message || 'Không thể tải chi tiết thú cưng.');
      navigate('/pets');
    } finally {
      setLoading(false);
    }
  }, [id, error, navigate]);

  useEffect(() => {
    fetchPetDetail();
  }, [fetchPetDetail]);

  const handleCompleteSchedule = async (scheduleId: string) => {
    try {
      await scheduleApi.completeSchedule(scheduleId);
      success('Đã hoàn thành lịch chăm sóc! 🎉');
      fetchPetDetail();
    } catch (err: any) {
      error(err.message || 'Lỗi cập nhật lịch');
    }
  };

  const handleSaveHealth = async (values: any) => {
    if (!id) return;
    setIsSaving(true);
    try {
      await healthApi.createHealthRecord(id, values);
      success('Thêm hồ sơ khám bệnh thành công!');
      setIsHealthModalOpen(false);
      fetchPetDetail();
    } catch (err: any) {
      error(err.message || 'Lỗi lưu hồ sơ sức khỏe');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveVaccine = async (values: any) => {
    if (!id) return;
    setIsSaving(true);
    try {
      await vaccinationApi.createVaccination(id, values);
      success('Ghi nhận mũi tiêm mới thành công!');
      setIsVaccineModalOpen(false);
      fetchPetDetail();
    } catch (err: any) {
      error(err.message || 'Lỗi lưu thông tin tiêm phòng');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveMed = async (values: any) => {
    if (!id) return;
    setIsSaving(true);
    try {
      await medicationApi.createMedication(id, values);
      success('Thêm đơn thuốc mới thành công!');
      setIsMedModalOpen(false);
      fetchPetDetail();
    } catch (err: any) {
      error(err.message || 'Lỗi lưu đơn thuốc');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSchedule = async (values: any) => {
    if (!id) return;
    setIsSaving(true);
    try {
      await scheduleApi.createSchedule({ ...values, petId: id });
      success('Tạo lịch chăm sóc mới thành công!');
      setIsScheduleModalOpen(false);
      fetchPetDetail();
    } catch (err: any) {
      error(err.message || 'Lỗi tạo lịch');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDiary = async (values: any) => {
    if (!id) return;
    setIsSaving(true);
    try {
      await diaryApi.createDiary(id, values);
      success('Thêm nhật ký mới thành công!');
      setIsDiaryModalOpen(false);
      fetchPetDetail();
    } catch (err: any) {
      error(err.message || 'Lỗi lưu nhật ký');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner size="lg" text="Đang tải hồ sơ thú cưng..." />
      </div>
    );
  }

  if (!pet) return null;

  const healthMeta = formatHealthStatus(pet.healthStatus);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back button */}
      <Link
        to="/pets"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại danh sách thú cưng</span>
      </Link>

      {/* 1. Pet Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <img
            src={pet.avatar || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80'}
            alt={pet.name}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover ring-4 ring-emerald-500/10 shadow-lg"
          />
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{pet.name}</h1>
              <Badge variant={healthMeta.variant}>{healthMeta.label}</Badge>
            </div>
            <p className="text-sm font-medium text-slate-500">
              {formatSpecies(pet.species)} • {pet.breed} • {formatGender(pet.gender)}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
              <span>🎂 Tuổi: <strong>{pet.age ? `${pet.age} tuổi` : 'Chưa rõ'}</strong></span>
              <span>⚖️ Cân nặng: <strong>{pet.weight ? `${pet.weight} kg` : 'Chưa rõ'}</strong></span>
              {pet.color && <span>🎨 Màu: <strong>{pet.color}</strong></span>}
              {pet.microchipId && <span>🏷️ Microchip: <strong>{pet.microchipId}</strong></span>}
            </div>
          </div>
        </div>

        {/* AI Quick Button for this pet */}
        <Link
          to="/ai-assistant"
          state={{ petId: pet.id, quickPrompt: `Bella tuần này cần chăm sóc gì và tôi cần chú ý điều gì?` }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-500/20 transition-all self-start md:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>Hỏi AI về {pet.name}</span>
        </Link>
      </div>

      {/* 2. Profile Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto pb-px">
          {[
            { key: 'overview', label: 'Tổng quan', count: null },
            { key: 'health', label: 'Sức khỏe', count: pet.healthRecords?.length },
            { key: 'vaccines', label: 'Tiêm phòng', count: pet.vaccinations?.length },
            { key: 'medications', label: 'Thuốc', count: pet.medications?.length },
            { key: 'schedules', label: 'Lịch chăm sóc', count: pet.careSchedules?.length },
            { key: 'diary', label: 'Nhật ký', count: pet.diaries?.length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-3 px-3.5 border-b-2 text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === tab.key
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== null && tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    activeTab === tab.key ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* 3. Tab Content */}
      <div className="pt-2">
        {/* TAB 1: TỔNG QUAN */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Notes Card */}
            {pet.notes && (
              <div className="bg-emerald-50/50 rounded-2xl p-5 border border-emerald-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">
                  Đặc điểm & Ghi chú chăm sóc
                </h4>
                <p className="text-sm text-emerald-950 leading-relaxed">{pet.notes}</p>
              </div>
            )}

            {/* Timeline Lịch Sử Chăm Sóc Gần Nhất */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-4">Dòng Thời Gian Chăm Sóc Gần Nhất</h3>
              <div className="relative pl-6 border-l-2 border-slate-100 space-y-6 my-2">
                {/* Schedules */}
                {pet.careSchedules?.slice(0, 3).map((s: any) => (
                  <div key={s.id} className="relative">
                    <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-white" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {formatDate(s.scheduledDate)} • {s.scheduledTime || 'Cả ngày'}
                    </span>
                    <p className="text-sm font-semibold text-slate-800 mt-0.5">{s.title}</p>
                    <span className="text-xs text-slate-500">{formatCareType(s.careType)}</span>
                  </div>
                ))}
                {/* Health Records */}
                {pet.healthRecords?.slice(0, 2).map((h: any) => (
                  <div key={h.id} className="relative">
                    <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-rose-500 ring-4 ring-white" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {formatDate(h.date)} • Khám bệnh
                    </span>
                    <p className="text-sm font-semibold text-slate-800 mt-0.5">{h.diagnosis}</p>
                    <p className="text-xs text-slate-500">{h.treatment || h.notes}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SỨC KHỎE */}
        {activeTab === 'health' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800">Lịch Sử Khám Sức Khỏe & Chẩn Đoán</h3>
              <button
                onClick={() => setIsHealthModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm lần khám</span>
              </button>
            </div>

            {pet.healthRecords?.length === 0 ? (
              <EmptyState
                icon={HeartPulse}
                title="Chưa có hồ sơ sức khỏe"
                description="Ghi lại các lần khám thú y, theo dõi cân nặng và nhiệt độ của thú cưng."
                actionText="Thêm lần khám đầu tiên"
                onAction={() => setIsHealthModalOpen(true)}
                actionIcon={Plus}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pet.healthRecords.map((record: any) => (
                  <div key={record.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">{formatDate(record.date)}</span>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        {record.weight && (
                          <span className="flex items-center gap-1">
                            <Weight className="w-3.5 h-3.5 text-emerald-600" />
                            {record.weight} kg
                          </span>
                        )}
                        {record.temperature && (
                          <span className="flex items-center gap-1">
                            <Thermometer className="w-3.5 h-3.5 text-rose-500" />
                            {record.temperature}°C
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{record.diagnosis}</p>
                      {record.symptoms && (
                        <p className="text-xs text-slate-500 mt-1">
                          <strong>Triệu chứng:</strong> {record.symptoms}
                        </p>
                      )}
                      {record.treatment && (
                        <p className="text-xs text-emerald-700 mt-1">
                          <strong>Điều trị:</strong> {record.treatment}
                        </p>
                      )}
                    </div>
                    {(record.clinicName || record.veterinarian) && (
                      <div className="pt-2 border-t border-slate-50 text-[11px] text-slate-400">
                        Khám tại: {record.clinicName} • {record.veterinarian}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: TIÊM PHÒNG */}
        {activeTab === 'vaccines' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800">Sổ Tiêm Chủng Vaccine</h3>
              <button
                onClick={() => setIsVaccineModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ghi nhận mũi tiêm</span>
              </button>
            </div>

            {pet.vaccinations?.length === 0 ? (
              <EmptyState
                icon={Syringe}
                title="Chưa có dữ liệu tiêm phòng"
                description="Theo dõi các mũi tiêm 7 bệnh, dại và lịch tiêm nhắc lại để bảo vệ sức khỏe bé."
                actionText="Thêm mũi tiêm"
                onAction={() => setIsVaccineModalOpen(true)}
                actionIcon={Plus}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pet.vaccinations.map((v: any) => {
                  const meta = formatVaccinationStatus(v.status);
                  return (
                    <div key={v.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-900">{v.vaccineName}</h4>
                        <Badge variant={meta.variant}>{meta.label}</Badge>
                      </div>
                      <div className="text-xs text-slate-500 space-y-1">
                        <p>Ngày tiêm: <strong>{formatDate(v.administeredDate)}</strong></p>
                        {v.nextDueDate && (
                          <p>Hạn tiêm nhắc: <strong className="text-emerald-700">{formatDate(v.nextDueDate)}</strong></p>
                        )}
                        {v.clinicName && <p>Cơ sở y tế: {v.clinicName}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: THUỐC */}
        {activeTab === 'medications' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800">Đơn Thuốc & Thực Phẩm Bổ Sung</h3>
              <button
                onClick={() => setIsMedModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Kê đơn thuốc</span>
              </button>
            </div>

            {pet.medications?.length === 0 ? (
              <EmptyState
                icon={Pill}
                title="Chưa có đơn thuốc nào"
                description="Quản lý liều lượng, tần suất và hướng dẫn sử dụng thuốc theo chỉ định thú y."
                actionText="Thêm đơn thuốc"
                onAction={() => setIsMedModalOpen(true)}
                actionIcon={Plus}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pet.medications.map((m: any) => {
                  const medStatus = formatMedicationStatus(m.status);
                  return (
                    <div key={m.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-900">{m.name}</h4>
                        <Badge variant={medStatus.variant}>{medStatus.label}</Badge>
                      </div>
                      <p className="text-xs text-slate-600">
                        Liều dùng: <strong>{m.dosage} {m.unit}</strong> • {m.frequency}
                      </p>
                      {m.instructions && (
                        <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          {m.instructions}
                        </p>
                      )}
                      <div className="text-[11px] text-slate-400">
                        Thời gian: {formatDate(m.startDate)} {m.endDate ? `đến ${formatDate(m.endDate)}` : ''}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: LỊCH CHĂM SÓC */}
        {activeTab === 'schedules' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800">Lịch Chăm Sóc & Routine</h3>
              <button
                onClick={() => setIsScheduleModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tạo lịch mới</span>
              </button>
            </div>

            {pet.careSchedules?.length === 0 ? (
              <EmptyState
                icon={CalendarClock}
                title="Chưa có lịch chăm sóc nào"
                description="Thiết lập lịch tắm, dắt đi dạo, cho ăn hoặc cắt móng định kỳ."
                actionText="Tạo lịch đầu tiên"
                onAction={() => setIsScheduleModalOpen(true)}
                actionIcon={Plus}
              />
            ) : (
              <div className="space-y-3">
                {pet.careSchedules.map((s: any) => (
                  <div
                    key={s.id}
                    className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-800">{s.title}</p>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                            {formatCareType(s.careType)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {formatDate(s.scheduledDate)} lúc {s.scheduledTime || 'Cả ngày'}
                        </p>
                      </div>
                    </div>
                    {s.status === 'COMPLETED' ? (
                      <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Đã xong
                      </span>
                    ) : (
                      <button
                        onClick={() => handleCompleteSchedule(s.id)}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-semibold transition-colors"
                      >
                        Hoàn thành
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 6: NHẬT KÝ */}
        {activeTab === 'diary' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800">Nhật Ký & Khoảnh Khắc</h3>
              <button
                onClick={() => setIsDiaryModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Viết nhật ký</span>
              </button>
            </div>

            {pet.diaries?.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="Chưa có bài nhật ký nào"
                description="Lưu lại những khoảnh khắc vui vẻ, tâm trạng và các hoạt động đáng nhớ cùng bé."
                actionText="Viết nhật ký đầu tiên"
                onAction={() => setIsDiaryModalOpen(true)}
                actionIcon={Plus}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pet.diaries.map((d: any) => {
                  const moodMeta = formatMood(d.mood);
                  return (
                    <div key={d.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3">
                      {d.imageUrl && (
                        <img
                          src={d.imageUrl}
                          alt={d.title}
                          className="w-full h-44 object-cover rounded-xl shadow-inner"
                        />
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">{formatDateTime(d.date)}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${moodMeta.color}`}>
                          {moodMeta.label}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-800">{d.title}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">{d.content}</p>
                      {d.activity && (
                        <p className="text-xs text-slate-500 pt-2 border-t border-slate-50">
                          🎯 Hoạt động: {d.activity}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tab Modals */}
      <HealthRecordModal
        isOpen={isHealthModalOpen}
        onClose={() => setIsHealthModalOpen(false)}
        onSubmit={handleSaveHealth}
        isLoading={isSaving}
      />
      <VaccinationModal
        isOpen={isVaccineModalOpen}
        onClose={() => setIsVaccineModalOpen(false)}
        onSubmit={handleSaveVaccine}
        isLoading={isSaving}
      />
      <MedicationModal
        isOpen={isMedModalOpen}
        onClose={() => setIsMedModalOpen(false)}
        onSubmit={handleSaveMed}
        isLoading={isSaving}
      />
      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSubmit={handleSaveSchedule}
        isLoading={isSaving}
        defaultPetId={id}
      />
      <DiaryModal
        isOpen={isDiaryModalOpen}
        onClose={() => setIsDiaryModalOpen(false)}
        onSubmit={handleSaveDiary}
        isLoading={isSaving}
      />
    </div>
  );
};
