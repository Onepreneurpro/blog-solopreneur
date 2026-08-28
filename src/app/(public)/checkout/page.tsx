'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { CreditCard, ShieldCheck, Lock, ArrowRight, ArrowUpRight, Sparkles, UserCheck, Download, Gift, CheckCircle2, Clock, Zap, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { isDarkTheme } from '@/lib/theme';
import { getFileTypeLabel } from '@/lib/product-formats';

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

  // Form Fields for guest checkout
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

  // Email Verification Code State
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [infoMsg, setInfoMsg] = useState('');

  // Payment Method State
  const [paymentMethod, setPaymentMethod] = useState<'DEMO' | 'CARD'>('DEMO');

  // Multi-Image Gallery State
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Recommended Products State
  const [recommendedProducts, setRecommendedProducts] = useState<any[]>([]);

  useEffect(() => {
    async function initCheckout() {
      try {
        setLoading(true);

        // Fetch User Session
        try {
          const userRes = await fetch('/api/auth/me');
          if (userRes.ok) {
            const userData = await userRes.json();
            if (userData.user) {
              setCurrentUser(userData.user);
              setEmail(userData.user.email || '');
              if (userData.user.name) {
                const parts = userData.user.name.split(' ');
                setFirstName(parts[0] || '');
                setLastName(parts.slice(1).join(' ') || '');
              }
            }
          }
        } catch {
          // Guest mode fallback
        }

        // Fetch Active Theme
        try {
          const themeRes = await fetch('/api/theme');
          if (themeRes.ok) {
            const themeData = await themeRes.json();
            if (themeData.theme) setActiveTheme(themeData.theme);
          }
        } catch {
          // Keep default theme
        }

        // Fetch Recommended Products
        try {
          const recRes = await fetch('/api/products');
          if (recRes.ok) {
            const recData = await recRes.json();
            if (recData.products) setRecommendedProducts(recData.products);
          }
        } catch {
          // Ignore fallback
        }

        // Fetch Product Details
        if (productId) {
          const prodRes = await fetch(`/api/products/${productId}`);
          if (prodRes.ok) {
            const prodData = await prodRes.json();
            if (prodData.product) {
              setProduct(prodData.product);
            } else {
              setError('Produit non trouvé.');
            }
          } else {
            setError('Impossible de charger le produit.');
          }
        } else {
          setError('Aucun produit spécifié.');
        }
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement.');
      } finally {
        setLoading(false);
      }
    }

    initCheckout();
  }, [productId]);

  const handleSendVerificationCode = async () => {
    if (!email || !email.includes('@')) {
      setError('Veuillez remplir une adresse e-mail valide.');
      return false;
    }
    if (!firstName || firstName.trim() === '') {
      setError('Veuillez remplir votre prénom.');
      return false;
    }

    setSendingCode(true);
    setError('');
    setInfoMsg('');

    try {
      const res = await fetch('/api/leads/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), firstName }),
      });

      const data = await res.json();
      if (res.ok) {
        setCodeSent(true);
        setInfoMsg(`📩 Un code de confirmation à 4 chiffres a été envoyé à ${email}.`);
        return true;
      } else {
        setError(data.error || 'Erreur lors de l envoi du code de vérification par e-mail.');
        return false;
      }
    } catch (err) {
      console.error('Error sending verification code:', err);
      setError('Erreur réseau lors de l envoi du code. Veuillez réessayer.');
      return false;
    } finally {
      setSendingCode(false);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    const isSessionVerified = Boolean(currentUser && currentUser.email?.toLowerCase() === email.trim().toLowerCase());

    // STEP 1: UNAUTHENTICATED OR NEW EMAIL -> SEND CODE FIRST IF NOT SENT
    if (!isSessionVerified && !codeSent) {
      await handleSendVerificationCode();
      return;
    }

    // STEP 2: IF CODE HAS BEEN SENT, ENSURE CODE IS FILLED
    if (!isSessionVerified && codeSent) {
      if (!verificationCode || verificationCode.trim().length !== 4) {
        setError('Veuillez saisir le code de vérification à 4 chiffres reçu par e-mail.');
        return;
      }
    }

    setProcessing(true);
    setError('');

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          email: email.trim().toLowerCase(),
          firstName,
          lastName,
          paymentMethod: product.isFreeResource ? 'FREE' : paymentMethod,
          code: isSessionVerified ? undefined : verificationCode.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la validation.');

      if (data.redirectUrl) {
        router.push(data.redirectUrl);
      } else if (data.downloadUrl) {
        router.push(data.downloadUrl);
      } else if (data.orderId) {
        router.push(`/checkout/confirmation?orderId=${data.orderId}`);
      } else {
        router.push('/compte');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la commande.');
      setProcessing(false);
    }
  };

  const isDark = isDarkTheme(activeTheme);
  const isBluSky = activeTheme === 'blusky';

  if (loading) {
    return (
      <div className={`min-h-screen py-24 flex items-center justify-center ${isDark ? 'bg-[#0a0915] text-white' : 'bg-[#faf8f5] text-slate-900'}`}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-heading font-bold text-sm">Chargement de votre commande...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={`min-h-screen py-24 flex items-center justify-center px-4 ${isDark ? 'bg-[#0a0915] text-white' : 'bg-[#faf8f5] text-slate-900'}`}>
        <Card className="max-w-md w-full p-8 text-center space-y-4 rounded-md shadow-xl border">
          <h2 className="text-xl font-heading font-black">Produit introuvable</h2>
          <p className="text-sm opacity-75">{error || "La ressource demandée n'existe pas ou n'est plus disponible."}</p>
          <Link href="/boutique">
            <Button className="w-full font-heading font-bold rounded-md">Retour à la boutique</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const isFree = product.isFreeResource || product.price === 0;

  // Prepare product gallery with coverImage prioritized at index 0
  let rawImages: string[] = [];
  if (product.images) {
    try {
      rawImages = JSON.parse(product.images);
    } catch {
      rawImages = [product.images];
    }
  }

  if (product.coverImage) {
    rawImages = [product.coverImage, ...rawImages.filter((img) => img !== product.coverImage)];
  }

  const productGallery = rawImages.length > 0 ? rawImages : (product.coverImage ? [product.coverImage] : []);
  const activeCover = productGallery[activeImageIndex] || product.coverImage;

  return (
    <div className={`py-10 sm:py-14 min-h-screen relative overflow-hidden font-sans ${
      isDark ? 'bg-[#050811] text-white' : 'bg-[#faf8f5] text-slate-900'
    }`}>
      
      {/* AMBIENT LIGHTING GLOWS */}
      {isDark && (
        <>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-[180px] pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-96 h-96 bg-[#a3e635]/10 rounded-full blur-[180px] pointer-events-none" />
        </>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* TOP REASSURANCE BANNER */}
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-b pb-5 border-slate-200 dark:border-white/10">
          {isFree ? (
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-bold ${
              isDark
                ? 'bg-[#a3e635]/20 text-[#a3e635] border border-[#a3e635]/30'
                : (isBluSky ? 'bg-[#e0f2fe] text-[#00A0FF] border border-[#00A0FF]/30' : 'bg-purple-100 text-purple-900 border border-purple-200')
            }`}>
              <Gift className="w-3.5 h-3.5" />
              <span>Ressource 100% Gratuite (Aucun Paiement Requis)</span>
            </div>
          ) : (
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-bold ${
              isDark
                ? 'bg-[#a3e635]/20 text-[#a3e635] border border-[#a3e635]/30'
                : (isBluSky ? 'bg-[#e0f2fe] text-[#00A0FF] border border-[#00A0FF]/30' : 'bg-purple-100 text-purple-900 border border-purple-200')
            }`}>
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Paiement Sécurisé SSL (Crypté 256 bits)</span>
            </div>
          )}

          <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight">
            {isFree ? 'Accéder à votre ressource offerte' : 'Finaliser votre commande'}
          </h1>
        </div>

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-500 rounded-md text-xs font-bold text-center mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: PRODUCT COVER IMAGE & FULL DETAILS */}
          <div className="lg:col-span-8 space-y-6">

            <Card className={`p-5 sm:p-7 space-y-6 rounded-md shadow-xl ${
              isDark ? 'bg-[#0e1424] border border-white/15 text-white' : 'bg-white border border-slate-200 text-slate-900'
            }`}>
              
              {/* RESOURCE TITLE & COVER IMAGE */}
              <div className="space-y-4 border-b pb-5 border-slate-100 dark:border-white/10">
                <div className="flex items-center gap-2.5">
                  <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-sm ${
                    isDark
                      ? 'bg-[#a3e635] text-slate-950'
                      : (isBluSky ? 'bg-[#00A0FF] text-white' : 'bg-purple-700 text-white')
                  }`}>
                    {isFree ? 'Ressource Offerte' : 'Produit Numérique'}
                  </span>
                  <span className="text-xs font-bold opacity-75">
                    Format : {getFileTypeLabel(product.fileType)}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-heading font-black leading-snug tracking-tight">
                  {product.name}
                </h2>

                {/* PRODUCT COVER IMAGE OR MULTI-IMAGE GALLERY */}
                {productGallery.length > 0 ? (
                  <div className="space-y-2.5">
                    <div className="relative w-full h-72 sm:h-96 rounded-md overflow-hidden border border-slate-200 dark:border-white/10 shadow-lg group">
                      <img
                        src={activeCover}
                        alt={product.name}
                        className="w-full h-full object-cover transition-all duration-300"
                      />
                      {productGallery.length > 1 && (
                        <div className="absolute bottom-3 right-3 bg-black/85 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-sm border border-white/20">
                          Visuel {activeImageIndex + 1} sur {productGallery.length}
                        </div>
                      )}
                    </div>

                    {/* THUMBNAILS FILMSTRIP CAROUSEL */}
                    {productGallery.length > 1 && (
                      <div className="relative pt-1 flex items-center group/carousel">
                        {/* LEFT SCROLL ARROW */}
                        <button
                          type="button"
                          onClick={() => {
                            const el = document.getElementById('thumbnail-filmstrip');
                            if (el) el.scrollBy({ left: -220, behavior: 'smooth' });
                          }}
                          className="absolute left-1 z-10 p-2 rounded-md bg-slate-950/85 text-white border border-white/20 shadow-xl opacity-90 hover:opacity-100 transition-all hover:scale-105 active:scale-95"
                          title="Miniatures précédentes"
                        >
                          <ChevronLeft className="w-4 h-4 text-[#a3e635]" />
                        </button>

                        {/* HORIZONTAL SINGLE-ROW SCROLL CONTAINER */}
                        <div
                          id="thumbnail-filmstrip"
                          className="flex flex-nowrap gap-2 overflow-x-auto scrollbar-none py-1 px-8 scroll-smooth w-full"
                        >
                          {productGallery.map((imgUrl, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setActiveImageIndex(idx)}
                              className={`relative h-16 sm:h-20 w-24 sm:w-28 shrink-0 rounded-md overflow-hidden border-2 transition-all ${
                                activeImageIndex === idx
                                  ? 'border-[#a3e635] ring-2 ring-[#a3e635]/50 scale-[1.02]'
                                  : 'border-slate-200 dark:border-white/10 opacity-70 hover:opacity-100'
                              }`}
                            >
                              <img src={imgUrl} alt={`Aperçu ${idx + 1}`} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>

                        {/* RIGHT SCROLL ARROW */}
                        <button
                          type="button"
                          onClick={() => {
                            const el = document.getElementById('thumbnail-filmstrip');
                            if (el) el.scrollBy({ left: 220, behavior: 'smooth' });
                          }}
                          className="absolute right-1 z-10 p-2 rounded-md bg-slate-950/85 text-white border border-white/20 shadow-xl opacity-90 hover:opacity-100 transition-all hover:scale-105 active:scale-95"
                          title="Voir plus de miniatures"
                        >
                          <ChevronRight className="w-4 h-4 text-[#a3e635]" />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={`relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden shadow-xl flex flex-col items-center justify-center p-8 text-center space-y-4 border ${
                    isDark
                      ? 'bg-gradient-to-br from-purple-900/50 via-purple-950 to-slate-950 border-purple-500/20 text-white'
                      : (isBluSky
                          ? 'bg-gradient-to-br from-sky-50 via-white to-blue-50/80 border-slate-200 text-slate-900'
                          : 'bg-gradient-to-br from-purple-50 via-white to-purple-100/50 border-purple-200 text-slate-900')
                  }`}>
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg border backdrop-blur-md ${
                      isDark
                        ? 'bg-purple-600/30 border-purple-400/30 text-[#a3e635]'
                        : (isBluSky
                            ? 'bg-[#e0f2fe] border-[#00A0FF]/30 text-[#00A0FF]'
                            : 'bg-purple-100 border-purple-300 text-purple-700')
                    }`}>
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <div className="space-y-1.5 max-w-md">
                      <div className={`text-[10px] font-black uppercase tracking-widest ${
                        isDark ? 'text-[#a3e635]' : (isBluSky ? 'text-[#00A0FF]' : 'text-purple-700')
                      }`}>
                        {product.price === 0 ? 'Aperçu de la ressource offerte' : 'Aperçu du produit digital'}
                      </div>
                      <h3 className={`text-lg sm:text-xl font-heading font-black leading-snug ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}>
                        {product.name}
                      </h3>
                      <p className={`text-xs font-medium ${
                        isDark ? 'text-slate-300' : 'text-slate-600'
                      }`}>
                        Format digital immédiatement disponible & prêt à l emploi.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* SHORT & LONG DESCRIPTION */}
              <div className="space-y-4">
                <h3 className="text-xs font-heading font-black uppercase text-purple-600 dark:text-[#a3e635] tracking-widest flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Contenu & Détails de la ressource</span>
                </h3>

                <div className="space-y-4 text-base leading-relaxed font-medium">
                  {product.shortDescription && (
                    <p className="text-base sm:text-lg font-semibold leading-relaxed opacity-95">{product.shortDescription}</p>
                  )}

                  {product.longDescription && (
                    <div
                      className="pt-4 border-t border-slate-100 dark:border-white/10 opacity-95 text-sm sm:text-base leading-relaxed space-y-4 [&_h3]:font-heading [&_h3]:font-black [&_h3]:text-lg [&_h3]:mt-4 [&_h3]:mb-2 [&_p]:my-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2.5 [&_li]:my-1.5"
                      dangerouslySetInnerHTML={{ __html: product.longDescription }}
                    />
                  )}
                </div>
              </div>

            </Card>
          </div>

          {/* RIGHT COLUMN: SINGLE MERGED CARD */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
            <Card className={`p-5 space-y-4 rounded-md shadow-xl ${
                isDark ? 'bg-[#0e1424] border border-white/15 text-white' : 'bg-white border border-purple-200 text-slate-900'
              }`}>
                
                {/* SECTION 1: RÉCAPITULATIF DE LA RESSOURCE */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b pb-2 border-slate-100 dark:border-white/10">
                    <h3 className="text-sm font-heading font-black">Récapitulatif</h3>
                    {isFree && (
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-sm ${
                        isDark
                          ? 'bg-[#a3e635] text-slate-950'
                          : (isBluSky ? 'bg-[#00A0FF] text-white' : 'bg-purple-700 text-white')
                      }`}>
                        100% Offert
                      </span>
                    )}
                  </div>

                  <div className="flex items-start gap-3">
                    {product.icon ? (
                      <img
                        src={product.icon}
                        alt={product.name}
                        className="w-12 h-12 rounded-md object-cover border border-slate-200 flex-shrink-0 shadow-sm"
                      />
                    ) : product.coverImage ? (
                      <img
                        src={product.coverImage}
                        alt={product.name}
                        className="w-12 h-12 rounded-md object-cover border border-slate-200 flex-shrink-0 shadow-sm"
                      />
                    ) : (
                      <div className={`w-12 h-12 rounded-md text-white flex items-center justify-center font-black flex-shrink-0 shadow-sm ${
                        isBluSky ? 'bg-[#00A0FF]' : 'bg-purple-700'
                      }`}>
                        <Download className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-heading font-black text-xs leading-snug">{product.name}</h4>
                      <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {isFree ? `Ressource offerte (${getFileTypeLabel(product.fileType)})` : `Format : ${getFileTypeLabel(product.fileType)}`}
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
                      <span className={isFree ? (isDark ? 'text-[#a3e635]' : (isBluSky ? 'text-[#00A0FF]' : 'text-purple-700')) : (isBluSky ? 'text-[#00A0FF]' : '')}>
                        {isFree ? '0 € (Gratuit)' : `${product.price.toFixed(2)} €`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: 1. DESTINATAIRE DE LA RESSOURCE */}
                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-white/10">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[11px] font-heading font-black uppercase text-slate-400 tracking-wider">1. Destinataire</h3>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-sm ${
                      isDark
                        ? 'bg-[#a3e635]/20 text-[#a3e635]'
                        : (isBluSky ? 'bg-[#e0f2fe] text-[#00A0FF]' : 'bg-purple-100 text-purple-900')
                    }`}>
                      Accès Instantané
                    </span>
                  </div>

                  {currentUser ? (
                    <div className={`p-3 rounded-md flex items-center justify-between ${
                      isDark
                        ? 'bg-slate-950 border border-white/10'
                        : (isBluSky ? 'bg-[#f0f9ff] border border-[#00A0FF]/30' : 'bg-purple-50/80 border border-purple-200')
                    }`}>
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-md flex items-center justify-center font-extrabold text-xs shadow-sm ${
                          isDark
                            ? 'bg-[#a3e635] text-slate-950'
                            : (isBluSky ? 'bg-[#00A0FF] text-white' : 'bg-purple-700 text-white')
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
                          <label className={`block text-[11px] font-bold mb-0.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Votre Prénom *</label>
                          <input
                            type="text"
                            required
                            disabled={codeSent}
                            placeholder="ex. Alex"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className={`w-full px-3 py-2 rounded-md text-xs font-medium focus:outline-none transition-all ${
                              isDark
                                ? 'bg-slate-950 border border-white/10 text-white placeholder-slate-500 focus:border-[#a3e635]'
                                : (isBluSky
                                    ? 'bg-slate-50 border border-slate-200 text-slate-900 focus:border-[#00A0FF] focus:bg-white'
                                    : 'bg-slate-50 border border-slate-200 text-slate-900 focus:border-purple-600 focus:bg-white')
                            }`}
                          />
                        </div>

                        <div>
                          <label className={`block text-[11px] font-bold mb-0.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Votre Nom</label>
                          <input
                            type="text"
                            disabled={codeSent}
                            placeholder="ex. Morel"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className={`w-full px-3 py-2 rounded-md text-xs font-medium focus:outline-none transition-all ${
                              isDark
                                ? 'bg-slate-950 border border-white/10 text-white placeholder-slate-500 focus:border-[#a3e635]'
                                : (isBluSky
                                    ? 'bg-slate-50 border border-slate-200 text-slate-900 focus:border-[#00A0FF] focus:bg-white'
                                    : 'bg-slate-50 border border-slate-200 text-slate-900 focus:border-purple-600 focus:bg-white')
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
                          disabled={codeSent}
                          placeholder="votre.email@exemple.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={`w-full px-3 py-2 rounded-md text-xs font-medium focus:outline-none transition-all ${
                            isDark
                              ? 'bg-slate-950 border border-white/10 text-white placeholder-slate-500 focus:border-[#a3e635]'
                              : (isBluSky
                                  ? 'bg-slate-50 border border-slate-200 text-slate-900 focus:border-[#00A0FF] focus:bg-white'
                                  : 'bg-slate-50 border border-slate-200 text-slate-900 focus:border-purple-600 focus:bg-white')
                          }`}
                        />
                      </div>

                    </div>
                  )}

                  {/* PAYMENT METHOD (ONLY FOR PAID PRODUCTS) */}
                  {!isFree && (
                    <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/10">
                      <h4 className="text-xs font-heading font-black">2. Mode de paiement</h4>
                      
                      <div
                        onClick={() => setPaymentMethod('DEMO')}
                        className={`p-2.5 rounded-md border cursor-pointer transition-all ${
                          paymentMethod === 'DEMO'
                            ? (isDark
                                ? 'border-[#a3e635] bg-[#a3e635]/15'
                                : (isBluSky ? 'border-[#00A0FF] bg-[#e0f2fe]/80 ring-2 ring-[#00A0FF]/20' : 'border-purple-600 bg-purple-50/70'))
                            : (isDark ? 'border-white/10 bg-slate-950/60' : 'border-slate-200 bg-white')
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              checked={paymentMethod === 'DEMO'}
                              readOnly
                              className={isBluSky ? 'text-[#00A0FF]' : 'text-purple-600'}
                            />
                            <span className="font-heading font-black text-xs flex items-center gap-1">
                              <Sparkles className={`w-3.5 h-3.5 ${isDark ? 'text-[#a3e635]' : (isBluSky ? 'text-[#00A0FF]' : 'text-purple-600')}`} />
                              <span>Paiement Démo / Test</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div
                        onClick={() => setPaymentMethod('CARD')}
                        className={`p-2.5 rounded-md border cursor-pointer transition-all ${
                          paymentMethod === 'CARD'
                            ? (isDark
                                ? 'border-[#a3e635] bg-[#a3e635]/15'
                                : (isBluSky ? 'border-[#00A0FF] bg-[#e0f2fe]/80 ring-2 ring-[#00A0FF]/20' : 'border-purple-600 bg-purple-50/70'))
                            : (isDark ? 'border-white/10 bg-slate-950/60' : 'border-slate-200 bg-white')
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            checked={paymentMethod === 'CARD'}
                            readOnly
                            className={isBluSky ? 'text-[#00A0FF]' : 'text-purple-600'}
                          />
                          <span className="font-heading font-black text-xs flex items-center gap-1.5">
                            <CreditCard className={`w-3.5 h-3.5 ${isBluSky ? 'text-[#00A0FF]' : 'text-purple-500'}`} />
                            <span>Carte Bancaire (Stripe)</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* INFO MESSAGE & CODE VERIFICATION BOX */}
                  {infoMsg && (
                    <div className={`p-3 rounded-md text-xs font-bold flex items-center gap-2 ${
                      isDark
                        ? 'bg-[#a3e635]/20 border border-[#a3e635]/50 text-[#a3e635]'
                        : (isBluSky ? 'bg-[#e0f2fe] border border-[#00A0FF]/40 text-[#00A0FF]' : 'bg-purple-100 border border-purple-300 text-purple-900')
                    }`}>
                      <Lock className="w-4 h-4 shrink-0" />
                      <span>{infoMsg}</span>
                    </div>
                  )}

                  {error && (
                    <div className="p-3 rounded-md bg-rose-500/20 border border-rose-500/50 text-rose-300 text-xs font-bold">
                      {error}
                    </div>
                  )}

                  {/* 4-DIGIT VERIFICATION CODE INPUT STEP */}
                  {!currentUser && codeSent && (
                    <div className={`p-4 rounded-xl space-y-3 my-2 shadow-xl animate-in fade-in duration-300 ${
                      isDark
                        ? 'bg-[#a3e635]/15 border-2 border-[#a3e635]/60 text-[#a3e635]'
                        : (isBluSky ? 'bg-[#e0f2fe]/80 border-2 border-[#00A0FF]/60 text-[#00A0FF]' : 'bg-purple-50 border-2 border-purple-300 text-purple-950')
                    }`}>
                      <div className={`flex items-center gap-2 text-xs font-heading font-black uppercase ${
                        isDark ? 'text-[#a3e635]' : (isBluSky ? 'text-[#00A0FF]' : 'text-purple-900')
                      }`}>
                        <Lock className="w-4 h-4" />
                        <span>Code de confirmation requis</span>
                      </div>
                      
                      <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Un code à 4 chiffres a été envoyé par e-mail à <strong className={isDark ? 'text-white' : 'text-slate-950'}>{email}</strong>.
                      </p>

                      <div className="flex justify-center">
                        <input
                          type="text"
                          maxLength={4}
                          autoFocus
                          placeholder="1234"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          className={`w-full text-center tracking-[12px] font-mono text-2xl font-black py-2.5 px-3 rounded-lg focus:outline-none ${
                            isDark
                              ? 'bg-slate-950 border border-white/20 text-[#a3e635] focus:border-[#a3e635]'
                              : (isBluSky ? 'bg-white border-2 border-[#00A0FF] text-[#00A0FF]' : 'bg-white border-2 border-purple-600 text-purple-900')
                          }`}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <button
                          type="button"
                          onClick={handleSendVerificationCode}
                          disabled={sendingCode}
                          className={`font-bold hover:underline ${isDark ? 'text-[#a3e635]' : (isBluSky ? 'text-[#00A0FF]' : 'text-purple-700')}`}
                        >
                          {sendingCode ? 'Envoi...' : 'Renvoyer le code'}
                        </button>

                        <button
                          type="button"
                          onClick={() => { setCodeSent(false); setVerificationCode(''); setInfoMsg(''); setError(''); }}
                          className="text-slate-400 hover:text-slate-900 underline"
                        >
                          Modifier l e-mail
                        </button>
                      </div>
                    </div>
                  )}

                  {/* HIGH IMPACT CTA BUTTON */}
                  <div className="pt-1">
                    <Button
                      type="submit"
                      disabled={processing || sendingCode}
                      className={`w-full py-3 px-4 text-sm sm:text-base font-heading font-black tracking-tight rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] ${
                        isDark
                          ? 'bg-[#a3e635] text-slate-950 hover:bg-[#b8f542]'
                          : (isBluSky ? 'bg-[#00A0FF] text-white hover:bg-[#0082D6]' : 'bg-purple-700 text-white hover:bg-purple-800')
                      }`}
                    >
                      {sendingCode ? (
                        <span className="whitespace-nowrap">Envoi du code...</span>
                      ) : processing ? (
                        <span className="whitespace-nowrap">Validation en cours...</span>
                      ) : codeSent ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 shrink-0 stroke-[2.5]" />
                          <span className="whitespace-nowrap">{isFree ? 'Valider & Télécharger' : `Valider & Payer (${product.price.toFixed(2)} €)`}</span>
                        </>
                      ) : isFree ? (
                        <>
                          <Gift className="w-4 h-4 shrink-0" />
                          <span className="whitespace-nowrap">Obtenir mon accès gratuit</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 shrink-0" />
                          <span className="whitespace-nowrap">Payer ({product.price.toFixed(2)} €)</span>
                        </>
                      )}
                    </Button>
                  </div>

                  {/* SECTION 4: BÉNÉFICES & CONCEPTS INCLUS AVEC LA RESSOURCE */}
                  <div className={`mt-4 p-4 rounded-md space-y-3 pt-4 border-t ${
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
                </div>
              </Card>
            </div>
          </form>

        {/* RECOMMENDED PRODUCTS CROSS-SELL SECTION */}
        {recommendedProducts.filter((p) => p.id !== product.id).length > 0 && (
          <div className="mt-16 pt-10 border-t border-white/10 space-y-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-[11px] font-heading font-black bg-[#a3e635]/15 text-[#a3e635] border border-[#a3e635]/30 mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>CATALOGUE & COMPLÉMENTS</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-heading font-black text-white tracking-tight">
                  Vous aimerez aussi : Autres outils recommandés
                </h3>
              </div>

              <Link href="/boutique" className="text-xs font-heading font-black text-[#a3e635] hover:underline flex items-center gap-1">
                <span>Voir toute la boutique</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {recommendedProducts
                .filter((p) => p.id !== product.id)
                .slice(0, 4)
                .map((recProd) => {
                  const comparePrice = recProd.compareAtPrice || (recProd.price > 0 ? recProd.price * 1.5 : 29);
                  return (
                    <Card
                      key={recProd.id}
                      className="bg-[#0e1424] border border-white/10 hover:border-[#a3e635]/60 transition-all duration-300 rounded-3xl p-3.5 sm:p-4 flex flex-col justify-between group shadow-xl hover:shadow-2xl hover:shadow-[#a3e635]/10"
                    >
                      <div className="space-y-3">
                        {/* INNER COVER CONTAINER WITH ROUNDED CORNERS, CIRCULAR ACTION ARROW & CATEGORY BADGE */}
                        <Link href={`/checkout?productId=${recProd.id}`} className="relative block aspect-[16/11] rounded-2xl overflow-hidden bg-slate-950 group">
                          {recProd.coverImage ? (
                            <img
                              src={recProd.coverImage}
                              alt={recProd.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : recProd.icon ? (
                            <div className="w-full h-full bg-slate-900 flex items-center justify-center p-4">
                              <img src={recProd.icon} alt={recProd.name} className="w-16 h-16 object-contain rounded-lg shadow-xl" />
                            </div>
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-purple-900/60 via-purple-950 to-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-2">
                              <Sparkles className="w-8 h-8 text-[#a3e635]" />
                              <span className="text-xs font-heading font-black text-white uppercase tracking-wider">{recProd.name}</span>
                            </div>
                          )}

                          {/* CIRCULAR ACTION BUTTON TOP LEFT */}
                          <div className="img-overlay-arrow absolute top-2.5 left-2.5 w-8 h-8 rounded-full bg-[#00A0FF] text-white border border-white/20 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 z-10">
                            <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                          </div>

                          {/* FLOATING CATEGORY BADGE BOTTOM LEFT */}
                          <span className="img-overlay-badge absolute bottom-2.5 left-2.5 px-3 py-1 bg-white text-slate-900 border border-slate-200/80 text-[10px] font-heading font-black uppercase tracking-wider rounded-full shadow-md z-10">
                            {recProd.category?.name || (recProd.isFreeResource ? '100% OFFERT' : 'TEMPLATES')}
                          </span>

                          <div className="absolute top-2.5 right-2.5 z-10">
                            <span className="bg-slate-950/80 backdrop-blur-md text-white text-[9px] font-bold px-2.5 py-1 rounded-full border border-white/20 shadow-lg flex items-center gap-1">
                              <Star className="w-2.5 h-2.5 text-[#a3e635] fill-[#a3e635]" />
                              <span>VÉRIFIÉ</span>
                            </span>
                          </div>
                        </Link>

                        {/* CARD BODY */}
                        <div className="space-y-1.5 px-1">
                          <div className="text-[10px] font-heading font-bold text-slate-400 uppercase tracking-wider">
                            Format : {getFileTypeLabel(recProd.fileType)}
                          </div>

                          <Link href={`/checkout?productId=${recProd.id}`}>
                            <h4 className="font-heading font-black text-sm text-white group-hover:text-[#a3e635] transition-colors leading-snug line-clamp-2">
                              {recProd.name}
                            </h4>
                          </Link>

                          <p className="text-xs text-slate-400 font-medium line-clamp-2 leading-relaxed">
                            {recProd.shortDescription || 'Système complet prêt à l emploi.'}
                          </p>
                        </div>
                      </div>

                      {/* CARD FOOTER */}
                      <div className="space-y-3 pt-3 px-1">
                        <div className="flex items-baseline justify-between border-t border-white/10 pt-2.5 text-xs">
                          <span className="text-slate-500 line-through text-[11px] font-semibold">{comparePrice.toFixed(2)} €</span>
                          <span className="font-heading font-black text-white text-sm">
                            {recProd.price > 0 ? `${recProd.price.toFixed(2)} €` : '0 € (Gratuit)'}
                          </span>
                        </div>

                        <Link href={`/checkout?productId=${recProd.id}`}>
                          <button
                            type="button"
                            className="w-full py-2.5 bg-[#a3e635] hover:bg-[#b8f542] text-slate-950 font-heading font-black text-xs uppercase tracking-wider rounded-xl shadow-lg hover:scale-[1.01] transition-all flex items-center justify-center gap-1.5"
                          >
                            <span>DÉCOUVRIR</span>
                            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                        </Link>
                      </div>

                    </Card>
                  );
                })}
            </div>
          </div>
        )}

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
