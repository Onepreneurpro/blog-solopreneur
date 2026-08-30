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
}

export const Text = ({
  text = 'Titre ou texte éditable',
  fontSize = 24,
  textAlign = 'center',
  textColor = '#0f172a',
  fontWeight = 'bold',
  tagName = 'h2',
  width = 100,
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

      setProp((props: TextProps) => {
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

      setProp((props: TextProps) => {
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
      <div className="my-2 p-1 max-w-full mx-auto" style={{ width: `${width}%` }}>
        <Tag
          style={{
            fontSize: `${fontSize}px`,
            textAlign,
            color: textColor,
            fontWeight,
          }}
          className="font-heading tracking-tight leading-tight"
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
      className={`my-2 p-1 relative rounded-lg transition-all mx-auto ${
        selected ? 'ring-2 ring-[#00A0FF]' : 'hover:ring-1 hover:ring-blue-200'
      }`}
      style={{ width: `${width}%` }}
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
        className="font-heading tracking-tight leading-tight min-h-[1em]"
      >
        {text}
      </Tag>

      {/* LEFT BORDER WIDTH RESIZER HANDLE */}
      <div
        onMouseDown={handleLeftWidthResizeMouseDown}
        title="Tirez la bordure gauche pour agrandir"
        className="absolute top-0 bottom-0 left-0 w-3 bg-[#00A0FF]/20 hover:bg-[#00A0FF] active:bg-[#0080FF] cursor-col-resize flex items-center justify-center transition-colors group/left-resizer z-40 rounded-l-lg select-none"
      >
        <div className="w-1 h-6 bg-[#00A0FF] group-hover/left-resizer:bg-white rounded-full transition-colors" />
      </div>

      {/* RIGHT BORDER WIDTH RESIZER HANDLE */}
      <div
        onMouseDown={handleRightWidthResizeMouseDown}
        title="Tirez la bordure droite pour agrandir"
        className="absolute top-0 bottom-0 right-0 w-3 bg-[#00A0FF]/20 hover:bg-[#00A0FF] active:bg-[#0080FF] cursor-col-resize flex items-center justify-center transition-colors group/right-resizer z-40 rounded-r-lg select-none"
      >
        <div className="w-1 h-6 bg-[#00A0FF] group-hover/right-resizer:bg-white rounded-full transition-colors" />
      </div>
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
  },
  rules: {
    canDrag: () => true,
  },
};
