import React from 'react';
import Link from 'next/link';
import { ArrowRight, LayoutGrid, Sparkles, Zap, Shield, FileSpreadsheet, Layers, Calculator } from 'lucide-react';
import { FormattedText } from '@/components/ui/FormattedText';

interface CategoryGridModernProps {
  title?: string;
  subtitle?: string | null;
  settings?: any;
}

export function CategoryGridModern({
  title = "Tout ce dont tu as besoin pour <mark color='#ccff00'>structurer ton activité</mark>",
  subtitle = "Accède à des outillages prêts à l'emploi créés spécifiquement pour répondre aux enjeux concrets des solopreneurs.",
  settings = {},
}: CategoryGridModernProps) {
  const s = typeof settings === 'string' ? (JSON.parse(settings || '{}') || {}) : (settings || {});

  const card1Title = s.card1Title || 'Gestion Client & TJM Freelance';
  const card1Badge = s.card1Badge || 'Populaire';
  const card1Desc = s.card1Desc || 'Calculateurs de TJM, modèles de contrats et méthodes de négociation pour doubler vos tarifs.';
  const card1BtnText = s.card1BtnText || 'Explorer les guides →';
  const card1Url = s.card1Url || '/blog/categorie/freelance';

  const card2Title = s.card2Title || 'Templates Notion & Méthode PARA';
  const card2Badge = s.card2Badge || 'Prêt à dupliquer';
  const card2Desc = s.card2Desc || 'Workspaces complets et CRM clients pré-configurés pour votre organisation sans surcharge mentale.';
  const card2BtnText = s.card2BtnText || 'Explorer les templates →';
  const card2Url = s.card2Url || '/boutique/categorie/notion';

  const card3Title = s.card3Title || 'Trésorerie & Dashboards Excel';
  const card3Badge = s.card3Badge || 'Automatisé';
  const card3Desc = s.card3Desc || 'Tableaux de bord financiers pour piloter vos revenus, anticiper vos charges et sécuriser votre trésorerie.';
  const card3BtnText = s.card3BtnText || 'Voir les tableaux →';
  const card3Url = s.card3Url || '/boutique/categorie/excel';

  return (
    <section className="py-20 px-4 bg-slate-900 text-white relative overflow-hidden">
      
      {/* BACKGROUND AMBIENT GLOW */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-[#ccff00]/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* HEADER SECTION */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-sm bg-white/10 text-white border border-white/15 text-xs font-heading font-black uppercase tracking-wider">
            <LayoutGrid className="w-3.5 h-3.5 text-[#ccff00]" />
            <span>LE HUB DU SOLOPRENEUR</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-white tracking-tight leading-tight">
            <FormattedText text={title} />
          </h2>

          {subtitle && (
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              <FormattedText text={subtitle} />
            </p>
          )}
        </div>

        {/* BENTO GRID 3 ASYMMETRIC CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* BENTO CARD #1 (7 COLS) */}
          <div className="md:col-span-7 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/80 rounded-md p-8 flex flex-col justify-between group hover:border-[#ccff00]/50 transition-all duration-300 shadow-2xl relative overflow-hidden">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-md bg-purple-500/20 text-[#ccff00] border border-purple-400/30 flex items-center justify-center font-black text-xl">
                  <Calculator className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 bg-[#ccff00] text-slate-950 rounded-sm text-xs font-heading font-black uppercase">
                  {card1Badge}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-white group-hover:text-[#ccff00] transition-colors">
                {card1Title}
              </h3>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
                {card1Desc}
              </p>
            </div>

            <div className="pt-8">
              <Link href={card1Url} className="inline-flex items-center gap-2 font-heading font-extrabold text-sm text-[#ccff00] hover:underline">
                <span>{card1BtnText}</span>
              </Link>
            </div>
          </div>

          {/* BENTO CARD #2 (5 COLS) */}
          <div className="md:col-span-5 bg-gradient-to-br from-purple-950/80 to-slate-900 border border-purple-800/50 rounded-md p-8 flex flex-col justify-between group hover:border-purple-400 transition-all duration-300 shadow-2xl relative overflow-hidden">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-md bg-purple-500/20 text-purple-300 border border-purple-400/30 flex items-center justify-center font-black text-xl">
                  <Layers className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 bg-purple-500/30 text-purple-200 border border-purple-400/40 rounded-sm text-xs font-heading font-bold uppercase">
                  {card2Badge}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-white group-hover:text-purple-300 transition-colors">
                {card2Title}
              </h3>

              <p className="text-slate-300 text-sm leading-relaxed">
                {card2Desc}
              </p>
            </div>

            <div className="pt-8">
              <Link href={card2Url} className="inline-flex items-center gap-2 font-heading font-extrabold text-sm text-purple-300 hover:underline">
                <span>{card2BtnText}</span>
              </Link>
            </div>
          </div>

          {/* BENTO CARD #3 (12 COLS FULL WIDTH BOTTOM) */}
          <div className="md:col-span-12 bg-gradient-to-r from-slate-800 via-slate-900 to-indigo-950 border border-slate-700/80 rounded-md p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8 group hover:border-indigo-400/50 transition-all duration-300 shadow-2xl">
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center justify-center font-black text-xl">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 rounded-sm text-xs font-heading font-bold uppercase">
                  {card3Badge}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-white group-hover:text-indigo-300 transition-colors">
                {card3Title}
              </h3>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                {card3Desc}
              </p>
            </div>

            <div className="flex-shrink-0">
              <Link href={card3Url}>
                <button className="px-8 py-4 rounded-md bg-[#ccff00] hover:bg-[#b8e600] text-slate-950 font-heading font-black text-sm transition-all hover:scale-102 shadow-xl">
                  {card3BtnText}
                </button>
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
