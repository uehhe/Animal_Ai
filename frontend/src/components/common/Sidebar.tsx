import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  PawPrint,
  CalendarClock,
  HeartPulse,
  Syringe,
  Pill,
  BookOpen,
  Sparkles,
  Bell,
  BarChart3,
  User,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.js';

interface NavItem {
  name: string;
  to: string;
  icon: React.ElementType;
  badge?: number;
  highlight?: boolean;
}

export const Sidebar: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();

  const navigation: NavItem[] = [
    { name: 'Tổng quan', to: '/dashboard', icon: LayoutDashboard },
    { name: 'Thú cưng', to: '/pets', icon: PawPrint },
    { name: 'Lịch chăm sóc', to: '/schedule', icon: CalendarClock },
    { name: 'Sức khỏe', to: '/health', icon: HeartPulse },
    { name: 'Tiêm phòng', to: '/vaccinations', icon: Syringe },
    { name: 'Thuốc', to: '/medications', icon: Pill },
    { name: 'Nhật ký', to: '/diary', icon: BookOpen },
    { name: 'Trợ lý AI', to: '/ai-assistant', icon: Sparkles, highlight: true },
    { name: 'Thông báo', to: '/notifications', icon: Bell },
    { name: 'Báo cáo', to: '/reports', icon: BarChart3 },
    { name: 'Hồ sơ cá nhân', to: '/profile', icon: User },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-100 flex flex-col shrink-0 h-screen sticky top-0 select-none z-30 hidden lg:flex">
      {/* Brand Logo */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100 gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-500/20 text-white">
          <PawPrint className="w-6 h-6" />
        </div>
        <div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent">
            PetCare AI
          </span>
          <span className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400">
            Smart Pet Assistant
          </span>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Menu Chính
        </div>
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? item.highlight
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm shadow-emerald-500/20'
                      : 'bg-emerald-50 text-emerald-700 font-semibold'
                    : item.highlight
                    ? 'text-emerald-600 hover:bg-emerald-50/70'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <Icon className={`w-5 h-5 shrink-0 ${item.highlight ? 'text-emerald-500' : ''}`} />
              <span className="flex-1 truncate">{item.name}</span>
              {item.highlight && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-emerald-100 text-emerald-800 rounded-md">
                  AI
                </span>
              )}
            </NavLink>
          );
        })}

        {/* Admin Link if user is Admin */}
        {isAdmin && (
          <div className="pt-4 mt-4 border-t border-slate-100">
            <div className="px-3 pb-2 text-[11px] font-semibold text-indigo-500 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Quản Trị Viên
            </div>
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <span>Khu Vực Quản Trị</span>
            </NavLink>
          </div>
        )}
      </div>

      {/* User Footer & Logout */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3 p-2 rounded-xl">
          <img
            src={user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.name || 'User'}`}
            alt={user?.name}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-500/20 bg-emerald-100"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-800 truncate">{user?.name}</p>
            <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
            title="Đăng xuất"
            aria-label="Đăng xuất khỏi hệ thống"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
