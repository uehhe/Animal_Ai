import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Shield, Calendar, Lock, Camera, Check, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.js';
import { usePet } from '../../contexts/PetContext.js';
import { useToast } from '../../contexts/ToastContext.js';
import { authApi } from '../../services/auth.service.js';
import { PageHeader } from '../../components/common/PageHeader.js';
import { formatDate } from '../../utils/date.js';

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự').max(100, 'Họ tên không quá 100 ký tự'),
  avatar: z.string().url('Đường dẫn ảnh đại diện không hợp lệ').or(z.literal('')).optional(),
});

const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
    newPassword: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự').max(50, 'Mật khẩu mới không quá 50 ký tự'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu mới'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

type UpdateProfileValues = z.infer<typeof updateProfileSchema>;
type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

export const ProfilePage: React.FC = () => {
  const { user, updateUser, logout } = useAuth();
  const { pets } = usePet();
  const { success, error } = useToast();

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const profileForm = useForm<UpdateProfileValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user?.name || '',
      avatar: user?.avatar || '',
    },
  });

  const passwordForm = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const handleUpdateProfile = async (values: UpdateProfileValues) => {
    setIsUpdatingProfile(true);
    try {
      const updated = await authApi.updateProfile({
        name: values.name,
        avatar: values.avatar || undefined,
      });
      updateUser(updated);
      success('Cập nhật hồ sơ thành công! 🎉');
    } catch (err: any) {
      error(err.message || 'Lỗi cập nhật hồ sơ');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (values: ChangePasswordValues) => {
    setIsChangingPassword(true);
    try {
      await authApi.changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      success('Đổi mật khẩu thành công!');
      passwordForm.reset();
    } catch (err: any) {
      error(err.message || 'Lỗi đổi mật khẩu');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleChoosePresetAvatar = (avatarUrl: string) => {
    profileForm.setValue('avatar', avatarUrl);
  };

  const presetAvatars = [
    `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user?.name || 'User')}`,
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.name || 'Felix')}`,
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
  ];

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      <PageHeader
        title="Hồ Sơ Cá Nhân"
        subtitle="Quản lý thông tin tài khoản, cập nhật ảnh đại diện và đổi mật khẩu bảo mật"
      />

      {/* Top Banner Card */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-600/10 flex flex-col sm:flex-row items-center gap-6">
        <div className="relative">
          <img
            src={user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.name || 'User'}`}
            alt={user?.name}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-4 ring-white/30 shadow-2xl bg-white/10"
          />
          <div className="absolute -bottom-2 -right-2 p-1.5 bg-emerald-500 rounded-xl ring-2 ring-white text-white">
            <Camera className="w-4 h-4" />
          </div>
        </div>

        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
            <h2 className="text-2xl sm:text-3xl font-bold">{user?.name}</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-md">
              {user?.role === 'ADMIN' ? 'Quản Trị Viên' : 'Chủ Thú Cưng'}
            </span>
          </div>
          <p className="text-sm text-emerald-100/90 flex items-center justify-center sm:justify-start gap-1.5">
            <Mail className="w-4 h-4 text-emerald-300" />
            <span>{user?.email}</span>
          </p>
          <p className="text-xs text-emerald-200/80 flex items-center justify-center sm:justify-start gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>Tham gia từ {user?.createdAt ? formatDate(user.createdAt) : '2026'}</span>
            <span className="mx-1">•</span>
            <span>Đang chăm sóc {pets.length} bé thú cưng</span>
          </p>
        </div>

        <div>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-semibold backdrop-blur-md transition-all border border-white/20 shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Update Profile Form */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-600" />
              <span>Thông Tin Tài Khoản</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">Cập nhật họ tên hiển thị và liên kết ảnh đại diện</p>
          </div>

          <form onSubmit={profileForm.handleSubmit(handleUpdateProfile)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Họ và tên <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                {...profileForm.register('name')}
                placeholder="Nhập họ và tên"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                  profileForm.formState.errors.name
                    ? 'border-rose-300 focus:ring-rose-200 bg-rose-50/20'
                    : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-100'
                }`}
              />
              {profileForm.formState.errors.name && (
                <p className="text-xs text-rose-500 mt-1">{profileForm.formState.errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Đường dẫn Avatar (URL)
              </label>
              <input
                type="url"
                {...profileForm.register('avatar')}
                placeholder="https://example.com/avatar.jpg"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
              {profileForm.formState.errors.avatar && (
                <p className="text-xs text-rose-500 mt-1">{profileForm.formState.errors.avatar.message}</p>
              )}
            </div>

            {/* Avatar Presets */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Hoặc chọn Avatar mẫu nhanh:
              </label>
              <div className="flex items-center gap-2.5">
                {presetAvatars.map((url, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleChoosePresetAvatar(url)}
                    className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-slate-200 hover:ring-emerald-500 transition-all transform hover:scale-105"
                  >
                    <img src={url} alt="Preset" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email đăng nhập
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm cursor-not-allowed"
              />
              <p className="text-[11px] text-slate-400 mt-1">Email đăng nhập là định danh cố định không thể thay đổi.</p>
            </div>

            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {isUpdatingProfile ? (
                'Đang lưu...'
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Lưu thay đổi hồ sơ</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Col: Change Password Form */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-indigo-600" />
              <span>Đổi Mật Khẩu</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">Nên sử dụng mật khẩu an toàn tối thiểu 6 ký tự</p>
          </div>

          <form onSubmit={passwordForm.handleSubmit(handleChangePassword)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Mật khẩu hiện tại <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                {...passwordForm.register('oldPassword')}
                placeholder="••••••••"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                  passwordForm.formState.errors.oldPassword
                    ? 'border-rose-300 focus:ring-rose-200 bg-rose-50/20'
                    : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'
                }`}
              />
              {passwordForm.formState.errors.oldPassword && (
                <p className="text-xs text-rose-500 mt-1">{passwordForm.formState.errors.oldPassword.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Mật khẩu mới <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                {...passwordForm.register('newPassword')}
                placeholder="••••••••"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                  passwordForm.formState.errors.newPassword
                    ? 'border-rose-300 focus:ring-rose-200 bg-rose-50/20'
                    : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'
                }`}
              />
              {passwordForm.formState.errors.newPassword && (
                <p className="text-xs text-rose-500 mt-1">{passwordForm.formState.errors.newPassword.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Xác nhận mật khẩu mới <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                {...passwordForm.register('confirmPassword')}
                placeholder="••••••••"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                  passwordForm.formState.errors.confirmPassword
                    ? 'border-rose-300 focus:ring-rose-200 bg-rose-50/20'
                    : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'
                }`}
              />
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-xs text-rose-500 mt-1">{passwordForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isChangingPassword}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {isChangingPassword ? (
                'Đang xử lý...'
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>Cập nhật mật khẩu mới</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
