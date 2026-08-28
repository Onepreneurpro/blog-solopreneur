import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  const hasBg = className?.includes('bg-');
  const hasBorder = className?.includes('border');

  return (
    <div
      className={twMerge(
        clsx(
          !hasBg && 'bg-slate-900',
          !hasBorder && 'border border-slate-800/80',
          'backdrop-blur-md rounded-2xl shadow-md transition-all duration-300 overflow-hidden',
          className
        )
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={twMerge(clsx('p-5 border-b border-slate-800/80', className))}>{children}</div>;
}

export function CardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={twMerge(clsx('p-5', className))}>{children}</div>;
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={twMerge(clsx('p-5 bg-slate-900/90 border-t border-slate-800/80 flex items-center justify-between', className))}>
      {children}
    </div>
  );
}
