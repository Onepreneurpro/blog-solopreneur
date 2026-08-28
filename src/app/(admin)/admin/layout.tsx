import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { AdminLayoutClient } from '@/components/admin/AdminLayoutClient';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user || (user.role !== 'ADMIN' && user.role !== 'EDITOR')) {
    redirect('/login');
  }

  return (
    <AdminLayoutClient user={{ name: user.name, email: user.email, role: user.role }}>
      {children}
    </AdminLayoutClient>
  );
}
