'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Zap,
  Plus,
  Edit,
  Trash2,
  Globe,
  Eye,
  Layers,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Layout,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TunnelsBeta2Page() {
  const [funnels, setFunnels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFunnels = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/funnels');
      const data = await res.json();
      setFunnels(data.funnels || []);
    } catch (err) {
      console.error('Error fetching funnels:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFunnels();
  }, []);

  return (
    <div className="space-y-6">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-950 text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden border border-blue-800">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#00A0FF]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#00A0FF]/20 border border-[#00A0FF]/40 rounded-full text-xs font-mono font-bold text-[#00A0FF]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Nouveau Créateur de Tunnels (Beta 2 - Craft.js)</span>
          </div>
          <h1 className="text-3xl font-black font-heading tracking-tight">
            Créateur de Tunnels de Vente Beta 2
          </h1>
          <p className="text-sm text-slate-300 font-medium leading-relaxed">
            Créez et éditez vos pages de tunnels de vente avec <strong>Craft.js</strong>. Contrôle total du DOM, glisser-déposer fluide, modification directe des textes et téléversement d images en 1 clic.
          </p>
        </div>
      </div>

      {/* FUNNELS LIST GRID */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <div className="w-8 h-8 border-4 border-[#00A0FF] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold uppercase tracking-wider">Chargement des Tunnels Beta 2...</p>
        </div>
      ) : funnels.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4">
          <Layers className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">Aucun tunnel de vente trouvé</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Créez votre premier tunnel dans la section Tunnels de vente pour utiliser le nouveau builder Craft.js.
          </p>
          <Link href="/admin/tunnels">
            <Button className="bg-[#00A0FF] text-white font-bold text-xs rounded-xl px-5 py-2">
              Créer un Tunnel
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {funnels.map((funnel) => (
            <div
              key={funnel.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-md hover:shadow-xl transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold bg-blue-50 text-[#00A0FF] border border-blue-200 px-2.5 py-1 rounded-full uppercase">
                    {funnel.steps?.length || 0} Étape(s)
                  </span>
                  <span className="text-xs font-bold text-slate-400 font-mono">
                    /{funnel.slug}
                  </span>
                </div>
                <h2 className="text-lg font-black font-heading text-slate-900">
                  {funnel.name}
                </h2>
                {funnel.description && (
                  <p className="text-xs text-slate-500 font-medium line-clamp-2">
                    {funnel.description}
                  </p>
                )}
              </div>

              {/* STEPS LIST */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <span className="text-[10px] font-black uppercase text-slate-400 font-heading tracking-wider">
                  Étapes à éditer dans Craft.js :
                </span>
                {funnel.steps && funnel.steps.length > 0 ? (
                  <div className="space-y-1.5">
                    {funnel.steps.map((step: any) => (
                      <div
                        key={step.id}
                        className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 transition-colors"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="text-xs font-black text-slate-800 truncate">
                            {step.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            Type: {step.type}
                          </p>
                        </div>
                        <Link
                          href={`/admin/tunnels-beta2/${step.id}/builder`}
                          className="px-3 py-1.5 bg-[#00A0FF] hover:bg-[#0080FF] text-white text-[11px] font-black rounded-xl shadow-sm flex items-center gap-1 shrink-0 transition-transform active:scale-95"
                        >
                          <Layout className="w-3.5 h-3.5" />
                          <span>Craft.js</span>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Aucune étape créée.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
