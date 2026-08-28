import React from 'react';
import Link from 'next/link';
import { Sparkles, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormattedText } from '@/components/ui/FormattedText';

interface DarkFeatureSectionProps {
  title?: string;
  subtitle?: string | null;
  settings?: any;
}

export function DarkFeatureSection({
  title = "Tout ce dont vous avez besoin pour structurer et faire décoller votre activité.",
  subtitle = "Ne perdez plus des heures à configurer des outils bancales. Accédez à nos systèmes complets, testés et approuvés par des milliers d indépendants.",
  settings = {},
}: DarkFeatureSectionProps) {
  const btnSettings = typeof settings === 'string' ? (JSON.parse(settings || '{}') || {}) : (settings || {});
  
  const btn1Text = btnSettings.btn1Text || 'Explorer nos outillages prêts à l emploi →';
  const btn1Url = btnSettings.btn1Url || '/boutique';
  const btn1Style = btnSettings.btn1Style || 'yellow';

  const check1 = btnSettings.check1 || 'Workspaces Notion avancés avec CRM & Gestion de projet intégrés';
  const check2 = btnSettings.check2 || 'Dashboards Excel financiers pour piloter la trésorerie et la rentabilité';
  const check3 = btnSettings.check3 || 'Guides d accompagnement et mises à jour gratuites à vie';

  const review1Score = btnSettings.review1Score || '4.9 / 5';
  const review1Quote = btnSettings.review1Quote || 'Le workspace Notion et le dashboard de trésorerie ont totalement changé ma gestion quotidienne. Je gagne plus de 5h par semaine et mes relances clients sont automatisées !';
  const review1Author = btnSettings.review1Author || 'Sophie C.';
  const review1Role = btnSettings.review1Role || 'Consultante Marketing & Freelance';

  const review2Score = btnSettings.review2Score || '5.0 / 5';
  const review2Quote = btnSettings.review2Quote || 'Les modèles de contrat et la méthode de calcul du TJM sont indispensables. J ai pu doubler mes tarifs et signer mes 3 premiers gros clients en 1 mois !';
  const review2Author = btnSettings.review2Author || 'Marc D.';
  const review2Role = btnSettings.review2Role || 'Développeur Web & Solopreneur';

  const getButtonStyle = (style: string) => {
    switch (style) {
      case 'yellow':
        return '!bg-[#ccff00] hover:!bg-[#b8e600] !text-slate-950 shadow-xl shadow-[#ccff00]/25 border-0 font-black';
      case 'purple':
        return '!bg-purple-600 hover:!bg-purple-700 !text-white font-extrabold shadow-lg border-0';
      case 'white':
        return '!bg-white hover:!bg-slate-100 !text-slate-950 font-extrabold border border-slate-300';
      default:
        return '!bg-[#ccff00] hover:!bg-[#b8e600] !text-slate-950 font-black border-0';
    }
  };

  return (
    <section className="py-16 px-4 bg-slate-50/50">
      <div className="max-w-7xl mx-auto">
        <div className="!bg-[#1e1b4b] !text-white rounded-3xl p-8 sm:p-14 shadow-2xl relative overflow-hidden">
          
          {/* DECORATIVE PURPLE GLOW */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/30 rounded-full blur-[140px] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            
            {/* LEFT CONTENT COLUMN */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-heading font-black uppercase tracking-wider !bg-[#ccff00] !text-slate-950 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                <span>POURQUOI REJOINDRE SOLOPRENEUR & CO</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold !text-white tracking-tight leading-tight">
                <FormattedText text={title} />
              </h2>

              {subtitle && (
                <p className="!text-slate-200 text-base leading-relaxed max-w-xl font-medium">
                  <FormattedText text={subtitle} />
                </p>
              )}

              {/* CHECKLIST WITH VIBRANT YELLOW CHECKMARKS */}
              <div className="space-y-4 pt-2">
                {check1 && (
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full !bg-[#ccff00] !text-slate-950 flex items-center justify-center font-black text-xs flex-shrink-0">
                      ✓
                    </div>
                    <span className="text-sm font-heading font-extrabold !text-white">{check1}</span>
                  </div>
                )}
                {check2 && (
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full !bg-[#ccff00] !text-slate-950 flex items-center justify-center font-black text-xs flex-shrink-0">
                      ✓
                    </div>
                    <span className="text-sm font-heading font-extrabold !text-white">{check2}</span>
                  </div>
                )}
                {check3 && (
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full !bg-[#ccff00] !text-slate-950 flex items-center justify-center font-black text-xs flex-shrink-0">
                      ✓
                    </div>
                    <span className="text-sm font-heading font-extrabold !text-white">{check3}</span>
                  </div>
                )}
              </div>

              {btn1Text && (
                <div className="pt-4">
                  <Link href={btn1Url}>
                    <Button size="lg" className={`px-8 py-4 rounded-full font-heading text-sm transition-all ${getButtonStyle(btn1Style)}`}>
                      <span>{btn1Text}</span>
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: 2 STACKED TESTIMONIAL CARDS */}
            <div className="lg:col-span-5 space-y-5 flex flex-col justify-center">
              
              {/* TESTIMONIAL CARD 1 */}
              <div className="!bg-white !text-slate-950 p-6 sm:p-7 rounded-3xl shadow-xl space-y-4 border border-slate-100 transition-all hover:shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs font-heading font-black !bg-slate-950 !text-white px-2.5 py-0.5 rounded-full">
                    {review1Score}
                  </span>
                </div>

                <blockquote className="text-xs sm:text-sm font-semibold !text-slate-800 italic leading-relaxed">
                  "{review1Quote}"
                </blockquote>

                <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                  <div className="w-9 h-9 rounded-2xl !bg-purple-700 !text-white font-extrabold flex items-center justify-center text-xs shadow-md">
                    {review1Author.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div>
                    <div className="text-xs font-heading font-black !text-slate-950">{review1Author}</div>
                    <div className="text-[11px] font-semibold !text-slate-500">{review1Role}</div>
                  </div>
                </div>
              </div>

              {/* TESTIMONIAL CARD 2 */}
              <div className="!bg-white !text-slate-950 p-6 sm:p-7 rounded-3xl shadow-xl space-y-4 border border-slate-100 transition-all hover:shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs font-heading font-black !bg-slate-950 !text-white px-2.5 py-0.5 rounded-full">
                    {review2Score}
                  </span>
                </div>

                <blockquote className="text-xs sm:text-sm font-semibold !text-slate-800 italic leading-relaxed">
                  "{review2Quote}"
                </blockquote>

                <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                  <div className="w-9 h-9 rounded-2xl !bg-purple-700 !text-white font-extrabold flex items-center justify-center text-xs shadow-md">
                    {review2Author.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div>
                    <div className="text-xs font-heading font-black !text-slate-950">{review2Author}</div>
                    <div className="text-[11px] font-semibold !text-slate-500">{review2Role}</div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
