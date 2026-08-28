import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { ArrowRight, BookOpen } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';
import { getActiveTheme, isDarkTheme } from '@/lib/theme';

export const dynamic = 'force-dynamic';

interface BlogPageProps {
  searchParams: { category?: string; search?: string };
}

export default async function BlogListingPage({ searchParams }: BlogPageProps) {
  const safeParams = searchParams || {};
  const selectedCatSlug = safeParams.category;
  const searchQuery = safeParams.search;

  if (selectedCatSlug) {
    redirect(`/blog/categorie/${selectedCatSlug}`);
  }

  let categories: any[] = [];
  let articles: any[] = [];
  let activeTheme = 'modern-bento';

  try {
    activeTheme = await getActiveTheme();
    categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });

    const whereCondition: any = {
      status: 'PUBLISHED',
    };

    if (searchQuery) {
      whereCondition.OR = [
        { title: { contains: searchQuery } },
        { excerpt: { contains: searchQuery } },
        { content: { contains: searchQuery } },
      ];
    }

    articles = await prisma.article.findMany({
      where: whereCondition,
      orderBy: { publishedAt: 'desc' },
      include: {
        category: { select: { name: true, slug: true } },
        author: { select: { name: true, avatar: true } },
      },
    });
  } catch (err) {
    console.error('Failed to load blog articles:', err);
  }

  const isDark = isDarkTheme(activeTheme);
  const isBluSky = activeTheme === 'blusky';

  return (
    <div className={`py-12 sm:py-16 min-h-screen relative overflow-hidden ${
      isDark ? 'bg-[#0a0915] text-white' : 'bg-[#faf8f5] text-slate-900'
    }`}>
      
      {/* AMBIENT GLOW ORBS (DARK MODE ONLY) */}
      {isDark && (
        <>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[160px] pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-96 h-96 bg-[#ccff00]/10 rounded-full blur-[160px] pointer-events-none" />
        </>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* HEADER */}
        <div className="mb-10">
          <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-sm text-xs font-heading font-black mb-4 shadow-sm ${
            isDark ? 'bg-purple-500/20 text-[#ccff00] border border-purple-400/30' : (isBluSky ? 'bg-[#00A0FF] text-white' : 'bg-[#ccff00] text-slate-950')
          }`}>
            <BookOpen className="w-3.5 h-3.5" />
            <span>BLOG & ARTICLES SOLOPRENEUR</span>
          </div>

          <div>
            <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-heading font-black tracking-tight leading-tight ${
              isDark ? 'text-white' : 'text-slate-950'
            }`}>
              Derniers articles & conseils du blog
            </h1>
            <p className={`mt-2 text-base leading-relaxed max-w-2xl font-normal ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}>
              Des conseils pratiques sans langue de bois pour optimiser votre quotidien de freelance.
            </p>
          </div>
        </div>

        {/* TAB NAVIGATION BAR */}
        <div className={`border-b mb-10 ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar scrollbar-none">
            <Link
              href="/blog"
              className={`pb-3.5 text-xs sm:text-sm font-heading font-black whitespace-nowrap transition-all border-b-2 ${
                isDark ? 'border-[#ccff00] text-[#ccff00]' : 'border-purple-700 text-purple-700'
              }`}
            >
              Tous les articles
            </Link>

            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/blog/categorie/${cat.slug}`}
                className={`pb-3.5 text-xs sm:text-sm font-heading font-bold whitespace-nowrap transition-all border-b-2 border-transparent ${
                  isDark ? 'text-slate-400 hover:text-white hover:border-purple-400' : 'text-slate-600 hover:text-slate-950 hover:border-purple-300'
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>

        {/* ARTICLES GRID */}
        {articles.length === 0 ? (
          <div className={`text-center py-16 rounded-md border shadow-xl ${
            isDark ? 'bg-slate-900/60 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600'
          }`}>
            <p className="text-base">Aucun article ne correspond à votre recherche.</p>
            <Link href="/blog" className={`mt-4 inline-block font-black hover:underline ${isDark ? 'text-[#ccff00]' : 'text-purple-700'}`}>
              Réinitialiser la recherche
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((art) => (
              <Card key={art.id} className={`flex flex-col h-full group transition-all duration-300 rounded-md overflow-hidden shadow-md hover:shadow-xl ${
                isDark
                  ? 'bg-slate-900/90 border border-slate-800 hover:border-purple-500/60'
                  : 'bg-white border-2 border-slate-200 hover:border-purple-600'
              }`}>
                
                {/* IMAGE COVER */}
                <Link href={`/blog/${art.slug}`} className="relative block aspect-[16/10] overflow-hidden bg-slate-950">
                  {art.coverImage ? (
                    <Image
                      src={art.coverImage}
                      alt={art.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-950 flex items-center justify-center text-slate-500 text-xs font-medium">
                      Pas d image
                    </div>
                  )}

                  {/* CATEGORY BADGE */}
                  {art.category && (
                    <div className="absolute top-4 left-4 z-10">
                      <span className={`px-3.5 py-1 backdrop-blur-md font-heading font-black text-[11px] rounded-sm shadow-md ${
                        isDark ? 'bg-slate-950/90 text-[#ccff00] border border-[#ccff00]/30' : 'bg-white/95 text-slate-950 border border-slate-200'
                      }`}>
                        {art.category.name}
                      </span>
                    </div>
                  )}
                </Link>

                {/* CONTENT AREA */}
                <div className="p-6 flex flex-col flex-grow">
                  
                  <div className={`text-xs font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {art.publishedAt && (
                      <span>{new Date(art.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    )}
                  </div>

                  <h2 className={`text-lg font-heading font-extrabold transition-colors line-clamp-2 mb-3 leading-snug ${
                    isDark ? 'text-white group-hover:text-[#ccff00]' : 'text-slate-950 group-hover:text-purple-700'
                  }`}>
                    <Link href={`/blog/${art.slug}`}>{art.title}</Link>
                  </h2>

                  <p className={`text-xs line-clamp-3 leading-relaxed mb-6 font-normal ${
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  }`}>
                    {art.excerpt}
                  </p>

                  <div className={`mt-auto pt-4 border-t flex items-center justify-between ${
                    isDark ? 'border-slate-800' : 'border-slate-100'
                  }`}>
                    <div className="flex items-center gap-2">
                      {art.author?.avatar ? (
                        <Image src={art.author.avatar} alt={art.author.name || 'Auteur'} width={24} height={24} className="rounded-sm" />
                      ) : (
                        <div className={`w-6 h-6 rounded-sm flex items-center justify-center text-[10px] font-black shadow-xs ${
                          isDark ? 'bg-[#ccff00] text-slate-950' : 'bg-purple-700 text-white'
                        }`}>
                          {(art.author?.name || 'A')[0]}
                        </div>
                      )}
                      <span className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {art.author?.name || 'Rédaction'}
                      </span>
                    </div>

                    <Link href={`/blog/${art.slug}`} className={`inline-flex items-center gap-1 text-xs font-heading font-black hover:underline transition-colors ${
                      isDark ? 'text-[#ccff00]' : 'text-purple-700'
                    }`}>
                      <span>Lire</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                </div>
              </Card>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
