import React from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, Users, PawPrint, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.js';

export const AdminLayout: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Admin Topbar */}
      <header className="h-16 bg-slate-900 text-white flex items-center justify-between px-6 sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center text-white shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-white">PetCare AI</span>
              <span className="block text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                Admin Console
              </span>
            </div>
          </div>

          <div className="h-5 w-px bg-slate-700 hidden sm:block" />

          <nav className="hidden sm:flex items-center gap-1 text-xs">
            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
                  isActive ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`
              }
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Tổng quan</span>
            </NavLink>
            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
                  isActive ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`
              }
            >
              <Users className="w-4 h-4" />
              <span>Người dùng</span>
            </NavLink>
            <NavLink
              to="/admin/pets"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
                  isActive ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`
              }
            >
              <PawPrint className="w-4 h-4" />
              <span>Thú cưng hệ thống</span>
            </NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Về App</span>
          </Link>
          <div className="flex items-center gap-2 pl-2 border-l border-slate-700 text-xs">
            <span className="font-semibold text-slate-300">{user?.name}</span>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto animate-fade-in">
        <Outlet />
      </main>
    </div>
  );
};
