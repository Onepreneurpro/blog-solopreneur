'use client';

import React, { useState, useEffect } from 'react';
import { UserCheck, Download, Trash2, Search, Plus, Mail, BookOpen, Gift, Check, Sparkles, Filter, RefreshCw, FolderPlus, ArrowRightLeft, Layers, Tag, ChevronRight, CheckSquare, Square, ShoppingBag, Edit3, Ban, Unlock, CheckCircle2, MailX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface LeadList {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  sourceType?: string;
  createdAt: string;
  _count?: { leads: number };
}

interface Lead {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  source: string;
  status?: string;
  sentEmailsCount?: number;
  openedEmailsCount?: number;
  openRate?: number;
  listId: string | null;
  list: LeadList | null;
  createdAt: string;
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadLists, setLeadLists] = useState<LeadList[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [listFilter, setListFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState<'contacts' | 'lists'>('contacts');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, sourceFilter, listFilter]);

  // Bulk Selection & Transfer State
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [bulkTargetListId, setBulkTargetListId] = useState<string>('');
  const [moving, setMoving] = useState(false);

  // Manual Add Lead Modal State
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newSource, setNewSource] = useState('EBOOK_OPTIN');
  const [addLoading, setAddLoading] = useState(false);

  // Create List Modal State
  const [showCreateListModal, setShowCreateListModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDesc, setNewListDesc] = useState('');
  const [newListColor, setNewListColor] = useState('#a3e635');
  const [newListSourceType, setNewListSourceType] = useState('EBOOK_OPTIN');
  const [createListLoading, setCreateListLoading] = useState(false);

  // Edit List Modal State
  const [editingList, setEditingList] = useState<LeadList | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editColor, setEditColor] = useState('#a3e635');
  const [editSourceType, setEditSourceType] = useState('ALL');
  const [editListLoading, setEditListLoading] = useState(false);

  const [msg, setMsg] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [leadsRes, listsRes] = await Promise.all([
        fetch('/api/admin/leads'),
        fetch('/api/admin/lead-lists'),
      ]);
      const leadsData = await leadsRes.json();
      const listsData = await listsRes.json();

      if (leadsData.leads) setLeads(leadsData.leads);
      if (listsData.lists) setLeadLists(listsData.lists);
    } catch (err) {
      console.error('Failed to fetch leads & lists:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // DELETE LEAD
  const handleDeleteLead = async (id: string) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce lead de la liste ?')) return;
    try {
      const res = await fetch(`/api/admin/leads/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setLeads((prev) => prev.filter((l) => l.id !== id));
        setSelectedLeadIds((prev) => prev.filter((item) => item !== id));
        setMsg('Lead supprimé avec succès.');
        setTimeout(() => setMsg(null), 3000);
      }
    } catch (err) {
      console.error('Failed to delete lead:', err);
    }
  };

  // BLOCK / UNBLOCK LEAD
  const handleToggleBlockLead = async (lead: Lead) => {
    const isCurrentlyBlocked = lead.status === 'BLOCKED';
    const newStatus = isCurrentlyBlocked ? 'SUBSCRIBED' : 'BLOCKED';
    const actionText = isCurrentlyBlocked ? 'réactiver' : 'bloquer';

    if (!window.confirm(`Voulez-vous vraiment ${actionText} la séquence pour le contact ${lead.email} ?`)) return;

    try {
      const res = await fetch(`/api/admin/leads/${lead.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setLeads((prev) =>
          prev.map((l) => (l.id === lead.id ? { ...l, status: newStatus } : l))
        );
        setMsg(
          isCurrentlyBlocked
            ? `Contact ${lead.email} réactivé ! Sa séquence d'emails reprendra normalement.`
            : `Contact ${lead.email} bloqué ! Sa séquence d'emails est suspendue.`
        );
        setTimeout(() => setMsg(null), 4000);
      }
    } catch (err) {
      console.error('Failed to toggle block lead:', err);
    }
  };

  // DELETE LEAD LIST
  const handleDeleteList = async (id: string, name: string) => {
    if (!window.confirm(`Voulez-vous vraiment supprimer la liste "${name}" ? (Les leads associés seront conservés sans liste)`)) return;
    try {
      const res = await fetch(`/api/admin/lead-lists/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
        setMsg(`Liste "${name}" supprimée avec succès.`);
        setTimeout(() => setMsg(null), 3000);
      }
    } catch (err) {
      console.error('Failed to delete lead list:', err);
    }
  };

  // CREATE NEW LIST WITH SOURCE TYPE SELECTOR
  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    setCreateListLoading(true);
    try {
      const res = await fetch('/api/admin/lead-lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newListName,
          description: newListDesc,
          color: newListColor,
          sourceType: newListSourceType,
        }),
      });
      if (res.ok) {
        setShowCreateListModal(false);
        setNewListName('');
        setNewListDesc('');
        fetchData();
        setMsg(`Nouvelle liste de leads "${newListName}" créée avec succès !`);
        setTimeout(() => setMsg(null), 3000);
      }
    } catch (err) {
      console.error('Failed to create lead list:', err);
    } finally {
      setCreateListLoading(false);
    }
  };

  // EDIT EXISTING LIST
  const openEditModal = (list: LeadList) => {
    setEditingList(list);
    setEditName(list.name);
    setEditDesc(list.description || '');
    setEditColor(list.color || '#a3e635');
    setEditSourceType(list.sourceType || 'ALL');
  };

  const handleUpdateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingList || !editName.trim()) return;
    setEditListLoading(true);
    try {
      const res = await fetch(`/api/admin/lead-lists/${editingList.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          description: editDesc,
          color: editColor,
          sourceType: editSourceType,
        }),
      });
      if (res.ok) {
        setEditingList(null);
        fetchData();
        setMsg(`Liste "${editName}" mise à jour avec succès !`);
        setTimeout(() => setMsg(null), 3000);
      }
    } catch (err) {
      console.error('Failed to update lead list:', err);
    } finally {
      setEditListLoading(false);
    }
  };

  // MANUAL ADD LEAD
  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes('@')) return;
    setAddLoading(true);
    try {
      const res = await fetch('/api/admin/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: newFirstName,
          lastName: newLastName,
          email: newEmail,
          source: newSource,
        }),
      });
      if (res.ok) {
        setShowAddLeadModal(false);
        setNewFirstName('');
        setNewLastName('');
        setNewEmail('');
        fetchData();
        setMsg('Lead ajouté avec succès !');
        setTimeout(() => setMsg(null), 3000);
      }
    } catch (err) {
      console.error('Failed to add lead:', err);
    } finally {
      setAddLoading(false);
    }
  };

  // BULK MOVE LEADS TO TARGET LIST
  const handleBulkMove = async () => {
    if (selectedLeadIds.length === 0) return;
    setMoving(true);
    try {
      const res = await fetch('/api/admin/leads/move', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadIds: selectedLeadIds,
          targetListId: bulkTargetListId || 'NONE',
        }),
      });
      if (res.ok) {
        fetchData();
        setSelectedLeadIds([]);
        setMsg(`${selectedLeadIds.length} lead(s) déplacé(s) avec succès !`);
        setTimeout(() => setMsg(null), 3000);
      }
    } catch (err) {
      console.error('Failed to move leads:', err);
    } finally {
      setMoving(false);
    }
  };

  // SINGLE LEAD MOVE
  const handleSingleMove = async (leadId: string, targetListId: string) => {
    setMoving(true);
    try {
      const res = await fetch('/api/admin/leads/move', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadIds: [leadId],
          targetListId: targetListId,
        }),
      });
      if (res.ok) {
        fetchData();
        setMsg('Lead déplacé vers la nouvelle liste avec succès !');
        setTimeout(() => setMsg(null), 3000);
      }
    } catch (err) {
      console.error('Failed to move single lead:', err);
    } finally {
      setMoving(false);
    }
  };

  // SELECTION TOGGLES
  const toggleSelectAll = () => {
    if (selectedLeadIds.length === filteredLeads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(filteredLeads.map((l) => l.id));
    }
  };

  const toggleSelectLead = (id: string) => {
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const exportCSV = () => {
    if (filteredLeads.length === 0) return;
    const headers = ['Prénom', 'Email', 'Source', 'Liste Affectée', "Date d'Inscription"];
    const rows = filteredLeads.map((l) => [
      l.firstName || '',
      l.email,
      l.source,
      l.list ? l.list.name : 'Aucune',
      new Date(l.createdAt).toLocaleDateString('fr-FR') + ' ' + new Date(l.createdAt).toLocaleTimeString('fr-FR'),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.map((cell) => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `leads_contacts_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // FILTERED LEADS
  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      (l.firstName || '').toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase());
    const matchesSource = sourceFilter === 'ALL' || l.source === sourceFilter;
    const matchesList =
      listFilter === 'ALL'
        ? true
        : listFilter === 'UNASSIGNED'
        ? !l.listId
        : l.listId === listFilter;

    return matchesSearch && matchesSource && matchesList;
  });

  // PAGINATION CALCULATIONS
  const totalPages = Math.ceil(filteredLeads.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredLeads.length);
  const paginatedLeads = filteredLeads.slice(startIndex, endIndex);

  // STATS COUNTS
  const totalLeads = leads.length;
  const ebookLeads = leads.filter((l) => l.source === 'EBOOK_OPTIN').length;
  const resourceLeads = leads.filter((l) => l.source === 'FREE_RESOURCE').length;
  const customerLeads = leads.filter((l) => l.source === 'CUSTOMER').length;

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'EBOOK_OPTIN':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#a3e635] text-slate-950 font-heading font-black text-[10px] whitespace-nowrap">📘 Opt-in eBook</span>;
      case 'FREE_RESOURCE':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-lime-400 text-slate-950 font-heading font-black text-[10px] whitespace-nowrap">🎁 Ressource</span>;
      case 'CUSTOMER':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-purple-950 text-white font-heading font-black text-[10px] whitespace-nowrap">🛍️ Client</span>;
      case 'NEWSLETTER':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-heading font-black text-[10px] whitespace-nowrap">📧 Newsletter</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-200 text-slate-800 font-bold text-[10px] whitespace-nowrap">{source}</span>;
    }
  };

  const getSourceTypeLabel = (sourceType?: string) => {
    switch (sourceType) {
      case 'EBOOK_OPTIN':
        return '📘 Opt-in eBook Gratuit';
      case 'FREE_RESOURCE':
        return '🎁 Ressources Gratuites';
      case 'CUSTOMERS':
        return '🛍️ Clients Acheteurs Boutique';
      case 'NEWSLETTER':
        return '📧 Newsletter';
      default:
        return '🌐 Toutes les sources (Mixte)';
    }
  };

  return (
    <div className="space-y-6 w-full max-w-none pt-2">
      
      {/* TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-heading font-black text-slate-950 tracking-tight">Base Contacts Leads</h1>
            <Badge variant="indigo" className="text-xs font-mono font-extrabold uppercase bg-purple-100 text-purple-950">
              Prospects Opt-in ✉️
            </Badge>
          </div>
          <p className="text-xs text-slate-600 font-medium mt-1">
            Gérez vos contacts et vos listes par source (eBook, Ressources Gratuites, Clients Acheteurs). Transférez les leads d'une liste à l'autre.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
          <Button
            onClick={() => setShowCreateListModal(true)}
            size="sm"
            variant="outline"
            className="gap-1.5 font-bold text-xs text-slate-800 bg-white border-2 border-purple-200 hover:bg-purple-50 shadow-xs"
          >
            <FolderPlus className="w-4 h-4 text-purple-700" />
            <span>+ Nouvelle Liste</span>
          </Button>

          <Button
            onClick={() => setShowAddLeadModal(true)}
            size="sm"
            variant="outline"
            className="gap-1.5 font-bold text-xs text-slate-800 bg-white border-2 border-slate-200 hover:bg-slate-100 shadow-xs"
          >
            <Plus className="w-4 h-4 text-purple-700" />
            <span>+ Ajouter Lead</span>
          </Button>

          <Button
            onClick={exportCSV}
            disabled={leads.length === 0}
            size="sm"
            className="btn-purple gap-1.5 font-heading font-black text-xs px-5 py-2.5 shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>Exporter CSV</span>
          </Button>
        </div>
      </div>

      {msg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-2xl text-xs font-heading font-black shadow-sm">
          {msg}
        </div>
      )}

      {/* VIEW TABS SWITCHER */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('contacts')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-heading font-black flex items-center gap-2 transition-all ${
            activeTab === 'contacts'
              ? 'bg-purple-700 text-white shadow-md'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Tous les Contacts Leads ({leads.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('lists')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-heading font-black flex items-center gap-2 transition-all ${
            activeTab === 'lists'
              ? 'bg-purple-700 text-white shadow-md'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Gestion des Listes & Segments ({leadLists.length})</span>
        </button>
      </div>

      {/* TAB 2: GESTION DES LISTES */}
      {activeTab === 'lists' ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-heading font-black text-slate-950">Vos Listes de Leads ({leadLists.length})</h2>
            <Button
              onClick={() => setShowCreateListModal(true)}
              size="sm"
              className="btn-purple text-xs font-bold gap-1.5"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Créer une nouvelle liste</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leadLists.map((list) => {
              const count = list._count?.leads ?? leads.filter((l) => l.listId === list.id).length;
              return (
                <Card key={list.id} className="p-6 bg-white border border-slate-200 rounded-3xl shadow-xs flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full border border-slate-300 shrink-0" style={{ backgroundColor: list.color }} />
                        <h3 className="text-base font-heading font-black text-slate-950 truncate">{list.name}</h3>
                      </div>
                      <Badge className="bg-slate-100 text-slate-800 font-black text-xs shrink-0">
                        {count} lead(s)
                      </Badge>
                    </div>

                    <div className="inline-block">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-heading font-extrabold border border-slate-200">
                        Source : {getSourceTypeLabel(list.sourceType)}
                      </span>
                    </div>

                    {list.description && (
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">
                        {list.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setListFilter(list.id);
                          setActiveTab('contacts');
                        }}
                        className="font-bold text-purple-700 hover:underline flex items-center gap-1"
                      >
                        <span>Voir les leads</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => openEditModal(list)}
                        className="font-bold text-slate-700 hover:text-purple-700 flex items-center gap-1"
                        title="Modifier le nom ou la source de cette liste"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Éditer</span>
                      </button>
                    </div>

                    <button
                      onClick={() => handleDeleteList(list.id, list.name)}
                      className="text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1"
                      title="Supprimer cette liste"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Supprimer</span>
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        /* TAB 1: ALL CONTACTS & BULK TRANSFER */
        <div className="space-y-6">
          
          {/* STATS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <Card className="p-5 bg-white border border-slate-200 rounded-3xl shadow-xs flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Leads Capturés</div>
                <div className="text-2xl font-heading font-black text-slate-950 mt-1">{totalLeads}</div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-black">
                <UserCheck className="w-6 h-6" />
              </div>
            </Card>

            <Card className="p-5 bg-white border border-slate-200 rounded-3xl shadow-xs flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Opt-in eBook</div>
                <div className="text-2xl font-heading font-black text-emerald-600 mt-1">{ebookLeads}</div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                <BookOpen className="w-6 h-6" />
              </div>
            </Card>

            <Card className="p-5 bg-white border border-slate-200 rounded-3xl shadow-xs flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ressources Gratuites</div>
                <div className="text-2xl font-heading font-black text-blue-600 mt-1">{resourceLeads}</div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-black">
                <Gift className="w-6 h-6" />
              </div>
            </Card>

            <Card className="p-5 bg-white border border-slate-200 rounded-3xl shadow-xs flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Clients Acheteurs</div>
                <div className="text-2xl font-heading font-black text-purple-700 mt-1">{customerLeads}</div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center font-black">
                <ShoppingBag className="w-6 h-6" />
              </div>
            </Card>

          </div>

          {/* BULK SELECTION ACTIONS BAR (IF LEADS SELECTED) */}
          {selectedLeadIds.length > 0 && (
            <div className="p-4 bg-purple-950 text-white rounded-3xl border-2 border-purple-400 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-heading font-black">
                <CheckSquare className="w-5 h-5 text-[#a3e635]" />
                <span>{selectedLeadIds.length} lead(s) sélectionné(s)</span>
              </div>

              {/* ACTION: MOVE TO LIST */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-bold text-slate-300">Transférer vers :</span>
                <select
                  value={bulkTargetListId}
                  onChange={(e) => setBulkTargetListId(e.target.value)}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-white focus:outline-none"
                >
                  <option value="">Sélectionner une liste cible...</option>
                  <option value="NONE">Aucune liste (Non affecté)</option>
                  {leadLists.map((lst) => (
                    <option key={lst.id} value={lst.id}>
                      {lst.name}
                    </option>
                  ))}
                </select>

                <Button
                  type="button"
                  onClick={handleBulkMove}
                  disabled={moving || !bulkTargetListId}
                  size="sm"
                  className="bg-[#a3e635] text-slate-950 font-heading font-black text-xs px-4 py-1.5 hover:bg-[#86efac] border-0"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>{moving ? 'Déplacement...' : 'Transférer'}</span>
                </Button>
              </div>
            </div>
          )}

          {/* FILTER & SEARCH BAR */}
          <Card className="p-4 bg-white border border-slate-200 rounded-3xl shadow-xs flex flex-col lg:flex-row items-center justify-between gap-4">
            
            {/* SEARCH INPUT */}
            <div className="relative w-full lg:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher par prénom ou email..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            {/* SOURCE & LIST FILTERS */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto text-xs">
              
              {/* SOURCE FILTER */}
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-600">Source :</span>
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none"
                >
                  <option value="ALL">Toutes les sources</option>
                  <option value="EBOOK_OPTIN">Opt-in eBook</option>
                  <option value="FREE_RESOURCE">Ressources Gratuites</option>
                  <option value="CUSTOMER">Clients Acheteurs</option>
                  <option value="NEWSLETTER">Newsletter</option>
                </select>
              </div>

              {/* LIST FILTER */}
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-600">Liste :</span>
                <select
                  value={listFilter}
                  onChange={(e) => setListFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none"
                >
                  <option value="ALL">Toutes les listes</option>
                  <option value="UNASSIGNED">Non affectés (Sans liste)</option>
                  {leadLists.map((l) => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>

              <Button
                type="button"
                onClick={fetchData}
                variant="ghost"
                size="sm"
                className="p-2 text-slate-500 hover:text-slate-900"
                title="Rafraîchir"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>

            </div>

          </Card>

          {/* LEADS DATA TABLE */}
          <Card className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
            {loading ? (
              <div className="py-12 text-center text-slate-500 font-medium">
                Chargement de la liste des leads...
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="py-12 text-center text-slate-500 font-medium">
                Aucun lead trouvé selon ces critères.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-heading font-black text-slate-700 uppercase tracking-wider">
                      <th className="py-3.5 px-3 w-10 text-center">
                        <button onClick={toggleSelectAll} className="text-slate-500 hover:text-purple-700">
                          {selectedLeadIds.length === filteredLeads.length ? (
                            <CheckSquare className="w-4 h-4 text-purple-700" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </th>
                      <th className="py-2.5 px-2 text-left whitespace-nowrap">Prénom</th>
                      <th className="py-2.5 px-2 text-left whitespace-nowrap">Nom</th>
                      <th className="py-2.5 px-2 text-left whitespace-nowrap">Email</th>
                      <th className="py-2.5 px-1.5 text-left whitespace-nowrap w-24">Source</th>
                      <th className="py-2.5 px-1.5 text-left whitespace-nowrap w-32">Liste</th>
                      <th className="py-2.5 px-2 text-center whitespace-nowrap">Ouverture</th>
                      <th className="py-2.5 px-3 text-center whitespace-nowrap">Statut & Actions</th>
                      <th className="py-2.5 px-3 text-right whitespace-nowrap">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {paginatedLeads.map((lead) => {
                      const isSelected = selectedLeadIds.includes(lead.id);

                      return (
                        <tr key={lead.id} className={`transition-colors ${isSelected ? 'bg-purple-50/60' : 'hover:bg-slate-50/60'}`}>
                          
                          {/* CHECKBOX */}
                          <td className="py-2.5 px-2 text-center">
                            <button onClick={() => toggleSelectLead(lead.id)} className="text-slate-500 hover:text-purple-700">
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-purple-700" />
                              ) : (
                                <Square className="w-4 h-4" />
                              )}
                            </button>
                          </td>

                          {/* FIRST NAME */}
                          <td className="py-2.5 px-2 font-bold text-slate-900 whitespace-nowrap text-xs">
                            {lead.firstName ? (
                              <span>{lead.firstName}</span>
                            ) : (
                              <span className="text-slate-400 font-normal italic">--</span>
                            )}
                          </td>

                          {/* LAST NAME */}
                          <td className="py-2.5 px-2 font-bold text-slate-900 whitespace-nowrap text-xs">
                            {lead.lastName ? (
                              <span>{lead.lastName}</span>
                            ) : (
                              <span className="text-slate-400 font-normal italic">--</span>
                            )}
                          </td>

                          {/* EMAIL */}
                          <td className="py-2.5 px-2 font-mono font-bold text-purple-950 whitespace-nowrap text-xs">
                            <a href={`mailto:${lead.email}`} className="hover:underline flex items-center gap-1">
                              <Mail className="w-3 h-3 text-purple-600 shrink-0" />
                              <span>{lead.email}</span>
                            </a>
                          </td>

                          {/* SOURCE */}
                          <td className="py-2.5 px-1.5 whitespace-nowrap w-24">
                            {getSourceBadge(lead.source)}
                          </td>

                          {/* ASSIGNED LEAD LIST & QUICK MOVE DROPDOWN */}
                          <td className="py-2.5 px-1.5 whitespace-nowrap w-32">
                            <select
                              value={lead.listId || 'NONE'}
                              onChange={(e) => handleSingleMove(lead.id, e.target.value)}
                              className="px-2 py-0.5 rounded-lg border text-[11px] font-extrabold focus:outline-none cursor-pointer whitespace-nowrap max-w-[130px] truncate"
                              style={{
                                backgroundColor: lead.list ? `${lead.list.color}20` : '#f1f5f9',
                                color: lead.list ? '#0f172a' : '#64748b',
                                borderColor: lead.list ? `${lead.list.color}60` : '#cbd5e1',
                              }}
                            >
                              <option value="NONE">❌ Aucune liste</option>
                              {leadLists.map((lst) => (
                                <option key={lst.id} value={lst.id}>
                                  📁 {lst.name}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* TAUX D'OUVERTURE */}
                          <td className="py-2.5 px-2 text-center whitespace-nowrap">
                            {(() => {
                              const sent = lead.sentEmailsCount ?? 0;
                              const opened = lead.openedEmailsCount ?? 0;
                              const rate = lead.openRate ?? (sent > 0 ? Math.round((opened / sent) * 100) : 0);

                              if (sent === 0) {
                                return (
                                  <span className="inline-block px-2.5 py-0.5 rounded-lg border border-slate-200 bg-slate-100 text-slate-500 font-mono font-bold text-xs whitespace-nowrap">
                                    0/0 (0%)
                                  </span>
                                );
                              }

                              let colorStyle = 'bg-emerald-100 text-emerald-950 border-emerald-300';
                              if (rate < 30) {
                                colorStyle = 'bg-rose-100 text-rose-950 border-rose-300';
                              } else if (rate < 50) {
                                colorStyle = 'bg-amber-100 text-amber-950 border-amber-300';
                              }

                              return (
                                <span className={`inline-block px-2.5 py-0.5 rounded-lg border font-mono font-extrabold text-xs whitespace-nowrap shadow-2xs ${colorStyle}`}>
                                  {opened}/{sent} ({rate}%)
                                </span>
                              );
                            })()}
                          </td>

                          {/* STATUT & ACTIONS MERGED WITH CLEAR LABELS */}
                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              {lead.status === 'BLOCKED' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-heading font-black bg-amber-100 text-amber-950 border border-amber-300 whitespace-nowrap shadow-2xs">
                                  <Ban className="w-3.5 h-3.5 text-amber-800 shrink-0" />
                                  <span>Bloqué</span>
                                </span>
                              ) : lead.status === 'UNSUBSCRIBED' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-heading font-black bg-slate-200 text-slate-800 border border-slate-300 whitespace-nowrap shadow-2xs">
                                  <MailX className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                                  <span>Désabonné</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-heading font-black bg-emerald-100 text-emerald-950 border border-emerald-300 whitespace-nowrap shadow-2xs">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                                  <span>Inscrit</span>
                                </span>
                              )}

                              {lead.status === 'BLOCKED' ? (
                                <Button
                                  type="button"
                                  onClick={() => handleToggleBlockLead(lead)}
                                  variant="outline"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-emerald-700 hover:bg-emerald-50 border-emerald-300 rounded-lg flex items-center justify-center"
                                  title="Réactiver ce contact"
                                >
                                  <Unlock className="w-3.5 h-3.5" />
                                </Button>
                              ) : (
                                <Button
                                  type="button"
                                  onClick={() => handleToggleBlockLead(lead)}
                                  variant="outline"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-amber-700 hover:bg-amber-50 border-amber-300 rounded-lg flex items-center justify-center"
                                  title="Bloquer ce contact"
                                >
                                  <Ban className="w-3.5 h-3.5" />
                                </Button>
                              )}

                              <Button
                                type="button"
                                onClick={() => handleDeleteLead(lead.id)}
                                variant="outline"
                                size="sm"
                                className="h-7 w-7 p-0 text-rose-600 hover:bg-rose-50 hover:text-rose-700 border-rose-200 rounded-lg flex items-center justify-center"
                                title="Supprimer ce contact"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>

                          {/* CREATED AT (LAST COLUMN) */}
                          <td className="py-2.5 px-3 text-slate-500 font-medium text-[11px] text-right whitespace-nowrap">
                            {new Date(lead.createdAt).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* PAGINATION FOOTER */}
            {filteredLeads.length > 0 && (
              <div className="p-4 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="font-medium text-slate-600">
                  Affichage de <strong className="text-slate-900">{startIndex + 1}</strong> à <strong className="text-slate-900">{endIndex}</strong> sur <strong className="text-purple-700 font-bold">{filteredLeads.length}</strong> contact(s)
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center gap-1.5">
                    <Button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      variant="outline"
                      size="sm"
                      className="text-xs font-bold px-2.5 py-1 border-slate-300 bg-white"
                    >
                      ← Précédent
                    </Button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-7 h-7 rounded-lg font-heading font-black text-xs transition-colors ${
                          currentPage === page
                            ? 'bg-purple-700 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <Button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      variant="outline"
                      size="sm"
                      className="text-xs font-bold px-2.5 py-1 border-slate-300 bg-white"
                    >
                      Suivant →
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Card>

        </div>
      )}

      {/* CREATE NEW LIST MODAL WITH SOURCE TYPE SELECTOR */}
      {showCreateListModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl max-w-md w-full space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-heading font-black text-slate-950 flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-purple-700" />
                <span>Créer une Nouvelle Liste de Leads</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateListModal(false)}
                className="text-slate-400 hover:text-slate-900 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateList} className="space-y-4 text-xs">
              
              {/* LIST NAME */}
              <div className="space-y-1">
                <label className="block font-extrabold text-slate-700">Nom de la liste*</label>
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="ex. Prospects Lancement IA 2026"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none"
                />
              </div>

              {/* SOURCE DES LEADS SELECTOR */}
              <div className="space-y-1">
                <label className="block font-extrabold text-slate-700">Source d'alimentation des leads*</label>
                <select
                  value={newListSourceType}
                  onChange={(e) => setNewListSourceType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none cursor-pointer"
                >
                  <option value="EBOOK_OPTIN">📘 Opt-in eBook Gratuit</option>
                  <option value="FREE_RESOURCE">🎁 Ressources Gratuites</option>
                  <option value="CUSTOMERS">🛍️ Clients Acheteurs (Import automatique boutique)</option>
                  <option value="NEWSLETTER">📧 Newsletter Général</option>
                  <option value="ALL">🌐 Toutes les sources (Affectation manuelle / Mixte)</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1 italic font-medium">
                  {newListSourceType === 'CUSTOMERS' && '⚡ Importe automatiquement tous les clients ayant déjà acheté un produit sur la boutique.'}
                  {newListSourceType === 'EBOOK_OPTIN' && '⚡ Associe automatiquement les prospects s inscrivant via le formulaire eBook.'}
                  {newListSourceType === 'FREE_RESOURCE' && '⚡ Associe automatiquement les prospects téléchargeant des fiches gratuites.'}
                  {newListSourceType === 'ALL' && '⚡ Permet d alimenter cette liste par transfert ou ajout manuel.'}
                </p>
              </div>

              {/* DESCRIPTION */}
              <div className="space-y-1">
                <label className="block font-extrabold text-slate-700">Description (Optionnelle)</label>
                <textarea
                  rows={2}
                  value={newListDesc}
                  onChange={(e) => setNewListDesc(e.target.value)}
                  placeholder="Description de la liste de prospects..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none"
                />
              </div>

              {/* COLOR SELECTOR */}
              <div className="space-y-1">
                <label className="block font-extrabold text-slate-700">Couleur d'identification</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={newListColor}
                    onChange={(e) => setNewListColor(e.target.value)}
                    className="w-10 h-10 rounded-xl border border-slate-300 cursor-pointer"
                  />
                  <span className="font-mono text-slate-600 font-bold">{newListColor}</span>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  onClick={() => setShowCreateListModal(false)}
                  variant="outline"
                  size="sm"
                  className="font-bold text-xs"
                >
                  Annuler
                </Button>

                <Button
                  type="submit"
                  disabled={createListLoading}
                  size="sm"
                  className="btn-purple font-heading font-black text-xs px-4"
                >
                  {createListLoading ? 'Création...' : 'Créer la Liste'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT EXISTING LIST MODAL */}
      {editingList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl max-w-md w-full space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-heading font-black text-slate-950 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-purple-700" />
                <span>Modifier la Liste : {editingList.name}</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingList(null)}
                className="text-slate-400 hover:text-slate-900 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateList} className="space-y-4 text-xs">
              
              {/* LIST NAME */}
              <div className="space-y-1">
                <label className="block font-extrabold text-slate-700">Nom de la liste*</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none"
                />
              </div>

              {/* SOURCE DES LEADS SELECTOR */}
              <div className="space-y-1">
                <label className="block font-extrabold text-slate-700">Modifier la Source d'alimentation des leads*</label>
                <select
                  value={editSourceType}
                  onChange={(e) => setEditSourceType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none cursor-pointer"
                >
                  <option value="EBOOK_OPTIN">📘 Opt-in eBook Gratuit</option>
                  <option value="FREE_RESOURCE">🎁 Ressources Gratuites</option>
                  <option value="CUSTOMERS">🛍️ Clients Acheteurs (Import automatique boutique)</option>
                  <option value="NEWSLETTER">📧 Newsletter Général</option>
                  <option value="ALL">🌐 Toutes les sources (Affectation manuelle / Mixte)</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1 italic font-medium">
                  {editSourceType === 'CUSTOMERS' && '⚡ Importe automatiquement tous les clients ayant déjà acheté un produit sur la boutique.'}
                  {editSourceType === 'EBOOK_OPTIN' && '⚡ Associe automatiquement les prospects s inscrivant via le formulaire eBook.'}
                  {editSourceType === 'FREE_RESOURCE' && '⚡ Associe automatiquement les prospects téléchargeant des fiches gratuites.'}
                </p>
              </div>

              {/* DESCRIPTION */}
              <div className="space-y-1">
                <label className="block font-extrabold text-slate-700">Description</label>
                <textarea
                  rows={2}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none"
                />
              </div>

              {/* COLOR SELECTOR */}
              <div className="space-y-1">
                <label className="block font-extrabold text-slate-700">Couleur d'identification</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={editColor}
                    onChange={(e) => setEditColor(e.target.value)}
                    className="w-10 h-10 rounded-xl border border-slate-300 cursor-pointer"
                  />
                  <span className="font-mono text-slate-600 font-bold">{editColor}</span>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  onClick={() => setEditingList(null)}
                  variant="outline"
                  size="sm"
                  className="font-bold text-xs"
                >
                  Annuler
                </Button>

                <Button
                  type="submit"
                  disabled={editListLoading}
                  size="sm"
                  className="btn-purple font-heading font-black text-xs px-4"
                >
                  {editListLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANUAL ADD LEAD MODAL */}
      {showAddLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl max-w-md w-full space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-heading font-black text-slate-950">Ajouter un Lead Manuellement</h3>
              <button
                type="button"
                onClick={() => setShowAddLeadModal(false)}
                className="text-slate-400 hover:text-slate-900 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddLead} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-extrabold text-slate-700">Prénom du Lead</label>
                  <input
                    type="text"
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    placeholder="ex. Alex"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-extrabold text-slate-700">Nom du Lead</label>
                  <input
                    type="text"
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                    placeholder="ex. Morel"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-extrabold text-slate-700">Adresse Email Pro*</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="ex. alex@solopreneur.io"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-extrabold text-slate-700">Source d'inscription</label>
                <select
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none"
                >
                  <option value="EBOOK_OPTIN">Opt-in eBook Gratuit</option>
                  <option value="FREE_RESOURCE">Ressources Gratuites</option>
                  <option value="CUSTOMER">Client Acheteur</option>
                  <option value="NEWSLETTER">Newsletter</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  onClick={() => setShowAddLeadModal(false)}
                  variant="outline"
                  size="sm"
                  className="font-bold text-xs"
                >
                  Annuler
                </Button>

                <Button
                  type="submit"
                  disabled={addLoading}
                  size="sm"
                  className="btn-purple font-heading font-black text-xs px-4"
                >
                  {addLoading ? 'Ajout...' : 'Ajouter au CRM'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
