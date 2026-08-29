'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Zap, TrendingUp, DollarSign, Repeat, Star, CheckCircle, Award, Layers, Sparkles, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormattedText } from '@/components/ui/FormattedText';
import { safeJsonParse } from '@/lib/json-utils';

interface HeroPixelFunnelProps {
  title?: string;
  subtitle?: string | null;
  settings?: any;
  heroStyles?: any;
}

export function HeroPixelFunnel({
  title = "Les formations & templates qui te font <mark color='#a3e635'>gagner plus</mark> en freelance.",
  subtitle = "Des automatisations sur mesure, des templates Notion optimisés et des tableaux Excel conçus pour découpler ton chiffre d affaires.",
  settings = {},
  heroStyles = {},
}: HeroPixelFunnelProps) {
  const s = safeJsonParse(settings);
  const btn1Text = s.btn1Text || 'Voir la boutique & les templates';
  const btn1Url = s.btn1Url || '/boutique';
  const btn2Text = s.btn2Text || 'Ressources Gratuites';
  const btn2Url = s.btn2Url || '/ressources';
  const topTickerText = s.topTickerText || 'Offre Limitée 2026 : Pack Tout-en-Un à -70% !';
  const creatorName = s.creatorName || 'Thomas';
  const creatorAvatar = s.creatorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';
  const creatorTitle = s.creatorTitle || 'Fondateur Solopreneur&Co';
  const creatorSubtitle = s.creatorSubtitle || 'Architecte de Systèmes Notion & Excel';
  const creatorQuote = s.creatorQuote || '"Je conçois des systèmes d organisation et de vente clés en main, des templates Notion prêts à l emploi et des dashboards Excel automatisés pour aider les freelances à maximiser leur TJM et gagner jusqu à 10h par semaine."';
  const floatingBadge = s.floatingBadge || 'Architecte IA & Solopreneur';
  const solopreneursCount = s.solopreneursCount || '+5,400 Solopreneurs Équipés';
  const ratingText = s.ratingText || '5.0 / 5';

  const exp1 = s.exp1 || 'Templates Notion v3';
  const exp2 = s.exp2 || 'Dashboards Excel';
  const exp3 = s.exp3 || 'Workflows IA 2026';
  const exp4 = s.exp4 || 'Accompagnement';

  const stat1Val = s.stat1Val || '+20-40%';
  const stat1Label = s.stat1Label || 'Augmentation du Taux de Clics';
  const stat2Val = s.stat2Val || '3-4x';
  const stat2Label = s.stat2Label || 'Croissance des Revenus';
  const stat3Val = s.stat3Val || '60-80%';
  const stat3Label = s.stat3Label || 'Clients Récurrents';

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

  const btn1Style = s.btn1Style || 'yellow';
  const btn2Style = s.btn2Style || 'transparent';

  const getButtonStyle = (style: string) => {
    switch (style) {
      case 'yellow':
        return 'bg-[#a3e635] hover:bg-[#86efac] text-slate-950 font-black shadow-xl shadow-[#a3e635]/25 border-0 hover:scale-[1.02] transition-all';
      case 'purple':
        return 'bg-purple-700 hover:bg-purple-800 text-white font-extrabold shadow-xl shadow-purple-600/30 border-0 hover:scale-[1.02] transition-all';
      case 'white':
        return 'bg-white hover:bg-slate-100 text-slate-950 font-black border border-slate-200 shadow-md hover:scale-[1.02] transition-all';
      case 'dark':
        return 'bg-slate-900 hover:bg-slate-800 text-white font-black border border-slate-700 shadow-md hover:scale-[1.02] transition-all';
      case 'transparent':
      default:
        return 'bg-white/10 hover:bg-white/20 text-white font-bold border border-white/20 hover:scale-[1.02] transition-all';
    }
  };

  return (
    <section className="relative overflow-hidden bg-[#050811] text-white pt-16 sm:pt-20 pb-20 sm:pb-24 border-b border-slate-800">
      
      {/* AMBIENT GLOW ORBS */}
      <div className="absolute top-0 right-1/3 w-[500px] h-[500px] bg-[#a3e635]/15 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-[450px] h-[450px] bg-blue-600/15 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* SPLIT HERO GRID WITH EQUAL HEIGHT STRETCH FOR PERFECT BOTTOM ALIGNMENT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          
          {/* LEFT: PUNCHY COPYWRITING */}
          <div className={`lg:col-span-7 flex flex-col justify-between space-y-6 ${align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'}`}>
            <div className="space-y-6">
              
              {/* TOP TICKER/ALERT BADGE */}
              <div className={`flex ${align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : 'justify-start'}`}>
                <div
                  style={{
                    fontFamily: `'${badgeFont}', sans-serif`,
                    fontSize: badgeSize,
                    color: badgeColor,
                    borderColor: `${badgeColor}40`,
                    backgroundColor: `${badgeColor}15`,
                  }}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-sm border shadow-lg font-heading font-black"
                >
                  <Zap className="w-3.5 h-3.5" style={{ fill: badgeColor, color: badgeColor }} />
                  <span>{topTickerText}</span>
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
            </div>

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
          </div>

          {/* RIGHT: CREATOR BIO & EXPERTISE CARD ALIGNED PERFECTLY TO BOTTOM BASELINE */}
          <div className="lg:col-span-5 relative flex flex-col justify-between">
            
            {/* FLOATING BADGE TOP */}
            <div className="absolute -top-4 -right-2 z-20 bg-[#a3e635] text-slate-950 px-3.5 py-1 rounded-sm shadow-2xl font-heading font-black text-[11px] border border-slate-950/10 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-slate-950" />
              <span>{floatingBadge}</span>
            </div>

            {/* MAIN CREATOR BIO CARD */}
            <div className="creator-bio-card bg-[#0e1424]/95 backdrop-blur-xl border border-white/15 rounded-md p-5 sm:p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between h-full space-y-3">
              
              {/* TOP CONTENT WRAPPER */}
              <div className="space-y-3">
                
                {/* CIRCULAR AVATAR PHOTO & PROFILE HEADER */}
                <div className="flex items-center gap-3.5 border-b border-white/10 pb-3">
                  <div className="relative flex-shrink-0">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-[#a3e635] overflow-hidden shadow-xl shadow-[#a3e635]/30 relative">
                      <Image
                        src={creatorAvatar}
                        alt="Photo du Créateur"
                        fill
                        className="object-cover"
                        priority
                      />
                    </div>
                    <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#a3e635] border-2 border-slate-950 shadow-md z-10" />
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-base font-heading font-black text-white">{creatorName}</h3>
                      <CheckCircle className="w-4 h-4 text-[#a3e635] fill-[#a3e635]/20" />
                    </div>
                    <div className="text-xs text-slate-300 font-bold">{creatorTitle}</div>
                    <div className="text-[11px] text-[#a3e635] font-heading font-black flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>{creatorSubtitle}</span>
                    </div>
                  </div>
                </div>

                {/* ENRICHED BIO & MISSION BOX */}
                <div className="creator-quote-box bg-slate-950/80 p-3.5 sm:p-4 rounded-md border border-white/10 space-y-1.5 shadow-inner">
                  <div className="text-[10px] font-heading font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Ma Bibliothèques & Systèmes</span>
                    <span className="text-[#a3e635] font-black">100% Éprouvés</span>
                  </div>
                  <p className="text-[11px] text-slate-200 leading-relaxed font-normal italic">
                    {creatorQuote}
                  </p>
                </div>

                {/* EXPERTISE TOOLSET ICON PIS (ICONSET) */}
                <div className="space-y-1.5">
                  <div className="text-[10px] text-slate-400 font-heading font-bold uppercase tracking-wider">
                    Expertises & Outils inclus
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="creator-skill-pill flex items-center gap-2 p-2 rounded-md bg-slate-950/60 border border-white/10 text-[11px] font-bold text-white">
                      <span className="w-5 h-5 rounded-sm bg-[#a3e635]/20 text-[#a3e635] flex items-center justify-center font-black">
                        <Layers className="w-3 h-3" />
                      </span>
                      <span>{exp1}</span>
                    </div>

                    <div className="creator-skill-pill flex items-center gap-2 p-2 rounded-md bg-slate-950/60 border border-white/10 text-[11px] font-bold text-white">
                      <span className="w-5 h-5 rounded-sm bg-blue-500/20 text-blue-400 flex items-center justify-center font-black">
                        <DollarSign className="w-3 h-3" />
                      </span>
                      <span>{exp2}</span>
                    </div>

                    <div className="creator-skill-pill flex items-center gap-2 p-2 rounded-md bg-slate-950/60 border border-white/10 text-[11px] font-bold text-white">
                      <span className="w-5 h-5 rounded-sm bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
                        <Zap className="w-3 h-3" />
                      </span>
                      <span>{exp3}</span>
                    </div>

                    <div className="creator-skill-pill flex items-center gap-2 p-2 rounded-md bg-slate-950/60 border border-white/10 text-[11px] font-bold text-white">
                      <span className="w-5 h-5 rounded-sm bg-purple-500/20 text-purple-400 flex items-center justify-center font-black">
                        <UserCheck className="w-3 h-3" />
                      </span>
                      <span>{exp4}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* RATING & STATS FOOTER WITH TIGHTENED GAP */}
              <div className="pt-2.5 flex items-center justify-between border-t border-white/10 text-[11px] mt-auto">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="font-heading font-black text-white ml-1">{ratingText}</span>
                </div>
                <span className="text-[#a3e635] font-heading font-black">
                  {solopreneursCount}
                </span>
              </div>

            </div>

          </div>

        </div>

        {/* 3-COLUMN STATS BAR */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-white/10">
          
          <div className="p-6 bg-slate-900/80 rounded-md border border-slate-800 flex items-center gap-4 shadow-md">
            <div className="w-12 h-12 rounded-md bg-[#a3e635]/20 border border-[#a3e635]/30 flex items-center justify-center text-[#a3e635] font-black">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-heading font-black text-white">{stat1Val}</div>
              <div className="text-xs text-slate-400 font-heading font-bold uppercase tracking-wider">{stat1Label}</div>
            </div>
          </div>

          <div className="p-6 bg-slate-900/80 rounded-md border border-slate-800 flex items-center gap-4 shadow-md">
            <div className="w-12 h-12 rounded-md bg-[#a3e635]/20 border border-[#a3e635]/30 flex items-center justify-center text-[#a3e635] font-black">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-heading font-black text-white">{stat2Val}</div>
              <div className="text-xs text-slate-400 font-heading font-bold uppercase tracking-wider">{stat2Label}</div>
            </div>
          </div>

          <div className="p-6 bg-slate-900/80 rounded-md border border-slate-800 flex items-center gap-4 shadow-md">
            <div className="w-12 h-12 rounded-md bg-[#a3e635]/20 border border-[#a3e635]/30 flex items-center justify-center text-[#a3e635] font-black">
              <Repeat className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-heading font-black text-white">{stat3Val}</div>
              <div className="text-xs text-slate-400 font-heading font-bold uppercase tracking-wider">{stat3Label}</div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
