'use client';

import React, { useEffect, useState } from 'react';
import { Bold, Italic, Highlighter, Underline, Palette, RemoveFormatting, X } from 'lucide-react';

export const FloatingTextToolbar = () => {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [openUpward, setOpenUpward] = useState(false);
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  const [showUnderlineMenu, setShowUnderlineMenu] = useState(false);
  const [showTextColorMenu, setShowTextColorMenu] = useState(false);

  // UNDERLINE OPTIONS STATE
  const [underlineStyle, setUnderlineStyle] = useState<'solid' | 'wavy' | 'dotted' | 'dashed' | 'double'>('wavy');
  const [underlineColor, setUnderlineColor] = useState('#00A0FF');
  const [underlineThickness, setUnderlineThickness] = useState(4);

  // HIGHLIGHT CUSTOM COLOR STATE
  const [customHighlightColor, setCustomHighlightColor] = useState('#fef08a');
  // TEXT COLOR CUSTOM STATE
  const [customTextColor, setCustomTextColor] = useState('#00A0FF');

  useEffect(() => {
    const handleSelectionChange = () => {
      if (typeof window === 'undefined') return;
      const selection = window.getSelection();

      if (!selection || selection.isCollapsed || !selection.rangeCount) {
        setPosition(null);
        return;
      }

      const text = selection.toString().trim();
      if (!text) {
        setPosition(null);
        return;
      }

      // Ensure selection is inside a contentEditable container
      const anchorNode = selection.anchorNode;
      const isEditable =
        anchorNode &&
        (anchorNode.nodeType === Node.ELEMENT_NODE
          ? (anchorNode as HTMLElement).isContentEditable || (anchorNode as HTMLElement).closest('[contenteditable="true"]')
          : anchorNode.parentElement?.isContentEditable || anchorNode.parentElement?.closest('[contenteditable="true"]'));

      if (!isEditable) {
        setPosition(null);
        return;
      }

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      if (rect && rect.width > 0 && rect.height > 0) {
        const spaceBelow = window.innerHeight - rect.bottom;
        setOpenUpward(spaceBelow < 340);

        const clampedLeft = Math.max(160, Math.min(window.innerWidth - 160, rect.left + rect.width / 2));

        setPosition({
          top: Math.max(12, rect.top - 58),
          left: clampedLeft,
        });

        // Detect current underline thickness if selecting an existing underline
        let parent = range.commonAncestorContainer;
        if (parent.nodeType === Node.TEXT_NODE) parent = parent.parentElement!;
        const existingUnderline = (parent as HTMLElement).closest('span[style*="text-decoration"], u') as HTMLElement | null;
        if (existingUnderline) {
          const computedThickness = parseFloat(window.getComputedStyle(existingUnderline).textDecorationThickness);
          if (!isNaN(computedThickness) && computedThickness > 0) {
            setUnderlineThickness(Math.round(computedThickness));
          }
        }
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    window.addEventListener('scroll', handleSelectionChange, true);

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      window.removeEventListener('scroll', handleSelectionChange, true);
    };
  }, []);

  if (!position) return null;

  const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  const removeAllFormattingFromSelection = () => {
    document.execCommand('removeFormat', false);
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    let container = range.commonAncestorContainer;
    if (container.nodeType === Node.TEXT_NODE) container = container.parentElement!;

    const elem = container as HTMLElement;
    const styledSpans = elem.querySelectorAll('span[style], u');
    styledSpans.forEach((sp) => {
      const parent = sp.parentNode;
      while (sp.firstChild) parent?.insertBefore(sp.firstChild, sp);
      parent?.removeChild(sp);
    });
  };

  const applyCurrentHighlight = (color: string) => {
    if (typeof window === 'undefined') return;
    document.execCommand('styleWithCSS', false, 'true');
    document.execCommand('hiliteColor', false, color);

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    let parent = range.commonAncestorContainer;
    if (parent.nodeType === Node.TEXT_NODE) parent = parent.parentElement!;

    const highlightSpan = (parent as HTMLElement).closest('span[style*="background-color"]');
    if (highlightSpan) {
      const el = highlightSpan as HTMLElement;
      el.style.setProperty('padding', '2px 6px', 'important');
      el.style.setProperty('border-radius', '4px', 'important');
      el.style.setProperty('box-decoration-break', 'clone', 'important');
      (el.style as any).webkitBoxDecorationBreak = 'clone';
    }
  };

  const applyCurrentUnderline = (
    style = underlineStyle,
    color = underlineColor,
    thickness = underlineThickness
  ) => {
    if (typeof window === 'undefined') return;

    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    let parent = range.commonAncestorContainer;
    if (parent.nodeType === Node.TEXT_NODE) parent = parent.parentElement!;

    // Check if selection is inside an existing styled span
    let targetSpan = (parent as HTMLElement).closest('span[style*="text-decoration"], u, font') as HTMLElement | null;

    if (!targetSpan) {
      document.execCommand('styleWithCSS', false, 'true');
      document.execCommand('underline', false);
      const newParent = selection.getRangeAt(0).commonAncestorContainer;
      const elem = newParent.nodeType === Node.TEXT_NODE ? newParent.parentElement : (newParent as HTMLElement);
      targetSpan = elem?.closest('span[style*="text-decoration"], u, font') as HTMLElement | null;
    }

    if (targetSpan) {
      targetSpan.style.setProperty('text-decoration-line', 'underline', 'important');
      targetSpan.style.setProperty('text-decoration-style', style, 'important');
      targetSpan.style.setProperty('text-decoration-color', color, 'important');
      targetSpan.style.setProperty('text-decoration-thickness', `${thickness}px`, 'important');
      targetSpan.style.setProperty('text-underline-offset', '3px', 'important');
    }
  };

  const menuPosClass = openUpward ? 'bottom-full mb-3' : 'top-full mt-3';

  return (
    <div
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translateX(-50%)',
      }}
      className="fixed z-[99999] bg-white text-slate-900 rounded-full shadow-2xl p-1.5 flex items-center gap-1.5 border-2 border-slate-200 animate-in fade-in zoom-in-95 duration-150 select-none"
    >
      {/* BOLD */}
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          applyFormat('bold');
        }}
        className="p-2 hover:bg-slate-100 rounded-xl transition-colors font-black text-xs flex items-center gap-1 text-slate-900"
        title="Mettre en Gras"
      >
        <Bold className="w-4 h-4 text-slate-900" />
      </button>

      {/* ITALIC */}
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          applyFormat('italic');
        }}
        className="p-2 hover:bg-slate-100 rounded-xl transition-colors font-black text-xs flex items-center gap-1 text-slate-900"
        title="Mettre en Italique"
      >
        <Italic className="w-4 h-4 text-slate-900" />
      </button>

      <div className="w-px h-5 bg-slate-200 my-auto" />

      {/* HIGHLIGHT (FEUTRE SURLIGNEUR) */}
      <div className="relative">
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            setShowHighlightMenu(!showHighlightMenu);
            setShowUnderlineMenu(false);
            setShowTextColorMenu(false);
          }}
          className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-full transition-colors flex items-center gap-1.5 text-xs font-black text-amber-950"
          title="Surligner avec du Feutre"
        >
          <Highlighter className="w-4 h-4 text-amber-600" />
          <span>Feutre</span>
        </button>

        {showHighlightMenu && (
          <div className={`absolute left-1/2 -translate-x-1/2 bg-white border-2 border-slate-200 rounded-2xl p-3.5 shadow-2xl flex flex-col gap-3 z-50 min-w-[220px] ${menuPosClass}`}>
            <span className="text-xs font-black text-slate-900 uppercase tracking-wider">Couleur de Feutre</span>
            <div className="grid grid-cols-5 gap-2">
              {[
                { color: '#fef08a', label: 'Jaune' },
                { color: '#bbf7d0', label: 'Vert' },
                { color: '#fbcfe8', label: 'Rose' },
                { color: '#bae6fd', label: 'Bleu' },
                { color: '#fed7aa', label: 'Orange' },
                { color: '#e9d5ff', label: 'Violet' },
                { color: '#fecdd3', label: 'Rouge' },
                { color: '#cff4fc', label: 'Turquoise' },
                { color: '#dcfce7', label: 'Menthe' },
                { color: '#fef3c7', label: 'Or' },
              ].map((c) => (
                <button
                  key={c.color}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    applyCurrentHighlight(c.color);
                    setShowHighlightMenu(false);
                  }}
                  className="w-7 h-7 rounded-xl border border-slate-300 transition-transform hover:scale-115 shadow-xs cursor-pointer"
                  style={{ backgroundColor: c.color }}
                  title={c.label}
                />
              ))}
            </div>

            {/* CUSTOM HIGHLIGHT COLOR PICKER */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <input
                type="color"
                value={customHighlightColor}
                onChange={(e) => setCustomHighlightColor(e.target.value)}
                onMouseDown={(e) => e.stopPropagation()}
                className="w-8 h-8 rounded-xl border border-slate-300 cursor-pointer p-0.5 bg-white"
              />
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  applyCurrentHighlight(customHighlightColor);
                  setShowHighlightMenu(false);
                }}
                className="flex-1 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs rounded-xl shadow-xs transition-colors"
              >
                Appliquer couleur
              </button>
            </div>

            <button
              onMouseDown={(e) => {
                e.preventDefault();
                removeAllFormattingFromSelection();
                setShowHighlightMenu(false);
              }}
              className="w-full py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-xl font-bold text-center border border-rose-200 transition-colors"
            >
              ❌ Retirer le feutre
            </button>
          </div>
        )}
      </div>

      {/* SOULIGNAGE (STYLE, ÉPAISSEUR ET COULEURS) */}
      <div className="relative">
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            setShowUnderlineMenu(!showUnderlineMenu);
            setShowHighlightMenu(false);
            setShowTextColorMenu(false);
          }}
          className="px-3 py-1.5 bg-sky-100 hover:bg-sky-200 border border-sky-300 rounded-full transition-colors flex items-center gap-1.5 text-xs font-black text-sky-950"
          title="Réglages du Soulignement"
        >
          <Underline className="w-4 h-4 text-sky-600" />
          <span>Souligner</span>
        </button>

        {showUnderlineMenu && (
          <div className={`absolute left-1/2 -translate-x-1/2 bg-white border-2 border-slate-200 rounded-2xl p-4 shadow-2xl flex flex-col gap-3 z-50 min-w-[280px] ${menuPosClass}`}>
            {/* STYLE SELECTOR */}
            <div className="space-y-1.5">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider">Style de Trait</span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { key: 'solid', label: 'Solide' },
                  { key: 'wavy', label: 'Ondulé 🌊' },
                  { key: 'dotted', label: 'Points •' },
                  { key: 'dashed', label: 'Tirets -' },
                  { key: 'double', label: 'Double =' },
                ].map((st) => (
                  <button
                    key={st.key}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      const style = st.key as any;
                      setUnderlineStyle(style);
                      applyCurrentUnderline(style);
                    }}
                    className={`py-1.5 px-2 rounded-xl border-2 font-black text-xs transition-colors ${
                      underlineStyle === st.key
                        ? 'bg-[#00A0FF] text-white border-[#00A0FF] shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* COLOR SWATCHES FOR UNDERLINE */}
            <div className="space-y-1.5 pt-1 border-t border-slate-100">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider">Couleur du Trait</span>
              <div className="flex items-center gap-2">
                {[
                  { color: '#00A0FF', label: 'Bleu' },
                  { color: '#ef4444', label: 'Rouge' },
                  { color: '#22c55e', label: 'Vert' },
                  { color: '#eab308', label: 'Jaune' },
                  { color: '#a855f7', label: 'Violet' },
                  { color: '#0f172a', label: 'Sombre' },
                ].map((c) => (
                  <button
                    key={c.color}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setUnderlineColor(c.color);
                      applyCurrentUnderline(underlineStyle, c.color);
                    }}
                    className={`w-7 h-7 rounded-xl border-2 transition-transform ${
                      underlineColor === c.color ? 'ring-2 ring-sky-500 scale-110 border-white' : 'border-slate-300'
                    }`}
                    style={{ backgroundColor: c.color }}
                  />
                ))}
                <input
                  type="color"
                  value={underlineColor}
                  onChange={(e) => {
                    const color = e.target.value;
                    setUnderlineColor(color);
                    applyCurrentUnderline(underlineStyle, color);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="w-7 h-7 rounded-xl border border-slate-300 cursor-pointer p-0.5 bg-white"
                />
              </div>
            </div>

            {/* THICKNESS SLIDER */}
            <div className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <div className="flex justify-between font-black text-xs text-slate-800">
                <span>Épaisseur du Trait</span>
                <span className="text-[#00A0FF] font-mono">{underlineThickness}px</span>
              </div>
              <input
                type="range"
                min={1}
                max={12}
                step={1}
                value={underlineThickness}
                onChange={(e) => {
                  const thickness = parseInt(e.target.value, 10);
                  setUnderlineThickness(thickness);
                  applyCurrentUnderline(underlineStyle, underlineColor, thickness);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                className="w-full accent-[#00A0FF] cursor-pointer"
              />
            </div>

            <button
              onMouseDown={(e) => {
                e.preventDefault();
                removeAllFormattingFromSelection();
                setShowUnderlineMenu(false);
              }}
              className="w-full py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-xl font-bold text-center border border-rose-200 transition-colors"
            >
              Effacer le soulignage
            </button>
          </div>
        )}
      </div>

      {/* COULEUR DE TEXTE AVEC PALETTE */}
      <div className="relative">
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            setShowTextColorMenu(!showTextColorMenu);
            setShowHighlightMenu(false);
            setShowUnderlineMenu(false);
          }}
          className="p-2 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-full transition-colors font-black text-xs flex items-center gap-1 text-emerald-950"
          title="Couleur du texte"
        >
          <Palette className="w-4 h-4 text-emerald-600" />
        </button>

        {showTextColorMenu && (
          <div className={`absolute left-1/2 -translate-x-1/2 bg-white border-2 border-slate-200 rounded-2xl p-3.5 shadow-2xl flex flex-col gap-3 z-50 min-w-[200px] ${menuPosClass}`}>
            <span className="text-xs font-black text-slate-900 uppercase tracking-wider">Couleur de Texte</span>
            <div className="grid grid-cols-5 gap-2">
              {[
                { color: '#00A0FF', label: 'Bleu' },
                { color: '#ef4444', label: 'Rouge' },
                { color: '#16a34a', label: 'Vert' },
                { color: '#ea580c', label: 'Orange' },
                { color: '#9333ea', label: 'Violet' },
                { color: '#0f172a', label: 'Sombre' },
                { color: '#ffffff', label: 'Blanc' },
                { color: '#eab308', label: 'Jaune' },
                { color: '#ec4899', label: 'Rose' },
                { color: '#06b6d4', label: 'Cyan' },
              ].map((c) => (
                <button
                  key={c.color}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    applyFormat('foreColor', c.color);
                    setShowTextColorMenu(false);
                  }}
                  className="w-7 h-7 rounded-xl border border-slate-300 transition-transform hover:scale-115 shadow-xs cursor-pointer"
                  style={{ backgroundColor: c.color }}
                  title={c.label}
                />
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <input
                type="color"
                value={customTextColor}
                onChange={(e) => setCustomTextColor(e.target.value)}
                onMouseDown={(e) => e.stopPropagation()}
                className="w-8 h-8 rounded-xl border border-slate-300 cursor-pointer p-0.5 bg-white"
              />
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  applyFormat('foreColor', customTextColor);
                  setShowTextColorMenu(false);
                }}
                className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs transition-colors"
              >
                Appliquer
              </button>
            </div>
          </div>
        )}
      </div>

      {/* REMOVE FORMATTING */}
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          removeAllFormattingFromSelection();
        }}
        className="p-2 bg-rose-100 hover:bg-rose-200 border border-rose-300 rounded-full transition-colors text-rose-700 font-black text-xs flex items-center gap-1"
        title="Effacer les mises en forme"
      >
        <RemoveFormatting className="w-4 h-4" />
      </button>
    </div>
  );
};
