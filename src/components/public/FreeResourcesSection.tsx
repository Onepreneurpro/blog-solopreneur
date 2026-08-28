import React from 'react';
import Link from 'next/link';
import { Download, FileText, Gift, ArrowRight, ArrowUpRight, Sparkles, Rocket, Flame, Star, Diamond, Zap, Crown, Target, Check, Bot, BookOpen, Book } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormattedText } from '@/components/ui/FormattedText';

interface ResourceItem {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string | null;
  coverImage?: string | null;
  downloadsCount: number;
}

interface FreeResourcesSectionProps {
  resources: ResourceItem[];
  title?: string;
  subtitle?: string | null;
  settings?: any;
  isDark?: boolean;
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

export function FreeResourcesSection({
  resources = [],
  title = "Guides, Checklists & Modèles 100% Gratuits",
  subtitle = "Téléchargez nos outils gratuits pour améliorer instantanément vos process.",
  settings = {},
  isDark = true,
}: FreeResourcesSectionProps) {
  if (!resources || resources.length === 0) return null;

  const s = typeof settings === 'string' ? (JSON.parse(settings || '{}') || {}) : (settings || {});
  const linkText = s.btnText || s.btn1Text || 'Découvrir toutes les ressources';
  const linkUrl = s.btn1Url || '/ressources';

  const badgeText = s.badgeText || 'Ressources Offertes';
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
    ? (BADGE_ICONS_MAP[s.badgeIcon] || Gift)
    : (s.badgeIcon === 'None' ? null : Gift);

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
  };

  return (
    <section className={`py-16 sm:py-24 border-b ${
      isDark ? 'bg-[#0b0f19] text-white border-white/10' : 'bg-[#faf8f5] text-slate-950 border-slate-200'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div
              className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-sm text-xs font-heading font-black mb-2 shadow-xs ${
                isDark ? 'bg-[#a3e635]/20 text-[#a3e635] border border-[#a3e635]/30' : 'bg-[#ccff00] text-slate-950'
              }`}
              style={badgeStyle}
            >
              {SelectedBadgeIcon && <SelectedBadgeIcon className="w-3.5 h-3.5" style={iconStyle} />}
              <span>{badgeText}</span>
            </div>

            <h2
              className={`text-2xl sm:text-3xl lg:text-4xl font-heading font-black tracking-tight ${
                isDark ? 'text-white' : 'text-slate-950'
              }`}
              style={titleStyle}
            >
              <FormattedText text={title} />
            </h2>

            {subtitle && (
              <p
                className={`mt-1 text-sm sm:text-base font-medium ${
                  isDark ? 'text-slate-300' : 'text-slate-600'
                }`}
                style={subtitleStyle}
              >
                <FormattedText text={subtitle} />
              </p>
            )}
          </div>

          <Link
            href={linkUrl}
            className={`text-xs sm:text-sm font-heading font-black inline-flex items-center gap-1 transition-colors ${
              isDark ? 'text-[#a3e635] hover:underline' : 'text-purple-700 hover:text-purple-900'
            }`}
            style={btnStyle}
          >
            <span>{linkText}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* RESOURCES GRID (3 COLUMNS) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {resources.slice(0, 3).map((res) => (
            <Card
              key={res.id}
              className={`border transition-all duration-300 rounded-3xl p-3.5 sm:p-4 flex flex-col justify-between group shadow-xl hover:shadow-2xl ${
                isDark
                  ? 'bg-[#0e1424] border-white/10 hover:border-[#a3e635]/60 hover:shadow-[#a3e635]/10 text-white'
                  : 'bg-white border-2 border-slate-200 hover:border-purple-600 text-slate-950'
              }`}
            >
              <div className="space-y-3">
                {/* INNER COVER CONTAINER WITH ROUNDED CORNERS, CIRCULAR ACTION ARROW & CATEGORY BADGE */}
                <Link href={`/checkout?productId=${res.id}`} className="relative block aspect-[16/11] rounded-2xl overflow-hidden bg-slate-950 group">
                  {res.coverImage ? (
                    <img
                      src={res.coverImage}
                      alt={res.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-900/60 via-purple-950 to-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-3">
                      <FileText className="w-10 h-10 text-[#a3e635]" />
                      <span className="text-xs font-heading font-black text-white uppercase tracking-wider">{res.name}</span>
                    </div>
                  )}

                  {/* CIRCULAR ACTION BUTTON TOP LEFT */}
                  <div className="absolute top-2.5 left-2.5 w-8 h-8 rounded-full bg-[#a3e635] text-slate-950 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-[#b8f542] transition-transform duration-300 z-10">
                    <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                  </div>

                  {/* FLOATING CATEGORY BADGE BOTTOM LEFT */}
                  <span className="absolute bottom-2.5 left-2.5 px-3 py-1 bg-[#a3e635] text-slate-950 text-[10px] font-heading font-black uppercase tracking-wider rounded-full shadow-md z-10">
                    100% OFFERT
                  </span>

                  <div className="absolute top-2.5 right-2.5 z-10">
                    <span className="bg-slate-950/80 backdrop-blur-md text-white text-[9px] font-bold px-2.5 py-1 rounded-full border border-white/20 shadow-lg flex items-center gap-1">
                      <Download className="w-2.5 h-2.5 text-[#a3e635]" />
                      <span>{res.downloadsCount || 100}+ dl</span>
                    </span>
                  </div>
                </Link>

                {/* CARD BODY */}
                <div className="space-y-1.5 px-1">
                  <div className="text-[10px] font-heading font-bold text-slate-400 uppercase tracking-wider">
                    RESSOURCE DIGITAL
                  </div>

                  <Link href={`/checkout?productId=${res.id}`}>
                    <h3 className={`font-heading font-black text-base transition-colors leading-snug line-clamp-2 ${
                      isDark ? 'text-white group-hover:text-[#a3e635]' : 'text-slate-950 group-hover:text-purple-700'
                    }`}>
                      {res.name}
                    </h3>
                  </Link>

                  <p className={`text-xs font-medium line-clamp-2 leading-relaxed ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    {res.shortDescription || 'Guide pratique et modèle dupliquable immédiatement.'}
                  </p>
                </div>
              </div>

              {/* CARD FOOTER WITH HIGH IMPACT BUTTON */}
              <div className="space-y-3 pt-3 px-1">
                <div className="flex items-baseline justify-between border-t border-white/10 pt-2.5 text-xs">
                  <span className="text-[#a3e635] font-black uppercase">100% GRATUIT</span>
                  <span className="text-slate-500 line-through font-semibold font-mono">19.00 €</span>
                </div>

                <Link href={`/checkout?productId=${res.id}`}>
                  <Button size="sm" className={`w-full py-2.5 font-heading font-black text-xs uppercase tracking-wider rounded-xl shadow-lg hover:scale-[1.01] transition-all flex items-center justify-center gap-1.5 ${
                    isDark ? 'bg-[#a3e635] hover:bg-[#b8f542] text-slate-950' : 'btn-purple'
                  }`}>
                    <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Obtenir gratuitement</span>
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>

      </div>
    </section>
  );
}
