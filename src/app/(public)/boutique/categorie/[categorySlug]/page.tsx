import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ShoppingBag, ArrowRight, Sparkles, Star, Zap, ShieldCheck } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';
import { getActiveTheme, isDarkTheme } from '@/lib/theme';
import { getFileTypeLabel } from '@/lib/product-formats';
import SalesSocialProofToast from '@/components/public/SalesSocialProofToast';

export const dynamic = 'force-dynamic';

interface BoutiqueCategoryPageProps {
  params: { categorySlug: string };
  searchParams: { search?: string };
}

export async function generateMetadata({ params }: BoutiqueCategoryPageProps): Promise<Metadata> {
  const category = await prisma.productCategory.findUnique({
    where: { slug: params.categorySlug },
  });

  if (!category) {
    return {
      title: 'Catégorie non trouvée - Boutique Solopreneur & Co',
    };
  }

  return {
    title: `${category.name} : Produits & Outils - Boutique Solopreneur & Co`,
    description: category.description || `Découvrez nos ${category.name} et outils prêts à l emploi pour booster votre activité de solopreneur.`,
    alternates: {
      canonical: `/boutique/categorie/${category.slug}`,
    },
    openGraph: {
      title: `${category.name} - Boutique Solopreneur & Co`,
      description: category.description || `Tous les produits et outils de la catégorie ${category.name}.`,
      url: `/boutique/categorie/${category.slug}`,
    },
  };
}

