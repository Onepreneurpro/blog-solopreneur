import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-heading font-extrabold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-purple-700 text-white font-black hover:bg-purple-800 shadow-md shadow-purple-900/20 border-0',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 border border-slate-200 font-bold shadow-xs',
    outline: 'border-2 border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-300 font-bold shadow-xs',
    ghost: 'text-slate-700 hover:bg-slate-100 hover:text-slate-950 font-bold',
    danger: 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:text-red-700 font-bold shadow-xs',
  };

  const sizes = {
    sm: 'px-3.5 py-1.5 text-xs',
    md: 'px-4.5 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
      {...props}
    >
      {children}
    </button>
  );
}
