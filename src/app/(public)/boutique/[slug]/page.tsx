import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound, redirect } from 'next/navigation';
import { ShieldCheck, Download, Zap, ChevronRight, ShoppingBag, Sparkles } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { getActiveTheme, isDarkTheme } from '@/lib/theme';

export const dynamic = 'force-dynamic';

interface SingleProductOrCategoryPageProps {
  params: { slug: string };
  searchParams: { search?: string };
}

export async function generateMetadata({ params }: SingleProductOrCategoryPageProps) {
  const category = await prisma.productCategory.findFirst({
    where: {
      OR: [
        { slug: params.slug },
        { slug: params.slug.replace(/_/g, '-') },
        { slug: params.slug.replace(/-/g, '_') },
      ],
    },
  });

  if (category) {
    return {
      title: `${category.name} | Boutique Solopreneur`,
      description: category.description || `Découvrez nos ${category.name} professionnels pour solopreneurs.`,
    };
  }

  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
  });

  if (!product) return {};

  return {
    title: `${product.seoTitle || product.name} | Boutique Solopreneur`,
    description: product.seoDescription || product.shortDescription,
  };
}

export default async function BoutiqueDynamicSlugPage({ params, searchParams }: SingleProductOrCategoryPageProps) {
  const slug = params?.slug;
  const safeParams = searchParams || {};
  const searchQuery = safeParams.search;
  let activeTheme = 'modern-bento';
  let product: any = null;

  try {
    activeTheme = await getActiveTheme();

    const category = await prisma.productCategory.findFirst({
      where: {
        OR: [
          { slug: slug || '' },
          { slug: (slug || '').replace(/_/g, '-') },
          { slug: (slug || '').replace(/-/g, '_') },
        ],
      },
    });

    if (category) {
      redirect(`/boutique/categorie/${category.slug}`);
    }

    product = await prisma.product.findUnique({
      where: { slug: params.slug },
      include: {
        category: true,
      },
    });

    if (product && product.status === 'PUBLISHED') {
      redirect(`/checkout?productId=${product.id}`);
    }

    if (!product || product.status !== 'PUBLISHED') {
      notFound();
    }
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err;
    if (!product) notFound();
  }

  const isDark = isDarkTheme(activeTheme);

  return (
    <div className={`py-16 min-h-screen relative overflow-hidden ${
      isDark ? 'bg-[#0a0915] text-white' : 'bg-[#faf8f5] text-slate-900'
    }`}>
      
      {/* AMBIENT GLOW */}
      {isDark && <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[160px] pointer-events-none" />}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* BREADCRUMB */}
        <nav className={`flex items-center gap-2 text-xs mb-8 overflow-x-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          <Link href="/" className={isDark ? 'hover:text-[#ccff00]' : 'hover:text-purple-700'}>Accueil</Link>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 opacity-50" />
          <Link href="/boutique" className={isDark ? 'hover:text-[#ccff00]' : 'hover:text-purple-700'}>Boutique</Link>
          {product.category && (
            <>
              <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 opacity-50" />
              <Link href={`/boutique/categorie/${product.category.slug}`} className={isDark ? 'hover:text-[#ccff00]' : 'hover:text-purple-700'}>
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 opacity-50" />
          <span className={`font-bold truncate ${isDark ? 'text-[#ccff00]' : 'text-purple-700'}`}>{product.name}</span>
        </nav>

        {/* HERO PRODUCT GRID */}
        <div className={`grid grid-cols-1 lg:grid-cols-12 gap-10 p-6 sm:p-10 rounded-3xl border shadow-2xl mb-12 ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          
          {/* LEFT: IMAGE PREVIEW */}
          <div className="lg:col-span-7 space-y-4">
            <div className={`relative aspect-[16/10] w-full rounded-2xl overflow-hidden border ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}>
              {product.coverImage ? (
                <Image
                  src={product.coverImage}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold">
                  Visual produit
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: BUY BOX & DESCRIPTION */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div>
              {product.category && (
                <Link href={`/boutique/categorie/${product.category.slug}`}>
                  <span className={`px-3 py-1 text-xs font-heading font-black rounded-full uppercase tracking-wider mb-3 inline-block ${
                    isDark ? 'bg-purple-500/20 text-[#ccff00] border border-purple-400/30' : 'bg-purple-100 text-purple-700 border border-purple-200'
                  }`}>
                    {product.category.name}
                  </span>
                </Link>
              )}
              <h1 className={`text-2xl sm:text-3xl font-heading font-black tracking-tight leading-snug ${
                isDark ? 'text-white' : 'text-slate-950'
              }`}>
                {product.name}
              </h1>

              {/* PRICE */}
              <div className="mt-4 flex items-center gap-3.5 flex-wrap">
                <span className={`text-3xl sm:text-4xl font-heading font-black ${isDark ? 'text-white' : 'text-purple-700'}`}>
                  {product.price === 0 ? 'Gratuit' : `${product.price} €`}
                </span>

                {product.compareAtPrice && (
                  <span className="text-lg font-bold text-slate-400 line-through">
                    {product.compareAtPrice} €
                  </span>
                )}

                {product.isFeatured && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-heading font-black bg-[#ccff00] text-slate-950 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-slate-950 flex-shrink-0" />
                    <span>Best-Seller</span>
                  </span>
                )}
              </div>

              <p className={`mt-4 text-sm leading-relaxed font-normal ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                {product.shortDescription}
              </p>
            </div>

            {/* CHECKOUT CTA */}
            <div className={`space-y-4 pt-4 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
              <Link href={`/checkout?productId=${product.id}`}>
                <Button size="lg" className={`w-full text-base font-heading font-black gap-2 rounded-2xl py-4 shadow-xl ${
                  isDark ? 'bg-[#ccff00] hover:bg-[#b8e600] text-slate-950' : 'btn-purple'
                }`}>
                  <ShoppingBag className="w-5 h-5" />
                  <span>Obtenir maintenant</span>
                </Button>
              </Link>

              <div className={`space-y-2 text-xs font-medium pt-2 ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
                <div className="flex items-center gap-2">
                  <Zap className={`w-4 h-4 ${isDark ? 'text-[#ccff00]' : 'text-purple-600'}`} />
                  <span>Accès instantané après validation</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className={`w-4 h-4 ${isDark ? 'text-[#ccff00]' : 'text-purple-600'}`} />
                  <span>Paiement sécurisé & Facture avec TVA disponible</span>
                </div>
                <div className="flex items-center gap-2">
                  <Download className={`w-4 h-4 ${isDark ? 'text-[#ccff00]' : 'text-purple-600'}`} />
                  <span>Fichiers réutilisables à vie</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
