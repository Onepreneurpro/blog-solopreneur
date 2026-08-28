import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Clock, Calendar, ChevronRight, Share2, Linkedin, Twitter, ArrowRight, BookOpen } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getActiveTheme, isDarkTheme } from '@/lib/theme';
import { ArticleBody } from '@/components/public/ArticleBody';

export const dynamic = 'force-dynamic';

interface ArticlePageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: ArticlePageProps) {
  const article = await prisma.article.findUnique({
    where: { slug: params.slug },
  });

  if (!article) return {};

  return {
    title: `${article.seoTitle || article.title} | Solopreneur & Co`,
    description: article.seoDescription || article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt || '',
      images: article.coverImage ? [article.coverImage] : [],
    },
  };
}

export default async function SingleArticlePage({ params }: ArticlePageProps) {
  let activeTheme = 'modern-bento';
  let article: any = null;
  let similarArticles: any[] = [];

  try {
    activeTheme = await getActiveTheme();

    article = await prisma.article.findUnique({
      where: { slug: params.slug },
      include: {
        category: true,
        author: { select: { name: true, avatar: true } },
        tags: { include: { tag: true } },
      },
    });

    if (!article || article.status !== 'PUBLISHED') {
      notFound();
    }

    // Fetch 3 related articles from the same category
    similarArticles = await prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        id: { not: article.id },
        ...(article.categoryId ? { categoryId: article.categoryId } : {}),
      },
      take: 3,
      orderBy: { publishedAt: 'desc' },
      include: {
        category: { select: { name: true, slug: true } },
        author: { select: { name: true, avatar: true } },
      },
    });

    // If fewer than 3, fallback to other latest articles
    if (similarArticles.length < 3) {
      const fallbackArticles = await prisma.article.findMany({
        where: {
          status: 'PUBLISHED',
          id: { notIn: [article.id, ...similarArticles.map((a) => a.id)] },
        },
        take: 3 - similarArticles.length,
        orderBy: { publishedAt: 'desc' },
        include: {
          category: { select: { name: true, slug: true } },
          author: { select: { name: true, avatar: true } },
        },
      });
      similarArticles = [...similarArticles, ...fallbackArticles];
    }
  } catch (err) {
    if (!article) notFound();
  }

  const isDark = isDarkTheme(activeTheme);

  return (
    <article className={`py-16 min-h-screen relative overflow-hidden ${
      isDark ? 'bg-[#0a0915] text-white' : 'bg-[#faf8f5] text-slate-900'
    }`}>
      
      {/* AMBIENT GLOW */}
      {isDark && <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[160px] pointer-events-none" />}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* BREADCRUMB */}
        <nav className={`flex items-center gap-2 text-xs mb-8 overflow-x-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          <Link href="/" className={isDark ? 'hover:text-[#ccff00]' : 'hover:text-purple-700'}>Accueil</Link>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 opacity-50" />
          <Link href="/blog" className={isDark ? 'hover:text-[#ccff00]' : 'hover:text-purple-700'}>Blog</Link>
          {article.category && (
            <>
              <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 opacity-50" />
              <Link href={`/blog/categorie/${article.category.slug}`} className={isDark ? 'hover:text-[#ccff00]' : 'hover:text-purple-700'}>
                {article.category.name}
              </Link>
            </>
          )}
        </nav>

        {/* HEADER AREA */}
        <div className="space-y-4 mb-8">
          {article.category && (
            <Link href={`/blog/categorie/${article.category.slug}`} className="inline-block">
              <span className={`px-3.5 py-1 text-xs font-heading font-black rounded-sm shadow-md ${
                isDark ? 'bg-slate-900 border border-[#ccff00]/40 text-[#ccff00]' : 'bg-purple-100 text-purple-700 border border-purple-200'
              }`}>
                {article.category.name}
              </span>
            </Link>
          )}
          <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-heading font-black tracking-tight leading-tight ${
            isDark ? 'text-white' : 'text-slate-950'
          }`}>
            {article.title}
          </h1>

          {article.excerpt && (
            <p className={`text-lg leading-relaxed font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {article.excerpt}
            </p>
          )}

          {/* AUTHOR & METADATA BAR */}
          <div className={`flex items-center justify-between border-y py-4 text-xs ${
            isDark ? 'border-slate-800 text-slate-300' : 'border-slate-200 text-slate-600'
          }`}>
            <div className="flex items-center gap-3">
              {article.author?.avatar ? (
                <Image src={article.author.avatar} alt={article.author.name || ''} width={40} height={40} className="rounded-sm border border-slate-300" />
              ) : (
                <div className={`w-10 h-10 rounded-sm font-black flex items-center justify-center text-sm shadow-md ${
                  isDark ? 'bg-[#ccff00] text-slate-950' : 'bg-purple-700 text-white'
                }`}>
                  {(article.author?.name || 'A')[0]}
                </div>
              )}
              <div>
                <div className={`font-heading font-extrabold text-sm ${isDark ? 'text-white' : 'text-slate-950'}`}>
                  {article.author?.name || 'Rédaction'}
                </div>
                <div className="flex items-center gap-3 text-xs opacity-80 mt-0.5 font-medium">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Récemment'}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {article.readingTime} min de lecture
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COVER IMAGE */}
        {article.coverImage && (
          <div className={`relative aspect-[16/9] w-full rounded-md overflow-hidden shadow-2xl mb-10 border ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <Image src={article.coverImage} alt={article.title} fill className="object-cover" priority />
          </div>
        )}

        {/* ARTICLE CONTENT WITH LIVE EMBEDDED OPT-IN EBOOK BLOCKS */}
        <ArticleBody content={article.content} isDark={isDark} />

        {/* CTA TO BOUTIQUE / TEMPLATES */}
        <div className={`my-12 p-8 rounded-md border flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl ${
          isDark ? 'bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 border-purple-500/30 text-white' : 'bg-gradient-to-r from-purple-900 to-indigo-950 border-purple-800 text-white'
        }`}>
          <div className="space-y-2">
            <span className="px-3 py-1 bg-[#ccff00] text-slate-950 rounded-sm text-xs font-heading font-black uppercase">
              Ressource Recommandée
            </span>
            <h3 className="text-xl font-heading font-black text-white">Besoin d un système clé en main ?</h3>
            <p className="text-sm text-slate-300 font-medium">
              Découvrez nos templates Notion et tableaux Excel pré-configurés pour les freelances.
            </p>
          </div>
          <Link href="/boutique">
            <Button size="lg" className="bg-[#ccff00] hover:bg-[#b8e600] text-slate-950 font-heading font-black text-sm rounded-md px-6 py-4 shadow-xl">
              <span>Accéder à la boutique</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        {/* SIMILAR / RECOMMENDED ARTICLES SECTION */}
        {similarArticles.length > 0 && (
          <div className="mt-16 pt-10 border-t border-slate-200 dark:border-white/10 space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-[11px] font-heading font-black mb-2 shadow-xs ${
                  isDark ? 'bg-purple-500/20 text-[#ccff00] border border-purple-400/30' : 'bg-purple-100 text-purple-900'
                }`}>
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>À LIRE AUSSI</span>
                </div>
                <h3 className={`text-2xl sm:text-3xl font-heading font-black tracking-tight ${
                  isDark ? 'text-white' : 'text-slate-950'
                }`}>
                  Articles recommandés dans la même catégorie
                </h3>
              </div>

              <Link href="/blog" className={`text-xs font-heading font-black hover:underline flex items-center gap-1 shrink-0 ${
                isDark ? 'text-[#ccff00]' : 'text-purple-700'
              }`}>
                <span>Voir tout le blog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {similarArticles.map((simArt) => (
                <Card
                  key={simArt.id}
                  className={`flex flex-col h-full group transition-all duration-300 rounded-md overflow-hidden shadow-md hover:shadow-xl ${
                    isDark
                      ? 'bg-slate-900/90 border border-slate-800 hover:border-purple-500/60'
                      : 'bg-white border-2 border-slate-200 hover:border-purple-600'
                  }`}
                >
                  {/* COVER */}
                  <Link href={`/blog/${simArt.slug}`} className="relative block aspect-[16/10] overflow-hidden bg-slate-950">
                    {simArt.coverImage ? (
                      <Image
                        src={simArt.coverImage}
                        alt={simArt.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-950 flex items-center justify-center text-slate-500 text-xs font-medium">
                        Pas d image
                      </div>
                    )}

                    {simArt.category && (
                      <div className="absolute top-3 left-3 z-10">
                        <span className={`px-2.5 py-0.5 backdrop-blur-md font-heading font-black text-[10px] rounded-sm shadow-md ${
                          isDark ? 'bg-slate-950/90 text-[#ccff00] border border-[#ccff00]/30' : 'bg-white/95 text-slate-950 border border-slate-200'
                        }`}>
                          {simArt.category.name}
                        </span>
                      </div>
                    )}
                  </Link>

                  {/* BODY */}
                  <div className="p-5 flex flex-col flex-grow">
                    <h4 className={`text-base font-heading font-extrabold transition-colors line-clamp-2 mb-2 leading-snug ${
                      isDark ? 'text-white group-hover:text-[#ccff00]' : 'text-slate-950 group-hover:text-purple-700'
                    }`}>
                      <Link href={`/blog/${simArt.slug}`}>{simArt.title}</Link>
                    </h4>

                    <p className={`text-xs line-clamp-2 leading-relaxed mb-4 font-normal ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      {simArt.excerpt}
                    </p>

                    <div className={`mt-auto pt-3 border-t flex items-center justify-between text-xs ${
                      isDark ? 'border-slate-800' : 'border-slate-100'
                    }`}>
                      <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                        {simArt.publishedAt ? new Date(simArt.publishedAt).toLocaleDateString('fr-FR') : ''}
                      </span>

                      <Link href={`/blog/${simArt.slug}`} className={`inline-flex items-center gap-1 font-heading font-black hover:underline ${
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
          </div>
        )}

      </div>
    </article>
  );
}
