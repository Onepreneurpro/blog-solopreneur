'use client';

import React from 'react';
import { useNode } from '@craftjs/core';
import { FolderOpen, Trash2 } from 'lucide-react';

export interface ImageProps {
  src?: string;
  alt?: string;
  height?: number;
  borderRadius?: number;
  align?: 'left' | 'center' | 'right';
}

export const Image = ({
  src = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
  alt = 'Image illustration',
  height = 300,
  borderRadius = 20,
  align = 'center',
}: ImageProps) => {
  const {
    id,
    connectors: { connect, drag },
    selected,
    actions: { setProp },
  } = useNode((node) => ({
    selected: node.events.selected,
  }));

  const inputId = `craft-img-input-${id}`;

  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  return (
    <div
      ref={(ref: HTMLDivElement | null) => {
        if (ref) connect(drag(ref));
      }}
      className={`my-4 flex ${alignClasses[align]} ${
        selected ? 'ring-2 ring-[#00A0FF] p-1 rounded-2xl' : ''
      }`}
    >
      <div className="relative group/img max-w-full overflow-hidden shadow-xl" style={{ borderRadius: `${borderRadius}px` }}>
        <label
          htmlFor={inputId}
          className="block cursor-pointer relative"
          style={{ height: `${height}px` }}
        >
          {src ? (
            <img
              src={src}
              alt={alt}
              className="w-full h-full object-cover select-none pointer-events-none"
            />
          ) : (
            <div
              className="w-full h-full bg-slate-100 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 font-bold text-xs p-6 gap-2"
            >
              <FolderOpen className="w-8 h-8 text-[#00A0FF]" />
              <span>🖼️ Aucune image sélectionnée</span>
              <span className="text-[10px] text-slate-500 font-normal">Cliquez pour choisir un fichier PC</span>
            </div>
          )}

          {/* HOVER OVERLAY */}
          <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-bold gap-2 p-3 text-center pointer-events-none">
            <FolderOpen className="w-8 h-8 text-[#00A0FF]" />
            <span className="px-3 py-1.5 bg-[#00A0FF] text-white font-black text-xs rounded-xl shadow-lg">
              📁 Choisir une photo (PC)
            </span>
          </div>

          {/* TRASH ICON BUTTON AT BOTTOM RIGHT */}
          {src && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setProp((props: ImageProps) => {
                  props.src = '';
                });
              }}
              title="Supprimer l image (1 clic)"
              className="absolute bottom-3 right-3 w-8 h-8 bg-rose-600 hover:bg-rose-700 text-white rounded-xl flex items-center justify-center shadow-lg transition-transform hover:scale-110 opacity-90 group-hover/img:opacity-100 z-30"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </label>

        {/* HIDDEN INPUT LINKED BY HTMLFOR */}
        <input
          id={inputId}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (ev) => {
                setProp((props: ImageProps) => {
                  props.src = ev.target?.result as string;
                });
              };
              reader.readAsDataURL(file);
            }
          }}
        />
      </div>
    </div>
  );
};

(Image as any).craft = {
  displayName: 'Image PC',
  props: {
    src: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    alt: 'Image illustration',
    height: 300,
    borderRadius: 20,
    align: 'center',
  },
  rules: {
    canDrag: () => true,
  },
};
