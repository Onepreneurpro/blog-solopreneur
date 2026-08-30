'use client';

import React from 'react';
import { useNode, useEditor } from '@craftjs/core';

export interface CardProps {
  title?: string;
  content?: string;
  bgColor?: string;
  padding?: number;
  width?: number;
  height?: number;
}

export const Card = ({
  title = '💡 Conseil Pro',
  content = 'Présentez vos arguments clés sous forme de carte claire, élégante et percutante.',
  bgColor = '#ffffff',
  padding = 24,
  width = 100,
  height,
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

  // PUBLIC READ-ONLY VIEW
  if (!enabled) {
    return (
      <div
        className="my-4 rounded-3xl border border-slate-200 shadow-lg space-y-2 mx-auto"
        style={{
          backgroundColor: bgColor,
          padding: `${padding}px`,
          width: `${width}%`,
          minHeight: height ? `${height}px` : undefined,
        }}
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
      className={`my-4 relative rounded-3xl border border-slate-200 shadow-lg space-y-2 transition-all mx-auto ${
        selected ? 'ring-2 ring-[#00A0FF]' : 'hover:ring-1 hover:ring-blue-300'
      }`}
      style={{
        backgroundColor: bgColor,
        padding: `${padding}px`,
        width: `${width}%`,
        minHeight: height ? `${height}px` : undefined,
      }}
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
    width: 100,
  },
  rules: {
    canDrag: () => true,
  },
};
