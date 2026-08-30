'use client';

import React from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { getBoxShadow, getBackgroundStyles } from './Text';

export interface ContainerProps {
  bgGradient?: string;
  bgColor?: string;
  bgImage?: string;
  padding?: number;
  margin?: number;
  borderRadius?: number;
  width?: number;
  height?: number;
  shadowPreset?: string;
  shadowBlur?: number;
  shadowOffsetY?: number;
  shadowColor?: string;
  shadowOpacity?: number;
  children?: React.ReactNode;
}

export const Container = ({
  bgGradient = 'none',
  bgColor = '#ffffff',
  bgImage,
  padding = 16,
  margin = 8,
  borderRadius = 20,
  width = 100,
  height,
  shadowPreset = 'none',
  shadowBlur = 15,
  shadowOffsetY = 10,
  shadowColor = '#000000',
  shadowOpacity = 20,
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
      : getBackgroundStyles(bgColor, bgImage);

  const boxShadow = getBoxShadow(shadowPreset, shadowBlur, shadowOffsetY, shadowColor, shadowOpacity);

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
          minHeight: height ? `${height}px` : undefined,
          boxShadow,
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
      className={`relative mx-auto transition-all ${
        selected ? 'ring-2 ring-[#00A0FF] ring-offset-2' : 'hover:ring-1 hover:ring-blue-300'
      } ${bgGradient && bgGradient !== 'none' ? bgGradient : ''}`}
      style={{
        ...(typeof bgStyle === 'object' ? bgStyle : {}),
        padding: `${padding}px`,
        margin: `${margin}px auto`,
        borderRadius: `${borderRadius}px`,
        width: `${width}%`,
        minHeight: height ? `${height}px` : undefined,
        boxShadow,
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
    padding: 16,
    margin: 8,
    borderRadius: 20,
    width: 100,
    shadowPreset: 'none',
  },
  rules: {
    canDrag: () => true,
  },
};
