'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

interface RootLayoutWrapperProps {
  children: React.ReactNode;
  user: any;
  menuItems: any[];
  footerMenusMap: any;
}

export function RootLayoutWrapper({
  children,
  user,
  menuItems,
  footerMenusMap,
}: RootLayoutWrapperProps) {
  const pathname = usePathname();

  // Standalone routes: Funnels public pages (/funnel/...) and Page Builder (/admin/tunnels/.../builder)
  const isStandalonePage =
    pathname?.startsWith('/funnel/') ||
    pathname?.includes('/builder') ||
    pathname?.startsWith('/admin');

  const isFunnelOrBuilderPage = pathname?.startsWith('/funnel/') || pathname?.includes('/builder');

  if (isFunnelOrBuilderPage) {
    return <main className="min-h-screen w-full bg-slate-950 flex flex-col">{children}</main>;
  }

  if (pathname?.startsWith('/admin')) {
    return <main className="flex-grow">{children}</main>;
  }

  return (
    <>
      <Header user={user} menuItems={menuItems} />
      <main className="flex-grow">{children}</main>
      <Footer footerMenus={footerMenusMap} />
    </>
  );
}
