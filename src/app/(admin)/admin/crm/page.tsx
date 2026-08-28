'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  FileSpreadsheet,
  Download,
  Sparkles,
  Lock,
  Unlock,
  DollarSign,
  ShoppingBag,
  Search,
  ShieldAlert,
  Edit,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  Mail,
  Send,
  LifeBuoy,
  Tag,
  History,
  Trash2,
  ExternalLink,
  RotateCcw,
  CheckCircle2,
  CornerUpLeft,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export default function AdminCrmPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal 1: Create New Customer Manually
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('CUSTOMER');
  const [newCredit, setNewCredit] = useState<number>(0);
  const [creating, setCreating] = useState(false);

  // Modal 2: Edit Customer Details
  const [editModalCustomer, setEditModalCustomer] = useState<any | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('CUSTOMER');
  const [editCredit, setEditCredit] = useState<number>(0);
  const [editBlocked, setEditBlocked] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  // Modal 3: Contact Customer Privately (Default tab: HISTORY)
  const [contactModalCustomer, setContactModalCustomer] = useState<any | null>(null);
  const [modalViewMode, setModalViewMode] = useState<'COMPOSE' | 'HISTORY'>('HISTORY');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactPromoCode, setContactPromoCode] = useState('');
  const [sendingContact, setSendingContact] = useState(false);

  // Inline Reply State
  const [replyingMessageId, setReplyingMessageId] = useState<string | null>(null);
  const [inlineReplyText, setInlineReplyText] = useState('');
  const [sendingInlineReply, setSendingInlineReply] = useState(false);

  // History State
  const [historyData, setHistoryData] = useState<{ tickets: any[]; directMessages: any[] } | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Modal 4: Import CSV/Excel
  const [showImportModal, setShowImportModal] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importCount, setImportCount] = useState<number | null>(null);

  // Modal 5: Quick Avoir / Store Credit
  const [creditModalCustomer, setCreditModalCustomer] = useState<any | null>(null);
  const [creditAmount, setCreditAmount] = useState<number>(10);
  const [updatingCredit, setUpdatingCredit] = useState(false);

  // Expanded row for order history
  const [expandedEmail, setExpandedEmail] = useState<string | null>(null);

  const fetchCustomers = () => {
    setLoading(true);
    fetch('/api/admin/crm')
      .then((res) => res.json())
      .then((data) => {
        if (data.customers) {
          setCustomers(data.customers);
          const params = new URLSearchParams(window.location.search);
          const targetEmail = params.get('email') || params.get('contact');
          if (targetEmail) {
            setSearchQuery(targetEmail);
            const found = data.customers.find((c: any) => c.email.toLowerCase() === targetEmail.toLowerCase());
            if (found) {
              openContactModal(found, 'HISTORY');
            }
          }
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Fetch exchange history for a given email
  const fetchCustomerHistory = async (email: string) => {
    setLoadingHistory(true);
    try {
      const res = await fetch('/api/admin/crm/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur de chargement de l historique.');

      setHistoryData({
        tickets: data.tickets || [],
        directMessages: data.directMessages || [],
      });
    } catch (err: any) {
      console.error(err);
      setHistoryData({ tickets: [], directMessages: [] });
    } finally {
      setLoadingHistory(false);
    }
  };

  // TOGGLE SINGLE MESSAGE READ STATE
  const handleToggleMessageReadState = async (messageId: string, currentIsRead: boolean) => {
    try {
      const action = currentIsRead ? 'MARK_UNREAD' : 'MARK_READ';
      const res = await fetch('/api/admin/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, messageId }),
      });

      if (res.ok && contactModalCustomer) {
        fetchCustomerHistory(contactModalCustomer.email);
        fetchCustomers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // MARK ALL CUSTOMER MESSAGES AS READ
  const handleMarkAllMessagesRead = async (email: string) => {
    try {
      const res = await fetch('/api/admin/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'MARK_ALL_READ', email }),
      });

      if (res.ok) {
        fetchCustomerHistory(email);
        fetchCustomers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // HANDLE ADMIN INLINE REPLY TO EXISTING THREAD (WITHOUT RELANCING A NEW MESSAGE)
  const handleSendInlineReply = async (directMessageId: string) => {
    if (!inlineReplyText.trim()) return;
    setSendingInlineReply(true);

    try {
      const res = await fetch('/api/admin/crm/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          directMessageId,
          replyMessage: inlineReplyText,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur d envoi de la réponse.');

      setInlineReplyText('');
      setReplyingMessageId(null);
      if (contactModalCustomer) {
        fetchCustomerHistory(contactModalCustomer.email);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSendingInlineReply(false);
    }
  };

  // 1. GENERATE DEMO CUSTOMERS SEED
  const handleSeedDemo = async () => {
    if (!confirm('Générer automatiquement 5 clients démo avec des historiques fictifs ?')) return;

    try {
      const res = await fetch('/api/admin/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SEED_DEMO' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la génération.');
      alert(data.message || '5 Clients démo ajoutés !');
      fetchCustomers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // 2. CREATE NEW CUSTOMER MANUALLY
  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const res = await fetch('/api/admin/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE_CUSTOMER',
          name: newName,
          email: newEmail,
          role: newRole,
          amount: newCredit,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur de création.');

      setShowCreateModal(false);
      setNewName('');
      setNewEmail('');
      setNewCredit(0);
      fetchCustomers();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCreating(false);
    }
  };

  // 3. EDIT CUSTOMER
  const openEditModal = (cust: any) => {
    setEditModalCustomer(cust);
    setEditName(cust.name || '');
    setEditEmail(cust.email || '');
    setEditRole(cust.role || 'CUSTOMER');
    setEditCredit(cust.storeCredit || 0);
    setEditBlocked(cust.isBlocked || false);
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalCustomer) return;

    setSavingEdit(true);

    try {
      const res = await fetch('/api/admin/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: editModalCustomer.email,
          action: 'UPDATE_CUSTOMER',
          name: editName,
          newEmail: editEmail,
          role: editRole,
          amount: editCredit,
          isBlocked: editBlocked,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur de mise à jour.');

      setEditModalCustomer(null);
      fetchCustomers();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingEdit(false);
    }
  };

  // 4. OPEN CONTACT / MESSAGE PRIVÉ MODAL (DEFAULT TAB: HISTORY)
  const openContactModal = (cust: any, defaultView: 'COMPOSE' | 'HISTORY' = 'HISTORY') => {
    setContactModalCustomer(cust);
    setModalViewMode(defaultView);
    setContactSubject(`Offre Privilège & Information Solopreneur&Co`);
    setContactMessage(`Bonjour ${cust.name},\n\nNous avons le plaisir de vous offrir une remise exclusive...`);
    setContactPromoCode('WELCOME20');
    fetchCustomerHistory(cust.email);
  };

  // RELANCE PAST MESSAGE
  const handleRelanceMessage = (msg: any) => {
    const subjectPrefix = msg.subject.startsWith('[Relance]') ? '' : '[Relance] ';
    setContactSubject(`${subjectPrefix}${msg.subject}`);
    setContactMessage(`Bonjour ${contactModalCustomer?.name || 'Client'},\n\nJe me permets de vous relancer concernant notre précédent message :\n\n-----------------------------\nMessage d origine du ${new Date(msg.createdAt).toLocaleDateString('fr-FR')} :\n"${msg.content}"\n-----------------------------\n\nRestant à votre disposition,\nL équipe Solopreneur&Co`);
    if (msg.promoCode) setContactPromoCode(msg.promoCode);
    setModalViewMode('COMPOSE');
  };

  const handleSendContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactModalCustomer) return;

    setSendingContact(true);

    try {
      const res = await fetch('/api/admin/crm/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: contactModalCustomer.email,
          subject: contactSubject,
          message: contactMessage,
          promoCode: contactPromoCode,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur d envoi.');

      alert(data.message);
      fetchCustomerHistory(contactModalCustomer.email);
      setModalViewMode('HISTORY');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSendingContact(false);
    }
  };

  // 5. EXPORT TO CSV / EXCEL
  const handleExportCSV = () => {
    if (customers.length === 0) return alert('Aucun client à exporter.');

    const headers = ['Nom', 'Email', 'Role', 'Commandes', 'Total Depense (EUR)', 'Avoirs (EUR)', 'Statut', 'Date Creation'];
    const rows = customers.map((c) => [
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.email}"`,
      `"${c.role}"`,
      c.ordersCount,
      c.totalSpent,
      c.storeCredit,
      c.isBlocked ? 'Bloqué' : 'Actif',
      `"${new Date(c.createdAt).toLocaleDateString('fr-FR')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `export_clients_crm_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 6. IMPORT FROM CSV FILE
  const handleFileUploadImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportCount(null);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r\n|\n/);
      const parsedList: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const parts = line.split(/[;,]/);
        if (parts.length >= 2) {
          const name = parts[0].replace(/"/g, '').trim();
          const email = parts[1].replace(/"/g, '').trim();
          const role = parts[2]?.replace(/"/g, '').trim() || 'CUSTOMER';
          const storeCredit = parseFloat(parts[4] || parts[3] || '0') || 0;

          if (email.includes('@')) {
            parsedList.push({ name: name || 'Client Importé', email, role, storeCredit });
          }
        }
      }

      if (parsedList.length === 0) {
        alert('Format de fichier invalide. Assurez-vous d avoir au moins 2 colonnes: Nom;Email');
        setImporting(false);
        return;
      }

      try {
        const res = await fetch('/api/admin/crm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'IMPORT_CUSTOMERS',
            customersList: parsedList,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erreur d import.');

        setImportCount(data.importedCount);
        fetchCustomers();
      } catch (err: any) {
        alert(err.message);
      } finally {
        setImporting(false);
      }
    };

    reader.readAsText(file);
  };

  // TOGGLE BLOCK
  const handleToggleBlock = async (email: string, currentBlocked: boolean) => {
    const actionText = currentBlocked ? 'débloquer' : 'bloquer';
    if (!confirm(`Êtes-vous sûr de vouloir ${actionText} le client ${email} ?`)) return;

    try {
      const res = await fetch('/api/admin/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, action: 'TOGGLE_BLOCK' }),
      });

      if (!res.ok) throw new Error('Erreur lors du changement de statut.');
      fetchCustomers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // ADD CREDIT QUICK
  const handleAddCredit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creditModalCustomer) return;

    setUpdatingCredit(true);

    try {
      const res = await fetch('/api/admin/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: creditModalCustomer.email,
          action: 'ADD_CREDIT',
          amount: creditAmount,
        }),
      });

      if (!res.ok) throw new Error('Erreur d ajout d avoir.');
      setCreditModalCustomer(null);
      fetchCustomers();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdatingCredit(false);
    }
  };

  // DELETE ORDER
  const handleDeleteOrder = async (orderId: string, orderNumber: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer définitivement la commande ${orderNumber} ?`)) return;

    try {
      const res = await fetch('/api/admin/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'DELETE_ORDER',
          orderId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la suppression de la commande.');

      fetchCustomers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 w-full">
      
      {/* HEADER WITH ACTION BUTTONS */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 w-full">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-600 flex-shrink-0" />
            <span>Gestion des Clients</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestion des données clients, messages privés, offres marketing et suivi des échanges.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/admin/tickets">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 font-bold border-purple-200 bg-purple-50 text-purple-900 hover:bg-purple-100"
            >
              <LifeBuoy className="w-4 h-4 text-purple-600" />
              <span>Tickets Support</span>
            </Button>
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSeedDemo}
            className="gap-1.5 font-bold border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100"
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Générer Clients Démo</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="gap-1.5 font-bold text-slate-700"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Exporter (.csv)</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowImportModal(true)}
            className="gap-1.5 font-bold text-slate-700"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Importer (.csv)</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowCreateModal(true)}
            className="gap-1.5 font-bold bg-purple-700 hover:bg-purple-800 text-white shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>Nouveau Client</span>
          </Button>
        </div>
      </div>

      {/* SEARCH BAR */}
      <Card className="p-4 bg-white border border-slate-200 shadow-sm flex items-center gap-3 w-full">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Rechercher un client par nom ou e-mail..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-sm bg-transparent border-0 focus:outline-none text-slate-900 font-medium"
        />
      </Card>

      {/* MODAL: CONTACT & MESSAGE PRIVÉ (DEFAULT TAB: HISTORIQUE DES ÉCHANGES) */}
      {contactModalCustomer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="p-6 bg-white max-w-2xl w-full space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            {/* MODAL HEADER & TAB TOGGLE */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-purple-600" />
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    Message Privé à {contactModalCustomer.name}
                  </h2>
                  <p className="text-[11px] text-slate-400">{contactModalCustomer.email}</p>
                </div>
              </div>

              <button onClick={() => setContactModalCustomer(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* TAB NAVIGATION BUTTONS */}
            <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setModalViewMode('COMPOSE')}
                className={`flex-1 py-1.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  modalViewMode === 'COMPOSE'
                    ? 'bg-white text-purple-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Nouveau Message / Relance</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setModalViewMode('HISTORY');
                  fetchCustomerHistory(contactModalCustomer.email);
                }}
                className={`flex-1 py-1.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  modalViewMode === 'HISTORY'
                    ? 'bg-white text-purple-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <History className="w-3.5 h-3.5 text-purple-600" />
                <span>Historique des Échanges Envoyés ({historyData?.directMessages.length || 0})</span>
              </button>
            </div>

            {/* VIEW 1: COMPOSE NEW PRIVATE MESSAGE */}
            {modalViewMode === 'COMPOSE' && (
              <form onSubmit={handleSendContact} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Destinataire</label>
                  <input
                    type="text"
                    disabled
                    value={`${contactModalCustomer.name} (${contactModalCustomer.email})`}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sujet du Message Privé *</label>
                  <input
                    type="text"
                    required
                    placeholder="Sujet du message..."
                    value={contactSubject}
                    onChange={(e) => setContactSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Code Promo Offert (Optionnel)</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Ex: WELCOME20, PROMO-SOLO"
                      value={contactPromoCode}
                      onChange={(e) => setContactPromoCode(e.target.value.toUpperCase())}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-purple-700"
                    />
                    <Tag className="w-4 h-4 text-purple-600 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Texte du Message *</label>
                  <textarea
                    rows={6}
                    required
                    placeholder="Écrivez votre message privé ou offre marketing..."
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 leading-relaxed"
                  />
                </div>

                {/* BOTTOM ACTION BUTTONS */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <Button type="button" variant="outline" size="sm" onClick={() => setContactModalCustomer(null)}>
                    Annuler
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setModalViewMode('HISTORY');
                        fetchCustomerHistory(contactModalCustomer.email);
                      }}
                      className="font-bold border-purple-200 bg-purple-50 text-purple-900 hover:bg-purple-100 gap-1.5 text-xs"
                    >
                      <History className="w-4 h-4 text-purple-600" />
                      <span>Historique</span>
                    </Button>

                    <Button type="submit" variant="primary" size="sm" disabled={sendingContact} className="font-bold bg-purple-700 hover:bg-purple-800 text-white gap-1.5 text-xs">
                      <Send className="w-4 h-4" />
                      <span>{sendingContact ? 'Envoi...' : 'Envoyer le message privé'}</span>
                    </Button>
                  </div>
                </div>
              </form>
            )}

            {/* VIEW 2: FULL EXCHANGE HISTORY WITH RÉPONDRE & RELANCER OPTIONS */}
            {modalViewMode === 'HISTORY' && (
              <div className="space-y-4">
                {loadingHistory ? (
                  <div className="py-12 text-center text-slate-500 text-sm font-medium">Extraction de l historique des échanges...</div>
                ) : !historyData || (historyData.directMessages.length === 0 && historyData.tickets.length === 0) ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl text-xs text-slate-500 border border-slate-200">
                    Aucun échange ou message précédent enregistré pour <strong>{contactModalCustomer.email}</strong>.
                  </div>
                ) : (
                  <div className="space-y-6">
                    
                    {/* DIRECT MESSAGES & PROMOS */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                          <Mail className="w-4 h-4 text-purple-600" />
                          <span>Messages Privés Envoyés ({historyData.directMessages.length})</span>
                        </h3>

                        {historyData.directMessages.some((m) => !m.isRead && m.replies?.some((r: any) => r.sender === 'CUSTOMER')) && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkAllMessagesRead(contactModalCustomer.email)}
                            className="font-extrabold text-xs bg-emerald-100 hover:bg-emerald-200 text-emerald-950 border-emerald-300 gap-1.5 h-7"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Tout marquer comme lu</span>
                          </Button>
                        )}
                      </div>

                      <div className="space-y-3">
                        {historyData.directMessages.map((msg) => {
                          const hasCustomerReply = msg.replies && msg.replies.some((r: any) => r.sender === 'CUSTOMER');
                          return (
                            <div key={msg.id} className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-3 text-xs shadow-xs">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-extrabold text-purple-950 text-sm">{msg.subject}</span>
                                <span className="text-slate-500 font-medium text-[11px] whitespace-nowrap">{new Date(msg.createdAt).toLocaleString('fr-FR')}</span>
                              </div>
                              
                              <p className="text-purple-950 bg-white/80 p-3 rounded-xl border border-purple-100 whitespace-pre-wrap leading-relaxed">
                                {msg.content}
                              </p>
                              
                              <div className="flex items-center justify-between pt-1 gap-2 flex-wrap">
                                {msg.promoCode ? (
                                  <div className="inline-block px-2.5 py-1 bg-amber-100 text-amber-950 rounded-md font-mono font-bold text-[11px] border border-amber-300">
                                    Code Promo : {msg.promoCode}
                                  </div>
                                ) : <div />}

                                <div className="flex items-center gap-2">
                                  {/* MARQUER COMME LU BUTTON ONLY APPEARS IF THERE IS A NEW CUSTOMER REPLY */}
                                  {hasCustomerReply ? (
                                    !msg.isRead ? (
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleToggleMessageReadState(msg.id, false)}
                                        className="gap-1.5 font-bold text-xs bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-300 shadow-xs"
                                        title="Nouvelle réponse client reçue ! Cliquer pour marquer comme lu"
                                      >
                                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" />
                                        <span>Marquer comme lu</span>
                                      </Button>
                                    ) : (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleToggleMessageReadState(msg.id, true)}
                                        className="gap-1 font-extrabold text-xs text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200"
                                        title="Réponse client marquée comme lue. Cliquer pour la remettre en non-lu"
                                      >
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>Lu</span>
                                      </Button>
                                    )
                                  ) : (
                                    <span className="text-[11px] font-medium text-slate-400 italic">
                                      En attente de réponse du client
                                    </span>
                                  )}

                                  {/* BUTTON TO REPLY DIRECTLY TO THIS THREAD (WITHOUT RELANCING A NEW MESSAGE) */}
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setReplyingMessageId(replyingMessageId === msg.id ? null : msg.id);
                                      setInlineReplyText('');
                                    }}
                                    className="gap-1.5 font-bold text-xs bg-blue-50 hover:bg-blue-100 text-blue-900 border-blue-200"
                                    title="Répondre directement dans ce fil de discussion sans créer une relance"
                                  >
                                    <CornerUpLeft className="w-3.5 h-3.5 text-blue-600" />
                                    <span>Répondre</span>
                                  </Button>

                                  {/* BUTTON TO RELANCE THIS PAST MESSAGE */}
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRelanceMessage(msg)}
                                    className="gap-1.5 font-bold text-xs bg-purple-700 hover:bg-purple-800 text-white border-0 shadow-sm"
                                    title="Pré-remplir un nouveau message de relance basé sur cet ancien message"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5 text-white" />
                                    <span>Relancer ce message</span>
                                  </Button>
                                </div>
                              </div>

                              {/* INLINE REPLY FORM */}
                              {replyingMessageId === msg.id && (
                                <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl space-y-2.5 mt-2">
                                  <div className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                                    <CornerUpLeft className="w-3.5 h-3.5 text-blue-600" />
                                    <span>Répondre à {contactModalCustomer.name} dans ce fil :</span>
                                  </div>
                                  <textarea
                                    rows={3}
                                    placeholder="Écrivez votre réponse ici..."
                                    value={inlineReplyText}
                                    onChange={(e) => setInlineReplyText(e.target.value)}
                                    className="w-full p-2.5 bg-white border border-blue-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  />
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setReplyingMessageId(null);
                                        setInlineReplyText('');
                                      }}
                                      className="h-7 text-xs font-bold text-slate-600"
                                    >
                                      Annuler
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="primary"
                                      size="sm"
                                      disabled={sendingInlineReply || !inlineReplyText.trim()}
                                      onClick={() => handleSendInlineReply(msg.id)}
                                      className="h-7 text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white gap-1"
                                    >
                                      <Send className="w-3 h-3" />
                                      <span>{sendingInlineReply ? 'Envoi...' : 'Envoyer la réponse'}</span>
                                    </Button>
                                  </div>
                                </div>
                              )}

                              {/* REPLIES LIST */}
                              {msg.replies && msg.replies.length > 0 && (
                                <div className="space-y-2 pt-2 border-t border-purple-200/60">
                                  <div className="text-[10px] font-bold text-purple-700 uppercase">Réponses de la discussion :</div>
                                  {msg.replies.map((r: any) => (
                                    <div key={r.id} className={`p-2.5 rounded-xl ${r.sender === 'CUSTOMER' ? 'bg-white text-purple-950 border border-purple-200' : 'bg-purple-100 text-purple-950 font-medium'}`}>
                                      <div className="font-bold text-[10px] text-purple-700 flex justify-between">
                                        <span>{r.sender === 'CUSTOMER' ? `👤 ${contactModalCustomer.name}` : '🛠️ Administration'}</span>
                                        <span className="text-slate-400">{new Date(r.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                                      </div>
                                      <p className="whitespace-pre-wrap">{r.message}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* SUPPORT TICKETS */}
                    {historyData.tickets.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                          <LifeBuoy className="w-4 h-4 text-purple-600" />
                          <span>Tickets Support ({historyData.tickets.length})</span>
                        </h3>

                        <div className="space-y-3">
                          {historyData.tickets.map((t) => (
                            <div key={t.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-purple-700">{t.ticketNumber}</span>
                                  <Badge variant={t.status === 'RESOLVED' ? 'emerald' : 'amber'}>{t.status}</Badge>
                                </div>
                                <span className="text-slate-400 font-medium">{new Date(t.createdAt).toLocaleString('fr-FR')}</span>
                              </div>

                              <div className="font-bold text-slate-900 text-sm">{t.subject}</div>
                              <p className="text-slate-800 whitespace-pre-wrap">{t.message}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                )}

                <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setModalViewMode('COMPOSE')}
                    className="font-bold gap-1.5 text-xs text-purple-700"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Rédiger un nouveau message</span>
                  </Button>

                  <Button type="button" variant="outline" size="sm" onClick={() => setContactModalCustomer(null)}>
                    Fermer
                  </Button>
                </div>
              </div>
            )}

          </Card>
        </div>
      )}

      {/* MODAL 1: CREATE NEW CUSTOMER MANUALLY */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="p-6 bg-white max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-600" />
                <span>Ajouter un Nouveau Client</span>
              </h2>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nom Complet *</label>
                <input
                  type="text"
                  required
                  placeholder="Alexandre Morel"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Adresse E-mail *</label>
                <input
                  type="email"
                  required
                  placeholder="alexandre@exemple.fr"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Rôle</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                  >
                    <option value="CUSTOMER">Client</option>
                    <option value="EDITOR">Éditeur</option>
                    <option value="ADMIN">Administrateur</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Avoir initial (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newCredit}
                    onChange={(e) => setNewCredit(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowCreateModal(false)}>
                  Annuler
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={creating} className="font-bold bg-purple-700 hover:bg-purple-800 text-white">
                  {creating ? 'Création...' : 'Créer le client'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* MODAL 2: EDIT CUSTOMER DETAILS */}
      {editModalCustomer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="p-6 bg-white max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Edit className="w-5 h-5 text-purple-600" />
                <span>Modifier le profil client</span>
              </h2>
              <button onClick={() => setEditModalCustomer(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nom complet / Raison sociale *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Adresse E-mail *</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Rôle d accès</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                  >
                    <option value="CUSTOMER">Client (Acheteur)</option>
                    <option value="EDITOR">Éditeur (Articles)</option>
                    <option value="ADMIN">Administrateur</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Avoir / Crédit (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editCredit}
                    onChange={(e) => setEditCredit(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editBlocked}
                    onChange={(e) => setEditBlocked(e.target.checked)}
                    className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-xs font-bold text-red-700">Bloquer l accès de ce client (Suspension de compte)</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditModalCustomer(null)}>
                  Annuler
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={savingEdit} className="font-bold gap-1.5 bg-purple-700 hover:bg-purple-800 text-white">
                  <Save className="w-4 h-4" />
                  <span>{savingEdit ? 'Enregistrement...' : 'Sauvegarder les modifications'}</span>
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* MODAL 4: IMPORT CSV/EXCEL */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="p-6 bg-white max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <span>Importer Fichier Clients (.csv)</span>
              </h2>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-600">
                Téléversez un fichier CSV contenant les colonnes : <code>Nom;Email;Role;Avoir</code>.
              </p>

              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUploadImport}
                className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
              />

              {importing && <div className="text-xs text-purple-600 font-bold">Importation en cours...</div>}

              {importCount !== null && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{importCount} clients importés avec succès !</span>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowImportModal(false)}>
                Fermer
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* MODAL 5: QUICK AVOIR / STORE CREDIT */}
      {creditModalCustomer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="p-6 bg-white max-w-md w-full space-y-4 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <span>Ajouter un Avoir Client</span>
            </h2>
            <p className="text-xs text-slate-500">
              Ajouter un avoir / bon d achat au compte de <strong>{creditModalCustomer.email}</strong>.
            </p>

            <form onSubmit={handleAddCredit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Montant à ajouter (€) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-base font-bold text-slate-900"
                />
              </div>

              <div className="p-3 bg-purple-50 rounded-xl text-xs text-purple-900 space-y-1">
                <div className="font-bold">Avoir actuel : {creditModalCustomer.storeCredit} €</div>
                <div className="text-purple-700">Nouveau solde : {creditModalCustomer.storeCredit + Number(creditAmount)} €</div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setCreditModalCustomer(null)}>
                  Annuler
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={updatingCredit} className="font-bold bg-purple-700 hover:bg-purple-800 text-white">
                  {updatingCredit ? 'Mise à jour...' : 'Valider l avoir'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* CUSTOMERS TABLE */}
      <Card className="bg-white overflow-hidden shadow-sm border border-slate-200 w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="p-4">Client</th>
                <th className="p-4">Email</th>
                <th className="p-4">Commandes</th>
                <th className="p-4 text-center w-28">Total</th>
                <th className="p-4 text-right">Actions CRM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">Chargement des clients CRM...</td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">Aucun client trouvé. Cliquez sur "Générer Clients Démo" ou "Nouveau Client".</td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const isExpanded = expandedEmail === cust.email;
                  return (
                    <React.Fragment key={cust.id}>
                      <tr className={`hover:bg-slate-50 transition-colors ${cust.isBlocked ? 'bg-red-50/40' : ''}`}>
                        <td className="p-4 font-bold text-slate-900 whitespace-nowrap">
                          {cust.name}
                        </td>
                        <td className="p-4 text-xs font-medium text-slate-600 whitespace-nowrap">
                          {cust.email}
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <button
                            onClick={() => setExpandedEmail(isExpanded ? null : cust.email)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 hover:underline"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>{cust.ordersCount} commande(s)</span>
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        </td>

                        {/* CENTERED & COMPACT TOTAL COLUMN */}
                        <td className="p-4 font-extrabold text-slate-900 text-center whitespace-nowrap w-28 px-2">
                          {cust.totalSpent} €
                        </td>

                        <td className="p-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            
                            {/* SEND PRIVATE MARKETING MESSAGE WITH UNREAD COUNTER BADGE */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openContactModal(cust, 'HISTORY')}
                              className={`gap-1 font-semibold text-xs ${
                                cust.unreadMessagesCount > 0
                                  ? 'text-purple-950 border-purple-300 bg-purple-100 hover:bg-purple-200 font-bold shadow-xs'
                                  : 'text-purple-700 border-purple-200 bg-purple-50/50 hover:bg-purple-100'
                              }`}
                              title={cust.unreadMessagesCount > 0 ? `${cust.unreadMessagesCount} message(s) non lus pour ce client` : 'Envoyer un message privé'}
                            >
                              <Mail className="w-3.5 h-3.5 text-purple-600" />
                              <span>Message Privé</span>
                              {cust.unreadMessagesCount > 0 && (
                                <span className="ml-1 px-1.5 py-0.2 text-[10px] font-black bg-amber-400 text-amber-950 rounded-full animate-bounce">
                                  {cust.unreadMessagesCount}
                                </span>
                              )}
                            </Button>

                            {/* EDIT CUSTOMER DATA */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditModal(cust)}
                              className="gap-1 font-semibold text-xs text-slate-700"
                              title="Modifier les données du client"
                            >
                              <Edit className="w-3.5 h-3.5 text-slate-600" />
                              <span>Éditer</span>
                            </Button>

                            {/* ADD AVOIR / CREDIT BUTTON WITH AMOUNT DISPLAYED INSIDE */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCreditModalCustomer(cust)}
                              className={`gap-1 text-xs ${
                                cust.storeCredit > 0
                                  ? 'text-slate-950 border-[#86efac] bg-[#A3E635]/30 hover:bg-[#A3E635]/50 font-black shadow-2xs'
                                  : 'text-slate-700 border-slate-200 font-semibold'
                              }`}
                              title="Ajouter ou gérer l avoir du client"
                            >
                              <DollarSign className={`w-3.5 h-3.5 ${cust.storeCredit > 0 ? 'text-slate-950 font-black' : 'text-slate-500'}`} />
                              <span>Avoir ({cust.storeCredit}€)</span>
                            </Button>

                            {/* BLOCK / UNBLOCK */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleBlock(cust.email, cust.isBlocked)}
                              className={cust.isBlocked ? 'text-emerald-600 hover:bg-emerald-50 gap-1 font-bold' : 'text-red-600 hover:bg-red-50 gap-1 font-bold'}
                              title={cust.isBlocked ? 'Débloquer le client' : 'Bloquer le client'}
                            >
                              {cust.isBlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                              <span>{cust.isBlocked ? 'Débloquer' : 'Bloquer'}</span>
                            </Button>
                          </div>
                        </td>
                      </tr>

                      {/* EXPANDED ORDER HISTORY ROW WITH CLICKABLE ORDER NUMBER & DELETE OPTION */}
                      {isExpanded && (
                        <tr className="bg-slate-50/80 border-b border-slate-200">
                          <td colSpan={5} className="p-4 space-y-3">
                            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                              HISTORIQUE DES COMMANDES DE {cust.email.toUpperCase()} :
                            </div>

                            {cust.orders && cust.orders.length > 0 ? (
                              <div className="space-y-2 max-w-3xl">
                                {cust.orders.map((ord: any) => (
                                  <div key={ord.id} className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs shadow-xs">
                                    <div className="space-y-0.5">
                                      <Link
                                        href={`/admin/commandes/${ord.id}`}
                                        className="font-extrabold text-purple-700 hover:text-purple-900 hover:underline inline-flex items-center gap-1 text-sm"
                                        title="Cliquer pour ouvrir les détails de la commande"
                                      >
                                        <span>{ord.orderNumber}</span>
                                        <ExternalLink className="w-3 h-3 text-purple-500" />
                                      </Link>
                                      <div className="text-[11px] text-slate-400">
                                        {new Date(ord.createdAt).toLocaleDateString('fr-FR')}
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                      <Badge variant={ord.status === 'COMPLETED' ? 'emerald' : 'slate'} className="font-bold">
                                        {ord.status}
                                      </Badge>
                                      <div className="font-extrabold text-slate-900 text-sm min-w-[50px] text-right">{ord.totalAmount} €</div>

                                      {/* VIEW ORDER DETAILS BUTTON */}
                                      <Link href={`/admin/commandes/${ord.id}`}>
                                        <Button variant="outline" size="sm" className="h-7 text-[11px] font-bold text-purple-700 border-purple-200 bg-purple-50 hover:bg-purple-100 px-2">
                                          Voir fiche
                                        </Button>
                                      </Link>

                                      {/* DELETE ORDER BUTTON */}
                                      <button
                                        onClick={() => handleDeleteOrder(ord.id, ord.orderNumber)}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                        title="Supprimer la commande"
                                      >
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-xs text-slate-500 italic">Aucune commande enregistrée pour l instant.</div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
}
