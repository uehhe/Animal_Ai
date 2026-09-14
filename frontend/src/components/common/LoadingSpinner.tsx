import React from 'react';

export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; text?: string }> = ({
  size = 'md',
  text,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 gap-3">
      <div
        className={`${sizeClasses[size]} border-slate-200 border-t-emerald-600 rounded-full animate-spin`}
      />
      {text && <p className="text-sm font-medium text-slate-500 animate-pulse">{text}</p>}
    </div>
  );
};

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm animate-pulse space-y-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-200" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
            </div>
          </div>
          <div className="space-y-2 pt-2">
            <div className="h-3 bg-slate-100 rounded w-full" />
            <div className="h-3 bg-slate-100 rounded w-5/6" />
          </div>
        </div>
      ))}
    </div>
  );
};
