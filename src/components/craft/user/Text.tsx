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
}

export const Text = ({
  text = 'Titre ou texte éditable',
  fontSize = 24,
  textAlign = 'center',
  textColor = '#0f172a',
  fontWeight = 'bold',
  tagName = 'h2',
  width = 100,
  height = 60,
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

  // PUBLIC READ-ONLY VIEW
  if (!enabled) {
    return (
      <div
        className="my-2 p-1 max-w-full mx-auto flex items-center justify-center"
        style={{
          width: `${width}%`,
          minHeight: height ? `${height}px` : undefined,
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
      className={`my-2 p-1 relative rounded-lg transition-all mx-auto flex items-center justify-center ${
        selected ? 'ring-2 ring-[#00A0FF]' : 'hover:ring-1 hover:ring-blue-200'
      }`}
      style={{
        width: `${width}%`,
        minHeight: height ? `${height}px` : undefined,
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
    height: 60,
  },
  rules: {
    canDrag: () => true,
  },
};
