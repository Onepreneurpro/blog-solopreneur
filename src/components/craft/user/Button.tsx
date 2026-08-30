'use client';

import React from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { getBoxShadow, getBackgroundStyles, getUnderlineAndHighlightStyles } from './Text';

export interface ButtonProps {
  text?: string;
  bgColor?: string;
  bgImage?: string;
  textColor?: string;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: 'normal' | 'italic';
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
  // HIGHLIGHT (SURLIGNAGE)
  highlightColor?: string;
  highlightPadding?: number;
  // UNDERLINE (SOULIGNAGE AVANCÉ)
  underlineEnabled?: boolean;
  underlineColor?: string;
  underlineThickness?: number;
  underlineStyle?: 'solid' | 'wavy' | 'dotted' | 'dashed' | 'double';
  underlineOffset?: number;
}

export const Button = ({
  text = 'Commencer maintenant 🚀',
  bgColor = '#00A0FF',
  bgImage,
  textColor = '#ffffff',
  fontFamily = 'Inter',
  fontWeight = 'bold',
  fontStyle = 'normal',
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
  highlightColor,
  highlightPadding = 6,
  underlineEnabled = false,
  underlineColor = '#00A0FF',
  underlineThickness = 4,
  underlineStyle = 'solid',
  underlineOffset = 2,
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
  const underlineHighlightStyles = getUnderlineAndHighlightStyles(
    underlineEnabled,
    underlineColor,
    underlineThickness,
    underlineStyle,
    underlineOffset,
    highlightColor,
    highlightPadding
  );

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
            fontWeight,
            fontStyle,
            borderRadius: `${borderRadius}px`,
            padding: `${paddingY}px ${paddingX}px`,
            minHeight: height ? `${height}px` : undefined,
            boxShadow,
            ...underlineHighlightStyles,
          }}
          className="w-full font-black text-sm hover:opacity-90 transition-all flex items-center justify-center text-center overflow-hidden"
        >
          {text}
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
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => {
          setProp((props: ButtonProps) => {
            props.text = e.currentTarget.innerText;
          });
        }}
        style={{
          ...bgStyles,
          color: textColor,
          fontFamily,
          fontWeight,
          fontStyle,
          borderRadius: `${borderRadius}px`,
          padding: `${paddingY}px ${paddingX}px`,
          minHeight: height ? `${height}px` : undefined,
          boxShadow,
          outline: 'none',
          ...underlineHighlightStyles,
        }}
        className="w-full font-black text-sm hover:opacity-90 transition-all cursor-text flex items-center justify-center text-center overflow-hidden"
      >
        {text}
      </button>
    </div>
  );
};

(Button as any).craft = {
  displayName: 'Bouton d Action',
  props: {
    text: 'Commencer maintenant 🚀',
    bgColor: '#00A0FF',
    textColor: '#ffffff',
    fontFamily: 'Inter',
    fontWeight: 'bold',
    fontStyle: 'normal',
    borderRadius: 0,
    align: 'center',
    href: '#',
    paddingY: 14,
    paddingX: 28,
    width: 100,
    shadowPreset: 'none',
  },
  rules: {
    canDrag: () => true,
  },
};
