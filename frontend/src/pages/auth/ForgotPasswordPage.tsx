import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext.js';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { success } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setSubmitted(true);
      success('Hướng dẫn khôi phục mật khẩu đã được gửi đến email của bạn.');
    }, 1000);
  };

  return (
    <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-100">
      <Link
        to="/login"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại đăng nhập</span>
      </Link>

      {submitted ? (
        <div className="text-center py-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Đã gửi email khôi phục</h2>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            Chúng tôi đã gửi đường dẫn đặt lại mật khẩu đến địa chỉ <strong>{email}</strong>. Vui lòng kiểm tra hòm thư đến hoặc mục thư rác.
          </p>
          <div className="mt-8">
            <Link
              to="/login"
              className="inline-block w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              Về trang đăng nhập
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quên mật khẩu?</h1>
            <p className="text-sm text-slate-500 mt-2">
              Nhập email đã đăng ký của bạn. Chúng tôi sẽ gửi đường link hỗ trợ bạn thiết lập lại mật khẩu an toàn.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email của bạn
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tenban@email.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition-all shadow-md shadow-emerald-500/20 disabled:opacity-60"
            >
              {isLoading ? 'Đang gửi mã...' : 'Gửi link khôi phục'}
            </button>
          </form>
        </>
      )}
    </div>
  );
};
