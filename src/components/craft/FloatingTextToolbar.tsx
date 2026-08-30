'use client';

import React, { useEffect, useState } from 'react';
import {
  Undo,
  Redo,
  Bold,
  Italic,
  Underline,
  Type,
  Palette,
  Highlighter,
  Eraser,
} from 'lucide-react';

export const FloatingTextToolbar = () => {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [openPopover, setOpenPopover] = useState<'underline' | 'text' | 'neon' | null>(null);

  const [underlineThickness, setUnderlineThickness] = useState('3px');
  const [underlineOffset, setUnderlineOffset] = useState('0px');

  const underlineColors = [
    { label: 'Vert Néon', color: '#a3e635' },
    { label: 'Jaune Fluo', color: '#facc15' },
    { label: 'Cyan Fluo', color: '#22d3ee' },
    { label: 'Violet Électrique', color: '#a855f7' },
    { label: 'Bleu Vif', color: '#00A0FF' },
    { label: 'Rose Magenta', color: '#ec4899' },
    { label: 'Orange Feu', color: '#f97316' },
    { label: 'Rouge Vif', color: '#ef4444' },
    { label: 'Émeraude', color: '#10b981' },
    { label: 'Blanc', color: '#ffffff' },
    { label: 'Gris Slate', color: '#64748b' },
    { label: 'Noir Profond', color: '#0f172a' },
  ];

  const textColors = [
    { label: 'Vert Néon', color: '#a3e635' },
    { label: 'Jaune Fluo', color: '#facc15' },
    { label: 'Cyan Fluo', color: '#06b6d4' },
    { label: 'Bleu Royal', color: '#2563eb' },
    { label: 'Violet Impérial', color: '#9333ea' },
    { label: 'Rose Néon', color: '#f43f5e' },
    { label: 'Orange', color: '#f97316' },
    { label: 'Rouge', color: '#dc2626' },
    { label: 'Émeraude', color: '#059669' },
    { label: 'Doré', color: '#d97706' },
    { label: 'Blanc', color: '#ffffff' },
    { label: 'Gris Clair', color: '#cbd5e1' },
    { label: 'Gris Slate', color: '#64748b' },
    { label: 'Noir Obsidian', color: '#0f172a' },
  ];

  const neonColors = [
    { label: 'Vert Néon', color: '#a3e635' },
    { label: 'Jaune Néon', color: '#facc15' },
    { label: 'Cyan Fluo', color: '#22d3ee' },
    { label: 'Rose Fluo', color: '#f472b6' },
    { label: 'Orange Fluo', color: '#fb923c' },
    { label: 'Violet Fluo', color: '#c084fc' },
    { label: 'Corail Fluo', color: '#ff6b6b' },
    { label: 'Menthe Fluo', color: '#51cf66' },
    { label: 'Bleu Ciel', color: '#339af0' },
    { label: 'Ambre', color: '#f59e0b' },
    { label: 'Lavande', color: '#e0e7ff' },
    { label: 'Blanc Pur', color: '#ffffff' },
  ];

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
        const clampedLeft = Math.max(200, Math.min(window.innerWidth - 200, rect.left + rect.width / 2));
        setPosition({
          top: Math.max(12, rect.top - 58),
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

  const executeCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
  };

  const handleApplyHighlight = (color: string) => {
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

  const handleApplyUnderline = (
    color: string,
    thickness = underlineThickness,
    offset = underlineOffset
  ) => {
    if (typeof window === 'undefined') return;

    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    let parent = range.commonAncestorContainer;
    if (parent.nodeType === Node.TEXT_NODE) parent = parent.parentElement!;

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
      targetSpan.style.setProperty('text-decoration-style', 'solid', 'important');
      targetSpan.style.setProperty('text-decoration-color', color, 'important');
      targetSpan.style.setProperty('text-decoration-thickness', thickness, 'important');
      targetSpan.style.setProperty('text-underline-offset', offset, 'important');
      targetSpan.style.setProperty('text-decoration-skip-ink', 'none', 'important');
    }
  };

  const handleApplyTextColor = (color: string) => {
    executeCommand('foreColor', color);
  };

  const handleApplyFontSize = (sizePx: string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    let parent = range.commonAncestorContainer;
    if (parent.nodeType === Node.TEXT_NODE) parent = parent.parentElement!;

    const span = (parent as HTMLElement).closest('span[style*="font-size"]') as HTMLElement | null;
    if (span) {
      span.style.fontSize = sizePx;
    } else {
      const newSpan = document.createElement('span');
      newSpan.style.fontSize = sizePx;
      try {
        range.surroundContents(newSpan);
      } catch (e) {
        const contents = range.extractContents();
        newSpan.appendChild(contents);
        range.insertNode(newSpan);
      }
    }
  };

  const handleRemoveHighlightAndUnderline = () => {
    document.execCommand('removeFormat', false);
  };

  return (
    <div
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translateX(-50%)',
      }}
      className="fixed z-[99999] bg-white text-slate-900 rounded-full shadow-2xl p-1.5 flex items-center gap-1.5 border-2 border-slate-200 animate-in fade-in zoom-in-95 select-none"
    >
      {/* UNDO / REDO */}
      <button
        type="button"
        onClick={() => executeCommand('undo')}
        className="p-2 hover:bg-slate-100 rounded-xl transition-colors font-black text-xs flex items-center gap-1 text-slate-900 cursor-pointer"
        title="Annuler (Ctrl+Z)"
      >
        <Undo className="w-4 h-4 text-slate-900" />
      </button>
      <button
        type="button"
        onClick={() => executeCommand('redo')}
        className="p-2 hover:bg-slate-100 rounded-xl transition-colors font-black text-xs flex items-center gap-1 text-slate-900 cursor-pointer"
        title="Rétablir (Ctrl+Y)"
      >
        <Redo className="w-4 h-4 text-slate-900" />
      </button>

      <div className="w-px h-5 bg-slate-200 my-auto" />

      {/* BOLD / ITALIC */}
      <button
        type="button"
        onClick={() => executeCommand('bold')}
        className="p-2 hover:bg-slate-100 rounded-xl transition-colors font-black text-xs flex items-center gap-1 text-slate-900 font-extrabold cursor-pointer"
        title="Mettre en Gras"
      >
        <Bold className="w-4 h-4 text-slate-900" />
      </button>
      <button
        type="button"
        onClick={() => executeCommand('italic')}
        className="p-2 hover:bg-slate-100 rounded-xl transition-colors font-black text-xs flex items-center gap-1 text-slate-900 italic font-extrabold cursor-pointer"
        title="Mettre en Italique"
      >
        <Italic className="w-4 h-4 text-slate-900" />
      </button>

      <div className="w-px h-5 bg-slate-200 my-auto" />

      {/* SOULIGNÉ POPOVER */}
      <div className="relative shrink-0">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setOpenPopover((prev) => (prev === 'underline' ? null : 'underline'))}
          className="px-3 py-1.5 bg-sky-100 hover:bg-sky-200 border border-sky-300 text-sky-950 font-black rounded-full text-xs flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-2xs"
          title="Soulignage Personnalisé"
        >
          <Underline className="w-4 h-4 text-sky-600 shrink-0" />
          <span>Souligné</span>
          <span className="w-2.5 h-2.5 rounded-full border border-sky-400 bg-[#00A0FF] shrink-0 inline-block" />
          <span className="text-[10px] text-sky-700 shrink-0">▾</span>
        </button>

        {openPopover === 'underline' && (
          <div className="absolute left-0 top-full mt-2 z-[100000] bg-white text-slate-900 rounded-2xl shadow-2xl p-4 border-2 border-slate-200 w-72 space-y-3 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1">
                <Underline className="w-4 h-4 text-[#00A0FF]" />
                <span>Soulignage Personnalisé</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">Épaisseur :</label>
                <select
                  value={underlineThickness}
                  onChange={(e) => setUnderlineThickness(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold text-xs focus:outline-none cursor-pointer"
                >
                  <option value="1px">1px (Fin)</option>
                  <option value="2px">2px (Normal)</option>
                  <option value="3px">3px (Épais)</option>
                  <option value="4px">4px (Fort)</option>
                  <option value="6px">6px (Bandeau)</option>
                  <option value="8px">8px (Surbrillance)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">Hauteur / Position :</label>
                <select
                  value={underlineOffset}
                  onChange={(e) => setUnderlineOffset(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold text-xs focus:outline-none cursor-pointer"
                >
                  <option value="-2px">⚡ Haute (Collée)</option>
                  <option value="0px">📍 Support direct (0px)</option>
                  <option value="2px">✨ Normal (2px)</option>
                  <option value="4px">📏 Espacée (4px)</option>
                  <option value="6px">🔻 Basse (6px)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-800 mb-1.5">Choisir la couleur :</label>
              <div className="grid grid-cols-6 gap-1.5">
                {underlineColors.map((c) => (
                  <button
                    key={c.color}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      handleApplyUnderline(c.color, underlineThickness, underlineOffset);
                      setOpenPopover(null);
                    }}
                    style={{ backgroundColor: c.color }}
                    className="w-7 h-7 rounded-xl border border-slate-300 hover:scale-110 transition-transform cursor-pointer shadow-xs"
                    title={c.label}
                  />
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-600">Glisser couleur :</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  defaultValue="#a3e635"
                  onChange={(e) => handleApplyUnderline(e.target.value, underlineThickness, underlineOffset)}
                  className="w-8 h-8 bg-white cursor-pointer rounded-xl border border-slate-300 p-0.5"
                  title="Glissez le curseur pour explorer toutes les nuances"
                />
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setOpenPopover(null)}
                  className="px-3 py-1 bg-purple-700 hover:bg-purple-800 text-white font-black text-xs rounded-xl cursor-pointer shadow-xs"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* TAILLE SELECTOR */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
        <Type className="w-4 h-4 text-slate-700 ml-1 shrink-0" />
        <select
          onChange={(e) => {
            if (e.target.value) {
              handleApplyFontSize(e.target.value);
              e.target.value = '';
            }
          }}
          className="bg-transparent text-slate-900 font-extrabold text-xs focus:outline-none cursor-pointer pr-1"
          title="Taille du texte"
        >
          <option value="" className="bg-white text-slate-900">Taille</option>
          <option value="12px" className="bg-white text-slate-900">12px</option>
          <option value="14px" className="bg-white text-slate-900">14px</option>
          <option value="18px" className="bg-white text-slate-900">18px</option>
          <option value="24px" className="bg-white text-slate-900">24px</option>
          <option value="32px" className="bg-white text-slate-900">32px</option>
        </select>
      </div>

      {/* COULEUR POPOVER */}
      <div className="relative shrink-0">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setOpenPopover((prev) => (prev === 'text' ? null : 'text'))}
          className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 text-emerald-950 font-black rounded-full text-xs flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-2xs"
          title="Palette de Couleurs de Texte"
        >
          <Palette className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Couleur</span>
          <span className="text-[10px] text-emerald-700 shrink-0">▾</span>
        </button>

        {openPopover === 'text' && (
          <div className="absolute left-0 top-full mt-2 z-[100000] bg-white text-slate-900 rounded-2xl shadow-2xl p-4 border-2 border-slate-200 w-72 space-y-3 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1">
                <Palette className="w-4 h-4 text-emerald-600" />
                <span>Couleur du Texte</span>
              </span>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {textColors.map((c) => (
                <button
                  key={c.color}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    handleApplyTextColor(c.color);
                    setOpenPopover(null);
                  }}
                  style={{ backgroundColor: c.color }}
                  className="w-7 h-7 rounded-xl border border-slate-300 hover:scale-110 transition-transform cursor-pointer shadow-xs"
                  title={c.label}
                />
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-600">Glisser couleur :</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  defaultValue="#a3e635"
                  onChange={(e) => handleApplyTextColor(e.target.value)}
                  className="w-8 h-8 bg-white cursor-pointer rounded-xl border border-slate-300 p-0.5"
                  title="Glissez le curseur pour explorer toutes les nuances"
                />
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setOpenPopover(null)}
                  className="px-3 py-1 bg-purple-700 hover:bg-purple-800 text-white font-black text-xs rounded-xl cursor-pointer shadow-xs"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ✨ NÉON HIGHLIGHT POPOVER */}
      <div className="relative shrink-0">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setOpenPopover((prev) => (prev === 'neon' ? null : 'neon'))}
          className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-950 font-black rounded-full text-xs flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-2xs"
          title="Palette de Surlignage Néon"
        >
          <Highlighter className="w-4 h-4 text-amber-600 shrink-0" />
          <span>✨ Néon</span>
          <span className="text-[10px] text-amber-700 shrink-0">▾</span>
        </button>

        {openPopover === 'neon' && (
          <div className="absolute left-0 top-full mt-2 z-[100000] bg-white text-slate-900 rounded-2xl shadow-2xl p-4 border-2 border-slate-200 w-72 space-y-3 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1">
                <Highlighter className="w-4 h-4 text-amber-600" />
                <span>Surlignage Néon Fluo</span>
              </span>
            </div>

            <div className="grid grid-cols-6 gap-1.5">
              {neonColors.map((c) => (
                <button
                  key={c.color}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    handleApplyHighlight(c.color);
                    setOpenPopover(null);
                  }}
                  style={{ backgroundColor: c.color }}
                  className="w-7 h-7 rounded-xl border border-slate-300 hover:scale-110 transition-transform cursor-pointer shadow-xs"
                  title={c.label}
                />
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-600">Glisser couleur :</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  defaultValue="#a3e635"
                  onChange={(e) => handleApplyHighlight(e.target.value)}
                  className="w-8 h-8 bg-white cursor-pointer rounded-xl border border-slate-300 p-0.5"
                  title="Glissez le curseur pour explorer toutes les nuances"
                />
                <button
                  type="button"
                  onClick={() => setOpenPopover(null)}
                  className="px-3 py-1 bg-purple-700 hover:bg-purple-800 text-white font-black text-xs rounded-xl cursor-pointer shadow-xs"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ERASE FORMATTING */}
      <button
        type="button"
        onClick={handleRemoveHighlightAndUnderline}
        className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 border border-rose-300 text-rose-800 font-black rounded-full text-xs flex items-center gap-1 cursor-pointer shadow-2xs"
        title="Effacer les mises en forme"
      >
        <Eraser className="w-4 h-4 text-rose-600" />
        <span>Effacer</span>
      </button>
    </div>
  );
};
