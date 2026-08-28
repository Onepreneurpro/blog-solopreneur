import React from 'react';

interface FormattedTextProps {
  text?: string | null;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
}

export function FormattedText({ text, className = '', as: Component = 'span' }: FormattedTextProps) {
  if (!text) return null;

  // Transform tags to styled html:
  // 1) <mark color="#...">word</mark>
  // 2) <u color="#..." thickness="medium">word</u>
  const transformed = text
    // Replace <mark ...>
    .replace(/<mark(?:\s+color=["']([^"']+)["'])?>(.*?)<\/mark>/gi, (match, color, content) => {
      const bgColor = color || '#ccff00';
      const isLight = ['#ccff00', '#facc15', '#fef08a', '#ffff00'].includes(bgColor.toLowerCase());
      const textColor = isLight ? '#0f172a' : '#ffffff';
      return `<span style="background-color: ${bgColor}; color: ${textColor};" class="px-3 py-0.5 rounded-2xl shadow-2xs font-black inline-block my-0.5">${content}</span>`;
    })
    // Replace <u>...</u> or <u color="..." thickness="...">...</u>
    .replace(/<u(?:\s+color=["']([^"']+)["'])?(?:\s+thickness=["']([^"']+)["'])?>(.*?)<\/u>/gi, (match, color, thickness, content) => {
      const colorVal = color || '#ccff00';
      let gradientPercent = '64%'; // Default medium (~36% height pedestal)
      
      if (thickness === 'thin') gradientPercent = '78%';
      if (thickness === 'medium') gradientPercent = '64%';
      if (thickness === 'thick') gradientPercent = '50%';
      if (thickness && thickness.endsWith('%')) {
        const num = parseInt(thickness);
        if (!isNaN(num)) gradientPercent = `${100 - num}%`;
      }

      return `<u style="text-decoration: none !important; background: linear-gradient(180deg, transparent ${gradientPercent}, ${colorVal} ${gradientPercent}, ${colorVal} 92%) !important; color: inherit; padding: 0 4px; border-radius: 4px; display: inline; font-weight: inherit;">${content}</u>`;
    })
    // Fallback replace for simple markdown syntax ==word== and [yellow]word[/yellow]
    .replace(/==(.*?)==/gi, '<span style="background-color: #ccff00; color: #0f172a;" class="px-3 py-0.5 rounded-2xl shadow-2xs font-black inline-block my-0.5">$1</span>')
    .replace(/\[yellow\](.*?)\[\/yellow\]/gi, '<span style="background-color: #ccff00; color: #0f172a;" class="px-3 py-0.5 rounded-2xl shadow-2xs font-black inline-block my-0.5">$1</span>');

  return (
    <Component
      className={className}
      dangerouslySetInnerHTML={{ __html: transformed }}
    />
  );
}
