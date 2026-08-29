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
  DollarSign,
  TrendingUp,
  X,
  CheckCircle2,
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

export default function AdminTunnelsPage() {
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
          name,
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
        setErrorMsg(data.error || 'Erreur lors de la création du tunnel.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Une erreur est survenue.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFunnel = async (id: string, funnelName: string) => {
    if (!confirm(`Voulez-vous vraiment supprimer le tunnel "${funnelName}" ?`)) return;

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
  const totalConversions = funnels.reduce(
    (acc, f) => acc + f.steps.reduce((sAcc, step) => sAcc + step.conversionsCount, 0),
    0
  );

  return (
    <div className="space-y-6">
      
      {/* TOP HEADER & ACTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-[#00A0FF]" />
            <h1 className="text-2xl font-heading font-black text-slate-900 tracking-tight">
              Tunnels de Vente & Capture
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Créez des tunnels de captation de leads et tunnels de vente haute conversion.
          </p>
        </div>

        <Button
          onClick={() => setShowModal(true)}
          className="bg-[#00A0FF] hover:bg-[#0082D6] !text-white font-heading font-black text-xs gap-2 px-5 py-2.5 shadow-md rounded-xl"
        >
          <Plus className="w-4 h-4 !text-white stroke-[2.5]" />
          <span>Créer un tunnel</span>
        </Button>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase">Tunnels Actifs</div>
            <div className="text-2xl font-heading font-black text-slate-900 mt-1">{funnels.length}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200">
            <Zap className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase">Étapes Total</div>
            <div className="text-2xl font-heading font-black text-slate-900 mt-1">{totalStepsCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
            <Sliders className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase">Leads Capturés</div>
            <div className="text-2xl font-heading font-black text-emerald-600 mt-1">{totalConversions}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* FUNNELS LIST TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-heading font-extrabold text-sm text-slate-900">
            {funnels.length} Tunnel(s) enregistré(s)
          </h2>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Chargement des tunnels...</div>
        ) : funnels.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Zap className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500 font-bold">Aucun tunnel de vente créé pour l instant.</p>
            <Button
              onClick={() => setShowModal(true)}
              size="sm"
              className="bg-[#00A0FF] !text-white font-bold text-xs"
            >
              + Créer mon 1er tunnel de capture
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
                      <Link
                        href={`/admin/tunnels/${funnel.id}`}
                        className="font-heading font-black text-base text-slate-900 hover:text-[#00A0FF] transition-colors"
                      >
                        {funnel.name}
                      </Link>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-heading font-black bg-emerald-100 text-emerald-950 border border-emerald-300">
                        {funnel.status}
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

                    <Link href={`/admin/tunnels/${funnel.id}`}>
                      <Button
                        size="sm"
                        className="bg-slate-900 hover:bg-slate-800 !text-white font-bold text-xs gap-1 rounded-xl"
                      >
                        <span>Configurer</span>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </Link>

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

      {/* CREATE FUNNEL MODAL (SCREEN 1) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* MODAL HEADER */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-heading font-black text-xl text-slate-900">Créer un(e) tunnel</h3>
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
                  <label className="text-xs font-bold text-slate-700">Nom *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ex: eBook Gratuit 10 Habitudes"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#00A0FF] outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Nom de domaine du tunnel *</label>
                  <input
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="solopreneur.pro"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#00A0FF] outline-none"
                  />
                </div>
              </div>

              {/* OBJECTIVE SELECTOR CARDS */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Choisir l objectif du tunnel *</label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* OBJECTIVE 1: AUDIENCE */}
                  <div
                    onClick={() => setObjective('AUDIENCE')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      objective === 'AUDIENCE'
                        ? 'border-[#00A0FF] bg-blue-50/50 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        objective === 'AUDIENCE' ? 'bg-[#00A0FF] text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-heading font-black text-xs text-slate-900">Créer une audience</div>
                        <div className="text-[11px] text-slate-500 leading-snug">
                          Attirez de nouveaux contacts sur votre liste email
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* OBJECTIVE 2: VENDRE */}
                  <div
                    onClick={() => setObjective('SALES')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      objective === 'SALES'
                        ? 'border-[#00A0FF] bg-blue-50/50 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        objective === 'SALES' ? 'bg-[#00A0FF] text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <ShoppingBag className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-heading font-black text-xs text-slate-900">Vendre</div>
                        <div className="text-[11px] text-slate-500 leading-snug">
                          Vendre un produit ou un service
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* OBJECTIVE 3: TUNNEL PERSONNALISÉ */}
                  <div
                    onClick={() => setObjective('CUSTOM')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      objective === 'CUSTOM'
                        ? 'border-[#00A0FF] bg-blue-50/50 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        objective === 'CUSTOM' ? 'bg-[#00A0FF] text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <Sliders className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-heading font-black text-xs text-slate-900">Créer un tunnel personnalisé</div>
                        <div className="text-[11px] text-slate-500 leading-snug">
                          Créer un tunnel de ventes en partant de zéro
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* OBJECTIVE 4: WEBINAIRE */}
                  <div
                    onClick={() => setObjective('WEBINAR')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      objective === 'WEBINAR'
                        ? 'border-[#00A0FF] bg-blue-50/50 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        objective === 'WEBINAR' ? 'bg-[#00A0FF] text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <Video className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-heading font-black text-xs text-slate-900">Créer un webinaire automatique</div>
                        <div className="text-[11px] text-slate-500 leading-snug">
                          Replay d un webinaire
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* CURRENCY SELECTOR */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Devise</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#00A0FF] outline-none"
                >
                  <option value="EUR">Euro (€)</option>
                  <option value="USD">Dollar ($)</option>
                  <option value="CAD">Dollar Canadien (CAD$)</option>
                  <option value="CHF">Franc Suisse (CHF)</option>
                </select>
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
                  className="bg-[#00A0FF] hover:bg-[#0082D6] !text-white font-heading font-black text-xs px-6 py-2.5 rounded-xl shadow-md"
                >
                  {saving ? 'Création...' : 'Sauvegarder'}
                </Button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
