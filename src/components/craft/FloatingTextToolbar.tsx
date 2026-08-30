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
  const [underlineOffset, setUnderlineOffset] = useState(3);

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

        const clampedLeft = Math.max(150, Math.min(window.innerWidth - 150, rect.left + rect.width / 2));

        setPosition({
          top: Math.max(12, rect.top - 54),
          left: clampedLeft,
        });
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

  const wrapSelectionWithStyle = (cssText: string) => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.style.cssText = cssText;

    try {
      range.surroundContents(span);
    } catch (e) {
      document.execCommand('styleWithCSS', false, 'true');
    }
  };

  const applyCurrentUnderline = (
    style = underlineStyle,
    color = underlineColor,
    thickness = underlineThickness,
    offset = underlineOffset
  ) => {
    const cssText = `text-decoration: underline ${style}; text-decoration-color: ${color}; text-decoration-thickness: ${thickness}px; text-underline-offset: ${offset}px; position: relative; z-index: 10;`;
    wrapSelectionWithStyle(cssText);
  };

  const menuPosClass = openUpward ? 'bottom-full mb-2' : 'top-full mt-2';

  return (
    <div
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translateX(-50%)',
      }}
      className="fixed z-[99999] bg-slate-900 text-white rounded-2xl shadow-2xl p-1.5 flex items-center gap-1 border border-slate-700 animate-in fade-in zoom-in-95 duration-150 select-none"
    >
      {/* BOLD */}
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          applyFormat('bold');
        }}
        className="p-2 hover:bg-slate-800 rounded-xl transition-colors font-black text-xs flex items-center gap-1"
        title="Mettre en Gras"
      >
        <Bold className="w-4 h-4 text-white" />
      </button>

      {/* ITALIC */}
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          applyFormat('italic');
        }}
        className="p-2 hover:bg-slate-800 rounded-xl transition-colors font-black text-xs flex items-center gap-1"
        title="Mettre en Italique"
      >
        <Italic className="w-4 h-4 text-white" />
      </button>

      <div className="w-px h-5 bg-slate-700 my-auto" />

      {/* HIGHLIGHT (FEUTRE SURLIGNEUR AVEC PLUS DE COULEURS) */}
      <div className="relative">
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            setShowHighlightMenu(!showHighlightMenu);
            setShowUnderlineMenu(false);
            setShowTextColorMenu(false);
          }}
          className="p-2 hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-extrabold text-amber-300"
          title="Surligner avec du Feutre"
        >
          <Highlighter className="w-4 h-4 text-amber-300" />
          <span>Feutre</span>
        </button>

        {showHighlightMenu && (
          <div className={`absolute left-0 bg-slate-900 border border-slate-700 rounded-2xl p-2.5 shadow-2xl flex flex-col gap-2 z-50 min-w-[200px] ${menuPosClass}`}>
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Couleur de Feutre</span>
            <div className="grid grid-cols-5 gap-1.5">
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
                    wrapSelectionWithStyle(`background-color: ${c.color}; padding: 2px 6px; border-radius: 4px; box-decoration-break: clone; -webkit-box-decoration-break: clone;`);
                    setShowHighlightMenu(false);
                  }}
                  className="w-7 h-7 rounded-lg border border-slate-600 transition-transform hover:scale-110 cursor-pointer"
                  style={{ backgroundColor: c.color }}
                  title={c.label}
                />
              ))}
            </div>

            {/* CUSTOM HIGHLIGHT COLOR PICKER */}
            <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
              <input
                type="color"
                value={customHighlightColor}
                onChange={(e) => setCustomHighlightColor(e.target.value)}
                onMouseDown={(e) => e.stopPropagation()}
                className="w-7 h-7 rounded-lg border border-slate-600 cursor-pointer p-0.5 bg-transparent"
              />
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  wrapSelectionWithStyle(`background-color: ${customHighlightColor}; padding: 2px 6px; border-radius: 4px; box-decoration-break: clone; -webkit-box-decoration-break: clone;`);
                  setShowHighlightMenu(false);
                }}
                className="flex-1 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[10px] rounded-lg transition-colors"
              >
                Appliquer couleur
              </button>
            </div>

            <button
              onMouseDown={(e) => {
                e.preventDefault();
                applyFormat('removeFormat');
                setShowHighlightMenu(false);
              }}
              className="w-full py-1 text-[10px] text-rose-400 hover:bg-slate-800 rounded-lg font-bold text-center border border-rose-950/40"
            >
              ❌ Retirer le feutre
            </button>
          </div>
        )}
      </div>

      {/* SOULIGNAGE (STYLE, ÉPAISSEUR, POSITION ET COULEURS) */}
      <div className="relative">
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            setShowUnderlineMenu(!showUnderlineMenu);
            setShowHighlightMenu(false);
            setShowTextColorMenu(false);
          }}
          className="p-2 hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-extrabold text-sky-300"
          title="Réglages du Soulignement"
        >
          <Underline className="w-4 h-4 text-sky-300" />
          <span>Souligner</span>
        </button>

        {showUnderlineMenu && (
          <div className={`absolute left-0 bg-slate-900 border border-slate-700 rounded-2xl p-3 shadow-2xl flex flex-col gap-2.5 z-50 min-w-[250px] ${menuPosClass}`}>
            {/* STYLE SELECTOR */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Style de Trait</span>
              <div className="grid grid-cols-3 gap-1">
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
                    className={`py-1 px-1.5 rounded-lg border font-bold text-[10px] transition-colors ${
                      underlineStyle === st.key
                        ? 'bg-sky-500 text-slate-950 border-sky-400 font-black'
                        : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* COLOR SWATCHES FOR UNDERLINE */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Couleur du Trait</span>
              <div className="flex items-center gap-1.5">
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
                    className={`w-6 h-6 rounded-lg border transition-transform ${
                      underlineColor === c.color ? 'ring-2 ring-sky-400 scale-110 border-white' : 'border-slate-600'
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
                  className="w-6 h-6 rounded-lg border border-slate-600 cursor-pointer p-0.5 bg-transparent"
                />
              </div>
            </div>

            {/* THICKNESS SLIDER */}
            <div className="space-y-1 bg-slate-800/80 p-2 rounded-xl border border-slate-700">
              <div className="flex justify-between font-bold text-[10px] text-slate-300">
                <span>Épaisseur du Trait</span>
                <span className="text-sky-400 font-mono">{underlineThickness}px</span>
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
                className="w-full accent-sky-400 cursor-pointer"
              />
            </div>

            {/* VERTICAL OFFSET / OVERLAP SLIDER */}
            <div className="space-y-1 bg-slate-800/80 p-2 rounded-xl border border-slate-700">
              <div className="flex justify-between font-bold text-[10px] text-slate-300">
                <span>↕️ Position / Chevauchement</span>
                <span className="text-sky-400 font-mono">{underlineOffset}px</span>
              </div>
              <input
                type="range"
                min={-8}
                max={12}
                step={1}
                value={underlineOffset}
                onChange={(e) => {
                  const offset = parseInt(e.target.value, 10);
                  setUnderlineOffset(offset);
                  applyCurrentUnderline(underlineStyle, underlineColor, underlineThickness, offset);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                className="w-full accent-sky-400 cursor-pointer"
              />
              <div className="flex justify-between text-[8px] text-slate-400 font-medium px-0.5">
                <span>⬆️ Sur les lettres (-8px)</span>
                <span>Sous le texte (12px) ⬇️</span>
              </div>
            </div>

            <button
              onMouseDown={(e) => {
                e.preventDefault();
                applyFormat('removeFormat');
                setShowUnderlineMenu(false);
              }}
              className="w-full py-1 text-[10px] text-rose-400 hover:bg-slate-800 rounded-lg font-bold text-center border border-rose-950/40"
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
          className="p-2 hover:bg-slate-800 rounded-xl transition-colors font-black text-xs flex items-center gap-1 text-emerald-400"
          title="Couleur du texte"
        >
          <Palette className="w-4 h-4 text-emerald-400" />
        </button>

        {showTextColorMenu && (
          <div className={`absolute left-0 bg-slate-900 border border-slate-700 rounded-2xl p-2.5 shadow-2xl flex flex-col gap-2 z-50 min-w-[180px] ${menuPosClass}`}>
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Couleur de Texte</span>
            <div className="grid grid-cols-5 gap-1.5">
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
                  className="w-6 h-6 rounded-lg border border-slate-600 transition-transform hover:scale-110 cursor-pointer"
                  style={{ backgroundColor: c.color }}
                  title={c.label}
                />
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
              <input
                type="color"
                value={customTextColor}
                onChange={(e) => setCustomTextColor(e.target.value)}
                onMouseDown={(e) => e.stopPropagation()}
                className="w-7 h-7 rounded-lg border border-slate-600 cursor-pointer p-0.5 bg-transparent"
              />
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  applyFormat('foreColor', customTextColor);
                  setShowTextColorMenu(false);
                }}
                className="flex-1 py-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-[10px] rounded-lg transition-colors"
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
          applyFormat('removeFormat');
        }}
        className="p-2 hover:bg-slate-800 text-rose-400 rounded-xl transition-colors font-black text-xs flex items-center gap-1"
        title="Effacer les mises en forme"
      >
        <RemoveFormatting className="w-4 h-4" />
      </button>
    </div>
  );
};
