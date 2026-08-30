'use client';

import React, { useRef } from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { FolderOpen, Trash2 } from 'lucide-react';

export interface ImageProps {
  src?: string;
  alt?: string;
  height?: number;
  borderRadius?: number;
  align?: 'left' | 'center' | 'right';
  width?: number;
}

export const Image = ({
  src = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
  alt = 'Image illustration',
  height = 300,
  borderRadius = 20,
  align = 'center',
  width = 100,
}: ImageProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  const handleHeightResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const startY = e.clientY;
    const startHeight = height || 250;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const newHeight = Math.min(800, Math.max(80, startHeight + deltaY));

      setProp((props: ImageProps) => {
        props.height = Math.round(newHeight);
      });
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleWidthResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const resizerEl = e.currentTarget as HTMLElement;
    const parentEl = resizerEl.parentElement?.parentElement?.parentElement as HTMLElement;
    if (!parentEl) return;

    const parentRect = parentEl.getBoundingClientRect();
    const parentWidth = parentRect.width;
    const startX = e.clientX;
    const startWidth = width || 100;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaPercent = Math.round((deltaX / parentWidth) * 100);
      const newWidth = Math.min(100, Math.max(20, startWidth + deltaPercent));

      setProp((props: ImageProps) => {
        props.width = Math.round(newWidth);
      });
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // PUBLIC READ-ONLY VIEW
  if (!enabled) {
    return (
      <div className={`my-4 flex ${alignClasses[align]} max-w-full mx-auto`} style={{ width: `${width}%` }}>
        {src ? (
          <div
            className="w-full overflow-hidden shadow-xl"
            style={{ borderRadius: `${borderRadius}px`, height: `${height}px` }}
          >
            <img src={src} alt={alt} className="w-full h-full object-cover" />
          </div>
        ) : null}
      </div>
    );
  }

  // BUILDER EDITOR VIEW: 1 CLICK = SELECT / DOUBLE CLICK = FILE PICKER / BOTTOM & RIGHT DRAG RESIZE
  return (
    <div
      ref={(ref: HTMLDivElement | null) => {
        if (ref) connect(drag(ref));
      }}
      className={`my-4 flex ${alignClasses[align]} relative mx-auto ${
        selected ? 'ring-2 ring-[#00A0FF] p-1 rounded-2xl' : ''
      }`}
      style={{ width: `${width}%` }}
    >
      <div
        onDoubleClick={(e) => {
          e.stopPropagation();
          fileInputRef.current?.click();
        }}
        title="1 clic : Sélectionner | Double-clic : Choisir photo | Bords : Redimensionner largeur/hauteur"
        className="relative group/img w-full overflow-hidden shadow-xl cursor-pointer"
        style={{ borderRadius: `${borderRadius}px`, height: `${height}px` }}
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
            <span className="text-[10px] text-slate-500 font-normal">Double-cliquez pour choisir un fichier PC</span>
          </div>
        )}

        {/* HOVER OVERLAY */}
        <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-bold gap-2 p-3 text-center pointer-events-none">
          <FolderOpen className="w-8 h-8 text-[#00A0FF]" />
          <span className="px-3 py-1.5 bg-[#00A0FF] text-white font-black text-xs rounded-xl shadow-lg">
            📁 Double-cliquez pour choisir (PC)
          </span>
        </div>

        {/* TRASH ICON BUTTON */}
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
            className="absolute bottom-4 right-4 w-8 h-8 bg-rose-600 hover:bg-rose-700 text-white rounded-xl flex items-center justify-center shadow-lg transition-transform hover:scale-110 opacity-90 group-hover/img:opacity-100 z-30"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        {/* BOTTOM HEIGHT RESIZER HANDLE BAR */}
        <div
          onMouseDown={handleHeightResizeMouseDown}
          title="Tirez vers le bas ou le haut pour modifier la hauteur"
          className="absolute bottom-0 left-0 right-0 h-3 bg-[#00A0FF]/20 hover:bg-[#00A0FF] active:bg-[#0080FF] cursor-row-resize flex items-center justify-center transition-colors group/bottom-resizer z-40 rounded-b-xl select-none"
        >
          <div className="w-12 h-1 bg-[#00A0FF] group-hover/bottom-resizer:bg-white rounded-full transition-colors" />
        </div>

        {/* RIGHT BORDER WIDTH RESIZER HANDLE BAR */}
        <div
          onMouseDown={handleWidthResizeMouseDown}
          title="Tirez la bordure droite pour ajuster la largeur de l image"
          className="absolute top-0 bottom-0 right-0 w-3 bg-[#00A0FF]/20 hover:bg-[#00A0FF] active:bg-[#0080FF] cursor-col-resize flex items-center justify-center transition-colors group/right-resizer z-40 rounded-r-xl select-none"
        >
          <div className="w-1 h-8 bg-[#00A0FF] group-hover/right-resizer:bg-white rounded-full transition-colors" />
        </div>

        {/* HIDDEN FILE INPUT */}
        <input
          ref={fileInputRef}
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
    width: 100,
  },
  rules: {
    canDrag: () => true,
  },
};
