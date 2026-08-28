import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormattedText } from '@/components/ui/FormattedText';

interface FinalYellowCTAProps {
  title?: string;
  subtitle?: string | null;
  settings?: any;
}

export function FinalYellowCTA({
  title = "Prêt à décupler ton efficacité et tes revenus en freelance ?",
  subtitle = "Accède instantanément à tous nos templates Notion, tableaux Excel automatisés et guides pratiques.",
  settings = {},
}: FinalYellowCTAProps) {
  const s = typeof settings === 'string' ? (JSON.parse(settings || '{}') || {}) : (settings || {});
  const badgeText = s.badgeText || 'ACCÈS IMMÉDIAT EN 1 CLIC';
  const btn1Text = s.btnText || s.btn1Text || 'Accéder à la boutique & aux templates ⚡';
  const btn1Url = s.btnUrl || s.btn1Url || '/boutique';
  const btn2Text = s.btn2Text || 'Découvrir les ressources gratuites';
  const btn2Url = s.btn2Url || '/ressources';

  const proof1 = s.proof1 || 'Paiement 100% sécurisé';
  const proof2 = s.proof2 || 'Téléchargement instantané';
  const proof3 = s.proof3 || 'Mises à jour gratuites à vie';

  const btnStyle: React.CSSProperties = {
    fontFamily: s.btnFont ? `'${s.btnFont}', sans-serif` : undefined,
    fontSize: s.btnSize || undefined,
    color: s.btnColor || undefined,
    backgroundColor: s.btnBgColor || undefined,
  };

  return (
    <section className="py-16 px-4 bg-slate-50/50">
      <div className="max-w-7xl mx-auto">
        <div className="!bg-[#ccff00] !text-slate-950 rounded-3xl p-10 sm:p-14 shadow-2xl text-center space-y-6 relative overflow-hidden border border-slate-900/10">
          
          <div className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-xs sm:text-sm font-heading font-black !bg-slate-950 !text-white uppercase tracking-wider shadow-md">
            <Sparkles className="w-4 h-4 text-[#ccff00]" />
            <span>{badgeText}</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-heading font-black !text-slate-950 max-w-3xl mx-auto tracking-tight leading-tight">
            <FormattedText text={title} />
          </h2>

          {subtitle && (
            <p className="!text-slate-950 font-bold text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
              <FormattedText text={subtitle} />
            </p>
          )}

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href={btn1Url}>
              <Button className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl !bg-slate-950 hover:!bg-slate-900 !text-white font-heading font-extrabold shadow-lg border-0 gap-1.5 h-auto" style={btnStyle}>
                <span>{btn1Text}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            {btn2Text && (
              <Link href={btn2Url}>
                <Button variant="outline" className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl !bg-white !text-slate-950 hover:!bg-slate-100 font-heading font-extrabold border-2 border-slate-950 shadow-md h-auto">
                  <span>{btn2Text}</span>
                </Button>
              </Link>
            )}
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs font-heading font-black text-slate-950 uppercase tracking-wider">
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
      </div>
    </section>
  );
}
