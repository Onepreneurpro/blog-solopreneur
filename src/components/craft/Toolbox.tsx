'use client';

import React from 'react';
import { useEditor, Element } from '@craftjs/core';
import { Container } from './user/Container';
import { Text } from './user/Text';
import { Button } from './user/Button';
import { Image } from './user/Image';
import { FeatureGrid } from './user/FeatureGrid';
import { Card } from './user/Card';
import { LeadForm } from './user/LeadForm';
import { Video } from './user/Video';
import {
  Layout,
  Type,
  MousePointerClick,
  Image as ImageIcon,
  Grid,
  CreditCard,
  Mail,
  Video as VideoIcon,
  GripVertical,
} from 'lucide-react';

export const Toolbox = () => {
  const { connectors } = useEditor();

  const components = [
    {
      label: 'Section Conteneur',
      icon: Layout,
      color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
      element: (
        <Element is={Container} padding={40} bgGradient="bg-gradient-to-r from-blue-600 to-indigo-900" canvas>
          <Text text="Nouveau Conteneur Héro 🚀" fontSize={32} textColor="#ffffff" />
          <Text text="Glissez-déposez des sous-éléments ici..." fontSize={16} textColor="#e2e8f0" />
          <Button text="Explorer l offre" align="center" />
        </Element>
      ),
    },
    {
      label: 'Titre / Texte',
      icon: Type,
      color: 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100',
      element: <Text text="Votre Titre de Section..." fontSize={28} />,
    },
    {
      label: 'Bouton d Action',
      icon: MousePointerClick,
      color: 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100',
      element: <Button text="👉 Accéder à l Offre Spéciale" />,
    },
    {
      label: 'Image PC (1 Clic)',
      icon: ImageIcon,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
      element: <Image />,
    },
    {
      label: 'Grille 4 Colonnes',
      icon: Grid,
      color: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100',
      element: <FeatureGrid columns={4} />,
    },
    {
      label: 'Carte d Info',
      icon: CreditCard,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100',
      element: <Card />,
    },
    {
      label: 'Formulaire Capture',
      icon: Mail,
      color: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100',
      element: <LeadForm />,
    },
    {
      label: 'Intégration Vidéo',
      icon: VideoIcon,
      color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
      element: <Video />,
    },
  ];

  return (
    <div className="w-72 bg-white border-r border-slate-200 flex flex-col h-full shrink-0 select-none">
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <h2 className="text-xs font-black font-heading uppercase tracking-wider text-slate-700 flex items-center gap-2">
          <span>📦</span>
          <span>COMPOSANTS CRAFT.JS</span>
        </h2>
        <p className="text-[11px] text-slate-500 font-medium mt-1">
          Glissez un composant directement sur le canvas au centre.
        </p>
      </div>

      <div className="p-3 space-y-2.5 overflow-y-auto flex-1">
        {components.map((item, idx) => {
          const Icon = item.icon;

          return (
            <div
              key={idx}
              ref={(ref: HTMLDivElement | null) => {
                if (ref) connectors.create(ref, item.element);
              }}
              className={`p-3 rounded-2xl border cursor-grab active:cursor-grabbing flex items-center justify-between transition-all shadow-xs hover:scale-[1.02] ${item.color}`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className="w-4 h-4 shrink-0" />
                <span className="text-xs font-black font-heading">{item.label}</span>
              </div>
              <GripVertical className="w-4 h-4 opacity-40 shrink-0" />
            </div>
          );
        })}
      </div>
    </div>
  );
};
