'use client';

import React from 'react';
import { useNode, useEditor } from '@craftjs/core';

export interface CardProps {
  title?: string;
  content?: string;
  bgColor?: string;
  padding?: number;
}

export const Card = ({
  title = '💡 Conseil Pro',
  content = 'Présentez vos arguments clés sous forme de carte claire, élégante et percutante.',
  bgColor = '#ffffff',
  padding = 24,
}: CardProps) => {
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

  const handlePaddingResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const startY = e.clientY;
    const startPadding = padding || 24;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const newPadding = Math.min(100, Math.max(12, startPadding + Math.round(deltaY / 2)));

      setProp((props: CardProps) => {
        props.padding = Math.round(newPadding);
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
      <div
        className="my-4 rounded-3xl border border-slate-200 shadow-lg space-y-2"
        style={{ backgroundColor: bgColor, padding: `${padding}px` }}
      >
        <h3 className="font-heading font-black text-lg text-slate-900 px-1">
          {title}
        </h3>
        <p className="text-sm font-medium text-slate-600 leading-relaxed p-1">
          {content}
        </p>
      </div>
    );
  }

  // BUILDER EDITOR VIEW
  return (
    <div
      ref={(ref: HTMLDivElement | null) => {
        if (ref) connect(drag(ref));
      }}
      className={`my-4 relative rounded-3xl border border-slate-200 shadow-lg space-y-2 transition-all ${
        selected ? 'ring-2 ring-[#00A0FF]' : 'hover:ring-1 hover:ring-blue-300'
      }`}
      style={{ backgroundColor: bgColor, padding: `${padding}px` }}
    >
      <h3
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => {
          setProp((props: CardProps) => {
            props.title = e.currentTarget.innerText;
          });
        }}
        className="font-heading font-black text-lg text-slate-900 outline-none focus:ring-2 focus:ring-[#00A0FF] rounded-md px-1 cursor-text"
      >
        {title}
      </h3>
      <p
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => {
          setProp((props: CardProps) => {
            props.content = e.currentTarget.innerText;
          });
        }}
        className="text-sm font-medium text-slate-600 leading-relaxed outline-none focus:ring-2 focus:ring-[#00A0FF] rounded-md p-1 cursor-text"
      >
        {content}
      </p>

      {/* BOTTOM PADDING RESIZER HANDLE BAR */}
      <div
        onMouseDown={handlePaddingResizeMouseDown}
        title="Tirez vers le bas ou le haut pour modifier le remplissage de la carte"
        className="absolute bottom-0 left-0 right-0 h-3 bg-[#00A0FF]/20 hover:bg-[#00A0FF] active:bg-[#0080FF] cursor-row-resize flex items-center justify-center transition-colors group/bottom-resizer z-40 rounded-b-xl select-none"
      >
        <div className="w-12 h-1 bg-[#00A0FF] group-hover/bottom-resizer:bg-white rounded-full transition-colors" />
      </div>
    </div>
  );
};

(Card as any).craft = {
  displayName: 'Carte d Information',
  props: {
    title: '💡 Conseil Pro',
    content: 'Présentez vos arguments clés sous forme de carte claire, élégante et percutante.',
    bgColor: '#ffffff',
    padding: 24,
  },
  rules: {
    canDrag: () => true,
  },
};
