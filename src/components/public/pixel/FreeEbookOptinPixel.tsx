'use client';

import React, { useState, useEffect } from 'react';
import { Send, Gift, ShieldCheck, CheckCircle, Check, Lock, ArrowLeft, RefreshCw, Sparkles, Rocket, Flame, Star, Diamond, Zap, Crown, Target, User, Mail, Bot, BookOpen, Book } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormattedText } from '@/components/ui/FormattedText';

interface FreeEbookOptinPixelProps {
  title?: string;
  subtitle?: string | null;
  settings?: any;
  isEmbedded?: boolean;
}

const BADGE_ICONS_MAP: Record<string, any> = {
  Sparkles,
  Rocket,
  Flame,
  Star,
  Diamond,
  Gift,
  Zap,
  Crown,
  Target,
  Check,
  Bot,
  BookOpen,
  Book,
};

export function FreeEbookOptinPixel({
  title,
  subtitle,
  settings = {},
  isEmbedded = false,
}: FreeEbookOptinPixelProps) {
  const [liveSection, setLiveSection] = useState<any>(null);

  useEffect(() => {
    // Only fetch homepage section settings when rendered as standalone without props
    if (!isEmbedded && !settings) {
      async function fetchLiveSection() {
        try {
          const res = await fetch('/api/admin/homepage');
          const data = await res.json();
          if (data?.sections) {
            const darkFeature = data.sections.find((sec: any) => sec.sectionKey === 'DARK_FEATURE');
            if (darkFeature) {
              setLiveSection(darkFeature);
            }
          }
        } catch (e) {
          console.error('Failed to fetch live homepage section settings:', e);
        }
      }
      fetchLiveSection();
    }
  }, [isEmbedded, settings]);

  // Parse custom settings
  const parsedPropSettings = typeof settings === 'string' ? (JSON.parse(settings || '{}') || {}) : (settings || {});
  
  let liveParsedSettings: any = {};
  if (!isEmbedded && liveSection?.settings) {
    try {
      liveParsedSettings = typeof liveSection.settings === 'string' ? JSON.parse(liveSection.settings) : liveSection.settings || {};
    } catch (e) {}
  }

  // Merged settings: prop settings take precedence so multiple blocks on the same page keep their distinct configurations
  const mergedSettings = { ...liveParsedSettings, ...parsedPropSettings };

  // 5-element font/size/color styling from mergedSettings
  const badgeBgHex = mergedSettings.badgeBgColor;
  const badgeColorHex = mergedSettings.badgeColor;

  const badgeStyle: React.CSSProperties = {
    fontFamily: mergedSettings.badgeFont ? `'${mergedSettings.badgeFont}', sans-serif` : undefined,
    fontSize: mergedSettings.badgeSize || undefined,
    color: badgeColorHex || undefined,
    backgroundColor: badgeBgHex ? (badgeBgHex.startsWith('#') ? `${badgeBgHex}25` : badgeBgHex) : undefined,
    borderColor: badgeBgHex || badgeColorHex ? (badgeBgHex || badgeColorHex).startsWith('#') ? `${badgeBgHex || badgeColorHex}60` : (badgeBgHex || badgeColorHex) : undefined,
  };

  const SelectedBadgeIcon = mergedSettings.badgeIcon && mergedSettings.badgeIcon !== 'None'
    ? (BADGE_ICONS_MAP[mergedSettings.badgeIcon] || Sparkles)
    : (mergedSettings.badgeIcon === 'None' ? null : Sparkles);

  const badgeIconColor = mergedSettings.badgeIconColor || badgeColorHex || '#a3e635';

  const iconStyle: React.CSSProperties = {
    color: badgeIconColor,
    width: mergedSettings.badgeIconSize || undefined,
    height: mergedSettings.badgeIconSize || undefined,
  };

  const titleStyle: React.CSSProperties = {
    fontFamily: mergedSettings.titleFont ? `'${mergedSettings.titleFont}', sans-serif` : undefined,
    fontSize: mergedSettings.titleSize || undefined,
    color: mergedSettings.titleColor || undefined,
  };

  const subtitleStyle: React.CSSProperties = {
    fontFamily: mergedSettings.subtitleFont ? `'${mergedSettings.subtitleFont}', sans-serif` : undefined,
    fontSize: mergedSettings.subtitleSize || undefined,
    color: mergedSettings.subtitleColor || undefined,
  };

  const btnStyle: React.CSSProperties = {
    fontFamily: mergedSettings.btnFont ? `'${mergedSettings.btnFont}', sans-serif` : undefined,
    fontSize: mergedSettings.btnSize || undefined,
    backgroundColor: mergedSettings.btnColor || undefined,
  };

  const reassuranceStyle: React.CSSProperties = {
    fontFamily: mergedSettings.reassuranceFont ? `'${mergedSettings.reassuranceFont}', sans-serif` : undefined,
    fontSize: mergedSettings.reassuranceSize || undefined,
    color: mergedSettings.reassuranceColor || undefined,
  };

  const defaultEmbeddedTitle = "Tout ce dont vous avez besoin pour structurer et faire <mark color='#a3e635'>décoller votre activité</mark>";
  const defaultEmbeddedSubtitle = "Ne perdez plus des heures à configurer des outils bancales. Accédez à nos systèmes complets.";

  const finalTitle = isEmbedded
    ? (title || defaultEmbeddedTitle)
    : (title || liveSection?.title || defaultEmbeddedTitle);

  const finalSubtitle = isEmbedded
    ? (subtitle !== undefined ? subtitle : defaultEmbeddedSubtitle)
    : (subtitle !== undefined ? subtitle : (liveSection?.subtitle || defaultEmbeddedSubtitle));

  const badgeText = mergedSettings.badgeText || (isEmbedded ? 'EBOOK GRATUIT A 100%' : 'EBOOK OFFERT A 100%');
  const btnText = mergedSettings.btnText || 'Send My FREE Guide 🚀';
  const reassuranceText1 = mergedSettings.reassuranceText1 || '100% Gratuit sans engagement';
  const reassuranceText2 = mergedSettings.reassuranceText2 || 'Téléchargement instantané';
  const bookCoverUrl = mergedSettings.bookCoverUrl || '';
  const bookTitle = mergedSettings.bookTitle || 'ESCAPE THE RAT RACE';

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  
  const [step, setStep] = useState<'DETAILS' | 'VERIFY_CODE'>('DETAILS');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  // STEP 1: SEND 4-DIGIT VERIFICATION CODE
  const handleSendCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMsg('Veuillez saisir une adresse email valide.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setInfoMsg(null);

    try {
      const res = await fetch('/api/leads/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, firstName }),
      });

      const data = await res.json();
      if (res.ok) {
        setStep('VERIFY_CODE');
        setInfoMsg(`📩 Un code de vérification à 4 chiffres a été envoyé à ${email}.`);
      } else {
        setErrorMsg(data.error || 'Erreur lors de l envoi du code de vérification.');
      }
    } catch (err) {
      console.error('Send code error:', err);
      setErrorMsg('Erreur réseau. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: VERIFY CODE AND COMPLETE REGISTRATION
  const handleVerifyAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode || verificationCode.trim().length !== 4) {
      setErrorMsg('Veuillez saisir le code à 4 chiffres reçu par email.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          code: verificationCode.trim(),
          source: 'EBOOK_OPTIN',
          listId: mergedSettings.targetListId || undefined,
          welcomeStepId: mergedSettings.welcomeStepId || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSubmitted(true);
      } else {
        setErrorMsg(data.error || 'Code incorrect ou expiré.');
      }
    } catch (err) {
      console.error('Lead verification error:', err);
      setErrorMsg('Erreur lors de la validation du code.');
    } finally {
      setLoading(false);
    }
  };

  if (isEmbedded) {
    return (
      <div className="my-10 p-6 sm:p-9 bg-gradient-to-br from-slate-950 via-[#0f1422] to-slate-950 text-white rounded-md border border-[#a3e635]/40 shadow-2xl shadow-[#a3e635]/5 relative overflow-hidden not-prose">
        
        {/* AMBIENT NEON GLOW */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-[#a3e635]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* LEFT FORM COLUMN */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex justify-center w-full">
                <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-md text-sm sm:text-base font-heading font-black bg-[#a3e635]/15 text-[#a3e635] border border-[#a3e635]/40 shadow-md uppercase tracking-wider whitespace-nowrap shrink-0" style={badgeStyle}>
                  {SelectedBadgeIcon && <SelectedBadgeIcon className="w-4 h-4 shrink-0 animate-pulse" style={iconStyle} />}
                  <span>{badgeText}</span>
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-heading font-black text-white tracking-tight leading-snug text-center max-w-lg mx-auto" style={titleStyle}>
                <FormattedText text={finalTitle} />
              </h3>

              {finalSubtitle && (
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium text-center max-w-md mx-auto" style={subtitleStyle}>
                  <FormattedText text={finalSubtitle} />
                </p>
              )}
            </div>

            {submitted ? (
              <div className="p-6 bg-[#a3e635]/15 border border-[#a3e635]/50 text-[#a3e635] rounded-md text-center space-y-2 animate-in zoom-in-95">
                <div className="w-12 h-12 rounded-md bg-[#a3e635] text-slate-950 flex items-center justify-center mx-auto text-xl font-bold shadow-lg">
                  ✓
                </div>
                <h4 className="text-lg font-heading font-black">Accès Débloqué !</h4>
                <p className="text-xs text-slate-200">
                  Votre guide gratuit a été envoyé à <code className="font-bold text-white">{email}</code>.
                </p>
              </div>
            ) : step === 'DETAILS' ? (
              /* STEP 1: INITIAL DETAILS FORM */
              <form onSubmit={handleSendCode} className="space-y-2.5 pt-1">
                <div className="space-y-2.5">
                  {errorMsg && (
                    <div className="p-2.5 bg-rose-500/20 border border-rose-500/40 text-rose-300 rounded-md text-xs font-bold animate-in fade-in">
                      {errorMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Votre Prénom*"
                        required
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-md bg-slate-900/90 border border-slate-800 text-white placeholder-slate-400 text-xs font-medium focus:outline-none focus:border-[#a3e635] focus:ring-2 focus:ring-[#a3e635]/20 transition-all"
                      />
                    </div>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Votre Nom"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-md bg-slate-900/90 border border-slate-800 text-white placeholder-slate-400 text-xs font-medium focus:outline-none focus:border-[#a3e635] focus:ring-2 focus:ring-[#a3e635]/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Votre Email Pro*"
                      required
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-md bg-slate-900/90 border border-slate-800 text-white placeholder-slate-400 text-xs font-medium focus:outline-none focus:border-[#a3e635] focus:ring-2 focus:ring-[#a3e635]/20 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <Button
                    type="submit"
                    disabled={loading}
                    style={btnStyle}
                    className="w-full bg-[#a3e635] text-slate-950 hover:bg-[#b8f542] font-heading font-black text-lg sm:text-xl py-2 px-3 h-auto rounded-lg shadow-lg shadow-[#a3e635]/20 border-0 hover:scale-[1.01] transition-all gap-2"
                  >
                    <span>{loading ? 'Envoi du code...' : btnText}</span>
                  </Button>

                  {/* REASSURANCE TEXTS ON THE EXACT SAME LINE */}
                  <div className="flex flex-row items-center justify-center gap-4 text-[11px] text-slate-400 pt-0.5 font-medium whitespace-nowrap" style={reassuranceStyle}>
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#a3e635] shrink-0" />
                      <span>{reassuranceText1}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-[#a3e635] shrink-0" />
                      <span>{reassuranceText2}</span>
                    </span>
                  </div>
                </div>
              </form>
            ) : (
              /* STEP 2: CODE VERIFICATION */
              <form onSubmit={handleVerifyAndSubmit} className="space-y-3 pt-1 flex flex-col justify-between flex-grow animate-in fade-in">
                <div className="space-y-2">
                  {infoMsg && (
                    <div className="p-3 bg-[#a3e635]/15 border border-[#a3e635]/40 text-[#a3e635] rounded-xl text-xs font-semibold leading-relaxed flex items-start gap-2">
                      <Lock className="w-4 h-4 text-[#a3e635] shrink-0 mt-0.5" />
                      <span>{infoMsg}</span>
                    </div>
                  )}

                  {errorMsg && (
                    <div className="p-2.5 bg-rose-500/20 border border-rose-500/40 text-rose-300 rounded-xl text-xs font-bold">
                      {errorMsg}
                    </div>
                  )}

                  <div className="space-y-1.5 bg-slate-900/90 p-4 rounded-xl border border-[#a3e635]/40 text-center">
                    <label className="block text-[11px] font-heading font-black text-[#a3e635] uppercase tracking-wider">
                      🔒 Code à 4 chiffres :
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="1234"
                      autoFocus
                      required
                      className="w-36 mx-auto px-3 py-2 rounded-xl bg-slate-950 border border-[#a3e635] text-center font-mono font-black text-xl tracking-[0.4em] text-[#a3e635] placeholder-slate-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <Button
                    type="submit"
                    disabled={loading || verificationCode.length !== 4}
                    size="md"
                    className="w-full bg-[#a3e635] text-slate-950 hover:bg-[#b8f542] font-heading font-black text-xs sm:text-sm py-3 rounded-xl shadow-xl border-0 transition-all gap-2"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>{loading ? 'Validation...' : 'Valider & Télécharger'}</span>
                  </Button>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setStep('DETAILS');
                        setVerificationCode('');
                        setErrorMsg(null);
                      }}
                      className="hover:text-white flex items-center gap-1 font-semibold"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Changer d email</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSendCode()}
                      disabled={loading}
                      className="text-[#a3e635] hover:underline font-bold flex items-center gap-1"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                      <span>Renvoyer code</span>
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* RIGHT COVER IMAGE COLUMN - ALIGNED TOP TO BOTTOM WITH LEFT COLUMN */}
          <div className="lg:col-span-5 flex justify-center items-stretch h-full">
            <div className="relative group w-full max-w-[320px] sm:max-w-[360px] h-full flex flex-col justify-stretch">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#a3e635] via-emerald-400 to-purple-500 rounded-2xl blur-md opacity-30 group-hover:opacity-70 transition duration-500" />
              {bookCoverUrl ? (
                <img
                  src={bookCoverUrl}
                  alt={bookTitle}
                  className="relative rounded-2xl border border-slate-700/80 object-cover w-full h-full min-h-[280px] shadow-2xl"
                />
              ) : (
                <div className="relative rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-6 h-full min-h-[280px] flex flex-col justify-between shadow-2xl text-center">
                  <div className="space-y-1">
                    <div className="text-[9px] font-heading font-black text-[#a3e635] uppercase tracking-widest">Guide Solopreneur</div>
                    <h4 className="text-sm font-heading font-black text-white leading-snug uppercase tracking-wide">{bookTitle}</h4>
                  </div>
                  <div className="w-14 h-14 rounded-full bg-[#a3e635]/20 text-[#a3e635] flex items-center justify-center mx-auto text-2xl font-black border border-[#a3e635]/40 shadow-inner my-auto">
                    📚
                  </div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    Solopreneur & Co • 2026
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    );
  }

  return (
    <section className="py-8 sm:py-12 bg-white text-white border-b border-slate-200 relative overflow-hidden">
      
      {/* AMBIENT GLOW */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#a3e635]/15 rounded-full blur-[200px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* INNER DARK CARD FRAME ON WHITE CANVAS */}
        <div className="ebook-optin-card bg-slate-950 p-5 sm:p-7 rounded-2xl border-2 border-slate-900 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* LEFT FORM COLUMN */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-3">
            <div className="space-y-2 text-center">
              <div className="flex justify-center w-full">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-md text-xs sm:text-sm font-heading font-black bg-[#a3e635]/15 text-[#a3e635] border border-[#a3e635]/40 shadow-md uppercase tracking-wider whitespace-nowrap shrink-0" style={badgeStyle}>
                  {SelectedBadgeIcon && <SelectedBadgeIcon className="w-3.5 h-3.5 shrink-0 animate-pulse" style={iconStyle} />}
                  <span>{badgeText}</span>
                </div>
              </div>

              <h2 className="text-xl sm:text-2xl lg:text-3xl font-heading font-black text-white tracking-tight leading-snug text-center max-w-lg mx-auto" style={titleStyle}>
                <FormattedText text={finalTitle} />
              </h2>

              {finalSubtitle && (
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal text-center max-w-md mx-auto" style={subtitleStyle}>
                  <FormattedText text={finalSubtitle} />
                </p>
              )}
            </div>

            {submitted ? (
              <div className="p-6 bg-[#a3e635]/15 border border-[#a3e635]/40 rounded-2xl text-center space-y-2 animate-in fade-in">
                <div className="w-12 h-12 rounded-full bg-[#a3e635] text-slate-950 flex items-center justify-center mx-auto text-xl font-black shadow-md">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h3 className="text-lg font-heading font-black text-[#a3e635]">Félicitations {firstName || ''} ! 🚀</h3>
                <p className="text-xs text-slate-200 font-medium">
                  Votre adresse email a été vérifiée avec succès. Votre eBook vous a été envoyé à <strong className="text-white">{email}</strong>.
                </p>
              </div>
            ) : step === 'DETAILS' ? (
              /* STEP 1: INITIAL DETAILS FORM */
              <form onSubmit={handleSendCode} className="space-y-2.5 pt-1">
                <div className="space-y-2">
                  {errorMsg && (
                    <div className="p-2.5 bg-rose-500/20 border border-rose-500/40 text-rose-300 rounded-lg text-xs font-bold animate-in fade-in">
                      {errorMsg}
                    </div>
                  )}

                  {/* ROW 1: PRÉNOM ET NOM CÔTE À CÔTE */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Votre Prénom*"
                        required
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-[#0b0f19] border border-white/10 text-white placeholder-slate-400 text-xs font-medium focus:outline-none focus:border-[#a3e635] focus:ring-2 focus:ring-[#a3e635]/20 transition-all"
                      />
                    </div>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Votre Nom"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-[#0b0f19] border border-white/10 text-white placeholder-slate-400 text-xs font-medium focus:outline-none focus:border-[#a3e635] focus:ring-2 focus:ring-[#a3e635]/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* ROW 2: ADRESSE EMAIL EN DESSOUS EN PLEINE LARGEUR */}
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Votre Email Pro*"
                      required
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-[#0b0f19] border border-white/10 text-white placeholder-slate-400 text-xs font-medium focus:outline-none focus:border-[#a3e635] focus:ring-2 focus:ring-[#a3e635]/20 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  {/* BOUTON SOUMISSION STEP 1 */}
                  <Button
                    type="submit"
                    disabled={loading}
                    style={btnStyle}
                    className="w-full bg-[#a3e635] text-slate-950 hover:bg-[#b8f542] font-heading font-black text-lg sm:text-xl py-2 px-3 h-auto rounded-lg shadow-lg shadow-[#a3e635]/25 border-0 hover:scale-[1.01] transition-all gap-2"
                  >
                    <span>{loading ? 'Envoi du code...' : btnText}</span>
                  </Button>

                  {/* REASSURANCE TEXTS ON THE EXACT SAME LINE */}
                  <div className="flex flex-row items-center justify-center gap-5 text-[11px] text-slate-400 pt-0.5 font-semibold whitespace-nowrap" style={reassuranceStyle}>
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#a3e635] shrink-0" />
                      <span>{reassuranceText1}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-[#a3e635] shrink-0" />
                      <span>{reassuranceText2}</span>
                    </span>
                  </div>
                </div>
              </form>
            ) : (
              /* STEP 2: 4-DIGIT CODE VERIFICATION FORM */
              <form onSubmit={handleVerifyAndSubmit} className="space-y-4 pt-2 flex flex-col justify-between flex-grow animate-in fade-in">
                <div className="space-y-3">
                  {infoMsg && (
                    <div className="p-3.5 bg-[#a3e635]/15 border border-[#a3e635]/40 text-[#a3e635] rounded-2xl text-xs font-semibold leading-relaxed flex items-start gap-2">
                      <Lock className="w-4 h-4 text-[#a3e635] shrink-0 mt-0.5" />
                      <span>{infoMsg}</span>
                    </div>
                  )}

                  {errorMsg && (
                    <div className="p-3 bg-rose-500/20 border border-rose-500/40 text-rose-300 rounded-xl text-xs font-bold">
                      {errorMsg}
                    </div>
                  )}

                  <div className="space-y-2 bg-[#0b0f19] p-5 rounded-2xl border-2 border-[#a3e635]/40 text-center">
                    <label className="block text-xs font-heading font-black text-[#a3e635] uppercase tracking-wider">
                      🔒 Saisir le Code à 4 chiffres reçu par email :
                    </label>
                    
                    <input
                      type="text"
                      maxLength={4}
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="1234"
                      autoFocus
                      required
                      className="w-48 mx-auto px-4 py-3 rounded-xl bg-slate-950 border-2 border-[#a3e635] text-center font-mono font-black text-2xl tracking-[0.5em] text-[#a3e635] placeholder-slate-600 focus:outline-none shadow-inner"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <Button
                    type="submit"
                    disabled={loading || verificationCode.length !== 4}
                    size="lg"
                    className="w-full bg-[#a3e635] text-slate-950 hover:bg-[#b8f542] font-heading font-black text-base py-4 rounded-xl shadow-lg border-0 transition-all gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    <span>{loading ? 'Validation en cours...' : 'Valider mon code & Télécharger'}</span>
                  </Button>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setStep('DETAILS');
                        setVerificationCode('');
                        setErrorMsg(null);
                      }}
                      className="hover:text-white flex items-center gap-1 font-semibold transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Modifier l email ({email})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSendCode()}
                      disabled={loading}
                      className="text-[#a3e635] hover:underline font-bold flex items-center gap-1"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                      <span>Renvoyer le code</span>
                    </button>
                  </div>
                </div>

              </form>
            )}

          </div>

          {/* RIGHT COVER IMAGE COLUMN - ALIGNED TOP TO BOTTOM WITH LEFT COLUMN */}
          <div className="lg:col-span-5 flex justify-center items-center h-full">
            <div className="relative group max-w-[280px] sm:max-w-[310px] w-full h-full flex flex-col justify-stretch">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#a3e635] to-emerald-500 rounded-2xl blur-lg opacity-30 group-hover:opacity-60 transition duration-500" />
              
              {bookCoverUrl ? (
                <img
                  src={bookCoverUrl}
                  alt={bookTitle}
                  className="relative rounded-xl border-2 border-slate-800 object-cover w-full h-full min-h-[250px] shadow-2xl"
                />
              ) : (
                <div className="relative rounded-xl border-2 border-slate-800 bg-slate-900 p-6 h-full min-h-[250px] flex flex-col justify-between shadow-2xl text-center">
                  <div className="space-y-1.5">
                    <div className="text-[9px] font-heading font-black text-[#a3e635] uppercase tracking-widest">Guide Solopreneur</div>
                    <h3 className="text-lg font-heading font-black text-white leading-tight uppercase">{bookTitle}</h3>
                  </div>

                  <div className="w-16 h-16 rounded-full bg-[#a3e635]/20 text-[#a3e635] flex items-center justify-center mx-auto text-2xl font-black border border-[#a3e635]/30 my-auto">
                    📚
                  </div>

                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Solopreneur & Co • Edition 2026
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </section>
  );
}
