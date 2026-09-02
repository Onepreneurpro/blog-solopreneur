'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Highlight } from '@tiptap/extension-highlight';
import { Underline } from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlighter, Palette, Bold, Italic, Underline as UnderlineIcon, Eraser } from 'lucide-react';

interface TiptapRichTextElementProps {
  content: string;
  onChange: (html: string) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
  className?: string;
}

const neonColors = [
  { color: '#a3e635', label: 'Lime Fluo' },
  { color: '#facc15', label: 'Jaune Fluo' },
  { color: '#38bdf8', label: 'Cyan Fluo' },
  { color: '#f472b6', label: 'Rose Fluo' },
  { color: '#fb923c', label: 'Orange Fluo' },
  { color: '#c084fc', label: 'Violet Fluo' },
  { color: '#86efac', label: 'Vert Clair' },
  { color: '#22c55e', label: 'Vert Fluo' },
  { color: '#3b82f6', label: 'Bleu Fluo' },
  { color: '#d97706', label: 'Ambre' },
  { color: '#e2e8f0', label: 'Gris Doux' },
  { color: '#ffffff', label: 'Blanc' },
];

const textColors = [
  { color: '#000000', label: 'Noir' },
  { color: '#ffffff', label: 'Blanc' },
  { color: '#ef4444', label: 'Rouge' },
  { color: '#00a0ff', label: 'Bleu SPC' },
  { color: '#10b981', label: 'Émeraude' },
  { color: '#f59e0b', label: 'Ambre' },
  { color: '#8b5cf6', label: 'Violet' },
  { color: '#ec4899', label: 'Rose' },
  { color: '#64748b', label: 'Ardoise' },
  { color: '#0f172a', label: 'Sombre' },
  { color: '#a3e635', label: 'Lime' },
  { color: '#facc15', label: 'Jaune' },
];

