import React from 'react';
import Link from 'next/link';
import { Briefcase, Layers, Landmark, Sparkles, ArrowRight } from 'lucide-react';
import { FormattedText } from '@/components/ui/FormattedText';

interface CategoryGridProps {
  title?: string;
  subtitle?: string | null;
  settings?: any;
}

export function CategoryGrid({
  title = "Explorez par objectif & besoin",
  subtitle = "Retrouvez nos meilleurs articles, templates Notion et outillages Excel classés par objectif.",
  settings = {},
}: CategoryGridProps) {

  const cardSettings = typeof settings === 'string' ? (JSON.parse(settings || '{}') || {}) : (settings || {});

  const cards = [
    {
      title: cardSettings.card1Title || 'Gestion Client & TJM Freelance',
      description: cardSettings.card1Desc || 'Calculateurs de TJM, modèles de contrats et méthodes de négociation.',
      badge: cardSettings.card1Badge || 'Populaire',
      buttonText: cardSettings.card1BtnText || 'Explorer les guides',
      url: cardSettings.card1Url || '/blog/categorie/freelance',
      icon: Briefcase,
    },
    {
      title: cardSettings.card2Title || 'Templates Notion & Méthode PARA',
      description: cardSettings.card2Desc || 'Workspaces complets et CRM clients pré-configurés pour votre organisation.',
      badge: cardSettings.card2Badge || 'Prêt à dupliquer',
      buttonText: cardSettings.card2BtnText || 'Explorer les templates',
      url: cardSettings.card2Url || '/boutique/categorie/notion',
      icon: Layers,
    },
    {
      title: cardSettings.card3Title || 'Trésorerie & Dashboards Excel',
      description: cardSettings.card3Desc || 'Tableaux de bord financiers pour piloter vos revenus et votre rentabilité.',
      badge: cardSettings.card3Badge || 'Automatisé',
      buttonText: cardSettings.card3BtnText || 'Voir les tableaux',
      url: cardSettings.card3Url || '/boutique/categorie/excel',
      icon: Landmark,
    },
  ];

  return (
    <section className="py-20 px-4 bg-slate-50/50">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* CONTAINER */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-12 shadow-sm space-y-10 relative overflow-hidden">
          
          {/* DECORATIVE LIGHT PURPLE GLOW */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-100/60 rounded-full blur-[100px] pointer-events-none" />

          {/* HEADER */}
          <div className="text-center max-w-2xl mx-auto space-y-3 relative z-10">
            <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-xs font-heading font-black uppercase tracking-wider !bg-[#ccff00] !text-slate-950 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-slate-950" />
              Thématiques Principales
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-extrabold !text-slate-950 tracking-tight leading-tight">
              <FormattedText text={title} />
            </h2>
            {subtitle && (
              <p className="!text-slate-600 text-sm sm:text-base leading-relaxed">
                <FormattedText text={subtitle} />
              </p>
            )}
          </div>

          {/* 3 CARDS WITH GUARANTEED HIGH CONTRAST */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {cards.map((item, i) => {
              const IconComp = item.icon;
              return (
                <div
                  key={i}
                  className="group !bg-white border-2 border-slate-200 hover:border-purple-600 rounded-3xl p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl shadow-sm"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl !bg-purple-100 !text-purple-800 flex items-center justify-center group-hover:!bg-purple-700 group-hover:!text-white transition-colors duration-300 shadow-xs">
                        <IconComp className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-heading font-black px-3 py-1 rounded-full !bg-[#ccff00] !text-slate-950 border border-slate-900/10 shadow-xs">
                        {item.badge}
                      </span>
                    </div>

                    <h3 className="text-xl font-heading font-black !text-slate-950 group-hover:!text-purple-700 transition-colors leading-snug">
                      <FormattedText text={item.title} />
                    </h3>

                    <p className="text-xs !text-slate-600 leading-relaxed font-semibold">
                      <FormattedText text={item.description} />
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-100">
                    <Link
                      href={item.url}
                      className="inline-flex items-center gap-1.5 text-xs font-heading font-black !text-purple-700 hover:!text-purple-900 transition-colors"
                    >
                      <span>{item.buttonText}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
