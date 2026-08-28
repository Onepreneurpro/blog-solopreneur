import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Clock, Calendar, ChevronRight, Share2, Linkedin, Twitter, ArrowRight, BookOpen, ShoppingBag, Gift, Sparkles } from 'lucide-react';
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
  let headerFeaturedArticles: any[] = [];
  let sidebarStoreProducts: any[] = [];
  let sidebarFreeResources: any[] = [];
  let sidebarBlogArticles: any[] = [];

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

    // 1. Fetch 3 related articles from the same category (for bottom cross-sell)
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

    // 2. Fetch 3 featured/latest articles for right side of hero cover image
    headerFeaturedArticles = await prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        id: { not: article.id },
      },
      take: 3,
      orderBy: { publishedAt: 'desc' },
      include: {
        category: { select: { name: true, slug: true } },
      },
    });

    // 3. Fetch 3 Store Products for Right Sidebar
    sidebarStoreProducts = await prisma.product.findMany({
      where: {
        status: 'PUBLISHED',
        isFreeResource: false,
      },
      take: 3,
      orderBy: { downloadsCount: 'desc' },
      include: {
        category: { select: { name: true, slug: true } },
      },
    });

    // 4. Fetch 3 Free Resources for Right Sidebar
    sidebarFreeResources = await prisma.product.findMany({
      where: {
        status: 'PUBLISHED',
        isFreeResource: true,
      },
      take: 3,
      orderBy: { downloadsCount: 'desc' },
    });

    // 5. Fetch 3 Recent Blog Articles for Right Sidebar
    sidebarBlogArticles = await prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        id: { not: article.id },
      },
      take: 3,
      orderBy: { publishedAt: 'desc' },
      include: {
        category: { select: { name: true, slug: true } },
      },
    });

  } catch (err) {
    if (!article) notFound();
  }

  const isDark = isDarkTheme(activeTheme);

  return (
    <article className={`py-12 sm:py-16 min-h-screen relative overflow-hidden ${
      isDark ? 'bg-[#0a0915] text-white' : 'bg-[#faf8f5] text-slate-900'
    }`}>
      
      {/* AMBIENT GLOW */}
      {isDark && <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[160px] pointer-events-none" />}

      {/* FULL BLOG CONTAINER MAX-W-7XL MATCHING /BLOG */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
        
        {/* TOP HEADER AREA */}
        <div className="space-y-6">
          
          {/* BREADCRUMB */}
          <nav className={`flex items-center gap-2 text-xs overflow-x-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
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

          {/* ARTICLE TITLE & EXCERPT */}
          <div className="space-y-4">
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
              <p className={`text-lg leading-relaxed font-medium max-w-3xl ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
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

          {/* HERO SPLIT ROW: COMPACT COVER IMAGE (LEFT 8 COLS) + 3 FEATURED ARTICLES (RIGHT 4 COLS) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch pt-2">
            
            {/* LEFT: COMPACT COVER IMAGE */}
            <div className={`${headerFeaturedArticles.length > 0 ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
              {article.coverImage ? (
                <div className={`relative h-[320px] sm:h-[360px] w-full rounded-md overflow-hidden shadow-2xl border ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <Image src={article.coverImage} alt={article.title} fill className="object-cover" priority />
                </div>
              ) : (
                <div className={`h-[240px] w-full rounded-md flex items-center justify-center border ${
                  isDark ? 'bg-slate-900 border-slate-800 text-slate-500' : 'bg-slate-100 border-slate-200 text-slate-400'
                }`}>
                  <span className="text-xs font-medium">Pas d image d illustration</span>
                </div>
              )}
            </div>

            {/* RIGHT: 3 RECOMMENDED ARTICLES STACK */}
            {headerFeaturedArticles.length > 0 && (
              <div className="lg:col-span-4 flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between border-b pb-2 border-slate-100 dark:border-white/10">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#ccff00]" />
                    <span className="text-xs font-heading font-black uppercase text-[#ccff00] tracking-wider">
                      À ne pas manquer
                    </span>
                  </div>
                  <Link href="/blog" className="text-[10px] font-heading font-black text-[#ccff00] hover:underline uppercase">
                    Voir tout →
                  </Link>
                </div>

                <div className="flex-1 flex flex-col justify-between gap-3.5 h-full">
                  {headerFeaturedArticles.slice(0, 2).map((featArt) => (
                    <Link
                      key={featArt.id}
                      href={`/blog/${featArt.slug}`}
                      className={`group flex items-center gap-3.5 sm:gap-4 p-3.5 sm:p-4 rounded-md transition-all border shadow-md flex-1 ${
                        isDark
                          ? 'bg-[#0e1424] border-white/10 hover:border-[#a3e635]/60 hover:bg-white/5'
                          : 'bg-white border-slate-200 hover:border-purple-500 hover:bg-slate-50'
                      }`}
                    >
                      {featArt.coverImage ? (
                        <div className="relative w-32 h-24 sm:w-36 sm:h-28 rounded-md overflow-hidden flex-shrink-0 bg-slate-950 border border-white/10 shadow-md">
                          <Image src={featArt.coverImage} alt={featArt.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                      ) : (
                        <div className="w-32 h-24 sm:w-36 sm:h-28 rounded-md bg-purple-950 flex items-center justify-center flex-shrink-0 text-white font-black text-xs">
                          ARTICLE
                        </div>
                      )}

                      <div className="min-w-0 flex-1 space-y-1.5">
                        {featArt.category && (
                          <span className="text-[10px] font-heading font-black uppercase text-[#a3e635] tracking-wider truncate block">
                            {featArt.category.name}
                          </span>
                        )}
                        <h4 className="font-heading font-black text-xs sm:text-sm leading-snug text-white group-hover:text-[#a3e635] transition-colors line-clamp-2">
                          {featArt.title}
                        </h4>
                        <p className="text-xs text-slate-300 font-normal line-clamp-2 leading-relaxed">
                          {featArt.excerpt || 'Découvrir cet article...'}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

        {/* 2-COLUMN LAYOUT BELOW HERO COVER: TEXT CONTENT (8 COLS) + SIDEBAR (4 COLS STICKY) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-4">
          
          {/* MAIN READING TEXT COLUMN (8 COLS) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* ARTICLE BODY */}
            <ArticleBody content={article.content} isDark={isDark} />

            {/* CTA BANNER TO BOUTIQUE */}
            <div className={`p-6 sm:p-8 rounded-md border flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl ${
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
                <Button size="lg" className="bg-[#ccff00] hover:bg-[#b8e600] text-slate-950 font-heading font-black text-sm rounded-md px-6 py-4 shadow-xl shrink-0">
                  <span>Accéder à la boutique</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>

            {/* RELATED CATEGORY ARTICLES AT BOTTOM */}
            {similarArticles.length > 0 && (
              <div className="pt-8 border-t border-slate-200 dark:border-white/10 space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-[11px] font-heading font-black mb-1.5 shadow-xs ${
                      isDark ? 'bg-purple-500/20 text-[#ccff00] border border-purple-400/30' : 'bg-purple-100 text-purple-900'
                    }`}>
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>À LIRE AUSSI</span>
                    </div>
                    <h3 className={`text-xl sm:text-2xl font-heading font-black tracking-tight ${
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
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
                          <div className="absolute top-2.5 left-2.5 z-10">
                            <span className={`px-2 py-0.5 backdrop-blur-md font-heading font-black text-[9px] rounded-sm shadow-md ${
                              isDark ? 'bg-slate-950/90 text-[#ccff00] border border-[#ccff00]/30' : 'bg-white/95 text-slate-950 border border-slate-200'
                            }`}>
                              {simArt.category.name}
                            </span>
                          </div>
                        )}
                      </Link>

                      {/* BODY */}
                      <div className="p-4 flex flex-col flex-grow space-y-1.5">
                        <h4 className={`text-xs sm:text-sm font-heading font-extrabold transition-colors line-clamp-2 leading-snug ${
                          isDark ? 'text-white group-hover:text-[#ccff00]' : 'text-slate-950 group-hover:text-purple-700'
                        }`}>
                          <Link href={`/blog/${simArt.slug}`}>{simArt.title}</Link>
                        </h4>

                        <p className={`text-[11px] line-clamp-2 leading-relaxed font-normal ${
                          isDark ? 'text-slate-400' : 'text-slate-600'
                        }`}>
                          {simArt.excerpt}
                        </p>

                        <div className={`mt-auto pt-2.5 border-t flex items-center justify-between text-[11px] ${
                          isDark ? 'border-slate-800' : 'border-slate-100'
                        }`}>
                          <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                            {simArt.publishedAt ? new Date(simArt.publishedAt).toLocaleDateString('fr-FR') : ''}
                          </span>

                          <Link href={`/blog/${simArt.slug}`} className={`inline-flex items-center gap-1 font-heading font-black hover:underline ${
                            isDark ? 'text-[#ccff00]' : 'text-purple-700'
                          }`}>
                            <span>Lire</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* RIGHT SIDEBAR COLUMN (4 COLUMNS STICKY BELOW COVER ROW) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            {/* SIDEBAR BLOCK 1: 3 STORE PRODUCTS */}
            {sidebarStoreProducts.length > 0 && (
              <Card className={`p-4 space-y-4 rounded-xl shadow-xl ${
                isDark ? 'bg-[#0e1424] border border-white/15 text-white' : 'bg-white border border-slate-200 text-slate-900'
              }`}>
                <div className="flex items-center justify-between border-b pb-2.5 border-slate-100 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-[#a3e635]" />
                    <h3 className="text-xs font-heading font-black uppercase tracking-wider">Produits de la boutique</h3>
                  </div>
                  <Link href="/boutique" className="text-[10px] font-heading font-black text-[#a3e635] hover:underline uppercase">
                    Voir tout →
                  </Link>
                </div>

                <div className="space-y-3">
                  {sidebarStoreProducts.slice(0, 3).map((prod) => (
                    <Link
                      key={prod.id}
                      href={`/checkout?productId=${prod.id}`}
                      className="group flex items-center gap-3.5 p-2.5 rounded-xl hover:bg-white/5 transition-all border border-transparent hover:border-white/10"
                    >
                      {prod.coverImage ? (
                        <img src={prod.coverImage} alt={prod.name} className="w-20 h-16 rounded-lg object-cover flex-shrink-0 border border-white/10 group-hover:scale-105 transition-transform" />
                      ) : prod.icon ? (
                        <img src={prod.icon} alt={prod.name} className="w-20 h-16 rounded-lg object-contain flex-shrink-0 bg-slate-950 p-2 border border-white/10" />
                      ) : (
                        <div className="w-20 h-16 rounded-lg bg-purple-950 flex items-center justify-center flex-shrink-0 text-white font-black text-xs">
                          PROD
                        </div>
                      )}
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[9px] font-black uppercase text-[#a3e635] truncate">{prod.category?.name || 'OUTILS'}</span>
                          <span className="text-xs font-heading font-black text-white shrink-0">{prod.price > 0 ? `${prod.price.toFixed(2)} €` : 'Gratuit'}</span>
                        </div>
                        <h4 className="font-heading font-black text-xs sm:text-sm leading-snug text-white group-hover:text-[#a3e635] transition-colors line-clamp-1">{prod.name}</h4>
                        <p className="text-xs text-slate-400 font-normal line-clamp-1 leading-normal">{prod.shortDescription || 'Système prêt à l emploi.'}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </Card>
            )}

            {/* SIDEBAR BLOCK 2: 3 FREE RESOURCES */}
            {sidebarFreeResources.length > 0 && (
              <Card className={`p-4 space-y-4 rounded-xl shadow-xl ${
                isDark ? 'bg-[#0e1424] border border-white/15 text-white' : 'bg-white border border-slate-200 text-slate-900'
              }`}>
                <div className="flex items-center justify-between border-b pb-2.5 border-slate-100 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-[#a3e635]" />
                    <h3 className="text-xs font-heading font-black uppercase tracking-wider">Ressources Offertes</h3>
                  </div>
                  <Link href="/ressources" className="text-[10px] font-heading font-black text-[#a3e635] hover:underline uppercase">
                    Tout voir →
                  </Link>
                </div>

                <div className="space-y-3">
                  {sidebarFreeResources.slice(0, 3).map((res) => (
                    <Link
                      key={res.id}
                      href={`/checkout?productId=${res.id}`}
                      className="group flex items-center gap-3.5 p-2.5 rounded-xl hover:bg-white/5 transition-all border border-transparent hover:border-white/10"
                    >
                      {res.coverImage ? (
                        <img src={res.coverImage} alt={res.name} className="w-20 h-16 rounded-lg object-cover flex-shrink-0 border border-white/10 group-hover:scale-105 transition-transform" />
                      ) : res.icon ? (
                        <img src={res.icon} alt={res.name} className="w-20 h-16 rounded-lg object-contain flex-shrink-0 bg-slate-950 p-2 border border-white/10" />
                      ) : (
                        <div className="w-20 h-16 rounded-lg bg-emerald-950 flex items-center justify-center flex-shrink-0 text-[#a3e635] font-black text-xs">
                          FREE
                        </div>
                      )}
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[9px] font-black uppercase text-slate-950 bg-[#a3e635] px-1.5 py-0.5 rounded-sm">100% OFFERT</span>
                          <span className="text-[10px] text-slate-400 font-medium shrink-0">{res.downloadsCount || 100}+ dl</span>
                        </div>
                        <h4 className="font-heading font-black text-xs sm:text-sm leading-snug text-white group-hover:text-[#a3e635] transition-colors line-clamp-1">{res.name}</h4>
                        <p className="text-xs text-slate-400 font-normal line-clamp-1 leading-normal">{res.shortDescription || 'Guide offert.'}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </Card>
            )}

            {/* SIDEBAR BLOCK 3: 3 RECENT BLOG ARTICLES */}
            {sidebarBlogArticles.length > 0 && (
              <Card className={`p-4 space-y-4 rounded-xl shadow-xl ${
                isDark ? 'bg-[#0e1424] border border-white/15 text-white' : 'bg-white border border-slate-200 text-slate-900'
              }`}>
                <div className="flex items-center justify-between border-b pb-2.5 border-slate-100 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-purple-400" />
                    <h3 className="text-xs font-heading font-black uppercase tracking-wider">Derniers Articles</h3>
                  </div>
                  <Link href="/blog" className="text-[10px] font-heading font-black text-purple-400 hover:underline uppercase">
                    Blog →
                  </Link>
                </div>

                <div className="space-y-3">
                  {sidebarBlogArticles.slice(0, 3).map((art) => (
                    <Link
                      key={art.id}
                      href={`/blog/${art.slug}`}
                      className="group flex items-center gap-3.5 p-2.5 rounded-xl hover:bg-white/5 transition-all border border-transparent hover:border-white/10"
                    >
                      {art.coverImage ? (
                        <img src={art.coverImage} alt={art.title} className="w-20 h-16 rounded-lg object-cover flex-shrink-0 border border-white/10 group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-20 h-16 rounded-lg bg-purple-950 flex items-center justify-center flex-shrink-0 text-white font-black text-xs">
                          BLOG
                        </div>
                      )}
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[9px] font-black uppercase text-purple-400 truncate">{art.category?.name || 'ARTICLE'}</span>
                          <span className="text-[10px] text-slate-400 font-medium shrink-0">{art.publishedAt ? new Date(art.publishedAt).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }) : ''}</span>
                        </div>
                        <h4 className="font-heading font-black text-xs sm:text-sm leading-snug text-white group-hover:text-[#a3e635] transition-colors line-clamp-1">{art.title}</h4>
                        <p className="text-xs text-slate-400 font-normal line-clamp-1 leading-normal">{art.excerpt || 'Conseils pratiques.'}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </Card>
            )}

          </div>

        </div>

      </div>
    </article>
  );
}
