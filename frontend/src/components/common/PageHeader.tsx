import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  children?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  badge,
  children,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
          {badge}
        </div>
        {subtitle && <p className="text-sm text-slate-500 mt-1 leading-relaxed">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-3 shrink-0 flex-wrap">{children}</div>}
    </div>
  );
};
