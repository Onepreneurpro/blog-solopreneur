'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormattedText } from '@/components/ui/FormattedText';

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string | null;
  coverImage?: string | null;
  price: number;
  compareAtPrice?: number | null;
  isFeatured?: boolean;
  category?: { name: string; slug: string } | null;
}

interface FeaturedProductsPixelProps {
  products: ProductItem[];
  title?: string;
  subtitle?: string | null;
  settings?: any;
}

export function FeaturedProductsPixel({
  products = [],
  title = "Boutique Digitale : Nos Meilleurs <mark color='#a3e635'>Outillages & Templates</mark>",
  subtitle = "Des systèmes prêts à l'emploi pour structurer votre activité sans réinventer la roue.",
  settings = {},
}: FeaturedProductsPixelProps) {
  if (!products || products.length === 0) return null;

  const btnSettings = typeof settings === 'string' ? (JSON.parse(settings || '{}') || {}) : (settings || {});
  const linkText = btnSettings.btn1Text || 'Voir toute la boutique →';
  const linkUrl = btnSettings.btn1Url || '/boutique';

  const badgeLabels = [
    'SALE • 5 SALES FUNNELS & 1 WEBSITE',
    'FEATURED • 2 STEP FUNNEL',
    'NEW • 5 LINK-IN-BIO\'S',
    'HOT • 3 STEP FUNNEL',
  ];

  return (
    <section className="pt-8 pb-20 bg-[#0b0f19] text-white border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-sm text-xs font-heading font-black bg-[#a3e635]/20 text-[#a3e635] border border-[#a3e635]/30 mb-3 shadow-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>OUTILS HAUTE CONVERSION</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-heading font-black text-white tracking-tight leading-tight">
              <FormattedText text={title} />
            </h2>
            {subtitle && (
              <p className="text-slate-300 mt-2 text-base font-normal max-w-2xl">
                <FormattedText text={subtitle} />
              </p>
            )}
          </div>

          <Link href={linkUrl}>
            <Button size="lg" className="bg-[#a3e635] hover:bg-[#86efac] text-slate-950 font-heading font-black text-xs sm:text-sm rounded-md px-6 py-4 shadow-xl border-0">
              <span>{linkText}</span>
            </Button>
          </Link>
        </div>

        {/* PRODUCTS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((prod, idx) => {
            const badgeText = badgeLabels[idx % badgeLabels.length];
            return (
              <Card key={prod.id} className="flex flex-col h-full group bg-[#0e1424]/90 border border-white/10 hover:border-[#a3e635]/60 shadow-xl hover:shadow-2xl hover:shadow-[#a3e635]/10 transition-all duration-300 rounded-md overflow-hidden">
                
                {/* IMAGE COVER WITH HIGHLEVEL OVERLAY BADGE */}
                <Link href={`/checkout?productId=${prod.id}`} className="relative block aspect-[16/10] overflow-hidden bg-slate-950">
                  {prod.coverImage ? (
                    <Image
                      src={prod.coverImage}
                      alt={prod.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-950 flex items-center justify-center text-slate-500 text-xs font-medium">
                      Visual Produit HighLevel
                    </div>
                  )}

                  {/* HIGHLEVEL BLACK/WHITE PILL BADGE TOP LEFT */}
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-white text-slate-950 font-heading font-black text-[10px] uppercase rounded-sm shadow-lg border border-slate-200">
                      {badgeText}
                    </span>
                  </div>
                </Link>

                {/* CONTENT AREA */}
                <div className="p-6 flex flex-col flex-grow">
                  
                  <h3 className="text-lg font-heading font-black text-white group-hover:text-[#a3e635] transition-colors line-clamp-2 mb-2 leading-snug">
                    <Link href={`/checkout?productId=${prod.id}`}>{prod.name}</Link>
                  </h3>

                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed mb-6 font-normal">
                    {prod.shortDescription}
                  </p>

                  {/* FOOTER PRICE & HIGHLEVEL STYLED ACCENT */}
                  <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-heading font-black text-[#a3e635]">
                        {prod.price === 0 ? 'Gratuit' : `${prod.price} €`}
                      </span>

                      {prod.compareAtPrice && (
                        <span className="text-xs text-slate-400 line-through font-bold">
                          {prod.compareAtPrice} €
                        </span>
                      )}
                    </div>

                    <Link href={`/checkout?productId=${prod.id}`}>
                      <Button size="sm" className="bg-[#a3e635] hover:bg-[#86efac] text-slate-950 font-heading font-black text-xs px-4 py-2 rounded-md shadow-md border-0">
                        <span>Obtenir</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>
                  </div>

                </div>
              </Card>
            );
          })}
        </div>

      </div>
    </section>
  );
}
