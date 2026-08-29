import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ShoppingBag } from 'lucide-react';
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
  downloadsCount: number;
  isFeatured: boolean;
  category?: { name: string; slug: string } | null;
}

interface FeaturedProductsProps {
  products: ProductItem[];
  title?: string;
  subtitle?: string | null;
  settings?: any;
}

export function FeaturedProducts({
  products = [],
  title = "Boutique Digitale : Nos Meilleurs Outillages & Templates",
  subtitle = "Des systèmes prêts à l'emploi pour structurer votre activité sans réinventer la roue.",
  settings = {},
}: FeaturedProductsProps) {
  if (!products || products.length === 0) return null;

  const btnSettings = typeof settings === 'string' ? (JSON.parse(settings || '{}') || {}) : (settings || {});
  const linkText = btnSettings.btn1Text || 'Voir toute la boutique';
  const linkUrl = btnSettings.btn1Url || '/boutique';

  return (
    <section className="py-16 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* SECTION HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-heading font-extrabold bg-purple-100 text-purple-900 border border-purple-200 mb-2">
              <ShoppingBag className="w-3.5 h-3.5 text-purple-700" />
              <span>Boutique Digitale</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 tracking-tight">
              <FormattedText text={title} />
            </h2>
            {subtitle && (
              <p className="text-slate-600 mt-1 text-sm">
                <FormattedText text={subtitle} />
              </p>
            )}
          </div>
          <Link href={linkUrl} className="text-xs font-heading font-extrabold text-purple-700 hover:text-purple-900 inline-flex items-center gap-1">
            <span>{linkText}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* PRODUCTS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((prod) => (
            <Card key={prod.id} className="flex flex-col h-full group bg-white border-slate-200/80 hover:border-purple-300 shadow-xs hover:shadow-md transition-all rounded-2xl overflow-hidden">
              <Link href={`/boutique/${prod.slug}`} className="relative block aspect-[16/9] overflow-hidden bg-slate-100">
                {prod.coverImage ? (
                  <Image
                    src={prod.coverImage}
                    alt={prod.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
                    Pas d image
                  </div>
                )}
                {prod.category && (
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 bg-white/90 backdrop-blur-md text-purple-900 border border-purple-100 font-heading font-extrabold text-[11px] rounded-lg shadow-xs">
                      {prod.category.name}
                    </span>
                  </div>
                )}
              </Link>

              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-lg font-heading font-extrabold text-slate-900 group-hover:text-purple-700 transition-colors line-clamp-1 mb-2">
                  <Link href={`/boutique/${prod.slug}`}>{prod.name}</Link>
                </h3>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-6">
                  {prod.shortDescription}
                </p>

                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    {prod.compareAtPrice && (
                      <span className="text-xs text-slate-400 line-through mr-2 font-mono">
                        {prod.compareAtPrice} €
                      </span>
                    )}
                    <span className="text-lg font-heading font-extrabold text-purple-700 font-mono">
                      {prod.price === 0 ? 'Gratuit' : `${prod.price} €`}
                    </span>
                  </div>

                  <Link href={`/boutique/${prod.slug}`}>
                    <Button size="sm" className="btn-purple font-bold text-xs gap-1.5 py-1.5 px-3">
                      <span>Obtenir</span>
                      <ShoppingBag className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>

      </div>
    </section>
  );
}
