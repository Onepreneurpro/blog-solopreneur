'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Zap,
  Plus,
  FileText,
  CheckCircle2,
  Settings,
  ExternalLink,
  Trash2,
  Edit3,
  MousePointer,
  Eye,
  Mail,
  Tag as TagIcon,
  Send,
  Layers,
  ArrowLeft,
  X,
  AlertCircle,
  Clock,
  Sparkles,
  Sliders,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FunnelStep {
  id: string;
  name: string;
  slug: string;
  type: string;
  position: number;
  templateId: string | null;
  templateName: string | null;
  content: string | null;
  isActive: boolean;
  viewsCount: number;
  conversionsCount: number;
}

interface AutomationRule {
  id: string;
  stepId: string | null;
  triggerType: string;
  actionType: string;
  targetId: string | null;
  targetName: string | null;
}

interface EmailCampaign {
  id: string;
  name: string;
}

interface Funnel {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  objective: string;
  currency: string;
  status: string;
  steps: FunnelStep[];
  automationRules: AutomationRule[];
}

const CAPTURE_TEMPLATES = [
  {
    id: 'ebook-optin-1',
    name: 'Votre emploi de rêve n est qu à un clic',
    category: 'Capture eBook & Lead',
    previewImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80',
    description: 'Header avec photo créateur, puces d avantages et formulaire d inscription rapide.',
  },
  {
    id: 'dark-theater',
    name: 'Votre aventure théâtrale vous attend',
    category: 'Dark Minimalist',
    previewImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
    description: 'Design sombre haut de gamme avec vidéo de fond et titre impactant.',
  },
  {
    id: 'country-lane',
    name: 'Amusez-vous à la ferme Country Lane !',
    category: 'Full Hero Image',
    previewImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80',
    description: 'Bannière panoramique nature avec formulaire transparent sur overlay.',
  },
  {
    id: 'black-friday-flash',
    name: 'BLACK FRIDAY Flash Deal',
    category: 'Promotion & Offre Limitée',
    previewImage: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=600&q=80',
    description: 'Fond sombre avec accents vert fluo, compte à rebours et appel à l action fort.',
  },
  {
    id: 'webmaven-clean',
    name: 'Webmaven - Plugins puissants',
    category: 'SaaS & Moderne',
    previewImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
    description: 'Mise en page pastel claire avec logos partenaires et témoignages.',
  },
  {
    id: 'machine-envouter',
    name: 'Machine à envouter (DJ & Music)',
    category: 'Créatif & Vibrant',
    previewImage: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80',
    description: 'Design vibrant avec dégradé violet néon et capteur de leads optimisé.',
  },
  {
    id: 'blank-page',
    name: 'Page Vierge (Partir de zéro)',
    category: 'Sur-mesure',
    previewImage: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=600&q=80',
    description: 'Toile blanche vierge pour construire votre propre mise en page.',
  },
];

