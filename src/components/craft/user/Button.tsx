'use client';

import React from 'react';
import { useNode, useEditor } from '@craftjs/core';

export interface ButtonProps {
  text?: string;
  bgColor?: string;
  textColor?: string;
  borderRadius?: number;
  align?: 'left' | 'center' | 'right';
  href?: string;
  paddingY?: number;
  paddingX?: number;
  width?: number;
  height?: number;
}

export const Button = ({
  text = 'Commencer maintenant 🚀',
  bgColor = '#00A0FF',
  textColor = '#ffffff',
  borderRadius = 16,
  align = 'center',
  href = '#',
  paddingY = 14,
  paddingX = 28,
  width = 100,
  height = 50,
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

  // PUBLIC READ-ONLY VIEW
  if (!enabled) {
    return (
      <div className={`my-3 flex ${alignClasses[align]} max-w-full mx-auto`} style={{ width: `${width}%` }}>
        <a
          href={href || '#'}
          style={{
            backgroundColor: bgColor,
            color: textColor,
            borderRadius: `${borderRadius}px`,
            padding: `${paddingY}px ${paddingX}px`,
            minHeight: height ? `${height}px` : undefined,
          }}
          className="w-full font-black text-sm shadow-xl hover:opacity-90 transition-all font-heading flex items-center justify-center text-center"
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
        selected ? 'ring-2 ring-[#00A0FF] p-1 rounded-xl' : ''
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
          backgroundColor: bgColor,
          color: textColor,
          borderRadius: `${borderRadius}px`,
          padding: `${paddingY}px ${paddingX}px`,
          minHeight: height ? `${height}px` : undefined,
          outline: 'none',
        }}
        className="w-full font-black text-sm shadow-xl hover:opacity-90 transition-all font-heading cursor-text flex items-center justify-center text-center"
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
    borderRadius: 16,
    align: 'center',
    href: '#',
    paddingY: 14,
    paddingX: 28,
    width: 100,
    height: 50,
  },
  rules: {
    canDrag: () => true,
  },
};
