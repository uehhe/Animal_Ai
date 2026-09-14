import React, { useState, useEffect, useRef } from 'react';
import { Menu, Bell, PawPrint, ChevronDown, Check, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.js';
import { usePet } from '../../contexts/PetContext.js';
import { notificationApi } from '../../services/notification.service.js';
import { NotificationItem } from '../../types/index.js';
import { formatRelativeTime } from '../../utils/date.js';

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const { user } = useAuth();
  const { pets, selectedPetId, selectPet } = usePet();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showPetMenu, setShowPetMenu] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const petRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await notificationApi.getNotifications();
        setNotifications(data.notifications.slice(0, 5));
        setUnreadCount(data.unreadCount);
      } catch {
        // silent fail in header polling
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifMenu(false);
      }
      if (petRef.current && !petRef.current.contains(e.target as Node)) {
        setShowPetMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const currentPet = pets.find((p) => p.id === selectedPetId);

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-20">
      {/* Left: Mobile hamburger & Pet Selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          aria-label="Mở thanh điều hướng"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Pet Quick Switcher */}
        <div className="relative" ref={petRef}>
          <button
            onClick={() => setShowPetMenu(!showPetMenu)}
            className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/70 rounded-xl transition-all text-xs font-semibold text-slate-700 shadow-sm"
          >
            {currentPet ? (
              <>
                <img
                  src={currentPet.avatar || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=100&q=80'}
                  alt={currentPet.name}
                  className="w-5 h-5 rounded-full object-cover ring-1 ring-emerald-500"
                />
                <span className="max-w-[100px] truncate">{currentPet.name}</span>
              </>
            ) : (
              <>
                <PawPrint className="w-4 h-4 text-emerald-600" />
                <span>Tất cả thú cưng</span>
              </>
            )}
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Pet Switcher Dropdown */}
          {showPetMenu && (
            <div className="absolute left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-fade-in">
              <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Chọn thú cưng theo dõi
              </div>
              <button
                onClick={() => {
                  selectPet(null);
                  setShowPetMenu(false);
                }}
                className="w-full flex items-center justify-between px-3.5 py-2 text-xs text-left font-medium hover:bg-slate-50 transition-colors text-slate-700"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                    <PawPrint className="w-3.5 h-3.5" />
                  </div>
                  <span>Tất cả thú cưng</span>
                </div>
                {selectedPetId === null && <Check className="w-4 h-4 text-emerald-600" />}
              </button>

              <div className="my-1 border-t border-slate-100" />

              {pets.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    selectPet(p.id);
                    setShowPetMenu(false);
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2 text-xs text-left font-medium hover:bg-slate-50 transition-colors text-slate-700"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={p.avatar || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=100&q=80'}
                      alt={p.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-slate-800">{p.name}</p>
                      <p className="text-[10px] text-slate-400">{p.breed}</p>
                    </div>
                  </div>
                  {selectedPetId === p.id && <Check className="w-4 h-4 text-emerald-600" />}
                </button>
              ))}

              <div className="my-1 border-t border-slate-100" />
              <button
                onClick={() => {
                  setShowPetMenu(false);
                  navigate('/pets');
                }}
                className="w-full px-3.5 py-1.5 text-xs text-center font-medium text-emerald-600 hover:text-emerald-700"
              >
                + Quản lý thú cưng
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right: AI Quick Action, Notifications & Profile */}
      <div className="flex items-center gap-3">
        {/* Quick Ask AI button */}
        <Link
          to="/ai-assistant"
          className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 border border-emerald-200/60 rounded-xl text-xs font-semibold text-emerald-700 transition-all shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Hỏi AI ngay</span>
        </Link>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            aria-label="Thông báo"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 ring-2 ring-white animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-50 animate-fade-in">
              <div className="flex items-center justify-between px-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm text-slate-800">Thông báo</h4>
                  {unreadCount > 0 && (
                    <span className="text-[11px] bg-rose-50 text-rose-600 font-semibold px-2 py-0.5 rounded-full">
                      {unreadCount} mới
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Đã đọc tất cả
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    Không có thông báo nào mới.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <Link
                      key={n.id}
                      to={n.link || '/notifications'}
                      onClick={() => setShowNotifMenu(false)}
                      className={`block p-3.5 hover:bg-slate-50 transition-colors ${
                        !n.isRead ? 'bg-emerald-50/30' : ''
                      }`}
                    >
                      <p className="text-xs font-semibold text-slate-800 mb-0.5">{n.title}</p>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{n.message}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {formatRelativeTime(n.createdAt)}
                      </span>
                    </Link>
                  ))
                )}
              </div>

              <div className="pt-2 px-4 border-t border-slate-100 text-center">
                <Link
                  to="/notifications"
                  onClick={() => setShowNotifMenu(false)}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 block py-1"
                >
                  Xem tất cả thông báo →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar */}
        <Link
          to="/profile"
          className="flex items-center gap-2.5 pl-2 hover:opacity-90 transition-opacity"
        >
          <img
            src={user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.name || 'User'}`}
            alt={user?.name}
            className="w-9 h-9 rounded-xl object-cover ring-2 ring-emerald-500/20 bg-emerald-50"
          />
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-slate-800 leading-tight">{user?.name}</p>
            <p className="text-[10px] text-slate-400 font-medium">
              {user?.role === 'ADMIN' ? 'Quản trị viên' : 'Chủ thú cưng'}
            </p>
          </div>
        </Link>
      </div>
    </header>
  );
};
