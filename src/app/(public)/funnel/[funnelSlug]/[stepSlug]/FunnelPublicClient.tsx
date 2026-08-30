'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ArrowRight, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Editor, Frame } from '@craftjs/core';
import { Container } from '@/components/craft/user/Container';
import { Text } from '@/components/craft/user/Text';
import { Button as CraftButton } from '@/components/craft/user/Button';
import { Image as CraftImage } from '@/components/craft/user/Image';
import { FeatureGrid } from '@/components/craft/user/FeatureGrid';
import { Card } from '@/components/craft/user/Card';
import { LeadForm } from '@/components/craft/user/LeadForm';
import { Video } from '@/components/craft/user/Video';
import { Grid } from '@/components/craft/user/Grid';

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

  // Check if content is saved Craft.js JSON structure or legacy array
  let craftData: string | null = null;
  let customElements: any[] | null = null;
  let isFullWidth = true;

  if (step?.content) {
    try {
      const parsed = typeof step.content === 'string' ? JSON.parse(step.content) : step.content;
      if (parsed && (parsed.ROOT || parsed.content || typeof parsed === 'object')) {
        if (Array.isArray(parsed)) {
          customElements = parsed;
        } else {
          craftData = typeof step.content === 'string' ? step.content : JSON.stringify(step.content);
          if (parsed?.ROOT?.props?.pageLayoutMode === 'centered') {
            isFullWidth = false;
          } else {
            isFullWidth = true;
          }
        }
      }
    } catch (e) {
      console.error('Error parsing step content:', e);
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

  // RENDER CRAFT.JS SAVED CANVAS CONTENT PUBLICLY
  if (craftData) {
    if (isFullWidth) {
      return (
        <div className="min-h-screen bg-white text-slate-900 w-full overflow-x-hidden">
          <Editor
            resolver={{
              Container,
              Text,
              Button: CraftButton,
              Image: CraftImage,
              FeatureGrid,
              Card,
              LeadForm,
              Video,
              Grid,
            }}
            enabled={false}
          >
            <Frame data={craftData} />
          </Editor>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col items-center justify-center py-6 px-4">
        <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden min-h-[800px]">
          <Editor
            resolver={{
              Container,
              Text,
              Button: CraftButton,
              Image: CraftImage,
              FeatureGrid,
              Card,
              LeadForm,
              Video,
              Grid,
            }}
            enabled={false}
          >
            <Frame data={craftData} />
          </Editor>
        </div>
      </div>
    );
  }

  // RENDER MAISON BUILDER PAGE IF CUSTOM ELEMENTS ARRAY
  if (customElements) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-6 sm:p-12">
        <div className="max-w-5xl mx-auto w-full flex items-center justify-between border-b border-slate-900 pb-4">
          <div className="flex items-center gap-2 font-heading font-black text-lg">
            <span className="w-8 h-8 rounded-xl bg-[#00A0FF] text-white flex items-center justify-center text-sm font-extrabold shadow-md">
              O
            </span>
            <span>Onepreneur&Co</span>
          </div>
          <span className="px-3 py-1 rounded-full bg-slate-900 text-amber-300 border border-slate-800 text-xs font-bold">
            🎁 ACCÈS RÉSULTATS
          </span>
        </div>

        <div className="max-w-4xl mx-auto w-full my-8 space-y-8">
          {customElements.map((el: any) => {
            if (el.type === 'Heading') {
              return (
                <h1 key={el.id} className="text-3xl sm:text-5xl font-heading font-black text-white leading-tight text-center">
                  {el.content}
                </h1>
              );
            }

            if (el.type === 'Text') {
              return (
                <div
                  key={el.id}
                  className="text-base text-slate-300 leading-relaxed font-medium text-center max-w-2xl mx-auto"
                  dangerouslySetInnerHTML={{ __html: el.content }}
                />
              );
            }

            if (el.type === 'Countdown') {
              return (
                <div key={el.id} className="p-6 bg-slate-900 border border-slate-800 rounded-3xl text-center max-w-sm mx-auto space-y-2">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">⏳ Temps Restant</span>
                  <div className="text-4xl font-mono font-black text-white tracking-widest">{el.content || '24:00:00'}</div>
                </div>
              );
            }

            if (el.type === 'ButtonCTA') {
              return (
                <div key={el.id} className="text-center pt-2">
                  <a
                    href="#optin"
                    className="inline-flex items-center justify-center px-8 py-4 bg-[#00A0FF] hover:bg-[#0080FF] text-white font-heading font-black text-base rounded-2xl shadow-xl transition-all hover:scale-105"
                  >
                    {el.data?.buttonText || el.content || 'Accéder Maintenant 🚀'}
                  </a>
                </div>
              );
            }

            if (el.type === 'FormInput') {
              return (
                <div key={el.id} className="max-w-md mx-auto space-y-1.5 text-left">
                  <label className="text-xs font-bold text-slate-300 block">{el.data?.title || 'Champ de formulaire'}</label>
                  <input
                    type={el.data?.inputType || 'email'}
                    placeholder={el.data?.placeholder || el.content || 'votre.email@exemple.com'}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-[#00A0FF]"
                  />
                </div>
              );
            }

            if (el.type === 'Checkbox') {
              return (
                <div key={el.id} className="max-w-md mx-auto p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                  <label className="flex items-center gap-3 cursor-pointer text-sm font-semibold text-slate-300">
                    <input type="checkbox" defaultChecked className="w-5 h-5 rounded text-[#00A0FF] bg-slate-950 border-slate-800 accent-[#00A0FF]" />
                    <span>{el.data?.label || el.data?.title || el.content || 'J accepte la politique de confidentialité'}</span>
                  </label>
                </div>
              );
            }

            if (el.type === 'OptinForm') {
              return (
                <div key={el.id} id="optin" className="max-w-md mx-auto bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-4">
                  <div className="text-center font-heading font-black text-lg text-white">
                    {el.content || 'Recevez votre accès offert par email'}
                  </div>
                  {success ? (
                    <div className="p-4 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-2xl text-center font-bold text-xs">
                      ✓ Inscription validée ! Redirection en cours...
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-3">
                      {errorMsg && (
                        <div className="p-2.5 bg-rose-500/20 text-rose-300 text-xs rounded-xl">{errorMsg}</div>
                      )}
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Votre Prénom..."
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:ring-2 focus:ring-[#00A0FF]"
                      />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Votre Adresse Email *"
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:ring-2 focus:ring-[#00A0FF]"
                      />
                      <Button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-[#00A0FF] hover:bg-[#0082D6] !text-white font-heading font-black text-sm py-3.5 rounded-xl shadow-lg"
                      >
                        {submitting ? 'Validation...' : 'Recevoir mon accès gratuit'}
                      </Button>
                    </form>
                  )}
                </div>
              );
            }

            if (el.type === 'BlockFeat4ColImg' || el.type === 'BlockFeat3ColImg') {
              const items = el.data?.items || [];
              const cols = el.type === 'BlockFeat4ColImg' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4' : 'grid-cols-1 md:grid-cols-3';

              return (
                <div key={el.id} className="space-y-6 bg-slate-900/60 p-6 sm:p-8 rounded-3xl border border-slate-800">
                  {el.data?.title && (
                    <h3 className="text-2xl font-heading font-black text-white text-center">
                      {el.data.title}
                    </h3>
                  )}
                  <div className={`grid ${cols} gap-6`}>
                    {items.map((it: any, idx: number) => (
                      <div key={idx} className="space-y-3 flex flex-col items-center text-center bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                        {it.img && (
                          <div className="w-full h-36 rounded-xl overflow-hidden shadow-md">
                            <img src={it.img} alt={it.title} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <h4 className="font-heading font-extrabold text-sm text-white uppercase">{it.title}</h4>
                        <p className="text-xs text-slate-400 font-medium leading-relaxed">{it.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            if (el.type === 'BlockFeat2ColIconsLeft' || el.type === 'BlockFeat4ColDark') {
              const items = el.data?.items || [];

              return (
                <div key={el.id} className="space-y-6 bg-slate-900/60 p-6 sm:p-8 rounded-3xl border border-slate-800">
                  {el.data?.title && (
                    <h3 className="text-2xl font-heading font-black text-white text-center">
                      {el.data.title}
                    </h3>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {items.map((it: any, idx: number) => (
                      <div key={idx} className="p-4 bg-slate-950/90 rounded-2xl border border-slate-800 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-[#00A0FF] flex items-center justify-center font-bold shrink-0 mt-0.5">
                          ✓
                        </div>
                        <div>
                          <h4 className="font-heading font-extrabold text-sm text-white">{it.title}</h4>
                          <p className="text-xs text-slate-400 font-medium leading-relaxed mt-1">{it.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            return (
              <div key={el.id} className="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-slate-200 font-bold text-xs">
                {el.content}
              </div>
            );
          })}
        </div>

        <div className="max-w-5xl mx-auto w-full text-center text-xs text-slate-500 border-t border-slate-900 pt-6">
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
