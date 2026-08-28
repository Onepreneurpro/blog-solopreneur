import React from 'react';

interface FormattedTextProps {
  text?: string | null;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
  style?: React.CSSProperties;
  defaultMarkColor?: string;
}

export function FormattedText({
  text,
  className = '',
  as: Component = 'span',
  style,
  defaultMarkColor = '#a3e635',
}: FormattedTextProps) {
  if (!text) return null;

  // Transform tags to styled html:
  // 1) <mark color="#...">word</mark>
  // 2) <u color="#..." thickness="medium">word</u>
  const transformed = text
    // Replace <mark ...>
    .replace(/<mark(?:\s+color=["']([^"']+)["'])?>(.*?)<\/mark>/gi, (match, color, content) => {
      const bgColor = color || defaultMarkColor;
      const isLight = ['#ccff00', '#a3e635', '#facc15', '#fef08a', '#ffff00'].includes(bgColor.toLowerCase());
      const textColor = isLight ? '#0f172a' : '#ffffff';
      return `<span style="background-color: ${bgColor}; color: ${textColor};" class="px-3 py-0.5 rounded-2xl shadow-2xs font-black inline-block my-0.5">${content}</span>`;
    })
    // Replace <u ...>...</u> with support for color, thickness, offset
    .replace(/<u([^>]*)>(.*?)<\/u>/gi, (match, attrString, content) => {
      const getAttr = (name: string) => {
        const m = attrString.match(new RegExp(`${name}=["']([^"']+)["']`, 'i'));
        return m ? m[1] : null;
      };

      const colorVal = getAttr('color') || defaultMarkColor;
      const thickness = getAttr('thickness') || '4px';
      const offset = getAttr('offset') || '2px';

      const isPercent = thickness.endsWith('%') || thickness === 'thin' || thickness === 'medium' || thickness === 'thick';

      if (isPercent) {
        let percentNum = 40; // Default 40% height band
        if (thickness === 'thin') percentNum = 20;
        if (thickness === 'medium') percentNum = 40;
        if (thickness === 'thick') percentNum = 60;
        if (thickness.endsWith('%')) {
          const parsed = parseInt(thickness);
          if (!isNaN(parsed)) percentNum = parsed;
        }

        const transparentStop = Math.max(0, Math.min(100, 100 - percentNum));
        return `<u style="text-decoration: none !important; background: linear-gradient(180deg, transparent ${transparentStop}%, ${colorVal} ${transparentStop}%, ${colorVal} 100%) !important; color: inherit; padding: 0 4px; border-radius: 3px; display: inline; font-weight: inherit;">${content}</u>`;
      } else {
        const borderSize = thickness.includes('px') ? thickness : `${parseInt(thickness) || 4}px`;
        const offsetSize = offset.includes('px') ? offset : `${parseInt(offset) || 2}px`;
        return `<u style="text-decoration: none !important; border-bottom: ${borderSize} solid ${colorVal} !important; padding-bottom: ${offsetSize} !important; color: inherit; display: inline; font-weight: inherit; line-height: normal;">${content}</u>`;
      }
    })
    // Replace <color color="...">word</color> or <color hex="...">word</color> or <font color="...">word</font>
    .replace(/<(?:color|font)([^>]*)>(.*?)<\/(?:color|font)>/gi, (match, attrString, content) => {
      const getAttr = (name: string) => {
        const m = attrString.match(new RegExp(`${name}=["']([^"']+)["']`, 'i'));
        return m ? m[1] : null;
      };

      const colorVal = getAttr('color') || getAttr('hex') || defaultMarkColor;
      return `<span style="color: ${colorVal} !important; display: inline;">${content}</span>`;
    })
    // Fallback replace for simple markdown syntax ==word== and [yellow]word[/yellow]
    .replace(/==(.*?)==/gi, `<span style="background-color: ${defaultMarkColor}; color: #0f172a;" class="px-3 py-0.5 rounded-2xl shadow-2xs font-black inline-block my-0.5">$1</span>`)
    .replace(/\[yellow\](.*?)\[\/yellow\]/gi, `<span style="background-color: ${defaultMarkColor}; color: #0f172a;" class="px-3 py-0.5 rounded-2xl shadow-2xs font-black inline-block my-0.5">$1</span>`);

  return (
    <Component
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: transformed }}
    />
  );
}
