import React from 'react';
import Link from 'next/link';
import { Download, FileText, Gift, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormattedText } from '@/components/ui/FormattedText';

interface ResourceItem {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string | null;
  coverImage?: string | null;
  downloadsCount: number;
}

interface FreeResourcesSectionProps {
  resources: ResourceItem[];
  title?: string;
  subtitle?: string | null;
  settings?: any;
  isDark?: boolean;
}

export function FreeResourcesSection({
  resources = [],
  title = "Guides, Checklists & Modèles 100% Gratuits",
  subtitle = "Téléchargez nos outils gratuits pour améliorer instantanément vos process.",
  settings = {},
  isDark = true,
}: FreeResourcesSectionProps) {
  if (!resources || resources.length === 0) return null;

  const btnSettings = typeof settings === 'string' ? (JSON.parse(settings || '{}') || {}) : (settings || {});
  const linkText = btnSettings.btn1Text || 'Découvrir toutes les ressources';
  const linkUrl = btnSettings.btn1Url || '/ressources';

  return (
    <section className={`py-16 sm:py-24 border-b ${
      isDark ? 'bg-[#0b0f19] text-white border-white/10' : 'bg-[#faf8f5] text-slate-950 border-slate-200'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-sm text-xs font-heading font-black mb-2 shadow-xs ${
              isDark ? 'bg-[#a3e635]/20 text-[#a3e635] border border-[#a3e635]/30' : 'bg-[#ccff00] text-slate-950'
            }`}>
              <Gift className="w-3.5 h-3.5" />
              <span>Ressources Offertes</span>
            </div>

            <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-heading font-black tracking-tight ${
              isDark ? 'text-white' : 'text-slate-950'
            }`}>
              <FormattedText text={title} />
            </h2>

            {subtitle && (
              <p className={`mt-1 text-sm sm:text-base font-medium ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}>
                <FormattedText text={subtitle} />
              </p>
            )}
          </div>

          <Link href={linkUrl} className={`text-xs sm:text-sm font-heading font-black inline-flex items-center gap-1 transition-colors ${
            isDark ? 'text-[#a3e635] hover:underline' : 'text-purple-700 hover:text-purple-900'
          }`}>
            <span>{linkText}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* RESOURCES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {resources.map((res) => (
            <Card key={res.id} className={`p-7 rounded-md flex flex-col justify-between transition-all shadow-md hover:shadow-xl ${
              isDark
                ? 'bg-slate-900/90 border border-slate-800 hover:border-[#a3e635]/60 text-white'
                : 'bg-white border-2 border-slate-200 hover:border-purple-600 text-slate-950'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`w-10 h-10 rounded-md flex items-center justify-center font-extrabold ${
                    isDark ? 'bg-[#a3e635]/20 border border-[#a3e635]/30 text-[#a3e635]' : 'bg-purple-100 border border-purple-200 text-purple-700'
                  }`}>
                    <FileText className="w-5 h-5" />
                  </span>

                  <span className={`px-3 py-1 rounded-sm text-xs font-heading font-black shadow-xs ${
                    isDark ? 'bg-[#a3e635] text-slate-950' : 'bg-[#ccff00] text-slate-950'
                  }`}>
                    Gratuit
                  </span>
                </div>

                <h3 className={`text-xl font-heading font-black mb-2 ${
                  isDark ? 'text-white' : 'text-slate-950'
                }`}>
                  {res.name}
                </h3>

                <p className={`text-xs leading-relaxed font-normal mb-6 ${
                  isDark ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  {res.shortDescription}
                </p>
              </div>

              <div className={`pt-4 border-t flex items-center justify-between ${
                isDark ? 'border-slate-800' : 'border-slate-100'
              }`}>
                <span className={`text-xs font-bold flex items-center gap-1 ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  <Download className={`w-3.5 h-3.5 ${isDark ? 'text-[#a3e635]' : 'text-purple-600'}`} />
                  {res.downloadsCount} téléchargements
                </span>

                <Link href={`/checkout?productId=${res.id}`}>
                  <Button size="sm" className={`gap-2 font-heading font-black rounded-md px-4 py-2.5 shadow-md ${
                    isDark ? 'bg-[#a3e635] hover:bg-[#86efac] text-slate-950' : 'btn-purple'
                  }`}>
                    <span>Obtenir gratuitement</span>
                    <Download className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>

      </div>
    </section>
  );
}
