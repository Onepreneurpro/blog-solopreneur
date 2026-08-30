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

  const handleRightWidthResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const resizerEl = e.currentTarget as HTMLElement;
    const parentEl = resizerEl.parentElement?.parentElement as HTMLElement;
    if (!parentEl) return;

    const parentRect = parentEl.getBoundingClientRect();
    const parentWidth = parentRect.width;
    const startX = e.clientX;
    const startWidth = width || 100;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaPercent = Math.round((deltaX / parentWidth) * 100);
      const newWidth = Math.min(100, Math.max(15, startWidth + deltaPercent * 2));

      setProp((props: ButtonProps) => {
        props.width = Math.round(newWidth);
      });
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleLeftWidthResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const resizerEl = e.currentTarget as HTMLElement;
    const parentEl = resizerEl.parentElement?.parentElement as HTMLElement;
    if (!parentEl) return;

    const parentRect = parentEl.getBoundingClientRect();
    const parentWidth = parentRect.width;
    const startX = e.clientX;
    const startWidth = width || 100;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = startX - moveEvent.clientX;
      const deltaPercent = Math.round((deltaX / parentWidth) * 100);
      const newWidth = Math.min(100, Math.max(15, startWidth + deltaPercent * 2));

      setProp((props: ButtonProps) => {
        props.width = Math.round(newWidth);
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
      <div className={`my-3 flex ${alignClasses[align]} max-w-full mx-auto`} style={{ width: `${width}%` }}>
        <a
          href={href || '#'}
          style={{
            backgroundColor: bgColor,
            color: textColor,
            borderRadius: `${borderRadius}px`,
            padding: `${paddingY}px ${paddingX}px`,
          }}
          className="w-full font-black text-sm shadow-xl hover:opacity-90 transition-all font-heading inline-block text-center"
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
          outline: 'none',
        }}
        className="w-full font-black text-sm shadow-xl hover:opacity-90 transition-all font-heading cursor-text"
      >
        {text}
      </button>

      {/* LEFT BORDER WIDTH RESIZER HANDLE */}
      <div
        onMouseDown={handleLeftWidthResizeMouseDown}
        title="Tirez la bordure gauche pour agrandir"
        className="absolute top-0 bottom-0 left-0 w-3 bg-[#00A0FF]/20 hover:bg-[#00A0FF] active:bg-[#0080FF] cursor-col-resize flex items-center justify-center transition-colors group/left-resizer z-40 rounded-l-xl select-none"
      >
        <div className="w-1 h-6 bg-[#00A0FF] group-hover/left-resizer:bg-white rounded-full transition-colors" />
      </div>

      {/* RIGHT BORDER WIDTH RESIZER HANDLE */}
      <div
        onMouseDown={handleRightWidthResizeMouseDown}
        title="Tirez la bordure droite pour agrandir"
        className="absolute top-0 bottom-0 right-0 w-3 bg-[#00A0FF]/20 hover:bg-[#00A0FF] active:bg-[#0080FF] cursor-col-resize flex items-center justify-center transition-colors group/right-resizer z-40 rounded-r-xl select-none"
      >
        <div className="w-1 h-6 bg-[#00A0FF] group-hover/right-resizer:bg-white rounded-full transition-colors" />
      </div>
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
  },
  rules: {
    canDrag: () => true,
  },
};
