import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { AuthLayout } from './layouts/AuthLayout.js';
import { MainLayout } from './layouts/MainLayout.js';
import { AdminLayout } from './layouts/AdminLayout.js';

// Route Guards
import { ProtectedRoute } from './routes/ProtectedRoute.js';
import { AdminRoute } from './routes/AdminRoute.js';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage.js';
import { RegisterPage } from './pages/auth/RegisterPage.js';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage.js';

// Main Application Pages
import { DashboardPage } from './pages/dashboard/DashboardPage.js';
import { PetsPage } from './pages/pets/PetsPage.js';
import { PetDetailPage } from './pages/pets/PetDetailPage.js';
import { SchedulePage } from './pages/schedule/SchedulePage.js';
import { HealthPage } from './pages/health/HealthPage.js';
import { VaccinationsPage } from './pages/vaccinations/VaccinationsPage.js';
import { MedicationsPage } from './pages/medications/MedicationsPage.js';
import { DiaryPage } from './pages/diary/DiaryPage.js';
import { AIAssistantPage } from './pages/ai/AIAssistantPage.js';
import { NotificationsPage } from './pages/notifications/NotificationsPage.js';
import { ReportsPage } from './pages/reports/ReportsPage.js';
import { ProfilePage } from './pages/profile/ProfilePage.js';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage.js';
import { AdminUsersPage } from './pages/admin/AdminUsersPage.js';
import { AdminPetsPage } from './pages/admin/AdminPetsPage.js';

export const App: React.FC = () => {
  return (
    <Routes>
      {/* 1. Public Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      {/* 2. Protected User Application Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/pets" element={<PetsPage />} />
          <Route path="/pets/:id" element={<PetDetailPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/health" element={<HealthPage />} />
          <Route path="/vaccinations" element={<VaccinationsPage />} />
          <Route path="/medications" element={<MedicationsPage />} />
          <Route path="/diary" element={<DiaryPage />} />
          <Route path="/ai-assistant" element={<AIAssistantPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* 3. Protected Admin Routes */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/pets" element={<AdminPetsPage />} />
          </Route>
        </Route>
      </Route>

      {/* 4. Fallback Catch-all route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default App;
