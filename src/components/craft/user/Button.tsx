'use client';

import React from 'react';
import { useNode } from '@craftjs/core';

export interface ButtonProps {
  text?: string;
  bgColor?: string;
  textColor?: string;
  borderRadius?: number;
  align?: 'left' | 'center' | 'right';
  href?: string;
  paddingY?: number;
  paddingX?: number;
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
}: ButtonProps) => {
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

  return (
    <div
      ref={(ref: HTMLDivElement | null) => {
        if (ref) connect(drag(ref));
      }}
      className={`my-3 flex ${alignClasses[align]} ${
        selected ? 'ring-2 ring-[#00A0FF] p-1 rounded-xl' : ''
      }`}
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
          outline: 'none',
        }}
        className="font-black text-sm shadow-xl hover:opacity-90 transition-all font-heading cursor-text"
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
  },
  rules: {
    canDrag: () => true,
  },
};
