'use client';

import React from 'react';
import { useNode, useEditor } from '@craftjs/core';

export interface ContainerProps {
  bgGradient?: string;
  bgColor?: string;
  padding?: number;
  margin?: number;
  borderRadius?: number;
  width?: number;
  children?: React.ReactNode;
}

export const Container = ({
  bgGradient = 'none',
  bgColor = '#ffffff',
  padding = 16,
  margin = 8,
  borderRadius = 20,
  width = 100,
  children,
}: ContainerProps) => {
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

  const bgStyle =
    bgGradient && bgGradient !== 'none'
      ? bgGradient
      : { backgroundColor: bgColor };

  const handlePaddingResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const startY = e.clientY;
    const startPadding = padding || 16;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const newPadding = Math.min(120, Math.max(4, startPadding + Math.round(deltaY / 2)));

      setProp((props: ContainerProps) => {
        props.padding = Math.round(newPadding);
      });
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
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

      setProp((props: ContainerProps) => {
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

      setProp((props: ContainerProps) => {
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
      <div
        className={`relative mx-auto ${bgGradient && bgGradient !== 'none' ? bgGradient : ''}`}
        style={{
          ...(typeof bgStyle === 'object' ? bgStyle : {}),
          padding: `${padding}px`,
          margin: `${margin}px auto`,
          borderRadius: `${borderRadius}px`,
          width: `${width}%`,
        }}
      >
        {children}
      </div>
    );
  }

  // BUILDER EDITOR VIEW WITH LEFT, RIGHT & BOTTOM RESIZERS
  return (
    <div
      ref={(ref: HTMLDivElement | null) => {
        if (ref) connect(drag(ref));
      }}
      className={`relative mx-auto transition-all ${
        selected ? 'ring-2 ring-[#00A0FF] ring-offset-2' : 'hover:ring-1 hover:ring-blue-300'
      } ${bgGradient && bgGradient !== 'none' ? bgGradient : ''}`}
      style={{
        ...(typeof bgStyle === 'object' ? bgStyle : {}),
        padding: `${padding}px`,
        margin: `${margin}px auto`,
        borderRadius: `${borderRadius}px`,
        width: `${width}%`,
      }}
    >
      {children}

      {/* LEFT BORDER WIDTH RESIZER HANDLE BAR */}
      <div
        onMouseDown={handleLeftWidthResizeMouseDown}
        title="Tirez la bordure gauche vers la gauche pour agrandir"
        className="absolute top-0 bottom-0 left-0 w-3 bg-[#00A0FF]/20 hover:bg-[#00A0FF] active:bg-[#0080FF] cursor-col-resize flex items-center justify-center transition-colors group/left-resizer z-40 rounded-l-xl select-none"
      >
        <div className="w-1 h-8 bg-[#00A0FF] group-hover/left-resizer:bg-white rounded-full transition-colors" />
      </div>

      {/* RIGHT BORDER WIDTH RESIZER HANDLE BAR */}
      <div
        onMouseDown={handleRightWidthResizeMouseDown}
        title="Tirez la bordure droite vers la droite pour agrandir"
        className="absolute top-0 bottom-0 right-0 w-3 bg-[#00A0FF]/20 hover:bg-[#00A0FF] active:bg-[#0080FF] cursor-col-resize flex items-center justify-center transition-colors group/right-resizer z-40 rounded-r-xl select-none"
      >
        <div className="w-1 h-8 bg-[#00A0FF] group-hover/right-resizer:bg-white rounded-full transition-colors" />
      </div>

      {/* BOTTOM PADDING RESIZER HANDLE BAR */}
      <div
        onMouseDown={handlePaddingResizeMouseDown}
        title="Tirez vers le bas ou le haut pour modifier le remplissage du conteneur"
        className="absolute bottom-0 left-0 right-0 h-3 bg-[#00A0FF]/20 hover:bg-[#00A0FF] active:bg-[#0080FF] cursor-row-resize flex items-center justify-center transition-colors group/bottom-resizer z-40 rounded-b-xl select-none"
      >
        <div className="w-12 h-1 bg-[#00A0FF] group-hover/bottom-resizer:bg-white rounded-full transition-colors" />
      </div>
    </div>
  );
};

(Container as any).craft = {
  displayName: 'Section Conteneur',
  props: {
    bgGradient: 'none',
    bgColor: '#ffffff',
    padding: 16,
    margin: 8,
    borderRadius: 20,
    width: 100,
  },
  rules: {
    canDrag: () => true,
  },
};
