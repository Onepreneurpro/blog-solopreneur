'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Zap,
  Plus,
  Users,
  ShoppingBag,
  Sliders,
  Video,
  ChevronRight,
  Trash2,
  ExternalLink,
  Globe,
  TrendingUp,
  X,
  Sparkles,
  Layout,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FunnelStep {
  id: string;
  name: string;
  slug: string;
  type: string;
  viewsCount: number;
  conversionsCount: number;
}

interface Funnel {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  objective: string;
  currency: string;
  status: string;
  createdAt: string;
  steps: FunnelStep[];
}

export default function AdminTunnelsBetaPage() {
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('solopreneur.pro');
  const [objective, setObjective] = useState<'AUDIENCE' | 'SALES' | 'CUSTOM' | 'WEBINAR'>('AUDIENCE');
  const [currency, setCurrency] = useState('EUR');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchFunnels = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/funnels');
      const data = await res.json();
      if (data.funnels) {
        setFunnels(data.funnels);
      }
    } catch (err) {
      console.error('Failed to fetch funnels:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFunnels();
  }, []);

  const handleCreateFunnel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Veuillez saisir le nom du tunnel.');
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/admin/funnels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${name} (Puck Beta)`,
          domain,
          objective,
          currency,
        }),
      });

      const data = await res.json();

      if (res.ok && data.funnel) {
        setShowModal(false);
        setName('');
        fetchFunnels();
      } else {
        setErrorMsg(data.error || 'Erreur lors de la création du tunnel Beta.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Une erreur est survenue.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFunnel = async (id: string, funnelName: string) => {
    if (!confirm(`Voulez-vous vraiment supprimer le tunnel Beta "${funnelName}" ?`)) return;

    try {
      const res = await fetch(`/api/admin/funnels/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchFunnels();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const totalStepsCount = funnels.reduce((acc, f) => acc + f.steps.length, 0);

  return (
    <div className="space-[#00A0FF] space-y-6">
      {/* TOP BANNER BETA */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-blue-500/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#00A0FF]/20 border border-[#00A0FF]/40 rounded-full text-xs font-mono font-bold text-[#00A0FF]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ÉDITEUR BETA - PUCK FRAMEWORK</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-white">
            Créateur de Tunnels Beta (Éditeur Puck)
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
            Testez la nouvelle méthode de construction visuelle basée sur le moteur open-source Puck. Glissez-déposez des blocs composants (Hero, 4 Colonnes Images, Formulaires) en toute fluidité.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <Button
            onClick={() => setShowModal(true)}
            className="bg-[#00A0FF] hover:bg-[#0080FF] !text-white font-heading font-black text-xs gap-2 px-6 py-3 shadow-xl rounded-2xl cursor-pointer"
          >
            <Plus className="w-4 h-4 !text-white stroke-[2.5]" />
            <span>Nouveau Tunnel Beta (Puck)</span>
          </Button>
        </div>

        {/* BACKGROUND GLOW DECORATION */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#00A0FF]/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* FUNNELS LIST TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-heading font-extrabold text-sm text-slate-900 flex items-center gap-2">
            <Layout className="w-4 h-4 text-[#00A0FF]" />
            <span>Vos Tunnels Beta avec Éditeur Puck ({funnels.length})</span>
          </h2>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Chargement des tunnels Beta...</div>
        ) : funnels.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Layout className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500 font-bold">Aucun tunnel de vente créé avec Puck Beta pour l instant.</p>
            <Button
              onClick={() => setShowModal(true)}
              size="sm"
              className="bg-[#00A0FF] !text-white font-bold text-xs"
            >
              + Créer mon 1er tunnel Beta (Puck)
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {funnels.map((funnel) => {
              const firstStep = funnel.steps[0];
              return (
                <div
                  key={funnel.id}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-heading font-black text-base text-slate-900">
                        {funnel.name}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-heading font-black bg-blue-100 text-blue-900 border border-blue-300">
                        PUCK BETA
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
                      <span className="flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5 text-slate-400" />
                        <span>{funnel.domain || 'solopreneur.pro'}</span>
                      </span>
                      <span>•</span>
                      <span>{funnel.steps.length} étape(s)</span>
                      <span>•</span>
                      <span>Créé le {new Date(funnel.createdAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {firstStep && (
                      <Link href={`/admin/tunnels-beta/${firstStep.id}/builder`}>
                        <Button
                          size="sm"
                          className="bg-[#00A0FF] hover:bg-[#0080FF] !text-white font-bold text-xs gap-1.5 rounded-xl shadow-sm"
                        >
                          <Layout className="w-4 h-4" />
                          <span>Ouvrir l Éditeur Puck</span>
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    )}

                    {firstStep && (
                      <Link
                        href={`/funnel/${funnel.slug}/${firstStep.slug}`}
                        target="_blank"
                        className="p-2 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors text-xs flex items-center gap-1 font-bold"
                        title="Voir la page publique en direct"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span className="hidden sm:inline">Aperçu public</span>
                      </Link>
                    )}

                    <Button
                      onClick={() => handleDeleteFunnel(funnel.id, funnel.name)}
                      variant="ghost"
                      size="sm"
                      className="text-rose-600 hover:bg-rose-50 p-2"
                      title="Supprimer le tunnel"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CREATE FUNNEL MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* MODAL HEADER */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-heading font-black text-xl text-slate-900">Nouveau Tunnel Beta (Éditeur Puck)</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-slate-900 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* MODAL FORM */}
            <form onSubmit={handleCreateFunnel} className="p-6 space-y-6">
              {errorMsg && (
                <div className="p-3 bg-rose-50 text-rose-700 text-xs font-bold rounded-xl border border-rose-200">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Nom du tunnel Beta *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ex: Tunnel Vente eBook Puck"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#00A0FF] outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Nom de domaine *</label>
                  <input
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="solopreneur.pro"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#00A0FF] outline-none"
                  />
                </div>
              </div>

              {/* ACTIONS */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  className="text-xs font-bold border-slate-300"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-[#00A0FF] hover:bg-[#0080FF] !text-white font-heading font-black text-xs px-6 py-2.5 rounded-xl shadow-md"
                >
                  {saving ? 'Création...' : 'Créer et Éditer avec Puck'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
