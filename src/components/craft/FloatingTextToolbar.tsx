'use client';

import React, { useEffect, useState } from 'react';
import { Bold, Italic, Highlighter, Underline, Palette, RemoveFormatting, X } from 'lucide-react';

export const FloatingTextToolbar = () => {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  const [showUnderlineMenu, setShowUnderlineMenu] = useState(false);

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
        setPosition({
          top: Math.max(12, rect.top - 54),
          left: rect.left + rect.width / 2,
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

      {/* HIGHLIGHT (FEUTRE SURLIGNEUR) */}
      <div className="relative">
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            setShowHighlightMenu(!showHighlightMenu);
            setShowUnderlineMenu(false);
          }}
          className="p-2 hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-extrabold text-amber-300"
          title="Surligner avec du Feutre"
        >
          <Highlighter className="w-4 h-4 text-amber-300" />
          <span>Feutre</span>
        </button>

        {showHighlightMenu && (
          <div className="absolute top-full mt-2 left-0 bg-slate-900 border border-slate-700 rounded-2xl p-2 shadow-2xl flex items-center gap-1.5 z-50">
            {[
              { color: '#fef08a', label: 'Jaune' },
              { color: '#bbf7d0', label: 'Vert' },
              { color: '#fbcfe8', label: 'Rose' },
              { color: '#bae6fd', label: 'Bleu' },
              { color: '#fed7aa', label: 'Orange' },
            ].map((c) => (
              <button
                key={c.color}
                onMouseDown={(e) => {
                  e.preventDefault();
                  wrapSelectionWithStyle(`background-color: ${c.color}; padding: 2px 6px; border-radius: 4px; box-decoration-break: clone; -webkit-box-decoration-break: clone;`);
                  setShowHighlightMenu(false);
                }}
                className="w-6 h-6 rounded-lg border border-slate-600 transition-transform hover:scale-125 cursor-pointer"
                style={{ backgroundColor: c.color }}
                title={c.label}
              />
            ))}
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                applyFormat('removeFormat');
                setShowHighlightMenu(false);
              }}
              className="p-1 text-[10px] text-rose-400 hover:bg-slate-800 rounded-lg font-bold"
              title="Retirer le surlignage"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* SOULIGNAGE (UNDERLINE) */}
      <div className="relative">
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            setShowUnderlineMenu(!showUnderlineMenu);
            setShowHighlightMenu(false);
          }}
          className="p-2 hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-extrabold text-sky-300"
          title="Style de Soulignement"
        >
          <Underline className="w-4 h-4 text-sky-300" />
          <span>Souligner</span>
        </button>

        {showUnderlineMenu && (
          <div className="absolute top-full mt-2 left-0 bg-slate-900 border border-slate-700 rounded-2xl p-2 shadow-2xl flex flex-col gap-1 z-50 min-w-[145px]">
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                wrapSelectionWithStyle('text-decoration: underline; text-decoration-color: #00A0FF; text-decoration-thickness: 3px; text-underline-offset: 3px;');
                setShowUnderlineMenu(false);
              }}
              className="px-2.5 py-1.5 hover:bg-slate-800 rounded-xl text-xs font-bold text-sky-300 flex items-center justify-between"
            >
              <span>Solide</span>
              <span className="underline decoration-sky-400 decoration-2 underline-offset-2">abc</span>
            </button>
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                wrapSelectionWithStyle('text-decoration: underline wavy; text-decoration-color: #00A0FF; text-decoration-thickness: 3px; text-underline-offset: 3px;');
                setShowUnderlineMenu(false);
              }}
              className="px-2.5 py-1.5 hover:bg-slate-800 rounded-xl text-xs font-bold text-sky-300 flex items-center justify-between"
            >
              <span>Ondulé 🌊</span>
              <span className="underline decoration-wavy decoration-sky-400 decoration-2 underline-offset-2">abc</span>
            </button>
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                wrapSelectionWithStyle('text-decoration: underline dotted; text-decoration-color: #00A0FF; text-decoration-thickness: 4px; text-underline-offset: 3px;');
                setShowUnderlineMenu(false);
              }}
              className="px-2.5 py-1.5 hover:bg-slate-800 rounded-xl text-xs font-bold text-sky-300 flex items-center justify-between"
            >
              <span>Points •</span>
              <span className="underline decoration-dotted decoration-sky-400 decoration-2 underline-offset-2">abc</span>
            </button>
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                wrapSelectionWithStyle('text-decoration: underline double; text-decoration-color: #00A0FF; text-decoration-thickness: 3px; text-underline-offset: 3px;');
                setShowUnderlineMenu(false);
              }}
              className="px-2.5 py-1.5 hover:bg-slate-800 rounded-xl text-xs font-bold text-sky-300 flex items-center justify-between"
            >
              <span>Double =</span>
              <span className="underline decoration-double decoration-sky-400 underline-offset-2">abc</span>
            </button>
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                applyFormat('removeFormat');
                setShowUnderlineMenu(false);
              }}
              className="px-2.5 py-1 hover:bg-rose-950/50 text-rose-400 rounded-xl text-[10px] font-bold text-center mt-1"
            >
              Effacer le soulignage
            </button>
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
