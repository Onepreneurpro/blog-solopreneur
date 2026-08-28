import React from 'react';
import Link from 'next/link';
import { CheckCircle2, Star, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormattedText } from '@/components/ui/FormattedText';

interface DarkFeatureModernProps {
  title?: string;
  subtitle?: string | null;
  settings?: any;
}

export function DarkFeatureModern({
  title = "Pourquoi plus de <mark color='#ccff00'>5 000 solopreneurs</mark> nous font confiance ?",
  subtitle = "Des outils testés sur le terrain par des freelances et consultants en activité pour vous éviter les erreurs coûteuses.",
  settings = {},
}: DarkFeatureModernProps) {
  const s = typeof settings === 'string' ? (JSON.parse(settings || '{}') || {}) : (settings || {});

  const check1 = s.check1 || 'Des templates 100% prêts à l emploi et duplicables en 1 clic';
  const check2 = s.check2 || 'Aucun abonnement récurrent : vous achetez une fois, c est à vous à vie';
  const check3 = s.check3 || 'Mises à jour régulières et support réactif par notre équipe d experts';

  const review1Score = s.review1Score || 5;
  const review1Quote = s.review1Quote || "Le template Notion m a sauvé 10h par semaine. Mon CRM client est enfin propre et mes relances de devis se font sans stress !";
  const review1Author = s.review1Author || "Sophie Laurent";
  const review1Role = s.review1Role || "Designer Freelance";

  const review2Score = s.review2Score || 5;
  const review2Quote = s.review2Quote || "Grâce au Dashboard Excel, j ai pu calculer exactement mon TJM cible et doubler mes revenus en 3 mois. Indispensable.";
  const review2Author = s.review2Author || "Alexandre Mercier";
  const review2Role = s.review2Role || "Consultant IA & Data";

  const ctaText = s.ctaText || 'Rejoindre la communauté & Découvrir';
  const ctaUrl = s.ctaUrl || '/boutique';

  return (
    <section className="py-24 bg-[#080714] text-white relative overflow-hidden border-t border-purple-900/30">
      
      {/* AMBIENT RADIAL LIGHTS */}
      <div className="absolute top-1/3 left-0 w-96 h-96 bg-purple-600/20 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[450px] h-[450px] bg-[#ccff00]/10 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* LEFT COLUMN: CHECKLIST & HEADLINE */}
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-[#ccff00] border border-white/15 text-xs font-heading font-black">
              <Zap className="w-3.5 h-3.5 fill-[#ccff00]" />
              <span>SÉCURITÉ & PERFORMANCE</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-white tracking-tight leading-tight">
              <FormattedText text={title} />
            </h2>

            {subtitle && (
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
                <FormattedText text={subtitle} />
              </p>
            )}

            {/* CHECKLIST ITEMS */}
            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                <CheckCircle2 className="w-5 h-5 text-[#ccff00] flex-shrink-0 mt-0.5" />
                <span className="text-sm sm:text-base font-semibold text-slate-200">{check1}</span>
              </div>
              <div className="flex items-start gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                <CheckCircle2 className="w-5 h-5 text-[#ccff00] flex-shrink-0 mt-0.5" />
                <span className="text-sm sm:text-base font-semibold text-slate-200">{check2}</span>
              </div>
              <div className="flex items-start gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                <CheckCircle2 className="w-5 h-5 text-[#ccff00] flex-shrink-0 mt-0.5" />
                <span className="text-sm sm:text-base font-semibold text-slate-200">{check3}</span>
              </div>
            </div>

            <div className="pt-4">
              <Link href={ctaUrl}>
                <Button size="lg" className="bg-[#ccff00] hover:bg-[#b8e600] text-slate-950 font-heading font-black text-sm rounded-full px-8 py-6 hover:scale-105 transition-all shadow-2xl">
                  <span>{ctaText}</span>
                  <ArrowRight className="w-5 h-5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>

          {/* RIGHT COLUMN: 2 STACKED TESTIMONIAL CARDS */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* CARD 1 */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl space-y-4 shadow-2xl relative">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(Number(review1Score) || 5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-slate-100 italic leading-relaxed">
                "{review1Quote}"
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-white/10">
                <div className="w-9 h-9 rounded-full bg-[#ccff00] text-slate-950 font-black flex items-center justify-center text-xs">
                  {review1Author[0]}
                </div>
                <div>
                  <div className="text-xs font-heading font-extrabold text-white">{review1Author}</div>
                  <div className="text-[11px] text-slate-400 font-medium">{review1Role}</div>
                </div>
              </div>
            </div>

            {/* CARD 2 */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl space-y-4 shadow-2xl relative">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(Number(review2Score) || 5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-slate-100 italic leading-relaxed">
                "{review2Quote}"
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-white/10">
                <div className="w-9 h-9 rounded-full bg-purple-500 text-white font-black flex items-center justify-center text-xs">
                  {review2Author[0]}
                </div>
                <div>
                  <div className="text-xs font-heading font-extrabold text-white">{review2Author}</div>
                  <div className="text-[11px] text-slate-400 font-medium">{review2Role}</div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
