'use client';

import React from 'react';
import { useNode, useEditor } from '@craftjs/core';

export interface TextProps {
  text?: string;
  fontSize?: number;
  textAlign?: 'left' | 'center' | 'right';
  textColor?: string;
  fontWeight?: string;
  fontStyle?: 'normal' | 'italic';
  fontFamily?: string;
  tagName?: 'h1' | 'h2' | 'h3' | 'p';
  width?: number;
  height?: number;
  borderRadius?: number;
  shadowPreset?: string;
  shadowBlur?: number;
  shadowOffsetY?: number;
  shadowColor?: string;
  shadowOpacity?: number;
  bgColor?: string;
  bgImage?: string;
  // HIGHLIGHT (SURLIGNAGE)
  highlightColor?: string;
  highlightPadding?: number;
  // UNDERLINE (SOULIGNAGE AVANCÉ)
  underlineEnabled?: boolean;
  underlineColor?: string;
  underlineThickness?: number;
  underlineStyle?: 'solid' | 'wavy' | 'dotted' | 'dashed' | 'double';
  underlineOffset?: number;
}

export const getBoxShadow = (
  preset?: string,
  blur = 15,
  offsetY = 10,
  color = '#000000',
  opacity = 20
) => {
  if (preset === 'none') return 'none';
  if (preset === 'sm') return '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
  if (preset === 'md') return '0 10px 15px -3px rgba(0, 0, 0, 0.15)';
  if (preset === 'lg') return '0 20px 25px -5px rgba(0, 0, 0, 0.25)';
  if (preset === 'xl') return '0 25px 50px -12px rgba(0, 0, 0, 0.4)';
  if (preset === 'custom' || blur || offsetY) {
    return `0px ${offsetY}px ${blur}px ${color}${Math.round(opacity * 2.55).toString(16).padStart(2, '0')}`;
  }
  return undefined;
};

export const getBackgroundStyles = (bgColor?: string, bgImage?: string) => {
  const styles: React.CSSProperties = {};
  if (bgColor && bgColor !== 'transparent') {
    styles.backgroundColor = bgColor;
  }
  if (bgImage) {
    styles.backgroundImage = `url(${bgImage})`;
    styles.backgroundSize = 'cover';
    styles.backgroundPosition = 'center';
    styles.backgroundRepeat = 'no-repeat';
  }
  return styles;
};

export const CreativeUnderlineOverlay = ({
  enabled,
  color = '#00A0FF',
  thickness = 4,
  style = 'solid',
  offset = 2,
}: {
  enabled?: boolean;
  color?: string;
  thickness?: number;
  style?: string;
  offset?: number;
}) => {
  if (!enabled) return null;

  if (style === 'wavy') {
    return (
      <svg
        className="absolute left-0 w-full overflow-visible pointer-events-none z-0"
        style={{
          bottom: `${-offset}px`,
          height: `${Math.max(thickness * 2.5, 10)}px`,
        }}
        viewBox="0 0 100 20"
        preserveAspectRatio="none"
      >
        <path
          d="M 0 10 Q 6.25 0, 12.5 10 T 25 10 T 37.5 10 T 50 10 T 62.5 10 T 75 10 T 87.5 10 T 100 10"
          fill="none"
          stroke={color}
          strokeWidth={thickness * 1.5}
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <span
      className="absolute left-0 w-full pointer-events-none z-0"
      style={{
        bottom: `${-offset}px`,
        borderBottomWidth: `${thickness}px`,
        borderBottomColor: color,
        borderBottomStyle:
          style === 'double'
            ? 'double'
            : style === 'dotted'
            ? 'dotted'
            : style === 'dashed'
            ? 'dashed'
            : 'solid',
        height: style === 'double' ? `${thickness * 2}px` : '0px',
      }}
    />
  );
};

export const Text = ({
  text = 'Titre ou texte éditable',
  fontSize = 24,
  textAlign = 'center',
  textColor = '#0f172a',
  fontWeight = 'bold',
  fontStyle = 'normal',
  fontFamily = 'Inter',
  tagName = 'h2',
  width = 100,
  height,
  borderRadius = 0,
  shadowPreset = 'none',
  shadowBlur = 15,
  shadowOffsetY = 10,
  shadowColor = '#000000',
  shadowOpacity = 20,
  bgColor,
  bgImage,
  highlightColor,
  highlightPadding = 6,
  underlineEnabled = false,
  underlineColor = '#00A0FF',
  underlineThickness = 4,
  underlineStyle = 'solid',
  underlineOffset = 2,
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
  const boxShadow = getBoxShadow(shadowPreset, shadowBlur, shadowOffsetY, shadowColor, shadowOpacity);
  const bgStyles = getBackgroundStyles(bgColor, bgImage);

  const highlightStyles: React.CSSProperties =
    highlightColor && highlightColor !== 'transparent'
      ? {
          backgroundColor: highlightColor,
          paddingLeft: `${highlightPadding}px`,
          paddingRight: `${highlightPadding}px`,
          borderRadius: '4px',
          boxDecorationBreak: 'clone',
          WebkitBoxDecorationBreak: 'clone',
        }
      : {};

  // PUBLIC READ-ONLY VIEW
  if (!enabled) {
    return (
      <div
        className="my-2 p-3 max-w-full mx-auto flex items-center justify-center"
        style={{
          width: `${width}%`,
          minHeight: height ? `${height}px` : undefined,
          borderRadius: `${borderRadius}px`,
          boxShadow,
          ...bgStyles,
        }}
      >
        <Tag
          style={{
            fontSize: `${fontSize}px`,
            textAlign,
            color: textColor,
            fontWeight,
            fontStyle,
            fontFamily,
          }}
          className="tracking-tight leading-tight w-full inline-block"
        >
          <span className="relative inline-block" style={{ ...highlightStyles }}>
            <CreativeUnderlineOverlay
              enabled={underlineEnabled}
              color={underlineColor}
              thickness={underlineThickness}
              style={underlineStyle}
              offset={underlineOffset}
            />
            <span className="relative z-10">{text}</span>
          </span>
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
      className={`my-2 p-3 relative transition-all mx-auto flex items-center justify-center ${
        selected ? 'ring-2 ring-[#00A0FF]' : 'hover:ring-1 hover:ring-blue-200'
      }`}
      style={{
        width: `${width}%`,
        minHeight: height ? `${height}px` : undefined,
        borderRadius: `${borderRadius}px`,
        boxShadow,
        ...bgStyles,
      }}
    >
      <Tag
        style={{
          fontSize: `${fontSize}px`,
          textAlign,
          color: textColor,
          fontWeight,
          fontStyle,
          fontFamily,
        }}
        className="tracking-tight leading-tight w-full min-w-[50px] inline-block"
      >
        <span className="relative inline-block" style={{ ...highlightStyles }}>
          <CreativeUnderlineOverlay
            enabled={underlineEnabled}
            color={underlineColor}
            thickness={underlineThickness}
            style={underlineStyle}
            offset={underlineOffset}
          />
          <span
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => {
              setProp((props: TextProps) => {
                props.text = e.currentTarget.innerText;
              });
            }}
            className="relative z-10"
            style={{ outline: 'none', cursor: 'text' }}
          >
            {text}
          </span>
        </span>
      </Tag>
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
    fontStyle: 'normal',
    fontFamily: 'Inter',
    tagName: 'h2',
    width: 100,
    borderRadius: 0,
    shadowPreset: 'none',
  },
  rules: {
    canDrag: () => true,
  },
};
