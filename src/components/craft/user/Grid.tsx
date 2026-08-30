'use client';

import React from 'react';
import { useNode, useEditor, Element } from '@craftjs/core';
import { Container } from './Container';
import { Text } from './Text';

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

  // PUBLIC READ-ONLY VIEW FOR VISITORS
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
          <div className="w-full">
            <Element is={Container} id="col-1" canvas />
          </div>
          <div className="w-full">
            <Element is={Container} id="col-2" canvas />
          </div>
          {columns >= 3 && (
            <div className="w-full">
              <Element is={Container} id="col-3" canvas />
            </div>
          )}
          {columns >= 4 && (
            <div className="w-full">
              <Element is={Container} id="col-4" canvas />
            </div>
          )}
        </div>
      </div>
    );
  }

  // BUILDER EDITOR VIEW WITH VISIBLE COLUMNS DROP ZONES
  return (
    <div
      ref={(ref: HTMLDivElement | null) => {
        if (ref) connect(drag(ref));
      }}
      className={`my-6 w-full p-4 border border-slate-200 shadow-sm transition-all rounded-3xl bg-white ${
        selected ? 'ring-2 ring-[#00A0FF]' : 'hover:ring-1 hover:ring-blue-300'
      }`}
      style={{
        backgroundColor: bgColor,
        padding: `${padding}px`,
        borderRadius: `${borderRadius}px`,
      }}
    >
      <div className={`grid ${gridColsClass}`} style={{ gap: `${gap}px` }}>
        <div className="w-full min-h-[140px] relative">
          <Element is={Container} id="col-1" padding={20} bgColor="#f8fafc" borderRadius={16} canvas>
            <Text text="📦 Colonne #1 (Glissez un élément)" fontSize={14} textColor="#94a3b8" textAlign="center" />
          </Element>
        </div>

        <div className="w-full min-h-[140px] relative">
          <Element is={Container} id="col-2" padding={20} bgColor="#f8fafc" borderRadius={16} canvas>
            <Text text="📦 Colonne #2 (Glissez un élément)" fontSize={14} textColor="#94a3b8" textAlign="center" />
          </Element>
        </div>

        {columns >= 3 && (
          <div className="w-full min-h-[140px] relative">
            <Element is={Container} id="col-3" padding={20} bgColor="#f8fafc" borderRadius={16} canvas>
              <Text text="📦 Colonne #3 (Glissez un élément)" fontSize={14} textColor="#94a3b8" textAlign="center" />
            </Element>
          </div>
        )}

        {columns >= 4 && (
          <div className="w-full min-h-[140px] relative">
            <Element is={Container} id="col-4" padding={20} bgColor="#f8fafc" borderRadius={16} canvas>
              <Text text="📦 Colonne #4 (Glissez un élément)" fontSize={14} textColor="#94a3b8" textAlign="center" />
            </Element>
          </div>
        )}
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
