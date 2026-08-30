'use client';

import React from 'react';
import { useNode, useEditor, Element } from '@craftjs/core';
import { Container } from './Container';
import { Text } from './Text';

export interface GridProps {
  columns?: 2 | 3 | 4;
  columnWidths?: number[];
  gap?: number;
  bgColor?: string;
  padding?: number;
  borderRadius?: number;
}

export const Grid = ({
  columns = 2,
  columnWidths,
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
    actions: { setProp },
  } = useNode((node) => ({
    selected: node.events.selected,
  }));

  const defaultWidths =
    columns === 2
      ? [50, 50]
      : columns === 3
      ? [33.33, 33.33, 33.34]
      : [25, 25, 25, 25];

  const widths =
    columnWidths && columnWidths.length === columns
      ? columnWidths
      : defaultWidths;

  const handleMouseDown = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const resizerEl = e.currentTarget as HTMLElement;
    const gridContainer = resizerEl.closest('.craft-grid-container') as HTMLElement;
    if (!gridContainer) return;

    const rect = gridContainer.getBoundingClientRect();
    const totalWidth = rect.width;
    const startX = e.clientX;

    const startW1 = widths[index] || 50;
    const startW2 = widths[index + 1] || 50;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaPercent = Math.round((deltaX / totalWidth) * 100);

      let newW1 = startW1 + deltaPercent;
      let newW2 = startW2 - deltaPercent;

      if (newW1 < 15) {
        newW1 = 15;
        newW2 = startW1 + startW2 - 15;
      } else if (newW2 < 15) {
        newW2 = 15;
        newW1 = startW1 + startW2 - 15;
      }

      const updated = [...widths];
      updated[index] = Math.round(newW1);
      updated[index + 1] = Math.round(newW2);

      setProp((props: GridProps) => {
        props.columnWidths = updated;
      });
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

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
        <div className="flex flex-col md:flex-row w-full items-stretch" style={{ gap: `${gap}px` }}>
          <div style={{ flex: `${widths[0] || 50} 1 0%` }} className="w-full min-w-0">
            <Element is={Container} id="col-1" canvas />
          </div>
          <div style={{ flex: `${widths[1] || 50} 1 0%` }} className="w-full min-w-0">
            <Element is={Container} id="col-2" canvas />
          </div>
          {columns >= 3 && (
            <div style={{ flex: `${widths[2] || 33} 1 0%` }} className="w-full min-w-0">
              <Element is={Container} id="col-3" canvas />
            </div>
          )}
          {columns >= 4 && (
            <div style={{ flex: `${widths[3] || 25} 1 0%` }} className="w-full min-w-0">
              <Element is={Container} id="col-4" canvas />
            </div>
          )}
        </div>
      </div>
    );
  }

  // BUILDER EDITOR VIEW WITH INTERACTIVE RESIZER HANDLES
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
      <div className="craft-grid-container flex flex-col md:flex-row w-full items-stretch" style={{ gap: `${gap}px` }}>
        {/* COLUMN #1 */}
        <div style={{ flex: `${widths[0] || 50} 1 0%` }} className="w-full min-w-0 min-h-[140px] relative">
          <Element is={Container} id="col-1" padding={20} bgColor="#f8fafc" borderRadius={16} canvas>
            <Text text="📦 Colonne #1 (Glissez un élément)" fontSize={14} textColor="#94a3b8" textAlign="center" />
          </Element>
        </div>

        {/* RESIZER HANDLE BETWEEN COL 1 & 2 */}
        <div
          onMouseDown={(e) => handleMouseDown(0, e)}
          title="Tirez à gauche ou à droite pour redimensionner les colonnes"
          className="w-3 bg-blue-100 hover:bg-[#00A0FF] active:bg-[#0080FF] border border-blue-300 hover:border-[#00A0FF] rounded-full cursor-col-resize flex items-center justify-center shrink-0 transition-colors group/resizer my-2 select-none z-30"
        >
          <div className="w-1 h-8 bg-[#00A0FF] group-hover/resizer:bg-white rounded-full transition-colors" />
        </div>

        {/* COLUMN #2 */}
        <div style={{ flex: `${widths[1] || 50} 1 0%` }} className="w-full min-w-0 min-h-[140px] relative">
          <Element is={Container} id="col-2" padding={20} bgColor="#f8fafc" borderRadius={16} canvas>
            <Text text="📦 Colonne #2 (Glissez un élément)" fontSize={14} textColor="#94a3b8" textAlign="center" />
          </Element>
        </div>

        {/* COLUMN #3 (IF APPLICABLE) */}
        {columns >= 3 && (
          <>
            <div
              onMouseDown={(e) => handleMouseDown(1, e)}
              title="Tirez à gauche ou à droite pour redimensionner les colonnes"
              className="w-3 bg-blue-100 hover:bg-[#00A0FF] active:bg-[#0080FF] border border-blue-300 hover:border-[#00A0FF] rounded-full cursor-col-resize flex items-center justify-center shrink-0 transition-colors group/resizer my-2 select-none z-30"
            >
              <div className="w-1 h-8 bg-[#00A0FF] group-hover/resizer:bg-white rounded-full transition-colors" />
            </div>

            <div style={{ flex: `${widths[2] || 33} 1 0%` }} className="w-full min-w-0 min-h-[140px] relative">
              <Element is={Container} id="col-3" padding={20} bgColor="#f8fafc" borderRadius={16} canvas>
                <Text text="📦 Colonne #3 (Glissez un élément)" fontSize={14} textColor="#94a3b8" textAlign="center" />
              </Element>
            </div>
          </>
        )}

        {/* COLUMN #4 (IF APPLICABLE) */}
        {columns >= 4 && (
          <>
            <div
              onMouseDown={(e) => handleMouseDown(2, e)}
              title="Tirez à gauche ou à droite pour redimensionner les colonnes"
              className="w-3 bg-blue-100 hover:bg-[#00A0FF] active:bg-[#0080FF] border border-blue-300 hover:border-[#00A0FF] rounded-full cursor-col-resize flex items-center justify-center shrink-0 transition-colors group/resizer my-2 select-none z-30"
            >
              <div className="w-1 h-8 bg-[#00A0FF] group-hover/resizer:bg-white rounded-full transition-colors" />
            </div>

            <div style={{ flex: `${widths[3] || 25} 1 0%` }} className="w-full min-w-0 min-h-[140px] relative">
              <Element is={Container} id="col-4" padding={20} bgColor="#f8fafc" borderRadius={16} canvas>
                <Text text="📦 Colonne #4 (Glissez un élément)" fontSize={14} textColor="#94a3b8" textAlign="center" />
              </Element>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

(Grid as any).craft = {
  displayName: 'Grille Vierge (Multi-Colonnes)',
  props: {
    columns: 2,
    columnWidths: [50, 50],
    gap: 16,
    bgColor: '#ffffff',
    padding: 20,
    borderRadius: 20,
  },
  rules: {
    canDrag: () => true,
  },
};
