'use client';

import React from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { getBoxShadow, getBackgroundStyles } from './Text';

export interface CardProps {
  title?: string;
  content?: string;
  bgColor?: string;
  bgImage?: string;
  fontFamily?: string;
  padding?: number;
  width?: number;
  height?: number;
  borderRadius?: number;
  shadowPreset?: string;
  shadowBlur?: number;
  shadowOffsetY?: number;
  shadowColor?: string;
  shadowOpacity?: number;
  emoji?: string;
  emojiPosition?: 'left' | 'right';
}

export const Card = ({
  title = 'Conseil Pro',
  content = 'Présentez vos arguments clés sous forme de carte claire, élégante et percutante.',
  bgColor = '#ffffff',
  bgImage,
  fontFamily = 'Inter',
  padding = 24,
  width = 100,
  height,
  borderRadius = 0,
  shadowPreset = 'none',
  shadowBlur = 15,
  shadowOffsetY = 10,
  shadowColor = '#000000',
  shadowOpacity = 20,
  emoji = '💡',
  emojiPosition = 'left',
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

  const boxShadow = getBoxShadow(shadowPreset, shadowBlur, shadowOffsetY, shadowColor, shadowOpacity);
  const bgStyles = getBackgroundStyles(bgColor, bgImage);

  // PUBLIC READ-ONLY VIEW
  if (!enabled) {
    return (
      <div
        className="my-4 border border-slate-200 space-y-2 mx-auto overflow-hidden"
        style={{
          ...bgStyles,
          fontFamily,
          padding: `${padding}px`,
          width: `${width}%`,
          minHeight: height ? `${height}px` : undefined,
          borderRadius: `${borderRadius}px`,
          boxShadow,
        }}
      >
        <div className="flex items-center gap-2.5 px-1">
          {emoji && emojiPosition === 'left' && (
            <span className="text-2xl leading-none shrink-0">{emoji}</span>
          )}
          <h3 className="font-heading font-black text-lg text-slate-900">
            {title}
          </h3>
          {emoji && emojiPosition === 'right' && (
            <span className="text-2xl leading-none shrink-0">{emoji}</span>
          )}
        </div>
        <p className="text-sm font-medium text-[#475569] leading-relaxed p-1">
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
      className={`my-4 relative border border-slate-200 space-y-2 transition-all mx-auto overflow-hidden ${
        selected ? 'ring-2 ring-[#00A0FF]' : 'hover:ring-1 hover:ring-blue-300'
      }`}
      style={{
        ...bgStyles,
        fontFamily,
        padding: `${padding}px`,
        width: `${width}%`,
        minHeight: height ? `${height}px` : undefined,
        borderRadius: `${borderRadius}px`,
        boxShadow,
      }}
    >
      <div className="flex items-center gap-2.5 px-1">
        {emoji && emojiPosition === 'left' && (
          <span className="text-2xl leading-none shrink-0 select-none">{emoji}</span>
        )}
        <h3
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => {
            setProp((props: CardProps) => {
              props.title = e.currentTarget.innerText;
            });
          }}
          className="font-heading font-black text-lg text-slate-900 outline-none focus:ring-2 focus:ring-[#00A0FF] rounded-md px-1 cursor-text flex-1"
        >
          {title}
        </h3>
        {emoji && emojiPosition === 'right' && (
          <span className="text-2xl leading-none shrink-0 select-none">{emoji}</span>
        )}
      </div>

      <p
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => {
          setProp((props: CardProps) => {
            props.content = e.currentTarget.innerText;
          });
        }}
        className="text-sm font-medium text-[#475569] leading-relaxed outline-none focus:ring-2 focus:ring-[#00A0FF] rounded-md p-1 cursor-text"
      >
        {content}
      </p>
    </div>
  );
};

(Card as any).craft = {
  displayName: 'Carte d Information',
  props: {
    title: 'Conseil Pro',
    content: 'Présentez vos arguments clés sous forme de carte claire, élégante et percutante.',
    bgColor: '#ffffff',
    padding: 24,
    width: 100,
    borderRadius: 0,
    shadowPreset: 'none',
    emoji: '💡',
    emojiPosition: 'left',
  },
  rules: {
    canDrag: () => true,
  },
};
