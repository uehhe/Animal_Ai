import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { PawPrint, Sparkles, ShieldCheck, HeartPulse, CalendarClock } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left Column: Hero Presentation */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 text-white p-12 flex-col justify-between overflow-hidden">
        {/* Background decorative circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-emerald-400/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-teal-400/20 blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-emerald-300 shadow-xl">
            <PawPrint className="w-7 h-7" />
          </div>
          <div>
            <span className="text-2xl font-black tracking-tight text-white">PetCare AI</span>
            <span className="block text-xs uppercase tracking-widest font-semibold text-emerald-200">
              Smart Pet Care Platform
            </span>
          </div>
        </div>

        {/* Hero Copy & Feature Badges */}
        <div className="relative z-10 space-y-8 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-emerald-300" />
            <span>Trợ lý AI Đồng Hành Chăm Sóc Thú Cưng Cá Nhân Hóa</span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Chăm sóc những người bạn nhỏ chu đáo & khoa học hơn.
          </h2>

          <p className="text-base text-emerald-100/80 leading-relaxed">
            Hệ thống toàn diện giúp bạn quản lý sức khỏe, lịch tiêm phòng, đơn thuốc, lịch chăm sóc định kỳ và nhận tư vấn thông minh từ Trợ lý AI dựa trên hồ sơ thực tế.
          </p>

          {/* Feature Highlights */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <CalendarClock className="w-6 h-6 text-emerald-300 mb-2" />
              <h4 className="font-semibold text-sm text-white">Lịch Chăm Sóc Tự Động</h4>
              <p className="text-xs text-emerald-100/70 mt-1">Nhắc nhở uống thuốc, tiêm phòng và vệ sinh đúng hẹn.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <HeartPulse className="w-6 h-6 text-teal-300 mb-2" />
              <h4 className="font-semibold text-sm text-white">Theo Dõi Sức Khỏe</h4>
              <p className="text-xs text-emerald-100/70 mt-1">Biểu đồ cân nặng, lịch sử khám bệnh và phác đồ điều trị.</p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center justify-between text-xs text-emerald-200/60 pt-8 border-t border-white/10">
          <span>© 2026 PetCare AI. All rights reserved.</span>
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Bảo mật dữ liệu 100%</span>
          </div>
        </div>
      </div>

      {/* Right Column: Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md">
              <PawPrint className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold text-slate-800">PetCare AI</span>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
};
