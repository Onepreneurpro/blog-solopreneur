'use client';

import React from 'react';
import { useNode, useEditor } from '@craftjs/core';

export interface TextProps {
  text?: string;
  fontSize?: number;
  textAlign?: 'left' | 'center' | 'right';
  textColor?: string;
  fontWeight?: string;
  tagName?: 'h1' | 'h2' | 'h3' | 'p';
  width?: number;
  height?: number;
  borderRadius?: number;
  shadowPreset?: string;
  shadowBlur?: number;
  shadowOffsetY?: number;
  shadowColor?: string;
  shadowOpacity?: number;
}

export const getBoxShadow = (
  preset?: string,
  blur = 15,
  offsetY = 10,
  color = '#000000',
  opacity = 20
) => {
  if (preset === 'none') return 'none';
  if (preset === 'sm') return '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
  if (preset === 'md') return '0 10px 15px -3px rgba(0, 0, 0, 0.15)';
  if (preset === 'lg') return '0 20px 25px -5px rgba(0, 0, 0, 0.25)';
  if (preset === 'xl') return '0 25px 50px -12px rgba(0, 0, 0, 0.4)';
  if (preset === 'custom' || blur || offsetY) {
    const alpha = (opacity / 100).toFixed(2);
    return `0px ${offsetY}px ${blur}px ${color}${Math.round(opacity * 2.55).toString(16).padStart(2, '0')}`;
  }
  return undefined;
};

export const Text = ({
  text = 'Titre ou texte éditable',
  fontSize = 24,
  textAlign = 'center',
  textColor = '#0f172a',
  fontWeight = 'bold',
  tagName = 'h2',
  width = 100,
  height,
  borderRadius = 0,
  shadowPreset = 'none',
  shadowBlur = 15,
  shadowOffsetY = 10,
  shadowColor = '#000000',
  shadowOpacity = 20,
}: TextProps) => {
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

  const Tag = tagName;
  const boxShadow = getBoxShadow(shadowPreset, shadowBlur, shadowOffsetY, shadowColor, shadowOpacity);

  // PUBLIC READ-ONLY VIEW
  if (!enabled) {
    return (
      <div
        className="my-2 p-1 max-w-full mx-auto flex items-center justify-center"
        style={{
          width: `${width}%`,
          minHeight: height ? `${height}px` : undefined,
          borderRadius: `${borderRadius}px`,
          boxShadow,
        }}
      >
        <Tag
          style={{
            fontSize: `${fontSize}px`,
            textAlign,
            color: textColor,
            fontWeight,
          }}
          className="font-heading tracking-tight leading-tight w-full"
        >
          {text}
        </Tag>
      </div>
    );
  }

  // BUILDER EDITOR VIEW
  return (
    <div
      ref={(ref: HTMLDivElement | null) => {
        if (ref) connect(drag(ref));
      }}
      className={`my-2 p-1 relative transition-all mx-auto flex items-center justify-center ${
        selected ? 'ring-2 ring-[#00A0FF]' : 'hover:ring-1 hover:ring-blue-200'
      }`}
      style={{
        width: `${width}%`,
        minHeight: height ? `${height}px` : undefined,
        borderRadius: `${borderRadius}px`,
        boxShadow,
      }}
    >
      <Tag
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => {
          setProp((props: TextProps) => {
            props.text = e.currentTarget.innerText;
          });
        }}
        style={{
          fontSize: `${fontSize}px`,
          textAlign,
          color: textColor,
          fontWeight,
          outline: 'none',
          cursor: 'text',
        }}
        className="font-heading tracking-tight leading-tight w-full"
      >
        {text}
      </Tag>
    </div>
  );
};

(Text as any).craft = {
  displayName: 'Texte / Titre',
  props: {
    text: 'Cliquez ici pour modifier ce texte...',
    fontSize: 24,
    textAlign: 'center',
    textColor: '#0f172a',
    fontWeight: 'bold',
    tagName: 'h2',
    width: 100,
    borderRadius: 0,
    shadowPreset: 'none',
  },
  rules: {
    canDrag: () => true,
  },
};
