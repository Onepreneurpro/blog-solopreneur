'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ArrowRight, Mail, ShieldCheck, Sparkles } from 'lucide-react';
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

  // Check if content is saved Maison Builder customElements array
  let customElements: any[] | null = null;

  if (step?.content) {
    try {
      const parsed = typeof step.content === 'string' ? JSON.parse(step.content) : step.content;
      if (Array.isArray(parsed)) {
        customElements = parsed;
      } else if (parsed?.elements && Array.isArray(parsed.elements)) {
        customElements = parsed.elements;
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
            if (el.type === 'BlockNavArizona') {
              return (
                <nav key={el.id} className="bg-[#40B5A6] text-white py-3.5 px-6 rounded-2xl shadow-sm my-4">
                  <div className="flex items-center justify-center gap-4 sm:gap-8 text-[11px] font-extrabold tracking-widest uppercase">
                    {['HOME', 'ABOUT', 'SERVICES', 'BLOG', 'CONTACT', 'EXTRA'].map((link, i) => (
                      <span key={i} className="hover:opacity-80 cursor-pointer">{link}</span>
                    ))}
                  </div>
                </nav>
              );
            }

            if (el.type === 'ContentBox') {
              const layoutMode = el.data?.layoutMode || 'grid-3';
              const gridClass =
                layoutMode === 'masonry'
                  ? 'columns-1 md:columns-3 gap-6 space-y-6 [&>div]:break-inside-avoid'
                  : layoutMode === 'vertical'
                  ? 'flex flex-col space-y-4'
                  : layoutMode === 'grid-2'
                  ? 'grid grid-cols-1 md:grid-cols-2 gap-6 items-start'
                  : layoutMode === 'grid-4'
                  ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 items-start'
                  : layoutMode === 'flex-row'
                  ? 'flex flex-wrap items-start gap-6'
                  : 'grid grid-cols-1 md:grid-cols-3 gap-6 items-start';

              return (
                <div key={el.id} className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl space-y-6 border border-slate-100 my-6 text-slate-800">
                  {el.data?.title && (
                    <h3 className="text-2xl font-heading font-black text-slate-900 border-b border-slate-100 pb-3">
                      {el.data.title}
                    </h3>
                  )}
                  <div className={gridClass}>
                    {(el.data?.children || []).map((child: any, cIdx: number) => {
                      if (child.type === 'Heading') {
                        return <h4 key={child.id || cIdx} className="text-xl font-heading font-bold text-slate-900">{child.content}</h4>;
                      }
                      if (child.type === 'Text') {
                        return <p key={child.id || cIdx} className="text-sm text-slate-600 font-medium leading-relaxed">{child.content}</p>;
                      }
                      if (child.type === 'Image') {
                        return (
                          <div key={child.id || cIdx} className="w-full rounded-2xl overflow-hidden shadow-md max-h-96">
                            <img src={child.content} alt="Content" className="w-full h-full object-cover" />
                          </div>
                        );
                      }
                      if (child.type === 'ButtonCTA') {
                        return (
                          <div key={child.id || cIdx} className="text-[#00A0FF] text-center pt-2">
                            <button type="button" className="px-8 py-3.5 bg-[#00A0FF] hover:bg-[#0080FF] text-white font-bold text-sm rounded-xl shadow-lg transition-all hover:scale-[1.02]">
                              {child.content || 'Bouton d action'}
                            </button>
                          </div>
                        );
                      }
                      return <div key={child.id || cIdx} className="text-sm text-slate-700">{child.content}</div>;
                    })}
                  </div>
                </div>
              );
            }

            if (el.type === 'BlockHeroArizona') {
              return (
                <div key={el.id} className="bg-[#FEF5D7] p-6 sm:p-10 rounded-3xl border border-amber-100/60 shadow-xl space-y-6 text-slate-800 my-6">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                    <div className="md:col-span-6 aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border-4 border-white">
                      <img
                        src={el.data?.img || 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80'}
                        alt="Hero"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="md:col-span-6 bg-white p-6 sm:p-8 rounded-2xl shadow-md space-y-4 border border-amber-100 text-left">
                      <div className="text-[10px] font-extrabold text-[#D69A3A] uppercase tracking-widest">
                        {el.data?.tag || 'MARKETING SELLS WHEN'}
                      </div>
                      <h1 className="text-2xl sm:text-4xl font-serif font-black text-[#D69A3A]">
                        {el.data?.title || el.content || 'Your Brand Voice, Dressed in Technicolor'}
                      </h1>
                      <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                        {el.data?.desc || 'Bold copy that demands attention, sparks connection, and converts — without ever toning it down.'}
                      </p>
                      <div>
                        <button
                          type="button"
                          className="bg-[#70A327] hover:bg-[#5e8b20] text-white font-extrabold text-xs uppercase tracking-wider px-6 py-3.5 rounded-lg shadow-md transition-all hover:scale-105"
                        >
                          {el.data?.buttonText || 'GET STARTED NOW'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            if (el.type === 'BlockBioArizona') {
              return (
                <div key={el.id} className="bg-white p-6 sm:p-10 rounded-3xl shadow-xl space-y-6 text-slate-800 border border-slate-100 my-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                    <div className="space-y-4 text-left">
                      <h2 className="text-3xl sm:text-4xl font-serif font-black text-[#D69A3A]">
                        {el.data?.title || "Hey, I'm Claire"}
                      </h2>
                      <div className="text-sm sm:text-base font-serif font-bold text-[#40B5A6]">
                        {el.data?.subtitle || 'Welcome to the land of highlighter-worthy copy!'}
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed whitespace-pre-line">
                        {el.data?.desc || 'The Painted Paragraph exists to help women take up more space—with words that radiate power, personality, and purpose. Because when your copy clicks, everything changes.'}
                      </p>
                      <div>
                        <button
                          type="button"
                          className="bg-[#70A327] hover:bg-[#5e8b20] text-white font-extrabold text-xs uppercase tracking-wider px-6 py-3.5 rounded-lg shadow-md transition-all hover:scale-105"
                        >
                          {el.data?.buttonText || 'GET STARTED NOW'}
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <div className="rounded-3xl overflow-hidden shadow-xl border-4 border-amber-50 max-w-xs">
                        <img
                          src={el.data?.img || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80'}
                          alt="Claire"
                          className="w-full h-80 object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            if (el.type === 'BlockSoulSistersArizona') {
              return (
                <div key={el.id} className="bg-white p-6 rounded-3xl shadow-xl space-y-6 text-slate-800 border border-slate-100 my-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="rounded-2xl overflow-hidden shadow-md border border-slate-100">
                      <img
                        src={el.data?.img || 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80'}
                        alt="Workspace"
                        className="w-full h-72 object-cover"
                      />
                    </div>
                    <div className="bg-[#E6F7F5] border border-[#BCEEE6] p-6 rounded-2xl space-y-4 text-left">
                      <h3 className="text-xl font-serif font-black text-[#40B5A6]">
                        {el.data?.title || 'We May Be Soul Sisters If...'}
                      </h3>
                      <div className="space-y-3">
                        {(el.data?.items || [
                          { id: '1', desc: 'Toffee bonbon gummy bears jujubes pudding cheesecake. Pudding jujubes gingerbread jujubes bonbon sweet powder.' },
                          { id: '2', desc: 'Toffee bonbon gummy bears jujubes pudding cheesecake. Pudding jujubes gingerbread jujubes bonbon sweet powder.' },
                          { id: '3', desc: 'Toffee bonbon gummy bears jujubes pudding cheesecake. Pudding jujubes gingerbread jujubes bonbon sweet powder.' },
                          { id: '4', desc: 'Toffee bonbon gummy bears jujubes pudding cheesecake. Pudding jujubes gingerbread jujubes bonbon sweet powder.' },
                        ]).map((it: any, i: number) => (
                          <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700 font-medium leading-relaxed">
                            <span className="text-[#E85D75] font-bold text-sm shrink-0">♥</span>
                            <span>{it.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            if (el.type === 'Block3ColArcadeArizona') {
              return (
                <div key={el.id} className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl space-y-8 text-slate-800 border border-slate-100 my-6">
                  <div className="text-center">
                    <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#D69A3A]">
                      {el.data?.title || 'Copy that Pops. Strategy that Sells.'}
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {(el.data?.items || [
                      { id: '1', subtitle: 'The Masterpiece', title: 'EXCLUSIVE VIP DAYS', theme: 'teal', img: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=500&q=80', desc: 'Toffee bonbon gummy bears jujubes pudding cheesecake.' },
                      { id: '2', subtitle: 'The Gallery', title: 'LAUNCH & COPY STRATEGY', theme: 'mint', img: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=500&q=80', desc: 'Toffee bonbon gummy bears jujubes pudding cheesecake.' },
                      { id: '3', subtitle: 'The Sketch', title: 'BRAND VOICE INTENSIVE', theme: 'yellow', img: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=500&q=80', desc: 'Toffee bonbon gummy bears jujubes pudding cheesecake.' },
                    ]).map((col: any, i: number) => {
                      const bgHeader = col.theme === 'mint' ? 'bg-[#52C2A5]' : col.theme === 'yellow' ? 'bg-[#F3C035]' : 'bg-[#40B5A6]';
                      const textColor = col.theme === 'mint' ? 'text-[#52C2A5]' : col.theme === 'yellow' ? 'text-[#F3C035]' : 'text-[#40B5A6]';

                      const imgHeight = col.imgHeight || el.data?.imgHeight || 'h-56';
                      const imgShape = col.imgShape || el.data?.imgShape || 'arcade';
                      const shapeClass = imgShape === 'arcade' ? 'rounded-t-[80px]' : imgShape === 'circle' ? 'rounded-full' : imgShape === 'square' ? 'rounded-none' : 'rounded-3xl';
                      const imgFit = col.imgObjectFit || el.data?.imgObjectFit || 'object-cover';
                      const imgPos = col.imgObjectPosition || el.data?.imgObjectPosition || 'center';

                      return (
                        <div key={i} className="flex flex-col items-center">
                          <div className={`w-full ${imgHeight} ${shapeClass} overflow-hidden shadow-sm border border-slate-100 flex items-center justify-center`}>
                            <img src={col.img} alt={col.title} className={`w-full h-full ${imgFit}`} style={{ objectPosition: imgPos }} />
                          </div>
                          <div className={`text-[10px] font-serif font-extrabold ${textColor} italic my-1.5`}>{col.subtitle}</div>
                          <div className={`w-full ${bgHeader} text-white p-5 rounded-b-2xl text-center space-y-1.5 shadow-md`}>
                            <div className="text-xs font-extrabold uppercase tracking-wider text-white">{col.title}</div>
                            <p className="text-[10px] text-white/90 leading-relaxed font-medium">{col.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }

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

            if (el.type === 'Image') {
              return (
                <div key={el.id} className="max-w-3xl mx-auto flex justify-center">
                  <div
                    className="overflow-hidden shadow-lg transition-all"
                    style={{
                      width: el.data?.imgWidth ? `${el.data.imgWidth}px` : '100%',
                      maxWidth: '100%',
                      height: el.data?.imgSize ? `${el.data.imgSize}px` : 'auto',
                      borderRadius: `${el.data?.borderRadius !== undefined ? el.data.borderRadius : 16}px`,
                    }}
                  >
                    <img
                      src={el.data?.img || el.content}
                      alt={el.data?.alt || 'Image'}
                      className="w-full h-full"
                      style={{
                        objectFit: (el.data?.objectFit as any) || 'cover',
                        objectPosition: `${el.data?.posX !== undefined ? el.data.posX : 50}% ${el.data?.posY !== undefined ? el.data.posY : 50}%`,
                        transform: `scale(${(el.data?.imgZoom || 100) / 100})`,
                      }}
                    />
                  </div>
                </div>
              );
            }

            if (el.type === 'BlockFeat4ColImg' || el.type === 'Col4' || el.type === 'BlockFeat3ColImg' || el.type === 'Col3') {
              const defaultData = el.type.includes('4') || el.type === 'Col4'
                ? {
                    title: 'GRILLE 4 COLONNES',
                    items: [
                      { id: '1', title: 'BASES', img: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=400&q=80', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit integer sed.' },
                      { id: '2', title: 'CUISINER', img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit integer sed.' },
                      { id: '3', title: 'EXTÉRIEUR', img: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=400&q=80', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit integer sed.' },
                      { id: '4', title: 'DRESSAGE', img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit integer sed.' },
                    ],
                  }
                : {
                    title: 'Le Savoir-Faire des Experts à Votre Portée',
                    items: [
                      { id: '1', title: 'Le savoir des experts', img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80', desc: 'Accédez à des connaissances approfondies et testées sur le terrain.' },
                      { id: '2', title: 'Des leçons pratiques', img: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=400&q=80', desc: 'Des exercices concrets pour passer immédiatement à l action.' },
                      { id: '3', title: 'Nouvelles relations', img: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=400&q=80', desc: 'Rejoignez un réseau actif d entrepreneurs passionnés.' },
                    ],
                  };

              const items = el.data?.items && el.data.items.length > 0 ? el.data.items : defaultData.items;
              const title = el.data?.title || el.content || defaultData.title;
              const cols = (el.type.includes('4') || el.type === 'Col4') ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4' : 'grid-cols-1 md:grid-cols-3';

              return (
                <div key={el.id} className="space-y-6 bg-slate-900/60 p-6 sm:p-8 rounded-3xl border border-slate-800">
                  {title && (
                    <h3 className="text-2xl font-heading font-black text-white text-center">
                      {title}
                    </h3>
                  )}
                  <div className={`grid ${cols} gap-6`}>
                    {items.map((it: any, idx: number) => (
                      <div key={idx} className="space-y-3 flex flex-col items-center text-center bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                        {it.img && (
                          <div className="w-full flex justify-center">
                            <div
                              className="relative overflow-hidden shadow-md transition-all w-full"
                              style={{
                                width: it.imgWidth ? `${it.imgWidth}px` : '100%',
                                maxWidth: '100%',
                                height: it.imgSize ? `${it.imgSize}px` : '220px',
                                borderRadius: `${it.borderRadius !== undefined ? it.borderRadius : 16}px`,
                              }}
                            >
                              <img
                                src={it.img}
                                alt={it.alt || it.title}
                                className="w-full h-full transition-transform duration-100 select-none"
                                style={{
                                  objectFit: (it.objectFit as any) || 'cover',
                                  objectPosition: `${it.posX !== undefined ? it.posX : 50}% ${it.posY !== undefined ? it.posY : 50}%`,
                                  transform: `scale(${(it.imgZoom || 100) / 100})`,
                                }}
                              />
                            </div>
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

            if (el.type === 'BlockFeat2ColIconsLeft' || el.type === 'Col2' || el.type === 'BlockFeat4ColDark') {
              const defaultData = {
                title: 'Nos Services & Garanties',
                items: [
                  { id: '1', title: 'Succès du projet', desc: 'Accompagnement pas à pas pour garantir l atteinte de vos objectifs.' },
                  { id: '2', title: 'Stratégie de Marque', desc: 'Positionnement fort pour vous démarquer sur votre marché.' },
                  { id: '3', title: 'Un Support Excellent', desc: 'Une équipe réactive disponible pour répondre à toutes vos questions.' },
                  { id: '4', title: 'Template Responsive', desc: 'Des interfaces optimisées pour tous les écrans mobiles et ordinateurs.' },
                ],
              };

              const items = el.data?.items && el.data.items.length > 0 ? el.data.items : defaultData.items;
              const title = el.data?.title || el.content || defaultData.title;

              return (
                <div key={el.id} className="space-y-6 bg-slate-900/60 p-6 sm:p-8 rounded-3xl border border-slate-800">
                  {title && (
                    <h3 className="text-2xl font-heading font-black text-white text-center">
                      {title}
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
