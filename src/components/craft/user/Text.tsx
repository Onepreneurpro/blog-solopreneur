'use client';

import React from 'react';
import { useNode, useEditor } from '@craftjs/core';
import {
  Lightbulb,
  Rocket,
  Flame,
  Zap,
  Star,
  Gift,
  Target,
  CheckCircle2,
  Lock,
  MousePointer,
  Trophy,
  Gem,
  Heart,
} from 'lucide-react';

export const iconMap: Record<string, React.ElementType> = {
  lightbulb: Lightbulb,
  rocket: Rocket,
  flame: Flame,
  zap: Zap,
  star: Star,
  gift: Gift,
  target: Target,
  check: CheckCircle2,
  lock: Lock,
  pointer: MousePointer,
  trophy: Trophy,
  gem: Gem,
  heart: Heart,
};

export interface TextProps {
  text?: string;
  fontSize?: number;
  textAlign?: 'left' | 'center' | 'right';
  textColor?: string;
  fontWeight?: string;
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
  icon?: string;
  iconPosition?: 'left' | 'right';
  iconColor?: string;
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

export const Text = ({
  text = 'Titre ou texte éditable',
  fontSize = 24,
  textAlign = 'center',
  textColor = '#0f172a',
  fontWeight = 'bold',
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
  icon = 'none',
  iconPosition = 'left',
  iconColor,
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

  const IconComponent = icon && icon !== 'none' ? iconMap[icon] : null;
  const finalIconColor = iconColor || textColor;

  const flexJustify =
    textAlign === 'left'
      ? 'justify-start'
      : textAlign === 'right'
      ? 'justify-end'
      : 'justify-center';

  // PUBLIC READ-ONLY VIEW
  if (!enabled) {
    return (
      <div
        className="my-2 p-3 max-w-full mx-auto flex items-center"
        style={{
          width: `${width}%`,
          minHeight: height ? `${height}px` : undefined,
          borderRadius: `${borderRadius}px`,
          boxShadow,
          ...bgStyles,
        }}
      >
        <div className={`flex items-center gap-2.5 w-full ${flexJustify}`}>
          {IconComponent && iconPosition === 'left' && (
            <IconComponent
              style={{ color: finalIconColor, width: `${fontSize * 1.1}px`, height: `${fontSize * 1.1}px` }}
              className="shrink-0 inline-block"
            />
          )}

          <Tag
            style={{
              fontSize: `${fontSize}px`,
              textAlign,
              color: textColor,
              fontWeight,
              fontFamily,
            }}
            className="tracking-tight leading-tight"
          >
            {text}
          </Tag>

          {IconComponent && iconPosition === 'right' && (
            <IconComponent
              style={{ color: finalIconColor, width: `${fontSize * 1.1}px`, height: `${fontSize * 1.1}px` }}
              className="shrink-0 inline-block"
            />
          )}
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
      className={`my-2 p-3 relative transition-all mx-auto flex items-center ${
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
      <div className={`flex items-center gap-2.5 w-full ${flexJustify}`}>
        {IconComponent && iconPosition === 'left' && (
          <IconComponent
            style={{ color: finalIconColor, width: `${fontSize * 1.1}px`, height: `${fontSize * 1.1}px` }}
            className="shrink-0 inline-block"
          />
        )}

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
            fontFamily,
            outline: 'none',
            cursor: 'text',
          }}
          className="tracking-tight leading-tight min-w-[50px]"
        >
          {text}
        </Tag>

        {IconComponent && iconPosition === 'right' && (
          <IconComponent
            style={{ color: finalIconColor, width: `${fontSize * 1.1}px`, height: `${fontSize * 1.1}px` }}
            className="shrink-0 inline-block"
          />
        )}
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
    fontFamily: 'Inter',
    tagName: 'h2',
    width: 100,
    borderRadius: 0,
    shadowPreset: 'none',
    icon: 'none',
    iconPosition: 'left',
  },
  rules: {
    canDrag: () => true,
  },
};
