import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Zap, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormattedText } from '@/components/ui/FormattedText';

interface FinalCtaModernProps {
  title?: string;
  subtitle?: string | null;
  settings?: any;
}

export function FinalCtaModern({
  title = "Prêt à propulser ton activité de <mark color='#ffffff'>solopreneur au niveau supérieur</mark> ?",
  subtitle = "Rejoins dès aujourd hui les milliers de freelances qui utilisent nos automatisations et templates pour gagner du temps et augmenter leur TJM.",
  settings = {},
}: FinalCtaModernProps) {
  const s = typeof settings === 'string' ? (JSON.parse(settings || '{}') || {}) : (settings || {});
  const badgeText = s.badgeText || 'ACCÈS IMMÉDIAT EN 1 CLIC';
  const btnText = s.btnText || s.btn1Text || 'Accéder à la boutique & aux templates ⚡';
  const btnUrl = s.btnUrl || s.btn1Url || '/boutique';

  const proof1 = s.proof1 || 'Paiement 100% sécurisé';
  const proof2 = s.proof2 || 'Téléchargement instantané';
  const proof3 = s.proof3 || 'Mises à jour gratuites à vie';

  return (
    <section className="py-24 bg-[#ccff00] text-slate-950 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-950 text-[#ccff00] text-xs font-heading font-black uppercase tracking-wider shadow-lg">
          <Sparkles className="w-4 h-4 fill-[#ccff00]" />
          <span>{badgeText}</span>
        </div>

        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-black text-slate-950 tracking-tight leading-[1.12] max-w-4xl mx-auto">
          <FormattedText text={title} />
        </h2>

        {subtitle && (
          <p className="text-slate-900 text-lg sm:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            <FormattedText text={subtitle} />
          </p>
        )}

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href={btnUrl} className="w-full sm:w-auto">
            <Button size="lg" className="w-full bg-slate-950 hover:bg-slate-900 text-[#ccff00] font-heading font-black text-sm sm:text-base rounded-full px-10 py-6 hover:scale-105 transition-all shadow-2xl">
              <span>{btnText}</span>
              <ArrowRight className="w-5 h-5 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs font-heading font-black text-slate-950 uppercase tracking-wider">
          <div className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-slate-950" />
            <span>{proof1}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-slate-950" />
            <span>{proof2}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-slate-950" />
            <span>{proof3}</span>
          </div>
        </div>

      </div>
    </section>
  );
}
