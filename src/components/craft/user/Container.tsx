'use client';

import React from 'react';
import { useNode, useEditor } from '@craftjs/core';

export interface ContainerProps {
  bgGradient?: string;
  bgColor?: string;
  padding?: number;
  margin?: number;
  borderRadius?: number;
  children?: React.ReactNode;
}

export const Container = ({
  bgGradient = 'none',
  bgColor = '#ffffff',
  padding = 32,
  margin = 16,
  borderRadius = 24,
  children,
}: ContainerProps) => {
  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  const {
    connectors: { connect, drag },
    selected,
  } = useNode((node) => ({
    selected: node.events.selected,
  }));

  const bgStyle =
    bgGradient && bgGradient !== 'none'
      ? bgGradient
      : { backgroundColor: bgColor };

  // PUBLIC READ-ONLY VIEW
  if (!enabled) {
    return (
      <div
        className={`relative ${bgGradient && bgGradient !== 'none' ? bgGradient : ''}`}
        style={{
          ...(typeof bgStyle === 'object' ? bgStyle : {}),
          padding: `${padding}px`,
          margin: `${margin}px 0`,
          borderRadius: `${borderRadius}px`,
        }}
      >
        {children}
      </div>
    );
  }

  // BUILDER EDITOR VIEW
  return (
    <div
      ref={(ref: HTMLDivElement | null) => {
        if (ref) connect(drag(ref));
      }}
      className={`relative transition-all ${
        selected ? 'ring-2 ring-[#00A0FF] ring-offset-2' : 'hover:ring-1 hover:ring-blue-300'
      } ${bgGradient && bgGradient !== 'none' ? bgGradient : ''}`}
      style={{
        ...(typeof bgStyle === 'object' ? bgStyle : {}),
        padding: `${padding}px`,
        margin: `${margin}px 0`,
        borderRadius: `${borderRadius}px`,
      }}
    >
      {children}
    </div>
  );
};

(Container as any).craft = {
  displayName: 'Section Conteneur',
  props: {
    bgGradient: 'none',
    bgColor: '#ffffff',
    padding: 32,
    margin: 16,
    borderRadius: 24,
  },
  rules: {
    canDrag: () => true,
  },
};
