import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, CheckCircle2, ShieldCheck, Zap, Star, TrendingUp, Layers, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormattedText } from '@/components/ui/FormattedText';

interface HeroProps {
  title?: string;
  subtitle?: string | null;
  settings?: any;
  heroStyles?: any;
}

export function Hero({
  title = "Les formations & templates qui te font <mark>gagner plus</mark> en freelance.",
  subtitle = "Des automatisations sur mesure, des templates Notion optimisés et des tableaux Excel conçus pour décupler ton chiffre d affaires.",
  settings = {},
  heroStyles = {},
}: HeroProps) {

  // Parse settings if passed as JSON string
  const btnSettings = typeof settings === 'string' ? (JSON.parse(settings || '{}') || {}) : (settings || {});

  const btn1Text = btnSettings.btn1Text || 'Voir la boutique & les templates';
  const btn1Url = btnSettings.btn1Url || '/boutique';
  const btn1Style = btnSettings.btn1Style || 'yellow';

  const btn2Text = btnSettings.btn2Text || 'Ressources Gratuites';
  const btn2Url = btnSettings.btn2Url || '/ressources';
  const btn2Style = btnSettings.btn2Style || 'purple';

  const fontGlobal = heroStyles?.fontGlobal ?? true;
  const globalFont = heroStyles?.fontFamily || 'Plus Jakarta Sans';

  const badgeFont = fontGlobal ? globalFont : (heroStyles?.badgeFont || globalFont);
  const badgeSize = heroStyles?.badgeSize || '12px';
  const badgeColor = heroStyles?.badgeColor || '#7e22ce';

  const titleFont = fontGlobal ? globalFont : (heroStyles?.titleFont || globalFont);
  const titleSize = heroStyles?.titleSize || '48px';
  const titleColor = heroStyles?.titleColor || '#090d16';

  const accentFont = fontGlobal ? globalFont : (heroStyles?.accentFont || globalFont);
  const accentColor = heroStyles?.accentColor || '#a3e635';

  const subtitleFont = fontGlobal ? globalFont : (heroStyles?.subtitleFont || globalFont);
  const subtitleSize = heroStyles?.subtitleSize || '18px';
  const subtitleColor = heroStyles?.subtitleColor || '#475569';

  const align = heroStyles?.align || 'left';

  const getButtonStyle = (style: string) => {
    switch (style) {
      case 'yellow':
        return '!bg-[#ccff00] hover:!bg-[#b8e600] !text-slate-950 font-black shadow-xl shadow-[#ccff00]/30 border-0 hover:scale-105 transition-all duration-200';
      case 'purple':
      case 'blue':
      case 'bluesky':
        return '!bg-[#00A0FF] hover:!bg-[#0080FF] !text-white font-extrabold shadow-lg shadow-[#00A0FF]/30 border-0 hover:scale-105 transition-all duration-200';
      case 'white':
        return '!bg-white hover:!bg-slate-100 !text-slate-950 font-extrabold border border-slate-300 shadow-sm hover:scale-105 transition-all duration-200';
      default:
        return '!bg-[#ccff00] hover:!bg-[#b8e600] !text-slate-950 font-black shadow-xl border-0 hover:scale-105 transition-all duration-200';
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#faf8f5] via-white to-slate-50 text-slate-900 pt-16 sm:pt-20 lg:pt-24 pb-16 sm:pb-20 border-b border-slate-200/80">
      
      {/* DECORATIVE BACKGROUND BLUR ORBS */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-200/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-yellow-200/50 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center lg:items-stretch">
          
          {/* LEFT COLUMN: HERO CONTENT */}
          <div className={`lg:col-span-7 space-y-6 flex flex-col justify-center ${align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'}`}>
            
            {/* BADGE */}
            <div className={`inline-flex items-center gap-2 ${align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : 'justify-start'}`}>
              <span
                style={{
                  fontFamily: `'${badgeFont}', sans-serif`,
                  fontSize: badgeSize,
                  color: badgeColor,
                  borderColor: `${badgeColor}40`,
                  backgroundColor: `${badgeColor}15`,
                }}
                className="px-4 py-1.5 font-heading font-black tracking-wider uppercase rounded-full shadow-xs border"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5 inline animate-pulse" style={{ color: badgeColor }} />
                ⚡ Académie & Outillages 100% Solopreneurs 2026
              </span>
            </div>

            {/* DYNAMIC MAIN HEADING WITH FORMATTED TEXT EFFECTS */}
            <h1
              style={{
                fontFamily: `'${titleFont}', sans-serif`,
                fontSize: titleSize,
                color: titleColor,
              }}
              className="font-heading font-black tracking-tight leading-[1.18]"
            >
              <FormattedText text={title} defaultMarkColor={accentColor} />
            </h1>

            {/* DYNAMIC SUBTITLE WITH FORMATTED TEXT EFFECTS */}
            {subtitle && (
              <p
                style={{
                  fontFamily: `'${subtitleFont}', sans-serif`,
                  fontSize: subtitleSize,
                  color: subtitleColor,
                }}
                className={`max-w-2xl leading-relaxed font-semibold ${align === 'center' ? 'mx-auto' : align === 'right' ? 'ml-auto' : 'mx-auto lg:mx-0'}`}
              >
                <FormattedText text={subtitle} defaultMarkColor={accentColor} />
              </p>
            )}

            {/* DYNAMIC CTA BUTTONS */}
            <div className={`pt-2 flex flex-col sm:flex-row items-center gap-4 ${align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : 'justify-start'}`}>
              {btn1Text && (
                <Link href={btn1Url} className="w-full sm:w-auto">
                  <Button size="lg" className={`w-full sm:w-auto gap-2 text-base sm:text-lg font-heading rounded-full px-7 py-3.5 sm:py-4 ${getButtonStyle(btn1Style)}`}>
                    <span>{btn1Text}</span>
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              )}

              {btn2Text && (
                <Link href={btn2Url} className="w-full sm:w-auto">
                  <Button size="lg" className={`w-full sm:w-auto gap-2 text-base sm:text-lg font-heading rounded-full px-7 py-3.5 sm:py-4 ${getButtonStyle(btn2Style)}`}>
                    <span>{btn2Text}</span>
                  </Button>
                </Link>
              )}
            </div>

            {/* PROOF BADGES */}
            <div className="pt-6 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-heading font-black text-slate-800">
              <div className="flex items-center justify-center lg:justify-start gap-2 !bg-white py-2.5 px-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-purple-700 flex-shrink-0" />
                <span>Templates prêts</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-2 !bg-white py-2.5 px-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                <Zap className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span>Accès immédiat</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-2 !bg-white py-2.5 px-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Garantie suivi</span>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: EQUILIBRIUM TALL VISUAL SHOWCASE CARD */}
          <div className="lg:col-span-5 flex justify-center relative items-center">
            
            {/* FLOATING BADGE TOP RIGHT */}
            <div className="absolute -top-3 -right-2 z-20 !bg-[#ccff00] !text-slate-950 px-3.5 py-1.5 rounded-2xl shadow-xl font-heading font-black text-xs border border-slate-950/10 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-slate-950" />
              <span>+250% Productivité</span>
            </div>

            {/* TALL HERO SHOWCASE CARD CONTAINER FOR PERFECT EQUILIBRIUM */}
            <div className="w-full h-full min-h-[440px] !bg-white p-7 rounded-3xl border-2 border-slate-200 shadow-2xl flex flex-col justify-between relative z-10 overflow-hidden space-y-6">
              
              {/* HEADER BADGE */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl !bg-purple-100 !text-purple-700 flex items-center justify-center font-extrabold shadow-xs">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-heading font-black !text-slate-950">Pack Solopreneur 2026</div>
                    <div className="text-[11px] !text-slate-500 font-semibold">Workspaces Notion & Tableaux Excel</div>
                  </div>
                </div>
                <span className="text-[11px] font-heading font-black px-2.5 py-1 rounded-full !bg-emerald-100 !text-emerald-900 border border-emerald-300">
                  Prêt à utiliser
                </span>
              </div>

              {/* INCLUDED ITEMS CHECKLIST */}
              <div className="space-y-3 !bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="text-[11px] font-black uppercase text-purple-700 tracking-wider">
                  Systèmes Inclus dans le Pack :
                </div>

                <div className="space-y-2 text-xs font-heading font-black !text-slate-900">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full !bg-emerald-500 !text-white flex items-center justify-center text-[10px] font-black flex-shrink-0">✓</div>
                    <span>CRM Clients & Suivi des Devis Notion</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full !bg-emerald-500 !text-white flex items-center justify-center text-[10px] font-black flex-shrink-0">✓</div>
                    <span>Calculateur de TJM & Négociation Freelance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full !bg-emerald-500 !text-white flex items-center justify-center text-[10px] font-black flex-shrink-0">✓</div>
                    <span>Dashboard de Trésorerie Excel Automatisé</span>
                  </div>
                </div>
              </div>

              {/* STATS PREVIEW GRID */}
              <div className="grid grid-cols-2 gap-3">
                <div className="!bg-purple-50 p-3 rounded-2xl border border-purple-200">
                  <span className="text-[10px] uppercase font-black text-purple-700">Missions Signées</span>
                  <div className="text-xl font-heading font-black !text-slate-950 mt-0.5">+12 / mois</div>
                </div>
                <div className="!bg-emerald-50 p-3 rounded-2xl border border-emerald-200">
                  <span className="text-[10px] uppercase font-black text-emerald-800">Temps Gagné</span>
                  <div className="text-xl font-heading font-black !text-slate-950 mt-0.5">5h / sem</div>
                </div>
              </div>

              {/* RATING & REVIEWS */}
              <div className="!bg-[#1e1b4b] !text-white p-4 rounded-2xl flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full !bg-[#ccff00] !text-slate-950 font-black flex items-center justify-center text-xs shadow-xs">
                    5.0
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(5)].map((_, idx) => (
                        <Star key={idx} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <div className="text-[11px] !text-purple-200 font-semibold">Recommandé par +500 freelances</div>
                  </div>
                </div>
                <Award className="w-6 h-6 text-[#ccff00]" />
              </div>

            </div>

            {/* FLOATING BADGE BOTTOM LEFT */}
            <div className="absolute -bottom-3 -left-2 z-20 !bg-white !text-slate-950 px-3.5 py-1.5 rounded-2xl shadow-xl font-heading font-black text-xs border border-slate-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Garantie Satisfait ou Remboursé</span>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
