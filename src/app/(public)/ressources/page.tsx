import React from 'react';
import Link from 'next/link';
import { Download, FileText, Sparkles } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getActiveTheme, isDarkTheme } from '@/lib/theme';

export const dynamic = 'force-dynamic';

export default async function FreeResourcesPage() {
  let freeResources: any[] = [];
  let activeTheme = 'modern-bento';

  try {
    activeTheme = await getActiveTheme();
    freeResources = await prisma.product.findMany({
      where: {
        status: 'PUBLISHED',
        isFreeResource: true,
      },
      orderBy: { downloadsCount: 'desc' },
      include: {
        category: true,
      },
    });
  } catch (err) {
    console.error('Failed to load free resources:', err);
  }

  const isDark = isDarkTheme(activeTheme);

  return (
    <div className={`py-12 sm:py-16 min-h-screen relative overflow-hidden ${
      isDark ? 'bg-[#0a0915] text-white' : 'bg-[#faf8f5] text-slate-900'
    }`}>
      
      {/* AMBIENT GLOW ORBS (DARK MODE ONLY) */}
      {isDark && (
        <>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[160px] pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-96 h-96 bg-[#ccff00]/10 rounded-full blur-[160px] pointer-events-none" />
        </>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* HEADER */}
        <div className="max-w-3xl mb-12">
          <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-heading font-black mb-4 shadow-sm ${
            isDark ? 'bg-purple-500/20 text-[#ccff00] border border-purple-400/30' : 'bg-[#ccff00] text-slate-950'
          }`}>
            <Sparkles className="w-3.5 h-3.5" />
            <span>BIBLIOTHÈQUE OFFERTE 100% GRATUITE</span>
          </div>
          <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-heading font-black tracking-tight leading-tight ${
            isDark ? 'text-white' : 'text-slate-950'
          }`}>
            Ressources & Guides gratuits pour votre activité
          </h1>
          <p className={`mt-3 text-base sm:text-lg font-normal leading-relaxed ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Téléchargez nos fiches pratiques, checklists et modèles Excel sans aucun frais.
          </p>
        </div>

        {/* LIST */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {freeResources.length === 0 ? (
            <div className={`col-span-2 text-center py-16 rounded-3xl border shadow-xl ${
              isDark ? 'bg-slate-900/60 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600'
            }`}>
              Aucune ressource gratuite disponible pour le moment.
            </div>
          ) : (
            freeResources.map((res) => (
              <Card key={res.id} className={`p-8 rounded-3xl flex flex-col justify-between shadow-md transition-all ${
                isDark
                  ? 'bg-slate-900/90 border border-slate-800 hover:border-purple-500/60'
                  : 'bg-white border-2 border-slate-200 hover:border-purple-600'
              }`}>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${
                      isDark ? 'bg-purple-500/20 border border-purple-400/30 text-[#ccff00]' : 'bg-purple-100 border border-purple-200 text-purple-700'
                    }`}>
                      <FileText className="w-6 h-6" />
                    </span>
                    <span className="text-xs font-heading font-black px-3.5 py-1 rounded-full bg-[#ccff00] text-slate-950 uppercase tracking-wider shadow-md">
                      100% Gratuit
                    </span>
                  </div>

                  <h2 className={`text-2xl font-heading font-black mb-3 ${isDark ? 'text-white' : 'text-slate-950'}`}>{res.name}</h2>
                  <p className={`text-sm leading-relaxed mb-6 font-normal ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {res.shortDescription}
                  </p>
                </div>

                <div className={`pt-6 border-t flex items-center justify-between ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                  <span className={`text-xs flex items-center gap-1 font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <Download className={`w-4 h-4 ${isDark ? 'text-[#ccff00]' : 'text-purple-600'}`} />
                    {res.downloadsCount} téléchargements
                  </span>

                  <Link href={`/checkout?productId=${res.id}`}>
                    <Button size="md" className={`gap-2 font-heading font-black rounded-xl px-5 py-3 shadow-xl ${
                      isDark ? 'bg-[#ccff00] hover:bg-[#b8e600] text-slate-950' : 'btn-purple'
                    }`}>
                      <span>Obtenir gratuitement</span>
                      <Download className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
