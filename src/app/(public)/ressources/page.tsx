import React from 'react';
import Link from 'next/link';
import { Download, FileText, Sparkles, Gift, ShieldCheck, Zap, Star, ArrowRight, ArrowUpRight } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getActiveTheme, isDarkTheme } from '@/lib/theme';
import SalesSocialProofToast from '@/components/public/SalesSocialProofToast';

export const dynamic = 'force-dynamic';

export default async function FreeResourcesPage() {
  let freeResources: any[] = [];

  try {
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

  return (
    <div className="min-h-screen bg-[#050811] text-white relative overflow-hidden font-sans pb-20">
      
      {/* TOP NEON PROMO TICKER BAR */}
      <div className="bg-[#a3e635] text-slate-950 font-heading font-black text-xs sm:text-sm py-2.5 px-4 shadow-xl text-center flex items-center justify-center gap-3 uppercase tracking-wider relative z-20">
        <Sparkles className="w-4 h-4 shrink-0 animate-pulse" />
        <span>🎁 BIBLIOTHÈQUE OFFERTE : TÉLÉCHARGEMENT INSTANTANÉ SANS CARTE BANCAIRE ⚡</span>
        <Sparkles className="w-4 h-4 shrink-0 animate-pulse hidden sm:inline" />
      </div>

      {/* AMBIENT GLOW LIGHTING ORBS */}
      <div className="absolute top-10 right-1/4 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-[#a3e635]/10 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-10 sm:pt-14">
        
        {/* HERO HEADER */}
        <div className="mb-10 text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-heading font-black bg-[#a3e635]/15 text-[#a3e635] border border-[#a3e635]/30 shadow-lg backdrop-blur-md">
            <Gift className="w-3.5 h-3.5" />
            <span>ACCÈS LIBRE & 100% GRATUIT</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-black tracking-tight leading-tight text-white">
            Ressources & Guides Offerts pour <span className="text-[#a3e635]">Solopreneurs</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 font-medium leading-relaxed max-w-2xl mx-auto">
            Téléchargez nos fiches pratiques, checklists et modèles Notion & Excel sans aucun frais et développez votre activité.
          </p>
        </div>

        {/* HIGH-DENSITY 4-COLUMN RESOURCES GRID */}
        {freeResources.length === 0 ? (
          <div className="text-center py-20 rounded-md bg-[#0e1424] border border-white/10 text-slate-400 shadow-2xl">
            <FileText className="w-12 h-12 mx-auto text-purple-400 mb-3 opacity-60" />
            <p className="text-lg font-heading font-bold text-white">Aucune ressource gratuite disponible pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {freeResources.map((res) => (
              <Card
                key={res.id}
                className="bg-[#0e1424] border border-white/10 hover:border-[#a3e635]/60 transition-all duration-300 rounded-3xl p-3.5 sm:p-4 flex flex-col justify-between group shadow-xl hover:shadow-2xl hover:shadow-[#a3e635]/10"
              >
                <div className="space-y-3">
                  {/* INNER COVER CONTAINER WITH ROUNDED CORNERS, CIRCULAR ACTION ARROW & CATEGORY BADGE */}
                  <Link href={`/checkout?productId=${res.id}`} className="relative block aspect-[16/11] rounded-2xl overflow-hidden bg-slate-950 group">
                    {res.coverImage ? (
                      <img
                        src={res.coverImage}
                        alt={res.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : res.icon ? (
                      <div className="w-full h-full bg-slate-900 flex items-center justify-center p-4">
                        <img src={res.icon} alt={res.name} className="w-16 h-16 object-contain rounded-lg shadow-xl" />
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-900/60 via-purple-950 to-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-3">
                        <FileText className="w-10 h-10 text-[#a3e635]" />
                        <span className="text-xs font-heading font-black text-white uppercase tracking-wider">{res.name}</span>
                      </div>
                    )}

                    {/* CIRCULAR ACTION BUTTON TOP LEFT */}
                    <div className="absolute top-2.5 left-2.5 w-8 h-8 rounded-full bg-[#a3e635] text-slate-950 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-[#b8f542] transition-transform duration-300 z-10">
                      <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                    </div>

                    {/* FLOATING CATEGORY BADGE BOTTOM LEFT */}
                    <span className="absolute bottom-2.5 left-2.5 px-3 py-1 bg-[#a3e635] text-slate-950 text-[10px] font-heading font-black uppercase tracking-wider rounded-full shadow-md z-10">
                      100% OFFERT
                    </span>

                    <div className="absolute top-2.5 right-2.5 z-10">
                      <span className="bg-slate-950/80 backdrop-blur-md text-white text-[9px] font-bold px-2.5 py-1 rounded-full border border-white/20 shadow-lg flex items-center gap-1">
                        <Download className="w-2.5 h-2.5 text-[#a3e635]" />
                        <span>{res.downloadsCount || 120}+</span>
                      </span>
                    </div>
                  </Link>

                  {/* CARD BODY */}
                  <div className="space-y-1.5 px-1">
                    <div className="text-[10px] font-heading font-bold text-slate-400 uppercase tracking-wider">
                      RESSOURCE DIGITAL
                    </div>

                    <Link href={`/checkout?productId=${res.id}`}>
                      <h3 className="font-heading font-black text-base text-white group-hover:text-[#a3e635] transition-colors leading-snug line-clamp-2">
                        {res.name}
                      </h3>
                    </Link>

                    <p className="text-xs text-slate-400 font-medium line-clamp-2 leading-relaxed">
                      {res.shortDescription || 'Guide pratique et modèle dupliquable immédiatement.'}
                    </p>
                  </div>
                </div>

                {/* CARD FOOTER WITH HIGH IMPACT BUTTON */}
                <div className="space-y-3 pt-3 px-1">
                  <div className="flex items-baseline justify-between border-t border-white/10 pt-2.5 text-xs">
                    <span className="text-[#a3e635] font-black uppercase">100% GRATUIT</span>
                    <span className="text-slate-500 line-through font-semibold font-mono">19.00 €</span>
                  </div>

                  <Link href={`/checkout?productId=${res.id}`}>
                    <button
                      type="button"
                      className="w-full py-2.5 bg-[#a3e635] hover:bg-[#b8f542] text-slate-950 font-heading font-black text-xs uppercase tracking-wider rounded-xl shadow-lg hover:scale-[1.01] transition-all flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>OBTENIR ACCÈS GRATUIT</span>
                    </button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* TRUST BADGES FOOTER BAR */}
        <div className="mt-14 pt-8 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-5 text-center">
          <div className="p-4 rounded-md bg-[#0e1424] border border-white/10 space-y-1">
            <ShieldCheck className="w-6 h-6 text-[#a3e635] mx-auto" />
            <h4 className="font-heading font-black text-sm text-white">Sans Carte Bancaire</h4>
            <p className="text-xs text-slate-400">Téléchargement 100% libre et gratuit.</p>
          </div>

          <div className="p-4 rounded-md bg-[#0e1424] border border-white/10 space-y-1">
            <Zap className="w-6 h-6 text-[#a3e635] mx-auto" />
            <h4 className="font-heading font-black text-sm text-white">Téléchargement Immédiat</h4>
            <p className="text-xs text-slate-400">Accès direct au format PDF & Notion.</p>
          </div>

          <div className="p-4 rounded-md bg-[#0e1424] border border-white/10 space-y-1">
            <Sparkles className="w-6 h-6 text-[#a3e635] mx-auto" />
            <h4 className="font-heading font-black text-sm text-white">Mises à jour à Vie</h4>
            <p className="text-xs text-slate-400">Futures versions gratuites incluses.</p>
          </div>
        </div>

      </div>

      {/* REAL-TIME SOCIAL PROOF TOAST */}
      <SalesSocialProofToast />

    </div>
  );
}
