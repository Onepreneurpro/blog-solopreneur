'use client';

import React from 'react';
import { useNode, useEditor, Element } from '@craftjs/core';
import { Container } from './Container';

export interface GridProps {
  columns?: 2 | 3 | 4;
  gap?: number;
  bgColor?: string;
  padding?: number;
  borderRadius?: number;
}

export const Grid = ({
  columns = 2,
  gap = 16,
  bgColor = '#ffffff',
  padding = 20,
  borderRadius = 20,
}: GridProps) => {
  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  const {
    connectors: { connect, drag },
    selected,
  } = useNode((node) => ({
    selected: node.events.selected,
  }));

  const gridColsClass =
    columns === 2
      ? 'grid-cols-1 md:grid-cols-2'
      : columns === 3
      ? 'grid-cols-1 md:grid-cols-3'
      : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4';

  // PUBLIC READ-ONLY VIEW
  if (!enabled) {
    return (
      <div
        className="my-6 w-full"
        style={{
          backgroundColor: bgColor,
          padding: `${padding}px`,
          borderRadius: `${borderRadius}px`,
        }}
      >
        <div className={`grid ${gridColsClass}`} style={{ gap: `${gap}px` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="w-full">
              <Element is={Container} id={`grid-col-${i}`} canvas />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // BUILDER EDITOR VIEW
  return (
    <div
      ref={(ref: HTMLDivElement | null) => {
        if (ref) connect(drag(ref));
      }}
      className={`my-6 w-full border border-slate-200 shadow-sm transition-all ${
        selected ? 'ring-2 ring-[#00A0FF]' : 'hover:ring-1 hover:ring-blue-300'
      }`}
      style={{
        backgroundColor: bgColor,
        padding: `${padding}px`,
        borderRadius: `${borderRadius}px`,
      }}
    >
      <div className={`grid ${gridColsClass}`} style={{ gap: `${gap}px` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="w-full min-h-[120px] relative">
            <span className="absolute top-2 left-3 text-[9px] font-mono font-bold text-slate-400 uppercase pointer-events-none z-10">
              Colonne #{i + 1}
            </span>
            <Element
              is={Container}
              id={`grid-col-${i}`}
              padding={16}
              bgColor="#f8fafc"
              borderRadius={16}
              canvas
            />
          </div>
        ))}
      </div>
    </div>
  );
};

(Grid as any).craft = {
  displayName: 'Grille Vierge (Multi-Colonnes)',
  props: {
    columns: 2,
    gap: 16,
    bgColor: '#ffffff',
    padding: 20,
    borderRadius: 20,
  },
  rules: {
    canDrag: () => true,
  },
};
