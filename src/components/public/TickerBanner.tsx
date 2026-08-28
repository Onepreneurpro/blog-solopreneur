'use client';

import React from 'react';
import { Sparkles, Zap, Star } from 'lucide-react';

interface TickerBannerProps {
  settings?: any;
  isDark?: boolean;
}

export function TickerBanner({ settings = {} }: TickerBannerProps) {
  const s = typeof settings === 'string' ? (JSON.parse(settings || '{}') || {}) : (settings || {});

  // Defilant banner settings
  const item1 = s.item1Text || 'ACCÈS IMMÉDIAT AUX TEMPLATES NOTION & EXCEL';
  const item2 = s.item2Text || 'BOOSTE TON TJM ET TES REVENUS FREELANCE';
  const item3 = s.item3Text || 'PLUS DE 5 000 SOLOPRENEURS ACCOMPAGNÉS';

  return (
    <div className="ticker-bar-lime text-slate-950 font-heading font-extrabold text-xs sm:text-sm py-3.5 border-y border-slate-900/10 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-4 sm:gap-8 flex-nowrap overflow-x-auto no-scrollbar scrollbar-none whitespace-nowrap">
        
        <div className="flex items-center gap-2 flex-shrink-0">
          <Star className="w-4 h-4 fill-slate-950 text-slate-950 flex-shrink-0" />
          <span>{item1}</span>
        </div>

        <span className="text-slate-950/40 font-bold text-xs flex-shrink-0">•</span>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Zap className="w-4 h-4 fill-slate-950 text-slate-950 flex-shrink-0" />
          <span>{item2}</span>
        </div>

        <span className="text-slate-950/40 font-bold text-xs flex-shrink-0">•</span>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Sparkles className="w-4 h-4 text-slate-950 flex-shrink-0" />
          <span>{item3}</span>
        </div>

      </div>
    </div>
  );
}
