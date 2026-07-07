import React from 'react';
import { cn } from '../../lib/utils';

const variants = {
  default: 'bg-slate-950 text-white shadow-sm hover:bg-slate-800',
  secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
  outline: 'border border-slate-200 bg-white text-slate-900 shadow-sm hover:bg-slate-50',
  ghost: 'text-slate-700 hover:bg-slate-100 hover:text-slate-950',
  destructive: 'bg-red-600 text-white shadow-sm hover:bg-red-700',
};

const sizes = {
  default: 'h-10 px-4 py-2',
  sm: 'h-8 px-3 text-xs',
  icon: 'h-10 w-10',
};

export function Button({ className, variant = 'default', size = 'default', ...props }) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
