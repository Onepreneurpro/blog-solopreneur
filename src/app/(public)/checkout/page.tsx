'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { CreditCard, ShieldCheck, Lock, ArrowRight, Sparkles, UserCheck, Download, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { isDarkTheme } from '@/lib/theme';

export const dynamic = 'force-dynamic';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const productId = searchParams ? searchParams.get('productId') : null;

  const [product, setProduct] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTheme, setActiveTheme] = useState<string>('pixel-funnel');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'PAYPAL' | 'DEMO' | 'FREE'>('DEMO');

  // Fake Demo card details
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvc, setCvc] = useState('123');

  useEffect(() => {
    // Fetch theme
    fetch('/api/admin/theme')
      .then((res) => res.json())
      .then((data) => {
        if (data.activeTheme) setActiveTheme(data.activeTheme);
      });

    // Fetch user
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setCurrentUser(data.user);
          setEmail(data.user.email);
          if (data.user.name) setFirstName(data.user.name);
        }
      });

    // Fetch product details
    if (!productId) {
      setLoading(false);
      return;
    }

    fetch(`/api/products/${productId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.product) {
          setProduct(data.product);
          if (data.product.isFreeResource || data.product.price === 0) {
            setPaymentMethod('FREE');
          }
        } else {
          setError('Produit non trouvé.');
        }
      })
      .catch(() => setError('Erreur de chargement du produit.'))
      .finally(() => setLoading(false));
  }, [productId]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    const finalEmail = currentUser ? currentUser.email : email;

    if (!finalEmail) {
      setError('Veuillez saisir votre adresse e-mail.');
      return;
    }

    setProcessing(true);
    setError('');

    const effectivePaymentMethod = (product.isFreeResource || product.price === 0) ? 'FREE' : paymentMethod;
    const combinedLeadName = `${firstName} ${lastName}`.trim();

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          email: finalEmail,
          firstName: currentUser ? currentUser.name : (combinedLeadName || firstName || lastName),
          paymentMethod: effectivePaymentMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Échec de la demande.');

      // Redirect to Confirmation Page
      router.push(`/checkout/confirmation?orderId=${data.orderId}&token=${data.downloadToken}`);
    } catch (err: any) {
      setError(err.message);
      setProcessing(false);
    }
  };

  const isDark = isDarkTheme(activeTheme);

  if (loading) {
    return <div className={`py-20 text-center font-medium ${isDark ? 'bg-[#0b0f19] text-slate-400' : 'bg-[#faf8ff] text-slate-500'}`}>Chargement de votre accès...</div>;
  }

  if (!product) {
    return (
      <div className={`py-20 text-center space-y-4 max-w-md mx-auto px-4 min-h-screen ${isDark ? 'bg-[#0b0f19] text-white' : 'bg-[#faf8ff] text-slate-900'}`}>
        <h1 className="text-2xl font-bold">Aucun produit sélectionné</h1>
        <p className="text-sm opacity-75">Veuillez choisir un produit dans notre boutique pour finaliser votre commande.</p>
        <Link href="/boutique">
          <Button variant="primary">Accéder à la boutique</Button>
        </Link>
      </div>
    );
  }

  const isFree = product.isFreeResource || product.price === 0;

  return (
    <div className={`py-12 min-h-screen transition-colors ${
      isDark ? 'bg-[#0b0f19] text-white' : 'bg-[#faf8ff] text-slate-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* HEADER */}
        <div className="text-center space-y-2">
          {isFree ? (
            <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black shadow-sm ${
              isDark ? 'bg-[#a3e635] text-slate-950' : 'bg-purple-700 text-white'
            }`}>
              <Gift className="w-3.5 h-3.5" />
              <span>Ressource 100% Gratuite (Aucun Paiement Requis)</span>
            </div>
          ) : (
            <div className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold ${
              isDark ? 'bg-[#a3e635]/20 text-[#a3e635] border border-[#a3e635]/30' : 'bg-purple-100 text-purple-900 border border-purple-200'
            }`}>
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Paiement Sécurisé SSL (Crypté 256 bits)</span>
            </div>
          )}

          <h1 className="text-3xl font-heading font-black tracking-tight">
            {isFree ? 'Accéder à votre ressource offerte' : 'Finaliser votre commande'}
          </h1>
        </div>

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-500 rounded-2xl text-xs font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: PRODUCT NAME, COVER IMAGE & FULL DETAILS (EN HAUT À GAUCHE) */}
          <div className="lg:col-span-7 space-y-6">

            <Card className={`p-6 sm:p-8 space-y-6 rounded-3xl shadow-xl ${
              isDark ? 'bg-[#0e1424]/90 border-2 border-white/15 text-white' : 'bg-white border-2 border-slate-200 text-slate-900'
            }`}>
              
              {/* RESOURCE TITLE & COVER IMAGE */}
              <div className="space-y-4 border-b pb-6 border-inherit">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${
                    isDark ? 'bg-[#a3e635] text-slate-950' : 'bg-purple-700 text-white'
                  }`}>
                    {isFree ? 'Ressource Offerte' : 'Produit Numérique'}
                  </span>
                  <span className="text-[10px] font-bold opacity-75">
                    Format : {product.fileType || 'PDF / Modèle Notion'}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-heading font-black leading-snug tracking-tight">
                  {product.name}
                </h2>

                {product.coverImage && (
                  <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden border border-slate-200 shadow-md">
                    <img
                      src={product.coverImage}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* SHORT & LONG DESCRIPTION */}
              <div className="space-y-4">
                <h3 className="text-xs font-heading font-black uppercase text-slate-400 tracking-wider">
                  ✨ Contenu & Détails de la ressource
                </h3>

                <div className="space-y-4 text-sm leading-relaxed font-medium">
                  {product.shortDescription ? (
                    <p className="text-base font-semibold opacity-90">{product.shortDescription}</p>
                  ) : (
                    <p className="text-base font-semibold opacity-90">Capturez l attention de vos lecteurs dès la première ligne de vos posts LinkedIn.</p>
                  )}

                  {product.longDescription && (
                    <div
                      className="pt-4 border-t border-inherit opacity-90 text-sm leading-relaxed space-y-3 [&_h3]:font-heading [&_h3]:font-black [&_h3]:text-base [&_h3]:mt-4 [&_h3]:mb-1 [&_p]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2 [&_li]:my-1.5"
                      dangerouslySetInnerHTML={{ __html: product.longDescription }}
                    />
                  )}
                </div>
              </div>

            </Card>

          </div>

          {/* RIGHT COLUMN: RÉCAPITULATIF EN HAUT, DESTINATAIRE JUSTE EN DESSOUS (À DROITE) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-8">
            
            {/* 1. RÉCAPITULATIF DE LA RESSOURCE (EN HAUT À DROITE) */}
            <Card className={`p-6 space-y-5 rounded-3xl shadow-xl ${
              isDark ? 'bg-[#0e1424] border-2 border-white/15 text-white' : 'bg-white border-2 border-purple-200 text-slate-900'
            }`}>
              <div className="flex items-center justify-between border-b pb-3 border-inherit">
                <h3 className="text-lg font-heading font-black">Récapitulatif de la ressource</h3>
                {isFree && (
                  <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                    isDark ? 'bg-[#a3e635] text-slate-950' : 'bg-purple-700 text-white'
                  }`}>
                    100% Offert
                  </span>
                )}
              </div>

              <div className="flex items-start gap-4">
                {product.coverImage ? (
                  <img
                    src={product.coverImage}
                    alt={product.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-200 flex-shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-purple-700 text-white flex items-center justify-center font-black flex-shrink-0">
                    <Download className="w-7 h-7" />
                  </div>
                )}
                <div>
                  <h4 className="font-heading font-black text-sm leading-snug">{product.name}</h4>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {isFree ? 'Ressource offerte (PDF / Modèle)' : `Format : ${product.fileType || 'DIGITAL'}`}
                  </p>
                </div>
              </div>

              <div className="space-y-2 border-t pt-4 border-inherit text-xs font-medium">
                <div className="flex justify-between">
                  <span className="opacity-75">Prix public</span>
                  <span className="line-through opacity-60">
                    {product.compareAtPrice ? `${product.compareAtPrice.toFixed(2)} €` : `${(product.price > 0 ? product.price * 1.5 : 19).toFixed(2)} €`}
                  </span>
                </div>

                <div className="flex justify-between items-center text-lg font-heading font-black pt-2 border-t border-inherit">
                  <span>Total</span>
                  <span className={isFree ? (isDark ? 'text-[#a3e635]' : 'text-purple-700') : ''}>
                    {isFree ? '0 € (Gratuit)' : `${product.price.toFixed(2)} €`}
                  </span>
                </div>
              </div>

              <div className={`p-3.5 rounded-2xl text-xs space-y-1 ${
                isDark ? 'bg-slate-950/80 text-slate-300 border border-white/10' : 'bg-purple-50 text-purple-950 border border-purple-200'
              }`}>
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#a3e635]" />
                  <span>Accès gratuit & direct sans CB</span>
                </div>
                <p className="text-[11px] opacity-80 leading-relaxed">
                  Aucune carte bancaire requise. Téléchargement ou accès instantané à la validation.
                </p>
              </div>
            </Card>

            {/* 2. DESTINATAIRE DE LA RESSOURCE (PLACÉ SOUS RÉCAPITULATIF À DROITE) */}
            <Card className={`p-6 space-y-5 rounded-3xl shadow-xl ${
              isDark ? 'bg-[#0e1424] border-2 border-white/15 text-white' : 'bg-white border-2 border-slate-200 text-slate-900'
            }`}>
              <div className="flex items-center justify-between border-b pb-3 border-inherit">
                <h3 className="text-base font-heading font-black">1. Destinataire de la ressource</h3>
                <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                  isDark ? 'bg-[#a3e635] text-slate-950' : 'bg-purple-700 text-white'
                }`}>
                  Accès Instantané
                </span>
              </div>

              {currentUser ? (
                <div className={`p-4 rounded-2xl flex items-center justify-between ${
                  isDark ? 'bg-slate-950 border border-white/10' : 'bg-purple-50/80 border border-purple-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm shadow-sm ${
                      isDark ? 'bg-[#a3e635] text-slate-950' : 'bg-purple-700 text-white'
                    }`}>
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-heading font-black text-sm flex items-center gap-1.5">
                        <span>Compte Client Connecté</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          isDark ? 'bg-[#a3e635] text-slate-950' : 'bg-amber-300 text-amber-950'
                        }`}>Automatique</span>
                      </div>
                      <p className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        {currentUser.name || 'Client'} (<code className="font-bold">{currentUser.email}</code>)
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  
                  {/* NOM & PRÉNOM */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Votre Prénom</label>
                      <input
                        type="text"
                        placeholder="ex. Alex"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none transition-all ${
                          isDark
                            ? 'bg-slate-950 border-2 border-white/10 text-white placeholder-slate-500 focus:border-[#a3e635]'
                            : 'bg-slate-50 border-2 border-slate-200 text-slate-900 focus:border-purple-600 focus:bg-white'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Votre Nom</label>
                      <input
                        type="text"
                        placeholder="ex. Morel"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none transition-all ${
                          isDark
                            ? 'bg-slate-950 border-2 border-white/10 text-white placeholder-slate-500 focus:border-[#a3e635]'
                            : 'bg-slate-50 border-2 border-slate-200 text-slate-900 focus:border-purple-600 focus:bg-white'
                        }`}
                      />
                    </div>
                  </div>

                  {/* EMAIL */}
                  <div>
                    <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Votre adresse e-mail *</label>
                    <input
                      type="email"
                      required
                      placeholder="votre.email@exemple.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none transition-all ${
                        isDark
                          ? 'bg-slate-950 border-2 border-white/10 text-white placeholder-slate-500 focus:border-[#a3e635]'
                          : 'bg-slate-50 border-2 border-slate-200 text-slate-900 focus:border-purple-600 focus:bg-white'
                      }`}
                    />
                    <p className={`text-[11px] mt-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      C est à cette adresse que le lien de téléchargement et d accès vous sera envoyé.
                    </p>
                  </div>

                </div>
              )}

              {/* PAYMENT METHOD (ONLY FOR PAID PRODUCTS) */}
              {!isFree && (
                <div className="space-y-3 pt-3 border-t border-inherit">
                  <h4 className="text-xs font-heading font-black">2. Mode de paiement</h4>
                  
                  <div
                    onClick={() => setPaymentMethod('DEMO')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'DEMO'
                        ? (isDark ? 'border-[#a3e635] bg-[#a3e635]/15 ring-2 ring-[#a3e635]/30' : 'border-purple-600 bg-purple-50/70 ring-2 ring-purple-500/20')
                        : (isDark ? 'border-white/10 bg-slate-950/60 hover:border-white/20' : 'border-slate-200 hover:border-slate-300')
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <input type="radio" checked={paymentMethod === 'DEMO'} readOnly className="text-purple-600" />
                        <div>
                          <div className="font-heading font-black text-xs flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-[#a3e635]" />
                            <span>Paiement Démo / Test</span>
                          </div>
                        </div>
                      </div>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                        isDark ? 'bg-[#a3e635] text-slate-950' : 'bg-amber-300 text-amber-950'
                      }`}>
                        Démo
                      </span>
                    </div>

                    {paymentMethod === 'DEMO' && (
                      <div className={`mt-3 pt-2 border-t space-y-2 text-xs ${isDark ? 'border-white/10' : 'border-purple-200/60'}`}>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="col-span-3">
                            <label className={`block text-[10px] font-bold mb-0.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Carte Test</label>
                            <input
                              type="text"
                              value={cardNumber}
                              onChange={(e) => setCardNumber(e.target.value)}
                              className={`w-full px-2.5 py-1.5 rounded font-mono text-xs font-bold ${
                                isDark ? 'bg-slate-950 border border-white/15 text-white' : 'bg-white border border-slate-200 text-slate-700'
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div
                    onClick={() => setPaymentMethod('CARD')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'CARD'
                        ? (isDark ? 'border-[#a3e635] bg-[#a3e635]/15 ring-2 ring-[#a3e635]/30' : 'border-purple-600 bg-purple-50/70 ring-2 ring-purple-500/20')
                        : (isDark ? 'border-white/10 bg-slate-950/60 hover:border-white/20' : 'border-slate-200 hover:border-slate-300')
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input type="radio" checked={paymentMethod === 'CARD'} readOnly className="text-purple-600" />
                      <div className="font-heading font-black text-xs flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-purple-500" />
                        <span>Carte Bancaire (Stripe)</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ACTION BUTTON */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={processing}
                  className={`w-full py-4 text-sm font-heading font-black rounded-2xl shadow-xl transition-all gap-2 ${
                    isDark
                      ? 'bg-[#a3e635] text-slate-950 hover:bg-[#86efac]'
                      : 'bg-purple-700 text-white hover:bg-purple-800'
                  }`}
                >
                  {processing ? (
                    <span>Validation en cours...</span>
                  ) : isFree ? (
                    <>
                      <Gift className="w-4 h-4" />
                      <span>Obtenir mon accès gratuit immédiat</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Payer & Valider ({product.price.toFixed(2)} €)</span>
                    </>
                  )}
                </Button>
              </div>
            </Card>

          </div>

        </form>

      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center font-medium">Chargement...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
