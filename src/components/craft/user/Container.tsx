'use client';

import React from 'react';
import { useNode, useEditor } from '@craftjs/core';

export interface ContainerProps {
  bgGradient?: string;
  bgColor?: string;
  padding?: number;
  margin?: number;
  borderRadius?: number;
  flexDirection?: 'col' | 'row';
  justifyContent?: 'start' | 'center' | 'end' | 'between' | 'around';
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
  gap?: number;
  flexWrap?: boolean;
  children?: React.ReactNode;
}

export const Container = ({
  bgGradient = 'none',
  bgColor = '#ffffff',
  padding = 32,
  margin = 16,
  borderRadius = 24,
  flexDirection = 'col',
  justifyContent = 'center',
  alignItems = 'center',
  gap = 16,
  flexWrap = true,
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

  const flexDirClass =
    flexDirection === 'row'
      ? `flex flex-row ${flexWrap ? 'flex-wrap sm:flex-nowrap' : 'flex-nowrap'}`
      : 'flex flex-col';

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  };

  // PUBLIC READ-ONLY VIEW
  if (!enabled) {
    return (
      <div
        className={`relative ${flexDirClass} ${justifyClasses[justifyContent]} ${alignClasses[alignItems]} ${
          bgGradient && bgGradient !== 'none' ? bgGradient : ''
        }`}
        style={{
          ...(typeof bgStyle === 'object' ? bgStyle : {}),
          padding: `${padding}px`,
          margin: `${margin}px 0`,
          borderRadius: `${borderRadius}px`,
          gap: `${gap}px`,
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
      className={`relative transition-all ${flexDirClass} ${justifyClasses[justifyContent]} ${
        alignClasses[alignItems]
      } ${selected ? 'ring-2 ring-[#00A0FF] ring-offset-2' : 'hover:ring-1 hover:ring-blue-300'} ${
        bgGradient && bgGradient !== 'none' ? bgGradient : ''
      }`}
      style={{
        ...(typeof bgStyle === 'object' ? bgStyle : {}),
        padding: `${padding}px`,
        margin: `${margin}px 0`,
        borderRadius: `${borderRadius}px`,
        gap: `${gap}px`,
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
    flexDirection: 'col',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    flexWrap: true,
  },
  rules: {
    canDrag: () => true,
  },
};
