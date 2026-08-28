'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag, Sparkles, X, CheckCircle2 } from 'lucide-react';

const RECENT_PROOF_DATA = [
  { name: 'Alexandre M.', location: 'Paris, France', product: 'Checklist Clôture d Exercice & URSSAF', time: 'il y a 4 min', image: '/uploads/1787916424805-il_1588xN.4961319796_ha1x.webp' },
  { name: 'Sophie L.', location: 'Lyon, France', product: 'Dashboard Finances & Facturation Excel', time: 'il y a 12 min', image: '/uploads/1787916424842-il_1588xN.4961319862_kxit.webp' },
  { name: 'Thomas B.', location: 'Bruxelles, Belgique', product: 'Planner Solopreneur All-in-One Notion', time: 'il y a 19 min', image: '/uploads/1787916424878-il_1588xN.5009583835_bkdb.webp' },
  { name: 'Camille D.', location: 'Genève, Suisse', product: 'Kit Prospecting & Script Vente Freelance', time: 'il y a 28 min', image: '/uploads/1787916424914-il_1588xN.5009583857_qpur.webp' },
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

  return (
    <div
      className={`fixed bottom-5 left-5 z-40 max-w-xs sm:max-w-sm transition-all duration-500 transform ${
        isVisible
          ? 'translate-y-0 opacity-100 scale-100'
          : 'translate-y-8 opacity-0 scale-95 pointer-events-none'
      }`}
    >
      <div className="bg-[#0e1424]/95 backdrop-blur-md border border-[#a3e635]/40 text-white rounded-lg p-3.5 shadow-2xl shadow-purple-950/50 flex items-start gap-3 relative overflow-hidden group">
        
        {/* NEON LEFT ACCENT BAR */}
        <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-[#a3e635] to-purple-600"></div>

        {/* THUMBNAIL / ICON */}
        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-900 border border-white/10 shrink-0 mt-0.5">
          {currentProof.image ? (
            <img src={currentProof.image} alt={currentProof.product} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-purple-900/60 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-[#a3e635]" />
            </div>
          )}
          <span className="absolute bottom-0 right-0 bg-[#a3e635] p-0.5 rounded-tl-md">
            <CheckCircle2 className="w-2.5 h-2.5 text-slate-950" />
          </span>
        </div>

        {/* CONTENT */}
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wide">
            <span className="text-[#a3e635] font-black">{currentProof.name}</span>
            <span>•</span>
            <span className="truncate">{currentProof.location}</span>
          </div>
          
          <h5 className="text-xs font-heading font-black text-white truncate mt-0.5">
            a obtenu <span className="text-[#a3e635]">{currentProof.product}</span>
          </h5>

          <p className="text-[10px] text-slate-400 font-medium mt-0.5 flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-purple-400" />
            <span>Accès sécurisé ({currentProof.time})</span>
          </p>
        </div>

        {/* CLOSE BUTTON */}
        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className="text-slate-400 hover:text-white p-1 rounded-full transition-colors shrink-0"
          title="Fermer"
        >
          <X className="w-3.5 h-3.5" />
        </button>

      </div>
    </div>
  );
}
