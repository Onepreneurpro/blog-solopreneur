'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  Trash2,
  Layers,
  Sparkles,
  Layout,
  X,
  FilePlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TunnelsBeta2Page() {
  const [funnels, setFunnels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ADD PAGE MODAL STATE
  const [selectedFunnelId, setSelectedFunnelId] = useState<string | null>(null);
  const [newPageName, setNewPageName] = useState('');
  const [newPageType, setNewPageType] = useState('OPTIN_PAGE');
  const [creatingPage, setCreatingPage] = useState(false);
  const [deletingStepId, setDeletingStepId] = useState<string | null>(null);

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

  // DELETE A STEP / PAGE
  const handleDeleteStep = async (stepId: string, stepName: string) => {
    if (!confirm(`Voulez-vous vraiment supprimer la page "${stepName}" ? cette action est irréversible.`)) {
      return;
    }

    setDeletingStepId(stepId);
    try {
      const res = await fetch(`/api/admin/funnel-steps/${stepId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchFunnels();
      }
    } catch (err) {
      console.error('Error deleting step:', err);
    } finally {
      setDeletingStepId(null);
    }
  };

  // CREATE A NEW STEP / PAGE
  const handleCreateStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFunnelId || !newPageName.trim()) return;

    setCreatingPage(true);
    try {
      const res = await fetch('/api/admin/funnel-steps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          funnelId: selectedFunnelId,
          name: newPageName.trim(),
          type: newPageType,
        }),
      });

      if (res.ok) {
        setNewPageName('');
        setSelectedFunnelId(null);
        await fetchFunnels();
      }
    } catch (err) {
      console.error('Error creating page:', err);
    } finally {
      setCreatingPage(false);
    }
  };

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
            Créez, supprimez et ajoutez plusieurs pages à vos tunnels de vente avec <strong>Craft.js</strong>.
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
                    {funnel.steps?.length || 0} Page(s) / Étape(s)
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
              <div className="space-y-2.5 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-slate-400 font-heading tracking-wider">
                    Pages du Tunnel :
                  </span>
                  <button
                    onClick={() => setSelectedFunnelId(funnel.id)}
                    className="flex items-center gap-1 text-xs font-bold text-[#00A0FF] hover:text-[#0080FF] hover:underline transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter une page</span>
                  </button>
                </div>

                {funnel.steps && funnel.steps.length > 0 ? (
                  <div className="space-y-2">
                    {funnel.steps.map((step: any) => (
                      <div
                        key={step.id}
                        className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200 transition-colors"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="text-xs font-black text-slate-800 truncate">
                            {step.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            Type: {step.type}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <Link
                            href={`/admin/tunnels-beta2/${step.id}/builder`}
                            className="px-3 py-1.5 bg-[#00A0FF] hover:bg-[#0080FF] text-white text-[11px] font-black rounded-xl shadow-xs flex items-center gap-1 transition-transform active:scale-95"
                          >
                            <Layout className="w-3.5 h-3.5" />
                            <span>Craft.js</span>
                          </Link>

                          <button
                            onClick={() => handleDeleteStep(step.id, step.name)}
                            disabled={deletingStepId === step.id}
                            title="Supprimer cette page"
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors border border-rose-200"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Aucune page créée dans ce tunnel.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL FOR ADDING A NEW PAGE */}
      {selectedFunnelId && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FilePlus className="w-5 h-5 text-[#00A0FF]" />
                <h3 className="font-heading font-black text-base text-slate-900">
                  Ajouter une nouvelle page
                </h3>
              </div>
              <button
                onClick={() => setSelectedFunnelId(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStep} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700">Nom de la Page *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Page de Vente Offre Spéciale"
                  value={newPageName}
                  onChange={(e) => setNewPageName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-[#00A0FF]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700">Type de Page</label>
                <select
                  value={newPageType}
                  onChange={(e) => setNewPageType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-[#00A0FF]"
                >
                  <option value="OPTIN_PAGE">Page de Capture (Optin)</option>
                  <option value="SALES_PAGE">Page de Vente (Sales Page)</option>
                  <option value="CHECKOUT_PAGE">Bon de Commande (Checkout)</option>
                  <option value="THANK_YOU_PAGE">Page de Remerciement (Thank You)</option>
                  <option value="UPSELL_PAGE">Page d Offre Supérieure (Upsell)</option>
                  <option value="CUSTOM_PAGE">Page Personnalisée</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  onClick={() => setSelectedFunnelId(null)}
                  variant="outline"
                  className="text-xs font-bold rounded-xl"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={creatingPage || !newPageName.trim()}
                  className="bg-[#00A0FF] hover:bg-[#0080FF] text-white text-xs font-black rounded-xl shadow-md"
                >
                  {creatingPage ? 'Création...' : 'Créer la page 🚀'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
