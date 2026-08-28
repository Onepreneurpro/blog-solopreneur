import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ShoppingBag, ChevronRight, ArrowRight } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getActiveTheme, isDarkTheme } from '@/lib/theme';

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

  try {
    activeTheme = await getActiveTheme();

    category = await prisma.productCategory.findUnique({
      where: { slug: categorySlug },
    });

    if (!category) {
      notFound();
    }

    categories = await prisma.productCategory.findMany({
      orderBy: { name: 'asc' },
    });

    const whereCondition: any = {
      status: 'PUBLISHED',
    };

    if (categorySlug === 'ressources') {
      whereCondition.OR = [
        { isFreeResource: true },
        { category: { slug: 'ressources' } },
      ];
    } else {
      whereCondition.isFreeResource = false;
      whereCondition.category = { slug: categorySlug };
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

  const isDark = isDarkTheme(activeTheme);

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
          <Link href="/" className={isDark ? 'hover:text-[#ccff00]' : 'hover:text-purple-700'}>Accueil</Link>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 opacity-50" />
          <Link href="/boutique" className={isDark ? 'hover:text-[#ccff00]' : 'hover:text-purple-700'}>Boutique</Link>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 opacity-50" />
          <span className={`font-extrabold ${isDark ? 'text-[#ccff00]' : 'text-purple-700'}`}>{category.name}</span>
        </nav>

        {/* HERO SECTION */}
        <div className="mb-10">
          <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-heading font-black mb-4 shadow-sm ${
            isDark ? 'bg-purple-500/20 text-[#ccff00] border border-purple-400/30' : 'bg-[#ccff00] text-slate-950'
          }`}>
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>CATÉGORIE BOUTIQUE</span>
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
              {category.description || `Retrouvez tous les produits et ressources de la catégorie ${category.name}.`}
            </p>
          </div>
        </div>

        {/* TAB NAVIGATION BAR */}
        <div className={`border-b mb-10 ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar scrollbar-none">
            <Link
              href="/boutique"
              className={`pb-3.5 text-xs sm:text-sm font-heading font-bold whitespace-nowrap transition-all border-b-2 border-transparent ${
                isDark ? 'text-slate-400 hover:text-white hover:border-purple-400' : 'text-slate-600 hover:text-slate-950 hover:border-purple-300'
              }`}
            >
              Tous les produits
            </Link>

            {categories.map((cat) => {
              const isActive = cat.slug === categorySlug;
              return (
                <Link
                  key={cat.id}
                  href={`/boutique/categorie/${cat.slug}`}
                  className={`pb-3.5 text-xs sm:text-sm font-heading whitespace-nowrap transition-all border-b-2 ${
                    isActive
                      ? isDark ? 'border-[#ccff00] text-[#ccff00] font-black' : 'border-purple-700 text-purple-700 font-black'
                      : isDark ? 'border-transparent text-slate-400 hover:text-white hover:border-purple-400 font-bold' : 'border-transparent text-slate-600 hover:text-slate-950 hover:border-purple-300 font-bold'
                  }`}
                >
                  {cat.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* PRODUCTS GRID */}
        {products.length === 0 ? (
          <div className={`text-center py-16 rounded-3xl border shadow-xl ${
            isDark ? 'bg-slate-900/60 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600'
          }`}>
            <p className="text-base">Aucun produit dans la catégorie "{category.name}" pour l instant.</p>
            <Link href="/boutique" className={`mt-4 inline-block font-black hover:underline ${isDark ? 'text-[#ccff00]' : 'text-purple-700'}`}>
              Voir tous les produits de la boutique
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((prod) => (
              <Card key={prod.id} className={`flex flex-col h-full group transition-all duration-300 rounded-3xl overflow-hidden shadow-md hover:shadow-xl ${
                isDark
                  ? 'bg-slate-900/90 border border-slate-800 hover:border-purple-500/60'
                  : 'bg-white border-2 border-slate-200 hover:border-purple-600'
              }`}>
                
                {/* IMAGE COVER */}
                <Link href={`/boutique/${prod.slug}`} className="relative block aspect-[16/10] overflow-hidden bg-slate-950">
                  {prod.coverImage ? (
                    <Image
                      src={prod.coverImage}
                      alt={prod.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-950 flex items-center justify-center text-slate-500 text-xs font-medium">
                      Pas d image
                    </div>
                  )}

                  {/* CATEGORY BADGE */}
                  {prod.category && (
                    <div className="absolute top-4 left-4 z-10">
                      <span className={`px-3.5 py-1 backdrop-blur-md font-heading font-black text-[11px] rounded-full shadow-md ${
                        isDark ? 'bg-slate-950/90 text-[#ccff00] border border-[#ccff00]/30' : 'bg-white/95 text-slate-950 border border-slate-200'
                      }`}>
                        {prod.category.name}
                      </span>
                    </div>
                  )}
                </Link>

                {/* CONTENT AREA */}
                <div className="p-6 flex flex-col flex-grow">
                  
                  <h2 className={`text-lg font-heading font-extrabold transition-colors line-clamp-2 mb-2 leading-snug ${
                    isDark ? 'text-white group-hover:text-[#ccff00]' : 'text-slate-950 group-hover:text-purple-700'
                  }`}>
                    <Link href={`/boutique/${prod.slug}`}>{prod.name}</Link>
                  </h2>

                  <p className={`text-xs line-clamp-3 leading-relaxed mb-6 font-normal ${
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  }`}>
                    {prod.shortDescription}
                  </p>

                  <div className={`mt-auto pt-4 border-t flex items-center justify-between ${
                    isDark ? 'border-slate-800' : 'border-slate-100'
                  }`}>
                    <div>
                      <span className={`text-xl font-heading font-black ${isDark ? 'text-white' : 'text-slate-950'}`}>
                        {prod.price === 0 ? 'Gratuit' : `${prod.price} €`}
                      </span>
                    </div>

                    <Link href={`/boutique/${prod.slug}`}>
                      <Button size="sm" className={`font-heading font-black text-xs px-4 py-2 rounded-xl shadow-md ${
                        isDark ? 'bg-[#ccff00] hover:bg-[#b8e600] text-slate-950' : 'btn-purple'
                      }`}>
                        <span>Obtenir</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
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
