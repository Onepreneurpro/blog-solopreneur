import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, TrendingUp, ShieldCheck, Zap, Star, Check, Layers, DollarSign, Clock, Users, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormattedText } from '@/components/ui/FormattedText';

interface HeroModernBentoProps {
  title?: string;
  subtitle?: string | null;
  settings?: any;
  heroStyles?: any;
}

export function HeroModernBento({
  title = "Le système tout-en-un pour <mark color='#ccff00'>multiplier tes revenus</mark> et automatiser ton activité.",
  subtitle = "Arrête de perdre du temps avec des outils éparpillés. Accède à nos espaces Notion avancés, tableaux de trésorerie Excel et méthodes de vente validées.",
  settings = {},
  heroStyles = {},
}: HeroModernBentoProps) {
  const btnSettings = typeof settings === 'string' ? (JSON.parse(settings || '{}') || {}) : (settings || {});

  const btn1Text = btnSettings.btn1Text || 'Explorer nos outillages prêts à l emploi ⚡';
  const btn1Url = btnSettings.btn1Url || '/boutique';
  const btn1Style = btnSettings.btn1Style || 'yellow';

  const btn2Text = btnSettings.btn2Text || 'Ressources Gratuites & Guides';
  const btn2Url = btnSettings.btn2Url || '/ressources';
  const btn2Style = btnSettings.btn2Style || 'white';

  const fontGlobal = heroStyles?.fontGlobal ?? true;
  const globalFont = heroStyles?.fontFamily || 'Plus Jakarta Sans';

  const badgeFont = fontGlobal ? globalFont : (heroStyles?.badgeFont || globalFont);
  const badgeSize = heroStyles?.badgeSize || '12px';
  const badgeColor = heroStyles?.badgeColor || '#a3e635';

  const titleFont = fontGlobal ? globalFont : (heroStyles?.titleFont || globalFont);
  const titleSize = heroStyles?.titleSize || '48px';
  const titleColor = heroStyles?.titleColor || '#ffffff';

  const accentFont = fontGlobal ? globalFont : (heroStyles?.accentFont || globalFont);
  const accentColor = heroStyles?.accentColor || '#a3e635';

  const subtitleFont = fontGlobal ? globalFont : (heroStyles?.subtitleFont || globalFont);
  const subtitleSize = heroStyles?.subtitleSize || '18px';
  const subtitleColor = heroStyles?.subtitleColor || '#cbd5e1';

  const align = heroStyles?.align || 'left';

  const getButtonStyle = (style: string) => {
    switch (style) {
      case 'yellow':
        return '!bg-[#ccff00] hover:!bg-[#b8e600] !text-slate-950 font-black shadow-2xl shadow-[#ccff00]/40 border-0 hover:scale-[1.02] transition-all duration-300';
      case 'purple':
      case 'blue':
      case 'bluesky':
        return '!bg-[#00A0FF] hover:!bg-[#0080FF] !text-white font-extrabold shadow-lg shadow-[#00A0FF]/30 border-0 hover:scale-105 transition-all duration-200';
      case 'white':
        return 'bg-white hover:bg-slate-50 text-slate-950 font-extrabold border border-slate-200 shadow-md hover:scale-[1.02] transition-all duration-300';
      default:
        return '!bg-[#ccff00] hover:!bg-[#b8e600] !text-slate-950 font-black shadow-2xl border-0 hover:scale-[1.02] transition-all duration-300';
    }
  };

  return (
    <section className="relative overflow-hidden bg-[#0c0a1d] text-white pt-16 sm:pt-24 pb-20 sm:pb-28 border-b border-purple-900/40">
      
      {/* AMBIENT GLOW ORBS */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-600/25 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-[450px] h-[450px] bg-indigo-600/20 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 w-96 h-96 bg-[#ccff00]/10 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* 2-COLUMN HERO MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* LEFT COLUMN: PUNCHY TYPOGRAPHY & CALL TO ACTIONS */}
          <div className={`lg:col-span-7 space-y-8 ${align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'}`}>
            
            {/* TOP BADGE */}
            <div className={`flex ${align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : 'justify-start'}`}>
              <div
                style={{
                  fontFamily: `'${badgeFont}', sans-serif`,
                  fontSize: badgeSize,
                  color: badgeColor,
                  borderColor: `${badgeColor}40`,
                  backgroundColor: `${badgeColor}15`,
                }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-sm backdrop-blur-md border text-xs font-heading font-extrabold shadow-xl"
              >
                <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: badgeColor }} />
                <span className="font-black" style={{ color: badgeColor }}>Nouveau Système 2026</span>
                <span className="text-white/40">•</span>
                <span>+5,400 Solopreneurs Équipés</span>
              </div>
            </div>

            <h1
              style={{
                fontFamily: `'${titleFont}', sans-serif`,
                fontSize: titleSize,
                color: titleColor,
              }}
              className="font-heading font-black tracking-tight leading-[1.12]"
            >
              <FormattedText text={title} defaultMarkColor={accentColor} />
            </h1>

            {subtitle && (
              <p
                style={{
                  fontFamily: `'${subtitleFont}', sans-serif`,
                  fontSize: subtitleSize,
                  color: subtitleColor,
                }}
                className={`leading-relaxed font-normal max-w-2xl ${align === 'center' ? 'mx-auto' : align === 'right' ? 'ml-auto' : 'mx-auto lg:mx-0'}`}
              >
                <FormattedText text={subtitle} defaultMarkColor={accentColor} />
              </p>
            )}

            {/* DUAL BUTTONS */}
            <div className={`pt-2 flex flex-col sm:flex-row items-center gap-4 ${align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : 'justify-start'}`}>
              {btn1Text && (
                <Link href={btn1Url} className="w-full sm:w-auto">
                  <Button size="lg" className={`w-full sm:w-auto gap-2 text-base sm:text-lg font-heading rounded-xl px-7 py-3.5 sm:py-4 ${getButtonStyle(btn1Style)}`}>
                    <span>{btn1Text}</span>
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              )}

              {btn2Text && (
                <Link href={btn2Url} className="w-full sm:w-auto">
                  <Button size="lg" className={`w-full sm:w-auto gap-2 text-base sm:text-lg font-heading rounded-xl px-7 py-3.5 sm:py-4 ${getButtonStyle(btn2Style)}`}>
                    <span>{btn2Text}</span>
                  </Button>
                </Link>
              )}
            </div>

            {/* PROOF BADGES */}
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-heading font-extrabold text-slate-300">
              <div className="flex items-center justify-center lg:justify-start gap-2 bg-white/5 backdrop-blur-md py-3 px-4 rounded-md border border-white/10">
                <Check className="w-4 h-4 text-[#ccff00]" />
                <span>Prêt à dupliquer</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-2 bg-white/5 backdrop-blur-md py-3 px-4 rounded-md border border-white/10">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Accès instantané</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-2 bg-white/5 backdrop-blur-md py-3 px-4 rounded-md border border-white/10">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Mises à jour à vie</span>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: HIGH-IMPACT BENTO SHOWCASE WIDGET */}
          <div className="lg:col-span-5 relative">
            
            {/* FLOATING BADGE TOP */}
            <div className="absolute -top-4 -right-2 z-20 bg-[#ccff00] text-slate-950 px-4 py-2 rounded-sm shadow-2xl font-heading font-black text-xs border border-slate-950/10 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-slate-950" />
              <span>+5h/Semaine gagnées</span>
            </div>

            {/* MAIN BENTO CARD */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-md p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
              
              {/* HEADER OF WIDGET */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-[#ccff00] text-slate-950 flex items-center justify-center font-black text-lg shadow-md">
                    ⚡
                  </div>
                  <div>
                    <div className="text-sm font-heading font-black text-white">Hub Solopreneur 2026</div>
                    <div className="text-xs text-slate-400 font-medium">Dashboard & Workspaces Connectés</div>
                  </div>
                </div>
                <span className="text-[11px] font-heading font-extrabold px-3 py-1 rounded-sm bg-purple-500/20 text-purple-300 border border-purple-400/30">
                  En direct
                </span>
              </div>

              {/* CRM NOTION PREVIEW METRIC */}
              <div className="bg-slate-950/60 rounded-md p-4 border border-white/10 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
                  <span>PIPE PROSPECTION NOTION</span>
                  <span className="text-[#ccff00] font-mono font-bold">+650 € / J TJM</span>
                </div>
                
                {/* PROGRESS BARS */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white font-medium">Prospects Signés (Mois)</span>
                    <span className="text-emerald-400 font-bold">8,500 € / 10,000 €</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-500 to-[#ccff00] h-full rounded-sm w-[85%]" />
                  </div>
                </div>
              </div>

              {/* 2 MINI BENTO CARDS */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-md border border-white/10 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Gain de temps</span>
                  </div>
                  <div className="text-lg font-heading font-black text-white">12h / sem</div>
                  <div className="text-[10px] text-slate-400">Relances auto</div>
                </div>

                <div className="bg-white/5 p-4 rounded-md border border-white/10 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Trésorerie</span>
                  </div>
                  <div className="text-lg font-heading font-black text-white">4 Mois Sécurité</div>
                  <div className="text-[10px] text-slate-400">Charges calculées</div>
                </div>
              </div>

              {/* RATING FOOTER */}
              <div className="pt-2 flex items-center justify-between text-xs text-slate-300 border-t border-white/10">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                  <span className="font-bold text-white ml-1">5.0 / 5</span>
                </div>
                <span className="text-slate-400 font-medium">Par +5,000 Indépendants</span>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
