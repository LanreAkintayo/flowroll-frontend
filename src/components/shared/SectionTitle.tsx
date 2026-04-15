import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SectionTitleProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  rightElement?: React.ReactNode;
}

export const SectionTitle = ({ 
  title, 
  description, 
  icon: Icon, 
  rightElement 
}: SectionTitleProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
          {Icon && <Icon className="w-8 h-8 text-emerald-500" />}
          {title}
        </h1>
        {description && (
          <p className="text-lg text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
            {description}
          </p>
        )}
      </div>
      
      {rightElement && (
        <div className="flex items-center gap-3">
          {rightElement}
        </div>
      )}
    </div>
  );
};