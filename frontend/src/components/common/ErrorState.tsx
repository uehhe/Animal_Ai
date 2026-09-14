import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'Đã xảy ra lỗi trong quá trình tải dữ liệu.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-rose-50/50 rounded-2xl border border-rose-100">
      <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-semibold text-rose-900 mb-1">Không thể tải thông tin</h3>
      <p className="text-xs text-rose-700 max-w-sm mb-4 leading-relaxed">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-medium transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Thử lại
        </button>
      )}
    </div>
  );
};
