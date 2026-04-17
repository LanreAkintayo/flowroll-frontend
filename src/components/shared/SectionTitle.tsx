import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface SectionTitleProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  rightElement?: ReactNode;
}

export function SectionTitle({ 
  title, 
  description, 
  icon: Icon, 
  rightElement 
}: SectionTitleProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      
      {/* Header content */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
          {Icon && <Icon className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />}
          {title}
        </h1>
        
        {description && (
          <p className="text-lg text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
            {description}
          </p>
        )}
      </div>
      
      {/* Optional right-aligned actions */}
      {rightElement && (
        <div className="flex items-center gap-3">
          {rightElement}
        </div>
      )}
      
    </div>
  );
}