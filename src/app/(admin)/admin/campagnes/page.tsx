'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Plus, Edit3, Trash2, CheckCircle2, ChevronDown, ChevronRight, Server, Paperclip, Send, Megaphone, FileText, Clock, RefreshCw, AlertTriangle, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

interface LeadList {
  id: string;
  name: string;
  color: string;
}

interface CampaignLeadList {
  campaignId: string;
  listId: string;
  list: LeadList;
}

interface EmailSequenceStep {
  id: string;
  campaignId: string;
  stepOrder: number;
  subject: string;
  content: string;
  triggerType: string;
  delayHours: number;
  delayMinutes?: number;
  status: string;
  sentCount: number;
  openRate: number;
  attachmentUrl?: string | null;
  attachmentName?: string | null;
  parentId?: string | null;
  variants?: EmailSequenceStep[];
  createdAt: string;
}

interface SmtpServer {
  id: string;
  name: string;
  host: string;
  fromEmail: string;
  fromName: string;
  isDefault: boolean;
}

interface CampaignDiagnostics {
  totalQueued: number;
  pendingCount: number;
  sentCount: number;
  failedCount: number;
  isSmtpBlocked: boolean;
  lastSmtpError: string | null;
  lastFailedAt: string | null;
  nextScheduledAt: string | null;
}

