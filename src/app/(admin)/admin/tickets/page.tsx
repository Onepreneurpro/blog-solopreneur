'use client';

import React, { useState, useEffect } from 'react';
import {
  LifeBuoy,
  Plus,
  Search,
  MessageSquare,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Filter,
  User,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Selected ticket for detailed view & reply
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  // New ticket modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newPriority, setNewPriority] = useState('MEDIUM');
  const [creating, setCreating] = useState(false);

  const fetchTickets = () => {
    setLoading(true);
    fetch('/api/admin/tickets')
      .then((res) => res.json())
      .then((data) => {
        if (data.tickets) setTickets(data.tickets);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // SEED DEMO TICKETS
  const handleSeedDemoTickets = async () => {
    const demoTickets = [
      {
        customerEmail: 'sophie.martin@studio.fr',
        subject: 'Problème lors du téléchargement du Dashboard Excel',
        message: 'Bonjour, j ai acheté le Dashboard Excel Trésorerie 2026 mais le lien me renvoie un fichier incomplet. Pouvez-vous m aider ?',
        priority: 'HIGH',
      },
      {
        customerEmail: 'thomas.dubois@freelance.io',
        subject: "Demande de lien d'accès au Workspace Notion Freelance OS",
        message: 'Bonjour l équipe, est-il possible d obtenir le lien direct pour dupliquer le template dans mon Notion ? Merci !',
        priority: 'MEDIUM',
      },
      {
        customerEmail: 'elodie.bernard@consulting.fr',
        subject: 'Question concernant la facture avec TVA',
        message: 'Bonjour, j ai besoin d une facture comportant mon numéro de TVA intracommunautaire pour ma comptabilité. Merci !',
        priority: 'LOW',
      },
    ];

    for (const demo of demoTickets) {
      await fetch('/api/admin/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE_TICKET',
          ...demo,
        }),
      });
    }

    alert('3 tickets support démo générés !');
    fetchTickets();
  };

  // SEND REPLY TO TICKET
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim()) return;

    setSendingReply(true);

    try {
      const res = await fetch('/api/admin/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADD_REPLY',
          ticketId: selectedTicket.id,
          message: replyMessage,
          status: 'IN_PROGRESS',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur d'envoi de réponse.");

      setReplyMessage('');
      fetchTickets();

      // Refresh selected ticket replies view
      setSelectedTicket((prev: any) => ({
        ...prev,
        status: 'IN_PROGRESS',
        replies: [...(prev.replies || []), data.reply],
      }));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSendingReply(false);
    }
  };

  // UPDATE TICKET STATUS
  const handleUpdateTicketStatus = async (ticketId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_STATUS',
          ticketId,
          status: newStatus,
        }),
      });

      if (!res.ok) throw new Error('Erreur de mise à jour.');
      fetchTickets();
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket((prev: any) => ({ ...prev, status: newStatus }));
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // CREATE NEW TICKET MANUALLY
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const res = await fetch('/api/admin/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE_TICKET',
          customerEmail: newEmail,
          subject: newSubject,
          message: newMessage,
          priority: newPriority,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur de création.');

      setShowCreateModal(false);
      setNewEmail('');
      setNewSubject('');
      setNewMessage('');
      fetchTickets();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCreating(false);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* HEADER WITH ACTION BUTTONS */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <LifeBuoy className="w-6 h-6 text-purple-600" />
            <span>Gestion des Tickets Support</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Suivez les demandes d assistance et visualisez les commandes associées.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSeedDemoTickets}
            className="gap-1.5 font-bold border-purple-300 bg-purple-50 text-purple-900 hover:bg-purple-100"
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>Générer Tickets Démo</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowCreateModal(true)}
            className="gap-1.5 font-bold btn-purple shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau Ticket Support</span>
          </Button>
        </div>
      </div>

      {/* FILTERS & SEARCH */}
      <Card className="p-4 bg-white border border-slate-200 shadow-sm space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par N° ticket, e-mail client ou sujet..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-sm bg-transparent border-0 focus:outline-none text-slate-900 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-600">Statut :</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none"
          >
            <option value="ALL">Tous les tickets ({tickets.length})</option>
            <option value="OPEN">Ouverts</option>
            <option value="IN_PROGRESS">En cours</option>
            <option value="RESOLVED">Résolus</option>
            <option value="CLOSED">Fermés</option>
          </select>
        </div>
      </Card>

      {/* MODAL: CREATE NEW TICKET */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="p-6 bg-white max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-purple-600" />
                <span>Nouveau Ticket Support Client</span>
              </h2>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Adresse E-mail Client *</label>
                <input
                  type="email"
                  required
                  placeholder="client@exemple.fr"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Sujet de la demande *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Problème d'accès au fichier Excel"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Priorité</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                >
                  <option value="LOW">Basse</option>
                  <option value="MEDIUM">Moyenne</option>
                  <option value="HIGH">Haute</option>
                  <option value="URGENT">Urgente</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Message / Descriptif *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Message détaillé du client..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowCreateModal(false)}>
                  Annuler
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={creating} className="font-bold btn-purple">
                  {creating ? 'Création...' : 'Créer le ticket'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* TICKETS TABLE WITH LINKED ORDER */}
      <Card className="bg-white overflow-hidden shadow-sm border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="p-4">N° Ticket</th>
                <th className="p-4">Client</th>
                <th className="p-4">Sujet & Commande Concernée</th>
                <th className="p-4">Priorité</th>
                <th className="p-4">Statut</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">Chargement des tickets support...</td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Aucun ticket support trouvé. Cliquez sur "Générer Tickets Démo" pour tester.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setSelectedTicket(t)}>
                    <td className="p-4 font-mono font-bold text-xs text-purple-700">
                      {t.ticketNumber}
                    </td>
                    <td className="p-4 text-xs font-semibold text-slate-900">
                      <div>{t.customer?.name || 'Client'}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{t.customerEmail}</div>
                    </td>
                    <td className="p-4 font-bold text-slate-900 max-w-xs">
                      <div>{t.subject}</div>
                      {t.order ? (
                        <div className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                          <ShoppingBag className="w-3 h-3 text-purple-600" />
                          <span>Commande {t.order.orderNumber} ({t.order.totalAmount} €)</span>
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-400 font-normal italic mt-0.5">Demande générale</div>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                        t.priority === 'URGENT' || t.priority === 'HIGH'
                          ? 'bg-red-100 text-red-800'
                          : t.priority === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="p-4">
                      <Badge variant={
                        t.status === 'RESOLVED' ? 'emerald' :
                        t.status === 'IN_PROGRESS' ? 'indigo' :
                        t.status === 'OPEN' ? 'amber' : 'slate'
                      }>
                        {t.status === 'OPEN' ? 'OUVERT' :
                         t.status === 'IN_PROGRESS' ? 'EN COURS' :
                         t.status === 'RESOLVED' ? 'RÉSOLU' : 'FERMÉ'}
                      </Badge>
                    </td>
                    <td className="p-4 text-xs text-slate-500">
                      {new Date(t.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="p-4 text-right">
                      <Button variant="outline" size="sm" className="gap-1 text-xs font-bold">
                        <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                        <span>Répondre</span>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* DETAIL & REPLY MODAL / DRAWER WITH LINKED ORDER VIEW */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="p-6 bg-white max-w-2xl w-full space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            {/* MODAL HEADER */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-extrabold px-2 py-0.5 bg-purple-100 text-purple-900 rounded">
                    {selectedTicket.ticketNumber}
                  </span>
                  <Badge variant={
                    selectedTicket.status === 'RESOLVED' ? 'emerald' :
                    selectedTicket.status === 'IN_PROGRESS' ? 'indigo' : 'amber'
                  }>
                    {selectedTicket.status}
                  </Badge>
                </div>
                <h2 className="text-lg font-extrabold text-slate-900 mt-1">{selectedTicket.subject}</h2>
                <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedTicket.customerEmail}</span>
                  <span>•</span>
                  <span>{new Date(selectedTicket.createdAt).toLocaleString('fr-FR')}</span>
                </div>
              </div>

              <button onClick={() => setSelectedTicket(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* LINKED ORDER RECAP BOX FOR ADMIN */}
            {selectedTicket.order ? (
              <div className="p-4 bg-purple-50/80 rounded-2xl border border-purple-200 space-y-2">
                <div className="text-xs font-extrabold text-purple-950 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-purple-700" />
                  <span>Commande sujet de ce ticket :</span>
                  <Badge variant="indigo" className="font-mono text-[10px]">
                    {selectedTicket.order.orderNumber}
                  </Badge>
                </div>
                <div className="text-xs text-purple-900 space-y-1">
                  <div>Montant total : <strong className="font-bold">{selectedTicket.order.totalAmount} €</strong></div>
                  <div>Produit : <strong className="font-bold">{selectedTicket.order.items?.[0]?.title || 'Produit Digital'}</strong></div>
                  <div>Passée le : {new Date(selectedTicket.order.createdAt).toLocaleDateString('fr-FR')}</div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 italic">
                Aucune commande spécifique associée à ce ticket support.
              </div>
            )}

            {/* INITIAL CLIENT MESSAGE */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                <span>Message initial du client :</span>
              </div>
              <p className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                {selectedTicket.message}
              </p>
            </div>

            {/* THREAD OF REPLIES */}
            {selectedTicket.replies && selectedTicket.replies.length > 0 && (
              <div className="space-y-3 border-t border-slate-100 pt-4">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Historique de la conversation :</div>
                <div className="space-y-3">
                  {selectedTicket.replies.map((r: any) => (
                    <div
                      key={r.id}
                      className={`p-4 rounded-2xl border text-xs space-y-1 ${
                        r.sender === 'ADMIN'
                          ? 'bg-purple-50/80 border-purple-200 text-purple-950 ml-4'
                          : 'bg-slate-50 border-slate-200 text-slate-900 mr-4'
                      }`}
                    >
                      <div className="font-bold text-[11px] flex justify-between">
                        <span>{r.sender === 'ADMIN' ? '🛠️ Support Client (Admin)' : `👤 Client (${selectedTicket.customerEmail})`}</span>
                        <span className="text-slate-400 font-normal">{new Date(r.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="whitespace-pre-wrap leading-relaxed">{r.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TICKET STATUS ACTIONS & REPLY FORM */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-slate-700">Changer le statut du ticket :</div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateTicketStatus(selectedTicket.id, 'IN_PROGRESS')}
                    className="text-xs font-bold text-indigo-700 hover:bg-indigo-50"
                  >
                    En cours
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateTicketStatus(selectedTicket.id, 'RESOLVED')}
                    className="text-xs font-bold text-emerald-700 hover:bg-emerald-50 gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Marquer Résolu</span>
                  </Button>
                </div>
              </div>

              {/* REPLY FORM */}
              <form onSubmit={handleSendReply} className="space-y-3">
                <textarea
                  rows={3}
                  required
                  placeholder="Écrivez votre réponse au client..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                />

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setSelectedTicket(null)}>
                    Fermer
                  </Button>
                  <Button type="submit" variant="primary" size="sm" disabled={sendingReply} className="font-bold btn-purple gap-1.5">
                    <Send className="w-4 h-4" />
                    <span>{sendingReply ? 'Envoi...' : 'Envoyer la réponse'}</span>
                  </Button>
                </div>
              </form>

            </div>

          </Card>
        </div>
      )}

    </div>
  );
}
