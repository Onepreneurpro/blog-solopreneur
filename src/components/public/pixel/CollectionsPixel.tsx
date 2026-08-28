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

  const titleStyle: React.CSSProperties = {
    fontFamily: s.titleFont ? `'${s.titleFont}', sans-serif` : undefined,
    fontSize: s.titleSize || undefined,
    color: s.titleColor || undefined,
  };

  const subtitleStyle: React.CSSProperties = {
    fontFamily: s.subtitleFont ? `'${s.subtitleFont}', sans-serif` : undefined,
    fontSize: s.subtitleSize || undefined,
    color: s.subtitleColor || undefined,
  };

  const collections = [
    { name: s.col1Name || 'Sales Funnels', url: s.col1Url || '/boutique', icon: Layers, color: 'col-box-cyan bg-[#00A0FF] text-white border-[#00A0FF]' },
    { name: s.col2Name || 'Email Swipes', url: s.col2Url || '/boutique', icon: Mail, color: 'col-box-indigo bg-[#4F46E5] text-white border-[#4F46E5]' },
    { name: s.col3Name || 'Ebooks & Guides', url: s.col3Url || '/boutique', icon: BookOpen, color: 'col-box-amber bg-[#F59E0B] text-white border-[#F59E0B]' },
    { name: s.col4Name || 'Lead Magnets', url: s.col4Url || '/boutique', icon: Gift, color: 'col-box-purple bg-[#9333EA] text-white border-[#9333EA]' },
  ];

  return (
    <section className="pt-16 pb-4 bg-[#0b0f19] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-6 space-y-1">
          <h2 className="text-2xl font-heading font-black text-white tracking-tight" style={titleStyle}>
            <FormattedText text={title} />
          </h2>
          {subtitle && (
            <p className="text-xs text-slate-300 font-medium" style={subtitleStyle}>
              <FormattedText text={subtitle} />
            </p>
          )}
        </div>

        {/* COLLECTIONS GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {collections.map((col, idx) => {
            const Icon = col.icon;
            return (
              <Link
                key={idx}
                href={col.url}
                className="group p-6 bg-[#0e1424]/90 rounded-md border border-white/10 hover:border-[#a3e635]/60 transition-all duration-300 flex flex-col items-center text-center shadow-xl hover:scale-[1.02]"
              >
                <div className={`w-14 h-14 rounded-md flex items-center justify-center border-2 mb-4 shadow-md ${col.color}`}>
                  <Icon className="w-7 h-7" />
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
