import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ShoppingBag, Star, Download, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormattedText } from '@/components/ui/FormattedText';

interface FeaturedProductsModernProps {
  products?: any[];
  title?: string;
  subtitle?: string | null;
  settings?: any;
}

export function FeaturedProductsModern({
  products = [],
  title = "Les outillages <mark color='#ccff00'>les plus téléchargés</mark> par la communauté",
  subtitle = "Des solutions prêtes à démarrer instantanément pour automatiser votre quotidien de freelance.",
  settings = {},
}: FeaturedProductsModernProps) {
  return (
    <section className="py-20 bg-slate-950 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-xs font-heading font-black">
              <ShoppingBag className="w-3.5 h-3.5 text-[#ccff00]" />
              <span>BOUTIQUE EXCLUSIVE</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-white tracking-tight leading-tight">
              <FormattedText text={title} />
            </h2>

            {subtitle && (
              <p className="text-slate-400 text-base leading-relaxed">
                <FormattedText text={subtitle} />
              </p>
            )}
          </div>

          <div>
            <Link href="/boutique">
              <Button size="lg" className="bg-[#ccff00] hover:bg-[#b8e600] text-slate-950 font-heading font-black text-xs sm:text-sm rounded-full px-6 py-5 hover:scale-105 transition-all shadow-xl">
                <span>Voir tous les produits</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>

        {/* PRODUCTS GRID */}
        {products.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/60 rounded-3xl border border-slate-800">
            <p className="text-slate-400">Aucun produit mis en avant pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((prod) => (
              <Card key={prod.id} className="flex flex-col h-full group bg-slate-900 border border-slate-800 hover:border-purple-500/60 shadow-xl hover:shadow-2xl hover:shadow-purple-900/20 transition-all duration-300 rounded-3xl overflow-hidden">
                
                {/* IMAGE COVER WITH CATEGORY BADGE */}
                <Link href={`/boutique/${prod.slug}`} className="relative block aspect-[16/10] overflow-hidden bg-slate-950">
                  {prod.coverImage ? (
                    <Image
                      src={prod.coverImage}
                      alt={prod.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-950 flex items-center justify-center text-slate-500 text-xs">
                      Pas d image
                    </div>
                  )}

                  {/* CATEGORY BADGE */}
                  {prod.category && (
                    <div className="absolute top-4 left-4 z-10">
                      <span className="px-3.5 py-1 bg-slate-950/90 backdrop-blur-md text-[#ccff00] font-heading font-black text-[11px] rounded-full border border-[#ccff00]/30 shadow-md">
                        {prod.category.name}
                      </span>
                    </div>
                  )}
                </Link>

                {/* CONTENT */}
                <div className="p-6 flex flex-col flex-grow space-y-4">
                  <h3 className="text-xl font-heading font-extrabold text-white group-hover:text-[#ccff00] transition-colors line-clamp-2 leading-snug">
                    <Link href={`/boutique/${prod.slug}`}>{prod.name}</Link>
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed flex-grow">
                    {prod.shortDescription}
                  </p>

                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-2xl font-heading font-black text-white">
                      {prod.price === 0 ? 'Gratuit' : `${prod.price} €`}
                    </span>

                    <Link href={`/boutique/${prod.slug}`}>
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white font-heading font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md">
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
    </section>
  );
}