interface EmailCampaign {
  id: string;
  name: string;
  description: string | null;
  status: string;
  smtpServerId: string | null;
  smtpServer: SmtpServer | null;
  createdAt: string;
  lists: CampaignLeadList[];
  sequences: EmailSequenceStep[];
  diagnostics?: CampaignDiagnostics;
}

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [leadLists, setLeadLists] = useState<LeadList[]>([]);
  const [smtpServers, setSmtpServers] = useState<SmtpServer[]>([]);
  const [queueItems, setQueueItems] = useState<any[]>([]);
  const [pendingQueueCount, setPendingQueueCount] = useState<number>(0);
  const [processingQueue, setProcessingQueue] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [showQueueTable, setShowQueueTable] = useState<boolean>(false);

  // Expanded Campaign & Step Variant Accordion State
  const [expandedCampaignIds, setExpandedCampaignIds] = useState<string[]>([]);
  const [expandedStepVariantIds, setExpandedStepVariantIds] = useState<string[]>([]);

  // 1. CREATE / EDIT CAMPAIGN CONTAINER MODAL
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<EmailCampaign | null>(null);
  const [campaignName, setCampaignName] = useState('');
  const [campaignDesc, setCampaignDesc] = useState('');
  const [campaignStatus, setCampaignStatus] = useState('ACTIVE');
  const [campaignSmtpServerId, setCampaignSmtpServerId] = useState<string>('');
  const [selectedListIds, setSelectedListIds] = useState<string[]>([]);
  const [savingCampaign, setSavingCampaign] = useState(false);

  // 2. CREATE / EDIT SEQUENCE STEP MODAL
  const [showStepModal, setShowStepModal] = useState(false);
  const [targetCampaign, setTargetCampaign] = useState<EmailCampaign | null>(null);
  const [editingStep, setEditingStep] = useState<EmailSequenceStep | null>(null);
  const [stepParentId, setStepParentId] = useState<string | null>(null);
  const [stepSubject, setStepSubject] = useState('');
  const [stepContent, setStepContent] = useState('');
  const [stepTriggerType, setStepTriggerType] = useState('IMMEDIATE');
  const [stepDelayValue, setStepDelayValue] = useState<number>(0);
  const [stepDelayUnit, setStepDelayUnit] = useState<string>('HOURS');
  const [stepStatus, setStepStatus] = useState('ACTIVE');
  const [stepAttachmentUrl, setStepAttachmentUrl] = useState('');
  const [stepAttachmentName, setStepAttachmentName] = useState('');
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [savingStep, setSavingStep] = useState(false);

  // Sequence Pagination State per Campaign
  const [campaignSequencePages, setCampaignSequencePages] = useState<Record<string, number>>({});
  const SEQUENCE_ITEMS_PER_PAGE = 15;

  const fetchData = async () => {
    setLoading(true);
    try {
      const [campRes, listsRes, smtpRes] = await Promise.all([
        fetch('/api/admin/campaigns'),
        fetch('/api/admin/lead-lists'),
        fetch('/api/admin/smtp'),
      ]);

      const campData = await campRes.json();
      const listsData = await listsRes.json();
      const smtpData = await smtpRes.json();

      if (campData.campaigns) {
        setCampaigns(campData.campaigns);
        setExpandedCampaignIds(campData.campaigns.map((c: EmailCampaign) => c.id));
        
        // Expand step #1 variants by default
        const step1Ids: string[] = [];
        campData.campaigns.forEach((c: EmailCampaign) => {
          c.sequences?.forEach((s) => {
            if (s.stepOrder === 1 || s.triggerType === 'IMMEDIATE') {
              step1Ids.push(s.id);
            }
          });
        });
        setExpandedStepVariantIds(step1Ids);
      }
      if (campData.pendingQueueCount !== undefined) {
        setPendingQueueCount(campData.pendingQueueCount);
      }
      if (campData.queueItems) {
        setQueueItems(campData.queueItems);
      }
      if (listsData.lists) setLeadLists(listsData.lists);
      if (smtpData.servers) setSmtpServers(smtpData.servers);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunProcessor = async () => {
    setProcessingQueue(true);
    try {
      const res = await fetch('/api/cron/sequence-processor');
      const data = await res.json();
      if (res.ok) {
        if (data.sentCount > 0) {
          setMsg(`✅ Processeur de séquence exécuté : ${data.sentCount} email(s) différé(s) envoyé(s) !`);
        } else if (data.processed > 0) {
          setMsg(`⚙️ Processeur de séquence exécuté (${data.processed} traité(s)).`);
        } else {
          setMsg(`ℹ️ Aucun email différé à envoyer pour le moment.`);
        }
        setTimeout(() => setMsg(null), 4000);
        fetchData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingQueue(false);
    }
  };

  const handleRetryQueue = async (queueId?: string, campaignId?: string) => {
    setProcessingQueue(true);
    try {
      const res = await fetch('/api/admin/campaigns/queue/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queueId, campaignId }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.sentCount > 0) {
          setMsg(`✅ Relance réussie : ${data.sentCount} email(s) envoyé(s) !`);
        } else if (data.failedCount > 0) {
          setMsg(`⚠️ La relance a échoué. Vérifiez vos quotas ou serveurs SMTP dans Paramètres.`);
        } else {
          setMsg(`ℹ️ File d attente traitée.`);
        }
        setTimeout(() => setMsg(null), 5000);
        fetchData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingQueue(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Run processor & poll every 15 seconds automatically
    const interval = setInterval(() => {
      fetch('/api/cron/sequence-processor')
        .then((r) => r.json())
        .then((d) => {
          if (d.sentCount > 0) {
            fetchData();
          }
        })
        .catch(() => {});
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const toggleCampaignExpand = (id: string) => {
    setExpandedCampaignIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleStepVariantExpand = (stepId: string) => {
    setExpandedStepVariantIds((prev) =>
      prev.includes(stepId) ? prev.filter((id) => id !== stepId) : [...prev, stepId]
    );
  };

  // OPEN MODALS
  const openNewCampaignModal = () => {
    setEditingCampaign(null);
    setCampaignName('');
    setCampaignDesc('');
    setCampaignStatus('ACTIVE');
    const defaultSmtp = smtpServers.find((s) => s.isDefault);
    setCampaignSmtpServerId(defaultSmtp ? defaultSmtp.id : '');
    setSelectedListIds(leadLists.length > 0 ? [leadLists[0].id] : []);
    setShowCampaignModal(true);
  };

  const handleToggleQueueOpen = async (queueId: string) => {
    try {
      const res = await fetch('/api/admin/campaigns/queue/open', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queueId }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Error toggling queue open status:', err);
    }
  };

  const openEditCampaignModal = (camp: EmailCampaign) => {
    setEditingCampaign(camp);
    setCampaignName(camp.name);
    setCampaignDesc(camp.description || '');
    setCampaignStatus(camp.status || 'ACTIVE');
    setCampaignSmtpServerId(camp.smtpServerId || '');
    setSelectedListIds(camp.lists ? camp.lists.map((l) => l.listId) : []);
    setShowCampaignModal(true);
  };

  const openAddStepModal = (camp: EmailCampaign, parentStep?: EmailSequenceStep) => {
    setTargetCampaign(camp);
    setEditingStep(null);
    setStepParentId(parentStep ? parentStep.id : null);
    setStepSubject('');
    setStepContent('');
    setStepTriggerType(parentStep ? parentStep.triggerType : 'IMMEDIATE');
    setStepDelayValue(0);
    setStepDelayUnit('HOURS');
    setStepStatus('ACTIVE');
    setStepAttachmentUrl('');
    setStepAttachmentName('');
    setShowStepModal(true);
  };

  const openEditStepModal = (camp: EmailCampaign, step: EmailSequenceStep) => {
    setTargetCampaign(camp);
    setEditingStep(step);
    setStepParentId(step.parentId || null);
    setStepSubject(step.subject);
    setStepContent(step.content);
    setStepTriggerType(step.triggerType || 'IMMEDIATE');

    const delMins = step.delayMinutes || 0;
    const delHours = step.delayHours || 0;

    if (delMins > 0 && delMins % 60 !== 0) {
      setStepDelayValue(delMins);
      setStepDelayUnit('MINUTES');
    } else if (delHours >= 24 && delHours % 24 === 0) {
      setStepDelayValue(delHours / 24);
      setStepDelayUnit('DAYS');
    } else if (delHours > 0) {
      setStepDelayValue(delHours);
      setStepDelayUnit('HOURS');
    } else if (delMins > 0) {
      setStepDelayValue(delMins);
      setStepDelayUnit('MINUTES');
    } else {
      setStepDelayValue(0);
      setStepDelayUnit('HOURS');
    }

    setStepStatus(step.status || 'ACTIVE');
    setStepAttachmentUrl(step.attachmentUrl || '');
    setStepAttachmentName(step.attachmentName || '');
    setShowStepModal(true);
  };

  const handleStepAttachmentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAttachment(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name);

      const res = await fetch('/api/admin/medias', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.media) {
        setStepAttachmentUrl(data.media.url);
        setStepAttachmentName(file.name);
      } else {
        alert(data.error || 'Erreur lors du téléversement du fichier.');
      }
    } catch (err) {
      console.error(err);
      alert('Échec du téléversement du fichier.');
    } finally {
      setUploadingAttachment(false);
    }
  };

  const handleSaveStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCampaign) {
      alert('Erreur: aucune campagne sélectionnée.');
      return;
    }
    if (!stepSubject.trim()) {
      alert('Le sujet de l email est obligatoire.');
      return;
    }
    if (!stepContent.trim()) {
      alert('Le contenu de l email est obligatoire.');
      return;
    }

    setSavingStep(true);

    let calculatedMinutes = 0;
    let calculatedHours = 0;

    if (stepTriggerType === 'DELAYED') {
      const val = Number(stepDelayValue) || 0;
      if (stepDelayUnit === 'MINUTES') {
        calculatedMinutes = val;
        calculatedHours = Math.floor(val / 60);
      } else if (stepDelayUnit === 'DAYS') {
        calculatedHours = val * 24;
        calculatedMinutes = val * 1440;
      } else {
        calculatedHours = val;
        calculatedMinutes = val * 60;
      }
    }

    try {
      const endpoint = editingStep
        ? `/api/admin/campaigns/${targetCampaign.id}/sequences/${editingStep.id}`
        : `/api/admin/campaigns/${targetCampaign.id}/sequences`;
      const method = editingStep ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: stepSubject.trim(),
          content: stepContent.trim(),
          triggerType: stepTriggerType,
          delayHours: calculatedHours,
          delayMinutes: calculatedMinutes,
          status: stepStatus,
          attachmentUrl: stepAttachmentUrl || null,
          attachmentName: stepAttachmentName || null,
          parentId: stepParentId || null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setShowStepModal(false);
        await fetchData();
        setMsg(editingStep ? 'Étape de séquence modifiée avec succès !' : `Email ajouté à la séquence de la campagne "${targetCampaign.name}" !`);
        setTimeout(() => setMsg(null), 4000);
      } else {
        alert(data.error || 'Erreur lors de l enregistrement de l email de séquence.');
      }
    } catch (err: any) {
      console.error('Error saving sequence step:', err);
      alert('Erreur serveur : ' + (err?.message || 'Impossible d enregistrer les modifications.'));
    } finally {
      setSavingStep(false);
    }
  };

  const handleDeleteStep = async (campId: string, sequenceId: string) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cet email de la séquence ?')) return;
    try {
      const res = await fetch(`/api/admin/campaigns/${campId}/sequences/${sequenceId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
        setMsg('Étape de séquence supprimée.');
        setTimeout(() => setMsg(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignName.trim()) {
      alert('Le nom de la campagne est obligatoire.');
      return;
    }
    setSavingCampaign(true);

    try {
      const endpoint = editingCampaign
        ? `/api/admin/campaigns/${editingCampaign.id}`
        : '/api/admin/campaigns';
      const method = editingCampaign ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: campaignName.trim(),
          description: campaignDesc.trim() || null,
          status: campaignStatus,
          smtpServerId: campaignSmtpServerId || null,
          listIds: selectedListIds,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setShowCampaignModal(false);
        fetchData();
        setMsg(editingCampaign ? 'Campagne mise à jour !' : 'Nouvelle campagne créée avec succès !');
        setTimeout(() => setMsg(null), 3000);
      } else {
        alert(data.error || 'Erreur lors de l enregistrement.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingCampaign(false);
    }
  };

  const handleDeleteCampaign = async (id: string, name: string) => {
    if (!window.confirm(`Voulez-vous vraiment supprimer la campagne "${name}" et toutes ses séquences d emails ?`)) return;
    try {
      const res = await fetch(`/api/admin/campaigns/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
        setMsg('Campagne supprimée.');
        setTimeout(() => setMsg(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePauseCampaign = async (camp: EmailCampaign) => {
    const newStatus = camp.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    try {
      const res = await fetch(`/api/admin/campaigns/${camp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: camp.name,
          status: newStatus,
        }),
      });

      if (res.ok) {
        setCampaigns((prev) =>
          prev.map((c) => (c.id === camp.id ? { ...c, status: newStatus } : c))
        );
        setMsg(
          newStatus === 'PAUSED'
            ? `Campagne "${camp.name}" mise en pause.`
            : `Campagne "${camp.name}" réactivée avec succès !`
        );
        setTimeout(() => setMsg(null), 3000);
      } else {
        const data = await res.json();
        alert(data.error || 'Erreur lors du changement de statut de la campagne.');
      }
    } catch (err) {
      console.error('Failed to toggle campaign status:', err);
    }
  };

  const getTimingBadge = (triggerType: string, delayHours: number = 0, delayMinutes?: number) => {
    if (triggerType === 'IMMEDIATE' || (delayHours === 0 && (!delayMinutes || delayMinutes === 0))) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-950 font-heading font-black text-[11px] border border-emerald-300">
          ⚡ À l inscription (Immédiat)
        </span>
      );
    }

    let label = '';
    const totalMins = (delayMinutes && delayMinutes > 0) ? delayMinutes : (delayHours * 60);

    if (totalMins < 60) {
      label = `${totalMins} min`;
    } else {
      const days = Math.floor(totalMins / 1440);
      const hours = Math.floor((totalMins % 1440) / 60);
      const mins = totalMins % 60;

      if (days > 0 && hours > 0) label = `J+${days} (${hours}h)`;
      else if (days > 0) label = `Jour ${days}`;
      else if (mins > 0) label = `${hours}h ${mins}m`;
      else label = `Après ${hours}h`;
    }

    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-950 font-heading font-black text-[11px] border border-amber-300">
        ⌛ Séquence {label}
      </span>
    );
  };

  const failedItems = queueItems.filter((i) => i.status === 'FAILED');

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-heading font-black bg-purple-100 text-purple-900 border border-purple-200 mb-2">
            <Megaphone className="w-3.5 h-3.5 text-purple-700" />
            <span>Moteur d Email Automation & Séquences</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-slate-950 tracking-tight">
            Campagnes d Emails & Séquences
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
            Créez une Campagne (avec le serveur SMTP expéditeur et les listes cibles), puis ajoutez-y vos séquences d emails et sous-emails de bienvenue.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleRunProcessor}
            disabled={processingQueue}
            variant="outline"
            className="font-heading font-black text-xs gap-1.5 border-purple-300 text-purple-900 hover:bg-purple-50"
            title="Traiter immédiatement les emails différés programmés"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-purple-700 ${processingQueue ? 'animate-spin' : ''}`} />
            <span>Exécuter les Séquences</span>
          </Button>

          <Button
            onClick={openNewCampaignModal}
            size="lg"
            className="btn-purple font-heading font-black text-xs sm:text-sm gap-2 shadow-lg shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Créer une campagne</span>
          </Button>
        </div>
      </div>

      {msg && (
        <div className="p-4 bg-purple-900 text-white border border-purple-700 rounded-2xl text-xs font-heading font-black flex items-center justify-between shadow-md animate-in fade-in">
          <span>{msg}</span>
          <button onClick={() => setMsg(null)} className="text-purple-300 font-bold">✕</button>
        </div>
      )}

      {/* FAILED EMAIL NOTIFICATION ALERT */}
      {failedItems.length > 0 && (
        <div className="p-5 bg-rose-500/10 border-2 border-rose-500/40 rounded-3xl text-rose-950 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-heading font-black text-sm text-rose-900">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>⚠️ {failedItems.length} email(s) de séquence n ont pas pu être délivrés suite à un problème SMTP !</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => handleRetryQueue()}
                disabled={processingQueue}
                size="sm"
                className="bg-rose-600 text-white hover:bg-rose-700 font-heading font-black text-xs px-3"
              >
                🔄 Tout Relancer
              </Button>
              <Link href="/admin/parametres">
                <Button size="sm" variant="outline" className="text-xs font-bold border-rose-300 text-rose-900 bg-white">
                  ⚙️ Serveur SMTP
                </Button>
              </Link>
            </div>
          </div>
          <p className="text-xs text-rose-800 font-medium">
            Raison fréquente : Le serveur SMTP de démo a atteint sa limite de quota d envoi (550 limit). Modifiez vos identifiants SMTP dans Paramètres puis cliquez sur Tout Relancer.
          </p>
        </div>
      )}

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-5 bg-white border-slate-200 rounded-3xl shadow-sm space-y-1">
          <div className="text-[10px] font-heading font-black text-slate-400 uppercase tracking-wider">Total Campagnes</div>
          <div className="text-2xl font-heading font-black text-slate-900">{campaigns.length}</div>
        </Card>

        <Card className="p-5 bg-white border-slate-200 rounded-3xl shadow-sm space-y-1">
          <div className="text-[10px] font-heading font-black text-slate-400 uppercase tracking-wider">Campagnes Actives</div>
          <div className="text-2xl font-heading font-black text-emerald-600">
            {campaigns.filter((c) => c.status === 'ACTIVE').length}
          </div>
        </Card>

        <Card className="p-5 bg-white border-slate-200 rounded-3xl shadow-sm space-y-1">
          <div className="text-[10px] font-heading font-black text-slate-400 uppercase tracking-wider">Total Messages Séquences</div>
          <div className="text-2xl font-heading font-black text-purple-700">
            {campaigns.reduce((acc, c) => acc + (c.sequences ? c.sequences.length : 0), 0)}
          </div>
        </Card>

        <Card className="p-5 bg-white border-slate-200 rounded-3xl shadow-sm space-y-1">
          <div className="text-[10px] font-heading font-black text-slate-400 uppercase tracking-wider">File d Attente & Diagnostic</div>
          <div className="flex items-center justify-between pt-0.5">
            <div className="text-2xl font-heading font-black text-amber-600">{pendingQueueCount}</div>
            <button
              onClick={() => setShowQueueTable(!showQueueTable)}
              className="text-[10px] font-heading font-black px-2.5 py-1 rounded-xl bg-purple-100 text-purple-900 hover:bg-purple-200 border border-purple-300 transition-colors"
            >
              {showQueueTable ? 'Masquer File' : '📜 Voir File'}
            </button>
          </div>
        </Card>
      </div>

      {/* CAMPAIGN HEALTH & SMTP DIAGNOSTICS TABLE */}
      {showQueueTable && (
        <Card className="p-6 bg-slate-950 text-white border border-slate-800 rounded-3xl space-y-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-3">
            <div>
              <h3 className="text-sm font-heading font-black text-[#a3e635] flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Rapport de Santé & Diagnostic SMTP des Campagnes</span>
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Vue synthétique par campagne pour piloter vos envois volumineux et détecter immédiatement un blocage SMTP.
              </p>
            </div>
            <Button
              onClick={() => handleRetryQueue()}
              disabled={processingQueue}
              size="sm"
              className="bg-[#a3e635] text-slate-950 hover:bg-[#b8f542] font-heading font-black text-xs shrink-0"
            >
              🔄 Débloquer & Relancer Tout
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase font-heading font-black">
                  <th className="p-3">Campagne</th>
                  <th className="p-3">Serveur SMTP</th>
                  <th className="p-3">Diagnostic Santé</th>
                  <th className="p-3 text-center">Délivrés</th>
                  <th className="p-3 text-center">En Attente</th>
                  <th className="p-3 text-center">Échecs SMTP</th>
                  <th className="p-3 text-right">Action Diagnostic</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {campaigns.map((c) => {
                  const diag = c.diagnostics;
                  const isBlocked = diag?.isSmtpBlocked;
                  const isPaused = c.status === 'PAUSED';

                  return (
                    <tr key={c.id} className="hover:bg-slate-900/60 transition-colors">
                      <td className="p-3 font-heading font-black text-white text-sm">
                        {c.name}
                      </td>
                      <td className="p-3 font-mono text-[11px] text-amber-300">
                        {c.smtpServer ? `${c.smtpServer.name} (${c.smtpServer.fromEmail})` : '⚙️ SMTP par défaut'}
                      </td>
                      <td className="p-3">
                        {isBlocked ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[11px] font-black" title={diag?.lastSmtpError || ''}>
                            ⚠️ Bloquée (Erreur SMTP)
                          </span>
                        ) : isPaused ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[11px] font-black">
                            ⏸️ En Pause
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-black">
                            🟢 Séquence Opérationnelle
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-emerald-400">
                        {diag?.sentCount ?? 0}
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-amber-400">
                        {diag?.pendingCount ?? 0}
                      </td>
                      <td className="p-3 text-center font-mono font-bold">
                        {diag?.failedCount && diag.failedCount > 0 ? (
                          <span className="text-rose-400 font-extrabold px-2 py-0.5 bg-rose-950/60 rounded-md border border-rose-800">
                            {diag.failedCount}
                          </span>
                        ) : (
                          <span className="text-slate-500">0</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        {isBlocked ? (
                          <button
                            onClick={() => handleRetryQueue(undefined, c.id)}
                            disabled={processingQueue}
                            className="px-3 py-1 rounded-xl bg-rose-600 text-white font-heading font-black text-xs hover:bg-rose-500 shadow-md transition-colors"
                          >
                            🔄 Débloquer cette campagne
                          </button>
                        ) : (
                          <span className="text-slate-500 text-[11px] italic">Aucune anomalie</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* LIST OF CAMPAIGNS & THEIR SEQUENCES */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 font-medium bg-white rounded-3xl border border-slate-200">
          Chargement des campagnes d emails...
        </div>
      ) : campaigns.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300 space-y-4">
          <div className="w-16 h-16 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center mx-auto text-2xl">
            📧
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-heading font-black text-slate-900">Aucune campagne d emails créée</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Créez votre première campagne pour configurer vos emails de bienvenue et vos séquences de relance.
            </p>
          </div>
          <Button onClick={openNewCampaignModal} className="btn-purple text-xs font-black">
            + Créer ma première campagne
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {campaigns.map((camp) => {
            const isExpanded = expandedCampaignIds.includes(camp.id);
            const stepCount = camp.sequences ? camp.sequences.length : 0;

            return (
              <Card key={camp.id} className="bg-white border-2 border-slate-900 rounded-3xl shadow-md overflow-hidden">
                
                {/* CAMPAIGN HEADER BAR */}
                <div className="p-5 sm:p-6 bg-slate-950 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800">
                  
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        onClick={() => toggleCampaignExpand(camp.id)}
                        className="p-1.5 rounded-lg bg-slate-900 text-slate-300 hover:text-[#a3e635] hover:bg-slate-800 transition-colors"
                        title={isExpanded ? 'Masquer la séquence' : 'Afficher la séquence'}
                      >
                        <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-[#a3e635]' : ''}`} />
                      </button>

                      <h2 className="text-lg sm:text-xl font-heading font-black text-white tracking-tight">
                        {camp.name}
                      </h2>

                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-heading font-black border ${
                        camp.status === 'ACTIVE'
                          ? 'bg-[#a3e635] text-slate-950 border-[#86efac]'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {camp.status === 'ACTIVE' ? 'Active' : 'En pause'}
                      </span>

                      <span className="inline-flex items-center px-3 py-0.5 rounded-full bg-slate-900 text-slate-200 border border-slate-700 font-extrabold text-xs">
                        {stepCount} email(s) dans la séquence
                      </span>
                    </div>

                    {/* SMTP SERVER BADGE */}
                    <div className="flex items-center gap-2 pl-9 text-xs">
                      <span className="font-bold text-slate-400">Serveur SMTP :</span>
                      {camp.smtpServer ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-slate-900 text-amber-300 border border-slate-700 font-mono font-black text-[11px]">
                          <Server className="w-3 h-3 text-amber-400" />
                          <span>{camp.smtpServer.name} ({camp.smtpServer.fromEmail})</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-slate-900 text-slate-300 font-mono text-[11px] border border-slate-800">
                          ⚙️ Serveur SMTP par défaut
                        </span>
                      )}
                    </div>

                    {camp.description && (
                      <p className="text-xs text-slate-300 font-medium pl-9">
                        {camp.description}
                      </p>
                    )}

                    {/* LINKED LEAD LISTS BADGES */}
                    <div className="flex flex-wrap items-center gap-2 pl-9 pt-0.5">
                      <span className="text-[11px] font-bold text-slate-400">Listes Cibles :</span>
                      {camp.lists && camp.lists.length > 0 ? (
                        camp.lists.map((item) => (
                          <span
                            key={item.listId}
                            className="px-2.5 py-0.5 rounded-full text-[11px] font-heading font-black border shadow-2xs flex items-center gap-1.5 bg-slate-900 text-white"
                            style={{
                              borderColor: item.list?.color || '#a3e635',
                            }}
                          >
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.list?.color || '#a3e635' }} />
                            <span>{item.list?.name || 'Liste'}</span>
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-amber-400 font-bold italic">⚠️ Aucune liste liée</span>
                      )}
                    </div>

                  </div>

                  {/* CAMPAIGN SMTP BLOCKED WARNING BANNER */}
                {camp.diagnostics?.isSmtpBlocked && (
                  <div className="p-4 bg-rose-950/90 border-b border-rose-600/50 text-white flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 font-bold text-rose-200">
                      <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                      <div>
                        <span className="font-heading font-black text-rose-300">⚠️ Campagne Bloquée (Erreur SMTP) : </span>
                        <span>{camp.diagnostics.failedCount} email(s) n ont pas pu être envoyés suite à un échec du serveur SMTP. ({camp.diagnostics.lastSmtpError || 'Quota dépassé 550'})</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        type="button"
                        onClick={() => handleRetryQueue(undefined, camp.id)}
                        disabled={processingQueue}
                        size="sm"
                        className="bg-rose-600 text-white hover:bg-rose-700 font-heading font-black text-xs px-3 shadow-md"
                      >
                        🔄 Débloquer cette campagne
                      </Button>
                      <Link href="/admin/parametres">
                        <Button size="sm" variant="outline" className="text-xs font-bold border-rose-400 text-rose-100 bg-slate-900 hover:bg-slate-800">
                          ⚙️ Paramètres SMTP
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                    <Button
                      onClick={() => openAddStepModal(camp)}
                      size="sm"
                      className="bg-[#a3e635] text-slate-950 hover:bg-[#b8f542] font-heading font-black text-xs gap-1.5 shadow-md border-0"
                    >
                      <Plus className="w-4 h-4 text-slate-950" />
                      <span>+ Ajouter un email</span>
                    </Button>

                    {camp.status === 'ACTIVE' ? (
                      <Button
                        type="button"
                        onClick={() => handleTogglePauseCampaign(camp)}
                        variant="outline"
                        size="sm"
                        className="text-amber-300 border-amber-500/40 bg-amber-950/40 hover:bg-amber-900/60 font-bold text-xs gap-1.5 cursor-pointer"
                        title="Mettre en pause cette campagne"
                      >
                        <Pause className="w-3.5 h-3.5 text-amber-400" />
                        <span>Pause</span>
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        onClick={() => handleTogglePauseCampaign(camp)}
                        variant="outline"
                        size="sm"
                        className="text-[#a3e635] border-[#a3e635]/40 bg-[#a3e635]/10 hover:bg-[#a3e635]/20 font-bold text-xs gap-1.5 cursor-pointer"
                        title="Reprendre et réactiver cette campagne"
                      >
                        <Play className="w-3.5 h-3.5 text-[#a3e635]" />
                        <span>Reprendre</span>
                      </Button>
                    )}

                    <Button
                      onClick={() => openEditCampaignModal(camp)}
                      variant="outline"
                      size="sm"
                      className="text-white border-slate-700 bg-slate-900 hover:bg-slate-800 font-bold text-xs gap-1"
                      title="Modifier la campagne ou le serveur SMTP"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Éditer</span>
                    </Button>

                    <Button
                      onClick={() => handleDeleteCampaign(camp.id, camp.name)}
                      variant="ghost"
                      size="sm"
                      className="text-rose-400 hover:bg-rose-950/50 hover:text-rose-300 font-bold text-xs"
                      title="Supprimer la campagne"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                </div>

                {/* EMAIL SEQUENCE STEPS FOR THIS CAMPAIGN */}
                {isExpanded && (
                  <div className="p-6 bg-white space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h3 className="text-xs font-heading font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                        <Mail className="w-4 h-4 text-purple-700" />
                        <span>Séquence d Emails spécifique à cette campagne ({stepCount})</span>
                      </h3>
                    </div>

                    {stepCount === 0 ? (
                      <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                        <p className="text-xs text-slate-500 font-medium">
                          Cette campagne n a pas encore de séquence d emails.
                        </p>
                        <Button
                          onClick={() => openAddStepModal(camp)}
                          size="sm"
                          variant="outline"
                          className="text-xs font-bold border-purple-300 text-purple-800 hover:bg-purple-50"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Créer le 1er email de la séquence (Email de Bienvenue)</span>
                        </Button>
                      </div>
                    ) : (() => {
                        const totalSeqSteps = camp.sequences.length;
                        const totalSeqPages = Math.ceil(totalSeqSteps / SEQUENCE_ITEMS_PER_PAGE) || 1;
                        const currentSeqPage = campaignSequencePages[camp.id] || 1;
                        const startSeqIdx = (currentSeqPage - 1) * SEQUENCE_ITEMS_PER_PAGE;
                        const endSeqIdx = Math.min(startSeqIdx + SEQUENCE_ITEMS_PER_PAGE, totalSeqSteps);
                        const paginatedSeqSteps = camp.sequences.slice(startSeqIdx, endSeqIdx);

                        return (
                          <div className="space-y-4">
                            {paginatedSeqSteps.map((step, idx) => {
                              const actualStepNum = startSeqIdx + idx + 1;
                              const isStep1 = step.stepOrder === 1 || step.triggerType === 'IMMEDIATE';
                              const totalVariantsCount = 1 + (step.variants ? step.variants.length : 0);
                              const isVariantsExpanded = expandedStepVariantIds.includes(step.id);

                              return (
                                <div key={step.id} className="space-y-2">
                                  
                                  {/* MAIN STEP CONTAINER HEADER */}
                                  <div className="p-4 bg-slate-50/90 rounded-2xl border-2 border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-purple-400 transition-colors shadow-2xs">
                                    
                                    <div className="space-y-1 flex-1 min-w-0">
                                      <div className="flex flex-wrap items-center gap-2">
                                        {isStep1 && (
                                          <button
                                            onClick={() => toggleStepVariantExpand(step.id)}
                                            className="p-1 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-900 transition-colors flex items-center gap-1 font-bold text-xs"
                                            title="Déplier/Replier les sous-emails de bienvenue"
                                          >
                                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isVariantsExpanded ? 'rotate-180 text-purple-700' : ''}`} />
                                          </button>
                                        )}

                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-[#a3e635] text-slate-950 font-mono font-black text-xs shadow-2xs border border-[#86efac]">
                                          Email #{actualStepNum}
                                        </span>
                                        
                                        {getTimingBadge(step.triggerType, step.delayHours, step.delayMinutes)}

                                        {isStep1 && (
                                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-950 border border-purple-300 font-heading font-black text-[10px]">
                                            📂 {totalVariantsCount} sous-email(s) de bienvenue
                                          </span>
                                        )}

                                        {!isStep1 && (
                                          <span className="font-heading font-black text-sm text-slate-950">
                                            {step.subject}
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                                      {isStep1 && (
                                        <Button
                                          onClick={() => {
                                            if (!isVariantsExpanded) toggleStepVariantExpand(step.id);
                                            openAddStepModal(camp, step);
                                          }}
                                          size="sm"
                                          variant="outline"
                                          className="text-xs font-bold border-purple-300 text-purple-800 bg-purple-50 hover:bg-purple-100 gap-1"
                                          title="Ajouter un sous-email de bienvenue alternatif pour un autre eBook"
                                        >
                                          <Plus className="w-3.5 h-3.5" />
                                          <span>+ Sous-email</span>
                                        </Button>
                                      )}

                                      {!isStep1 && (
                                        <>
                                          <button
                                            onClick={() => openEditStepModal(camp, step)}
                                            className="p-2 text-slate-700 hover:bg-slate-200 rounded-xl font-bold text-xs flex items-center gap-1"
                                            title="Éditer le contenu de cet email"
                                          >
                                            <Edit3 className="w-3.5 h-3.5" />
                                            <span>Éditer</span>
                                          </button>

                                          <button
                                            onClick={() => handleDeleteStep(camp.id, step.id)}
                                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl font-bold text-xs"
                                            title="Supprimer cet email"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </div>

                                  {/* SUB-EMAIL VARIANTS CONTAINER (NESTED ACCORDION FOR STEP #1) */}
                                  {isStep1 && isVariantsExpanded && (
                                    <div className="ml-4 sm:ml-8 pl-4 border-l-4 border-purple-400 space-y-2.5 pt-1">
                                      <div className="text-[11px] font-heading font-black text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                                        <span>📂 SOUS-EMAILS DE BIENVENUE ALTERNATIFS POUR EMAIL #{actualStepNum} :</span>
                                      </div>

                                      {/* 1. SOUS-EMAIL 1.1 (EMAIL PRINCIPAL DU STEP PARENT) */}
                                      <div className="p-3.5 bg-white rounded-2xl border-2 border-purple-200 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm hover:border-purple-400 transition-colors">
                                        <div className="space-y-1 flex-1 min-w-0">
                                          <div className="flex flex-wrap items-center gap-2">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-purple-900 text-white font-mono font-black text-[10px]">
                                              Sous-email 1.1
                                            </span>

                                            {step.attachmentUrl && (
                                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-950 border border-amber-300 font-heading font-black text-[9px]">
                                                <Paperclip className="w-3 h-3 text-amber-800" />
                                                <span>Pièce jointe : {step.attachmentName || 'Fichier'}</span>
                                              </span>
                                            )}

                                            <span className="font-heading font-black text-xs text-slate-950">
                                              {step.subject}
                                            </span>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-1.5 shrink-0">
                                          <button
                                            onClick={() => openEditStepModal(camp, step)}
                                            className="px-2.5 py-1 text-purple-900 hover:bg-purple-100 rounded-lg font-bold text-[11px] flex items-center gap-1 border border-purple-200"
                                            title="Éditer ce sous-email"
                                          >
                                            <Edit3 className="w-3 h-3" />
                                            <span>Éditer</span>
                                          </button>

                                          <button
                                            onClick={() => handleDeleteStep(camp.id, step.id)}
                                            className="px-2.5 py-1 text-rose-600 hover:bg-rose-100 rounded-lg font-bold text-[11px] border border-rose-200"
                                            title="Supprimer ce sous-email"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        </div>
                                      </div>

                                      {/* 2. SOUS-EMAILS 1.2, 1.3... (SOUS-EMAILS ALTERNATIFS) */}
                                      {step.variants && step.variants.length > 0 && (
                                        step.variants.map((vStep, vIdx) => (
                                          <div
                                            key={vStep.id}
                                            className="p-3.5 bg-purple-50/70 rounded-2xl border-2 border-purple-200 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs hover:border-purple-400 transition-colors"
                                          >
                                            <div className="space-y-1 flex-1 min-w-0">
                                              <div className="flex flex-wrap items-center gap-2">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-purple-700 text-white font-mono font-black text-[10px]">
                                                  Sous-email 1.{vIdx + 2}
                                                </span>

                                                {vStep.attachmentUrl && (
                                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-950 border border-amber-300 font-heading font-black text-[9px]">
                                                    <Paperclip className="w-3 h-3 text-amber-800" />
                                                    <span>Pièce jointe : {vStep.attachmentName || 'Fichier'}</span>
                                                  </span>
                                                )}

                                                <span className="font-heading font-black text-xs text-slate-950">
                                                  {vStep.subject}
                                                </span>
                                              </div>
                                            </div>

                                            <div className="flex items-center gap-1.5 shrink-0">
                                              <button
                                                onClick={() => openEditStepModal(camp, vStep)}
                                                className="px-2.5 py-1 text-purple-900 hover:bg-purple-200 rounded-lg font-bold text-[11px] flex items-center gap-1 border border-purple-200"
                                                title="Éditer cette variante d email"
                                              >
                                                <Edit3 className="w-3 h-3" />
                                                <span>Éditer</span>
                                              </button>

                                              <button
                                                onClick={() => handleDeleteStep(camp.id, vStep.id)}
                                                className="px-2.5 py-1 text-rose-600 hover:bg-rose-100 rounded-lg font-bold text-[11px] border border-rose-200"
                                                title="Supprimer cette variante d email"
                                              >
                                                <Trash2 className="w-3 h-3" />
                                              </button>
                                            </div>
                                          </div>
                                        ))
                                      )}

                                    </div>
                                  )}

                                </div>
                              );
                            })}

                            {/* SEQUENCE PAGINATION CONTROLS */}
                            {totalSeqPages > 1 && (
                              <div className="p-3.5 bg-slate-50/90 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs mt-4">
                                <div className="font-bold text-slate-700">
                                  Affichage de <strong className="text-purple-700 font-extrabold">{startSeqIdx + 1}</strong> à <strong className="text-purple-700 font-extrabold">{endSeqIdx}</strong> sur <strong className="text-slate-950 font-black">{totalSeqSteps}</strong> email(s) de séquence
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <Button
                                    onClick={() =>
                                      setCampaignSequencePages((prev) => ({
                                        ...prev,
                                        [camp.id]: Math.max((prev[camp.id] || 1) - 1, 1),
                                      }))
                                    }
                                    disabled={currentSeqPage === 1}
                                    variant="outline"
                                    size="sm"
                                    className="text-xs font-bold px-2.5 py-1 border-slate-300 bg-white"
                                  >
                                    ← Précédent
                                  </Button>

                                  {Array.from({ length: totalSeqPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                      key={page}
                                      onClick={() =>
                                        setCampaignSequencePages((prev) => ({
                                          ...prev,
                                          [camp.id]: page,
                                        }))
                                      }
                                      className={`w-7 h-7 rounded-lg font-heading font-black text-xs transition-colors ${
                                        currentSeqPage === page
                                          ? 'bg-purple-700 text-white shadow-xs'
                                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                                      }`}
                                    >
                                      {page}
                                    </button>
                                  ))}

                                  <Button
                                    onClick={() =>
                                      setCampaignSequencePages((prev) => ({
                                        ...prev,
                                        [camp.id]: Math.min((prev[camp.id] || 1) + 1, totalSeqPages),
                                      }))
                                    }
                                    disabled={currentSeqPage === totalSeqPages}
                                    variant="outline"
                                    size="sm"
                                    className="text-xs font-bold px-2.5 py-1 border-slate-300 bg-white"
                                  >
                                    Suivant →
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                  </div>
                )}

              </Card>
            );
          })}
        </div>
      )}

      {/* 1. MODAL CRÉER / MODIFIER UNE CAMPAGNE WITH SMTP SERVER SELECTOR */}
      {showCampaignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl max-w-md w-full space-y-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-heading font-black text-slate-950 flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-purple-700" />
                <span>{editingCampaign ? 'Modifier la Campagne' : 'Créer une Nouvelle Campagne'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowCampaignModal(false)}
                className="text-slate-400 hover:text-slate-900 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCampaign} className="space-y-4 text-xs">
              
              {/* CAMPAIGN NAME */}
              <div className="space-y-1">
                <label className="block font-extrabold text-slate-700">Nom de la Campagne*</label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="ex. Campagne Lancement Formation IA 2026"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none"
                />
              </div>

              {/* SMTP SERVER SELECTOR */}
              <div className="space-y-1">
                <label className="block font-extrabold text-purple-950 uppercase tracking-wider text-[11px]">
                  ⚙️ Choisir le Serveur SMTP d Expéditeur* :
                </label>
                
                {smtpServers.length === 0 ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] font-medium">
                    ⚠️ Aucun serveur SMTP configuré. Allez dans <strong>Paramètres Général</strong> pour ajouter vos serveurs SMTP (Brevo, Amazon SES, OVH...).
                  </div>
                ) : (
                  <select
                    value={campaignSmtpServerId}
                    onChange={(e) => setCampaignSmtpServerId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="">⚙️ Utiliser le serveur SMTP par défaut</option>
                    {smtpServers.map((srv) => (
                      <option key={srv.id} value={srv.id}>
                        📧 {srv.name} ({srv.fromEmail}) {srv.isDefault ? '⭐ Default' : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* TARGET LEAD LISTS SELECTOR */}
              <div className="space-y-2">
                <label className="block font-extrabold text-purple-950 uppercase tracking-wider text-[11px]">
                  📌 Sélectionner les Listes de Leads Cibles* :
                </label>
                
                {leadLists.length === 0 ? (
                  <div className="text-slate-400 italic text-[11px]">Aucune liste de leads disponible.</div>
                ) : (
                  <div className="grid grid-cols-1 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200 max-h-40 overflow-y-auto">
                    {leadLists.map((list) => {
                      const isChecked = selectedListIds.includes(list.id);
                      return (
                        <label
                          key={list.id}
                          className={`flex items-center gap-2.5 p-2 rounded-xl border cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-purple-50 border-purple-300 text-purple-950 font-bold'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedListIds([...selectedListIds, list.id]);
                              } else {
                                setSelectedListIds(selectedListIds.filter((id) => id !== list.id));
                              }
                            }}
                            className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 w-4 h-4"
                          />
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: list.color }} />
                          <span className="text-xs font-semibold">{list.name}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* DESCRIPTION */}
              <div className="space-y-1">
                <label className="block font-extrabold text-slate-700">Description (Optionnel)</label>
                <textarea
                  rows={2}
                  value={campaignDesc}
                  onChange={(e) => setCampaignDesc(e.target.value)}
                  placeholder="Objectif de cette campagne d emails..."
                  className="w-full px-3.5 py-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-normal focus:outline-none"
                />
              </div>

              {/* SUBMIT BUTTON */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCampaignModal(false)}
                  className="text-xs font-bold"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={savingCampaign}
                  size="sm"
                  className="btn-purple font-heading font-black text-xs px-5"
                >
                  {savingCampaign ? 'Enregistrement...' : editingCampaign ? 'Enregistrer les modifications' : 'Créer la Campagne'}
                </Button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 2. MODAL CRÉER / ÉDITER UN EMAIL DE SÉQUENCE OU SOUS-EMAIL */}
      {showStepModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl max-w-lg w-full space-y-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-heading font-black text-slate-950 flex items-center gap-2">
                <Mail className="w-5 h-5 text-purple-700" />
                <span>
                  {editingStep
                    ? stepParentId ? 'Éditer le Sous-Email de Bienvenue' : 'Éditer l Email de Séquence'
                    : stepParentId ? 'Ajouter un Sous-Email de Bienvenue Alternatif' : 'Ajouter un Email à la Séquence'}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setShowStepModal(false)}
                className="text-slate-400 hover:text-slate-900 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStep} className="space-y-4 text-xs">
              
              {/* TIMING CONFIGURATION WITH MINUTES / HOURS / DAYS SELECTOR */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-purple-50/60 p-3.5 rounded-2xl border border-purple-100">
                <div>
                  <label className="block font-extrabold text-purple-950 mb-1">Déclenchement*</label>
                  <select
                    value={stepTriggerType}
                    onChange={(e) => setStepTriggerType(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-slate-900 font-bold focus:outline-none"
                  >
                    <option value="IMMEDIATE">⚡ À l inscription</option>
                    <option value="DELAYED">⌛ Après un délai</option>
                  </select>
                </div>

                <div>
                  <label className="block font-extrabold text-purple-950 mb-1">Valeur du Délai</label>
                  <input
                    type="number"
                    min={0}
                    value={stepDelayValue}
                    onChange={(e) => setStepDelayValue(Number(e.target.value))}
                    disabled={stepTriggerType === 'IMMEDIATE'}
                    className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-slate-900 font-bold focus:outline-none disabled:bg-slate-100 disabled:text-slate-400"
                    placeholder="ex. 15 ou 24"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-purple-950 mb-1">Unité de Temps*</label>
                  <select
                    value={stepDelayUnit}
                    onChange={(e) => setStepDelayUnit(e.target.value)}
                    disabled={stepTriggerType === 'IMMEDIATE'}
                    className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-slate-900 font-bold focus:outline-none disabled:bg-slate-100 disabled:text-slate-400 cursor-pointer"
                  >
                    <option value="MINUTES">⏱️ Minutes</option>
                    <option value="HOURS">🕒 Heures</option>
                    <option value="DAYS">📅 Jours</option>
                  </select>
                </div>
              </div>

              {/* SUBJECT */}
              <div className="space-y-1">
                <label className="block font-extrabold text-slate-700">Sujet / Titre de l Email*</label>
                <input
                  type="text"
                  value={stepSubject}
                  onChange={(e) => setStepSubject(e.target.value)}
                  placeholder="ex. Bienvenue ! Voici votre eBook offert 🎁"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none"
                />
              </div>

              {/* CONTENT */}
              <div className="space-y-1">
                <label className="block font-extrabold text-slate-700">Contenu / Corps de l Email*</label>
                <textarea
                  rows={6}
                  value={stepContent}
                  onChange={(e) => setStepContent(e.target.value)}
                  placeholder={`Bonjour {prenom},\n\nMerci pour votre inscription ! Voici votre ebook gratuit.\n\nÀ très vite,\nL équipe Solopreneur&Co`}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-normal text-xs leading-relaxed focus:outline-none"
                />
                <div className="text-[10px] text-slate-400 font-medium">
                  Balises de personnalisation : <code className="text-purple-700 font-bold">{'{prenom}'}</code>, <code className="text-purple-700 font-bold">{'{nom}'}</code>, <code className="text-purple-700 font-bold">{'{nom_complet}'}</code>, <code className="text-purple-700 font-bold">{'{desabonner}'}</code>
                </div>
              </div>

              {/* ATTACHMENT FILE UPLOADER */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <label className="block font-extrabold text-slate-800 text-[11px] flex items-center gap-1.5">
                  <Paperclip className="w-4 h-4 text-purple-700" />
                  <span>Pièce Jointe / Fichier à envoyer avec l Email (Optionnel)</span>
                </label>

                {stepAttachmentUrl ? (
                  <div className="flex items-center justify-between p-2.5 bg-purple-100/70 border border-purple-300 rounded-xl text-purple-950 font-bold text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-purple-700 shrink-0" />
                      <span className="truncate">{stepAttachmentName || 'Fichier joint'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setStepAttachmentUrl('');
                        setStepAttachmentName('');
                      }}
                      className="text-rose-600 hover:text-rose-800 text-xs font-black px-2 py-0.5 rounded bg-rose-50"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div>
                    <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-purple-300 text-purple-900 font-extrabold text-xs hover:bg-purple-50 transition-colors shadow-2xs">
                      <span>📁 {uploadingAttachment ? 'Téléversement du fichier...' : 'Sélectionner un fichier (PDF, ZIP, Excel...)'}</span>
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleStepAttachmentUpload}
                        disabled={uploadingAttachment}
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* SUBMIT BUTTON */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowStepModal(false)}
                  className="text-xs font-bold"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={savingStep}
                  size="sm"
                  className="btn-purple font-heading font-black text-xs px-5"
                >
                  {savingStep ? 'Enregistrement...' : editingStep ? 'Enregistrer les modifications' : stepParentId ? 'Ajouter ce sous-email' : 'Ajouter à la Séquence'}
                </Button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
