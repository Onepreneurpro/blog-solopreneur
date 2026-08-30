'use client';

import React from 'react';
import { useNode } from '@craftjs/core';

export interface LeadFormProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
}

export const LeadForm = ({
  title = 'Recevez votre Guide Offert 🎁',
  subtitle = 'Entrez votre prénom et adresse email ci-dessous pour recevoir l accès immédiat.',
  buttonText = 'Télécharger mon guide gratuit',
}: LeadFormProps) => {
  const {
    connectors: { connect, drag },
    selected,
    actions: { setProp },
  } = useNode((node) => ({
    selected: node.events.selected,
  }));

  return (
    <div
      ref={(ref: HTMLDivElement | null) => {
        if (ref) connect(drag(ref));
      }}
      className={`my-8 max-w-lg mx-auto p-8 bg-white rounded-3xl border border-slate-200 shadow-2xl text-center space-y-5 transition-all ${
        selected ? 'ring-2 ring-[#00A0FF]' : 'hover:ring-1 hover:ring-blue-300'
      }`}
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
  },
  rules: {
    canDrag: () => true,
  },
};
