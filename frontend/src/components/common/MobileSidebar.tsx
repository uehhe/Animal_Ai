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
  X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.js';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout, isAdmin } = useAuth();

  if (!isOpen) return null;

  const navigation = [
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
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="relative w-72 max-w-[80vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-slide-in-left">
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white">
              <PawPrint className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg text-emerald-700">PetCare AI</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
            aria-label="Đóng menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? item.highlight
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
                        : 'bg-emerald-50 text-emerald-700 font-semibold'
                      : item.highlight
                      ? 'text-emerald-600 hover:bg-emerald-50'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}

          {isAdmin && (
            <div className="pt-4 mt-4 border-t border-slate-100">
              <NavLink
                to="/admin"
                onClick={onClose}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-indigo-600 hover:bg-indigo-50"
              >
                <ShieldCheck className="w-5 h-5" />
                <span>Quản Trị Hệ Thống</span>
              </NavLink>
            </div>
          )}
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.name || 'User'}`}
              alt={user?.name}
              className="w-9 h-9 rounded-full object-cover"
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-800 truncate">{user?.name}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className="text-slate-400 hover:text-rose-600 p-2"
            title="Đăng xuất"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
