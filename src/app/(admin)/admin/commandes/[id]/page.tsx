'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  ShoppingBag,
  User,
  Mail,
  CreditCard,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Ban,
  Trash2,
  Sparkles,
  Calendar,
  ExternalLink,
  ShieldCheck,
  Send,
  X,
  Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  // Private Message Modal State
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactPromoCode, setContactPromoCode] = useState('');
  const [sendingContact, setSendingContact] = useState(false);

  const fetchOrder = () => {
    setLoading(true);
    fetch(`/api/admin/commandes/${orderId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setOrder(data.order);
          setContactSubject(`Information concernant votre commande ${data.order?.orderNumber}`);
          setContactMessage(`Bonjour ${data.order?.customer?.name || 'Client'},\n\nNous vous contactons concernant votre commande ${data.order?.orderNumber}...\n\nCordialement,\nL équipe Solopreneur&Co`);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (orderId) fetchOrder();
  }, [orderId]);

  // Handle Send Private Message directly from Order Detail Page
  const handleSendContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    setSendingContact(true);

    try {
      const res = await fetch('/api/admin/crm/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: order.customerEmail,
          subject: contactSubject,
          message: contactMessage,
          promoCode: contactPromoCode,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de l envoi.');

      alert(data.message || 'Message privé envoyé avec succès et enregistré dans l historique CRM !');
      setShowContactModal(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSendingContact(false);
    }
  };

  // Update Status
  const handleUpdateStatus = async (newStatus: string, addStoreCredit = false) => {
    if (!confirm(`Confirmer le passage de la commande au statut "${newStatus}" ?`)) return;

    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/commandes/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, addStoreCredit }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la mise à jour.');

      alert('Statut de la commande mis à jour !');
      fetchOrder();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  // Delete Order
  const handleDeleteOrder = async () => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer définitivement la commande ${order?.orderNumber} ?`)) return;

    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/commandes/${orderId}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur de suppression.');

      alert('Commande supprimée.');
      router.push('/admin/commandes');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-500 font-medium">
        Chargement des détails de la commande...
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="py-16 text-center space-y-4">
        <p className="text-red-600 font-bold">{error || 'Commande introuvable.'}</p>
        <Link href="/admin/commandes">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" /> Retour aux commandes
          </Button>
        </Link>
      </div>
    );
  }

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-900 font-extrabold text-xs rounded-full border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Paiement Réussi (COMPLETED)</span>
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-900 font-extrabold text-xs rounded-full border border-amber-300">
            <span>En attente (PENDING)</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-900 font-extrabold text-xs rounded-full border border-red-300">
            <XCircle className="w-3.5 h-3.5 text-red-600" />
            <span>Commande Annulée (CANCELLED)</span>
          </span>
        );
      case 'REFUNDED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-950 font-extrabold text-xs rounded-full border border-purple-300">
            <RotateCcw className="w-3.5 h-3.5 text-purple-700" />
            <span>Commande Remboursée (REFUNDED)</span>
          </span>
        );
      default:
        return <Badge variant="slate">{st}</Badge>;
    }
  };

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto">
      
      {/* NAVIGATION & TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link href="/admin/commandes" className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-purple-700 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Retour à la liste des commandes</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-7 h-7 text-purple-600 flex-shrink-0" />
            <span>Commande N° {order.orderNumber}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Passée le {new Date(order.createdAt).toLocaleString('fr-FR')}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {getStatusBadge(order.status)}
        </div>
      </div>

      {/* GRID CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: ORDER ITEMS & DETAILS (8 COLS) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* ITEMS LIST CARD */}
          <Card className="p-6 bg-white border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-purple-600" />
              <span>Articles commandés ({order.items.length})</span>
            </h2>

            <div className="divide-y divide-slate-100">
              {order.items.map((item: any) => (
                <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {item.product?.coverImage ? (
                      <div className="relative w-14 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                        <Image src={item.product.coverImage} alt={item.title} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-14 h-10 rounded-lg bg-purple-50 text-purple-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                        PNG
                      </div>
                    )}
                    <div>
                      <div className="font-extrabold text-slate-900 text-sm">{item.title}</div>
                      {item.product?.category && (
                        <div className="text-xs text-purple-700 font-bold">{item.product.category.name}</div>
                      )}
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="font-black text-slate-900 text-base">{item.price} €</div>
                    {item.product?.slug && (
                      <Link href={`/boutique/${item.product.slug}`} target="_blank" className="text-[11px] font-bold text-purple-700 hover:underline inline-flex items-center gap-0.5">
                        <span>Voir produit</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* TOTAL CALCULATION SUMMARY */}
            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Sous-total HT</span>
                <span className="font-bold">{order.totalAmount} €</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>TVA (0% Franchise de TVA)</span>
                <span className="font-bold">0 €</span>
              </div>
              <div className="flex justify-between text-slate-900 text-base font-extrabold pt-2 border-t border-slate-200">
                <span>Total réglé</span>
                <span className="text-purple-700 font-black">{order.totalAmount} €</span>
              </div>
            </div>
          </Card>

          {/* PAYMENT TRANSACTION STATUS CARD */}
          <Card className="p-6 bg-white border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>Statut du Paiement & Transaction</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-slate-400 font-semibold block">Résultat de la Transaction</span>
                <div className="font-extrabold text-sm text-slate-900">
                  {order.status === 'COMPLETED' ? (
                    <span className="text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Paiement Réussi & Validé
                    </span>
                  ) : order.status === 'REFUNDED' ? (
                    <span className="text-purple-700 flex items-center gap-1">
                      <RotateCcw className="w-4 h-4 text-purple-700" /> Transaction Remboursée
                    </span>
                  ) : order.status === 'CANCELLED' ? (
                    <span className="text-red-700 flex items-center gap-1">
                      <XCircle className="w-4 h-4 text-red-600" /> Transaction Annulée
                    </span>
                  ) : (
                    <span className="text-amber-700">En attente de paiement</span>
                  )}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-slate-400 font-semibold block">Moyen de Paiement</span>
                <div className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>Stripe / Carte Bancaire Sécurisée</span>
                </div>
              </div>
            </div>

            {order.paymentIntentId && (
              <div className="text-xs text-slate-500 font-mono bg-slate-100 p-2.5 rounded-lg border border-slate-200">
                ID Transaction Stripe : <span className="font-bold text-slate-800">{order.paymentIntentId}</span>
              </div>
            )}
          </Card>

        </div>

        {/* RIGHT COLUMN: CUSTOMER INFO & ACTIONS (4 COLS) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* CUSTOMER CARD */}
          <Card className="p-6 bg-white border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-purple-600" />
              <span>Informations Client</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block">Nom du Client</span>
                <span className="font-extrabold text-slate-900 text-sm">{order.customer?.name || 'Client Inconnu'}</span>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block">Adresse E-mail</span>
                <span className="font-bold text-purple-700 text-xs">{order.customerEmail}</span>
              </div>

              {order.customer?.storeCredit !== undefined && (
                <div>
                  <span className="text-slate-400 font-semibold block">Solde d Avoir Client</span>
                  <span className="font-extrabold text-emerald-700 text-xs">{order.customer.storeCredit} €</span>
                </div>
              )}
            </div>

            {/* DIRECT CTA BUTTON: OPENS IN-PLACE MESSAGE POPUP */}
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowContactModal(true)}
                className="w-full font-bold gap-2 text-xs text-purple-900 border-purple-200 bg-purple-50 hover:bg-purple-100"
              >
                <Mail className="w-4 h-4 text-purple-700" />
                <span>Contacter par message privé</span>
              </Button>
            </div>
          </Card>

          {/* ADMIN ORDER ACTIONS CARD */}
          <Card className="p-6 bg-white border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Actions Administrateur</span>
            </h2>

            <div className="space-y-2.5">
              
              {/* ACTION 1: CANCEL ORDER */}
              {order.status !== 'CANCELLED' && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={updating}
                  onClick={() => handleUpdateStatus('CANCELLED')}
                  className="w-full justify-start font-bold text-xs text-red-700 border-red-200 bg-red-50/50 hover:bg-red-100 gap-2"
                >
                  <Ban className="w-4 h-4 text-red-600" />
                  <span>Annuler la commande</span>
                </Button>
              )}

              {/* ACTION 2: REFUND ORDER WITH STORE CREDIT */}
              {order.status !== 'REFUNDED' && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={updating}
                  onClick={() => handleUpdateStatus('REFUNDED', true)}
                  className="w-full justify-start font-bold text-xs text-purple-900 border-purple-200 bg-purple-50 hover:bg-purple-100 gap-2"
                >
                  <RotateCcw className="w-4 h-4 text-purple-700" />
                  <span>Rembourser (+ créditer avoir client)</span>
                </Button>
              )}

              {/* ACTION 3: MARK COMPLETED */}
              {order.status !== 'COMPLETED' && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={updating}
                  onClick={() => handleUpdateStatus('COMPLETED')}
                  className="w-full justify-start font-bold text-xs text-emerald-800 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Marquer comme Réussie (COMPLETED)</span>
                </Button>
              )}

              {/* ACTION 4: DELETE ORDER */}
              <div className="pt-2 border-t border-slate-100">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={updating}
                  onClick={handleDeleteOrder}
                  className="w-full justify-start font-bold text-xs text-red-600 hover:bg-red-50 gap-2"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                  <span>Supprimer définitivement la commande</span>
                </Button>
              </div>

            </div>
          </Card>

        </div>

      </div>

      {/* POPUP MODAL: CONTACT CLIENT PRIVATE MESSAGE */}
      {showContactModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="p-6 bg-white max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-purple-600" />
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    Envoyer un message privé
                  </h2>
                  <p className="text-[11px] text-slate-400">Enregistré directement dans le CRM client</p>
                </div>
              </div>

              <button onClick={() => setShowContactModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendContact} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Destinataire</label>
                <input
                  type="text"
                  disabled
                  value={`${order.customer?.name || 'Client'} (${order.customerEmail})`}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Sujet du Message Privé *</label>
                <input
                  type="text"
                  required
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
                  rows={5}
                  required
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowContactModal(false)}>
                  Annuler
                </Button>

                <Button type="submit" variant="primary" size="sm" disabled={sendingContact} className="font-bold bg-purple-700 hover:bg-purple-800 text-white gap-1.5 text-xs">
                  <Send className="w-4 h-4" />
                  <span>{sendingContact ? 'Envoi en cours...' : 'Envoyer le message'}</span>
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

    </div>
  );
}
