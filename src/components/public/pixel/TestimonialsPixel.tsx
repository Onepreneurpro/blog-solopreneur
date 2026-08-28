'use client';

import React from 'react';
import { Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { FormattedText } from '@/components/ui/FormattedText';

interface TestimonialsPixelProps {
  title?: string;
  subtitle?: string | null;
  settings?: any;
}

export function TestimonialsPixel({
  title = "Ce que disent les solopreneurs",
  subtitle = "Rejoignez des milliers de freelances et créateurs qui font confiance à Solopreneur & Co.",
  settings = {},
}: TestimonialsPixelProps) {
  const s = typeof settings === 'string' ? (JSON.parse(settings || '{}') || {}) : (settings || {});
  const badgeText = s.badgeText || '★★★★★ RECOMMANDÉ PAR +500 SOLOPRENEURS';
  const badgeBgHex = s.badgeBgColor;
  const badgeColorHex = s.badgeColor;

  const badgeStyle: React.CSSProperties = {
    fontFamily: s.badgeFont ? `'${s.badgeFont}', sans-serif` : undefined,
    fontSize: s.badgeSize || undefined,
    color: badgeColorHex || undefined,
    backgroundColor: badgeBgHex ? (badgeBgHex.startsWith('#') ? `${badgeBgHex}25` : badgeBgHex) : undefined,
    borderColor: badgeBgHex || badgeColorHex ? (badgeBgHex || badgeColorHex).startsWith('#') ? `${badgeBgHex || badgeColorHex}60` : (badgeBgHex || badgeColorHex) : undefined,
  };

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

  const defaultTestimonials = [
    {
      name: 'Rene Wells',
      role: 'Business Owner',
      quote: 'Professional work, awesome! From high-converting sales funnels to email sequences, everything was super smooth and increased our revenue immediately.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      rating: 5,
    },
    {
      name: 'Sophie C.',
      role: 'Consultante Marketing',
      quote: 'Les templates et systèmes de vente ont totalement changé ma gestion quotidienne. Je gagne plus de 5h par semaine !',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
      rating: 5,
    },
    {
      name: 'Alexandre Mercier',
      role: 'Consultant IA & Data',
      quote: 'Grâce au Dashboard Excel et aux templates Notion, j ai pu doubler mes revenus en 3 mois. Indispensable !',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
      rating: 5,
    },
    {
      name: 'Marc L.',
      role: 'Solopreneur Digital',
      quote: 'Excellente qualité des livrables. Les fichiers sont prêts à dupliquer et le support est ultra rapide.',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
      rating: 5,
    },
    {
      name: 'Claire D.',
      role: 'Coach Indépendante',
      quote: 'Un vrai game-changer pour structurer mes offres et automatiser mes relances clients.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
      rating: 5,
    },
    {
      name: 'Thomas B.',
      role: 'Freelance Copywriter',
      quote: 'Les séquences email prêtes à l emploi m ont permis de signer 3 nouveaux clients dès la première semaine.',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80',
      rating: 5,
    },
  ];

  const testimonials = Array.isArray(s.items) && s.items.length > 0 ? s.items : defaultTestimonials;

  return (
    <section className="py-16 sm:py-24 bg-[#0b0f19] text-white border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1 text-[#a3e635] text-xs font-heading font-black uppercase tracking-wider" style={badgeStyle}>
            {badgeText}
          </div>
          <h2 className="text-3xl sm:text-4xl font-heading font-black text-white tracking-tight" style={titleStyle}>
            <FormattedText text={title} />
          </h2>
          {subtitle && (
            <p className="text-slate-300 text-sm font-normal" style={subtitleStyle}>
              <FormattedText text={subtitle} />
            </p>
          )}
        </div>

        {/* DYNAMIC TESTIMONIALS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t: any, idx: number) => (
            <Card key={idx} className="p-6 bg-[#0e1424]/90 border border-white/10 rounded-md space-y-4 hover:border-[#a3e635]/40 transition-all shadow-md">
              <div className="flex items-center gap-3">
                {t.avatar ? (
                  <img src={t.avatar} alt={t.name} className="w-11 h-11 rounded-full object-cover border border-white/20 shrink-0" />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-purple-900/80 text-[#a3e635] flex items-center justify-center font-black text-sm border border-purple-700 shrink-0">
                    {t.name ? t.name.charAt(0) : '👤'}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="font-heading font-black text-sm text-white truncate">{t.name || 'Client'}</div>
                  <div className="text-xs text-slate-400 font-medium truncate">{t.role || 'Solopreneur'}</div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(Number(t.rating) || 5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-normal italic">
                "{t.quote || t.review || ''}"
              </p>
            </Card>
          ))}
        </div>

      </div>
    </section>
  );
}
