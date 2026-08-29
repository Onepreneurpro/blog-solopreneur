'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ArrowRight, Mail, ShieldCheck, Sparkles, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FunnelPublicClientProps {
  funnel: any;
  step: any;
}

export default function FunnelPublicClient({ funnel, step }: FunnelPublicClientProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Parse custom builder elements if saved
  let customElements: any[] | null = null;
  if (step?.content) {
    try {
      const parsed = JSON.parse(step.content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        customElements = parsed;
      }
    } catch (e) {
      console.error(e);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/funnel/optin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          funnelId: funnel.id,
          stepId: step.id,
          email,
          name,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(true);
        if (data.nextStepSlug) {
          setTimeout(() => {
            router.push(`/funnel/${data.funnelSlug}/${data.nextStepSlug}`);
          }, 1000);
        }
      } else {
        setErrorMsg(data.error || 'Une erreur est survenue.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Erreur de réseau.');
    } finally {
      setSubmitting(false);
    }
  };

  // RENDER THANK YOU PAGE
  if (step.type === 'THANK_YOU_PAGE') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="max-w-xl w-full text-center space-y-6 bg-slate-900/90 p-8 sm:p-12 rounded-3xl border border-slate-800 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-heading font-black text-white tracking-tight">
              Félicitations ! Votre inscription est validée 🎉
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Nous venons de vous envoyer un email de confirmation contenant votre lien d accès direct. Vérifiez votre boîte de réception dans quelques instants.
            </p>
          </div>

          <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 text-xs text-slate-300 flex items-center gap-3">
            <Mail className="w-5 h-5 text-[#00A0FF] shrink-0" />
            <span>Pensez à vérifier votre dossier Indésirables / Spams si vous ne le voyez pas.</span>
          </div>

          <Button
            onClick={() => router.push('/')}
            className="w-full bg-[#00A0FF] hover:bg-[#0082D6] !text-white font-heading font-black text-sm py-3 rounded-xl shadow-lg"
          >
            Retourner sur la page d accueil →
          </Button>
        </div>
      </div>
    );
  }

  // RENDER DYNAMIC BUILDER PAGE IF CUSTOM ELEMENTS EXIST
  if (customElements) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-6 sm:p-12">
        {/* HEADER LOGO */}
        <div className="max-w-4xl mx-auto w-full flex items-center justify-between border-b border-slate-900 pb-4">
          <div className="flex items-center gap-2 font-heading font-black text-lg">
            <span className="w-8 h-8 rounded-xl bg-[#00A0FF] text-white flex items-center justify-center text-sm font-extrabold shadow-md">
              O
            </span>
            <span>Onepreneur&Co</span>
          </div>
          <span className="px-3 py-1 rounded-full bg-slate-900 text-amber-300 border border-slate-800 text-xs font-bold">
            🎁 100% GRATUIT
          </span>
        </div>

        {/* CUSTOM BUILDER ELEMENTS LAYOUT */}
        <div className="max-w-3xl mx-auto w-full my-8 space-y-6">
          {customElements.map((el) => {
            if (el.type === 'Heading') {
              return (
                <h1 key={el.id} className="text-3xl sm:text-5xl font-heading font-black text-white leading-tight text-center sm:text-left">
                  {el.content}
                </h1>
              );
            }

            if (el.type === 'Text') {
              return (
                <p key={el.id} className="text-base text-slate-300 leading-relaxed font-medium">
                  {el.content}
                </p>
              );
            }

            if (el.type === 'BulletList') {
              return (
                <ul key={el.id} className="space-y-2 text-sm font-bold text-emerald-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{el.content}</span>
                  </li>
                </ul>
              );
            }

            if (el.type === 'Image') {
              return (
                <div key={el.id} className="aspect-video rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
                  <img src={el.content} alt="Visual" className="w-full h-full object-cover" />
                </div>
              );
            }

            if (el.type === 'OptinForm' || el.type === 'FormInput' || el.type === 'ButtonCTA') {
              return (
                <div key={el.id} className="bg-slate-900/90 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6 my-6">
                  <div className="text-center space-y-1">
                    <h3 className="font-heading font-black text-xl text-white">Recevez votre accès gratuit</h3>
                    <p className="text-xs text-slate-400">Entrez vos coordonnées pour télécharger votre ressource.</p>
                  </div>

                  {success ? (
                    <div className="p-4 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-2xl text-center space-y-2">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                      <div className="font-bold text-xs">Inscription réussie ! Redirection...</div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {errorMsg && (
                        <div className="p-3 bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold rounded-xl">
                          {errorMsg}
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-300">Prénom (Optionnel)</label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="ex: Alexandre"
                          className="w-full px-4 py-3 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:ring-2 focus:ring-[#00A0FF] outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-300">Adresse Email *</label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="alexandre@exemple.com"
                          className="w-full px-4 py-3 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:ring-2 focus:ring-[#00A0FF] outline-none"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-[#00A0FF] hover:bg-[#0082D6] !text-white font-heading font-black text-sm py-3.5 rounded-xl shadow-lg gap-2"
                      >
                        <span>{submitting ? 'Validation...' : 'Recevoir mon accès gratuit'}</span>
                        <ArrowRight className="w-4 h-4 !text-white" />
                      </Button>

                      <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-medium pt-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                        <span>Garanti 100% sans spam. Désinscription en 1 clic.</span>
                      </div>
                    </form>
                  )}
                </div>
              );
            }

            if (el.type === 'Countdown') {
              return (
                <div key={el.id} className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-center space-y-1 my-4">
                  <div className="text-[10px] font-black text-amber-400 uppercase">Offre limitée</div>
                  <div className="text-2xl font-heading font-black text-amber-300">{el.content}</div>
                </div>
              );
            }

            if (el.type === 'Divider') {
              return <hr key={el.id} className="border-slate-800 my-6" />;
            }

            return (
              <div key={el.id} className="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-slate-200 font-bold text-xs">
                {el.content}
              </div>
            );
          })}
        </div>

        {/* FOOTER COPYRIGHT */}
        <div className="max-w-4xl mx-auto w-full text-center text-xs text-slate-500 border-t border-slate-900 pt-6">
          © {new Date().getFullYear()} Onepreneur&Co. Tous droits réservés.
        </div>
      </div>
    );
  }

  // FALLBACK RENDER OPTIN CAPTURE PAGE DEFAULT TEMPLATE
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-6 sm:p-12">
      {/* HEADER LOGO */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-2 font-heading font-black text-lg">
          <span className="w-8 h-8 rounded-xl bg-[#00A0FF] text-white flex items-center justify-center text-sm font-extrabold shadow-md">
            O
          </span>
          <span>Onepreneur&Co</span>
        </div>
        <span className="px-3 py-1 rounded-full bg-slate-900 text-amber-300 border border-slate-800 text-xs font-bold">
          🎁 100% GRATUIT
        </span>
      </div>

      {/* HERO & OPTIN FORM */}
      <div className="max-w-4xl mx-auto w-full my-12 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* LEFT CONTENT */}
        <div className="md:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Accès Immédiat Réservé</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-heading font-black text-white tracking-tight leading-tight">
            Votre emploi de rêve n est qu à un <span className="text-[#00A0FF]">clic.</span>
          </h1>

          <p className="text-base text-slate-300 leading-relaxed font-medium">
            Découvrez nos méthodes prouvées, nos templates d organisation et nos automations pour développer un business rentable sans vous épuiser.
          </p>

          <div className="space-y-3 pt-2">
            {[
              'Séquence d emails exclusives pour solopreneurs',
              'Guide complet offert au format PDF & Notion',
              'Accès 100% gratuit et sans engagement',
            ].map((text, idx) => (
              <div key={idx} className="flex items-center gap-3 text-xs font-bold text-slate-200">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT OPTIN FORM CARD */}
        <div className="md:col-span-5 bg-slate-900/90 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
          <div className="text-center space-y-1">
            <h3 className="font-heading font-black text-xl text-white">Recevez votre accès</h3>
            <p className="text-xs text-slate-400">Entrez vos coordonnées pour télécharger votre ressource.</p>
          </div>

          {success ? (
            <div className="p-4 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-2xl text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <div className="font-bold text-xs">Inscription réussie ! Redirection...</div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold rounded-xl">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Prénom (Optionnel)</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ex: Alexandre"
                  className="w-full px-4 py-3 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:ring-2 focus:ring-[#00A0FF] outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Adresse Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alexandre@exemple.com"
                  className="w-full px-4 py-3 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:ring-2 focus:ring-[#00A0FF] outline-none"
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#00A0FF] hover:bg-[#0082D6] !text-white font-heading font-black text-sm py-3.5 rounded-xl shadow-lg gap-2"
              >
                <span>{submitting ? 'Validation...' : 'Recevoir mon accès gratuit'}</span>
                <ArrowRight className="w-4 h-4 !text-white" />
              </Button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-medium pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>Garanti 100% sans spam. Désinscription en 1 clic.</span>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* FOOTER COPYRIGHT */}
      <div className="max-w-6xl mx-auto w-full text-center text-xs text-slate-500 border-t border-slate-900 pt-6">
        © {new Date().getFullYear()} Onepreneur&Co. Tous droits réservés.
      </div>
    </div>
  );
}
