import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal.js';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  variant?: 'danger' | 'warning' | 'primary';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Xác nhận hành động',
  message,
  confirmText = 'Xác nhận xóa',
  cancelText = 'Hủy bỏ',
  isLoading = false,
  variant = 'danger',
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="flex flex-col items-center text-center space-y-4">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center ${
            variant === 'danger'
              ? 'bg-rose-100 text-rose-600'
              : 'bg-amber-100 text-amber-600'
          }`}
        >
          <AlertTriangle className="w-6 h-6" />
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
        <div className="flex items-center gap-3 w-full pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all shadow-sm disabled:opacity-50 ${
              variant === 'danger'
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
            }`}
          >
            {isLoading ? 'Đang xử lý...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};