export default function AdminFunnelDetailPage({ params }: { params: { id: string } }) {
  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'SETTINGS' | 'AUTOMATIONS' | 'AB_TEST' | 'STATS' | 'LEADS'>('SETTINGS');
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  // New Step Modal State
  const [showAddStepModal, setShowAddStepModal] = useState(false);
  const [newStepName, setNewStepName] = useState('');
  const [newStepType, setNewStepType] = useState('OPTIN_PAGE');

  // Automation Modal State (Screens 3, 4, 5)
  const [showTriggerModal, setShowTriggerModal] = useState(false);
  const [selectedTriggerType, setSelectedTriggerType] = useState<'OPTIN' | 'PAGE_VIEW' | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState('');

  const fetchFunnelDetails = async () => {
    setLoading(true);
    try {
      const [funnelRes, campRes] = await Promise.all([
        fetch(`/api/admin/funnels/${params.id}`),
        fetch('/api/admin/campaigns'),
      ]);

      const funnelData = await funnelRes.json();
      const campData = await campRes.json();

      if (funnelData.funnel) {
        setFunnel(funnelData.funnel);
        if (funnelData.funnel.steps.length > 0 && !selectedStepId) {
          setSelectedStepId(funnelData.funnel.steps[0].id);
        }
      }
      if (campData.campaigns) {
        setCampaigns(campData.campaigns);
        if (campData.campaigns.length > 0) {
          setSelectedCampaignId(campData.campaigns[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFunnelDetails();
  }, [params.id]);

  const selectedStep = funnel?.steps.find((s) => s.id === selectedStepId);

  const handleSelectTemplate = async (template: (typeof CAPTURE_TEMPLATES)[0]) => {
    if (!selectedStep) return;

    try {
      const res = await fetch(`/api/admin/funnels/${params.id}/steps`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stepId: selectedStep.id,
          templateId: template.id,
          templateName: template.name,
        }),
      });

      if (res.ok) {
        fetchFunnelDetails();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStepName.trim()) return;

    try {
      const res = await fetch(`/api/admin/funnels/${params.id}/steps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newStepName,
          type: newStepType,
        }),
      });

      if (res.ok) {
        setShowAddStepModal(false);
        setNewStepName('');
        fetchFunnelDetails();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveAutomationRule = async (actionType: string) => {
    if (!selectedStep) return;

    const targetCamp = campaigns.find((c) => c.id === selectedCampaignId);

    try {
      const res = await fetch(`/api/admin/funnels/${params.id}/automations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stepId: selectedStep.id,
          triggerType: selectedTriggerType || 'OPTIN',
          actionType,
          targetId: selectedCampaignId,
          targetName: targetCamp ? targetCamp.name : 'Séquence Email',
        }),
      });

      if (res.ok) {
        setShowActionModal(false);
        setShowTriggerModal(false);
        setSelectedTriggerType(null);
        fetchFunnelDetails();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    try {
      const res = await fetch(`/api/admin/funnels/${params.id}/automations?ruleId=${ruleId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchFunnelDetails();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-500 font-bold">Chargement du tunnel...</div>;
  }

  if (!funnel) {
    return <div className="p-12 text-center text-xs text-rose-600 font-bold">Tunnel introuvable.</div>;
  }

  const stepRules = funnel.automationRules.filter((r) => r.stepId === selectedStepId);

  return (
    <div className="space-y-6">
      
      {/* BREADCRUMB & HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-bold mb-1">
            <Link href="/admin/tunnels" className="hover:text-[#00A0FF] flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Liste des tunnels de vente
            </Link>
            <span>›</span>
            <span className="text-slate-900 font-extrabold">{funnel.name}</span>
            {selectedStep && (
              <>
                <span>›</span>
                <span className="text-[#00A0FF] font-black">{selectedStep.name}</span>
              </>
            )}
          </div>
          <h1 className="text-xl font-heading font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>{funnel.name}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-300 font-black">
              {funnel.objective}
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {selectedStep && (
            <Link
              href={`/funnel/${funnel.slug}/${selectedStep.slug}`}
              target="_blank"
            >
              <Button
                size="sm"
                className="bg-[#00A0FF] hover:bg-[#0082D6] !text-white font-heading font-black text-xs gap-1.5 rounded-xl shadow-md"
              >
                <ExternalLink className="w-4 h-4 !text-white stroke-[2.5]" />
                <span>Voir le tunnel</span>
              </Button>
            </Link>
          )}

          <Button
            variant="outline"
            size="sm"
            className="text-slate-800 border-slate-300 bg-white font-bold text-xs gap-1 rounded-xl"
          >
            <Settings className="w-4 h-4" />
            <span>Paramètres</span>
          </Button>
        </div>
      </div>

      {/* MAIN TWO-COLUMN DASHBOARD GRID (SCREEN 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: FUNNEL STEPS LIST (SCREEN 2 LEFT SIDEBAR) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-2">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-heading font-black text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#00A0FF]" />
              <span>Étapes du Tunnel ({funnel.steps.length})</span>
            </h2>
          </div>

          <div className="p-3 space-y-2">
            {funnel.steps.map((step) => {
              const isSelected = step.id === selectedStepId;
              let icon = FileText;
              if (step.type === 'THANK_YOU_PAGE') icon = CheckCircle2;

              const IconComp = icon;

              return (
                <div
                  key={step.id}
                  onClick={() => setSelectedStepId(step.id)}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-[#00A0FF] bg-blue-50/60 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      isSelected ? 'bg-[#00A0FF] text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-heading font-black text-xs text-slate-900 truncate">
                        {step.name}
                      </div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        ⚠️ {step.templateName || step.type}
                      </div>
                    </div>
                  </div>

                  <span className="text-slate-400">•••</span>
                </div>
              );
            })}

            {/* INACTIVE PAGE STEP */}
            <div className="p-3.5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 flex items-center gap-3 opacity-60">
              <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <div className="font-heading font-bold text-xs text-slate-700">Page inactive</div>
                <div className="text-[10px] text-slate-500">Affichée quand le tunnel est désactivé</div>
              </div>
            </div>

            {/* ADD STEP BUTTON */}
            <Button
              onClick={() => setShowAddStepModal(true)}
              variant="outline"
              size="sm"
              className="w-full text-xs font-heading font-extrabold border-slate-300 text-[#00A0FF] bg-blue-50/30 hover:bg-blue-50 gap-1.5 rounded-xl py-2.5 mt-2"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter une étape</span>
            </Button>
          </div>
        </div>

        {/* RIGHT COLUMN: STEP TABS & TEMPLATE GALLERY / AUTOMATION RULES */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* STEP TABS HEADER */}
          <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-1.5 text-xs font-bold text-slate-600">
            <button
              onClick={() => setActiveTab('SETTINGS')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'SETTINGS'
                  ? 'bg-[#00A0FF] !text-white font-extrabold shadow-sm'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Paramètres</span>
            </button>

            <button
              onClick={() => setActiveTab('AUTOMATIONS')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'AUTOMATIONS'
                  ? 'bg-[#00A0FF] !text-white font-extrabold shadow-sm'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>Règles d automatisation ({stepRules.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('AB_TEST')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'AB_TEST'
                  ? 'bg-[#00A0FF] !text-white font-extrabold shadow-sm'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <span>Test A/B</span>
            </button>

            <button
              onClick={() => setActiveTab('STATS')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'STATS'
                  ? 'bg-[#00A0FF] !text-white font-extrabold shadow-sm'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <span>Statistiques</span>
            </button>

            <button
              onClick={() => setActiveTab('LEADS')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'LEADS'
                  ? 'bg-[#00A0FF] !text-white font-extrabold shadow-sm'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <span>Leads</span>
            </button>
          </div>

          {/* TAB 1: TEMPLATE GALLERY (SCREEN 2) */}
          {activeTab === 'SETTINGS' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              <div>
                <h3 className="font-heading font-black text-lg text-slate-900">
                  Modèles disponibles pour : {selectedStep?.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Choisissez un modèle de page haute conversion ou partez d un modèle vierge.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {CAPTURE_TEMPLATES.map((tmpl) => {
                  const isCurrent = selectedStep?.templateId === tmpl.id;

                  return (
                    <div
                      key={tmpl.id}
                      className={`group rounded-2xl border-2 overflow-hidden transition-all flex flex-col justify-between bg-white ${
                        isCurrent
                          ? 'border-[#00A0FF] ring-2 ring-[#00A0FF]/20 shadow-md'
                          : 'border-slate-200 hover:border-slate-300 shadow-xs'
                      }`}
                    >
                      <div className="relative aspect-video bg-slate-100 overflow-hidden">
                        <img
                          src={tmpl.previewImage}
                          alt={tmpl.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {isCurrent && (
                          <div className="absolute top-2 right-2 px-2.5 py-1 rounded-full bg-[#00A0FF] text-white text-[10px] font-black flex items-center gap-1 shadow-sm">
                            <CheckCircle2 className="w-3 h-3 text-white" />
                            <span>Actif</span>
                          </div>
                        )}
                      </div>

                      <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="text-[10px] font-extrabold text-[#00A0FF] uppercase tracking-wider">
                            {tmpl.category}
                          </div>
                          <div className="font-heading font-extrabold text-xs text-slate-900 line-clamp-1 mt-0.5">
                            {tmpl.name}
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-snug">
                            {tmpl.description}
                          </p>
                        </div>

                        <Button
                          onClick={() => handleSelectTemplate(tmpl)}
                          size="sm"
                          variant={isCurrent ? 'primary' : 'outline'}
                          className={`w-full text-xs font-extrabold mt-3 py-1.5 ${
                            isCurrent
                              ? 'bg-[#00A0FF] !text-white'
                              : 'border-slate-300 text-slate-800 hover:bg-slate-100'
                          }`}
                        >
                          {isCurrent ? 'Modèle Sélectionné' : 'Sélectionner ce modèle'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: AUTOMATION RULES ENGINE (SCREENS 3, 4 & 5) */}
          {activeTab === 'AUTOMATIONS' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-black text-lg text-slate-900">
                    Règles d automatisation pour cette étape
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Déclenchez des actions CRM automatiques (Inscription séquence email, Attribution de tag).
                  </p>
                </div>

                <Button
                  onClick={() => setShowTriggerModal(true)}
                  className="bg-[#00A0FF] hover:bg-[#0082D6] !text-white font-heading font-black text-xs gap-1.5 rounded-xl shadow-md"
                >
                  <Plus className="w-4 h-4 !text-white stroke-[2.5]" />
                  <span>+ Ajouter une règle</span>
                </Button>
              </div>

              {stepRules.length === 0 ? (
                <div className="p-10 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 space-y-3">
                  <Zap className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-500 font-bold">
                    Aucune règle d automatisation configurée pour l étape "{selectedStep?.name}".
                  </p>
                  <Button
                    onClick={() => setShowTriggerModal(true)}
                    size="sm"
                    className="bg-[#00A0FF] !text-white font-bold text-xs"
                  >
                    + Créer une règle d automatisation
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {stepRules.map((rule) => (
                    <div
                      key={rule.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-4 shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                          ⚡
                        </div>
                        <div>
                          <div className="font-heading font-black text-xs text-slate-900 flex items-center gap-2">
                            <span>Déclencheur : {rule.triggerType === 'OPTIN' ? 'Inscription sur la page (opt-in)' : 'Page visitée'}</span>
                          </div>
                          <div className="text-xs text-slate-600 font-medium mt-0.5 flex items-center gap-1.5">
                            <span className="text-[#00A0FF] font-bold">➔ Action : </span>
                            <span>S abonner à la campagne "{rule.targetName || 'Séquence Email'}"</span>
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={() => handleDeleteRule(rule.id)}
                        variant="ghost"
                        size="sm"
                        className="text-rose-600 hover:bg-rose-100 p-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* TAB 3: STATS */}
          {activeTab === 'STATS' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-heading font-black text-base text-slate-900">Statistiques d étape</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="text-xs text-slate-500 font-bold">Vues de la page</div>
                  <div className="text-2xl font-heading font-black text-slate-900 mt-1">{selectedStep?.viewsCount || 0}</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="text-xs text-slate-500 font-bold">Leads & Conversions</div>
                  <div className="text-2xl font-heading font-black text-emerald-600 mt-1">{selectedStep?.conversionsCount || 0}</div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* MODAL 1: AJOUTER UN DÉCLENCHEUR (SCREEN 3) */}
      {showTriggerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-heading font-black text-lg text-slate-900">Ajouter un déclencheur</h3>
              <button onClick={() => setShowTriggerModal(false)} className="p-1 text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-3">
              <button
                onClick={() => {
                  setSelectedTriggerType('OPTIN');
                  setShowTriggerModal(false);
                  setShowActionModal(true);
                }}
                className="w-full text-left p-4 rounded-2xl border-2 border-slate-200 hover:border-[#00A0FF] hover:bg-blue-50/50 transition-all flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#00A0FF] flex items-center justify-center font-bold">
                  <MousePointer className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-heading font-black text-xs text-slate-900 group-hover:text-[#00A0FF]">
                    Inscription sur la page (opt-in)
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Se produit quand un contact vient de s inscrire à un formulaire
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  setSelectedTriggerType('PAGE_VIEW');
                  setShowTriggerModal(false);
                  setShowActionModal(true);
                }}
                className="w-full text-left p-4 rounded-2xl border-2 border-slate-200 hover:border-[#00A0FF] hover:bg-blue-50/50 transition-all flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-heading font-black text-xs text-slate-900 group-hover:text-purple-700">
                    Page visitée
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Se produit quand une personne visite une page spécifique
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: AJOUTER UNE ACTION (SCREEN 5) */}
      {showActionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-heading font-black text-lg text-slate-900">Ajouter une action</h3>
              <button onClick={() => setShowActionModal(false)} className="p-1 text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Sélectionner la Campagne d Emails cible</label>
                <select
                  value={selectedCampaignId}
                  onChange={(e) => setSelectedCampaignId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#00A0FF] outline-none font-medium"
                >
                  {campaigns.map((camp) => (
                    <option key={camp.id} value={camp.id}>
                      📩 {camp.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleSaveAutomationRule('SUBSCRIBE_CAMPAIGN')}
                  className="w-full text-left p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all flex items-center gap-3"
                >
                  <Mail className="w-5 h-5 text-emerald-600" />
                  <div>
                    <div className="font-heading font-black text-xs text-slate-900">S abonner à la campagne</div>
                    <div className="text-[11px] text-slate-500">Inscrire le contact à la campagne d emails automatique</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD STEP MODAL */}
      {showAddStepModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-heading font-black text-lg text-slate-900">Ajouter une étape au tunnel</h3>
              <button onClick={() => setShowAddStepModal(false)} className="p-1 text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStep} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Nom de l étape *</label>
                <input
                  type="text"
                  required
                  value={newStepName}
                  onChange={(e) => setNewStepName(e.target.value)}
                  placeholder="ex: Offre Spéciale Vente"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#00A0FF] outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Type d étape</label>
                <select
                  value={newStepType}
                  onChange={(e) => setNewStepType(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#00A0FF] outline-none"
                >
                  <option value="OPTIN_PAGE">Page de capture (Opt-in)</option>
                  <option value="THANK_YOU_PAGE">Page de remerciement</option>
                  <option value="SALES_PAGE">Page de vente</option>
                  <option value="ORDER_FORM">Bon de commande</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setShowAddStepModal(false)} className="text-xs font-bold">
                  Annuler
                </Button>
                <Button type="submit" className="bg-[#00A0FF] !text-white font-bold text-xs">
                  Ajouter l étape
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
