import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getActiveTheme, isDarkTheme } from '@/lib/theme';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { pageSlug: string };
}

export default async function StaticCustomPage({ params }: PageProps) {
  const pageSlug = params?.pageSlug;
  let activeTheme = 'modern-bento';
  let page: any = null;

  try {
    activeTheme = await getActiveTheme();
    if (!pageSlug) notFound();
    page = await prisma.page.findUnique({
      where: { slug: pageSlug },
    });

    if (!page || page.status !== 'PUBLISHED') {
      notFound();
    }
  } catch (err) {
    if (!page) notFound();
  }

  const isDark = isDarkTheme(activeTheme);

  return (
    <div className={`py-16 min-h-screen relative overflow-hidden ${
      isDark ? 'bg-[#0a0915] text-white' : 'bg-[#faf8f5] text-slate-900'
    }`}>
      
      {/* AMBIENT GLOW (DARK MODE ONLY) */}
      {isDark && <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[160px] pointer-events-none" />}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className={`p-8 sm:p-12 rounded-3xl border shadow-xl space-y-6 ${
          isDark ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white border-2 border-slate-200 text-slate-900'
        }`}>
          <h1 className={`text-3xl sm:text-4xl font-heading font-black tracking-tight ${
            isDark ? 'text-white' : 'text-slate-950'
          }`}>
            {page.title}
          </h1>
          <div
            className={`prose max-w-none leading-relaxed space-y-4 pt-6 border-t ${
              isDark ? 'prose-invert border-slate-800 text-slate-300' : 'border-slate-200 text-slate-800'
            }`}
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </div>
      </div>
    </div>
  );
}
