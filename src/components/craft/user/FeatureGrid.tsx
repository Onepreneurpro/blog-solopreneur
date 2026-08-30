'use client';

import React from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { FolderOpen, Trash2 } from 'lucide-react';

export interface FeatureGridProps {
  columns?: 3 | 4;
  items?: Array<{
    title: string;
    desc: string;
    img: string;
  }>;
  imgHeight?: number;
  borderRadius?: number;
}

export const FeatureGrid = ({
  columns = 4,
  items = [
    {
      title: 'BASES',
      desc: 'Masterisez les fondations essentielles de la réussite.',
      img: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=400&q=80',
    },
    {
      title: 'CUISINER',
      desc: 'Recettes et formules étape par étape prêtes à l emploi.',
      img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
    },
    {
      title: 'EXTÉRIEUR',
      desc: 'Développez votre visibilité et votre autorité externe.',
      img: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=400&q=80',
    },
    {
      title: 'DRESSAGE',
      desc: 'Optimisez vos processus et automatisez vos résultats.',
      img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80',
    },
  ],
  imgHeight = 220,
  borderRadius = 16,
}: FeatureGridProps) => {
  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  const {
    id,
    connectors: { connect, drag },
    selected,
    actions: { setProp },
  } = useNode((node) => ({
    selected: node.events.selected,
  }));

  const gridCols = columns === 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4';

  // PUBLIC READ-ONLY VIEW
  if (!enabled) {
    return (
      <div className="my-6 p-6 bg-white rounded-3xl border border-slate-200 shadow-xl">
        <div className={`grid ${gridCols} gap-6`}>
          {items.map((col, i) => (
            <div key={i} className="flex flex-col items-center text-center space-y-3">
              <div
                className="w-full overflow-hidden shadow-md"
                style={{ height: `${imgHeight}px`, borderRadius: `${borderRadius}px` }}
              >
                {col.img ? (
                  <img src={col.img} alt={col.title} className="w-full h-full object-cover" />
                ) : null}
              </div>
              <h3 className="font-heading font-black text-sm tracking-wider uppercase text-slate-900">
                {col.title}
              </h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                {col.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // BUILDER EDITOR VIEW
  return (
    <div
      ref={(ref: HTMLDivElement | null) => {
        if (ref) connect(drag(ref));
      }}
      className={`my-6 p-6 bg-white rounded-3xl border border-slate-200 shadow-xl transition-all ${
        selected ? 'ring-2 ring-[#00A0FF]' : 'hover:ring-1 hover:ring-blue-300'
      }`}
    >
      <div className={`grid ${gridCols} gap-6`}>
        {items.map((col, i) => {
          const inputId = `craft-grid-img-${id}-${i}`;

          return (
            <div key={i} className="flex flex-col items-center text-center space-y-3">
              {/* IMAGE FRAME WITH FILE PICKER */}
              <div className="w-full relative group/img overflow-hidden shadow-md" style={{ borderRadius: `${borderRadius}px` }}>
                <label
                  htmlFor={inputId}
                  className="block cursor-pointer relative"
                  style={{ height: `${imgHeight}px` }}
                >
                  {col.img ? (
                    <img
                      src={col.img}
                      alt={col.title}
                      className="w-full h-full object-cover select-none pointer-events-none"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-100 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 font-bold text-xs p-3 gap-1">
                      <FolderOpen className="w-6 h-6 text-[#00A0FF]" />
                      <span>🖼️ Aucune photo</span>
                    </div>
                  )}

                  {/* HOVER OVERLAY */}
                  <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-bold gap-1 p-2 text-center pointer-events-none">
                    <FolderOpen className="w-6 h-6 text-[#00A0FF]" />
                    <span className="px-2.5 py-1 bg-[#00A0FF] text-white font-black text-[10px] rounded-md shadow-md">
                      📁 Photo PC
                    </span>
                  </div>

                  {/* TRASH BUTTON */}
                  {col.img && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setProp((props: FeatureGridProps) => {
                          const updated = [...(props.items || [])];
                          updated[i] = { ...updated[i], img: '' };
                          props.items = updated;
                        });
                      }}
                      title="Supprimer l image (1 clic)"
                      className="absolute bottom-2 right-2 w-7 h-7 bg-rose-600 hover:bg-rose-700 text-white rounded-lg flex items-center justify-center shadow-lg transition-transform hover:scale-110 opacity-90 group-hover/img:opacity-100 z-30"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </label>

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
                        setProp((props: FeatureGridProps) => {
                          const updated = [...(props.items || [])];
                          updated[i] = { ...updated[i], img: ev.target?.result as string };
                          props.items = updated;
                        });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>

              {/* INLINE TITLE */}
              <h3
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => {
                  setProp((props: FeatureGridProps) => {
                    const updated = [...(props.items || [])];
                    updated[i] = { ...updated[i], title: e.currentTarget.innerText };
                    props.items = updated;
                  });
                }}
                className="font-heading font-black text-sm tracking-wider uppercase text-slate-900 outline-none focus:ring-2 focus:ring-[#00A0FF] rounded-md px-1 cursor-text"
              >
                {col.title}
              </h3>

              {/* INLINE DESCRIPTION */}
              <p
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => {
                  setProp((props: FeatureGridProps) => {
                    const updated = [...(props.items || [])];
                    updated[i] = { ...updated[i], desc: e.currentTarget.innerText };
                    props.items = updated;
                  });
                }}
                className="text-xs text-slate-500 font-medium leading-relaxed outline-none focus:ring-2 focus:ring-[#00A0FF] rounded-md p-1 cursor-text"
              >
                {col.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

(FeatureGrid as any).craft = {
  displayName: 'Grille d Images & Textes',
  props: {
    columns: 4,
    items: [
      {
        title: 'BASES',
        desc: 'Masterisez les fondations essentielles de la réussite.',
        img: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=400&q=80',
      },
      {
        title: 'CUISINER',
        desc: 'Recettes et formules étape par étape prêtes à l emploi.',
        img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
      },
      {
        title: 'EXTÉRIEUR',
        desc: 'Développez votre visibilité et votre autorité externe.',
        img: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=400&q=80',
      },
      {
        title: 'DRESSAGE',
        desc: 'Optimisez vos processus et automatisez vos résultats.',
        img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80',
      },
    ],
    imgHeight: 220,
    borderRadius: 16,
  },
  rules: {
    canDrag: () => true,
  },
};
