import React from 'react';
import { Star } from 'lucide-react';
import { FormattedText } from '@/components/ui/FormattedText';

const REVIEWS = [
  {
    name: 'Alexandre M.',
    role: 'Développeur Fullstack Freelance',
    review: 'Le calculateur de TJM et le contrat type m ont permis d augmenter mes tarifs de +25% sur ma première mission !',
    rating: 5,
    initials: 'AM',
  },
  {
    name: 'Camille L.',
    role: 'Coach & Formatrice Indépendante',
    review: 'Le template Notion PARA est d une clarté incroyable. Tout est structuré pour suivre mes clients et mes finances.',
    rating: 5,
    initials: 'CL',
  },
  {
    name: 'Julien B.',
    role: 'UX/UI Designer Solopreneur',
    review: 'Un gain de temps phénoménal. La qualité des dashboards Excel est vraiment au-dessus de ce qu on trouve ailleurs.',
    rating: 5,
    initials: 'JB',
  },
];

interface TestimonialsProps {
  title?: string;
  subtitle?: string | null;
  settings?: any;
}

export function Testimonials({
  title = "Ce que disent les solopreneurs",
  subtitle = "Rejoignez des milliers de freelances et créateurs qui font confiance à Solopreneur & Co.",
  settings = {},
}: TestimonialsProps) {
  const s = typeof settings === 'string' ? (JSON.parse(settings || '{}') || {}) : (settings || {});
  const badgeText = s.badgeText || '★★★★★ RECOMMANDÉ PAR +500 SOLOPRENEURS';
  const reviewsList = Array.isArray(s.items) && s.items.length > 0 ? s.items : REVIEWS;

  return (
    <section className="py-16 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-heading font-black !bg-[#ccff00] !text-slate-950 border border-slate-900/10 shadow-xs">
            <Star className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
            <span>{badgeText}</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-heading font-black !text-slate-950 tracking-tight">
            <FormattedText text={title} />
          </h2>
          {subtitle && (
            <p className="!text-slate-600 text-sm font-semibold">
              <FormattedText text={subtitle} />
            </p>
          )}
        </div>

        {/* REVIEWS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviewsList.map((r: any, i: number) => (
            <div key={i} className="!bg-white p-7 rounded-3xl border border-slate-200 shadow-md flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(Number(r.rating) || 5)].map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs !text-slate-700 leading-relaxed font-semibold italic">
                  "{r.quote || r.review || ''}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                {r.avatar ? (
                  <img src={r.avatar} alt={r.name} className="w-9 h-9 rounded-2xl object-cover shadow-sm border border-slate-200" />
                ) : (
                  <div className="w-9 h-9 rounded-2xl !bg-purple-700 !text-white font-black flex items-center justify-center text-xs shadow-sm">
                    {r.name ? r.name.charAt(0) : '★'}
                  </div>
                )}
                <div>
                  <div className="text-xs font-heading font-black !text-slate-950">{r.name}</div>
                  <div className="text-[11px] !text-slate-500 font-semibold">{r.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
