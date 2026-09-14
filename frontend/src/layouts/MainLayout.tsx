import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar.js';
import { Header } from '../components/common/Header.js';
import { MobileSidebar } from '../components/common/MobileSidebar.js';

export const MainLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Drawer */}
      <MobileSidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Content wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header onOpenMobileMenu={() => setMobileMenuOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
