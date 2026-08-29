'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  User,
  Package,
  LifeBuoy,
  Mail,
  Download,
  LogOut,
  Edit,
  Save,
  Plus,
  MessageSquare,
  Send,
  CheckCircle2,
  Tag,
  DollarSign,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  Bell,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

export default function CustomerAccountPage() {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [directMessages, setDirectMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Tab navigation: 'ORDERS' | 'PROFILE' | 'TICKETS' | 'MESSAGES'
  const [activeTab, setActiveTab] = useState<'ORDERS' | 'PROFILE' | 'TICKETS' | 'MESSAGES'>('ORDERS');

  // Profile Edit State
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Create Ticket State
  const [showCreateTicketModal, setShowCreateTicketModal] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketPriority, setTicketPriority] = useState('MEDIUM');
  const [ticketOrderId, setTicketOrderId] = useState<string>('');
  const [creatingTicket, setCreatingTicket] = useState(false);

  // Ticket Reply State
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState('');
  const [sendingTicketReply, setSendingTicketReply] = useState(false);

  // Private Message Reply State
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [messageReplyText, setMessageReplyText] = useState('');
  const [sendingMessageReply, setSendingMessageReply] = useState(false);

  const fetchUserData = async () => {
    try {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();

      if (!meData.user) {
        window.location.href = '/login';
        return;
      }

      setUser(meData.user);
      setName(meData.user.name || '');
      setAvatar(meData.user.avatar || '');

      // 1. Fetch user orders
      const ordersRes = await fetch('/api/account/orders');
      const ordersData = await ordersRes.json();
      if (ordersData.orders) {
        setOrders(ordersData.orders);
      }

      // 2. Fetch support tickets
      const tckRes = await fetch('/api/account/tickets');
      const tckData = await tckRes.json();
      if (tckData.tickets) setTickets(tckData.tickets);

      // 3. Fetch private messages
      const msgRes = await fetch('/api/account/messages');
      const msgData = await msgRes.json();
      if (msgData.messages) setDirectMessages(msgData.messages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // Calculate Unread Notifications for Customer (INDEPENDENT FROM ADMIN)
  const unreadMessagesList = directMessages.filter((m) => !m.customerIsRead);
  const unreadMessagesCount = unreadMessagesList.length;

  const unreadTicketsList = tickets.filter((t) => t.status !== 'RESOLVED' && t.replies && t.replies.some((r: any) => r.sender === 'ADMIN'));
  const unreadTicketRepliesCount = unreadTicketsList.length;

  const totalUnreadNotifications = unreadMessagesCount + unreadTicketRepliesCount;

  // MARK ALL DIRECT MESSAGES AS READ FOR CUSTOMER
  const markMessagesAsRead = async () => {
    try {
      await fetch('/api/account/messages', { method: 'PATCH' });
      setDirectMessages((prev) => prev.map((m) => ({ ...m, customerIsRead: true })));
      window.dispatchEvent(new CustomEvent('notifications-read'));
    } catch (err) {
      console.error(err);
    }
  };

  // MARK SINGLE DIRECT MESSAGE AS READ FOR CUSTOMER
  const markSingleMessageAsReadForCustomer = async (messageId: string) => {
    try {
      await fetch('/api/account/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId }),
      });
      setDirectMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, customerIsRead: true } : m))
      );
      window.dispatchEvent(new CustomEvent('notifications-read'));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectTab = (tab: 'ORDERS' | 'PROFILE' | 'TICKETS' | 'MESSAGES') => {
    setActiveTab(tab);
  };

  // Save Profile Changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess(false);

    try {
      const res = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, avatar }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur de mise à jour.');

      setUser(data.user);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  // Create Support Ticket
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingTicket(true);

    try {
      const res = await fetch('/api/account/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: ticketSubject,
          message: ticketMessage,
          priority: ticketPriority,
          orderId: ticketOrderId || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la création du ticket.');

      setShowCreateTicketModal(false);
      setTicketSubject('');
      setTicketMessage('');
      setTicketOrderId('');

      // Refresh tickets list
      const tckRes = await fetch('/api/account/tickets');
      const tckData = await tckRes.json();
      if (tckData.tickets) setTickets(tckData.tickets);
      setActiveTab('TICKETS');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCreatingTicket(false);
    }
  };

  // Close / Resolve Ticket by Customer
  const handleCloseTicket = async (ticketId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir fermer ce ticket d'assistance ?")) return;

    try {
      const res = await fetch('/api/account/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CLOSE_TICKET',
          ticketId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la fermeture du ticket.');

      // Refresh tickets list
      const tckRes = await fetch('/api/account/tickets');
      const tckData = await tckRes.json();
      if (tckData.tickets) setTickets(tckData.tickets);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Send Ticket Reply
  const handleSendTicketReply = async (ticketId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketReplyText.trim()) return;

    setSendingTicketReply(true);

    try {
      const res = await fetch('/api/account/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REPLY',
          ticketId,
          replyMessage: ticketReplyText,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de l envoi de la réponse.');

      setTicketReplyText('');
      const tckRes = await fetch('/api/account/tickets');
      const tckData = await tckRes.json();
      if (tckData.tickets) setTickets(tckData.tickets);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSendingTicketReply(false);
    }
  };

  // Send Direct Message Reply
  const handleSendMessageReply = async (directMessageId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!messageReplyText.trim()) return;

    setSendingMessageReply(true);

    try {
      const res = await fetch('/api/account/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          directMessageId,
          replyMessage: messageReplyText,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de l envoi de la réponse.');

      setMessageReplyText('');
      const msgRes = await fetch('/api/account/messages');
      const msgData = await msgRes.json();
      if (msgData.messages) setDirectMessages(msgData.messages);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSendingMessageReply(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-600">Chargement de votre compte client...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* HEADER CUSTOMER BANNER & NOTIFICATION ALERT (HIGH CONTRAST WHITE TEXT) */}
        <div className="account-user-banner p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-6 border border-slate-800">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 p-0.5 shadow-lg flex-shrink-0">
              <div className="w-full h-full bg-slate-900 rounded-full overflow-hidden flex items-center justify-center font-extrabold text-2xl text-purple-300">
                {user.avatar ? (
                  <Image src={user.avatar} alt={user.name || 'Avatar'} width={64} height={64} className="w-full h-full object-cover rounded-full" />
                ) : (
                  (user.name || user.email).substring(0, 2).toUpperCase()
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  {user.name || 'Client Solopreneur'}
                </h1>
                {user.role === 'ADMIN' && <Badge variant="indigo">Admin</Badge>}
              </div>
              <p className="text-xs font-mono font-bold mt-0.5 opacity-90">
                {user.email}
              </p>
              
              {/* STORE CREDIT BADGE */}
              <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30 text-xs font-bold">
                <span>Solde d'Avoir : {user.storeCredit || 0} €</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {totalUnreadNotifications > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/40 rounded-2xl text-amber-300 text-xs font-bold animate-pulse">
                <Bell className="w-4 h-4 text-amber-400" />
                <span>{totalUnreadNotifications} nouvelle(s) notification(s) non lue(s)</span>
              </div>
            )}

            {user.role === 'ADMIN' ? (
              <Link href="/admin">
                <Button
                  variant="primary"
                  size="md"
                  className="gap-2.5 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-extrabold text-sm rounded-2xl border border-violet-400 shadow-xl shadow-violet-600/50 ring-2 ring-violet-400/50 transition-all hover:scale-105"
                >
                  <Sparkles className="w-4.5 h-4.5 text-amber-300" />
                  <span>Espace Administration →</span>
                </Button>
              </Link>
            ) : (
              <Button onClick={handleLogout} variant="outline" size="sm" className="gap-2 border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700 text-xs font-bold">
                <LogOut className="w-4 h-4 text-slate-400" />
                <span>Déconnexion</span>
              </Button>
            )}
          </div>
        </div>

        {/* TAB NAVIGATION HEADER */}
        <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => handleSelectTab('ORDERS')}
            className={`flex items-center gap-2 py-3 px-5 border-b-2 text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'ORDERS'
                ? 'border-purple-600 text-purple-900 bg-white shadow-xs rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Package className="w-4 h-4 text-purple-600" />
            <span>Mes Achats & Téléchargements ({orders.length})</span>
          </button>

          <button
            onClick={() => handleSelectTab('TICKETS')}
            className={`flex items-center gap-2 py-3 px-5 border-b-2 text-sm font-bold transition-all whitespace-nowrap relative ${
              activeTab === 'TICKETS'
                ? 'border-purple-600 text-purple-900 bg-white shadow-xs rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <LifeBuoy className="w-4 h-4 text-purple-600" />
            <span>Tickets d'Assistance ({tickets.length})</span>
            {unreadTicketRepliesCount > 0 && (
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-ping" />
            )}
          </button>

          <button
            onClick={() => handleSelectTab('MESSAGES')}
            className={`flex items-center gap-2 py-3 px-5 border-b-2 text-sm font-bold transition-all whitespace-nowrap relative ${
              activeTab === 'MESSAGES'
                ? 'border-purple-600 text-purple-900 bg-white shadow-xs rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Mail className="w-4 h-4 text-purple-600" />
            <span>Messages Privés & Promos ({directMessages.length})</span>
            {unreadMessagesCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] font-black bg-amber-500 text-amber-950 rounded-full">
                {unreadMessagesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => handleSelectTab('PROFILE')}
            className={`flex items-center gap-2 py-3 px-5 border-b-2 text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'PROFILE'
                ? 'border-purple-600 text-purple-900 bg-white shadow-xs rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4 text-purple-600" />
            <span>Mon Profil</span>
          </button>
        </div>

        {/* TAB 1: ORDERS & DOWNLOADS */}
        {activeTab === 'ORDERS' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Historique de vos Commandes</h2>
                <p className="text-xs text-slate-500 mt-0.5">Accédez à vos liens de téléchargements et vos factures.</p>
              </div>
            </div>

            {orders.length === 0 ? (
              <Card className="p-10 text-center text-slate-500 bg-white space-y-3">
                <p className="text-sm">Vous n avez encore passé aucune commande.</p>
                <Link href="/boutique">
                  <Button variant="primary" size="sm" className="font-bold btn-purple">
                    Découvrir la Boutique
                  </Button>
                </Link>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((ord) => (
                  <Card key={ord.id} className="p-6 bg-white space-y-4 border border-slate-200 shadow-sm hover:border-purple-200 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-extrabold text-purple-700 text-base">{ord.orderNumber}</span>
                          <Badge variant={ord.status === 'COMPLETED' ? 'emerald' : 'slate'} className="font-bold">
                            {ord.status === 'COMPLETED' ? 'Payée / Validée' : ord.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          Commandé le {new Date(ord.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                      </div>

                      <div className="font-extrabold text-slate-900 text-lg sm:text-right">
                        {ord.totalAmount} €
                      </div>
                    </div>

                    {/* ORDER ITEMS LIST */}
                    <div className="space-y-3">
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Produits inclus :</div>
                      {ord.items && ord.items.map((item: any) => (
                        <div key={item.id} className="p-3.5 bg-slate-50 rounded-xl flex items-center justify-between gap-4 text-xs">
                          <div className="flex items-center gap-3">
                            <ShoppingBag className="w-4 h-4 text-purple-600 flex-shrink-0" />
                            <div>
                              <div className="font-extrabold text-slate-900">{item.title}</div>
                              <div className="text-slate-400 font-mono text-[11px]">{item.price} €</div>
                            </div>
                          </div>

                          {/* DOWNLOAD ACCESSIBLE DIRECTLY */}
                          <Link href={`/boutique`}>
                            <Button variant="outline" size="sm" className="gap-1.5 font-bold text-xs border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100">
                              <Download className="w-3.5 h-3.5" />
                              <span>Télécharger</span>
                            </Button>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PROFILE EDIT */}
        {activeTab === 'PROFILE' && (
          <Card className="p-6 sm:p-8 bg-white max-w-xl space-y-6 shadow-sm border border-slate-200">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Vos Informations Personnelles</h2>
              <p className="text-xs text-slate-500 mt-0.5">Mettez à jour votre nom d affichage et votre avatar.</p>
            </div>

            {profileSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Modifications enregistrées avec succès !</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Avatar / Photo de profil</label>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-purple-100 border border-purple-200 flex items-center justify-center font-bold text-purple-700 text-lg overflow-hidden flex-shrink-0">
                    {avatar ? (
                      <Image src={avatar} alt="Avatar" width={56} height={56} className="w-full h-full object-cover" />
                    ) : (
                      (name || user.email).substring(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Ou collez l URL de l image..."
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nom et Prénom *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Adresse E-mail (Non modifiable)</label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-sm font-medium text-slate-500 cursor-not-allowed"
                />
              </div>

              <Button type="submit" disabled={savingProfile} variant="primary" size="md" className="font-bold btn-purple gap-2">
                <Save className="w-4 h-4" />
                <span>{savingProfile ? 'Enregistrement...' : 'Enregistrer mon profil'}</span>
              </Button>
            </form>
          </Card>
        )}

        {/* TAB 3: SUPPORT TICKETS WITH CLIENT CLOSE OPTION */}
        {activeTab === 'TICKETS' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Mes Tickets d'Assistance</h2>
                <p className="text-xs text-slate-500 mt-0.5">Posez vos questions et échangez avec l assistance technique.</p>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowCreateTicketModal(true)}
                className="gap-1.5 font-bold btn-purple"
              >
                <Plus className="w-4 h-4" />
                <span>Ouvrir un Ticket d'Assistance</span>
              </Button>
            </div>

            {/* CREATE TICKET MODAL WITH ORDER DROPDOWN SELECTOR */}
            {showCreateTicketModal && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <Card className="p-6 bg-white max-w-lg w-full space-y-5 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <LifeBuoy className="w-5 h-5 text-purple-600" />
                      <span>Ouvrir un Ticket d'Assistance</span>
                    </h3>
                  </div>

                  <form onSubmit={handleCreateTicket} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Commande concernée (Menu déroulant)
                      </label>
                      <select
                        value={ticketOrderId}
                        onChange={(e) => setTicketOrderId(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">-- Aucune commande spécifique (Question générale) --</option>
                        {orders.map((ord) => (
                          <option key={ord.id} value={ord.id}>
                            Commande {ord.orderNumber} ({ord.totalAmount} €) — {ord.items?.[0]?.title || 'Produit Digital'}
                          </option>
                        ))}
                      </select>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Sélectionnez la commande associée pour aider l équipe support.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Sujet de votre demande *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Question sur l accès au template Notion"
                        value={ticketSubject}
                        onChange={(e) => setTicketSubject(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Description détaillée *</label>
                      <textarea
                        rows={4}
                        required
                        placeholder="Expliquez en détail votre demande..."
                        value={ticketMessage}
                        onChange={(e) => setTicketMessage(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 leading-relaxed"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-3">
                      <Button type="button" variant="outline" size="sm" onClick={() => setShowCreateTicketModal(false)}>
                        Annuler
                      </Button>
                      <Button type="submit" disabled={creatingTicket} variant="primary" size="sm" className="font-bold btn-purple">
                        {creatingTicket ? 'Création...' : 'Envoyer le Ticket'}
                      </Button>
                    </div>
                  </form>
                </Card>
              </div>
            )}

            {tickets.length === 0 ? (
              <Card className="p-10 text-center text-slate-500 bg-white">
                <p className="text-sm">Vous n avez aucun ticket d'assistance ouvert.</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {tickets.map((t) => {
                  const isOpen = selectedTicketId === t.id;
                  const hasAdminReply = t.replies && t.replies.some((r: any) => r.sender === 'ADMIN');

                  return (
                    <Card key={t.id} className="p-6 bg-white space-y-4 border border-slate-200 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-purple-700 text-sm">{t.ticketNumber}</span>
                            <Badge variant={t.status === 'RESOLVED' ? 'emerald' : 'amber'} className="font-bold">
                              {t.status === 'RESOLVED' ? 'Résolu / Fermé' : t.status === 'IN_PROGRESS' ? 'En cours' : 'Ouvert'}
                            </Badge>
                            {hasAdminReply && t.status !== 'RESOLVED' && <Badge variant="indigo" className="font-bold animate-pulse">Réponse du support disponible</Badge>}
                          </div>

                          <h3 className="font-extrabold text-base text-slate-900">{t.subject}</h3>
                          <div className="text-xs text-slate-400">Créé le {new Date(t.createdAt).toLocaleDateString('fr-FR')}</div>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* CLIENT CAN CLOSE OPEN TICKET */}
                          {t.status !== 'RESOLVED' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCloseTicket(t.id)}
                              className="gap-1 font-bold text-xs text-red-700 border-red-200 bg-red-50 hover:bg-red-100 shadow-xs"
                              title="Fermer et marquer ce ticket comme résolu"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-red-600" />
                              <span>Fermer le ticket</span>
                            </Button>
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedTicketId(isOpen ? null : t.id)}
                            className="gap-1 font-semibold text-xs text-purple-700 border-purple-200 bg-purple-50/50 hover:bg-purple-100"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                            <span>{isOpen ? 'Masquer la discussion' : 'Voir & Répondre'}</span>
                            {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </Button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                        {t.message}
                      </p>

                      {/* REPLIES THREAD */}
                      {t.replies && t.replies.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-slate-100">
                          <div className="text-[11px] font-bold text-slate-400 uppercase">Historique des échanges :</div>
                          {t.replies.map((r: any) => (
                            <div key={r.id} className={`p-3.5 rounded-2xl text-xs ${r.sender === 'ADMIN' ? 'bg-purple-50 text-purple-950 border border-purple-200 font-medium ring-1 ring-purple-300' : 'bg-slate-100 text-slate-900 border border-slate-200'}`}>
                              <div className="font-bold text-[10px] text-purple-700 mb-1 flex justify-between">
                                <span>{r.sender === 'ADMIN' ? '🛠️ Support Solopreneur&Co (Réponse)' : '👤 Vous (Client)'}</span>
                                <span className="text-slate-400 font-normal">{new Date(r.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <p className="whitespace-pre-wrap leading-relaxed">{r.message}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* CLIENT TICKET REPLY FORM */}
                      {isOpen && t.status !== 'RESOLVED' && (
                        <form onSubmit={(e) => handleSendTicketReply(t.id, e)} className="pt-3 border-t border-slate-100 space-y-3">
                          <div className="text-xs font-bold text-slate-700">Votre réponse à l assistance :</div>
                          <textarea
                            rows={3}
                            required
                            placeholder="Écrivez votre message à l attention du support..."
                            value={ticketReplyText}
                            onChange={(e) => setTicketReplyText(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium text-slate-900"
                          />
                          <div className="flex justify-end">
                            <Button type="submit" disabled={sendingTicketReply} variant="primary" size="sm" className="font-bold btn-purple gap-1.5">
                              <Send className="w-3.5 h-3.5" />
                              <span>{sendingTicketReply ? 'Envoi...' : 'Envoyer ma réponse'}</span>
                            </Button>
                          </div>
                        </form>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PRIVATE MESSAGES WITH INDEPENDENT CUSTOMER READ BUTTON */}
        {activeTab === 'MESSAGES' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Messages Privés & Offres Administrateurs</h2>
                <p className="text-xs text-slate-500 mt-0.5">Consultez vos messages et répondez directement à l'administration.</p>
              </div>

              {/* CUSTOMER MARQUER TOUT COMME LU BUTTON */}
              {directMessages.some((m) => !m.customerIsRead) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markMessagesAsRead}
                  className="gap-1.5 font-bold text-xs bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 shadow-xs"
                  title="Marquer tous les messages comme lus pour votre compte client"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tout marquer comme lu</span>
                </Button>
              )}
            </div>

            {directMessages.length === 0 ? (
              <Card className="p-10 text-center text-slate-500 bg-white">
                <p className="text-sm">Aucun message privé reçu de l'administration pour le moment.</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {directMessages.map((msg) => {
                  const isOpen = selectedMessageId === msg.id;

                  return (
                    <Card key={msg.id} className={`p-6 bg-white space-y-4 border shadow-sm ${!msg.customerIsRead ? 'border-amber-300 ring-1 ring-amber-200' : 'border-purple-200'}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Mail className="w-4 h-4 text-purple-600" />
                            <h4 className="font-extrabold text-base text-slate-900">{msg.subject}</h4>
                            {!msg.customerIsRead && (
                              <span className="px-2 py-0.5 text-[10px] font-black bg-amber-400 text-amber-950 rounded-full animate-bounce">
                                Nouveau
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400">{new Date(msg.createdAt).toLocaleDateString('fr-FR')}</div>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* INDEPENDENT CUSTOMER MARQUER COMME LU BUTTON */}
                          {!msg.customerIsRead ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => markSingleMessageAsReadForCustomer(msg.id)}
                              className="gap-1.5 font-bold text-xs bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-300 shadow-xs"
                              title="Marquer ce message comme lu sur votre compte client"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" />
                              <span>Marquer comme lu</span>
                            </Button>
                          ) : (
                            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Lu</span>
                            </span>
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedMessageId(isOpen ? null : msg.id)}
                            className="gap-1 font-semibold text-xs text-purple-700 border-purple-200 bg-purple-50/50 hover:bg-purple-100"
                          >
                            <Send className="w-3.5 h-3.5 text-purple-600" />
                            <span>{isOpen ? 'Fermer la discussion' : 'Répondre au Message'}</span>
                            {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </Button>
                        </div>
                      </div>

                      <div className="p-4 bg-purple-50/70 border border-purple-100 rounded-2xl text-xs text-purple-950 font-medium leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </div>

                      {msg.promoCode && (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
                          <div className="flex items-center gap-2 font-bold">
                            <Tag className="w-4 h-4 text-amber-600" />
                            <span>Code Promo Offert : <code className="font-mono text-sm bg-white px-2 py-0.5 rounded border border-amber-300">{msg.promoCode}</code></span>
                          </div>
                        </div>
                      )}

                      {/* DIRECT MESSAGE REPLIES THREAD */}
                      {msg.replies && msg.replies.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-slate-100">
                          <div className="text-[11px] font-bold text-slate-400 uppercase">Discussion avec l'administration :</div>
                          {msg.replies.map((r: any) => (
                            <div key={r.id} className={`p-3.5 rounded-2xl text-xs ${r.sender === 'CUSTOMER' ? 'bg-purple-100 text-purple-950 border border-purple-200 font-medium ml-4' : 'bg-slate-100 text-slate-900 border border-slate-200 mr-4'}`}>
                              <div className="font-bold text-[10px] text-purple-700 mb-1 flex justify-between">
                                <span>{r.sender === 'CUSTOMER' ? '👤 Vous (Client)' : '🛠️ Administration Solopreneur&Co'}</span>
                                <span className="text-slate-400 font-normal">{new Date(r.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <p className="whitespace-pre-wrap leading-relaxed">{r.message}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* CLIENT DIRECT MESSAGE REPLY FORM */}
                      {isOpen && (
                        <form onSubmit={(e) => handleSendMessageReply(msg.id, e)} className="pt-3 border-t border-slate-100 space-y-3">
                          <div className="text-xs font-bold text-slate-700">Votre réponse à ce message privé :</div>
                          <textarea
                            rows={3}
                            required
                            placeholder="Écrivez votre réponse..."
                            value={messageReplyText}
                            onChange={(e) => setMessageReplyText(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium text-slate-900"
                          />
                          <div className="flex justify-end">
                            <Button type="submit" disabled={sendingMessageReply} variant="primary" size="sm" className="font-bold btn-purple gap-1.5">
                              <Send className="w-3.5 h-3.5" />
                              <span>{sendingMessageReply ? 'Envoi...' : 'Envoyer ma réponse'}</span>
                            </Button>
                          </div>
                        </form>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
