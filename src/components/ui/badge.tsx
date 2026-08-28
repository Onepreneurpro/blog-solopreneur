import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'emerald' | 'indigo' | 'amber' | 'slate' | 'outline' | 'lime';
  children: React.ReactNode;
}

export function Badge({ variant = 'emerald', children, className = '', ...props }: BadgeProps) {
  const badgeVariants = {
    emerald: 'badge-emerald bg-[#A3E635]/30 text-slate-950 border border-[#86efac] font-black',
    lime: 'badge-lime bg-[#A3E635] text-slate-950 font-black shadow-2xs',
    indigo: 'badge-indigo bg-purple-100 text-purple-900 border border-purple-300 font-extrabold',
    amber: 'badge-amber bg-amber-100 text-amber-900 border border-amber-300 font-extrabold',
    slate: 'badge-slate bg-slate-100 text-slate-800 border border-slate-300 font-bold',
    outline: 'badge-outline bg-white/80 text-slate-900 border border-slate-300 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs transition-colors shadow-xs ${badgeVariants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
