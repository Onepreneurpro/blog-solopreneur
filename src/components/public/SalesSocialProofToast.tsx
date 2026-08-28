'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Sparkles, X, CheckCircle2, ArrowUpRight } from 'lucide-react';

const RECENT_PROOF_DATA = [
  {
    name: 'Alexandre M.',
    location: 'Paris, France',
    product: 'Checklist Clôture d Exercice & URSSAF',
    time: 'il y a 4 min',
    image: '/uploads/1787916424805-il_1588xN.4961319796_ha1x.webp',
    url: '/boutique/checklist-cloture-declaration-micro-entreprise',
  },
  {
    name: 'Sophie L.',
    location: 'Lyon, France',
    product: 'Dashboard Finances & Facturation Excel',
    time: 'il y a 12 min',
    image: '/uploads/1787916424842-il_1588xN.4961319862_kxit.webp',
    url: '/boutique/excel-dashboard-tresorerie-suivi-ca-2026',
  },
  {
    name: 'Thomas B.',
    location: 'Bruxelles, Belgique',
    product: 'Planner Solopreneur All-in-One Notion',
    time: 'il y a 19 min',
    image: '/uploads/1787916424878-il_1588xN.5009583835_bkdb.webp',
    url: '/boutique/notion-freelance-os-second-cerveau-complete',
  },
  {
    name: 'Camille D.',
    location: 'Genève, Suisse',
    product: 'Kit Prospecting & Script Vente Freelance',
    time: 'il y a 28 min',
    image: '/uploads/1787916424914-il_1588xN.5009583857_qpur.webp',
    url: '/boutique/kit-facturation-relance-automatisee',
  },
];

export default function SalesSocialProofToast() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (isDismissed) return;

    // Show initial toast after 3s
    const initialTimer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    // Loop through notifications
    const loopInterval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % RECENT_PROOF_DATA.length);
        setIsVisible(true);
      }, 1000);
    }, 9000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(loopInterval);
    };
  }, [isDismissed]);

  if (isDismissed) return null;

  const currentProof = RECENT_PROOF_DATA[currentIndex];
  const targetUrl = currentProof.url || '/boutique';

  return (
    <div
      className={`fixed bottom-5 left-5 z-40 max-w-xs sm:max-w-sm transition-all duration-500 transform ${
        isVisible
          ? 'translate-y-0 opacity-100 scale-100'
          : 'translate-y-8 opacity-0 scale-95 pointer-events-none'
      }`}
    >
      <Link
        href={targetUrl}
        className="block bg-[#0e1424]/95 hover:bg-[#131b30] backdrop-blur-md border border-[#00A0FF]/40 hover:border-[#00A0FF] text-white rounded-md p-3.5 shadow-2xl shadow-purple-950/50 flex items-start gap-3 relative overflow-hidden group cursor-pointer transition-all hover:scale-[1.02]"
        title={`Voir ${currentProof.product}`}
      >
        {/* NEON LEFT ACCENT BAR */}
        <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-[#00A0FF] to-sky-400"></div>

        {/* THUMBNAIL / ICON */}
        <div className="relative w-12 h-12 rounded-md overflow-hidden bg-slate-900 border border-white/10 shrink-0 mt-0.5">
          {currentProof.image ? (
            <img src={currentProof.image} alt={currentProof.product} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full bg-slate-900 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-[#00A0FF]" />
            </div>
          )}
          <span className="absolute bottom-0 right-0 bg-[#00A0FF] p-0.5 rounded-tl-md">
            <CheckCircle2 className="w-2.5 h-2.5 text-white" />
          </span>
        </div>

        {/* CONTENT */}
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wide">
            <span className="text-[#00A0FF] font-black">{currentProof.name}</span>
            <span>•</span>
            <span className="truncate">{currentProof.location}</span>
          </div>
          
          <h5 className="text-xs font-heading font-black text-white truncate mt-0.5 flex items-center gap-1 group-hover:text-[#00A0FF] transition-colors">
            <span>a obtenu</span>
            <span className="text-[#00A0FF] underline decoration-sky-400/40 group-hover:decoration-sky-400 truncate">{currentProof.product}</span>
          </h5>

          <p className="text-[10px] text-slate-400 font-medium mt-0.5 flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-sky-400" />
            <span>Accès sécurisé ({currentProof.time})</span>
            <ArrowUpRight className="w-3 h-3 text-[#00A0FF] ml-auto opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </p>
        </div>

        {/* CLOSE BUTTON */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDismissed(true);
          }}
          className="text-slate-400 hover:text-white p-1 rounded-full transition-colors shrink-0 -mr-1 -mt-1 hover:bg-slate-800/80"
          title="Fermer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </Link>
    </div>
  );
}
