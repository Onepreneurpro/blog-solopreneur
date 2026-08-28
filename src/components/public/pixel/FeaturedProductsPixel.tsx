'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ArrowUpRight, Sparkles, Rocket, Flame, Star, Diamond, Gift, Zap, Crown, Target, Check, Bot, BookOpen, Book } from 'lucide-react';
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

const BADGE_ICONS_MAP: Record<string, any> = {
  Sparkles,
  Rocket,
  Flame,
  Star,
  Diamond,
  Gift,
  Zap,
  Crown,
  Target,
  Check,
  Bot,
  BookOpen,
  Book,
};

export function FeaturedProductsPixel({
  products = [],
  title = "Boutique Digitale : Nos Meilleurs <mark color='#a3e635'>Outillages & Templates</mark>",
  subtitle = "Des systèmes prêts à l'emploi pour structurer votre activité sans réinventer la roue.",
  settings = {},
}: FeaturedProductsPixelProps) {
  if (!products || products.length === 0) return null;

  const s = typeof settings === 'string' ? (JSON.parse(settings || '{}') || {}) : (settings || {});
  const rawLinkText = s.btnText || s.btn1Text || 'Voir toute la boutique';
  const linkText = rawLinkText.replace(/→|\s*→/g, '').trim();
  const linkUrl = s.btn1Url || '/boutique';

  const badgeText = s.badgeText || 'OUTILS HAUTE CONVERSION';
  const badgeBgHex = s.badgeBgColor;
  const badgeColorHex = s.badgeColor;
  const badgeIconColor = s.badgeIconColor || badgeColorHex || '#a3e635';

  const badgeStyle: React.CSSProperties = {
    fontFamily: s.badgeFont ? `'${s.badgeFont}', sans-serif` : undefined,
    fontSize: s.badgeSize || undefined,
    color: badgeColorHex || undefined,
    backgroundColor: badgeBgHex ? (badgeBgHex.startsWith('#') ? `${badgeBgHex}25` : badgeBgHex) : undefined,
    borderColor: badgeBgHex || badgeColorHex ? (badgeBgHex || badgeColorHex).startsWith('#') ? `${badgeBgHex || badgeColorHex}60` : (badgeBgHex || badgeColorHex) : undefined,
  };

  const SelectedBadgeIcon = s.badgeIcon && s.badgeIcon !== 'None'
    ? (BADGE_ICONS_MAP[s.badgeIcon] || Sparkles)
    : (s.badgeIcon === 'None' ? null : Sparkles);

  const iconStyle: React.CSSProperties = {
    color: badgeIconColor,
    width: s.badgeIconSize || undefined,
    height: s.badgeIconSize || undefined,
  };

  const titleStyle: React.CSSProperties = {
    fontFamily: s.titleFont ? `'${s.titleFont}', sans-serif` : undefined,
    fontSize: s.titleSize || undefined,
    color: s.titleColor || undefined,
  };

  const subtitleStyle: React.CSSProperties = {
    fontFamily: s.subtitleFont ? `'${s.subtitleFont}', sans-serif` : undefined,
    fontSize: s.subtitleSize || undefined,
    color: s.subtitleColor || undefined,
  };

  const btnStyle: React.CSSProperties = {
    fontFamily: s.btnFont ? `'${s.btnFont}', sans-serif` : undefined,
    fontSize: s.btnSize || undefined,
    color: s.btnColor || undefined,
    backgroundColor: s.btnBgColor || undefined,
  };

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
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1 rounded-sm text-xs font-heading font-black bg-[#a3e635]/20 text-[#a3e635] border border-[#a3e635]/30 mb-3 shadow-md"
              style={badgeStyle}
            >
              {SelectedBadgeIcon && <SelectedBadgeIcon className="w-3.5 h-3.5" style={iconStyle} />}
              <span>{badgeText}</span>
            </div>
            <h2
              className="text-3xl sm:text-4xl font-heading font-black text-white tracking-tight leading-tight"
              style={titleStyle}
            >
              <FormattedText text={title} />
            </h2>
            {subtitle && (
              <p
                className="text-slate-300 mt-2 text-sm sm:text-base font-medium max-w-2xl"
                style={subtitleStyle}
              >
                <FormattedText text={subtitle} />
              </p>
            )}
          </div>

          <Link
            href={linkUrl}
            className="text-xs sm:text-sm font-heading font-black text-[#a3e635] hover:underline inline-flex items-center gap-1 transition-colors shrink-0"
            style={btnStyle}
          >
            <span>{linkText}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* PRODUCTS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((prod, idx) => {
            const badgeText = badgeLabels[idx % badgeLabels.length];
            return (
              <Card key={prod.id} className="bg-[#0e1424] border border-white/10 hover:border-[#a3e635]/60 transition-all duration-300 rounded-3xl p-3.5 sm:p-4 flex flex-col justify-between group shadow-xl hover:shadow-2xl hover:shadow-[#a3e635]/10">
                <div className="space-y-3">
                  {/* INNER COVER CONTAINER WITH ROUNDED CORNERS, CIRCULAR ACTION ARROW & CATEGORY BADGE */}
                  <Link href={`/checkout?productId=${prod.id}`} className="relative block aspect-[16/11] rounded-2xl overflow-hidden bg-slate-950 group">
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

                    {/* CIRCULAR ACTION BUTTON TOP LEFT */}
                    <div className="img-overlay-arrow absolute top-2.5 left-2.5 w-8 h-8 rounded-full bg-[#0f172a] text-white border border-white/20 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 z-10">
                      <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                    </div>

                    {/* FLOATING CATEGORY BADGE BOTTOM LEFT */}
                    <span className="img-overlay-badge absolute bottom-2.5 left-2.5 px-3 py-1 bg-[#0f172a] text-white border border-white/20 text-[10px] font-heading font-black uppercase tracking-wider rounded-full shadow-md z-10">
                      {prod.category?.name || badgeText}
                    </span>
                  </Link>

                  {/* CONTENT AREA */}
                  <div className="space-y-1.5 px-1">
                    <h3 className="text-base sm:text-lg font-heading font-black text-white group-hover:text-[#a3e635] transition-colors leading-snug line-clamp-2">
                      <Link href={`/checkout?productId=${prod.id}`}>{prod.name}</Link>
                    </h3>

                    <p className="text-xs text-slate-400 font-medium line-clamp-2 leading-relaxed">
                      {prod.shortDescription}
                    </p>
                  </div>
                </div>

                {/* FOOTER PRICE & CTA */}
                <div className="space-y-3 pt-3 px-1">
                  <div className="flex items-baseline justify-between border-t border-white/10 pt-2.5">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg sm:text-xl font-heading font-black text-[#a3e635]">
                        {prod.price === 0 ? 'Gratuit' : `${prod.price} €`}
                      </span>

                      {prod.compareAtPrice && (
                        <span className="text-xs text-slate-400 line-through font-bold">
                          {prod.compareAtPrice} €
                        </span>
                      )}
                    </div>

                    <Link href={`/checkout?productId=${prod.id}`}>
                      <Button size="sm" className="bg-[#a3e635] hover:bg-[#b8f542] text-slate-950 font-heading font-black text-xs px-4 py-2 rounded-xl shadow-md border-0">
                        <span>Obtenir</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1 stroke-[2.5]" />
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
