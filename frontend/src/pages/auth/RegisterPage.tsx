import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.js';
import { useToast } from '../../contexts/ToastContext.js';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự').max(100),
    email: z.string().email('Địa chỉ email không đúng định dạng'),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const { register: registerAuth } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    try {
      await registerAuth({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      success('Đăng ký tài khoản thành công! Bắt đầu chăm sóc thú cưng ngay.');
      navigate('/dashboard');
    } catch (err: any) {
      error(err.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-100">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Tạo tài khoản</h1>
        <p className="text-sm text-slate-500 mt-2">
          Đăng ký miễn phí và trải nghiệm trợ lý chăm sóc thú cưng thông minh bằng AI.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Họ và tên <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Nguyễn Văn An"
              {...register('name')}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                errors.name
                  ? 'border-rose-300 focus:ring-rose-200 bg-rose-50/20'
                  : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-100'
              }`}
            />
          </div>
          {errors.name && (
            <p className="text-xs text-rose-500 mt-1 font-medium">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
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

        {/* Password */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Mật khẩu <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type="password"
              placeholder="Tối thiểu 6 ký tự"
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

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Xác nhận mật khẩu <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type="password"
              placeholder="Nhập lại mật khẩu"
              {...register('confirmPassword')}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                errors.confirmPassword
                  ? 'border-rose-300 focus:ring-rose-200 bg-rose-50/20'
                  : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-100'
              }`}
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-rose-500 mt-1 font-medium">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl font-semibold text-sm transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
        >
          {isLoading ? (
            'Đang khởi tạo tài khoản...'
          ) : (
            <>
              <span>Đăng ký tài khoản</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Login Link */}
      <div className="mt-8 text-center text-xs text-slate-500">
        Đã có tài khoản?{' '}
        <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-semibold">
          Đăng nhập ngay
        </Link>
      </div>
    </div>
  );
};
