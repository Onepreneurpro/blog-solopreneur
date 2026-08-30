'use client';

import React, { useState } from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

export interface LeadFormProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  width?: number;
  height?: number;
}

export const LeadForm = ({
  title = 'Recevez votre Guide Offert 🎁',
  subtitle = 'Entrez votre prénom et adresse email ci-dessous pour recevoir l accès immédiat.',
  buttonText = 'Télécharger mon guide gratuit',
  width = 100,
  height,
}: LeadFormProps) => {
  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  const {
    connectors: { connect, drag },
    selected,
    actions: { setProp },
  } = useNode((node) => ({
    selected: node.events.selected,
  }));

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // PUBLIC READ-ONLY & INTERACTIVE VIEW FOR VISITORS
  if (!enabled) {
    return (
      <div
        className="my-8 max-w-lg mx-auto p-8 bg-white rounded-3xl border border-slate-200 shadow-2xl text-center space-y-5"
        style={{
          width: `${width}%`,
          minHeight: height ? `${height}px` : undefined,
        }}
      >
        <div className="space-y-2">
          <h3 className="font-heading font-black text-2xl text-slate-900 px-2">
            {title}
          </h3>
          <p className="text-xs text-slate-500 font-medium p-1">
            {subtitle}
          </p>
        </div>

        {submitted ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <div className="font-bold text-xs">Merci ! Votre demande a été validée.</div>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (email) setSubmitted(true);
            }}
            className="space-y-3"
          >
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Votre Prénom..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-[#00A0FF]"
            />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Votre Adresse Email *"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-[#00A0FF]"
            />
            <button
              type="submit"
              className="w-full py-4 bg-[#00A0FF] hover:bg-[#0080FF] text-white font-black text-xs rounded-xl shadow-lg transition-all font-heading cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{buttonText}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium pt-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% sécurisé. Pas de spam.</span>
            </div>
          </form>
        )}
      </div>
    );
  }

  // BUILDER EDITOR VIEW
  return (
    <div
      ref={(ref: HTMLDivElement | null) => {
        if (ref) connect(drag(ref));
      }}
      className={`my-8 max-w-lg mx-auto p-8 bg-white rounded-3xl border border-slate-200 shadow-2xl text-center space-y-5 transition-all ${
        selected ? 'ring-2 ring-[#00A0FF]' : 'hover:ring-1 hover:ring-blue-300'
      }`}
      style={{
        width: `${width}%`,
        minHeight: height ? `${height}px` : undefined,
      }}
    >
      <div className="space-y-2">
        <h3
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => {
            setProp((props: LeadFormProps) => {
              props.title = e.currentTarget.innerText;
            });
          }}
          className="font-heading font-black text-2xl text-slate-900 outline-none focus:ring-2 focus:ring-[#00A0FF] rounded-lg px-2 cursor-text"
        >
          {title}
        </h3>
        <p
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => {
            setProp((props: LeadFormProps) => {
              props.subtitle = e.currentTarget.innerText;
            });
          }}
          className="text-xs text-slate-500 font-medium outline-none focus:ring-2 focus:ring-[#00A0FF] rounded-lg p-1 cursor-text"
        >
          {subtitle}
        </p>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-3">
        <input
          type="text"
          placeholder="Votre Prénom..."
          disabled
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
        />
        <input
          type="email"
          placeholder="Votre Adresse Email..."
          disabled
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
        />
        <button
          type="button"
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => {
            setProp((props: LeadFormProps) => {
              props.buttonText = e.currentTarget.innerText;
            });
          }}
          className="w-full py-4 bg-[#00A0FF] hover:bg-[#0080FF] text-white font-black text-xs rounded-xl shadow-lg transition-all font-heading cursor-text outline-none focus:ring-2 focus:ring-blue-300"
        >
          {buttonText}
        </button>
      </form>
    </div>
  );
};

(LeadForm as any).craft = {
  displayName: 'Formulaire de Capture',
  props: {
    title: 'Recevez votre Guide Offert 🎁',
    subtitle: 'Entrez votre prénom et adresse email ci-dessous pour recevoir l accès immédiat.',
    buttonText: 'Télécharger mon guide gratuit',
    width: 100,
  },
  rules: {
    canDrag: () => true,
  },
};
