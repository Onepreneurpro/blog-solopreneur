'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { CreditCard, ShieldCheck, Lock, ArrowRight, Sparkles, UserCheck, Download, Gift, CheckCircle2, Clock, Zap, Star } from 'lucide-react';
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

  const productGallery: string[] = React.useMemo(() => {
    if (!product) return [];
    let gallery: string[] = [];
    if (product.images) {
      try {
        const parsed = JSON.parse(product.images);
        if (Array.isArray(parsed) && parsed.length > 0) gallery = parsed;
      } catch {
        if (typeof product.images === 'string' && product.images) gallery = [product.images];
      }
    }
    if (product.coverImage) {
      const rest = gallery.filter((img) => img !== product.coverImage);
      return [product.coverImage, ...rest];
    }
    return gallery;
  }, [product]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const activeCover = productGallery[activeImageIndex] || product?.coverImage;

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
          
          {/* LEFT COLUMN: PRODUCT NAME, COVER IMAGE & FULL DETAILS (EN HAUT À GAUCHE - 8 COLONNES) */}
          <div className="lg:col-span-8 space-y-6">

            <Card className={`p-6 sm:p-9 space-y-7 rounded-3xl shadow-xl ${
              isDark ? 'bg-[#0e1424]/90 border-2 border-white/15 text-white' : 'bg-white border-2 border-slate-200 text-slate-900'
            }`}>
              
              {/* RESOURCE TITLE & COVER IMAGE */}
              <div className="space-y-5 border-b pb-6 border-slate-100 dark:border-white/10">
                <div className="flex items-center gap-2.5">
                  <span className={`text-[11px] font-black uppercase px-3 py-1 rounded-full ${
                    isDark ? 'bg-[#a3e635] text-slate-950' : 'bg-purple-700 text-white'
                  }`}>
                    {isFree ? 'Ressource Offerte' : 'Produit Numérique'}
                  </span>
                  <span className="text-xs font-bold opacity-75">
                    Format : {product.fileType || 'PDF / Modèle Notion'}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-4xl font-heading font-black leading-snug tracking-tight">
                  {product.name}
                </h2>

                {/* PRODUCT COVER IMAGE OR MULTI-IMAGE GALLERY */}
                {productGallery.length > 0 ? (
                  <div className="space-y-3">
                    <div className="relative w-full h-72 sm:h-96 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-lg group">
                      <img
                        src={activeCover}
                        alt={product.name}
                        className="w-full h-full object-cover transition-all duration-300"
                      />
                      {productGallery.length > 1 && (
                        <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-full border border-white/20">
                          Visuel {activeImageIndex + 1} sur {productGallery.length}
                        </div>
                      )}
                    </div>

                    {/* THUMBNAILS GALLERY ROW */}
                    {productGallery.length > 1 && (
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 pt-1">
                        {productGallery.map((imgUrl, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setActiveImageIndex(idx)}
                            className={`relative h-16 sm:h-20 rounded-xl overflow-hidden border-2 transition-all ${
                              activeImageIndex === idx
                                ? 'border-[#a3e635] ring-2 ring-[#a3e635]/50 scale-[1.03]'
                                : 'border-slate-200 dark:border-white/10 opacity-70 hover:opacity-100'
                            }`}
                          >
                            <img src={imgUrl} alt={`Aperçu ${idx + 1}`} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-900/50 via-purple-950 to-slate-950 border border-purple-500/20 shadow-xl flex flex-col items-center justify-center p-8 text-center space-y-4">
                    <div className="w-20 h-20 rounded-3xl bg-purple-600/30 border border-purple-400/30 flex items-center justify-center shadow-2xl backdrop-blur-md">
                      <Sparkles className="w-10 h-10 text-[#a3e635]" />
                    </div>
                    <div className="space-y-1.5 max-w-md">
                      <div className="text-xs font-black uppercase tracking-widest text-[#a3e635]">Aperçu de la ressource offerte</div>
                      <h3 className="text-xl sm:text-2xl font-heading font-black text-white">{product.name}</h3>
                      <p className="text-xs sm:text-sm text-slate-300">Format digital immédiatement prêt à l emploi (PDF & Modèle Notion).</p>
                    </div>
                  </div>
                )}
              </div>

              {/* SHORT & LONG DESCRIPTION */}
              <div className="space-y-5">
                <h3 className="text-xs font-heading font-black uppercase text-purple-600 dark:text-[#a3e635] tracking-widest flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Contenu & Détails de la ressource</span>
                </h3>

                <div className="space-y-5 text-base leading-relaxed font-medium">
                  {product.shortDescription ? (
                    <p className="text-base sm:text-lg font-semibold leading-relaxed opacity-95">{product.shortDescription}</p>
                  ) : (
                    <p className="text-base sm:text-lg font-semibold leading-relaxed opacity-95">Capturez l attention de vos lecteurs dès la première ligne de vos posts LinkedIn.</p>
                  )}

                  {product.longDescription && (
                    <div
                      className="pt-5 border-t border-slate-100 dark:border-white/10 opacity-95 text-sm sm:text-base leading-relaxed space-y-4 [&_h3]:font-heading [&_h3]:font-black [&_h3]:text-lg [&_h3]:mt-5 [&_h3]:mb-2 [&_p]:my-2.5 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-3 [&_li]:my-2"
                      dangerouslySetInnerHTML={{ __html: product.longDescription }}
                    />
                  )}
                </div>
              </div>

            </Card>

          </div>

          {/* RIGHT COLUMN: SINGLE MERGED CARD (DISCREET DIVIDERS & HIGH IMPACT CTA) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
            <Card className={`p-5 sm:p-6 space-y-4.5 rounded-3xl shadow-xl ${
              isDark ? 'bg-[#0e1424] border-2 border-white/15 text-white' : 'bg-white border-2 border-purple-200 text-slate-900'
            }`}>
              
              {/* SECTION 1: RÉCAPITULATIF DE LA RESSOURCE */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b pb-2 border-slate-100 dark:border-white/5">
                  <h3 className="text-sm font-heading font-black">Récapitulatif</h3>
                  {isFree && (
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                      isDark ? 'bg-[#a3e635] text-slate-950' : 'bg-purple-700 text-white'
                    }`}>
                      100% Offert
                    </span>
                  )}
                </div>

                <div className="flex items-start gap-3">
                  {product.coverImage ? (
                    <img
                      src={product.coverImage}
                      alt={product.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-purple-700 text-white flex items-center justify-center font-black flex-shrink-0 shadow-sm">
                      <Download className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-heading font-black text-xs leading-snug">{product.name}</h4>
                    <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {isFree ? 'Ressource offerte (PDF / Modèle)' : `Format : ${product.fileType || 'DIGITAL'}`}
                    </p>
                  </div>
                </div>

                <div className="space-y-1 text-xs font-medium pt-1">
                  <div className="flex justify-between">
                    <span className="opacity-75">Prix public</span>
                    <span className="line-through opacity-60">
                      {product.compareAtPrice ? `${product.compareAtPrice.toFixed(2)} €` : `${(product.price > 0 ? product.price * 1.5 : 19).toFixed(2)} €`}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-base font-heading font-black pt-1">
                    <span>Total</span>
                    <span className={isFree ? (isDark ? 'text-[#a3e635]' : 'text-purple-700') : ''}>
                      {isFree ? '0 € (Gratuit)' : `${product.price.toFixed(2)} €`}
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION 2: 1. DESTINATAIRE DE LA RESSOURCE */}
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-white/5">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-heading font-black uppercase text-slate-400 tracking-wider">1. Destinataire</h3>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                    isDark ? 'bg-[#a3e635]/20 text-[#a3e635]' : 'bg-purple-100 text-purple-900'
                  }`}>
                    Accès Instantané
                  </span>
                </div>

                {currentUser ? (
                  <div className={`p-3 rounded-2xl flex items-center justify-between ${
                    isDark ? 'bg-slate-950 border border-white/10' : 'bg-purple-50/80 border border-purple-200'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs shadow-sm ${
                        isDark ? 'bg-[#a3e635] text-slate-950' : 'bg-purple-700 text-white'
                      }`}>
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-heading font-black text-xs flex items-center gap-1">
                          <span>Compte Connecté</span>
                        </div>
                        <p className={`text-[11px] font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                          {currentUser.name || 'Client'} (<code className="font-bold">{currentUser.email}</code>)
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    
                    {/* NOM & PRÉNOM */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className={`block text-[11px] font-bold mb-0.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Votre Prénom</label>
                        <input
                          type="text"
                          placeholder="ex. Alex"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className={`w-full px-3 py-2 rounded-xl text-xs font-medium focus:outline-none transition-all ${
                            isDark
                              ? 'bg-slate-950 border border-white/10 text-white placeholder-slate-500 focus:border-[#a3e635]'
                              : 'bg-slate-50 border border-slate-200 text-slate-900 focus:border-purple-600 focus:bg-white'
                          }`}
                        />
                      </div>

                      <div>
                        <label className={`block text-[11px] font-bold mb-0.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Votre Nom</label>
                        <input
                          type="text"
                          placeholder="ex. Morel"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className={`w-full px-3 py-2 rounded-xl text-xs font-medium focus:outline-none transition-all ${
                            isDark
                              ? 'bg-slate-950 border border-white/10 text-white placeholder-slate-500 focus:border-[#a3e635]'
                              : 'bg-slate-50 border border-slate-200 text-slate-900 focus:border-purple-600 focus:bg-white'
                          }`}
                        />
                      </div>
                    </div>

                    {/* EMAIL */}
                    <div>
                      <label className={`block text-[11px] font-bold mb-0.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Votre e-mail *</label>
                      <input
                        type="email"
                        required
                        placeholder="votre.email@exemple.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl text-xs font-medium focus:outline-none transition-all ${
                          isDark
                            ? 'bg-slate-950 border border-white/10 text-white placeholder-slate-500 focus:border-[#a3e635]'
                            : 'bg-slate-50 border border-slate-200 text-slate-900 focus:border-purple-600 focus:bg-white'
                        }`}
                      />
                    </div>

                  </div>
                )}

                {/* PAYMENT METHOD (ONLY FOR PAID PRODUCTS) */}
                {!isFree && (
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/5">
                    <h4 className="text-xs font-heading font-black">2. Mode de paiement</h4>
                    
                    <div
                      onClick={() => setPaymentMethod('DEMO')}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                        paymentMethod === 'DEMO'
                          ? (isDark ? 'border-[#a3e635] bg-[#a3e635]/15' : 'border-purple-600 bg-purple-50/70')
                          : (isDark ? 'border-white/10 bg-slate-950/60' : 'border-slate-200')
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <input type="radio" checked={paymentMethod === 'DEMO'} readOnly className="text-purple-600" />
                          <span className="font-heading font-black text-xs flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-[#a3e635]" />
                            <span>Paiement Démo / Test</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div
                      onClick={() => setPaymentMethod('CARD')}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                        paymentMethod === 'CARD'
                          ? (isDark ? 'border-[#a3e635] bg-[#a3e635]/15' : 'border-purple-600 bg-purple-50/70')
                          : (isDark ? 'border-white/10 bg-slate-950/60' : 'border-slate-200')
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input type="radio" checked={paymentMethod === 'CARD'} readOnly className="text-purple-600" />
                        <span className="font-heading font-black text-xs flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-purple-500" />
                          <span>Carte Bancaire (Stripe)</span>
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* HIGH IMPACT CTA BUTTON (BIGGER TEXT, TIGHT PADDING) */}
                <div className="pt-1">
                  <Button
                    type="submit"
                    disabled={processing}
                    className={`w-full py-2.5 px-3 text-base sm:text-lg font-heading font-black tracking-tight rounded-xl shadow-xl transition-all gap-2 ${
                      isDark
                        ? 'bg-[#a3e635] text-slate-950 hover:bg-[#86efac]'
                        : 'bg-purple-700 text-white hover:bg-purple-800'
                    }`}
                  >
                    {processing ? (
                      <span>Validation...</span>
                    ) : isFree ? (
                      <>
                        <Gift className="w-5 h-5 shrink-0" />
                        <span>Obtenir mon accès gratuit</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5 shrink-0" />
                        <span>Payer ({product.price.toFixed(2)} €)</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* SECTION 4: BÉNÉFICES & CONCEPTS INCLUS AVEC LA RESSOURCE */}
              <div className={`mt-4 p-4 rounded-2xl space-y-3 pt-4 border-t ${
                isDark ? 'bg-slate-950/60 border-white/10 text-slate-200' : 'bg-slate-50/80 border-slate-200 text-slate-800'
              }`}>
                <h4 className="text-[11px] font-heading font-black uppercase text-purple-600 dark:text-[#a3e635] tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Inclus avec votre ressource</span>
                </h4>

                <ul className="space-y-2 text-xs font-medium leading-relaxed">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#a3e635] shrink-0 mt-0.5" />
                    <span><strong>Accès direct & illimité</strong> : Téléchargement instantané au format PDF & Modèle dupliquable.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                    <span><strong>100% Prêt à l emploi</strong> : Méthode clé en main pensée pour les solopreneurs & freelances.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span><strong>Mises à jour à vie</strong> : Accès garanti aux futures versions enrichies.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Star className="w-4 h-4 text-[#a3e635] shrink-0 mt-0.5" />
                    <span><strong>Sans abonnement ni CB</strong> : Téléchargement totalement gratuit et sécurisé.</span>
                  </li>
                </ul>
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
