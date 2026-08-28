'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Layers, Mail, BookOpen, Gift } from 'lucide-react';
import { FormattedText } from '@/components/ui/FormattedText';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  iconName?: string;
}

interface CollectionsPixelProps {
  categories?: CategoryItem[];
  title?: string;
  subtitle?: string | null;
  settings?: any;
}

export function CollectionsPixel({
  title = "Explorez par objectif & besoin",
  subtitle = "Retrouvez nos meilleurs articles, templates Notion et outillages Excel classés par objectif.",
  settings = {},
}: CollectionsPixelProps) {
  const s = typeof settings === 'string' ? (JSON.parse(settings || '{}') || {}) : (settings || {});

  const collections = [
    { name: s.col1Name || 'Sales Funnels', url: s.col1Url || '/boutique', icon: Layers, color: 'bg-emerald-500/20 text-[#a3e635] border-[#a3e635]/40' },
    { name: s.col2Name || 'Email Swipes', url: s.col2Url || '/boutique', icon: Mail, color: 'bg-blue-500/20 text-blue-400 border-blue-400/40' },
    { name: s.col3Name || 'Ebooks & Guides', url: s.col3Url || '/boutique', icon: BookOpen, color: 'bg-amber-500/20 text-amber-400 border-amber-400/40' },
    { name: s.col4Name || 'Lead Magnets', url: s.col4Url || '/boutique', icon: Gift, color: 'bg-purple-500/20 text-purple-400 border-purple-400/40' },
  ];

  return (
    <section className="pt-16 pb-4 bg-[#0b0f19] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-6 space-y-1">
          <h2 className="text-2xl font-heading font-black text-white tracking-tight">
            <FormattedText text={title} />
          </h2>
          {subtitle && (
            <p className="text-xs text-slate-300 font-medium">
              <FormattedText text={subtitle} />
            </p>
          )}
        </div>

        {/* CIRCULAR COLLECTIONS STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {collections.map((col, idx) => {
            const Icon = col.icon;
            return (
              <Link
                key={idx}
                href={col.url}
                className="group p-6 bg-[#0e1424]/90 rounded-3xl border border-white/10 hover:border-[#a3e635]/60 transition-all duration-300 flex flex-col items-center text-center shadow-xl hover:scale-[1.03]"
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 mb-4 shadow-md ${col.color}`}>
                  <Icon className="w-8 h-8" />
                </div>
                
                <div className="flex items-center gap-1.5 text-sm font-heading font-extrabold text-white group-hover:text-[#a3e635] transition-colors">
                  <span>{col.name}</span>
                  <ArrowRight className="w-4 h-4 text-[#a3e635]" />
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}
