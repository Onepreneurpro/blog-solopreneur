'use client';

import React from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { getBoxShadow, getBackgroundStyles } from './Text';

export interface ButtonProps {
  text?: string;
  bgColor?: string;
  bgImage?: string;
  textColor?: string;
  fontFamily?: string;
  borderRadius?: number;
  align?: 'left' | 'center' | 'right';
  href?: string;
  paddingY?: number;
  paddingX?: number;
  width?: number;
  height?: number;
  shadowPreset?: string;
  shadowBlur?: number;
  shadowOffsetY?: number;
  shadowColor?: string;
  shadowOpacity?: number;
  emoji?: string;
  emojiPosition?: 'left' | 'right';
}

export const Button = ({
  text = 'Commencer maintenant',
  bgColor = '#00A0FF',
  bgImage,
  textColor = '#ffffff',
  fontFamily = 'Inter',
  borderRadius = 0,
  align = 'center',
  href = '#',
  paddingY = 14,
  paddingX = 28,
  width = 100,
  height,
  shadowPreset = 'none',
  shadowBlur = 15,
  shadowOffsetY = 10,
  shadowColor = '#000000',
  shadowOpacity = 20,
  emoji = '🚀',
  emojiPosition = 'right',
}: ButtonProps) => {
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

  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  const boxShadow = getBoxShadow(shadowPreset, shadowBlur, shadowOffsetY, shadowColor, shadowOpacity);
  const bgStyles = getBackgroundStyles(bgColor, bgImage);

  // PUBLIC READ-ONLY VIEW
  if (!enabled) {
    return (
      <div className={`my-3 flex ${alignClasses[align]} max-w-full mx-auto`} style={{ width: `${width}%` }}>
        <a
          href={href || '#'}
          style={{
            ...bgStyles,
            color: textColor,
            fontFamily,
            borderRadius: `${borderRadius}px`,
            padding: `${paddingY}px ${paddingX}px`,
            minHeight: height ? `${height}px` : undefined,
            boxShadow,
          }}
          className="w-full font-black text-sm hover:opacity-90 transition-all flex items-center justify-center text-center overflow-hidden gap-2"
        >
          {emoji && emojiPosition === 'left' && <span className="text-lg leading-none shrink-0">{emoji}</span>}
          <span>{text}</span>
          {emoji && emojiPosition === 'right' && <span className="text-lg leading-none shrink-0">{emoji}</span>}
        </a>
      </div>
    );
  }

  // BUILDER EDITOR VIEW
  return (
    <div
      ref={(ref: HTMLDivElement | null) => {
        if (ref) connect(drag(ref));
      }}
      className={`my-3 flex ${alignClasses[align]} relative mx-auto ${
        selected ? 'ring-2 ring-[#00A0FF] p-1' : ''
      }`}
      style={{ width: `${width}%` }}
    >
      <button
        type="button"
        style={{
          ...bgStyles,
          color: textColor,
          fontFamily,
          borderRadius: `${borderRadius}px`,
          padding: `${paddingY}px ${paddingX}px`,
          minHeight: height ? `${height}px` : undefined,
          boxShadow,
          outline: 'none',
        }}
        className="w-full font-black text-sm hover:opacity-90 transition-all cursor-text flex items-center justify-center text-center overflow-hidden gap-2"
      >
        {emoji && emojiPosition === 'left' && <span className="text-lg leading-none shrink-0 select-none">{emoji}</span>}
        <span
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => {
            setProp((props: ButtonProps) => {
              props.text = e.currentTarget.innerText;
            });
          }}
          className="outline-none"
        >
          {text}
        </span>
        {emoji && emojiPosition === 'right' && <span className="text-lg leading-none shrink-0 select-none">{emoji}</span>}
      </button>
    </div>
  );
};

(Button as any).craft = {
  displayName: 'Bouton d Action',
  props: {
    text: 'Commencer maintenant',
    bgColor: '#00A0FF',
    textColor: '#ffffff',
    fontFamily: 'Inter',
    borderRadius: 0,
    align: 'center',
    href: '#',
    paddingY: 14,
    paddingX: 28,
    width: 100,
    shadowPreset: 'none',
    emoji: '🚀',
    emojiPosition: 'right',
  },
  rules: {
    canDrag: () => true,
  },
};