export default async function BoutiqueCategoryPage({ params, searchParams }: BoutiqueCategoryPageProps) {
  const { categorySlug } = params;
  const searchQuery = searchParams.search;

  let activeTheme = 'modern-bento';
  let category: any = null;
  let categories: any[] = [];
  let products: any[] = [];
  let storeHeroBadge = 'BOUTIQUE PRO POUR SOLOPRENEURS & FREELANCES';
  let storeHeroTitle = 'Templates Notion & Dashboards Excel';
  let storeHeroTitleAccent = 'Haute Performance';
  let storeHeroSubtitle = 'Automatisez votre organisation, suivez vos finances et développez votre activité d indépendant avec des systèmes testés et prêts à l emploi.';

  let storeHeroFontGlobal = true;
  let storeHeroFontFamily = 'Plus Jakarta Sans';
  
  let storeHeroBadgeFont = 'Plus Jakarta Sans';
  let storeHeroBadgeSize = '11px';
  let storeHeroBadgeColor = '#a3e635';
  
  let storeHeroTitleFont = 'Plus Jakarta Sans';
  let storeHeroTitleSize = '48px';
  let storeHeroTitleColor = '#ffffff';
  
  let storeHeroAccentFont = 'Plus Jakarta Sans';
  let storeHeroAccentColor = '#a3e635';
  
  let storeHeroSubtitleFont = 'Plus Jakarta Sans';
  let storeHeroSubtitleSize = '16px';
  let storeHeroSubtitleColor = '#cbd5e1';
  
  let storeHeroAlign = 'center';

  try {
    activeTheme = await getActiveTheme();

    category = await prisma.productCategory.findUnique({
      where: { slug: categorySlug },
    });

    if (!category) {
      notFound();
    }

    categories = await prisma.productCategory.findMany({
      orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
    });

    const whereCondition: any = {
      status: 'PUBLISHED',
    };

    if (categorySlug === 'ressources') {
      whereCondition.OR = [
        { isFreeResource: true },
        { categoryId: category.id },
        { productCategoryId: category.id },
        { category: { slug: 'ressources' } },
      ];
    } else {
      whereCondition.isFreeResource = false;
      whereCondition.OR = [
        { categoryId: category.id },
        { productCategoryId: category.id },
        { category: { slug: categorySlug } },
      ];
    }

    if (searchQuery) {
      whereCondition.AND = [
        {
          OR: [
            { name: { contains: searchQuery } },
            { shortDescription: { contains: searchQuery } },
            { longDescription: { contains: searchQuery } },
          ],
        },
      ];
    }

    const generalSettingsRecord = await prisma.siteSetting.findUnique({
      where: { key: 'general_settings' },
    });
    const s = generalSettingsRecord ? JSON.parse(generalSettingsRecord.value) : {};
    if (s.storeHeroBadge) storeHeroBadge = s.storeHeroBadge;
    if (s.storeHeroTitle) storeHeroTitle = s.storeHeroTitle;
    if (s.storeHeroTitleAccent !== undefined) storeHeroTitleAccent = s.storeHeroTitleAccent;
    if (s.storeHeroSubtitle) storeHeroSubtitle = s.storeHeroSubtitle;

    if (s.storeHeroFontGlobal !== undefined) storeHeroFontGlobal = Boolean(s.storeHeroFontGlobal);
    if (s.storeHeroFontFamily) storeHeroFontFamily = s.storeHeroFontFamily;

    if (s.storeHeroBadgeFont) storeHeroBadgeFont = s.storeHeroBadgeFont;
    if (s.storeHeroBadgeSize) storeHeroBadgeSize = s.storeHeroBadgeSize;
    if (s.storeHeroBadgeColor) storeHeroBadgeColor = s.storeHeroBadgeColor;

    if (s.storeHeroTitleFont) storeHeroTitleFont = s.storeHeroTitleFont;
    if (s.storeHeroTitleSize) storeHeroTitleSize = s.storeHeroTitleSize;
    if (s.storeHeroTitleColor) storeHeroTitleColor = s.storeHeroTitleColor;

    if (s.storeHeroAccentFont) storeHeroAccentFont = s.storeHeroAccentFont;
    if (s.storeHeroAccentColor) storeHeroAccentColor = s.storeHeroAccentColor;

    if (s.storeHeroSubtitleFont) storeHeroSubtitleFont = s.storeHeroSubtitleFont;
    if (s.storeHeroSubtitleSize) storeHeroSubtitleSize = s.storeHeroSubtitleSize;
    if (s.storeHeroSubtitleColor) storeHeroSubtitleColor = s.storeHeroSubtitleColor;

    if (s.storeHeroAlign) storeHeroAlign = s.storeHeroAlign;

    products = await prisma.product.findMany({
      where: whereCondition,
      orderBy: { isFeatured: 'desc' },
      include: {
        category: { select: { name: true, slug: true } },
      },
    });
  } catch (err) {
    if (!category) notFound();
  }

  const fontImportMap: Record<string, string> = {
    'Plus Jakarta Sans': 'Plus+Jakarta+Sans:wght@700;800;900',
    'Outfit': 'Outfit:wght@700;800;900',
    'Syne': 'Syne:wght@700;800',
    'Space Grotesk': 'Space+Grotesk:wght@700',
    'Poppins': 'Poppins:wght@700;800;900',
    'Montserrat': 'Montserrat:wght@800;900',
    'Playfair Display': 'Playfair+Display:ital,wght@0,800;1,700',
    'Bricolage Grotesque': 'Bricolage+Grotesque:opsz,wght@12..96,800',
    'Inter': 'Inter:wght@800;900',
  };

  const fontsToLoad = Array.from(new Set([
    storeHeroFontFamily,
    storeHeroBadgeFont,
    storeHeroTitleFont,
    storeHeroAccentFont,
    storeHeroSubtitleFont,
  ])).filter(Boolean);

  return (
    <div className="min-h-screen bg-[#050811] text-white relative overflow-hidden font-sans pb-20">
      
      {/* DYNAMIC GOOGLE FONTS LINKS */}
      {fontsToLoad.map((fName) => {
        const importStr = fontImportMap[fName];
        if (!importStr) return null;
        return (
          <link
            key={fName}
            rel="stylesheet"
            href={`https://fonts.googleapis.com/css2?family=${importStr}&display=swap`}
          />
        );
      })}

      {/* TOP NEON PROMO TICKER BAR */}
      <div className="bg-[#a3e635] text-slate-950 font-heading font-black text-xs sm:text-sm py-2.5 px-4 shadow-xl text-center flex items-center justify-center gap-3 uppercase tracking-wider relative z-20">
        <Sparkles className="w-4 h-4 shrink-0 animate-pulse" />
        <span>⚡ OFFRE SPÉCIALE : ACCÈS IMMÉDIAT & MISES À JOUR À VIE SUR TOUTES LES RESSOURCES 🚀</span>
        <Sparkles className="w-4 h-4 shrink-0 animate-pulse hidden sm:inline" />
      </div>

      {/* AMBIENT GLOW LIGHTING ORBS */}
      <div className="absolute top-10 right-1/4 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-[#a3e635]/10 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-10 sm:pt-14">
        
        {/* HERO SECTION - HOMOGENEOUS WITH /BOUTIQUE */}
        <div className={`mb-10 max-w-3xl mx-auto space-y-4 ${
          storeHeroAlign === 'left' ? 'text-left' : storeHeroAlign === 'right' ? 'text-right' : 'text-center'
        }`}>
          {storeHeroBadge && (
            <div
              style={{
                fontFamily: `'${storeHeroFontGlobal ? storeHeroFontFamily : storeHeroBadgeFont}', sans-serif`,
                fontSize: storeHeroBadgeSize,
                color: storeHeroBadgeColor,
                borderColor: `${storeHeroBadgeColor}40`,
                backgroundColor: `${storeHeroBadgeColor}15`,
              }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-heading font-black border shadow-lg backdrop-blur-md"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{storeHeroBadge}</span>
            </div>
          )}

          <h1 className="font-black tracking-tight leading-tight">
            <span
              style={{
                fontFamily: `'${storeHeroFontGlobal ? storeHeroFontFamily : storeHeroTitleFont}', sans-serif`,
                fontSize: storeHeroTitleSize,
                color: storeHeroTitleColor,
              }}
            >
              {storeHeroTitle}{' '}
            </span>
            {storeHeroTitleAccent && (
              <span
                style={{
                  fontFamily: `'${storeHeroFontGlobal ? storeHeroFontFamily : storeHeroAccentFont}', sans-serif`,
                  fontSize: storeHeroTitleSize,
                  color: storeHeroAccentColor,
                }}
              >
                {storeHeroTitleAccent}
              </span>
            )}
          </h1>

          {storeHeroSubtitle && (
            <p
              style={{
                fontFamily: `'${storeHeroFontGlobal ? storeHeroFontFamily : storeHeroSubtitleFont}', sans-serif`,
                fontSize: storeHeroSubtitleSize,
                color: storeHeroSubtitleColor,
              }}
              className={`font-medium leading-relaxed max-w-2xl ${
                storeHeroAlign === 'left' ? 'mr-auto' : storeHeroAlign === 'right' ? 'ml-auto' : 'mx-auto'
              }`}
            >
              {storeHeroSubtitle}
            </p>
          )}
        </div>

        {/* CATEGORY FILTER PILL TABS */}
        <div className="mb-10 flex justify-center">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scrollbar-none p-1.5 bg-[#0e1424] border border-white/10 rounded-md shadow-xl">
            <Link
              href="/boutique"
              className="px-5 py-2 rounded-md text-xs sm:text-sm font-heading font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all whitespace-nowrap"
            >
              Tous les produits
            </Link>

            {categories.map((cat) => {
              const isActive = cat.slug === categorySlug;
              return (
                <Link
                  key={cat.id}
                  href={`/boutique/categorie/${cat.slug}`}
                  className={`px-5 py-2 rounded-md text-xs sm:text-sm font-heading transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-[#a3e635] text-slate-950 font-black shadow-md'
                      : 'font-bold text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {cat.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* HIGH-DENSITY 4-COLUMN PRODUCTS GRID */}
        {products.length === 0 ? (
          <div className="text-center py-20 rounded-md bg-[#0e1424] border border-white/10 text-slate-400 shadow-2xl">
            <ShoppingBag className="w-12 h-12 mx-auto text-purple-400 mb-3 opacity-60" />
            <p className="text-lg font-heading font-bold text-white">Aucun produit dans la catégorie "{category.name}" pour l instant.</p>
            <Link href="/boutique" className="mt-4 inline-block font-black text-[#a3e635] hover:underline text-sm">
              Voir tous les produits de la boutique →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {products.map((prod) => {
              const comparePrice = prod.compareAtPrice || (prod.price > 0 ? prod.price * 1.5 : 29);
              return (
                <Card
                  key={prod.id}
                  className="bg-[#0e1424] border border-white/15 hover:border-[#a3e635] transition-all duration-300 rounded-md overflow-hidden flex flex-col justify-between group shadow-xl hover:shadow-2xl hover:shadow-purple-950/50"
                >
                  <div>
                    {/* 1:1 SQUARE PRODUCT MOCKUP BOX */}
                    <Link href={`/checkout?productId=${prod.id}`} className="relative block aspect-square overflow-hidden bg-slate-950 group">
                      {prod.coverImage ? (
                        <img
                          src={prod.coverImage}
                          alt={prod.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-900/60 via-purple-950 to-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-3">
                          <Sparkles className="w-10 h-10 text-[#a3e635]" />
                          <span className="text-xs font-heading font-black text-white uppercase tracking-wider">{prod.name}</span>
                        </div>
                      )}

                      {/* FLOATING OVERLAY BADGES */}
                      <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1.5">
                        <span className="bg-[#a3e635] text-slate-950 text-[9px] font-heading font-black uppercase px-2 py-0.5 rounded-sm shadow-lg flex items-center gap-1">
                          <Zap className="w-2.5 h-2.5" />
                          <span>ACCÈS INSTANTANÉ</span>
                        </span>
                      </div>

                      <div className="absolute top-2.5 right-2.5 z-10">
                        <span className="bg-slate-950/80 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-sm border border-white/20 shadow-lg flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 text-[#a3e635] fill-[#a3e635]" />
                          <span>VÉRIFIÉ</span>
                        </span>
                      </div>
                    </Link>

                    {/* CARD CONTENT */}
                    <div className="p-4 space-y-1.5">
                      <div className="text-[10px] font-heading font-black text-[#a3e635] uppercase tracking-widest flex items-center justify-between">
                        <span>{prod.category?.name || category.name || 'OUTILS & TEMPLATES'}</span>
                        <span className="text-slate-400 font-semibold normal-case">Format : {getFileTypeLabel(prod.fileType)}</span>
                      </div>

                      <Link href={`/checkout?productId=${prod.id}`}>
                        <h3 className="font-heading font-black text-base text-white group-hover:text-[#a3e635] transition-colors leading-snug line-clamp-2">
                          {prod.name}
                        </h3>
                      </Link>

                      <p className="text-xs text-slate-400 font-medium line-clamp-2 leading-relaxed">
                        {prod.shortDescription || 'Système complet prêt à l emploi pour booster votre productivité.'}
                      </p>
                    </div>
                  </div>

                  {/* CARD FOOTER WITH HIGH IMPACT NEON CTA */}
                  <div className="p-4 pt-0 space-y-3">
                    <div className="flex items-baseline justify-between border-t border-white/10 pt-2.5">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Prix public</span>
                        <span className="text-xs text-slate-500 line-through font-semibold">{comparePrice.toFixed(2)} €</span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-[#a3e635] font-bold uppercase block">Prix spécial</span>
                        <span className="text-lg sm:text-xl font-heading font-black text-white">
                          {prod.price > 0 ? `${prod.price.toFixed(2)} €` : '0 € (Gratuit)'}
                        </span>
                      </div>
                    </div>

                    <Link href={`/checkout?productId=${prod.id}`}>
                      <button
                        type="button"
                        className="w-full py-2.5 bg-[#a3e635] hover:bg-[#86efac] text-slate-950 font-heading font-black text-xs uppercase tracking-wider rounded-md shadow-md transition-all flex items-center justify-center gap-2 group/btn"
                      >
                        <span>ACHETER MAINTENANT</span>
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </Link>
                  </div>

                </Card>
              );
            })}
          </div>
        )}

        {/* TRUST BADGES FOOTER BAR */}
        <div className="mt-14 pt-8 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-5 text-center">
          <div className="p-4 rounded-md bg-[#0e1424] border border-white/10 space-y-1">
            <ShieldCheck className="w-6 h-6 text-[#a3e635] mx-auto" />
            <h4 className="font-heading font-black text-sm text-white">Paiement 100% Sécurisé</h4>
            <p className="text-xs text-slate-400">Transactions chiffrées SSL via Stripe.</p>
          </div>

          <div className="p-4 rounded-md bg-[#0e1424] border border-white/10 space-y-1">
            <Zap className="w-6 h-6 text-[#a3e635] mx-auto" />
            <h4 className="font-heading font-black text-sm text-white">Livraison Instantanée</h4>
            <p className="text-xs text-slate-400">Accès immédiat dans votre espace client.</p>
          </div>

          <div className="p-4 rounded-md bg-[#0e1424] border border-white/10 space-y-1">
            <Sparkles className="w-6 h-6 text-[#a3e635] mx-auto" />
            <h4 className="font-heading font-black text-sm text-white">Mises à jour à Vie</h4>
            <p className="text-xs text-slate-400">Toutes les futures versions incluses.</p>
          </div>
        </div>

      </div>

      {/* REAL-TIME SOCIAL PROOF TOAST */}
      <SalesSocialProofToast />

    </div>
  );
}