export function TiptapRichTextElement({
  content,
  onChange,
  onContextMenu,
  style,
  className,
}: TiptapRichTextElementProps) {
  const [openPopover, setOpenPopover] = useState<'neon' | 'color' | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Color,
    ],
    content: content || '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;

    const updateMenu = () => {
      const { selection } = editor.state;
      if (selection && !selection.empty) {
        const { from, to } = selection;
        const start = editor.view.coordsAtPos(from);
        const end = editor.view.coordsAtPos(to);
        const top = Math.max(10, start.top - 60);
        const left = Math.max(100, (start.left + end.left) / 2);
        setMenuPos({ top, left });
      } else {
        if (!openPopover) {
          setMenuPos(null);
        }
      }
    };

    editor.on('selectionUpdate', updateMenu);
    editor.on('transaction', updateMenu);
    document.addEventListener('selectionchange', updateMenu);
    return () => {
      editor.off('selectionUpdate', updateMenu);
      editor.off('transaction', updateMenu);
      document.removeEventListener('selectionchange', updateMenu);
    };
  }, [editor, openPopover]);

  if (!editor) {
    return (
      <div
        dangerouslySetInnerHTML={{ __html: content || '' }}
        style={style}
        className={className}
      />
    );
  }

  return (
    <div
      onContextMenu={onContextMenu}
      style={style}
      className={`w-full ${className || ''}`}
    >
      {/* TIPTAP PROSEMIRROR VIEWPORT FIXED BUBBLE MENU */}
      {menuPos && (
        <div
          style={{
            position: 'fixed',
            top: `${menuPos.top}px`,
            left: `${menuPos.left}px`,
            transform: 'translateX(-50%)',
            zIndex: 9999999,
          }}
          className="bg-white text-slate-900 rounded-full shadow-2xl p-1.5 flex items-center gap-1 border-2 border-slate-200 select-none animate-in fade-in zoom-in-95"
        >
          {/* B GRAS */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 hover:bg-slate-100 rounded-full transition-colors ${
              editor.isActive('bold') ? 'bg-slate-200 text-purple-700 font-black' : 'text-slate-800'
            }`}
            title="Gras"
          >
            <Bold className="w-4 h-4" />
          </button>

          {/* I ITALIQUE */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 hover:bg-slate-100 rounded-full transition-colors ${
              editor.isActive('italic') ? 'bg-slate-200 text-purple-700 font-black' : 'text-slate-800'
            }`}
            title="Italique"
          >
            <Italic className="w-4 h-4" />
          </button>

          {/* ∪ SOULIGNÉ */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`px-2.5 py-1 bg-sky-100 hover:bg-sky-200 border border-sky-300 text-sky-950 font-black rounded-full text-xs flex items-center gap-1 cursor-pointer shadow-2xs ${
              editor.isActive('underline') ? 'ring-2 ring-sky-500' : ''
            }`}
            title="Souligner"
          >
            <UnderlineIcon className="w-3.5 h-3.5 text-sky-600" />
            <span>Souligné</span>
          </button>

          {/* ✨ NÉON POPOVER */}
          <div className="relative">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setOpenPopover((prev) => (prev === 'neon' ? null : 'neon'))}
              className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-950 font-black rounded-full text-xs flex items-center gap-1 cursor-pointer shadow-2xs"
              title="Surlignage Néon Fluo"
            >
              <Highlighter className="w-3.5 h-3.5 text-amber-600" />
              <span>Néon</span>
              <span className="text-[10px] text-amber-700">▾</span>
            </button>

            {openPopover === 'neon' && (
              <div className="absolute left-0 bottom-full mb-3 z-[1000000] bg-white text-slate-900 rounded-2xl shadow-2xl p-3.5 border-2 border-slate-200 w-72 space-y-2.5 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
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
                        editor.chain().focus().setHighlight({ color: c.color }).run();
                        setOpenPopover(null);
                      }}
                      style={{ backgroundColor: c.color }}
                      className="w-7 h-7 rounded-xl border border-slate-300 hover:scale-110 transition-transform cursor-pointer shadow-xs"
                      title={c.label}
                    />
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-600">Nuance libre :</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      defaultValue="#a3e635"
                      onInput={(e) => {
                        editor.chain().focus().setHighlight({ color: (e.target as HTMLInputElement).value }).run();
                      }}
                      onChange={(e) => {
                        editor.chain().focus().setHighlight({ color: e.target.value }).run();
                      }}
                      className="w-8 h-8 bg-white cursor-pointer rounded-xl border border-slate-300 p-0.5"
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

          {/* 🎨 COULEUR TEXTE POPOVER */}
          <div className="relative">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setOpenPopover((prev) => (prev === 'color' ? null : 'color'))}
              className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 text-emerald-950 font-black rounded-full text-xs flex items-center gap-1 cursor-pointer shadow-2xs"
              title="Couleur du texte"
            >
              <Palette className="w-3.5 h-3.5 text-emerald-600" />
              <span>Couleur</span>
              <span className="text-[10px] text-emerald-700">▾</span>
            </button>

            {openPopover === 'color' && (
              <div className="absolute left-0 bottom-full mb-3 z-[1000000] bg-white text-slate-900 rounded-2xl shadow-2xl p-3.5 border-2 border-slate-200 w-72 space-y-2.5 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1">
                    <Palette className="w-4 h-4 text-emerald-600" />
                    <span>Couleur du Texte</span>
                  </span>
                </div>

                <div className="grid grid-cols-6 gap-1.5">
                  {textColors.map((c) => (
                    <button
                      key={c.color}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        editor.chain().focus().setColor(c.color).run();
                        setOpenPopover(null);
                      }}
                      style={{ backgroundColor: c.color }}
                      className="w-7 h-7 rounded-xl border border-slate-300 hover:scale-110 transition-transform cursor-pointer shadow-xs"
                      title={c.label}
                    />
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-600">Nuance libre :</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      defaultValue="#000000"
                      onInput={(e) => {
                        editor.chain().focus().setColor((e.target as HTMLInputElement).value).run();
                      }}
                      onChange={(e) => {
                        editor.chain().focus().setColor(e.target.value).run();
                      }}
                      className="w-8 h-8 bg-white cursor-pointer rounded-xl border border-slate-300 p-0.5"
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

          {/* 🧹 EFFACER FORMAT */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().unsetHighlight().unsetUnderline().clearNodes().unsetAllMarks().run()}
            className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 border border-rose-300 text-rose-800 font-black rounded-full text-xs flex items-center gap-1 cursor-pointer shadow-2xs"
            title="Effacer format"
          >
            <Eraser className="w-3.5 h-3.5 text-rose-600" />
            <span>Effacer</span>
          </button>
        </div>
      )}

      <EditorContent editor={editor} className="outline-none focus:outline-none" />
    </div>
  );
}
