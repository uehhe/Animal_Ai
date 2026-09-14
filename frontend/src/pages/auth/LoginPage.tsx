import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Sparkles, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.js';
import { useToast } from '../../contexts/ToastContext.js';

const loginSchema = z.object({
  email: z.string().email('Địa chỉ email không đúng định dạng'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      const loggedInUser = await login(values);
      success(`Chào mừng ${loggedInUser.name} quay trở lại! 👋`);
      if (loggedInUser.role === 'ADMIN' && from === '/dashboard') {
        navigate('/admin');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      error(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (email: string, pass: string) => {
    setValue('email', email);
    setValue('password', pass);
    onSubmit({ email, password: pass });
  };

  return (
    <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-100">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Đăng nhập</h1>
        <p className="text-sm text-slate-500 mt-2">
          Chào mừng bạn quay lại! Nhập thông tin để tiếp tục chăm sóc thú cưng của mình.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Field */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Email <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              placeholder="tenban@email.com"
              {...register('email')}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                errors.email
                  ? 'border-rose-300 focus:ring-rose-200 bg-rose-50/20'
                  : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-100'
              }`}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-rose-500 mt-1 font-medium">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Mật khẩu <span className="text-rose-500">*</span>
            </label>
            <Link
              to="/forgot-password"
              className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Quên mật khẩu?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type="password"
              placeholder="••••••••"
              {...register('password')}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                errors.password
                  ? 'border-rose-300 focus:ring-rose-200 bg-rose-50/20'
                  : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-100'
              }`}
            />
          </div>
          {errors.password && (
            <p className="text-xs text-rose-500 mt-1 font-medium">{errors.password.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl font-semibold text-sm transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
        >
          {isLoading ? (
            'Đang xác thực...'
          ) : (
            <>
              <span>Đăng nhập vào hệ thống</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Demo Account Quick Access */}
      <div className="mt-8 pt-6 border-t border-slate-100">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Tài khoản Demo trải nghiệm nhanh</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => handleQuickLogin('demo@petcare.com', 'Demo@123456')}
            disabled={isLoading}
            className="flex items-center gap-2 p-2.5 rounded-xl border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-100/70 text-emerald-800 text-xs font-medium text-left transition-colors"
          >
            <User className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold">Chủ Thú Cưng</p>
              <p className="text-[10px] text-emerald-600/80">demo@petcare.com</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('admin@petcare.com', 'Admin@123456')}
            disabled={isLoading}
            className="flex items-center gap-2 p-2.5 rounded-xl border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-100/70 text-indigo-800 text-xs font-medium text-left transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
            <div>
              <p className="font-bold">Quản Trị Viên</p>
              <p className="text-[10px] text-indigo-600/80">admin@petcare.com</p>
            </div>
          </button>
        </div>
      </div>

      {/* Register Link */}
      <div className="mt-6 text-center text-xs text-slate-500">
        Chưa có tài khoản?{' '}
        <Link to="/register" className="text-emerald-600 hover:text-emerald-700 font-semibold">
          Đăng ký tài khoản mới
        </Link>
      </div>
    </div>
  );
};
