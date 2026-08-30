'use client';

import React from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { getBoxShadow, getBackgroundStyles, CreativeUnderlineOverlay } from './Text';

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
  // HIGHLIGHT (SURLIGNAGE)
  highlightColor?: string;
  highlightPadding?: number;
  // UNDERLINE (SOULIGNAGE AVANCÉ)
  underlineEnabled?: boolean;
  underlineColor?: string;
  underlineThickness?: number;
  underlineStyle?: 'solid' | 'wavy' | 'dotted' | 'dashed' | 'double';
  underlineOffset?: number;
  // TARGET (TITRE VS TEXTE VS LES DEUX)
  targetText?: 'title' | 'content' | 'both';
}

export const Card = ({
  title = '💡 Conseil Pro',
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
  highlightColor,
  highlightPadding = 6,
  underlineEnabled = false,
  underlineColor = '#00A0FF',
  underlineThickness = 4,
  underlineStyle = 'solid',
  underlineOffset = 2,
  targetText = 'title',
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

  const isTitleTargeted = targetText === 'title' || targetText === 'both';
  const isContentTargeted = targetText === 'content' || targetText === 'both';

  const highlightStyles: React.CSSProperties =
    highlightColor && highlightColor !== 'transparent'
      ? {
          backgroundColor: highlightColor,
          paddingLeft: `${highlightPadding}px`,
          paddingRight: `${highlightPadding}px`,
          borderRadius: '4px',
          boxDecorationBreak: 'clone',
          WebkitBoxDecorationBreak: 'clone',
        }
      : {};

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
        <h3 className="font-heading font-black text-lg text-slate-900 px-1 inline-block">
          <span className="relative inline-block" style={{ ...(isTitleTargeted ? highlightStyles : {}) }}>
            <CreativeUnderlineOverlay
              enabled={isTitleTargeted && underlineEnabled}
              color={underlineColor}
              thickness={underlineThickness}
              style={underlineStyle}
              offset={underlineOffset}
            />
            <span className="relative z-10">{title}</span>
          </span>
        </h3>

        <p className="text-sm font-medium text-[#475569] leading-relaxed p-1">
          <span className="relative inline-block" style={{ ...(isContentTargeted ? highlightStyles : {}) }}>
            <CreativeUnderlineOverlay
              enabled={isContentTargeted && underlineEnabled}
              color={underlineColor}
              thickness={underlineThickness}
              style={underlineStyle}
              offset={underlineOffset}
            />
            <span className="relative z-10">{content}</span>
          </span>
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
      <h3 className="font-heading font-black text-lg text-slate-900 px-1 inline-block">
        <span className="relative inline-block" style={{ ...(isTitleTargeted ? highlightStyles : {}) }}>
          <CreativeUnderlineOverlay
            enabled={isTitleTargeted && underlineEnabled}
            color={underlineColor}
            thickness={underlineThickness}
            style={underlineStyle}
            offset={underlineOffset}
          />
          <span
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => {
              setProp((props: CardProps) => {
                props.title = e.currentTarget.innerText;
              });
            }}
            className="relative z-10"
            style={{ outline: 'none', cursor: 'text' }}
          >
            {title}
          </span>
        </span>
      </h3>

      <p className="text-sm font-medium text-[#475569] leading-relaxed p-1">
        <span className="relative inline-block" style={{ ...(isContentTargeted ? highlightStyles : {}) }}>
          <CreativeUnderlineOverlay
            enabled={isContentTargeted && underlineEnabled}
            color={underlineColor}
            thickness={underlineThickness}
            style={underlineStyle}
            offset={underlineOffset}
          />
          <span
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => {
              setProp((props: CardProps) => {
                props.content = e.currentTarget.innerText;
              });
            }}
            className="relative z-10"
            style={{ outline: 'none', cursor: 'text' }}
          >
            {content}
          </span>
        </span>
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
    borderRadius: 0,
    shadowPreset: 'none',
    fontFamily: 'Inter',
    targetText: 'title',
  },
  rules: {
    canDrag: () => true,
  },
};
