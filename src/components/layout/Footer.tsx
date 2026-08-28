'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Send, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FooterProps {
  footerMenus?: { [location: string]: { title: string; items: any[] } };
}

export function Footer({ footerMenus: initialFooterMenus = {} }: FooterProps) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [footerMenus, setFooterMenus] = useState<{ [location: string]: { title: string; items: any[] } }>(initialFooterMenus);

  useEffect(() => {
    // Refresh client-side if initial props were empty
    if (Object.keys(initialFooterMenus).length === 0) {
      fetch('/api/admin/menus')
        .then((res) => res.json())
        .then((data) => {
          if (data.menus) {
            const map: { [location: string]: { title: string; items: any[] } } = {};
            data.menus.forEach((m: any) => {
              map[m.location] = { title: m.title, items: m.items || [] };
            });
            setFooterMenus(map);
          }
        })
        .catch(() => {});
    } else {
      setFooterMenus(initialFooterMenus);
    }
  }, [initialFooterMenus]);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  const footer1 = footerMenus['FOOTER_1'] || {
    title: 'Footer 1: Navigation',
    items: [
      { title: 'Accueil', url: '/' },
      { title: 'Blog & Articles', url: '/blog' },
      { title: 'Ressources Gratuites', url: '/ressources' },
      { title: 'Boutique Digitale', url: '/boutique' },
    ],
  };

  const footer2 = footerMenus['FOOTER_2'] || {
    title: 'Footer 2: Catégories',
    items: [
      { title: 'Freelance', url: '/blog/categorie/freelance' },
      { title: 'Productivité', url: '/blog/categorie/productivite' },
      { title: 'Finance & Trésorerie', url: '/blog/categorie/finance' },
      { title: 'Templates Notion', url: '/boutique?category=notion' },
      { title: 'Dashboards Excel', url: '/boutique?category=excel' },
    ],
  };

  const footer3 = footerMenus['FOOTER_3'] || {
    title: 'Footer 3: Informations',
    items: [
      { title: 'À propos', url: '/a-propos' },
      { title: 'Contact', url: '/contact' },
      { title: 'Foire aux questions', url: '/faq' },
      { title: 'Mentions Légales', url: '/mentions-legales' },
      { title: 'CGV', url: '/cgv' },
    ],
  };

  return (
    <footer className="bg-[#050810] text-slate-400 border-t border-slate-800/80 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
          
          {/* COL 1: BRAND & NEWSLETTER */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 font-heading font-extrabold text-xl tracking-tight text-white">
              <span className="w-8 h-8 rounded-md bg-[#00A0FF] flex items-center justify-center text-white font-black text-lg shadow-md">
                O
              </span>
              <span>Onepreneur<span className="text-[#00A0FF]">&Co</span></span>
            </Link>

            <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
              La plateforme d apprentissage, d organisation et d outils clés en main pour freelances, solopreneurs et coachs indépendants.
            </p>
            
            {/* NEWSLETTER FORM */}
            <div className="pt-2">
              <div className="text-xs font-heading font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Recevez nos meilleurs conseils
              </div>
              {subscribed ? (
                <div className="flex items-center gap-2 text-emerald-400 text-xs bg-emerald-950/60 border border-emerald-800/80 p-3 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>Merci ! Vous êtes bien inscrit à notre newsletter.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md">
                  <input
                    type="email"
                    required
                    placeholder="Votre e-mail professionnel"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 flex-grow"
                  />
                  <Button type="submit" variant="primary" size="sm" className="gap-1 flex-shrink-0 font-bold">
                    <span>Rejoindre</span>
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                </form>
              )}
            </div>
          </div>

          {/* COL 2: FOOTER 1 (NAVIGATION) */}
          <div>
            <h3 className="text-xs font-heading font-bold text-white tracking-wider uppercase mb-4">
              {footer1.title.replace(/^Footer \d+:\s*/i, '')}
            </h3>
            <ul className="space-y-2.5 text-sm">
              {footer1.items.map((item: any, i: number) => (
                <li key={item.id || i}>
                  <Link href={item.url} className="hover:text-emerald-400 transition-colors">
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COL 3: FOOTER 2 (CATÉGORIES) */}
          <div>
            <h3 className="text-xs font-heading font-bold text-white tracking-wider uppercase mb-4">
              {footer2.title.replace(/^Footer \d+:\s*/i, '')}
            </h3>
            <ul className="space-y-2.5 text-sm">
              {footer2.items.map((item: any, i: number) => (
                <li key={item.id || i}>
                  <Link href={item.url} className="hover:text-emerald-400 transition-colors">
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COL 4: FOOTER 3 (INFORMATIONS / A PROPOS) */}
          <div>
            <h3 className="text-xs font-heading font-bold text-white tracking-wider uppercase mb-4">
              {footer3.title.replace(/^Footer \d+:\s*/i, '')}
            </h3>
            <ul className="space-y-2.5 text-sm">
              {footer3.items.map((item: any, i: number) => (
                <li key={item.id || i}>
                  <Link href={item.url} className="hover:text-emerald-400 transition-colors">
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* BOTTOM COPYRIGHT */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} Solopreneur & Co. Tous droits réservés.
          </div>

          <div className="flex items-center gap-6">
            <Link href="/mentions-legales" className="hover:text-slate-400 transition-colors">
              Mentions Légales
            </Link>
            <Link href="/cgv" className="hover:text-slate-400 transition-colors">
              CGV
            </Link>
            <Link href="/contact" className="hover:text-slate-400 transition-colors">
              Contact
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
