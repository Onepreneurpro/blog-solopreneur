import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ChevronRight, BookOpen, ArrowRight } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';
import { getActiveTheme, isDarkTheme } from '@/lib/theme';

export const dynamic = 'force-dynamic';

interface BlogCategoryPageProps {
  params: { categorySlug: string };
  searchParams: { search?: string };
}

export async function generateMetadata({ params }: BlogCategoryPageProps): Promise<Metadata> {
  const category = await prisma.category.findUnique({
    where: { slug: params.categorySlug },
  });

  if (!category) {
    return {
      title: 'Catégorie non trouvée - Blog Solopreneur & Co',
    };
  }

  return {
    title: `Articles ${category.name} - Blog Solopreneur & Co`,
    description: category.description || `Retrouvez nos meilleurs conseils et guides pratiques dans la catégorie ${category.name}.`,
    alternates: {
      canonical: `/blog/categorie/${category.slug}`,
    },
    openGraph: {
      title: `Catégorie ${category.name} - Blog Solopreneur & Co`,
      description: category.description || `Tous les articles du blog dans la catégorie ${category.name}.`,
      url: `/blog/categorie/${category.slug}`,
    },
  };
}

export default async function BlogCategoryPage({ params, searchParams }: BlogCategoryPageProps) {
  const categorySlug = params?.categorySlug;
  const safeParams = searchParams || {};
  const searchQuery = safeParams.search;

  let activeTheme = 'modern-bento';
  let category: any = null;
  let categories: any[] = [];
  let articles: any[] = [];

  try {
    activeTheme = await getActiveTheme();

    category = await prisma.category.findUnique({
      where: { slug: categorySlug },
    });

    if (!category) {
      notFound();
    }

    categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });

    const whereCondition: any = {
      status: 'PUBLISHED',
      categoryId: category.id,
    };

    if (searchQuery) {
      whereCondition.AND = [
        {
          OR: [
            { title: { contains: searchQuery } },
            { excerpt: { contains: searchQuery } },
            { content: { contains: searchQuery } },
          ],
        },
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
    if (!category) notFound();
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
        
        {/* BREADCRUMB */}
        <nav className={`flex items-center gap-2 text-xs mb-6 overflow-x-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          <Link href="/" className={isDark ? 'hover:text-[#ccff00]' : (isBluSky ? 'hover:text-[#00A0FF]' : 'hover:text-purple-700')}>Accueil</Link>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 opacity-50" />
          <Link href="/blog" className={isDark ? 'hover:text-[#ccff00]' : (isBluSky ? 'hover:text-[#00A0FF]' : 'hover:text-purple-700')}>Blog</Link>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 opacity-50" />
          <span className={`font-extrabold ${isDark ? 'text-[#ccff00]' : (isBluSky ? 'text-[#00A0FF]' : 'text-purple-700')}`}>{category.name}</span>
        </nav>

        {/* HERO HEADER */}
        <div className="mb-10">
          <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-sm text-xs font-heading font-black mb-4 shadow-sm ${
            isDark ? 'bg-purple-500/20 text-[#ccff00] border border-purple-400/30' : (isBluSky ? 'bg-[#00A0FF] text-white' : 'bg-[#ccff00] text-slate-950')
          }`}>
            <BookOpen className="w-3.5 h-3.5" />
            <span>CATÉGORIE BLOG</span>
          </div>

          <div>
            <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-heading font-black tracking-tight leading-tight ${
              isDark ? 'text-white' : 'text-slate-950'
            }`}>
              {category.name}
            </h1>
            <p className={`mt-2 text-base leading-relaxed max-w-2xl font-normal ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}>
              {category.description || `Découvrez tous nos articles et guides consacrés au thème ${category.name}.`}
            </p>
          </div>
        </div>

        {/* TAB NAVIGATION BAR */}
        <div className={`border-b mb-10 ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar scrollbar-none">
            <Link
              href="/blog"
              className={`pb-3.5 text-xs sm:text-sm font-heading font-bold whitespace-nowrap transition-all border-b-2 border-transparent ${
                isDark ? 'text-slate-400 hover:text-white hover:border-purple-400' : (isBluSky ? 'text-slate-600 hover:text-[#00A0FF] hover:border-[#00A0FF]' : 'text-slate-600 hover:text-slate-950 hover:border-purple-300')
              }`}
            >
              Tous les articles
            </Link>

            {categories.map((cat) => {
              const isActive = cat.slug === categorySlug;
              return (
                <Link
                  key={cat.id}
                  href={`/blog/categorie/${cat.slug}`}
                  className={`pb-3.5 text-xs sm:text-sm font-heading whitespace-nowrap transition-all border-b-2 ${
                    isActive
                      ? (isDark ? 'border-[#ccff00] text-[#ccff00] font-black' : (isBluSky ? 'border-[#00A0FF] text-[#00A0FF] font-black' : 'border-purple-700 text-purple-700 font-black'))
                      : (isDark ? 'border-transparent text-slate-400 hover:text-white hover:border-purple-400 font-bold' : (isBluSky ? 'border-transparent text-slate-600 hover:text-[#00A0FF] hover:border-[#00A0FF]/40 font-bold' : 'border-transparent text-slate-600 hover:text-slate-950 hover:border-purple-300 font-bold'))
                  }`}
                >
                  {cat.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* ARTICLES GRID */}
        {articles.length === 0 ? (
          <div className={`text-center py-16 rounded-md border shadow-xl ${
            isDark ? 'bg-slate-900/60 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600'
          }`}>
            <p className="text-base">Aucun article dans la catégorie "{category.name}" pour l instant.</p>
            <Link href="/blog" className={`mt-4 inline-block font-black hover:underline ${isDark ? 'text-[#ccff00]' : 'text-purple-700'}`}>
              Voir tous les articles du blog
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
