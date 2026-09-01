'use client';

import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Undo,
  Redo,
  Sliders,
  Smartphone,
  Monitor,
  Save,
  LogOut,
  Type,
  Heading,
  List,
  Box,
  Image as ImageIcon,
  Video,
  Music,
  Columns,
  Rows,
  LayoutGrid,
  CheckSquare,
  Calendar,
  Share2,
  HelpCircle,
  Code,
  Clock,
  Menu as MenuIcon,
  Minus,
  CheckCircle2,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Plus,
  Sparkles,
  ArrowLeft,
  Eye,
  X,
  Maximize2,
  Settings,
  Globe,
  Loader2,
  Link2,
  Unlink,
  Upload,
  Bold,
  Italic,
  Underline,
  Eraser,
  Palette,
  Highlighter,
  MousePointerClick,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CanvasElement {
  id: string;
  type: string;
  category: string;
  content: string;
  data?: any;
  styles?: any;
}

const renderBorderStyles = (data: any) => {
  if (!data) return {};

  const bWidth = data.borderWidth !== undefined ? data.borderWidth : 2;
  const bColor = data.borderColor || '#00A0FF';

  const rTL = data.borderTopLeftRadius !== undefined ? data.borderTopLeftRadius : (data.borderRadius || 0);
  const rTR = data.borderTopRightRadius !== undefined ? data.borderTopRightRadius : (data.borderRadius || 0);
  const rBR = data.borderBottomRightRadius !== undefined ? data.borderBottomRightRadius : (data.borderRadius || 0);
  const rBL = data.borderBottomLeftRadius !== undefined ? data.borderBottomLeftRadius : (data.borderRadius || 0);

  const hasRadius = rTL > 0 || rTR > 0 || rBR > 0 || rBL > 0;
  const borderRadius = hasRadius ? `${rTL}px ${rTR}px ${rBR}px ${rBL}px` : undefined;
  const clipPath = hasRadius ? `inset(0 round ${rTL}px ${rTR}px ${rBR}px ${rBL}px)` : undefined;

  // BOX SHADOW COMPUTATION
  const shadowColor = data.shadowColor || '#000000';
  const opacityPct = data.shadowOpacity !== undefined ? data.shadowOpacity : (data.shadowBlur || data.shadowOffsetY ? 25 : 0);
  const offsetX = data.shadowOffsetX !== undefined ? data.shadowOffsetX : 0;
  const offsetY = data.shadowOffsetY !== undefined ? data.shadowOffsetY : (opacityPct > 0 ? 10 : 0);
  const blur = data.shadowBlur !== undefined ? data.shadowBlur : (opacityPct > 0 ? 15 : 0);
  const spread = data.shadowSpread !== undefined ? data.shadowSpread : 0;
  const isInset = data.shadowInset ? 'inset ' : '';

  let boxShadow = data.boxShadow;
  if (!boxShadow && (opacityPct > 0 || blur > 0 || offsetX !== 0 || offsetY !== 0)) {
    const hexToRgba = (hex: string, op: number) => {
      if (!hex || hex === 'transparent') return 'transparent';
      let c = hex.replace('#', '');
      if (c.length === 3) c = c.split('').map((x) => x + x).join('');
      const num = parseInt(c, 16) || 0;
      const r = (num >> 16) & 255;
      const g = (num >> 8) & 255;
      const b = num & 255;
      return `rgba(${r}, ${g}, ${b}, ${op / 100})`;
    };
    boxShadow = `${isInset}${offsetX}px ${offsetY}px ${blur}px ${spread}px ${hexToRgba(shadowColor, opacityPct)}`;
  }

  if (!data.borderStyle || data.borderStyle === 'none') {
    return {
      borderRadius,
      clipPath,
      WebkitClipPath: clipPath,
      boxShadow,
    };
  }

  return {
    borderStyle: data.borderStyle,
    borderWidth: `${bWidth}px`,
    borderColor: bColor,
    borderRadius,
    clipPath,
    WebkitClipPath: clipPath,
    boxShadow,
  };
};

export default function VisualPageBuilderPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stepId = searchParams?.get('stepId');

  const [funnel, setFunnel] = useState<any>(null);
  const [step, setStep] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ELEMENTS' | 'BLOCKS' | 'SETTINGS'>('ELEMENTS');
  const [pageLang, setPageLang] = useState<string>('fr');
  const [pageDir, setPageDir] = useState<'ltr' | 'rtl'>('ltr');
  const [pageFont, setPageFont] = useState<string>('Inter');
  const [showCopyright, setShowCopyright] = useState<boolean>(true);
  const [pageCopyright, setPageCopyright] = useState<string>('© 2026 Onepreneur&Co. Tous droits réservés.');
  const [copyrightFontSize, setCopyrightFontSize] = useState<number>(12);
  const [copyrightTextColor, setCopyrightTextColor] = useState<string>('#94a3b8');
  const [showCopyrightLine, setShowCopyrightLine] = useState<boolean>(true);
  const [copyrightLineColor, setCopyrightLineColor] = useState<string>('#334155');
  const [copyrightLineOpacity, setCopyrightLineOpacity] = useState<number>(40);
  const [pageBgColor, setPageBgColor] = useState<string>('#020617');
  const [pageBgImage, setPageBgImage] = useState<string>('');
  const [pageBgSize, setPageBgSize] = useState<string>('cover');
  const [pageBgZoom, setPageBgZoom] = useState<number>(100);
  const [pageBgPosX, setPageBgPosX] = useState<number>(50);
  const [pageBgPosY, setPageBgPosY] = useState<number>(0);
  const [activeBlockSubCategory, setActiveBlockSubCategory] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'DESKTOP' | 'MOBILE'>('DESKTOP');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [selectedSubItem, setSelectedSubItem] = useState<{
    blockId: string;
    itemIndex: number;
    subType: 'image' | 'title' | 'desc';
    parentBlockId?: string;
    childIndex?: number;
  } | null>(null);
  const [selectedChildIndex, setSelectedChildIndex] = useState<number | null>(null);
  const [floatingTextMenu, setFloatingTextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    selectedText: string;
    targetElId?: string;
    childIdx?: number | null;
    subChildIdx?: number | null;
  }>({ visible: false, x: 0, y: 0, selectedText: '' });
  const [openFloatingPopover, setOpenFloatingPopover] = useState<'color' | 'neon' | 'fontSize' | null>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const targetDomRef = useRef<HTMLElement | null>(null);

  // Click outside listener to dismiss floating text formatting toolbar
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const toolbar = document.getElementById('floating-builder-text-toolbar');
      if (toolbar && !toolbar.contains(e.target as Node)) {
        setFloatingTextMenu((prev) => ({ ...prev, visible: false }));
      }
    };
    if (floatingTextMenu.visible) {
      window.addEventListener('mousedown', handleClickOutside);
      return () => window.removeEventListener('mousedown', handleClickOutside);
    }
  }, [floatingTextMenu.visible]);

  // Screen clamping so floating toolbar never exceeds PC viewport width
  useLayoutEffect(() => {
    if (floatingTextMenu.visible) {
      const toolbarEl = document.getElementById('floating-builder-text-toolbar');
      if (toolbarEl) {
        const rect = toolbarEl.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        let clampedX = floatingTextMenu.x;
        if (clampedX + rect.width > viewportWidth - 20) {
          clampedX = Math.max(16, viewportWidth - rect.width - 20);
        }
        if (clampedX < 16) clampedX = 16;
        if (clampedX !== floatingTextMenu.x) {
          setFloatingTextMenu((prev) => ({ ...prev, x: clampedX }));
        }
      }
    }
  }, [floatingTextMenu.visible, floatingTextMenu.x]);

  const saveSelection = () => {
    if (typeof window !== 'undefined') {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
        savedRangeRef.current = sel.getRangeAt(0).cloneRange();
      }
    }
  };

  const restoreSelection = () => {
    if (savedRangeRef.current && typeof window !== 'undefined') {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedRangeRef.current);
      }
    }
  };

  const handleOpenFormattingToolbar = (e: React.MouseEvent, targetId: string, childIdx?: number | null, subChildIdx?: number | null, defaultContent?: string) => {
    e.preventDefault();
    e.stopPropagation();
    saveSelection();
    targetDomRef.current = e.currentTarget as HTMLElement;
    setSelectedElementId(targetId);
    if (childIdx !== undefined && childIdx !== null) setSelectedChildIndex(childIdx);
    const selection = window.getSelection();
    const selText = selection ? selection.toString() : '';
    setFloatingTextMenu({
      visible: true,
      x: Math.max(16, Math.min(window.innerWidth - 650, e.clientX - 250)),
      y: Math.max(80, e.clientY - 70),
      selectedText: selText || defaultContent || '',
      targetElId: targetId,
      childIdx: childIdx !== undefined ? childIdx : null,
      subChildIdx: subChildIdx !== undefined ? subChildIdx : null,
    });
  };

  const renderFloatingToolbar = () => {
    if (!floatingTextMenu.visible) return null;
    const targetId = floatingTextMenu.targetElId || selectedElementId;
    const childIdx = (floatingTextMenu.childIdx !== undefined && floatingTextMenu.childIdx !== null)
      ? floatingTextMenu.childIdx
      : selectedChildIndex;
    const subChildIdx = floatingTextMenu.subChildIdx;

    const updateTargetContentOnly = (newContent: string) => {
      if (!targetId) return;
      if (childIdx !== null && childIdx !== undefined && subChildIdx !== null && subChildIdx !== undefined) {
        const targetSection = elements.find(e => e.id === targetId);
        if (targetSection && targetSection.data?.children?.[childIdx]?.data?.children) {
          const children = [...targetSection.data.children];
          const childDiv = { ...children[childIdx] };
          const divChildren = [...(childDiv.data?.children || [])];
          if (divChildren[subChildIdx]) {
            divChildren[subChildIdx] = { ...divChildren[subChildIdx], content: newContent };
            childDiv.data = { ...(childDiv.data || {}), children: divChildren };
            children[childIdx] = childDiv;
            handleUpdateElementData(targetId, { children });
          }
        }
      } else if (childIdx !== null && childIdx !== undefined) {
        const targetSection = elements.find(e => e.id === targetId);
        if (targetSection && targetSection.data?.children) {
          const children = [...targetSection.data.children];
          if (children[childIdx]) {
            children[childIdx] = { ...children[childIdx], content: newContent };
            handleUpdateElementData(targetId, { children });
          }
        }
      } else {
        setElements(prev => prev.map(item => item.id === targetId ? { ...item, content: newContent } : item));
      }
    };

    const updateTarget = (styleUpdates: Record<string, any>, extraProps?: Record<string, any>) => {
      if (!targetId) return;
      if (childIdx !== null && childIdx !== undefined && subChildIdx !== null && subChildIdx !== undefined) {
        const targetSection = elements.find(e => e.id === targetId);
        if (targetSection && targetSection.data?.children?.[childIdx]?.data?.children) {
          const children = [...targetSection.data.children];
          const childDiv = { ...children[childIdx] };
          const divChildren = [...(childDiv.data?.children || [])];
          if (divChildren[subChildIdx]) {
            divChildren[subChildIdx] = { ...divChildren[subChildIdx], ...(extraProps || {}), data: { ...(divChildren[subChildIdx].data || {}), ...styleUpdates } };
            childDiv.data = { ...(childDiv.data || {}), children: divChildren };
            children[childIdx] = childDiv;
            handleUpdateElementData(targetId, { children });
          }
        }
      } else if (childIdx !== null && childIdx !== undefined) {
        const targetSection = elements.find(e => e.id === targetId);
        if (targetSection && targetSection.data?.children) {
          const children = [...targetSection.data.children];
          if (children[childIdx]) {
            children[childIdx] = { ...children[childIdx], ...(extraProps || {}), data: { ...(children[childIdx].data || {}), ...styleUpdates } };
            handleUpdateElementData(targetId, { children });
          }
        }
      } else {
        handleUpdateElementData(targetId, styleUpdates);
      }
    };

    const applyInlineHtmlFormat = (htmlFormatter: (selectedTxt: string) => string) => {
      if (targetDomRef.current) {
        targetDomRef.current.focus();
      }
      restoreSelection();
      const sel = window.getSelection();
      const selectedTxt = sel ? sel.toString().trim() : '';

      if (targetDomRef.current && selectedTxt.length > 0 && sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlFormatter(selectedTxt);
        const formattedNode = tempDiv.firstChild || document.createTextNode(selectedTxt);

        range.deleteContents();
        range.insertNode(formattedNode);

        // Keep text selection active after formatting!
        try {
          const newRange = document.createRange();
          newRange.selectNodeContents(formattedNode);
          sel.removeAllRanges();
          sel.addRange(newRange);
          savedRangeRef.current = newRange.cloneRange();
        } catch (e) {}

        const updatedHtml = targetDomRef.current.innerHTML;
        updateTargetContentOnly(updatedHtml);
      } else if (targetDomRef.current) {
        const fullTxt = (targetDomRef.current as HTMLElement).innerText || targetDomRef.current.textContent || 'Texte';
        targetDomRef.current.innerHTML = htmlFormatter(fullTxt);
        updateTargetContentOnly(targetDomRef.current.innerHTML);
      }
    };

    return (
      <div
        id="floating-builder-text-toolbar"
        style={{ top: `${floatingTextMenu.y}px`, left: `${floatingTextMenu.x}px` }}
        onMouseDown={(e) => e.preventDefault()}
        className="fixed z-[999999] bg-white text-slate-900 rounded-full shadow-2xl p-2 flex items-center gap-1.5 border-2 border-slate-300 max-w-[calc(100vw-32px)] overflow-visible animate-in fade-in zoom-in-95 select-none"
      >
        {/* ↶ ANNULER */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => handleUndo()}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-800 font-extrabold text-xs"
          title="↶ Annuler la dernière modification"
        >
          <Undo className="w-4 h-4 text-slate-900" />
        </button>

        {/* ↷ RÉTABLIR */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => handleRedo()}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-800 font-extrabold text-xs"
          title="↷ Rétablir la modification"
        >
          <Redo className="w-4 h-4 text-slate-900" />
        </button>

        <div className="h-5 w-[1px] bg-slate-300 mx-0.5" />

        {/* B GRAS */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            const sel = window.getSelection();
            if (sel && !sel.isCollapsed) {
              document.execCommand('bold', false);
              const activeEl = document.activeElement;
              if (activeEl && activeEl.getAttribute('contenteditable')) {
                const html = activeEl.innerHTML;
                updateTarget({}, { content: html });
              }
            } else {
              const targetSection = elements.find(e => e.id === targetId);
              let curBold = false;
              if (childIdx !== null && childIdx !== undefined && targetSection?.data?.children?.[childIdx]) {
                const child = targetSection.data.children[childIdx];
                curBold = child.data?.fontWeight === 'black' || child.data?.fontWeight === 'bold';
              } else if (targetSection) {
                curBold = targetSection.data?.fontWeight === 'black' || targetSection.data?.fontWeight === 'bold';
              }
              updateTarget({ fontWeight: curBold ? 'normal' : 'black' });
            }
          }}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-900 font-black text-xs flex items-center justify-center min-w-[32px]"
          title="B Gras (Extrabold)"
        >
          <Bold className="w-4 h-4 text-slate-900" />
        </button>

        {/* I ITALIQUE */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            const sel = window.getSelection();
            if (sel && !sel.isCollapsed) {
              document.execCommand('italic', false);
              const activeEl = document.activeElement;
              if (activeEl && activeEl.getAttribute('contenteditable')) {
                const html = activeEl.innerHTML;
                updateTarget({}, { content: html });
              }
            } else {
              const targetSection = elements.find(e => e.id === targetId);
              let curItalic = false;
              if (childIdx !== null && childIdx !== undefined && targetSection?.data?.children?.[childIdx]) {
                const child = targetSection.data.children[childIdx];
                curItalic = child.data?.fontStyle === 'italic';
              } else if (targetSection) {
                curItalic = targetSection.data?.fontStyle === 'italic';
              }
              updateTarget({ fontStyle: curItalic ? 'normal' : 'italic' });
            }
          }}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-900 italic font-black text-xs flex items-center justify-center min-w-[32px]"
          title="I Italique"
        >
          <Italic className="w-4 h-4 text-slate-900" />
        </button>

        {/* ∪ SOULIGNÉ */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            const sel = window.getSelection();
            if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
              const range = sel.getRangeAt(0);
              const uSpan = document.createElement('u');
              uSpan.style.textDecoration = 'underline';
              uSpan.style.textDecorationColor = '#00A0FF';
              uSpan.style.textDecorationThickness = '3px';
              uSpan.style.textUnderlineOffset = '2px';
              try {
                range.surroundContents(uSpan);
              } catch(err) {
                document.execCommand('underline', false);
              }
              const activeEl = document.activeElement;
              if (activeEl && activeEl.getAttribute('contenteditable')) {
                updateTarget({}, { content: activeEl.innerHTML });
              }
            } else {
              const targetSection = elements.find(e => e.id === targetId);
              let curU = false;
              if (childIdx !== null && childIdx !== undefined && targetSection?.data?.children?.[childIdx]) {
                const child = targetSection.data.children[childIdx];
                curU = child.data?.textDecoration === 'underline';
              } else if (targetSection) {
                curU = targetSection.data?.textDecoration === 'underline';
              }
              updateTarget({ textDecoration: curU ? 'none' : 'underline' });
            }
          }}
          className="px-3 py-1.5 bg-sky-100 hover:bg-sky-200 border border-sky-300 text-sky-950 font-black rounded-full text-xs flex items-center gap-1 cursor-pointer shadow-xs"
          title="Souligner le texte"
        >
          <Underline className="w-4 h-4 text-sky-600" />
          <span>Souligné</span>
        </button>

        {/* T TAILLE DROPDOWN */}
        <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-full border border-slate-300">
          <Type className="w-4 h-4 text-slate-700 shrink-0" />
          <select
            onMouseDown={(e) => e.stopPropagation()}
            onChange={(e) => {
              const val = e.target.value;
              if (val) updateTarget({ fontSize: val });
            }}
            className="bg-transparent text-slate-900 font-extrabold text-xs focus:outline-none cursor-pointer"
            title="Taille de la police"
          >
            <option value="">Taille ▾</option>
            <option value="14px">14px (Petit)</option>
            <option value="18px">18px (Normal)</option>
            <option value="24px">24px (Moyen)</option>
            <option value="32px">32px (Grand)</option>
            <option value="48px">48px (Très Grand)</option>
            <option value="64px">64px (Géant)</option>
          </select>
        </div>

        {/* 🎨 COULEUR TEXTE POPOVER */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setOpenFloatingPopover(prev => prev === 'color' ? null : 'color')}
            className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 text-emerald-950 font-black rounded-full text-xs flex items-center gap-1 cursor-pointer shadow-xs"
            title="Couleur du texte"
          >
            <Palette className="w-4 h-4 text-emerald-600" />
            <span>Couleur</span>
            <span className="text-[10px] text-emerald-700">▾</span>
          </button>

          {openFloatingPopover === 'color' && (
            <div className="absolute left-0 bottom-full mb-3 z-[1000000] bg-white text-slate-900 rounded-2xl shadow-2xl p-4 border-2 border-slate-200 w-64 space-y-3 animate-in fade-in zoom-in-95">
              <div className="text-xs font-black uppercase text-slate-900 border-b pb-1">Couleur du texte</div>
              <div className="grid grid-cols-5 gap-2">
                {['#000000', '#ffffff', '#EF4444', '#00A0FF', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#64748B', '#0F172A'].map(color => (
                  <button
                    key={color}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      applyInlineHtmlFormat((txt) => `<span style="color: ${color} !important;">${txt}</span>`);
                      setOpenFloatingPopover(null);
                    }}
                    className="w-8 h-8 rounded-xl border border-slate-300 hover:scale-110 transition-transform shadow-xs cursor-pointer"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ✨ NÉON POPOVER (FOND DE TEXTE NÉON FLUO) */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setOpenFloatingPopover(prev => prev === 'neon' ? null : 'neon')}
            className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-950 font-black rounded-full text-xs flex items-center gap-1 cursor-pointer shadow-xs"
            title="Surlignage Néon Fluo"
          >
            <Highlighter className="w-4 h-4 text-amber-600" />
            <span>Néon</span>
            <span className="text-[10px] text-amber-700">▾</span>
          </button>

          {openFloatingPopover === 'neon' && (
            <div className="absolute left-0 bottom-full mb-3 z-[1000000] bg-white text-slate-900 rounded-2xl shadow-2xl p-4 border-2 border-slate-200 w-64 space-y-3 animate-in fade-in zoom-in-95">
              <div className="text-xs font-black uppercase text-slate-900 border-b pb-1">Surlignage Néon Fluo</div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { color: '#fef08a', label: 'Jaune Fluo' },
                  { color: '#bbf7d0', label: 'Vert Fluo' },
                  { color: '#fbcfe8', label: 'Rose Fluo' },
                  { color: '#fed7aa', label: 'Orange Fluo' },
                  { color: '#bae6fd', label: 'Bleu Fluo' },
                  { color: '#e9d5ff', label: 'Violet Fluo' },
                  { color: '#EF4444', label: 'Rouge' },
                  { color: '#00A0FF', label: 'Bleu SPC' }
                ].map(item => (
                  <button
                    key={item.color}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    style={{ backgroundColor: item.color }}
                    onClick={() => {
                      applyInlineHtmlFormat((txt) => `<mark style="background-color: ${item.color} !important; color: #0F172A !important; padding: 0.15rem 0.4rem; border-radius: 4px; font-weight: 800; display: inline-block;">${txt}</mark>`);
                      setOpenFloatingPopover(null);
                    }}
                    className="w-10 h-8 rounded-xl border border-slate-300 hover:scale-110 transition-transform shadow-xs cursor-pointer"
                    title={item.label}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 🧹 EFFACER */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            document.execCommand('removeFormat', false);
            const activeEl = document.activeElement;
            if (activeEl && activeEl.getAttribute('contenteditable')) {
              const cleanText = (activeEl as HTMLElement).innerText || activeEl.textContent || '';
              updateTarget({
                textColor: undefined,
                bgColor: 'transparent',
                fontWeight: 'normal',
                fontStyle: 'normal',
                textDecoration: 'none'
              }, { content: cleanText });
            } else {
              updateTarget({
                textColor: undefined,
                bgColor: 'transparent',
                fontWeight: 'normal',
                fontStyle: 'normal',
                textDecoration: 'none'
              });
            }
          }}
          className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 border border-rose-300 text-rose-800 font-black rounded-full text-xs flex items-center gap-1 cursor-pointer shadow-xs"
          title="Effacer les couleurs et le style"
        >
          <Eraser className="w-4 h-4 text-rose-600" />
          <span>Effacer</span>
        </button>

        <div className="h-5 w-[1px] bg-slate-300 mx-0.5" />

        {/* H2 */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            updateTarget({ fontSize: '36px', fontWeight: 'black' }, { type: 'Heading' });
          }}
          className="px-3 py-1 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black rounded-full text-xs shadow-xs"
          title="Convertir en Grand Titre H2"
        >
          H2
        </button>

        {/* H3 */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            updateTarget({ fontSize: '24px', fontWeight: 'bold' }, { type: 'Heading' });
          }}
          className="px-3 py-1 bg-amber-300 hover:bg-amber-400 text-slate-950 font-black rounded-full text-xs shadow-xs"
          title="Convertir en Sous-Titre H3"
        >
          H3
        </button>

        <div className="h-5 w-[1px] bg-slate-300 mx-0.5" />

        {/* 🔗 LIEN */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            const url = prompt('Entrez l URL du lien :', 'https://');
            if (url) updateTarget({ linkUrl: url });
          }}
          className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-full text-xs shadow-xs flex items-center gap-1"
          title="Ajouter un lien"
        >
          <Link2 className="w-3.5 h-3.5" />
          <span>Lien</span>
        </button>

        {/* 📷 PHOTO */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            if (targetId) handleAddElement('Image', 'Média', 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=800&q=80');
          }}
          className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-full text-xs shadow-xs flex items-center gap-1"
          title="Ajouter une image"
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Photo</span>
        </button>

        {/* 🎥 VIDÉO */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            if (targetId) handleAddElement('Video', 'Média', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
          }}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-full text-xs shadow-xs flex items-center gap-1"
          title="Ajouter une vidéo"
        >
          <Video className="w-3.5 h-3.5" />
          <span>Vidéo</span>
        </button>

        {/* ⊞ CTA */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            if (targetId) handleAddElement('ButtonCTA', 'Formulaires & CTA', 'JE PROCÈDE MAINTENANT');
          }}
          className="px-3 py-1 bg-pink-600 hover:bg-pink-700 text-white font-black rounded-full text-xs shadow-xs flex items-center gap-1"
          title="Ajouter un Bouton d action CTA"
        >
          <MousePointerClick className="w-3.5 h-3.5" />
          <span>CTA</span>
        </button>

        {/* ✕ FERMER */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setFloatingTextMenu({ visible: false, x: 0, y: 0, selectedText: '' })}
          className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-800 ml-1"
          title="Fermer la barre de formatage"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  };
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // MAGNETIC SNAP GUIDE LINE STATE FOR AUTOMATIC ALIGNMENT
  const [snapGuide, setSnapGuide] = useState<{
    active: boolean;
    type?: 'height' | 'width' | 'both';
    val?: number;
  } | null>(null);

  // CANVAS BACKGROUND ALIGNMENT GRID STATE (GRILLAGE À CARREAUX ON/OFF)

  const sectionContainerRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // PAGE DISPLAY WIDTH MODE STATE (STANDARD 896px, LARGE 1152px, FULL SCREEN 100%)
  const [pageWidthMode, setPageWidthMode] = useState<'standard' | 'wide' | 'full'>('standard');

  const [openMarginDetail, setOpenMarginDetail] = useState<{
    paddingY?: boolean;
    paddingX?: boolean;
    marginY?: boolean;
    marginX?: boolean;
    borderRadius?: boolean;
  }>({});

  const handleSetPageWidthMode = (mode: 'standard' | 'wide' | 'full') => {
    setPageWidthMode(mode);
    setElements((prev) =>
      prev.map((el) => ({
        ...el,
        data: { ...el.data, pageWidthMode: mode },
      }))
    );
  };

  // LEFT INSPECTOR COLLAPSIBLE SECTIONS ACCORDION STATE
  const [openAccordion, setOpenAccordion] = useState<Record<string, boolean>>({
    imageFile: true,
    align: true,
    dimensions: true,
    crop: true,
    border: true,
    spacing: true,
    action: false,
  });
  const toggleAccordion = (sec: string) => setOpenAccordion((prev) => ({ ...prev, [sec]: !prev[sec] }));

  // Canvas elements state (starts clean and empty)
  const [elements, setElements] = useState<CanvasElement[]>([]);

  // UNDO / REDO HISTORY SYSTEM (RELIABLE REF + STATE DRIVEN)
  const historyRef = useRef<CanvasElement[][]>([]);
  const historyIndexRef = useRef<number>(-1);
  const isUndoRedoActionRef = useRef<boolean>(false);
  const [canUndo, setCanUndo] = useState<boolean>(false);
  const [canRedo, setCanRedo] = useState<boolean>(false);

  useEffect(() => {
    if (isUndoRedoActionRef.current) {
      isUndoRedoActionRef.current = false;
      return;
    }
    if (!elements) return;

    // Deep clone current elements state snapshot
    const snapshot = JSON.parse(JSON.stringify(elements));

    // If we performed an action while viewing past history, truncate redo branch
    const slicedHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
    const nextHistory = [...slicedHistory, snapshot];

    historyRef.current = nextHistory;
    historyIndexRef.current = nextHistory.length - 1;

    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(false);
  }, [elements]);

  const handleUndo = () => {
    if (historyIndexRef.current > 0) {
      isUndoRedoActionRef.current = true;
      const targetIndex = historyIndexRef.current - 1;
      historyIndexRef.current = targetIndex;

      const targetSnapshot = JSON.parse(JSON.stringify(historyRef.current[targetIndex]));
      setElements(targetSnapshot);

      setCanUndo(targetIndex > 0);
      setCanRedo(targetIndex < historyRef.current.length - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      isUndoRedoActionRef.current = true;
      const targetIndex = historyIndexRef.current + 1;
      historyIndexRef.current = targetIndex;

      const targetSnapshot = JSON.parse(JSON.stringify(historyRef.current[targetIndex]));
      setElements(targetSnapshot);

      setCanUndo(targetIndex > 0);
      setCanRedo(targetIndex < historyRef.current.length - 1);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      if (isCtrlOrCmd && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if (isCtrlOrCmd && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const triggerImageFileUpload = (onFileLoaded: (base64Url: string) => void) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        const file = target.files[0];
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
          const base64Url = loadEvent.target?.result as string;
          if (base64Url) {
            onFileLoaded(base64Url);
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleImageMouseDown = (
    e: React.MouseEvent<HTMLElement>,
    currentXVal: number,
    currentYVal: number,
    updatePosition: (posX: number, posY: number) => void
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const initialX = currentXVal !== undefined ? currentXVal : 50;
    const initialY = currentYVal !== undefined ? currentYVal : 50;

    const onMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();
      const deltaXPixels = moveEvent.clientX - startX;
      const deltaYPixels = moveEvent.clientY - startY;

      const newX = Math.max(0, Math.min(100, Math.round(initialX - deltaXPixels * 0.5)));
      const newY = Math.max(0, Math.min(100, Math.round(initialY - deltaYPixels * 0.5)));

      updatePosition(newX, newY);
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchStepData = async () => {
      try {
        const res = await fetch(`/api/admin/funnels/${params.id}`);
        const data = await res.json();
        if (data.funnel) {
          setFunnel(data.funnel);
          const targetStep = data.funnel.steps.find((s: any) => s.id === stepId) || data.funnel.steps[0];
          setStep(targetStep);

          if (targetStep?.content) {
            try {
              const parsed = JSON.parse(targetStep.content);
              if (Array.isArray(parsed)) {
                setElements(parsed);
                const foundMode = parsed.find((el: any) => el.data?.pageWidthMode)?.data?.pageWidthMode;
                if (foundMode && ['standard', 'wide', 'full'].includes(foundMode)) {
                  setPageWidthMode(foundMode);
                }
              } else if (parsed && typeof parsed === 'object') {
                if (Array.isArray(parsed.elements)) setElements(parsed.elements);
                if (parsed.pageBgColor) setPageBgColor(parsed.pageBgColor);
                if (parsed.pageBgImage) setPageBgImage(parsed.pageBgImage);
                if (parsed.pageBgSize) setPageBgSize(parsed.pageBgSize);
                if (parsed.pageBgZoom !== undefined) setPageBgZoom(parsed.pageBgZoom);
                if (parsed.pageBgPosX !== undefined) setPageBgPosX(parsed.pageBgPosX);
                if (parsed.pageBgPosY !== undefined) setPageBgPosY(parsed.pageBgPosY);
                if (parsed.pageWidthMode) setPageWidthMode(parsed.pageWidthMode);
                if (parsed.pageLang) setPageLang(parsed.pageLang);
                if (parsed.pageDir) setPageDir(parsed.pageDir);
                if (parsed.pageFont) setPageFont(parsed.pageFont);
                if (parsed.pageCopyright) setPageCopyright(parsed.pageCopyright);
                if (parsed.showCopyright !== undefined) setShowCopyright(parsed.showCopyright);
                if (parsed.copyrightFontSize !== undefined) setCopyrightFontSize(parsed.copyrightFontSize);
                if (parsed.copyrightTextColor) setCopyrightTextColor(parsed.copyrightTextColor);
                if (parsed.showCopyrightLine !== undefined) setShowCopyrightLine(parsed.showCopyrightLine);
                if (parsed.copyrightLineColor) setCopyrightLineColor(parsed.copyrightLineColor);
                if (parsed.copyrightLineOpacity !== undefined) setCopyrightLineOpacity(parsed.copyrightLineOpacity);
              } else {
                setElements([]);
              }
            } catch (e) {
              setElements([]);
            }
          } else {
            setElements([]);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStepData();
  }, [params.id, stepId]);

  const handlePaletteDragStart = (e: React.DragEvent, type: string, category: string, defaultContent: string) => {
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({ type, category, defaultContent, isNew: true })
    );
  };

  const handleCanvasElementDragStart = (e: React.DragEvent, index: number, id: string) => {
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({ draggedIndex: index, draggedElementId: id, isNew: false })
    );
  };

  const handleCanvasDrop = (e: React.DragEvent, targetIndex?: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverIndex(null);
    const dataStr = e.dataTransfer.getData('application/json');
    if (!dataStr) return;

    try {
      const data = JSON.parse(dataStr);

      // Handle dragging 2, 3, or 4 columns blocks (Col2, Col3, Col4)
      if (data.type === 'Col2' || data.type === 'Col3' || data.type === 'Col4') {
        const numColumns = data.type === 'Col4' ? 4 : data.type === 'Col3' ? 3 : 2;
        const timestamp = Date.now();

        // Find target Section for canvas drop
        const targetEl = targetIndex !== undefined ? elements[targetIndex] : null;
        let targetSecId = targetEl ? targetEl.id : null;
        if (targetEl && targetEl.type !== 'Section' && targetEl.type !== 'BlockSectionFull') {
          const parentSec = elements.find((e) => (e.type === 'Section' || e.type === 'BlockSectionFull') && e.data?.children?.some((ch: any) => ch.id === targetEl.id));
          if (parentSec) targetSecId = parentSec.id;
        }
        if (!targetSecId) {
          targetSecId = [...elements].reverse().find((e) => e.type === 'Section' || e.type === 'BlockSectionFull')?.id || null;
        }

        setElements((prev) =>
          prev.map((el) => {
            if (el.id !== targetSecId) return el;
            const currentChildren = el.data?.children || [];
            const hasExisting = currentChildren.length > 0;
            const newDivs: CanvasElement[] = Array.from({ length: numColumns }).map((_, i) => ({
              id: `child-${timestamp}-${i + 1}`,
              type: 'ContentBox',
              category: 'Disposition',
              content: `Conteneur DIV ${i + 1}`,
              data: {
                ...getDefaultBlockData('ContentBox', `Conteneur DIV ${i + 1}`),
                newRow: i === 0 && hasExisting,
              },
            }));
            return {
              ...el,
              data: {
                ...el.data,
                children: [...currentChildren, ...newDivs],
              },
            };
          })
        );
        return;
      }
      if (data.isNew) {
        const newEl: CanvasElement = {
          id: `el-${Date.now()}`,
          type: data.type,
          category: data.category,
          content: data.defaultContent,
          data: getDefaultBlockData(data.type, data.defaultContent),
        };
        setElements((prev) => {
          const insertIdx = targetIndex !== undefined ? targetIndex : prev.length;
          const updated = [...prev];
          updated.splice(insertIdx, 0, newEl);
          return updated;
        });
        // Keep main palette menu visible for adding multiple elements in a row
      } else if (data.draggedElementId !== undefined) {
        const fromIndex = data.draggedIndex;
        let toIndex = targetIndex !== undefined ? targetIndex : elements.length;
        if (fromIndex !== undefined) {
          setElements((prev) => {
            const updated = [...prev];
            const [moved] = updated.splice(fromIndex, 1);
            if (fromIndex < toIndex) toIndex -= 1;
            updated.splice(toIndex, 0, moved);
            return updated;
          });
          // Keep main palette menu visible
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCardDrop = (e: React.DragEvent, blockId: string, itemIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    const dataStr = e.dataTransfer.getData('application/json');
    if (!dataStr) return;

    try {
      const data = JSON.parse(dataStr);
      const imageUrl = data.defaultContent || data.img || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80';

      setElements((prev) =>
        prev.map((el) => {
          if (el.id !== blockId) return el;
          const currentItems = el.data?.items || [];
          const updatedItems = currentItems.map((it: any, i: number) =>
            i === itemIndex ? { ...it, img: imageUrl } : it
          );
          return { ...el, data: { ...el.data, items: updatedItems } };
        })
      );

      // Remove standalone element if dragged from canvas into container
      if (!data.isNew && data.draggedElementId) {
        setElements((prev) => prev.filter((el) => el.id !== data.draggedElementId));
      }

      // Keep main palette menu visible
      setSelectedSubItem({ blockId, itemIndex, subType: 'image' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleBlockDrop = (e: React.DragEvent, blockId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const dataStr = e.dataTransfer.getData('application/json');
    if (!dataStr) return;

    try {
      const data = JSON.parse(dataStr);

      if (data.type === 'Col2' || data.type === 'Col3' || data.type === 'Col4') {
        let targetSecId = blockId;
        const directSec = elements.find((e) => e.id === blockId && (e.type === 'Section' || e.type === 'BlockSectionFull'));
        if (!directSec) {
          const parentSec = elements.find((e) => (e.type === 'Section' || e.type === 'BlockSectionFull') && e.data?.children?.some((ch: any) => ch.id === blockId));
          if (parentSec) targetSecId = parentSec.id;
        }

        setElements((prev) =>
          prev.map((el) => {
            if (el.id !== targetSecId) return el;
            const currentChildren = el.data?.children || [];
            const hasExisting = currentChildren.length > 0;
            const numColumns = data.type === 'Col4' ? 4 : data.type === 'Col3' ? 3 : 2;
            const timestamp = Date.now();
            const newDivs: CanvasElement[] = Array.from({ length: numColumns }).map((_, i) => ({
              id: `child-${timestamp}-${i + 1}`,
              type: 'ContentBox',
              category: 'Disposition',
              content: `Conteneur DIV ${i + 1}`,
              data: {
                ...getDefaultBlockData('ContentBox', `Conteneur DIV ${i + 1}`),
                newRow: i === 0 && hasExisting,
              },
            }));
            return {
              ...el,
              data: {
                ...el.data,
                children: [...currentChildren, ...newDivs],
              },
            };
          })
        );
        return;
      }
      const newChild: CanvasElement = {
        id: `child-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        type: data.type || (data.category === 'Média' ? 'Image' : 'Text'),
        category: data.category || 'Texte',
        content: data.defaultContent || data.content || (data.type === 'Image' ? 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80' : 'Nouveau texte inséré...'),
        data: getDefaultBlockData(data.type, data.defaultContent),
      };

      // 1. Root-level container drop (Section, ContentBox, etc.)
      const isRootEl = elements.some((item) => item.id === blockId);
      if (isRootEl) {
        setElements((prev) =>
          prev.map((el) => {
            if (el.id !== blockId) return el;
            const currentChildren = el.data?.children || [];
            const isNonDiv = newChild.type !== 'ContentBox' && newChild.type !== 'Section' && newChild.type !== 'BlockSectionFull';
            const hasDivColumns = currentChildren.some((c: any) => c.type === 'ContentBox');
            // If dropping a text/heading or non-div element onto a Section with Divs, place it DIRECTLY AT THE TOP above Divs!
            const updatedChildren = (isNonDiv && hasDivColumns)
              ? [newChild, ...currentChildren]
              : [...currentChildren, newChild];

            return {
              ...el,
              data: {
                ...el.data,
                children: updatedChildren,
              },
            };
          })
        );
        if (!data.isNew && data.draggedElementId) {
          setElements((prev) => prev.filter((el) => el.id !== data.draggedElementId));
        }
        // Keep main palette menu visible
        return;
      }

      // 2. Child DIV container drop inside a Section element
      setElements((prev) =>
        prev.map((el) => {
          if (!el.data?.children) return el;
          const hasChild = el.data.children.some((ch: any) => ch.id === blockId);
          if (!hasChild) return el;

          const updatedChildren = el.data.children.map((ch: any) => {
            if (ch.id !== blockId) return ch;
            const currentSubChildren = ch.data?.children || [];
            return {
              ...ch,
              data: {
                ...(ch.data || {}),
                children: [...currentSubChildren, newChild],
              },
            };
          });

          return {
            ...el,
            data: {
              ...el.data,
              children: updatedChildren,
            },
          };
        })
      );

      if (!data.isNew && data.draggedElementId) {
        setElements((prev) => prev.filter((el) => el.id !== data.draggedElementId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const moveElementToPosition = (index: number, targetPosition: 'top' | 'up' | 'down' | 'bottom', e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setElements((prev) => {
      if (index < 0 || index >= prev.length) return prev;
      const updated = [...prev];
      const [moved] = updated.splice(index, 1);
      if (targetPosition === 'top') {
        updated.unshift(moved);
      } else if (targetPosition === 'bottom') {
        updated.push(moved);
      } else if (targetPosition === 'up') {
        const newIdx = Math.max(0, index - 1);
        updated.splice(newIdx, 0, moved);
      } else if (targetPosition === 'down') {
        const newIdx = Math.min(updated.length, index + 1);
        updated.splice(newIdx, 0, moved);
      }
      return updated;
    });
  };

  const moveElement = (index: number, direction: -1 | 1, e: React.MouseEvent) => {
    moveElementToPosition(index, direction === -1 ? 'up' : 'down', e);
  };

  const [editingBlock, setEditingBlock] = useState<CanvasElement | null>(null);

  const getDefaultBlockData = (type: string, name: string) => {
    if (type === 'Col4') {
      return {
        title: '',
        layoutMode: 'grid-4',
        bgColor: 'transparent',
        children: [
          { id: 'c1', type: 'ContentBox', data: { children: [], paddingTop: 10, paddingBottom: 10, paddingLeft: 10, paddingRight: 10, paddingY: 10, paddingX: 10 } },
          { id: 'c2', type: 'ContentBox', data: { children: [], paddingTop: 10, paddingBottom: 10, paddingLeft: 10, paddingRight: 10, paddingY: 10, paddingX: 10 } },
          { id: 'c3', type: 'ContentBox', data: { children: [], paddingTop: 10, paddingBottom: 10, paddingLeft: 10, paddingRight: 10, paddingY: 10, paddingX: 10 } },
          { id: 'c4', type: 'ContentBox', data: { children: [], paddingTop: 10, paddingBottom: 10, paddingLeft: 10, paddingRight: 10, paddingY: 10, paddingX: 10 } },
        ],
      };
    }
    if (type === 'Col3') {
      return {
        title: '',
        layoutMode: 'grid-3',
        bgColor: 'transparent',
        children: [
          { id: 'c1', type: 'ContentBox', data: { children: [], paddingTop: 10, paddingBottom: 10, paddingLeft: 10, paddingRight: 10, paddingY: 10, paddingX: 10 } },
          { id: 'c2', type: 'ContentBox', data: { children: [], paddingTop: 10, paddingBottom: 10, paddingLeft: 10, paddingRight: 10, paddingY: 10, paddingX: 10 } },
          { id: 'c3', type: 'ContentBox', data: { children: [], paddingTop: 10, paddingBottom: 10, paddingLeft: 10, paddingRight: 10, paddingY: 10, paddingX: 10 } },
        ],
      };
    }
    if (type === 'Col2') {
      return {
        title: '',
        layoutMode: 'grid-2',
        bgColor: 'transparent',
        children: [
          { id: 'c1', type: 'ContentBox', data: { children: [], paddingTop: 10, paddingBottom: 10, paddingLeft: 10, paddingRight: 10, paddingY: 10, paddingX: 10 } },
          { id: 'c2', type: 'ContentBox', data: { children: [], paddingTop: 10, paddingBottom: 10, paddingLeft: 10, paddingRight: 10, paddingY: 10, paddingX: 10 } },
        ],
      };
    }
    if (type === 'BlockFeat4ColImg') {
      return {
        title: 'GRILLE 4 COLONNES (SECTION DÉMONSTRATION)',
        items: [
          { id: '1', title: 'BASES', img: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=400&q=80', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit integer sed.' },
          { id: '2', title: 'CUISINER', img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit integer sed.' },
          { id: '3', title: 'EXTÉRIEUR', img: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=400&q=80', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit integer sed.' },
          { id: '4', title: 'DRESSAGE', img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit integer sed.' },
        ],
      };
    }
    if (type === 'BlockFeat3ColImg') {
      return {
        title: 'Le Savoir-Faire des Experts à Votre Portée (3 Colonnes)',
        subtitle: 'CE QUE VOUS OBTENEZ',
        items: [
          { id: '1', title: 'Le savoir des experts', img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80', desc: 'Accédez à des connaissances approfondies et testées sur le terrain.' },
          { id: '2', title: 'Des leçons pratiques', img: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=400&q=80', desc: 'Des exercices concrets pour passer immédiatement à l action.' },
          { id: '3', title: 'Nouvelles relations', img: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=400&q=80', desc: 'Rejoignez un réseau actif d entrepreneurs passionnés.' },
        ],
      };
    }
    if (type === 'BlockFeat2ColIconsLeft') {
      return {
        title: 'Nos Services & Garanties (2 Colonnes)',
        items: [
          { id: '1', title: 'Succès du projet', desc: 'Accompagnement pas à pas pour garantir l atteinte de vos objectifs.' },
          { id: '2', title: 'Stratégie de Marque', desc: 'Positionnement fort pour vous démarquer sur votre marché.' },
          { id: '3', title: 'Un Support Excellent', desc: 'Une équipe réactive disponible pour répondre à toutes vos questions.' },
          { id: '4', title: 'Template Responsive', desc: 'Des interfaces optimisées pour tous les écrans mobiles et ordinateurs.' },
        ],
      };
    }
    if (type === 'ContentBox') {
      return {
        title: '',
        bgColor: 'transparent',
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 10,
        paddingRight: 10,
        paddingY: 10,
        paddingX: 10,
        children: [],
      };
    }
    if (type === 'Section3Col') {
      return {
        title: '',
        isFullWidth: true,
        bgColor: '#ffffff',
        bgImage: '',
        bgOverlay: 0,
        bgSize: 'cover',
        bgPosition: 'center',
        textColor: '#ffffff',
        paddingTop: 40,
        paddingBottom: 40,
        paddingLeft: 40,
        paddingRight: 40,
        paddingY: 40,
        paddingX: 40,
        children: [
          { id: `child-${Date.now()}-1`, type: 'ContentBox', category: 'Disposition', content: 'Conteneur DIV 1', data: { children: [], paddingTop: 16, paddingBottom: 16, paddingLeft: 16, paddingRight: 16 } },
          { id: `child-${Date.now()}-2`, type: 'ContentBox', category: 'Disposition', content: 'Conteneur DIV 2', data: { children: [], paddingTop: 16, paddingBottom: 16, paddingLeft: 16, paddingRight: 16 } },
          { id: `child-${Date.now()}-3`, type: 'ContentBox', category: 'Disposition', content: 'Conteneur DIV 3', data: { children: [], paddingTop: 16, paddingBottom: 16, paddingLeft: 16, paddingRight: 16 } },
        ],
      };
    }
    if (type === 'Section' || type === 'BlockSectionFull' || type === 'Section3Col') {
      return {
        title: '',
        isFullWidth: true,
        bgColor: '#ffffff',
        bgImage: '',
        bgOverlay: 0,
        bgSize: 'cover',
        bgPosition: 'center',
        textColor: '#ffffff',
        paddingTop: 40,
        paddingBottom: 40,
        paddingLeft: 40,
        paddingRight: 40,
        paddingY: 40,
        paddingX: 40,
        children: [],
      };
    }
    return { title: name, items: [] };
  };

  // MOUSE INTERACTIVE DRAG RESIZING & MAGNETIC ALIGNMENT SNAP HANDLER
  const handleStartSubItemResize = (
    e: React.MouseEvent,
    blockId: string,
    itemIndex: number,
    dir: 'corner-br' | 'corner-bl' | 'corner-tr' | 'corner-tl' | 'edge-t' | 'edge-b' | 'edge-l' | 'edge-r'
  ) => {
    e.stopPropagation();
    e.preventDefault();

    const startX = e.clientX;
    const startY = e.clientY;

    const el = elements.find((item) => item.id === blockId);
    if (!el) return;

    const elItems =
      el.data?.items && el.data.items.length > 0
        ? el.data.items
        : getDefaultBlockData(el.type, el.content).items;

    const currentItem = elItems[itemIndex];
    if (!currentItem) return;

    const startW = currentItem.imgWidth || 280;
    const startH = currentItem.imgSize || 240;
    const aspectRatio = startW / startH;

    // Check if an item is marked as fixed reference in the section
    const fixedRefItem = elItems.find((it: any) => it.isFixedReference);
    const fixedRefHeight = fixedRefItem ? (fixedRefItem.imgSize || 280) : null;
    const fixedRefWidth = fixedRefItem ? (fixedRefItem.imgWidth || 280) : null;

    // Collect sibling heights & widths for magnetic alignment snap
    const siblingHeights = elItems
      .map((it: any, idx: number) => (idx !== itemIndex ? it.imgSize || 280 : null))
      .filter(Boolean);
    const siblingWidths = elItems
      .map((it: any, idx: number) => (idx !== itemIndex ? it.imgWidth || 280 : null))
      .filter(Boolean);

    // Prioritize fixed reference item dimensions over general siblings
    const targetHeights = fixedRefHeight
      ? [fixedRefHeight, ...siblingHeights.filter((h: any) => h !== fixedRefHeight)]
      : siblingHeights;
    const targetWidths = fixedRefWidth
      ? [fixedRefWidth, ...siblingWidths.filter((w: any) => w !== fixedRefWidth)]
      : siblingWidths;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      let rawW = startW;
      let rawH = startH;

      if (dir.startsWith('corner')) {
        // SMOOTH PROPORTIONAL CORNER SCALING BASED ON LARGEST MOUSE DELTA
        let delta = deltaY;
        if (dir === 'corner-br') delta = Math.abs(deltaY) > Math.abs(deltaX) ? deltaY : deltaX;
        else if (dir === 'corner-bl') delta = Math.abs(deltaY) > Math.abs(deltaX) ? deltaY : -deltaX;
        else if (dir === 'corner-tr') delta = Math.abs(deltaY) > Math.abs(deltaX) ? -deltaY : deltaX;
        else if (dir === 'corner-tl') delta = Math.abs(deltaY) > Math.abs(deltaX) ? -deltaY : -deltaX;

        rawH = Math.max(50, Math.min(800, Math.round(startH + delta)));
        rawW = Math.round(rawH * aspectRatio);
      } else if (dir === 'edge-r') {
        rawW = startW + deltaX;
      } else if (dir === 'edge-l') {
        rawW = startW - deltaX;
      } else if (dir === 'edge-b') {
        rawH = startH + deltaY;
      } else if (dir === 'edge-t') {
        rawH = startH - deltaY;
      }

      rawW = Math.max(50, Math.min(800, Math.round(rawW)));
      rawH = Math.max(50, Math.min(800, Math.round(rawH)));

      // HARD MAGNETIC FRICTION WALL SNAP LOGIC (STOPS AT TARGET HEIGHT LIKE HITTING A SOLID WALL)
      let finalH = rawH;
      let finalW = rawW;
      let snappedH = false;
      for (const targetH of targetHeights) {
        if (Math.abs(rawH - targetH) <= 24) {
          finalH = targetH; // STOPS THE IMAGE HEIGHT HARD AT TARGET HEIGHT LIKE A PHYSICAL WALL
          if (dir.startsWith('corner')) {
            finalW = Math.round(finalH * aspectRatio);
          }
          snappedH = true;
          break;
        }
      }

      let snappedW = false;
      if (!snappedH) {
        for (const targetW of targetWidths) {
          if (Math.abs(rawW - targetW) <= 24) {
            finalW = targetW;
            if (dir.startsWith('corner')) {
              finalH = Math.round(finalW / aspectRatio);
            }
            snappedW = true;
            break;
          }
        }
      }

      // SHOW FULL-WIDTH MAGNETIC SNAP ALIGNMENT LINE
      if (snappedH || snappedW) {
        setSnapGuide({
          active: true,
          type: snappedH && snappedW ? 'both' : snappedH ? 'height' : 'width',
          val: snappedH ? finalH : finalW,
        });
      } else {
        setSnapGuide(null);
      }

      setElements((prev) =>
        prev.map((item) => {
          if (item.id !== blockId) return item;
          const itemsList =
            item.data?.items && item.data.items.length > 0
              ? item.data.items
              : getDefaultBlockData(item.type, item.content).items;

          const updatedItems = itemsList.map((it: any, idx: number) =>
            idx === itemIndex ? { ...it, imgWidth: finalW, imgSize: finalH } : it
          );

          return {
            ...item,
            data: {
              ...(item.data || {}),
              items: updatedItems,
            },
          };
        })
      );
    };

    const onMouseUp = () => {
      setSnapGuide(null);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleStartSectionResize = (e: React.MouseEvent, sectionId: string) => {
    e.stopPropagation();
    e.preventDefault();

    const startY = e.clientY;
    const el = elements.find((item) => item.id === sectionId);
    if (!el) return;

    const startMinHeight = el.data?.minHeight || 300;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const newHeight = Math.max(100, Math.min(1600, Math.round(startMinHeight + deltaY)));

      setElements((prev) =>
        prev.map((item) => {
          if (item.id !== sectionId) return item;
          return {
            ...item,
            data: {
              ...item.data,
              minHeight: newHeight,
            },
          };
        })
      );
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // 📐 MOUSE DRAG RESIZE FOR COLUMN WIDTHS IN A SECTION (SCREEN 3 FEATURE)
  const handleStartColWidthResize = (
    e: React.MouseEvent,
    sectionId: string,
    colIndex: number,
    containerElem: HTMLDivElement | null
  ) => {
    e.stopPropagation();
    e.preventDefault();

    const sectionEl = elements.find((item) => item.id === sectionId);
    if (!sectionEl || !containerElem) return;

    const children = sectionEl.data?.children || [];
    const numCols = children.length;
    if (numCols < 2 || colIndex >= numCols - 1) return;

    const startX = e.clientX;
    const containerWidth = containerElem.getBoundingClientRect().width;
    if (containerWidth <= 0) return;

    const currentWidths =
      sectionEl.data?.colWidths && sectionEl.data.colWidths.length === numCols
        ? [...sectionEl.data.colWidths]
        : Array(numCols).fill(100 / numCols);

    const startWidthLeft = currentWidths[colIndex];
    const startWidthRight = currentWidths[colIndex + 1];
    const combinedWidth = startWidthLeft + startWidthRight;

    const onMouseMove = (moveEv: MouseEvent) => {
      const deltaX = moveEv.clientX - startX;
      const deltaPercent = (deltaX / containerWidth) * 100;

      let newLeft = startWidthLeft + deltaPercent;
      newLeft = Math.max(10, Math.min(combinedWidth - 10, newLeft));
      let newRight = combinedWidth - newLeft;

      const newWidths = [...currentWidths];
      newWidths[colIndex] = Math.round(newLeft * 10) / 10;
      newWidths[colIndex + 1] = Math.round(newRight * 10) / 10;

      handleUpdateElementData(sectionId, { colWidths: newWidths });
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // 📐 MOUSE DRAG RESIZE FOR CHILD DIV HEIGHT IN A SECTION (SCREEN 2 FEATURE)
  const handleStartChildHeightResize = (
    e: React.MouseEvent,
    sectionId: string,
    childIndex: number
  ) => {
    e.stopPropagation();
    e.preventDefault();

    const sectionEl = elements.find((item) => item.id === sectionId);
    if (!sectionEl) return;

    const children = [...(sectionEl.data?.children || [])];
    const targetChild = children[childIndex];
    if (!targetChild) return;

    const startY = e.clientY;
    const startMinHeight = targetChild.data?.minHeight || 160;

    const onMouseMove = (moveEv: MouseEvent) => {
      const deltaY = moveEv.clientY - startY;
      const newMinHeight = Math.max(60, Math.round(startMinHeight + deltaY));

      children[childIndex] = {
        ...targetChild,
        data: {
          ...(targetChild.data || {}),
          minHeight: newMinHeight,
        },
      };

      handleUpdateElementData(sectionId, { children });
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleAddElement = (type: string, category: string, defaultContent: string) => {
    // If a container block is selected on the canvas, insert element directly into the container!
    if (selectedElementId) {
      const selectedEl = elements.find((e) => e.id === selectedElementId);
      if (selectedEl && (selectedEl.type === 'ContentBox' || selectedEl.type === 'Section' || selectedEl.type === 'BlockSectionFull' || type === 'Section3Col')) {
        const newChild: CanvasElement = {
          id: `child-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          type,
          category,
          content: defaultContent,
          data: getDefaultBlockData(type, defaultContent),
        };
        const currentChildren = selectedEl.data?.children || [];
        // If adding a non-Div element (Text, Heading) to a Section that has Div columns, place it AT THE TOP above Divs
        const isNonDiv = type !== 'ContentBox' && type !== 'Section' && type !== 'BlockSectionFull';
        const hasDivColumns = currentChildren.some((c: any) => c.type === 'ContentBox');
        const updatedChildren = (isNonDiv && hasDivColumns)
          ? [newChild, ...currentChildren]
          : [...currentChildren, newChild];
        handleUpdateElementData(selectedEl.id, { children: updatedChildren });
        return;
      }

      if (
        selectedEl &&
        (selectedEl.data?.items ||
          ['Col4', 'Col3', 'Col2', 'Block3ColArcadeArizona', 'BlockFeat4ColImg', 'BlockFeat3ColImg', 'BlockHeroArizona', 'BlockBioArizona', 'BlockSoulSistersArizona'].includes(selectedEl.type))
      ) {
        // If a specific sub-card in the container is selected:
        if (selectedSubItem && selectedSubItem.blockId === selectedEl.id) {
          const idx = selectedSubItem.itemIndex;
          const currentItems = selectedEl.data?.items || [];

          if (type === 'Image') {
            const updatedItems = currentItems.map((item: any, i: number) =>
              i === idx ? { ...item, img: defaultContent } : item
            );
            handleUpdateElementData(selectedEl.id, { items: updatedItems, img: defaultContent });
            return;
          }

          if (type === 'Heading' || type === 'Text') {
            const updatedItems = currentItems.map((item: any, i: number) =>
              i === idx ? { ...item, title: defaultContent, desc: defaultContent } : item
            );
            handleUpdateElementData(selectedEl.id, { items: updatedItems, title: defaultContent });
            return;
          }

          if (type === 'ButtonCTA') {
            const updatedItems = currentItems.map((item: any, i: number) =>
              i === idx ? { ...item, buttonText: defaultContent } : item
            );
            handleUpdateElementData(selectedEl.id, { items: updatedItems, buttonText: defaultContent });
            return;
          }
        }

        // Main block image for Arizona blocks (BlockHeroArizona, BlockBioArizona, etc.)
        if (type === 'Image' && ['BlockHeroArizona', 'BlockBioArizona', 'BlockSoulSistersArizona'].includes(selectedEl.type)) {
          handleUpdateElementData(selectedEl.id, { img: defaultContent });
          return;
        }

        // Otherwise add a new card item containing that element into the container
        const currentItems = selectedEl.data?.items || [];
        const newItem = {
          id: `item-${Date.now()}`,
          title: type === 'Heading' || type === 'Text' ? defaultContent : `Élément #${currentItems.length + 1}`,
          desc: type === 'Text' ? defaultContent : 'Description pré-remplie prêt à personnaliser.',
          img: type === 'Image' ? defaultContent : 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80',
          buttonText: type === 'ButtonCTA' ? defaultContent : undefined,
          imgSize: 240,
          borderRadius: 16,
          objectFit: 'cover',
        };
        handleUpdateElementData(selectedEl.id, { items: [...currentItems, newItem] });
        return;
      }
    }

    // Multi-column row / Section handling (Col2, Col3, Col4)
    if (type === 'Col2' || type === 'Col3' || type === 'Col4') {
      const numColumns = type === 'Col4' ? 4 : type === 'Col3' ? 3 : 2;
      const timestamp = Date.now();

      // Bulletproof targetSection resolution: find selected section, parent section of selected child, or last section on canvas
      let targetSection: CanvasElement | null = null;
      if (selectedElementId) {
        const directEl = elements.find((e) => e.id === selectedElementId);
        if (directEl && (directEl.type === 'Section' || directEl.type === 'BlockSectionFull' || directEl.type === 'Section3Col')) {
          targetSection = directEl;
        } else {
          targetSection = elements.find((e) => (e.type === 'Section' || e.type === 'BlockSectionFull' || e.type === 'Section3Col') && e.data?.children?.some((c: any) => c.id === selectedElementId)) || null;
        }
      }
      if (!targetSection) {
        targetSection = [...elements].reverse().find((e) => e.type === 'Section' || e.type === 'BlockSectionFull' || e.type === 'Section3Col') || null;
      }

      const hasExistingChildren = !!(targetSection?.data?.children && targetSection.data.children.length > 0);

      const childDivs: CanvasElement[] = [];
      for (let i = 0; i < numColumns; i++) {
        childDivs.push({
          id: `child-${timestamp}-${i + 1}`,
          type: 'ContentBox',
          category: 'Disposition',
          content: `Conteneur DIV ${i + 1}`,
          data: {
            ...getDefaultBlockData('ContentBox', `Conteneur DIV ${i + 1}`),
            newRow: i === 0 && hasExistingChildren, // 1st Div starts a new row if section already has children
          },
        });
      }

      if (targetSection) {
        handleUpdateElementData(targetSection.id, { children: [...(targetSection.data?.children || []), ...childDivs] });
        return;
      }

      // Otherwise create a new Section containing the child Divs
      const newSection: CanvasElement = {
        id: `el-${timestamp}`,
        type: 'Section',
        category: 'Disposition',
        content: `SECTION (${numColumns} COLONNES)`,
        data: {
          ...getDefaultBlockData('Section', `SECTION (${numColumns} COLONNES)`),
          children: childDivs,
        },
      };
      setElements((prev) => [...prev, newSection]);
      return;
    }

    // Default: Add standalone element to canvas
    const newEl: CanvasElement = {
      id: `el-${Date.now()}`,
      type,
      category,
      content: defaultContent,
      data: getDefaultBlockData(type, defaultContent),
    };
    setElements((prev) => [...prev, newEl]);
    // Keep main palette menu visible for adding multiple elements in a row
  };

  const handleUpdateElementData = (id: string, newData: any) => {
    setElements((prev) =>
      prev.map((item) => (item.id === id ? { ...item, data: { ...item.data, ...newData } } : item))
    );
  };

  const handleUpdateElementContent = (id: string, newContent: string) => {
    setElements((prev) =>
      prev.map((item) => (item.id === id ? { ...item, content: newContent } : item))
    );
  };

  const handleAddItemToBlock = (blockId: string) => {
    setElements((prev) =>
      prev.map((item) => {
        if (item.id !== blockId) return item;
        const currentItems = item.data?.items || [];
        const newItem = {
          id: `${Date.now()}`,
          title: `NOUVEL ÉLÉMENT ${currentItems.length + 1}`,
          img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80',
          desc: 'Description personnalisée de votre élément.',
        };
        const updatedData = { ...item.data, items: [...currentItems, newItem] };
        if (editingBlock?.id === blockId) {
          setEditingBlock({ ...item, data: updatedData });
        }
        return { ...item, data: updatedData };
      })
    );
  };

  const handleRemoveItemFromBlock = (blockId: string, itemId: string) => {
    setElements((prev) =>
      prev.map((item) => {
        if (item.id !== blockId) return item;
        const currentItems = item.data?.items || [];
        const updatedItems = currentItems.filter((it: any) => it.id !== itemId);
        const updatedData = { ...item.data, items: updatedItems };
        if (editingBlock?.id === blockId) {
          setEditingBlock({ ...item, data: updatedData });
        }
        return { ...item, data: updatedData };
      })
    );
  };

  const handleDuplicateElement = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const el = elements.find((item) => item.id === id);
    if (!el) return;
    const duplicated: CanvasElement = {
      ...el,
      id: `el-${Date.now()}`,
    };
    setElements((prev) => [...prev, duplicated]);
  };

  const handleDeleteElement = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setElements((prev) => prev.filter((item) => item.id !== id));
    if (selectedElementId === id) setSelectedElementId(null);
  };

  const handleSavePage = async () => {
    if (!step) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/funnels/${params.id}/steps`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stepId: step.id,
          content: JSON.stringify({
            elements,
            showCopyright,
            pageCopyright,
            copyrightFontSize,
            copyrightTextColor,
            showCopyrightLine,
            copyrightLineColor,
            copyrightLineOpacity,
            pageBgColor,
            pageBgImage,
            pageBgSize,
            pageBgZoom,
            pageBgPosX,
            pageBgPosY,
            pageWidthMode,
            pageLang,
            pageDir,
            pageFont,
          }),
        }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const renderInspectorPanel = () => {
    if (!selectedElementId) return null;
    const selectedEl = elements.find((el) => el.id === selectedElementId);
    if (!selectedEl) return null;
    const rawData = selectedEl.data || {};
    const defaultData = getDefaultBlockData(selectedEl.type, selectedEl.content);
    const elItems =
      rawData.items && rawData.items.length > 0
        ? rawData.items
        : defaultData.items || [];
    const elData = { ...defaultData, ...rawData, items: elItems };

    const currentSubItem = (() => {
      if (!selectedSubItem) return null;
      if (selectedSubItem.parentBlockId === selectedEl.id && selectedSubItem.childIndex !== undefined) {
        const childEl = selectedEl.data?.children?.[selectedSubItem.childIndex];
        if (childEl) {
          const subChildren = childEl.data?.children || [];
          if (subChildren[selectedSubItem.itemIndex]) {
            const targetSub = subChildren[selectedSubItem.itemIndex];
            return targetSub.data || targetSub;
          }
          const childItems = childEl.data?.items || getDefaultBlockData(childEl.type, childEl.content).items || [];
          return childItems[selectedSubItem.itemIndex] || null;
        }
      }
      if (selectedSubItem.blockId === selectedEl.id || selectedSubItem.blockId.startsWith(selectedEl.id)) {
        return elItems[selectedSubItem.itemIndex] || null;
      }
      return null;
    })();

    const updateSubItemProperty = (changes: any) => {
      if (!selectedSubItem) return;
      if (selectedSubItem.parentBlockId === selectedEl.id && selectedSubItem.childIndex !== undefined) {
        const cIdx = selectedSubItem.childIndex;
        const currentChildren = [...(selectedEl.data?.children || [])];
        const targetChild = currentChildren[cIdx];
        const subChildren = [...(targetChild.data?.children || [])];
        if (subChildren[selectedSubItem.itemIndex]) {
          subChildren[selectedSubItem.itemIndex] = {
            ...subChildren[selectedSubItem.itemIndex],
            data: { ...(subChildren[selectedSubItem.itemIndex].data || {}), ...changes },
            content: changes.content !== undefined ? changes.content : (changes.img !== undefined ? changes.img : subChildren[selectedSubItem.itemIndex].content),
          };
          currentChildren[cIdx] = {
            ...targetChild,
            data: { ...(targetChild.data || {}), children: subChildren },
          };
          handleUpdateElementData(selectedEl.id, { children: currentChildren });
          return;
        }
        const currentItems = targetChild.data?.items || getDefaultBlockData(targetChild.type, targetChild.content).items || [];
        const updatedItems = currentItems.map((item: any, i: number) =>
          i === selectedSubItem.itemIndex ? { ...item, ...changes } : item
        );
        currentChildren[cIdx] = {
          ...targetChild,
          data: {
            ...(targetChild.data || {}),
            items: updatedItems,
          },
        };
        handleUpdateElementData(selectedEl.id, { children: currentChildren });
        return;
      }
      const updatedItems = elItems.map((item: any, i: number) =>
        i === selectedSubItem.itemIndex ? { ...item, ...changes } : item
      );
      handleUpdateElementData(selectedEl.id, { items: updatedItems });
    };

    return (
      <div className="flex flex-col h-full text-slate-200 overflow-hidden">
        {/* TOP HEADER MATCHING SCREENSHOT 3: < Retour | Section > Rangée > Image | ✕ */}
        <div className="p-3 border-b border-slate-800 bg-slate-950 flex items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setSelectedElementId(null);
              setSelectedChildIndex(null);
              setSelectedSubItem(null);
            }}
            className="px-3 py-1.5 bg-[#00A0FF] hover:bg-[#0080FF] text-white font-extrabold rounded-xl text-xs flex items-center gap-1 shadow-md transition-all cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>&lt; Retour</span>
          </button>
          <div className="text-[11px] font-bold text-slate-400 truncate flex-1 text-center">
            <button
              type="button"
              onClick={() => {
                setSelectedChildIndex(null);
                setSelectedSubItem(null);
              }}
              className="text-[#00A0FF] hover:underline font-extrabold cursor-pointer"
              title="Retourner aux réglages globaux de la Section"
            >
              Section
            </button>{' '}
            &gt;{' '}
            <span className="text-white font-extrabold">
              {selectedSubItem
                ? selectedSubItem.subType === 'image'
                  ? `Image (#${selectedSubItem.itemIndex + 1})`
                  : selectedSubItem.subType === 'title'
                  ? `Titre (#${selectedSubItem.itemIndex + 1})`
                  : `Paragraphe (#${selectedSubItem.itemIndex + 1})`
                : selectedEl.type}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedElementId(null);
              setSelectedChildIndex(null);
              setSelectedSubItem(null);
            }}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors shrink-0"
            title="Fermer l inspecteur"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* INSPECTOR CONTROLS SCROLLABLE CONTAINER */}
        <div className="p-4 space-y-5 text-xs overflow-y-auto flex-1 builder-sidebar-scroll">
          {/* CONTRÔLE DU BLOC INTÉGRÉ ENTIER DANS LA SECTION */}
          {selectedChildIndex !== null && !selectedSubItem && selectedEl.data?.children?.[selectedChildIndex] && (() => {
            const activeChild = selectedEl.data.children[selectedChildIndex];

            return (
              <div className="p-4 bg-slate-950 rounded-2xl border border-[#00A0FF]/60 space-y-4 shadow-xl mb-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-black text-[#00A0FF] uppercase flex items-center gap-1.5">
                    <span>⚙️</span>
                    <span>Bloc #{selectedChildIndex + 1} : {activeChild.type}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedChildIndex(null)}
                    className="text-[10px] font-bold text-slate-400 hover:text-white underline"
                  >
                    Retour Section
                  </button>
                </div>

                {/* COULEURS DE TOUTES LES CARTES DE LA COLONNE */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <label className="text-[10px] font-black text-[#00A0FF] uppercase tracking-wider block">
                    🎨 Arrière-plan de TOUTES les cartes du bloc
                  </label>
                  <div className="flex items-center gap-3 bg-slate-900 p-2 rounded-xl border border-slate-800">
                    <input
                      type="color"
                      value={activeChild.data?.cardBgColor || '#2759ce'}
                      onChange={(e) => {
                        const val = e.target.value;
                        const currentChildren = [...(selectedEl.data?.children || [])];
                        const targetChild = currentChildren[selectedChildIndex];
                        const currentItems = targetChild.data?.items || getDefaultBlockData(targetChild.type, targetChild.content).items || [];
                        const updatedItems = currentItems.map((it: any) => ({ ...it, bgColor: val }));

                        currentChildren[selectedChildIndex] = {
                          ...targetChild,
                          data: {
                            ...(targetChild.data || {}),
                            cardBgColor: val,
                            items: updatedItems,
                          },
                        };
                        handleUpdateElementData(selectedEl.id, { children: currentChildren });
                      }}
                      className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent"
                    />
                    <span className="font-mono text-xs text-slate-300 uppercase font-bold">
                      {activeChild.data?.cardBgColor || '#2759ce'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* SOUS-ÉLÉMENT INTÉRIEUR SELECTIONNÉ (IMAGE / CARTE) */}
          {selectedSubItem && currentSubItem && (
            <div className="p-4 bg-slate-950 rounded-2xl border border-amber-500/60 space-y-4 shadow-xl mb-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-black text-amber-400 uppercase flex items-center gap-1.5">
                  <span>🖼️</span>
                  <span>Paramètres de l Image / Élément</span>
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedSubItem(null)}
                  className="text-[10px] font-bold text-slate-400 hover:text-white underline"
                >
                  Fermer
                </button>
              </div>

              <div className="space-y-3">
                {/* IMAGE URL INPUT & FILE UPLOAD */}
                <div className="space-y-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">
                      URL de l Image
                    </label>
                    <input
                      type="text"
                      value={currentSubItem.img || currentSubItem.content || ''}
                      onChange={(e) => updateSubItemProperty({ img: e.target.value, content: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-400 outline-none"
                      placeholder="https://..."
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      triggerImageFileUpload((base64Url) => {
                        updateSubItemProperty({ img: base64Url, content: base64Url });
                      });
                    }}
                    className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-600 text-black font-black text-[11px] rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <span>📁 Choisir une photo sur mon PC</span>
                  </button>
                </div>

                {/* CADRAGE À LA SOURIS & ZOOM D'IMAGE */}
                <div className="pt-2 border-t border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-black text-amber-400 uppercase tracking-wider">
                    <span>🖼️ Cadrage à la Souris & Zoom</span>
                    <button
                      type="button"
                      onClick={() => updateSubItemProperty({ posX: 50, posY: 50, imgZoom: 100 })}
                      className="text-[9px] text-slate-400 hover:text-white underline normal-case"
                      title="Réinitialiser au centre"
                    >
                      🔄 Centrer (50%/50%)
                    </button>
                  </div>

                  <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800 text-[10px] text-slate-300 space-y-1">
                    <div className="font-bold text-amber-300 flex items-center gap-1">
                      <span>✋ Cadrage direct :</span>
                    </div>
                    <p className="text-[9px] text-slate-400 leading-snug">
                      Cliquez et <strong>glissez votre souris directement sur l&apos;image</strong> dans la page pour la déplacer librement et choisir le cadrage souhaité.
                    </p>
                  </div>

                  {/* ZOOM / ÉCHELLE */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-300">
                      <span>🔍 Zoom / Échelle d&apos;Image</span>
                      <span className="font-mono text-amber-400 font-bold">{currentSubItem.imgZoom || 100}%</span>
                    </div>
                    <input
                      type="range"
                      min={100}
                      max={300}
                      value={currentSubItem.imgZoom || 100}
                      onChange={(e) => updateSubItemProperty({ imgZoom: Number(e.target.value) })}
                      className="w-full accent-amber-400 h-1.5 cursor-pointer"
                    />
                    <span className="text-[8px] text-slate-400 block">Conseil : vous pouvez aussi utiliser la molette de la souris sur l&apos;image pour zoomer.</span>
                  </div>

                  {/* POSITION HORIZONTALE (X) */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-300">
                      <span>Position Horizontale (X)</span>
                      <span className="font-mono text-white">{currentSubItem.posX !== undefined ? currentSubItem.posX : 50}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={currentSubItem.posX !== undefined ? currentSubItem.posX : 50}
                      onChange={(e) => updateSubItemProperty({ posX: Number(e.target.value) })}
                      className="w-full accent-amber-400 h-1 cursor-pointer"
                    />
                  </div>

                  {/* POSITION VERTICALE (Y) */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-300">
                      <span>Position Verticale (Y)</span>
                      <span className="font-mono text-white">{currentSubItem.posY !== undefined ? currentSubItem.posY : 50}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={currentSubItem.posY !== undefined ? currentSubItem.posY : 50}
                      onChange={(e) => updateSubItemProperty({ posY: Number(e.target.value) })}
                      className="w-full accent-amber-400 h-1 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 1. TITRE / CONTENU DU COMPOSANT */}
          {(selectedEl.type === 'Heading' || selectedEl.type === 'Text' || selectedEl.type === 'ButtonCTA' || selectedEl.type === 'Section' || selectedEl.type === 'BlockSectionFull' || selectedEl.type === 'Section3Col') && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#00A0FF] uppercase tracking-wider block">
                Contenu principal / Titre
              </label>
              <input
                type="text"
                value={elData.title !== undefined ? elData.title : selectedEl.content}
                onChange={(e) => {
                  const val = e.target.value;
                  handleUpdateElementData(selectedEl.id, { title: val });
                  handleUpdateElementContent(selectedEl.id, val);
                }}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-medium focus:border-[#00A0FF] outline-none"
              />
            </div>
          )}



          {/* 🎨 COULEURS ET ARRIÈRE-PLAN DES BLOCS, COLONNES ET TEXTES */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
            <div className="text-[10px] font-black text-[#00A0FF] uppercase tracking-wider flex items-center justify-between">
              <span>🎨 Couleurs & Arrière-plan {selectedChildIndex !== null ? `(Bloc #${selectedChildIndex + 1})` : '(Section)'}</span>
            </div>

            {(() => {
              const targetData = selectedChildIndex !== null
                ? (selectedEl.data?.children?.[selectedChildIndex]?.data || {})
                : (selectedEl.data || {});

              const applyBgImageUpdate = (update: Record<string, any>) => {
                if (selectedChildIndex !== null) {
                  const currentChildren = [...(selectedEl.data?.children || [])];
                  const targetChild = currentChildren[selectedChildIndex];
                  currentChildren[selectedChildIndex] = {
                    ...targetChild,
                    data: {
                      ...(targetChild.data || {}),
                      ...update,
                    },
                  };
                  handleUpdateElementData(selectedEl.id, { children: currentChildren });
                } else {
                  handleUpdateElementData(selectedEl.id, update);
                }
              };

              const isMobInspect = previewMode === 'MOBILE';
              const bgVal = selectedChildIndex !== null
                ? (isMobInspect
                    ? (selectedEl.data?.children?.[selectedChildIndex]?.data?.mobileBgColor || 'transparent')
                    : (selectedEl.data?.children?.[selectedChildIndex]?.data?.bgColor || selectedEl.data?.children?.[selectedChildIndex]?.data?.cardBgColor || 'transparent'))
                : (isMobInspect ? (elData.mobileBgColor || 'transparent') : (elData.bgColor || 'transparent'));

              const cardBgVal = selectedChildIndex !== null
                ? (isMobInspect
                    ? (selectedEl.data?.children?.[selectedChildIndex]?.data?.mobileCardBgColor || selectedEl.data?.children?.[selectedChildIndex]?.data?.mobileBgColor || 'transparent')
                    : (selectedEl.data?.children?.[selectedChildIndex]?.data?.cardBgColor || 'transparent'))
                : (isMobInspect ? (elData.mobileCardBgColor || 'transparent') : (elData.cardBgColor || 'transparent'));

              const textVal = selectedChildIndex !== null
                ? (selectedEl.data?.children?.[selectedChildIndex]?.data?.textColor || '#FFFFFF')
                : (elData.textColor || '#FFFFFF');

              const applyBgChange = (val: string) => {
                const bgProp = previewMode === 'MOBILE' ? 'mobileBgColor' : 'bgColor';
                const cardBgProp = previewMode === 'MOBILE' ? 'mobileCardBgColor' : 'cardBgColor';
                if (selectedChildIndex !== null) {
                  const currentChildren = [...(selectedEl.data?.children || [])];
                  const targetChild = currentChildren[selectedChildIndex];
                  currentChildren[selectedChildIndex] = {
                    ...targetChild,
                    data: {
                      ...(targetChild.data || {}),
                      [bgProp]: val,
                      [cardBgProp]: val,
                    },
                  };
                  handleUpdateElementData(selectedEl.id, { children: currentChildren });
                } else {
                  handleUpdateElementData(selectedEl.id, { [bgProp]: val });
                }
              };

              const applyCardBgChange = (val: string) => {
                const cardBgProp = previewMode === 'MOBILE' ? 'mobileCardBgColor' : 'cardBgColor';
                const bgProp = previewMode === 'MOBILE' ? 'mobileBgColor' : 'bgColor';
                if (selectedChildIndex !== null) {
                  const currentChildren = [...(selectedEl.data?.children || [])];
                  const targetChild = currentChildren[selectedChildIndex];
                  const currentItems = targetChild.data?.items || getDefaultBlockData(targetChild.type, targetChild.content).items || [];
                  const updatedItems = currentItems.map((it: any) => ({ ...it, bgColor: val, mobileBgColor: val }));
                  currentChildren[selectedChildIndex] = {
                    ...targetChild,
                    data: {
                      ...(targetChild.data || {}),
                      [cardBgProp]: val,
                      [bgProp]: val,
                      items: updatedItems,
                    },
                  };
                  handleUpdateElementData(selectedEl.id, { children: currentChildren });
                } else {
                  handleUpdateElementData(selectedEl.id, { [cardBgProp]: val });
                }
              };

              const applyTextChange = (val: string) => {
                if (selectedChildIndex !== null) {
                  const currentChildren = [...(selectedEl.data?.children || [])];
                  const targetChild = currentChildren[selectedChildIndex];
                  currentChildren[selectedChildIndex] = {
                    ...targetChild,
                    data: {
                      ...(targetChild.data || {}),
                      textColor: val,
                    },
                  };
                  handleUpdateElementData(selectedEl.id, { children: currentChildren });
                } else {
                  handleUpdateElementData(selectedEl.id, { textColor: val });
                }
              };

              const presets = ['transparent', '#0F172A', '#000000', '#FFFFFF', '#00A0FF', '#10B981', '#FF7A00', '#EF4444', '#8B5CF6'];

              return (
                <div className="space-y-4">
                  {/* FOND DU BLOC */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-slate-400">
                        {selectedChildIndex !== null ? `Fond du Bloc #${selectedChildIndex + 1}` : 'Fond de Section / Bloc'}
                      </label>
                      <button
                        type="button"
                        onClick={() => applyBgChange(bgVal === 'transparent' ? '#0F172A' : 'transparent')}
                        className={`px-2 py-0.5 rounded text-[9px] font-black uppercase transition-all border ${
                          bgVal === 'transparent'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                        }`}
                      >
                        {bgVal === 'transparent' ? '✓ Transparent' : '🚫 Transparent'}
                      </button>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800">
                      <div className="relative w-7 h-7 shrink-0 rounded-lg overflow-hidden border border-slate-700">
                        {bgVal === 'transparent' ? (
                          <div className="w-full h-full flex items-center justify-center text-[10px] font-black bg-slate-800 text-rose-400">
                            🚫
                          </div>
                        ) : (
                          <input
                            type="color"
                            value={bgVal.startsWith('#') ? bgVal : '#0F172A'}
                            onChange={(e) => applyBgChange(e.target.value)}
                            className="w-full h-full cursor-pointer border-none bg-transparent"
                          />
                        )}
                      </div>
                      <span className="font-mono text-[10px] text-slate-300 uppercase font-bold truncate flex-1">
                        {bgVal === 'transparent' ? 'TRANSPARENT' : bgVal}
                      </span>
                    </div>

                    {/* PALETTE PALETTE PRESETS FOND DU BLOC */}
                    <div className="flex items-center gap-1.5 pt-0.5 overflow-x-auto no-scrollbar">
                      {presets.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => applyBgChange(c)}
                          style={c !== 'transparent' ? { backgroundColor: c } : {}}
                          className={`w-5 h-5 rounded-md border shrink-0 transition-transform hover:scale-110 flex items-center justify-center ${
                            c === bgVal ? 'ring-2 ring-[#00A0FF] ring-offset-1 ring-offset-slate-950 border-white' : 'border-white/20'
                          } ${c === 'transparent' ? 'bg-slate-800' : ''}`}
                          title={c === 'transparent' ? 'Transparent' : c}
                        >
                          {c === 'transparent' && <span className="text-[8px] leading-none font-bold text-rose-400">🚫</span>}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* GRID COULEUR DU TEXTE & FOND DES CARTES */}
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1.5">Couleur du Texte</label>
                      <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800">
                        <input
                          type="color"
                          value={textVal.startsWith('#') ? textVal : '#FFFFFF'}
                          onChange={(e) => applyTextChange(e.target.value)}
                          className="w-7 h-7 rounded-lg cursor-pointer border-none bg-transparent"
                        />
                        <span className="font-mono text-[10px] text-slate-300 uppercase font-bold truncate">
                          {textVal}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[10px] font-bold text-slate-400 truncate">Fond Cartes</label>
                        <button
                          type="button"
                          onClick={() => applyCardBgChange(cardBgVal === 'transparent' ? '#2759ce' : 'transparent')}
                          className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase transition-all border ${
                            cardBgVal === 'transparent'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                          }`}
                        >
                          {cardBgVal === 'transparent' ? '✓ Transp.' : '🚫 Transp.'}
                        </button>
                      </div>
                      <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800">
                        <div className="relative w-7 h-7 shrink-0 rounded-lg overflow-hidden border border-slate-700">
                          {cardBgVal === 'transparent' ? (
                            <div className="w-full h-full flex items-center justify-center text-[10px] font-black bg-slate-800 text-rose-400">
                              🚫
                            </div>
                          ) : (
                            <input
                              type="color"
                              value={cardBgVal.startsWith('#') ? cardBgVal : '#2759ce'}
                              onChange={(e) => applyCardBgChange(e.target.value)}
                              className="w-full h-full cursor-pointer border-none bg-transparent"
                            />
                          )}
                        </div>
                        <span className="font-mono text-[10px] text-slate-300 uppercase font-bold truncate flex-1">
                          {cardBgVal === 'transparent' ? 'TRANSPARENT' : cardBgVal}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 🌄 IMAGE DE FOND (SECTION / BLOC) - DUAL PC / MOBILE */}
                  {(() => {
                    const isMob = previewMode === 'MOBILE';
                    const imgKey = isMob ? 'mobileBgImage' : 'bgImage';
                    const zoomKey = isMob ? 'mobileBgZoom' : 'bgZoom';
                    const posXKey = isMob ? 'mobileBgPosX' : 'bgPosX';
                    const posYKey = isMob ? 'mobileBgPosY' : 'bgPosY';
                    const sizeKey = isMob ? 'mobileBgSize' : 'bgSize';

                    const currentImg = targetData[imgKey] || '';
                    const currentZoom = targetData[zoomKey] !== undefined ? targetData[zoomKey] : 100;
                    const currentPosX = targetData[posXKey] !== undefined ? targetData[posXKey] : 50;
                    const currentPosY = targetData[posYKey] !== undefined ? targetData[posYKey] : 50;
                    const currentSize = targetData[sizeKey] || 'cover';

                    return (
                      <div className="space-y-3 pt-3 border-t border-slate-800">
                        {/* TOGGLE TABS FOR PC VS MOBILE BACKGROUND */}
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-black text-[#00A0FF] uppercase tracking-wider block">
                            🌄 Image de Fond {isMob ? '(MOBILE 📱)' : '(PC 💻)'}
                          </label>
                          {currentImg && (
                            <button
                              type="button"
                              onClick={() => applyBgImageUpdate({ [imgKey]: '', [zoomKey]: 100, [posXKey]: 50, [posYKey]: 50 })}
                              className="text-[9px] font-bold text-rose-400 hover:text-rose-300 underline"
                            >
                              🗑️ Supprimer
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800">
                          <button
                            type="button"
                            onClick={() => setPreviewMode('DESKTOP')}
                            className={`py-1.5 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                              !isMob ? 'bg-[#00A0FF] text-white shadow-xs font-black' : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            <span>💻 Fond PC</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPreviewMode('MOBILE')}
                            className={`py-1.5 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                              isMob ? 'bg-emerald-500 text-white shadow-xs font-black' : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            <span>📱 Fond Mobile</span>
                          </button>
                        </div>

                        <div className="space-y-2">
                          <button
                            type="button"
                            onClick={() => {
                              triggerImageFileUpload((base64Url) => {
                                applyBgImageUpdate({ [imgKey]: base64Url });
                              });
                            }}
                            className={`w-full py-2 px-3 bg-gradient-to-r ${
                              isMob ? 'from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500' : 'from-[#00A0FF] to-blue-600 hover:from-blue-500 hover:to-blue-700'
                            } text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer`}
                          >
                            <span>📁 Choisir photo ${isMob ? 'Mobile' : 'PC'} sur mon PC</span>
                          </button>

                          <div className="flex items-center gap-2">
                            {currentImg && currentImg.startsWith('data:image/') ? (
                              <div className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-[11px] font-bold text-slate-300 flex items-center justify-between">
                                <div className="flex items-center gap-1.5 truncate">
                                  <span>📷</span>
                                  <span className="text-[#00A0FF]">Image locale importée du PC</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => applyBgImageUpdate({ [imgKey]: '' })}
                                  className="text-rose-400 hover:text-rose-300 text-xs font-bold cursor-pointer"
                                >
                                  Supprimer
                                </button>
                              </div>
                            ) : (
                              <input
                                type="text"
                                placeholder={`Ou coller URL image ${isMob ? 'Mobile' : 'PC'}...`}
                                value={currentImg}
                                onChange={(e) => applyBgImageUpdate({ [imgKey]: e.target.value })}
                                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none focus:border-[#00A0FF]"
                              />
                            )}
                          </div>
                        </div>

                        {currentImg && (
                          <div className="space-y-3 pt-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-300 block">Mode de Remplissage ${isMob ? 'Mobile' : 'PC'}</label>
                              <select
                                value={currentSize}
                                onChange={(e) => applyBgImageUpdate({ [sizeKey]: e.target.value })}
                                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 font-bold focus:border-[#00A0FF] outline-none cursor-pointer"
                              >
                                <option value="cover">📐 Couvrir tout le conteneur (Cover)</option>
                                <option value="100% auto">↔️ Adapter à la largeur (100% Auto)</option>
                                <option value="auto 100%">↕️ Adapter à la hauteur (Auto 100%)</option>
                                <option value="100% 100%">↔️ Étirer sur la section (100% 100%)</option>
                                <option value="contain">🖼️ Ajuster sans couper (Contain)</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs font-bold">
                                <span className="text-slate-300">Zoom ${isMob ? 'Mobile' : 'PC'}</span>
                                <span className="text-xs font-mono text-[#00A0FF]">{currentZoom}%</span>
                              </div>
                              <input
                                type="range"
                                min={100}
                                max={300}
                                value={currentZoom}
                                onChange={(e) => applyBgImageUpdate({ [zoomKey]: Number(e.target.value) })}
                                className="w-full accent-[#00A0FF] cursor-pointer"
                              />
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[10px] font-bold">
                                <span className="text-slate-300">Position Horizontale (X) ${isMob ? 'Mobile' : 'PC'}</span>
                                <span className="font-mono text-[#00A0FF]">{currentPosX}%</span>
                              </div>
                              <input
                                type="range"
                                min={0}
                                max={100}
                                value={currentPosX}
                                onChange={(e) => applyBgImageUpdate({ [posXKey]: Number(e.target.value) })}
                                className="w-full accent-[#00A0FF] cursor-pointer"
                              />
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[10px] font-bold">
                                <span className="text-slate-300">Position Verticale (Y) ${isMob ? 'Mobile' : 'PC'}</span>
                                <span className="font-mono text-[#00A0FF]">{currentPosY}%</span>
                              </div>
                              <input
                                type="range"
                                min={0}
                                max={100}
                                value={currentPosY}
                                onChange={(e) => applyBgImageUpdate({ [posYKey]: Number(e.target.value) })}
                                className="w-full accent-[#00A0FF] cursor-pointer"
                              />
                            </div>

                            <div className="pt-1 flex justify-end">
                              <button
                                type="button"
                                onClick={() => applyBgImageUpdate({ [posXKey]: 50, [posYKey]: 50, [zoomKey]: 100 })}
                                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded-lg transition-colors"
                              >
                                🎯 Centrer (50% 50%)
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              );
            })()}
          </div>

          {/* 📍 MARGES EXTERNES ET INTERNES (PADDING & MARGIN) */}
          {(() => {
            const targetData = (() => {
              if (selectedSubItem && selectedSubItem.parentBlockId === selectedEl.id && selectedSubItem.childIndex !== undefined) {
                const targetChild = selectedEl.data?.children?.[selectedSubItem.childIndex];
                const subList = targetChild?.data?.children || targetChild?.data?.items || [];
                const sub = subList[selectedSubItem.itemIndex];
                return sub?.data || sub || {};
              }
              if (selectedChildIndex !== null) {
                return selectedEl.data?.children?.[selectedChildIndex]?.data || {};
              }
              return elData;
            })();

            const updateMarginData = (changes: any) => {
              if (selectedSubItem && selectedSubItem.parentBlockId === selectedEl.id && selectedSubItem.childIndex !== undefined) {
                const cIdx = selectedSubItem.childIndex;
                const currentChildren = [...(selectedEl.data?.children || [])];
                const targetChild = currentChildren[cIdx];
                const currentSubList = [...(targetChild.data?.children || targetChild.data?.items || [])];
                currentSubList[selectedSubItem.itemIndex] = {
                  ...currentSubList[selectedSubItem.itemIndex],
                  data: { ...(currentSubList[selectedSubItem.itemIndex]?.data || {}), ...changes },
                  ...changes,
                };
                currentChildren[cIdx] = {
                  ...targetChild,
                  data: { ...(targetChild.data || {}), children: currentSubList, items: currentSubList },
                };
                handleUpdateElementData(selectedEl.id, { children: currentChildren });
                return;
              }
              if (selectedChildIndex !== null) {
                const currentChildren = [...(selectedEl.data?.children || [])];
                const targetChild = currentChildren[selectedChildIndex];
                currentChildren[selectedChildIndex] = {
                  ...targetChild,
                  data: {
                    ...(targetChild.data || {}),
                    ...changes,
                  },
                };
                handleUpdateElementData(selectedEl.id, { children: currentChildren });
              } else {
                handleUpdateElementData(selectedEl.id, changes);
              }
            };

            const defaultPaddingVal = selectedSubItem ? 0 : (selectedChildIndex !== null ? 10 : 40);
            
            // Computed values (Main Y/X values are strictly bound to paddingY/paddingX/marginY/marginX to avoid reacting when sub-sliders move)
            const padYVal = targetData.paddingY !== undefined ? targetData.paddingY : defaultPaddingVal;
            const padTop = targetData.paddingTop !== undefined ? targetData.paddingTop : padYVal;
            const padBottom = targetData.paddingBottom !== undefined ? targetData.paddingBottom : padYVal;

            const padXVal = targetData.paddingX !== undefined ? targetData.paddingX : (selectedSubItem ? 0 : (selectedChildIndex !== null ? 10 : 40));
            const padLeft = targetData.paddingLeft !== undefined ? targetData.paddingLeft : padXVal;
            const padRight = targetData.paddingRight !== undefined ? targetData.paddingRight : padXVal;

            const marginYVal = targetData.marginY !== undefined ? targetData.marginY : 0;
            const marginTop = targetData.marginTop !== undefined ? targetData.marginTop : marginYVal;
            const marginBottom = targetData.marginBottom !== undefined ? targetData.marginBottom : marginYVal;

            const marginXVal = targetData.marginX !== undefined ? targetData.marginX : 0;
            const marginLeft = targetData.marginLeft !== undefined ? targetData.marginLeft : marginXVal;
            const marginRight = targetData.marginRight !== undefined ? targetData.marginRight : marginXVal;

            const radiusVal = targetData.borderRadius || 0;
            const rTL = targetData.borderTopLeftRadius !== undefined ? targetData.borderTopLeftRadius : radiusVal;
            const rTR = targetData.borderTopRightRadius !== undefined ? targetData.borderTopRightRadius : radiusVal;
            const rBL = targetData.borderBottomLeftRadius !== undefined ? targetData.borderBottomLeftRadius : radiusVal;
            const rBR = targetData.borderBottomRightRadius !== undefined ? targetData.borderBottomRightRadius : radiusVal;

            return (
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <div className="text-[10px] font-black text-[#00A0FF] uppercase tracking-wider flex items-center justify-between">
                  <span>📐 Marges & Espacements (px) {selectedSubItem ? '(Image)' : selectedChildIndex !== null ? `(Bloc #${selectedChildIndex + 1})` : '(Section)'}</span>
                </div>

                {/* 1. MARGE INTERNE VERTICALE (PADDING Y) */}
                <div className="space-y-2 bg-slate-900/90 p-3 rounded-xl border border-slate-800 transition-all">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${openMarginDetail.paddingY ? 'text-slate-500' : 'text-slate-300'}`}>
                      Padding Vertical (Y)
                    </span>
                    <div className="flex items-center gap-1">
                      <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded border transition-all ${
                        openMarginDetail.paddingY
                          ? 'bg-slate-950/40 border-slate-800/80 opacity-50'
                          : 'bg-slate-950 border-slate-700'
                      }`}>
                        <input
                          type="number"
                          disabled={openMarginDetail.paddingY}
                          value={openMarginDetail.paddingY ? (padTop === padBottom ? padTop : padYVal) : padYVal}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            updateMarginData({ paddingY: val, paddingTop: val, paddingBottom: val });
                          }}
                          className={`w-8 bg-transparent text-right font-mono text-[11px] font-bold outline-none ${
                            openMarginDetail.paddingY ? 'text-slate-500 cursor-not-allowed' : 'text-white'
                          }`}
                        />
                        <span className={`text-[9px] font-mono ${openMarginDetail.paddingY ? 'text-slate-600' : 'text-slate-400'}`}>px</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setOpenMarginDetail(prev => ({ ...prev, paddingY: !prev.paddingY }))}
                        className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                        title={openMarginDetail.paddingY ? 'Fermer pour réactiver la barre principale' : 'Ouvrir pour régler Haut/Bas séparément'}
                      >
                        {openMarginDetail.paddingY ? <ChevronUp className="w-3.5 h-3.5 text-[#00A0FF]" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                      </button>
                    </div>
                  </div>

                  {/* BARRE PRINCIPALE PADDING Y (DÉSACTIVÉE ET GRISE QUAND FLÈCHE OUVERTE) */}
                  <input
                    type="range"
                    min={-50}
                    max={150}
                    disabled={openMarginDetail.paddingY}
                    value={padYVal}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      updateMarginData({ paddingY: val, paddingTop: val, paddingBottom: val });
                    }}
                    className={`w-full min-w-0 h-1.5 transition-all ${
                      openMarginDetail.paddingY
                        ? 'opacity-30 grayscale cursor-not-allowed accent-slate-600'
                        : 'accent-[#00A0FF] cursor-pointer'
                    }`}
                  />

                  {/* SOUS-BARRES DÉTAILLÉES HAUT & BAS (SUR CLIC FLECHE) */}
                  {openMarginDetail.paddingY && (
                    <div className="pt-2 mt-2 border-t border-slate-800/80 space-y-2 animate-in fade-in duration-200">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-slate-400 w-16">Top (Haut)</span>
                        <input
                          type="range"
                          min={-50}
                          max={150}
                          value={padTop}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            updateMarginData({ paddingTop: val });
                          }}
                          className="flex-1 accent-[#00A0FF] h-1 cursor-pointer"
                        />
                        <span className="text-[9px] font-mono text-white font-bold w-8 text-right">{padTop}px</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-slate-400 w-16">Bottom (Bas)</span>
                        <input
                          type="range"
                          min={-50}
                          max={150}
                          value={padBottom}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            updateMarginData({ paddingBottom: val });
                          }}
                          className="flex-1 accent-[#00A0FF] h-1 cursor-pointer"
                        />
                        <span className="text-[9px] font-mono text-white font-bold w-8 text-right">{padBottom}px</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. MARGE INTERNE HORIZONTALE (PADDING X) */}
                <div className="space-y-2 bg-slate-900/90 p-3 rounded-xl border border-slate-800 transition-all">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${openMarginDetail.paddingX ? 'text-slate-500' : 'text-slate-300'}`}>
                      Padding Horizontal (X)
                    </span>
                    <div className="flex items-center gap-1">
                      <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded border transition-all ${
                        openMarginDetail.paddingX
                          ? 'bg-slate-950/40 border-slate-800/80 opacity-50'
                          : 'bg-slate-950 border-slate-700'
                      }`}>
                        <input
                          type="number"
                          disabled={openMarginDetail.paddingX}
                          value={openMarginDetail.paddingX ? (padLeft === padRight ? padLeft : padXVal) : padXVal}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            updateMarginData({ paddingX: val, paddingLeft: val, paddingRight: val });
                          }}
                          className={`w-8 bg-transparent text-right font-mono text-[11px] font-bold outline-none ${
                            openMarginDetail.paddingX ? 'text-slate-500 cursor-not-allowed' : 'text-white'
                          }`}
                        />
                        <span className={`text-[9px] font-mono ${openMarginDetail.paddingX ? 'text-slate-600' : 'text-slate-400'}`}>px</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setOpenMarginDetail(prev => ({ ...prev, paddingX: !prev.paddingX }))}
                        className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                        title={openMarginDetail.paddingX ? 'Fermer pour réactiver la barre principale' : 'Ouvrir pour régler Gauche/Droite séparément'}
                      >
                        {openMarginDetail.paddingX ? <ChevronUp className="w-3.5 h-3.5 text-[#00A0FF]" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                      </button>
                    </div>
                  </div>

                  {/* BARRE PRINCIPALE PADDING X (DÉSACTIVÉE ET GRISE QUAND FLÈCHE OUVERTE) */}
                  <input
                    type="range"
                    min={-50}
                    max={150}
                    disabled={openMarginDetail.paddingX}
                    value={padXVal}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      updateMarginData({ paddingX: val, paddingLeft: val, paddingRight: val });
                    }}
                    className={`w-full min-w-0 h-1.5 transition-all ${
                      openMarginDetail.paddingX
                        ? 'opacity-30 grayscale cursor-not-allowed accent-slate-600'
                        : 'accent-[#00A0FF] cursor-pointer'
                    }`}
                  />

                  {/* SOUS-BARRES DÉTAILLÉES GAUCHE & DROITE (SUR CLIC FLECHE) */}
                  {openMarginDetail.paddingX && (
                    <div className="pt-2 mt-2 border-t border-slate-800/80 space-y-2 animate-in fade-in duration-200">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-slate-400 w-16">Left (Gauche)</span>
                        <input
                          type="range"
                          min={-50}
                          max={150}
                          value={padLeft}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            updateMarginData({ paddingLeft: val });
                          }}
                          className="flex-1 accent-[#00A0FF] h-1 cursor-pointer"
                        />
                        <span className="text-[9px] font-mono text-white font-bold w-8 text-right">{padLeft}px</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-slate-400 w-16">Right (Droite)</span>
                        <input
                          type="range"
                          min={-50}
                          max={150}
                          value={padRight}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            updateMarginData({ paddingRight: val });
                          }}
                          className="flex-1 accent-[#00A0FF] h-1 cursor-pointer"
                        />
                        <span className="text-[9px] font-mono text-white font-bold w-8 text-right">{padRight}px</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. MARGE EXTERNE VERTICALE (MARGIN Y) */}
                <div className="space-y-2 bg-slate-900/90 p-3 rounded-xl border border-slate-800 transition-all">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${openMarginDetail.marginY ? 'text-slate-500' : 'text-slate-300'}`}>
                      Margin Vertical (Y)
                    </span>
                    <div className="flex items-center gap-1">
                      <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded border transition-all ${
                        openMarginDetail.marginY
                          ? 'bg-slate-950/40 border-slate-800/80 opacity-50'
                          : 'bg-slate-950 border-slate-700'
                      }`}>
                        <input
                          type="number"
                          disabled={openMarginDetail.marginY}
                          value={openMarginDetail.marginY ? (marginTop === marginBottom ? marginTop : marginYVal) : marginYVal}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            updateMarginData({ marginY: val, marginTop: val, marginBottom: val });
                          }}
                          className={`w-8 bg-transparent text-right font-mono text-[11px] font-bold outline-none ${
                            openMarginDetail.marginY ? 'text-slate-500 cursor-not-allowed' : 'text-white'
                          }`}
                        />
                        <span className={`text-[9px] font-mono ${openMarginDetail.marginY ? 'text-slate-600' : 'text-slate-400'}`}>px</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setOpenMarginDetail(prev => ({ ...prev, marginY: !prev.marginY }))}
                        className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                        title={openMarginDetail.marginY ? 'Fermer pour réactiver la barre principale' : 'Ouvrir pour régler Haut/Bas séparément'}
                      >
                        {openMarginDetail.marginY ? <ChevronUp className="w-3.5 h-3.5 text-[#00A0FF]" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                      </button>
                    </div>
                  </div>

                  {/* BARRE PRINCIPALE MARGIN Y (DÉSACTIVÉE ET GRISE QUAND FLÈCHE OUVERTE) */}
                  <input
                    type="range"
                    min={-50}
                    max={150}
                    disabled={openMarginDetail.marginY}
                    value={marginYVal}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      updateMarginData({ marginY: val, marginTop: val, marginBottom: val });
                    }}
                    className={`w-full min-w-0 h-1.5 transition-all ${
                      openMarginDetail.marginY
                        ? 'opacity-30 grayscale cursor-not-allowed accent-slate-600'
                        : 'accent-[#00A0FF] cursor-pointer'
                    }`}
                  />

                  {/* SOUS-BARRES DÉTAILLÉES HAUT & BAS (SUR CLIC FLECHE) */}
                  {openMarginDetail.marginY && (
                    <div className="pt-2 mt-2 border-t border-slate-800/80 space-y-2 animate-in fade-in duration-200">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-slate-400 w-16">Haut (Top)</span>
                        <input
                          type="range"
                          min={-50}
                          max={150}
                          value={marginTop}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            updateMarginData({ marginTop: val });
                          }}
                          className="flex-1 accent-[#00A0FF] h-1 cursor-pointer"
                        />
                        <span className="text-[9px] font-mono text-white font-bold w-8 text-right">{marginTop}px</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-slate-400 w-16">Bas (Bottom)</span>
                        <input
                          type="range"
                          min={-50}
                          max={150}
                          value={marginBottom}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            updateMarginData({ marginBottom: val });
                          }}
                          className="flex-1 accent-[#00A0FF] h-1 cursor-pointer"
                        />
                        <span className="text-[9px] font-mono text-white font-bold w-8 text-right">{marginBottom}px</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. MARGE EXTERNE HORIZONTALE (MARGIN X) */}
                <div className="space-y-2 bg-slate-900/90 p-3 rounded-xl border border-slate-800 transition-all">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${openMarginDetail.marginX ? 'text-slate-500' : 'text-slate-300'}`}>
                      Margin Horizontal (X)
                    </span>
                    <div className="flex items-center gap-1">
                      <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded border transition-all ${
                        openMarginDetail.marginX
                          ? 'bg-slate-950/40 border-slate-800/80 opacity-50'
                          : 'bg-slate-950 border-slate-700'
                      }`}>
                        <input
                          type="number"
                          disabled={openMarginDetail.marginX}
                          value={openMarginDetail.marginX ? (marginLeft === marginRight ? marginLeft : marginXVal) : marginXVal}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            updateMarginData({ marginX: val, marginLeft: val, marginRight: val });
                          }}
                          className={`w-8 bg-transparent text-right font-mono text-[11px] font-bold outline-none ${
                            openMarginDetail.marginX ? 'text-slate-500 cursor-not-allowed' : 'text-white'
                          }`}
                        />
                        <span className={`text-[9px] font-mono ${openMarginDetail.marginX ? 'text-slate-600' : 'text-slate-400'}`}>px</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setOpenMarginDetail(prev => ({ ...prev, marginX: !prev.marginX }))}
                        className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                        title={openMarginDetail.marginX ? 'Fermer pour réactiver la barre principale' : 'Ouvrir pour régler Gauche/Droite séparément'}
                      >
                        {openMarginDetail.marginX ? <ChevronUp className="w-3.5 h-3.5 text-[#00A0FF]" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                      </button>
                    </div>
                  </div>

                  {/* BARRE PRINCIPALE MARGIN X (DÉSACTIVÉE ET GRISE QUAND FLÈCHE OUVERTE) */}
                  <input
                    type="range"
                    min={-50}
                    max={150}
                    disabled={openMarginDetail.marginX}
                    value={marginXVal}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      updateMarginData({ marginX: val, marginLeft: val, marginRight: val });
                    }}
                    className={`w-full min-w-0 h-1.5 transition-all ${
                      openMarginDetail.marginX
                        ? 'opacity-30 grayscale cursor-not-allowed accent-slate-600'
                        : 'accent-[#00A0FF] cursor-pointer'
                    }`}
                  />

                  {/* SOUS-BARRES DÉTAILLÉES GAUCHE & DROITE (SUR CLIC FLECHE) */}
                  {openMarginDetail.marginX && (
                    <div className="pt-2 mt-2 border-t border-slate-800/80 space-y-2 animate-in fade-in duration-200">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-slate-400 w-16">Left (Gauche)</span>
                        <input
                          type="range"
                          min={-50}
                          max={150}
                          value={marginLeft}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            updateMarginData({ marginLeft: val });
                          }}
                          className="flex-1 accent-[#00A0FF] h-1 cursor-pointer"
                        />
                        <span className="text-[9px] font-mono text-white font-bold w-8 text-right">{marginLeft}px</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-slate-400 w-16">Right (Droite)</span>
                        <input
                          type="range"
                          min={-50}
                          max={150}
                          value={marginRight}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            updateMarginData({ marginRight: val });
                          }}
                          className="flex-1 accent-[#00A0FF] h-1 cursor-pointer"
                        />
                        <span className="text-[9px] font-mono text-white font-bold w-8 text-right">{marginRight}px</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 7. CADRE & BORDURE (BORDER STYLE, WIDTH IN PX, COLOR, RADIUS) */}
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
                  <div className="text-[10px] font-black text-[#00A0FF] uppercase tracking-wider flex items-center justify-between">
                    <span>🖼️ Cadre & Bordure {selectedSubItem ? '(Élément)' : selectedChildIndex !== null ? `(Bloc #${selectedChildIndex + 1})` : '(Section)'}</span>
                  </div>

                  {/* A. STYLE DU CADRE (CONTINU, TIRETS, POINTILLÉ, DOUBLE, AUCUN) */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-300 block">Style du Cadre / Ligne</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { id: 'none', label: 'Aucun' },
                        { id: 'solid', label: '── Continu' },
                        { id: 'dashed', label: '╌╌ Tirets' },
                        { id: 'dotted', label: '┈ ┈ Pointillé' },
                        { id: 'double', label: '══ Double' },
                      ].map((styleOpt) => {
                        const isActive = (targetData.borderStyle || 'none') === styleOpt.id;
                        return (
                          <button
                            key={styleOpt.id}
                            type="button"
                            onClick={() => {
                              const defaultW = styleOpt.id !== 'none' && (!targetData.borderWidth || targetData.borderWidth === 0) ? 2 : (targetData.borderWidth || 0);
                              updateMarginData({ borderStyle: styleOpt.id, borderWidth: defaultW });
                            }}
                            className={`px-2.5 py-1.5 text-xs font-bold rounded-xl border transition-all text-left flex items-center justify-between cursor-pointer ${
                              isActive
                                ? 'bg-[#00A0FF] text-white border-[#00A0FF] shadow-md'
                                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <span>{styleOpt.label}</span>
                            {isActive && <span className="text-[10px]">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* B. ÉPAISSEUR DU CADRE (EN PX) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-300">Épaisseur de ligne (Largeur)</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={0}
                          max={30}
                          value={targetData.borderWidth !== undefined ? targetData.borderWidth : ((targetData.borderStyle && targetData.borderStyle !== 'none') ? 1 : 0)}
                          onChange={(e) => updateMarginData({ borderWidth: Number(e.target.value) })}
                          className="w-14 px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-right text-xs font-mono text-[#00A0FF] focus:outline-none focus:border-[#00A0FF]"
                        />
                        <span className="text-[11px] font-mono text-slate-400">px</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={20}
                      value={targetData.borderWidth !== undefined ? targetData.borderWidth : ((targetData.borderStyle && targetData.borderStyle !== 'none') ? 1 : 0)}
                      onChange={(e) => updateMarginData({ borderWidth: Number(e.target.value) })}
                      className="w-full accent-[#00A0FF] cursor-pointer"
                    />
                  </div>

                  {/* C. COULEUR DU CADRE */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-300 block">Couleur de la ligne du cadre</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={targetData.borderColor || '#00A0FF'}
                        onChange={(e) => updateMarginData({ borderColor: e.target.value })}
                        className="w-9 h-9 rounded-lg border border-slate-700 bg-slate-900 cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={targetData.borderColor || '#00A0FF'}
                        onChange={(e) => updateMarginData({ borderColor: e.target.value })}
                        className="flex-1 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-[#00A0FF]"
                      />
                    </div>
                    {/* PRESET COLOR SWATCHES */}
                    <div className="flex items-center gap-1.5 pt-1">
                      {['#00A0FF', '#ffffff', '#334155', '#000000', '#ef4444', '#22c55e', '#eab308', '#a855f7'].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => updateMarginData({ borderColor: c })}
                          className="w-5 h-5 rounded-full border border-slate-700 cursor-pointer hover:scale-110 transition-transform shadow-sm"
                          style={{ backgroundColor: c }}
                          title={c}
                        />
                      ))}
                    </div>
                  </div>

                  {/* D. ARRONDISSEMENT DES COINS (BORDER RADIUS GLOBAL & 4 COINS SÉPARÉS) */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${openMarginDetail.borderRadius ? 'text-slate-500' : 'text-slate-300'}`}>
                        Arrondissement des coins (Rayon)
                      </span>
                      <div className="flex items-center gap-1.5">
                        <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded border transition-all ${
                          openMarginDetail.borderRadius
                            ? 'bg-slate-800/80 border-slate-700/60'
                            : 'bg-slate-900 border-slate-700 focus-within:border-[#00A0FF]'
                        }`}>
                          <input
                            type="number"
                            min={0}
                            max={500}
                            disabled={openMarginDetail.borderRadius}
                            value={
                              openMarginDetail.borderRadius
                                ? (rTL === rTR && rTR === rBR && rBR === rBL ? rTL : radiusVal)
                                : radiusVal
                            }
                            onChange={(e) => {
                              const val = Math.max(0, Math.min(500, Number(e.target.value) || 0));
                              updateMarginData({
                                borderRadius: val,
                                borderTopLeftRadius: undefined,
                                borderTopRightRadius: undefined,
                                borderBottomLeftRadius: undefined,
                                borderBottomRightRadius: undefined,
                              });
                            }}
                            className={`w-11 text-right text-xs font-mono bg-transparent outline-none border-none p-0 ${
                              openMarginDetail.borderRadius ? 'text-slate-500 cursor-not-allowed' : 'text-white font-bold'
                            }`}
                          />
                          <span className={`text-[9px] font-mono ${openMarginDetail.borderRadius ? 'text-slate-600' : 'text-slate-400'}`}>px</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setOpenMarginDetail(prev => ({ ...prev, borderRadius: !prev.borderRadius }))}
                          className={`p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer border ${
                            openMarginDetail.borderRadius ? 'border-[#00A0FF] bg-[#00A0FF]/10' : 'border-slate-800'
                          }`}
                          title={openMarginDetail.borderRadius ? 'Fermer pour réactiver le rayon principal' : 'Ouvrir pour régler chaque coin séparément'}
                        >
                          {openMarginDetail.borderRadius ? <ChevronUp className="w-3.5 h-3.5 text-[#00A0FF]" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                        </button>
                      </div>
                    </div>

                    {/* BARRE PRINCIPALE - GRISE & INACTIVE SI ACCORDION SECTEUR DÉTAILLÉ EST OUVERT */}
                    <input
                      type="range"
                      min={0}
                      max={500}
                      disabled={openMarginDetail.borderRadius}
                      value={
                        openMarginDetail.borderRadius
                          ? (rTL === rTR && rTR === rBR && rBR === rBL ? rTL : radiusVal)
                          : radiusVal
                      }
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        updateMarginData({
                          borderRadius: val,
                          borderTopLeftRadius: undefined,
                          borderTopRightRadius: undefined,
                          borderBottomLeftRadius: undefined,
                          borderBottomRightRadius: undefined,
                        });
                      }}
                      className={`w-full cursor-pointer transition-opacity ${
                        openMarginDetail.borderRadius
                          ? 'opacity-30 cursor-not-allowed accent-slate-600'
                          : 'accent-[#00A0FF]'
                      }`}
                    />

                    {/* DÉTAIL DES 4 COINS SÉPARÉS (HAUT-GAUCHE, HAUT-DROITE, BAS-GAUCHE, BAS-DROITE) */}
                    {openMarginDetail.borderRadius && (
                      <div className="pt-2 space-y-2.5 bg-slate-900/80 p-3 rounded-xl border border-slate-800/80">
                        <div className="text-[9px] font-black text-[#00A0FF] uppercase tracking-wider flex items-center justify-between border-b border-slate-800 pb-1">
                          <span>📐 Réglage Individuel des 4 Coins</span>
                          <span className="text-[8px] text-slate-400 normal-case">(La barre principale reste grisée)</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          {/* 1. HAUT-GAUCHE (TL) */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-bold text-slate-300">
                              <span>Haut-Gauche</span>
                              <div className="flex items-center gap-0.5">
                                <input
                                  type="number"
                                  min={0}
                                  max={500}
                                  value={rTL}
                                  onChange={(e) => updateMarginData({ borderTopLeftRadius: Number(e.target.value) })}
                                  className="w-10 text-right text-[10px] font-mono bg-slate-950 border border-slate-700 rounded px-1 py-0.5 text-white outline-none focus:border-[#00A0FF]"
                                />
                                <span className="text-[8px] font-mono text-slate-400">px</span>
                              </div>
                            </div>
                            <input
                              type="range"
                              min={0}
                              max={500}
                              value={rTL}
                              onChange={(e) => updateMarginData({ borderTopLeftRadius: Number(e.target.value) })}
                              className="w-full accent-[#00A0FF] h-1 cursor-pointer"
                            />
                          </div>

                          {/* 2. HAUT-DROITE (TR) */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-bold text-slate-300">
                              <span>Haut-Droite</span>
                              <div className="flex items-center gap-0.5">
                                <input
                                  type="number"
                                  min={0}
                                  max={500}
                                  value={rTR}
                                  onChange={(e) => updateMarginData({ borderTopRightRadius: Number(e.target.value) })}
                                  className="w-10 text-right text-[10px] font-mono bg-slate-950 border border-slate-700 rounded px-1 py-0.5 text-white outline-none focus:border-[#00A0FF]"
                                />
                                <span className="text-[8px] font-mono text-slate-400">px</span>
                              </div>
                            </div>
                            <input
                              type="range"
                              min={0}
                              max={500}
                              value={rTR}
                              onChange={(e) => updateMarginData({ borderTopRightRadius: Number(e.target.value) })}
                              className="w-full accent-[#00A0FF] h-1 cursor-pointer"
                            />
                          </div>

                          {/* 3. BAS-GAUCHE (BL) */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-bold text-slate-300">
                              <span>Bas-Gauche</span>
                              <div className="flex items-center gap-0.5">
                                <input
                                  type="number"
                                  min={0}
                                  max={500}
                                  value={rBL}
                                  onChange={(e) => updateMarginData({ borderBottomLeftRadius: Number(e.target.value) })}
                                  className="w-10 text-right text-[10px] font-mono bg-slate-950 border border-slate-700 rounded px-1 py-0.5 text-white outline-none focus:border-[#00A0FF]"
                                />
                                <span className="text-[8px] font-mono text-slate-400">px</span>
                              </div>
                            </div>
                            <input
                              type="range"
                              min={0}
                              max={500}
                              value={rBL}
                              onChange={(e) => updateMarginData({ borderBottomLeftRadius: Number(e.target.value) })}
                              className="w-full accent-[#00A0FF] h-1 cursor-pointer"
                            />
                          </div>

                          {/* 4. BAS-DROITE (BR) */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-bold text-slate-300">
                              <span>Bas-Droite</span>
                              <div className="flex items-center gap-0.5">
                                <input
                                  type="number"
                                  min={0}
                                  max={500}
                                  value={rBR}
                                  onChange={(e) => updateMarginData({ borderBottomRightRadius: Number(e.target.value) })}
                                  className="w-10 text-right text-[10px] font-mono bg-slate-950 border border-slate-700 rounded px-1 py-0.5 text-white outline-none focus:border-[#00A0FF]"
                                />
                                <span className="text-[8px] font-mono text-slate-400">px</span>
                              </div>
                            </div>
                            <input
                              type="range"
                              min={0}
                              max={500}
                              value={rBR}
                              onChange={(e) => updateMarginData({ borderBottomRightRadius: Number(e.target.value) })}
                              className="w-full accent-[#00A0FF] h-1 cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* E. OMBRAGE & OMBRE PORTÉE (BOX SHADOW) */}
                  <div className="space-y-3 pt-3 border-t border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-[#00A0FF] uppercase tracking-wider">
                        ✨ Ombrage & Ombre Portée (Box Shadow)
                      </span>
                      <button
                        type="button"
                        onClick={() => updateMarginData({ shadowInset: !targetData.shadowInset })}
                        className={`px-2 py-0.5 rounded text-[9px] font-black uppercase transition-all border ${
                          targetData.shadowInset
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                        }`}
                      >
                        {targetData.shadowInset ? '🔲 Interne (Inset)' : '🔳 Externe (Normal)'}
                      </button>
                    </div>

                    {/* PRESETS RAPIDES */}
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { label: '🚫 Aucune', data: { shadowOpacity: 0, shadowBlur: 0, shadowOffsetX: 0, shadowOffsetY: 0, shadowSpread: 0 } },
                        { label: '☁️ Douce', data: { shadowOpacity: 20, shadowBlur: 15, shadowOffsetX: 0, shadowOffsetY: 6, shadowSpread: 0 } },
                        { label: '🌖 Moyenne', data: { shadowOpacity: 35, shadowBlur: 25, shadowOffsetX: 0, shadowOffsetY: 12, shadowSpread: 0 } },
                        { label: '🌘 Forte', data: { shadowOpacity: 55, shadowBlur: 35, shadowOffsetX: 0, shadowOffsetY: 18, shadowSpread: 2 } },
                        { label: '🌟 Néon', data: { shadowOpacity: 80, shadowBlur: 20, shadowOffsetX: 0, shadowOffsetY: 0, shadowSpread: 2, shadowColor: targetData.borderColor || '#00A0FF' } },
                        { label: '🔲 Inset', data: { shadowOpacity: 30, shadowBlur: 10, shadowOffsetX: 0, shadowOffsetY: 2, shadowSpread: 0, shadowInset: true } },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => updateMarginData(preset.data)}
                          className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg text-[10px] font-bold text-slate-300 transition-all text-center"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>

                    {/* 1. OPACITÉ DE L'OMBRE */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-300">Opacité de l ombre</span>
                        <span className="text-xs font-mono text-[#00A0FF] font-bold">
                          {targetData.shadowOpacity !== undefined ? targetData.shadowOpacity : (targetData.shadowBlur || targetData.shadowOffsetY ? 25 : 0)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={targetData.shadowOpacity !== undefined ? targetData.shadowOpacity : (targetData.shadowBlur || targetData.shadowOffsetY ? 25 : 0)}
                        onChange={(e) => updateMarginData({ shadowOpacity: Number(e.target.value) })}
                        className="w-full accent-[#00A0FF] cursor-pointer"
                      />
                    </div>

                    {/* 2. FLOU / DIFFUS */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-300">Flou & Diffus (Adoucissement)</span>
                        <span className="text-xs font-mono text-[#00A0FF] font-bold">
                          {targetData.shadowBlur !== undefined ? targetData.shadowBlur : (targetData.shadowOpacity ? 15 : 0)}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={targetData.shadowBlur !== undefined ? targetData.shadowBlur : (targetData.shadowOpacity ? 15 : 0)}
                        onChange={(e) => updateMarginData({ shadowBlur: Number(e.target.value) })}
                        className="w-full accent-[#00A0FF] cursor-pointer"
                      />
                    </div>

                    {/* 3. DISTANCE VERTICALE & HORIZONTALE */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-bold">
                          <span className="text-slate-300">Distance Y (Vert)</span>
                          <span className="font-mono text-[#00A0FF]">{targetData.shadowOffsetY !== undefined ? targetData.shadowOffsetY : 10}px</span>
                        </div>
                        <input
                          type="range"
                          min={-50}
                          max={50}
                          value={targetData.shadowOffsetY !== undefined ? targetData.shadowOffsetY : 10}
                          onChange={(e) => updateMarginData({ shadowOffsetY: Number(e.target.value) })}
                          className="w-full accent-[#00A0FF] cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-bold">
                          <span className="text-slate-300">Distance X (Horiz)</span>
                          <span className="font-mono text-[#00A0FF]">{targetData.shadowOffsetX !== undefined ? targetData.shadowOffsetX : 0}px</span>
                        </div>
                        <input
                          type="range"
                          min={-50}
                          max={50}
                          value={targetData.shadowOffsetX !== undefined ? targetData.shadowOffsetX : 0}
                          onChange={(e) => updateMarginData({ shadowOffsetX: Number(e.target.value) })}
                          className="w-full accent-[#00A0FF] cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* 4. ÉTALEMENT / SPREAD */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-300">Étalement & Taille (Spread)</span>
                        <span className="text-xs font-mono text-[#00A0FF] font-bold">
                          {targetData.shadowSpread !== undefined ? targetData.shadowSpread : 0}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min={-20}
                        max={50}
                        value={targetData.shadowSpread !== undefined ? targetData.shadowSpread : 0}
                        onChange={(e) => updateMarginData({ shadowSpread: Number(e.target.value) })}
                        className="w-full accent-[#00A0FF] cursor-pointer"
                      />
                    </div>

                    {/* 5. COULEUR DE L'OMBRE */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-300 block">Couleur de l ombre</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={targetData.shadowColor || '#000000'}
                          onChange={(e) => updateMarginData({ shadowColor: e.target.value })}
                          className="w-8 h-8 rounded-lg border border-slate-700 bg-slate-900 cursor-pointer p-0.5"
                        />
                        <input
                          type="text"
                          value={targetData.shadowColor || '#000000'}
                          onChange={(e) => updateMarginData({ shadowColor: e.target.value })}
                          className="flex-1 px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-[#00A0FF]"
                        />
                      </div>
                      <div className="flex items-center gap-1.5 pt-1">
                        {['#000000', '#00A0FF', '#10B981', '#FF7A00', '#EF4444', '#8B5CF6', '#ffffff'].map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => updateMarginData({ shadowColor: c })}
                            className="w-5 h-5 rounded-full border border-slate-700 cursor-pointer hover:scale-110 transition-transform shadow-sm"
                            style={{ backgroundColor: c }}
                            title={c}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen w-screen bg-slate-950 text-white flex flex-col overflow-hidden">
      
      {/* 1. TOP BUILDER TOOLBAR (INDEPENDENT WORKSPACE MODE) */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between shrink-0 z-40">
        
        {/* LEFT TOOLBAR CONTROLS */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => router.push('/admin/tunnels')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#00A0FF] hover:bg-[#0080FF] text-white text-xs font-black rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
            title="Revenir à la liste de vos Tunnels de Vente"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span>← Tunnels</span>
          </button>

          <div className="h-5 w-px bg-slate-800" />

          {/* UNDO / REDO */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleUndo}
              disabled={!canUndo}
              className={`p-1.5 rounded-lg transition-colors ${
                canUndo
                  ? 'text-slate-200 hover:text-white hover:bg-slate-800 cursor-pointer'
                  : 'text-slate-600 opacity-40 cursor-not-allowed'
              }`}
              title="Annuler / Revenir (Ctrl+Z)"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={!canRedo}
              className={`p-1.5 rounded-lg transition-colors ${
                canRedo
                  ? 'text-slate-200 hover:text-white hover:bg-slate-800 cursor-pointer'
                  : 'text-slate-600 opacity-40 cursor-not-allowed'
              }`}
              title="Rétablir / Avancer (Ctrl+Y)"
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>

          <div className="h-5 w-px bg-slate-800" />

          {/* PARAMÈTRES DU TUNNEL */}
          <button
            type="button"
            onClick={() => {
              setSelectedElementId(null);
              setActiveTab('SETTINGS');
            }}
            className={`px-3.5 py-1.5 bg-[#00A0FF] hover:bg-[#0080FF] text-white text-xs font-black rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'SETTINGS' && !selectedElementId ? 'ring-2 ring-white/50' : ''
            }`}
            title="Ouvrir les Paramètres de la Page (Taille, Langue, Polices)"
          >
            <Sliders className="w-4 h-4 stroke-[2.5]" />
            <span>Paramètres</span>
          </button>
        </div>

        {/* CENTER STEP NAME INDICATOR */}
        <div className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-300">
          <span className="text-slate-500">{funnel?.name}</span>
          <span>/</span>
          <span className="text-[#00A0FF] font-black">{step?.name}</span>
        </div>

        {/* RIGHT ACTION BUTTONS */}
        <div className="flex items-center gap-3">
          
          {/* VOIR LA PAGE (PUBLIC VIEW) BUTTON */}
          <a
            href={
              funnel?.slug && step?.slug
                ? `/funnel/${funnel.slug}/${step.slug}`
                : funnel?.slug
                ? `/funnel/${funnel.slug}`
                : '#'
            }
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-[#00A0FF] hover:text-white font-heading font-black text-xs rounded-xl border border-slate-700 transition-colors shadow-xs"
            title="Ouvrir la page publique du tunnel dans un nouvel onglet"
          >
            <Eye className="w-4 h-4 text-[#00A0FF]" />
            <span>Voir la page</span>
          </a>

          {/* SAVE BUTTON */}
          <Button
            onClick={handleSavePage}
            disabled={saving}
            className="bg-[#00A0FF] hover:bg-[#0082D6] !text-white font-heading font-black text-xs gap-1.5 px-4 py-2 rounded-xl shadow-md"
          >
            <Save className="w-4 h-4 !text-white stroke-[2.5]" />
            <span>{saving ? 'Enregistrement...' : saveSuccess ? '✅ Enregistré' : 'Sauvegarder'}</span>
          </Button>

          {/* EXIT BUTTON (RETOUR AU TUNNEL) */}
          <Button
            onClick={() => router.push(`/admin/tunnels/${params.id}`)}
            variant="outline"
            size="sm"
            className="text-slate-300 border-slate-700 bg-slate-900 hover:bg-slate-800 font-bold text-xs gap-1 rounded-xl"
          >
            <LogOut className="w-4 h-4" />
            <span>Quitter</span>
          </Button>
        </div>
      </header>

      {/* 2. MAIN BUILDER BODY */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT PALETTE / INSPECTOR PANEL (SINGLE SIDEBAR ARCHITECTURE) */}
        <div className="w-80 sm:w-96 md:w-[410px] max-w-[90vw] bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 h-full overflow-hidden transition-all">
          {!selectedElementId ? (
            <React.Fragment>
              {/* TABS: ÉLÉMENTS / BLOCS / PC-MOBILE */}
              <div className="p-2 border-b border-slate-800 grid grid-cols-3 gap-1.5 bg-slate-950 shrink-0">
                <button
                  onClick={() => setActiveTab('ELEMENTS')}
                  className={`py-2 text-xs font-heading font-black rounded-xl transition-all ${
                    activeTab === 'ELEMENTS' ? 'bg-[#00A0FF] !text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Éléments
                </button>
                <button
                  onClick={() => setActiveTab('BLOCKS')}
                  className={`py-2 text-xs font-heading font-black rounded-xl transition-all ${
                    activeTab === 'BLOCKS' ? 'bg-[#00A0FF] !text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Blocs
                </button>
                <button
                  onClick={() => setPreviewMode(previewMode === 'DESKTOP' ? 'MOBILE' : 'DESKTOP')}
                  className={`py-2 text-xs font-heading font-black rounded-xl transition-all flex items-center justify-center gap-1 border ${
                    previewMode === 'MOBILE'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-xs font-extrabold'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white'
                  }`}
                  title={previewMode === 'MOBILE' ? 'Basculer vers Mode Ordinateur (PC)' : 'Basculer vers Mode Mobile'}
                >
                  {previewMode === 'MOBILE' ? '📱 Mobile' : '💻 PC'}
                </button>
              </div>

              {/* PALETTE CONTENT FOR ELEMENTS AND BLOCS TABS */}
              <div className="p-4 space-y-6 text-xs overflow-y-auto flex-1 builder-sidebar-scroll">
                
                {activeTab === 'ELEMENTS' && (
                  <>
{/* CATEGORY 1: DISPOSITION & SECTIONS FULL-WIDTH */}
                    <div className="space-y-2.5">
                      <div className="font-heading font-black text-slate-400 uppercase tracking-wider text-[10px]">
                        Disposition des colonnes
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          draggable
                          onDragStart={(e) => handlePaletteDragStart(e, 'Col4', 'Disposition', '4 Colonnes')}
                          onClick={() => handleAddElement('Col4', 'Disposition', '4 Colonnes')}
                          className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl flex flex-col items-center justify-center gap-1 text-center transition-all group cursor-grab active:cursor-grabbing"
                        >
                          <Columns className="w-4 h-4 text-slate-400 group-hover:text-[#00A0FF]" />
                          <span className="text-[10px] font-bold text-slate-300">4 colonnes</span>
                        </button>

                        <button
                          draggable
                          onDragStart={(e) => handlePaletteDragStart(e, 'Col3', 'Disposition', '3 Colonnes')}
                          onClick={() => handleAddElement('Col3', 'Disposition', '3 Colonnes')}
                          className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl flex flex-col items-center justify-center gap-1 text-center transition-all group cursor-grab active:cursor-grabbing"
                        >
                          <Columns className="w-4 h-4 text-slate-400 group-hover:text-[#00A0FF]" />
                          <span className="text-[10px] font-bold text-slate-300">3 colonnes</span>
                        </button>

                        <button
                          draggable
                          onDragStart={(e) => handlePaletteDragStart(e, 'Col2', 'Disposition', '2 Colonnes')}
                          onClick={() => handleAddElement('Col2', 'Disposition', '2 Colonnes')}
                          className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl flex flex-col items-center justify-center gap-1 text-center transition-all group cursor-grab active:cursor-grabbing"
                        >
                          <Columns className="w-4 h-4 text-slate-400 group-hover:text-[#00A0FF]" />
                          <span className="text-[10px] font-bold text-slate-300">2 colonnes</span>
                        </button>

                        <button
                          draggable
                          onDragStart={(e) => handlePaletteDragStart(e, 'ContentBox', 'Disposition', 'Rangée / Div')}
                          onClick={() => handleAddElement('ContentBox', 'Disposition', 'Rangée / Div')}
                          className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl flex flex-col items-center justify-center gap-1 text-center transition-all group cursor-grab active:cursor-grabbing"
                        >
                          <Box className="w-4 h-4 text-slate-400 group-hover:text-[#00A0FF]" />
                          <span className="text-[10px] font-bold text-slate-300">Rangée</span>
                        </button>

                        <button
                          draggable
                          onDragStart={(e) => handlePaletteDragStart(e, 'Section', 'Disposition', 'Section')}
                          onClick={() => handleAddElement('Section', 'Disposition', 'Section')}
                          className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl flex flex-col items-center justify-center gap-1 text-center transition-all group cursor-grab active:cursor-grabbing"
                        >
                          <Maximize2 className="w-4 h-4 text-slate-400 group-hover:text-[#00A0FF]" />
                          <span className="text-[10px] font-bold text-slate-300">Section</span>
                        </button>
                      </div>
                    </div>

                    
                    {/* CATEGORY 1: TEXTE (SCREEN 1) */}
                    <div className="space-y-2.5">
                      <div className="font-heading font-black text-slate-400 uppercase tracking-wider text-[10px]">
                        Texte
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          draggable
                          onDragStart={(e) => handlePaletteDragStart(e, 'Text', 'Texte', 'Insérez votre texte ici...')}
                          onClick={() => handleAddElement('Text', 'Texte', 'Insérez votre texte ici...')}
                          className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl flex flex-col items-center justify-center gap-1.5 text-center transition-all group cursor-grab active:cursor-grabbing"
                        >
                          <Type className="w-5 h-5 text-slate-400 group-hover:text-[#00A0FF]" />
                          <span className="text-[10px] font-bold text-slate-300">Texte</span>
                        </button>

                        <button
                          draggable
                          onDragStart={(e) => handlePaletteDragStart(e, 'Heading', 'Texte', 'Titre de la Page de Capture')}
                          onClick={() => handleAddElement('Heading', 'Texte', 'Titre de la Page de Capture')}
                          className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl flex flex-col items-center justify-center gap-1.5 text-center transition-all group cursor-grab active:cursor-grabbing"
                        >
                          <Heading className="w-5 h-5 text-slate-400 group-hover:text-[#00A0FF]" />
                          <span className="text-[10px] font-bold text-slate-300">Titre</span>
                        </button>

                        <button
                          draggable
                          onDragStart={(e) => handlePaletteDragStart(e, 'BulletList', 'Texte', '• Avantage #1\n• Avantage #2')}
                          onClick={() => handleAddElement('BulletList', 'Texte', '• Avantage #1\n• Avantage #2')}
                          className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl flex flex-col items-center justify-center gap-1.5 text-center transition-all group cursor-grab active:cursor-grabbing"
                        >
                          <List className="w-5 h-5 text-slate-400 group-hover:text-[#00A0FF]" />
                          <span className="text-[10px] font-bold text-slate-300">Liste à puces</span>
                        </button>
                      </div>

                      <button
                        draggable
                        onDragStart={(e) => handlePaletteDragStart(e, 'ContentBox', 'Texte', 'Conteneur d éléments...')}
                        onClick={() => handleAddElement('ContentBox', 'Texte', 'Conteneur d éléments...')}
                        className="w-full p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-center gap-2 transition-all group cursor-grab active:cursor-grabbing"
                      >
                        <Box className="w-4 h-4 text-slate-400 group-hover:text-[#00A0FF]" />
                        <span className="text-[11px] font-bold text-slate-300">Boîte de contenu</span>
                      </button>
                    </div>

                {/* CATEGORY 2: MÉDIA */}
                <div className="space-y-2.5">
                  <div className="font-heading font-black text-slate-400 uppercase tracking-wider text-[10px]">
                    Média
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      draggable
                      onDragStart={(e) => handlePaletteDragStart(e, 'Image', 'Média', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80')}
                      onClick={() => handleAddElement('Image', 'Média', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80')}
                      className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl flex flex-col items-center justify-center gap-1.5 text-center transition-all group cursor-grab active:cursor-grabbing"
                    >
                      <ImageIcon className="w-5 h-5 text-slate-400 group-hover:text-[#00A0FF]" />
                      <span className="text-[10px] font-bold text-slate-300">Image</span>
                    </button>

                    <button
                      draggable
                      onDragStart={(e) => handlePaletteDragStart(e, 'Video', 'Média', 'https://www.youtube.com/embed/dQw4w9WgXcQ')}
                      onClick={() => handleAddElement('Video', 'Média', 'https://www.youtube.com/embed/dQw4w9WgXcQ')}
                      className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl flex flex-col items-center justify-center gap-1.5 text-center transition-all group cursor-grab active:cursor-grabbing"
                    >
                      <Video className="w-5 h-5 text-slate-400 group-hover:text-[#00A0FF]" />
                      <span className="text-[10px] font-bold text-slate-300">Vidéo</span>
                    </button>

                    <button
                      draggable
                      onDragStart={(e) => handlePaletteDragStart(e, 'Audio', 'Média', 'Fichier Audio')}
                      onClick={() => handleAddElement('Audio', 'Média', 'Fichier Audio')}
                      className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl flex flex-col items-center justify-center gap-1.5 text-center transition-all group cursor-grab active:cursor-grabbing"
                    >
                      <Music className="w-5 h-5 text-slate-400 group-hover:text-[#00A0FF]" />
                      <span className="text-[10px] font-bold text-slate-300">Audio</span>
                    </button>
                  </div>
                </div>

                {/* CATEGORY 4: FORMULAIRE */}
                <div className="space-y-2.5">
                  <div className="font-heading font-black text-slate-400 uppercase tracking-wider text-[10px]">
                    Formulaire
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      draggable
                      onDragStart={(e) => handlePaletteDragStart(e, 'FormInput', 'Formulaire', 'Champ de formulaire (Email)')}
                      onClick={() => handleAddElement('FormInput', 'Formulaire', 'Champ de formulaire (Email)')}
                      className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl flex flex-col items-center justify-center gap-1.5 text-center transition-all group cursor-grab active:cursor-grabbing"
                    >
                      <Type className="w-5 h-5 text-slate-400 group-hover:text-[#00A0FF]" />
                      <span className="text-[10px] font-bold text-slate-300">Champ</span>
                    </button>

                    <button
                      draggable
                      onDragStart={(e) => handlePaletteDragStart(e, 'ButtonCTA', 'Formulaire', 'Recevoir mon accès gratuit')}
                      onClick={() => handleAddElement('ButtonCTA', 'Formulaire', 'Recevoir mon accès gratuit')}
                      className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl flex flex-col items-center justify-center gap-1.5 text-center transition-all group cursor-grab active:cursor-grabbing"
                    >
                      <CheckSquare className="w-5 h-5 text-slate-400 group-hover:text-[#00A0FF]" />
                      <span className="text-[10px] font-bold text-slate-300">Bouton</span>
                    </button>

                    <button
                      draggable
                      onDragStart={(e) => handlePaletteDragStart(e, 'CheckboxOptin', 'Formulaire', 'J accepte la politique de confidentialité')}
                      onClick={() => handleAddElement('CheckboxOptin', 'Formulaire', 'J accepte la politique de confidentialité')}
                      className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl flex flex-col items-center justify-center gap-1.5 text-center transition-all group cursor-grab active:cursor-grabbing"
                    >
                      <CheckCircle2 className="w-5 h-5 text-slate-400 group-hover:text-[#00A0FF]" />
                      <span className="text-[10px] font-bold text-slate-300">Case à cocher</span>
                    </button>
                  </div>
                </div>

                {/* CATEGORY 5: AUTRE & COUNTDOWN */}
                <div className="space-y-2.5">
                  <div className="font-heading font-black text-slate-400 uppercase tracking-wider text-[10px]">
                    Autre & Temps Forts
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      draggable
                      onDragStart={(e) => handlePaletteDragStart(e, 'Countdown', 'Autre', '24:00:00')}
                      onClick={() => handleAddElement('Countdown', 'Autre', '24:00:00')}
                      className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl flex flex-col items-center justify-center gap-1.5 text-center transition-all group cursor-grab active:cursor-grabbing"
                    >
                      <Clock className="w-5 h-5 text-slate-400 group-hover:text-[#00A0FF]" />
                      <span className="text-[10px] font-bold text-slate-300">Countdown</span>
                    </button>

                    <button
                      draggable
                      onDragStart={(e) => handlePaletteDragStart(e, 'Divider', 'Autre', 'Ligne horizontale')}
                      onClick={() => handleAddElement('Divider', 'Autre', 'Ligne horizontale')}
                      className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl flex flex-col items-center justify-center gap-1.5 text-center transition-all group cursor-grab active:cursor-grabbing"
                    >
                      <Minus className="w-5 h-5 text-slate-400 group-hover:text-[#00A0FF]" />
                      <span className="text-[10px] font-bold text-slate-300">Ligne</span>
                    </button>

                    <button
                      draggable
                      onDragStart={(e) => handlePaletteDragStart(e, 'HTMLCode', 'Autre', '<!-- Code HTML -->')}
                      onClick={() => handleAddElement('HTMLCode', 'Autre', '<!-- Code HTML -->')}
                      className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl flex flex-col items-center justify-center gap-1.5 text-center transition-all group cursor-grab active:cursor-grabbing"
                    >
                      <Code className="w-5 h-5 text-slate-400 group-hover:text-[#00A0FF]" />
                      <span className="text-[10px] font-bold text-slate-300">Code HTML</span>
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* TAB 2: BLOCS PRE-DESIGNED SECTIONS (THE 8 SUB-MENUS) */}
            {activeTab === 'BLOCKS' && (
              <div className="space-y-3">
                {activeBlockSubCategory === 'FEATURES' ? (
                  <div className="space-y-4">
                    {/* BACK BUTTON MATCHING SCREENSHOTS */}
                    <button
                      onClick={() => setActiveBlockSubCategory(null)}
                      className="w-full p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-700 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>&lt; Retour</span>
                    </button>

                    <div className="text-[11px] font-heading font-black text-slate-400 uppercase tracking-wider">
                      Blocs Prêts à l emploi : Fonctionnalités
                    </div>

                    {/* THE READY-TO-USE FEATURE BLOCKS (INCLUDING 2, 3, 4 COLUMNS) */}
                    <div className="space-y-3">
                      {[
                        {
                          id: 'col-2-block',
                          name: '2 colonnes d éléments (image, titre et texte)',
                          type: 'Col2',
                        },
                        {
                          id: 'col-3-block',
                          name: '3 colonnes d éléments (image, titre et texte)',
                          type: 'Col3',
                        },
                        {
                          id: 'col-4-block',
                          name: '4 colonnes d éléments (image, titre et texte)',
                          type: 'Col4',
                        },
                        {
                          id: 'feat-1',
                          name: 'Quatre colonnes d éléments (grande image, titre et texte)',
                          type: 'BlockFeat4ColImg',
                        },
                        {
                          id: 'feat-2',
                          name: 'Trois colonnes d éléments (grande image, titre, texte)',
                          type: 'BlockFeat3ColImg',
                        },
                        {
                          id: 'feat-3',
                          name: '2 colonnes avec grandes icônes sur la gauche',
                          type: 'BlockFeat2ColIconsLeft',
                        },
                        {
                          id: 'feat-4',
                          name: 'Quatre colonnes d éléments (grande image, titre, texte et bouton)',
                          type: 'BlockFeat4ColBtn',
                        },
                        {
                          id: 'feat-5',
                          name: 'Trois colonnes d éléments (icône, titre, texte et bouton)',
                          type: 'BlockFeat3ColBtn',
                        },
                        {
                          id: 'feat-6',
                          name: 'Image à gauche, éléments style cartes à droite (image, titre et texte)',
                          type: 'BlockFeatImgLeftCardsRight',
                        },
                        {
                          id: 'feat-7',
                          name: 'Éléments en diagonale (image, titre et texte)',
                          type: 'BlockFeatDiagonal',
                        },
                        {
                          id: 'feat-8',
                          name: 'Quatre colonnes d éléments (grande icône, titre, texte)',
                          type: 'BlockFeat4ColDark',
                        },
                        {
                          id: 'feat-9',
                          name: 'Liste d éléments style cartes avec carte du milieu en couleur',
                          type: 'BlockFeatMiddleFeatured',
                        },
                        {
                          id: 'feat-10',
                          name: 'Éléments style cartes avec bords multicolores (titre, texte, bouton)',
                          type: 'BlockFeatMulticolorBorders',
                        },
                        {
                          id: 'feat-11',
                          name: 'Quatre éléments style cartes (icône, titre, texte, bouton)',
                          type: 'BlockFeat4CardsIcon',
                        },
                      ].map((item) => (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={(e) => handlePaletteDragStart(e, item.type, 'Fonctionnalités', item.name)}
                          onClick={() => handleAddElement(item.type, 'Fonctionnalités', item.name)}
                          className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-[#00A0FF] rounded-2xl cursor-grab active:cursor-grabbing transition-all space-y-2 group"
                        >
                          <div className="aspect-video bg-slate-900 border border-slate-800 rounded-xl overflow-hidden p-2 flex flex-col justify-center items-center text-center">
                            <div className="w-8 h-8 rounded-lg bg-[#00A0FF]/20 text-[#00A0FF] flex items-center justify-center font-bold text-xs mb-1">
                              👍
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono line-clamp-1">{item.name}</span>
                          </div>
                          <div className="font-heading font-extrabold text-[11px] text-slate-200 group-hover:text-[#00A0FF] transition-colors leading-snug">
                            {item.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* CATEGORIES LIST (MAIN SUB-MENUS) */
                  <div className="space-y-3">
                    
                    {/* 1. FONCTIONNALITÉS */}
                    <div
                      onClick={() => setActiveBlockSubCategory('FEATURES')}
                      className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-[#00A0FF] rounded-2xl cursor-pointer transition-all flex items-center justify-between"
                    >
                      <div className="font-heading font-black text-xs text-white flex items-center gap-2">
                        <span>👍</span>
                        <span>Fonctionnalités</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-[#00A0FF]">
                        14 blocs &gt;
                      </span>
                    </div>

                    {/* 2. PIEDS DE PAGE */}
                    <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                      <div className="font-heading font-black text-xs text-white flex items-center gap-2">
                        <span>📄</span>
                        <span>Pieds de page</span>
                      </div>
                      <button
                        draggable
                        onDragStart={(e) => handlePaletteDragStart(e, 'BlockFooter', 'Blocs', 'Footer Minimaliste Onepreneur')}
                        onClick={() => handleAddElement('BlockFooter', 'Blocs', 'Footer Minimaliste Onepreneur')}
                        className="w-full p-2.5 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 text-[11px] font-bold text-slate-300 text-left cursor-grab active:cursor-grabbing flex items-center justify-between"
                      >
                        <span>Footer Minimaliste</span>
                        <Plus className="w-3.5 h-3.5 text-[#00A0FF]" />
                      </button>
                    </div>

                    {/* 3. FORMULAIRES D INSCRIPTION */}
                    <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                      <div className="font-heading font-black text-xs text-white flex items-center gap-2">
                        <span>📝</span>
                        <span>Formulaires d inscription</span>
                      </div>
                      <button
                        draggable
                        onDragStart={(e) => handlePaletteDragStart(e, 'BlockOptinForm', 'Blocs', 'Formulaire Opt-in Héro haute conversion')}
                        onClick={() => handleAddElement('BlockOptinForm', 'Blocs', 'Formulaire Opt-in Héro haute conversion')}
                        className="w-full p-2.5 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 text-[11px] font-bold text-slate-300 text-left cursor-grab active:cursor-grabbing flex items-center justify-between"
                      >
                        <span>Opt-in Héro Haute Conversion</span>
                        <Plus className="w-3.5 h-3.5 text-[#00A0FF]" />
                      </button>
                    </div>

                    {/* 4. EN-TÊTES DE PAGE */}
                    <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                      <div className="font-heading font-black text-xs text-white flex items-center gap-2">
                        <span>📑</span>
                        <span>En-têtes de page</span>
                      </div>
                      <button
                        draggable
                        onDragStart={(e) => handlePaletteDragStart(e, 'BlockHeader', 'Blocs', 'En-tête de page & Logo')}
                        onClick={() => handleAddElement('BlockHeader', 'Blocs', 'En-tête de page & Logo')}
                        className="w-full p-2.5 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 text-[11px] font-bold text-slate-300 text-left cursor-grab active:cursor-grabbing flex items-center justify-between"
                      >
                        <span>Header Banner & Logo</span>
                        <Plus className="w-3.5 h-3.5 text-[#00A0FF]" />
                      </button>
                    </div>

                    {/* 5. PRÉSENTATION DE L ÉQUIPE */}
                    <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                      <div className="font-heading font-black text-xs text-white flex items-center gap-2">
                        <span>👥</span>
                        <span>Présentation de l équipe</span>
                      </div>
                      <button
                        draggable
                        onDragStart={(e) => handlePaletteDragStart(e, 'BlockTeam', 'Blocs', 'Section Équipe & Fondateurs')}
                        onClick={() => handleAddElement('BlockTeam', 'Blocs', 'Section Équipe & Fondateurs')}
                        className="w-full p-2.5 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 text-[11px] font-bold text-slate-300 text-left cursor-grab active:cursor-grabbing flex items-center justify-between"
                      >
                        <span>Cartes Fondateurs</span>
                        <Plus className="w-3.5 h-3.5 text-[#00A0FF]" />
                      </button>
                    </div>

                    {/* 6. TÉMOIGNAGES */}
                    <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                      <div className="font-heading font-black text-xs text-white flex items-center gap-2">
                        <span>💬</span>
                        <span>Témoignages</span>
                      </div>
                      <button
                        draggable
                        onDragStart={(e) => handlePaletteDragStart(e, 'BlockTestimonials', 'Blocs', 'Avis Clients & Étoiles')}
                        onClick={() => handleAddElement('BlockTestimonials', 'Blocs', 'Avis Clients & Étoiles')}
                        className="w-full p-2.5 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 text-[11px] font-bold text-slate-300 text-left cursor-grab active:cursor-grabbing flex items-center justify-between"
                      >
                        <span>Grille d Avis Clients</span>
                        <Plus className="w-3.5 h-3.5 text-[#00A0FF]" />
                      </button>
                    </div>

                    {/* 7. TARIFS */}
                    <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                      <div className="font-heading font-black text-xs text-white flex items-center gap-2">
                        <span>💲</span>
                        <span>Tarifs</span>
                      </div>
                      <button
                        draggable
                        onDragStart={(e) => handlePaletteDragStart(e, 'BlockPricing', 'Blocs', 'Tableau de Tarifs 3 Offres')}
                        onClick={() => handleAddElement('BlockPricing', 'Blocs', 'Tableau de Tarifs 3 Offres')}
                        className="w-full p-2.5 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 text-[11px] font-bold text-slate-300 text-left cursor-grab active:cursor-grabbing flex items-center justify-between"
                      >
                        <span>Tableau de Tarifs</span>
                        <Plus className="w-3.5 h-3.5 text-[#00A0FF]" />
                      </button>
                    </div>

                    {/* 8. BIENVENUE */}
                    <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                      <div className="font-heading font-black text-xs text-white flex items-center gap-2">
                        <span>👋</span>
                        <span>Bienvenue</span>
                      </div>
                      <button
                        draggable
                        onDragStart={(e) => handlePaletteDragStart(e, 'BlockWelcome', 'Blocs', 'Bannière de Bienvenue Hero')}
                        onClick={() => handleAddElement('BlockWelcome', 'Blocs', 'Bannière de Bienvenue Hero')}
                        className="w-full p-2.5 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 text-[11px] font-bold text-slate-300 text-left cursor-grab active:cursor-grabbing flex items-center justify-between"
                      >
                        <span>Section Hero Bienvenue</span>
                        <Plus className="w-3.5 h-3.5 text-[#00A0FF]" />
                      </button>
                    </div>

                    {/* 9. POPUP & FENÊTRES SURGISSANTES */}
                    <div className="p-3 bg-slate-950 rounded-2xl border border-purple-500/30 space-y-2">
                      <div className="font-heading font-black text-xs text-white flex items-center gap-2">
                        <span>✨</span>
                        <span>Popup & Fenêtres Surgissantes</span>
                      </div>
                      <button
                        draggable
                        onDragStart={(e) => handlePaletteDragStart(e, 'BlockOptinForm', 'Blocs', 'Popup Capture Email Lead Magnet')}
                        onClick={() => handleAddElement('BlockOptinForm', 'Blocs', 'Popup Capture Email Lead Magnet')}
                        className="w-full p-2.5 bg-purple-950/40 hover:bg-purple-900/50 rounded-xl border border-purple-500/40 text-[11px] font-bold text-purple-200 text-left cursor-grab active:cursor-grabbing flex items-center justify-between transition-all shadow-sm"
                      >
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                          <span>Popup Capture (Opt-in Email)</span>
                        </div>
                        <Plus className="w-3.5 h-3.5 text-purple-400" />
                      </button>
                      <button
                        draggable
                        onDragStart={(e) => handlePaletteDragStart(e, 'BlockOptinForm', 'Blocs', 'Popup d Intention de Sortie (Exit-Intent)')}
                        onClick={() => handleAddElement('BlockOptinForm', 'Blocs', 'Popup d Intention de Sortie (Exit-Intent)')}
                        className="w-full p-2.5 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 text-[11px] font-bold text-slate-300 text-left cursor-grab active:cursor-grabbing flex items-center justify-between transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>Popup Anti-Abandon (Exit-Intent)</span>
                        </div>
                        <Plus className="w-3.5 h-3.5 text-[#00A0FF]" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT FOR PAGE SETTINGS (PARAMÈTRES DE LA PAGE) */}
            {activeTab === 'SETTINGS' && (
              <div className="space-y-5 text-xs animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2 font-heading font-black text-sm text-white">
                    <Sliders className="w-4 h-4 text-[#00A0FF]" />
                    <span>Paramètres de la Page</span>
                  </div>
                </div>

                {/* 1. LARGEUR DE LA PAGE */}
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                  <label className="text-[10px] font-black text-[#00A0FF] uppercase tracking-wider block">
                    📐 Dimensions de la Page (Largeur du Canevas)
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSetPageWidthMode('standard')}
                      className={`p-2.5 rounded-xl border text-[11px] font-bold flex flex-col items-center gap-1 transition-all ${
                        pageWidthMode === 'standard'
                          ? 'bg-[#00A0FF]/20 border-[#00A0FF] text-white shadow-md'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>📱 Standard</span>
                      <span className="text-[9px] font-mono opacity-70">896px</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetPageWidthMode('wide')}
                      className={`p-2.5 rounded-xl border text-[11px] font-bold flex flex-col items-center gap-1 transition-all ${
                        pageWidthMode === 'wide'
                          ? 'bg-[#00A0FF]/20 border-[#00A0FF] text-white shadow-md'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>💻 Large</span>
                      <span className="text-[9px] font-mono opacity-70">1152px</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetPageWidthMode('full')}
                      className={`p-2.5 rounded-xl border text-[11px] font-bold flex flex-col items-center gap-1 transition-all ${
                        pageWidthMode === 'full'
                          ? 'bg-[#00A0FF]/20 border-[#00A0FF] text-white shadow-md'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>🖥️ Plein Écran</span>
                      <span className="text-[9px] font-mono opacity-70">100%</span>
                    </button>
                  </div>
                </div>

                {/* 2. LANGUE DE LA PAGE & SENS DE LECTURE (RTL ARABE / LTR) */}
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                  <label className="text-[10px] font-black text-[#00A0FF] uppercase tracking-wider block">
                    🌐 Langue de la page & Direction
                  </label>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 block">Choisir la langue</label>
                    <select
                      value={pageLang}
                      onChange={(e) => {
                        const lang = e.target.value;
                        const dir = lang === 'ar' ? 'rtl' : 'ltr';
                        setPageLang(lang);
                        setPageDir(dir);
                      }}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-bold outline-none focus:border-[#00A0FF] cursor-pointer"
                    >
                      <option value="fr">Français</option>
                      <option value="ar">Arabe</option>
                      <option value="en">Anglais</option>
                    </select>
                  </div>
                  {pageDir === 'rtl' && (
                    <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-300 font-bold flex items-center gap-2">
                      <span>✨ Mode RTL Actif (Texte & Alignements Droite à Gauche)</span>
                    </div>
                  )}
                </div>

                {/* 3. POLICES DES TITRES & DU TEXTE */}
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                  <label className="text-[10px] font-black text-[#00A0FF] uppercase tracking-wider block">
                    🔤 Polices des titres & du texte
                  </label>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 block">Type de police des Titres</label>
                    <select
                      value={pageFont}
                      onChange={(e) => setPageFont(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-bold outline-none focus:border-[#00A0FF] cursor-pointer"
                    >
                      <option value="Inter">Same font as page (Inter)</option>
                      <option value="Poppins">Poppins (Moderne & Gras)</option>
                      <option value="Montserrat">Montserrat (Élégant)</option>
                      <option value="Roboto">Roboto (Clean)</option>
                      <option value="Playfair Display">Playfair Display (Serif)</option>
                      <option value="Tajawal">Tajawal (Spécial Arabe RTL)</option>
                    </select>
                  </div>
                </div>

                {/* 4. ARRIÈRE-PLAN GLOBAL DE LA PAGE */}
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
                  <label className="text-[10px] font-black text-[#00A0FF] uppercase tracking-wider block">
                    🎨 Arrière-plan global de la page
                  </label>
                  
                  {/* COULEUR DE FOND */}
                  <div className="space-y-2">
                    <span className="text-slate-400 font-bold block">Couleur de fond</span>
                    
                    {/* SÉLECTEUR PERSONNALISÉ EN DÉBUT DE LIGNE + PASTILLES VIVES */}
                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      <div className="relative group cursor-pointer" title="Choisir une couleur personnalisée sur mesure">
                        <input
                          type="color"
                          value={pageBgColor || '#020617'}
                          onChange={(e) => setPageBgColor(e.target.value)}
                          className="w-7 h-7 rounded-lg cursor-pointer border-2 border-[#00A0FF] bg-transparent p-0 shadow-sm transition-transform hover:scale-110"
                        />
                      </div>

                      {['#FFFFFF', '#EF4444', '#3B82F6', '#22C55E', '#EAB308', '#A855F7', '#F97316', '#000000', '#020617'].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setPageBgColor(c)}
                          className={`w-6 h-6 rounded-full border border-slate-700 transition-all hover:scale-110 ${
                            pageBgColor?.toLowerCase() === c.toLowerCase() ? 'ring-2 ring-[#00A0FF] scale-110' : ''
                          }`}
                          style={{ backgroundColor: c }}
                          title={c}
                        />
                      ))}
                    </div>
                  </div>

                  {/* IMAGE DE FOND GLOBALE */}
                  <div className="space-y-2 pt-2 border-t border-slate-900">
                    <label className="text-[10px] font-bold text-slate-400 block">🌄 Image de Fond Globale</label>
                    
                    <div className="flex gap-2">
                      <label className="flex-1 px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-center text-xs font-bold text-slate-300 cursor-pointer transition-colors flex items-center justify-center gap-1.5">
                        <Upload className="w-3.5 h-3.5 text-[#00A0FF]" />
                        <span>Choisir photo PC</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                if (ev.target?.result) setPageBgImage(ev.target.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                      {pageBgImage && (
                        <button
                          type="button"
                          onClick={() => setPageBgImage('')}
                          className="px-2.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold transition-colors"
                          title="Supprimer l image de fond"
                        >
                          🗑️
                        </button>
                      )}
                    </div>

                    {pageBgImage && pageBgImage.startsWith('data:image/') ? (
                      <div className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-[11px] font-bold text-slate-300 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 truncate">
                          <span>📷</span>
                          <span className="text-[#00A0FF]">Image locale importée du PC</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPageBgImage('')}
                          className="text-rose-400 hover:text-rose-300 text-xs font-bold cursor-pointer"
                        >
                          Supprimer
                        </button>
                      </div>
                    ) : (
                      <input
                        type="text"
                        placeholder="Ou coller une URL d image..."
                        value={pageBgImage || ''}
                        onChange={(e) => setPageBgImage(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-[#00A0FF]"
                      />
                    )}

                    {/* MODES D AFFICHAGE DE L IMAGE (PAGE BG SIZE) */}
                    {pageBgImage && (
                      <div className="space-y-3 pt-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 block">Mode de remplissage</label>
                          <select
                            value={pageBgSize || 'cover'}
                            onChange={(e) => setPageBgSize(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-bold outline-none focus:border-[#00A0FF] cursor-pointer"
                          >
                            <option value="cover">Couvrir tout l écran (Cover)</option>
                            <option value="100% auto">Adapter à la largeur (100% Auto)</option>
                            <option value="auto 100%">Adapter à la hauteur (Auto 100%)</option>
                            <option value="100% 100%">Étirer sur toute la page (100% 100%)</option>
                            <option value="contain">Ajuster sans couper (Contain)</option>
                          </select>
                        </div>

                        {/* ZOOM SLIDER */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                            <span>Zoom d image</span>
                            <span>{pageBgZoom || 100}%</span>
                          </div>
                          <input
                            type="range"
                            min="50"
                            max="300"
                            value={pageBgZoom || 100}
                            onChange={(e) => setPageBgZoom(Number(e.target.value))}
                            className="w-full accent-[#00A0FF] cursor-pointer"
                          />
                        </div>

                        {/* POSITION X / Y SLIDERS */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-400 font-bold block">Position Horiz. (X)</span>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={pageBgPosX ?? 50}
                              onChange={(e) => setPageBgPosX(Number(e.target.value))}
                              className="w-full accent-[#00A0FF] cursor-pointer"
                            />
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-400 font-bold block">Position Vert. (Y)</span>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={pageBgPosY ?? 0}
                              onChange={(e) => setPageBgPosY(Number(e.target.value))}
                              className="w-full accent-[#00A0FF] cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 5. PIED DE PAGE & DROITS D AUTEUR (COPYRIGHT) */}
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-[#00A0FF] uppercase tracking-wider block">
                      ©️ Pied de page & Copyright
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowCopyright(!showCopyright)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                        showCopyright
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                      }`}
                    >
                      <span>{showCopyright ? '👁️ Afficher' : '🙈 Masquer'}</span>
                    </button>
                  </div>

                  {showCopyright && (
                    <div className="space-y-4 pt-1">
                      {/* TEXTE DE COPYRIGHT */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 block">Texte de copyright</label>
                        <input
                          type="text"
                          placeholder="ex: © 2026 Mon Entreprise. Tous droits réservés."
                          value={pageCopyright}
                          onChange={(e) => setPageCopyright(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-[#00A0FF]"
                        />
                      </div>

                      {/* TAILLE TEXTE & COULEUR TEXTE */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                            <span>Taille texte</span>
                            <span>{copyrightFontSize || 12}px</span>
                          </div>
                          <input
                            type="range"
                            min="9"
                            max="24"
                            value={copyrightFontSize || 12}
                            onChange={(e) => setCopyrightFontSize(Number(e.target.value))}
                            className="w-full accent-[#00A0FF] cursor-pointer"
                          />
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-400 font-bold block">Couleur du texte</span>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={copyrightTextColor || '#94a3b8'}
                              onChange={(e) => setCopyrightTextColor(e.target.value)}
                              className="w-7 h-7 rounded-lg cursor-pointer border-none bg-transparent"
                            />
                            <span className="text-[10px] font-mono text-slate-400">{copyrightTextColor}</span>
                          </div>
                        </div>
                      </div>

                      {/* LIGNE SÉPARATRICE (AFFICHER, COULEUR & OPACITÉ) */}
                      <div className="space-y-3 pt-2 border-t border-slate-900">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-300">Ligne séparatrice</span>
                          <button
                            type="button"
                            onClick={() => setShowCopyrightLine(!showCopyrightLine)}
                            className={`px-2 py-0.5 rounded text-[9px] font-bold transition-colors ${
                              showCopyrightLine ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {showCopyrightLine ? 'Oui' : 'Non'}
                          </button>
                        </div>

                        {showCopyrightLine && (
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <span className="text-[10px] text-slate-400 font-bold block">Couleur ligne</span>
                              <input
                                type="color"
                                value={copyrightLineColor || '#334155'}
                                onChange={(e) => setCopyrightLineColor(e.target.value)}
                                className="w-7 h-7 rounded-lg cursor-pointer border-none bg-transparent"
                              />
                            </div>

                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                                <span>Opacité ligne</span>
                                <span>{copyrightLineOpacity ?? 40}%</span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={copyrightLineOpacity ?? 40}
                                onChange={(e) => setCopyrightLineOpacity(Number(e.target.value))}
                                className="w-full accent-[#00A0FF] cursor-pointer"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </React.Fragment>
      ) : (
        renderInspectorPanel()
      )}
        </div>

        {/* RIGHT LIVE CANVAS WORKSPACE */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleCanvasDrop(e)}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedElementId(null);
              setSelectedChildIndex(null);
              setSelectedSubItem(null);
            }
          }}
          style={{
            backgroundColor: pageBgColor || '#020617',
            backgroundImage: pageBgImage ? `url(${pageBgImage})` : undefined,
            backgroundSize: pageBgImage ? (pageBgSize === 'cover' ? `${pageBgZoom || 100}%` : pageBgSize) : undefined,
            backgroundPosition: pageBgImage ? `${pageBgPosX ?? 50}% ${pageBgPosY ?? 0}%` : undefined,
            backgroundRepeat: 'no-repeat'
          }}
          className="flex-1 p-0 overflow-y-auto h-full flex justify-center pb-52 relative scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-slate-900 transition-colors duration-300"
        >
          <div
            dir={pageDir}
            className={`w-full bg-transparent rounded-none border-0 p-0 overflow-visible min-h-screen pb-52 shadow-none transition-all ${
              previewMode === 'MOBILE'
                ? 'max-w-sm'
                : pageWidthMode === 'full'
                ? 'max-w-full'
                : pageWidthMode === 'wide'
                ? 'max-w-6xl'
                : 'max-w-4xl'
            }`}
          >
            {/* DYNAMIC TOP DROP INDICATOR (ONLY SHOWN WHILE DRAGGING OVER TOP) */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDragOverIndex(0);
              }}
              onDragLeave={() => setDragOverIndex(null)}
              onDrop={(e) => {
                e.stopPropagation();
                handleCanvasDrop(e, 0);
              }}
              className={`transition-all rounded-t-3xl flex items-center justify-center gap-2 font-black text-xs cursor-pointer ${
                dragOverIndex === 0
                  ? 'h-14 my-2 bg-[#00A0FF]/30 border-2 border-dashed border-[#00A0FF] text-[#00A0FF] shadow-lg ring-4 ring-[#00A0FF]/40'
                  : 'h-0 m-0 p-0 border-0 overflow-hidden opacity-0'
              }`}
            >
              {dragOverIndex === 0 && (
                <>
                  <span className="text-base">🔝</span>
                  <span>✨ Relâcher pour placer TOUT EN HAUT DE PAGE (En-tête)</span>
                </>
              )}
            </div>

            {/* CANVAS RENDERED ELEMENTS */}
            <div className="space-y-0 min-h-[400px]">
              {elements.map((el, idx) => {
                // If element is an old Col2, Col3, Col4 root element, convert to Section with child Divs
                if (el.type === 'Col2' || el.type === 'Col3' || el.type === 'Col4') {
                  const numCols = el.type === 'Col4' ? 4 : el.type === 'Col3' ? 3 : 2;
                  el = {
                    id: el.id,
                    type: 'Section',
                    category: 'Disposition',
                    content: `SECTION (${numCols} COLONNES)`,
                    data: {
                      ...getDefaultBlockData('Section', 'SECTION'),
                      children: Array.from({ length: numCols }).map((_, i) => ({
                        id: `child-${Date.now()}-${i + 1}`,
                        type: 'ContentBox',
                        category: 'Disposition',
                        content: `Conteneur DIV ${i + 1}`,
                        data: getDefaultBlockData('ContentBox', 'Conteneur DIV'),
                      })),
                    },
                  };
                }
                const isSelected = el.id === selectedElementId;
                const isSection = el.type === 'Section' || el.type === 'BlockSectionFull' || el.type === 'Section3Col';

                return (
                  <React.Fragment key={el.id}>
                  <div
                    key={el.id}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.stopPropagation();
                      handleCanvasDrop(e, idx);
                    }}
                    onClick={() => setSelectedElementId(el.id)}
                    className={`relative rounded-none transition-all group ${
                      isSection
                        ? 'border-0 p-0 m-0 bg-transparent'
                        : isSelected
                        ? 'border-2 border-[#00A0FF] bg-blue-500/10 ring-2 ring-[#00A0FF]/30 p-4'
                        : 'border-2 border-slate-800/80 hover:border-slate-700 bg-slate-950/40 p-4'
                    }`}
                    style={
                      isSection
                        ? {}
                        : {
                            marginTop: `${el.data?.marginTop || 0}px`,
                            marginRight: `${el.data?.marginRight || 0}px`,
                            marginBottom: `${el.data?.marginBottom || 0}px`,
                            marginLeft: `${el.data?.marginLeft || 0}px`,
                            paddingTop: `${el.data?.paddingTop !== undefined ? el.data.paddingTop : 16}px`,
                            paddingRight: `${el.data?.paddingRight !== undefined ? el.data.paddingRight : 16}px`,
                            paddingBottom: `${el.data?.paddingBottom !== undefined ? el.data.paddingBottom : 16}px`,
                            paddingLeft: `${el.data?.paddingLeft !== undefined ? el.data.paddingLeft : 16}px`,
                          }
                    }
                  >
                    {/* SYSTEME.IO STYLE FLOATING HOVER TOOLBAR BADGE FOR ROOT ELEMENTS */}
                    <div
                      className="absolute -top-3.5 right-3 z-[999] transition-all duration-200 flex items-center shadow-xl font-sans text-xs opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto"
                    >
                      {/* TYPE NAME BADGE */}
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedElementId(el.id);
                          setSelectedChildIndex(null);
                          setSelectedSubItem(null);
                        }}
                        style={{ color: '#ffffff' }}
                        className={`!text-white px-2.5 py-1 rounded-l-lg font-black text-[11px] uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer hover:opacity-90 transition-opacity ${
                          el.type === 'ContentBox' ? 'bg-[#10B981]' : el.type === 'Image' ? 'bg-[#FF7A00]' : 'bg-[#00A0FF]'
                        }`}
                      >
                        <span className="!text-white font-black" style={{ color: '#ffffff' }}>
                          {el.type === 'Section' || el.type === 'BlockSectionFull' || el.type === 'Section3Col' ? 'SECTION' : el.type === 'ContentBox' ? 'RANGÉE / DIV' : el.type}
                        </span>
                        <span className="p-0.5 rounded border border-white/80 bg-white/20 flex items-center justify-center shrink-0">
                          <ChevronDown className="w-3 h-3 text-white" color="#ffffff" stroke="#ffffff" style={{ color: '#ffffff', stroke: '#ffffff' }} />
                        </span>
                      </div>

                      {/* ACTIONS BADGE */}
                      <div
                        style={{ color: '#ffffff' }}
                        className={`!text-white px-1.5 py-1 rounded-r-lg flex items-center gap-1 shadow-md border-l ${
                          el.type === 'ContentBox' ? 'border-emerald-400 bg-[#10B981]' : el.type === 'Image' ? 'border-orange-300 bg-[#FF7A00]' : 'border-blue-400 bg-[#00A0FF]'
                        }`}
                      >
                        {/* ⚙️ PARAMÈTRES / INSPECTEUR */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedElementId(el.id);
                            setSelectedChildIndex(null);
                            setSelectedSubItem(null);
                          }}
                          className="p-1 hover:bg-white/20 rounded transition-colors !text-white"
                          style={{ color: '#ffffff' }}
                          title="⚙️ Paramètres du bloc"
                        >
                          <Settings className="w-3.5 h-3.5 text-white" color="#ffffff" stroke="#ffffff" style={{ color: '#ffffff', stroke: '#ffffff' }} />
                        </button>

                        {/* 📋 DUPLIQUER */}
                        <button
                          type="button"
                          onClick={(e) => handleDuplicateElement(el.id, e)}
                          className="p-1 hover:bg-white/20 rounded transition-colors !text-white"
                          style={{ color: '#ffffff' }}
                          title="📋 Dupliquer le bloc"
                        >
                          <Copy className="w-3.5 h-3.5 text-white" color="#ffffff" stroke="#ffffff" style={{ color: '#ffffff', stroke: '#ffffff' }} />
                        </button>

                        {/* ▲ MONTER */}
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={(e) => moveElementToPosition(idx, 'up', e)}
                          className="p-1 hover:bg-white/20 rounded transition-colors disabled:opacity-40 !text-white"
                          style={{ color: '#ffffff' }}
                          title="▲ Monter le bloc"
                        >
                          <ChevronUp className="w-3.5 h-3.5 text-white" color="#ffffff" stroke="#ffffff" style={{ color: '#ffffff', stroke: '#ffffff' }} />
                        </button>

                        {/* ▼ DESCENDRE */}
                        <button
                          type="button"
                          disabled={idx === elements.length - 1}
                          onClick={(e) => moveElementToPosition(idx, 'down', e)}
                          className="p-1 hover:bg-white/20 rounded transition-colors disabled:opacity-40 !text-white"
                          style={{ color: '#ffffff' }}
                          title="▼ Descendre le bloc"
                        >
                          <ChevronDown className="w-3.5 h-3.5 text-white" color="#ffffff" stroke="#ffffff" style={{ color: '#ffffff', stroke: '#ffffff' }} />
                        </button>

                        {/* 🗑️ SUPPRIMER */}
                        <button
                          type="button"
                          onClick={(e) => handleDeleteElement(el.id, e)}
                          className="p-1 hover:bg-red-700/80 rounded transition-colors !text-white"
                          style={{ color: '#ffffff' }}
                          title="🗑️ Supprimer le bloc"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-white" color="#ffffff" stroke="#ffffff" style={{ color: '#ffffff', stroke: '#ffffff' }} />
                        </button>
                      </div>
                    </div>

                    {/* ELEMENT TYPE CONTENT RENDERERS WITH DYNAMIC CUSTOMIZABLE DATA */}
                    {el.type === 'Heading' && (
                      <div
                        contentEditable
                        suppressContentEditableWarning
                        onMouseDown={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                        onDragStart={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        onContextMenu={(e) => handleOpenFormattingToolbar(e, el.id, null, null, el.content)}
                        onBlur={(e) => {
                          const html = e.currentTarget.innerHTML;
                          setElements((prev) => prev.map((item) => (item.id === el.id ? { ...item, content: html } : item)));
                        }}
                        onInput={(e) => {
                          const html = e.currentTarget.innerHTML;
                          setElements((prev) => prev.map((item) => (item.id === el.id ? { ...item, content: html } : item)));
                        }}
                        dangerouslySetInnerHTML={{ __html: el.content }}
                        style={{
                          color: el.data?.textColor || '#ffffff',
                          backgroundColor: el.data?.bgColor || 'transparent',
                          fontSize: el.data?.fontSize,
                          fontWeight: el.data?.fontWeight,
                          fontStyle: el.data?.fontStyle,
                          textDecoration: el.data?.textDecoration,
                        }}
                        className="w-full text-2xl sm:text-4xl font-heading font-black text-white bg-transparent border-b border-transparent focus:border-[#00A0FF] outline-none rounded-lg px-2 py-1 transition-all hover:bg-white/5 focus:bg-slate-900/80 select-text"
                      />
                    )}

                    {el.type === 'Text' && (
                      <div
                        contentEditable
                        suppressContentEditableWarning
                        onMouseDown={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                        onDragStart={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        onContextMenu={(e) => handleOpenFormattingToolbar(e, el.id, null, null, el.content)}
                        onBlur={(e) => {
                          const html = e.currentTarget.innerHTML;
                          setElements((prev) => prev.map((item) => (item.id === el.id ? { ...item, content: html } : item)));
                        }}
                        onInput={(e) => {
                          const html = e.currentTarget.innerHTML;
                          setElements((prev) => prev.map((item) => (item.id === el.id ? { ...item, content: html } : item)));
                        }}
                        dangerouslySetInnerHTML={{ __html: el.content }}
                        style={{
                          color: el.data?.textColor || '#cbd5e1',
                          backgroundColor: el.data?.bgColor || 'transparent',
                          fontSize: el.data?.fontSize,
                          fontWeight: el.data?.fontWeight,
                          fontStyle: el.data?.fontStyle,
                          textDecoration: el.data?.textDecoration,
                        }}
                        className="w-full text-sm text-slate-300 leading-relaxed font-medium bg-transparent border border-transparent focus:border-[#00A0FF] outline-none rounded-lg p-2 transition-all hover:bg-white/5 focus:bg-slate-900/80 select-text min-h-[30px]"
                      />
                    )}

                    {el.type === 'BulletList' && (
                      <ul className="space-y-2 text-xs font-bold text-emerald-400">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" /> <span>{el.content}</span>
                        </li>
                      </ul>
                    )}

                    {el.type === 'Image' && (
                      <div className="aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 relative group/imgbox">
                        <img
                          src={el.data?.img || el.content || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80'}
                          alt="Preview"
                          onMouseDown={(e) => {
                            const currentX = el.data?.posX !== undefined ? el.data.posX : 50;
                            const currentY = el.data?.posY !== undefined ? el.data.posY : 50;
                            handleImageMouseDown(e, currentX, currentY, (newX, newY) => {
                              handleUpdateElementData(el.id, { posX: newX, posY: newY });
                            });
                          }}
                          onDoubleClick={(e) => {
                            e.stopPropagation();
                            triggerImageFileUpload((base64Url) => {
                              handleUpdateElementContent(el.id, base64Url);
                              handleUpdateElementData(el.id, { img: base64Url });
                            });
                          }}
                          onWheel={(e) => {
                            e.preventDefault();
                            const currZoom = el.data?.imgZoom || 100;
                            const nextZoom = Math.max(100, Math.min(300, currZoom + (e.deltaY < 0 ? 10 : -10)));
                            handleUpdateElementData(el.id, { imgZoom: nextZoom });
                          }}
                          style={{
                            objectFit: 'cover',
                            transform: `scale(${(el.data?.imgZoom || 120) / 100}) translate(${50 - (el.data?.posX !== undefined ? el.data.posX : 50)}%, ${50 - (el.data?.posY !== undefined ? el.data.posY : 50)}%)`,
                            ...renderBorderStyles(el.data),
                          }}
                          className="w-full h-full object-cover cursor-grab active:cursor-grabbing select-none transition-transform duration-75"
                        />
                      </div>
                    )}

                    {el.type === 'ButtonCTA' && (
                      <div className="p-4 text-center">
                        <button
                          type="button"
                          className="w-full sm:w-auto px-8 py-4 bg-[#00A0FF] hover:bg-[#0080FF] text-white font-heading font-black text-base rounded-2xl shadow-xl transition-all hover:scale-[1.02] cursor-pointer"
                        >
                          <input
                            type="text"
                            value={el.data?.buttonText || el.content || 'Recevoir mon accès gratuit →'}
                            onChange={(e) => {
                              const val = e.target.value;
                              handleUpdateElementData(el.id, { buttonText: val });
                              handleUpdateElementContent(el.id, val);
                            }}
                            className="bg-transparent text-white text-center font-heading font-black outline-none border-b border-transparent focus:border-white w-full cursor-text"
                            placeholder="Bouton CTA..."
                          />
                        </button>
                      </div>
                    )}

                    {(el.type === 'OptinForm' || el.type === 'FormInput') && (
                      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-md max-w-md mx-auto space-y-2 text-left">
                        <label className="text-xs font-bold text-slate-700 block">
                          {el.data?.title || 'Champ de formulaire (Email)'}
                        </label>
                        <input
                          type={el.data?.inputType || 'email'}
                          placeholder={el.data?.placeholder || el.content || 'votre.email@exemple.com'}
                          readOnly
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 outline-none shadow-inner"
                        />
                      </div>
                    )}

                    {el.type === 'Checkbox' && (
                      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-md max-w-md mx-auto">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={el.data?.checked ?? true}
                            onChange={(e) => handleUpdateElementData(el.id, { checked: e.target.checked })}
                            className="w-5 h-5 rounded text-[#00A0FF] bg-white border-slate-300 accent-[#00A0FF] cursor-pointer"
                          />
                          <input
                            type="text"
                            value={el.data?.label || el.data?.title || el.content || 'J accepte la politique de confidentialité'}
                            onChange={(e) => {
                              const val = e.target.value;
                              handleUpdateElementData(el.id, { label: val, title: val });
                              handleUpdateElementContent(el.id, val);
                            }}
                            className="bg-transparent text-sm font-semibold text-slate-800 outline-none border-b border-transparent focus:border-[#00A0FF] flex-1 cursor-text"
                            placeholder="Case à cocher..."
                          />
                        </label>
                      </div>
                    )}

                    {el.type === 'Video' && (
                      <div className="aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 relative flex items-center justify-center">
                        {el.content?.includes('http') ? (
                          <iframe src={el.content} className="w-full h-full border-0" allowFullScreen />
                        ) : (
                          <div className="text-center p-8 space-y-2">
                            <Video className="w-12 h-12 text-[#00A0FF] mx-auto" />
                            <div className="text-xs font-bold text-slate-400">Lecteur Vidéo (Saisissez l URL dans l inspecteur)</div>
                          </div>
                        )}
                      </div>
                    )}

                    {el.type === 'Audio' && (
                      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-3 text-white max-w-md mx-auto shadow-lg">
                        <Music className="w-6 h-6 text-[#00A0FF] shrink-0" />
                        <div className="flex-1 text-xs font-bold truncate">{el.content || 'Fichier Audio'}</div>
                        <audio controls src={el.data?.audioUrl || el.content} className="h-8 max-w-[180px]" />
                      </div>
                    )}

                    {el.type === 'Countdown' && (
                      <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-center space-y-1">
                        <div className="text-[10px] font-black text-amber-400 uppercase">Offre limitée</div>
                        <div className="text-2xl font-heading font-black text-amber-300">{el.content}</div>
                      </div>
                    )}

                    {el.type === 'Divider' && <hr className="border-slate-800 my-4" />}

                    {/* DYNAMIC NATIVE BLOCK RENDERERS FOR THE ARIZONA TEMPLATE */}
                    {el.type === 'BlockNavArizona' && (
                      <nav className="bg-[#40B5A6] text-white py-3.5 px-6 rounded-2xl shadow-sm">
                        <div className="flex items-center justify-center gap-4 sm:gap-8 text-[11px] font-extrabold tracking-widest uppercase">
                          {['HOME', 'ABOUT', 'SERVICES', 'BLOG', 'CONTACT', 'EXTRA'].map((link, i) => (
                            <span key={i} className="hover:opacity-80 cursor-pointer">{link}</span>
                          ))}
                        </div>
                      </nav>
                    )}

                    {el.type === 'BlockHeroArizona' && (
                      <div className="bg-[#FEF5D7] p-6 sm:p-8 rounded-3xl border border-amber-100/60 shadow-xl space-y-6 text-slate-800">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                          <div className="md:col-span-6 aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border-4 border-white">
                            <img
                              src={el.data?.img || 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80'}
                              alt="Hero"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="md:col-span-6 bg-white p-6 sm:p-8 rounded-2xl shadow-md space-y-3 border border-amber-100 text-left">
                            <input
                              type="text"
                              value={el.data?.tag || 'MARKETING SELLS WHEN'}
                              onChange={(e) => handleUpdateElementData(el.id, { tag: e.target.value })}
                              className="w-full text-[10px] font-extrabold text-[#D69A3A] uppercase tracking-widest bg-transparent border-b border-transparent focus:border-[#D69A3A] outline-none"
                            />
                            <input
                              type="text"
                              value={el.data?.title || el.content || 'Your Brand Voice, Dressed in Technicolor'}
                              onChange={(e) => {
                                handleUpdateElementData(el.id, { title: e.target.value });
                                handleUpdateElementContent(el.id, e.target.value);
                              }}
                              className="w-full text-2xl sm:text-3xl font-serif font-black text-[#D69A3A] bg-transparent border-b border-transparent focus:border-[#D69A3A] outline-none"
                            />
                            <textarea
                              rows={2}
                              value={el.data?.desc || 'Bold copy that demands attention, sparks connection, and converts — without ever toning it down.'}
                              onChange={(e) => handleUpdateElementData(el.id, { desc: e.target.value })}
                              className="w-full text-xs text-slate-600 font-medium leading-relaxed bg-transparent border border-transparent focus:border-[#D69A3A] outline-none resize-none"
                            />
                            <button
                              type="button"
                              className="bg-[#70A327] text-white font-extrabold text-xs uppercase tracking-wider px-5 py-3 rounded-lg shadow-sm"
                            >
                              <input
                                type="text"
                                value={el.data?.buttonText || 'GET STARTED NOW'}
                                onChange={(e) => handleUpdateElementData(el.id, { buttonText: e.target.value })}
                                className="bg-transparent text-white font-extrabold text-center outline-none border-b border-transparent focus:border-white w-full"
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {el.type === 'BlockBioArizona' && (
                      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl space-y-6 text-slate-800 border border-slate-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                          <div className="space-y-4 text-left">
                            <input
                              type="text"
                              value={el.data?.title || "Hey, I'm Claire"}
                              onChange={(e) => handleUpdateElementData(el.id, { title: e.target.value })}
                              className="w-full text-3xl font-serif font-black text-[#D69A3A] bg-transparent border-b border-transparent focus:border-[#D69A3A] outline-none"
                            />
                            <input
                              type="text"
                              value={el.data?.subtitle || 'Welcome to the land of highlighter-worthy copy!'}
                              onChange={(e) => handleUpdateElementData(el.id, { subtitle: e.target.value })}
                              className="w-full text-sm font-serif font-bold text-[#40B5A6] bg-transparent border-b border-transparent focus:border-[#40B5A6] outline-none"
                            />
                            <textarea
                              rows={5}
                              value={el.data?.desc || 'The Painted Paragraph exists to help women take up more space—with words that radiate power, personality, and purpose. Because when your copy clicks, everything changes.'}
                              onChange={(e) => handleUpdateElementData(el.id, { desc: e.target.value })}
                              className="w-full text-xs text-slate-600 font-medium leading-relaxed bg-transparent border border-transparent focus:border-[#D69A3A] outline-none resize-none"
                            />
                            <button
                              type="button"
                              className="bg-[#70A327] text-white font-extrabold text-xs uppercase tracking-wider px-5 py-3 rounded-lg shadow-sm"
                            >
                              <input
                                type="text"
                                value={el.data?.buttonText || 'GET STARTED NOW'}
                                onChange={(e) => handleUpdateElementData(el.id, { buttonText: e.target.value })}
                                className="bg-transparent text-white font-extrabold text-center outline-none border-b border-transparent focus:border-white w-full"
                              />
                            </button>
                          </div>
                          <div className="flex justify-center">
                            <div className={`overflow-hidden shadow-xl border-4 border-amber-50 max-w-xs ${el.data?.imgShape === 'arcade' ? 'rounded-t-[100px]' : el.data?.imgShape === 'circle' ? 'rounded-full' : el.data?.imgShape === 'square' ? 'rounded-none' : 'rounded-3xl'}`}>
                              <img
                                src={el.data?.img || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80'}
                                alt="Claire"
                                className={`w-full ${el.data?.imgHeight || 'h-80'} ${el.data?.imgObjectFit || 'object-cover'}`}
                                style={{ objectPosition: el.data?.imgObjectPosition || 'center' }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {el.type === 'BlockSoulSistersArizona' && (
                      <div className="bg-white p-6 rounded-3xl shadow-xl space-y-6 text-slate-800 border border-slate-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                          <div className={`overflow-hidden shadow-md border border-slate-100 ${el.data?.imgShape === 'arcade' ? 'rounded-t-[80px]' : el.data?.imgShape === 'circle' ? 'rounded-full' : el.data?.imgShape === 'square' ? 'rounded-none' : 'rounded-2xl'}`}>
                            <img
                              src={el.data?.img || 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80'}
                              alt="Workspace"
                              className={`w-full ${el.data?.imgHeight || 'h-64'} ${el.data?.imgObjectFit || 'object-cover'}`}
                              style={{ objectPosition: el.data?.imgObjectPosition || 'center' }}
                            />
                          </div>
                          <div className="bg-[#E6F7F5] border border-[#BCEEE6] p-6 rounded-2xl space-y-3 text-left">
                            <input
                              type="text"
                              value={el.data?.title || 'We May Be Soul Sisters If...'}
                              onChange={(e) => handleUpdateElementData(el.id, { title: e.target.value })}
                              className="w-full text-xl font-serif font-black text-[#40B5A6] bg-transparent border-b border-transparent focus:border-[#40B5A6] outline-none"
                            />
                            <div className="space-y-2">
                              {(el.data?.items || [
                                { id: '1', desc: 'Toffee bonbon gummy bears jujubes pudding cheesecake. Pudding jujubes gingerbread jujubes bonbon sweet powder.' },
                                { id: '2', desc: 'Toffee bonbon gummy bears jujubes pudding cheesecake. Pudding jujubes gingerbread jujubes bonbon sweet powder.' },
                                { id: '3', desc: 'Toffee bonbon gummy bears jujubes pudding cheesecake. Pudding jujubes gingerbread jujubes bonbon sweet powder.' },
                                { id: '4', desc: 'Toffee bonbon gummy bears jujubes pudding cheesecake. Pudding jujubes gingerbread jujubes bonbon sweet powder.' },
                              ]).map((it: any, i: number) => (
                                <div key={i} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
                                  <span className="text-[#E85D75] font-bold">♥</span>
                                  <textarea
                                    rows={2}
                                    value={it.desc}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      const updatedItems = (el.data?.items || []).map((item: any, idx: number) =>
                                        idx === i ? { ...item, desc: val } : item
                                      );
                                      handleUpdateElementData(el.id, { items: updatedItems });
                                    }}
                                    className="w-full text-xs text-slate-700 bg-transparent border border-transparent focus:border-[#40B5A6] outline-none resize-none"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {el.type === 'Block3ColArcadeArizona' && (
                      <div
                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        onDrop={(e) => handleBlockDrop(e, el.id)}
                        className="bg-white p-6 rounded-3xl shadow-xl space-y-6 text-slate-800 border border-slate-100 relative group/block"
                      >
                        <div className="text-center">
                          <input
                            type="text"
                            value={el.data?.title || 'Copy that Pops. Strategy that Sells.'}
                            onChange={(e) => handleUpdateElementData(el.id, { title: e.target.value })}
                            className="w-full text-center text-2xl font-serif font-black text-[#D69A3A] bg-transparent border-b border-transparent focus:border-[#D69A3A] outline-none"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {(el.data?.items || [
                            { id: '1', subtitle: 'The Masterpiece', title: 'EXCLUSIVE VIP DAYS', theme: 'teal', img: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=500&q=80', desc: 'Toffee bonbon gummy bears jujubes pudding cheesecake.' },
                            { id: '2', subtitle: 'The Gallery', title: 'LAUNCH & COPY STRATEGY', theme: 'mint', img: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=500&q=80', desc: 'Toffee bonbon gummy bears jujubes pudding cheesecake.' },
                            { id: '3', subtitle: 'The Sketch', title: 'BRAND VOICE INTENSIVE', theme: 'yellow', img: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=500&q=80', desc: 'Toffee bonbon gummy bears jujubes pudding cheesecake.' },
                          ]).map((col: any, i: number) => {
                            const bgHeader = col.theme === 'mint' ? 'bg-[#52C2A5]' : col.theme === 'yellow' ? 'bg-[#F3C035]' : 'bg-[#40B5A6]';
                            const textColor = col.theme === 'mint' ? 'text-[#52C2A5]' : col.theme === 'yellow' ? 'text-[#F3C035]' : 'text-[#40B5A6]';

                            const imgHeight = col.imgHeight || el.data?.imgHeight || 'h-48';
                            const imgShape = col.imgShape || el.data?.imgShape || 'arcade';
                            const shapeClass = imgShape === 'arcade' ? 'rounded-t-[80px]' : imgShape === 'circle' ? 'rounded-full' : imgShape === 'square' ? 'rounded-none' : 'rounded-3xl';
                            const imgFit = col.imgObjectFit || el.data?.imgObjectFit || 'object-cover';
                            const imgPos = col.imgObjectPosition || el.data?.imgObjectPosition || 'center';

                            return (
                              <div key={i} className="flex flex-col items-center">
                                <div
                                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                  onDrop={(e) => handleCardDrop(e, el.id, i)}
                                  className={`w-full ${imgHeight} ${shapeClass} overflow-hidden shadow-sm border-2 border-dashed border-transparent hover:border-[#00A0FF] flex items-center justify-center relative cursor-pointer group/card`}
                                >
                                  <img src={col.img} alt={col.title} className={`w-full h-full ${imgFit}`} style={{ objectPosition: imgPos }} />
                                  <div className="absolute inset-0 bg-[#00A0FF]/20 opacity-0 group-hover/card:opacity-100 flex items-center justify-center text-white font-bold text-xs pointer-events-none transition-opacity">
                                    🎯 Déposer l image ici
                                  </div>
                                </div>
                                <div className={`text-[10px] font-serif font-extrabold ${textColor} italic my-1.5`}>{col.subtitle}</div>
                                <div className={`w-full ${bgHeader} text-white p-4 rounded-b-2xl text-center space-y-1 shadow-md`}>
                                  <input
                                    type="text"
                                    value={col.title}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      const updatedItems = (el.data?.items || []).map((item: any, idx: number) =>
                                        idx === i ? { ...item, title: val } : item
                                      );
                                      handleUpdateElementData(el.id, { items: updatedItems });
                                    }}
                                    className="w-full text-center text-xs font-extrabold uppercase tracking-wider text-white bg-transparent border-b border-transparent focus:border-white outline-none"
                                  />
                                  <textarea
                                    rows={2}
                                    value={col.desc}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      const updatedItems = (el.data?.items || []).map((item: any, idx: number) =>
                                        idx === i ? { ...item, desc: val } : item
                                      );
                                      handleUpdateElementData(el.id, { items: updatedItems });
                                    }}
                                    className="w-full text-[10px] text-white/90 leading-relaxed bg-transparent border border-transparent focus:border-white outline-none resize-none"
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {el.type === 'ContentBox' && (() => {
                      const mainBg = el.data?.bgColor || '#ffffff';
                      const cardBg = el.data?.cardBgColor || '#f8fafc';
                      const textColor = el.data?.textColor || '#1e293b';

                      return (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedElementId(el.id);
                            setSelectedChildIndex(null);
                            setSelectedSubItem(null);
                          }}
                          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                          onDrop={(e) => handleBlockDrop(e, el.id)}
                          style={{
                            backgroundColor: mainBg,
                            color: textColor,
                            ...renderBorderStyles(el.data),
                          }}
                          className="p-6 sm:p-8 overflow-hidden shadow-xl space-y-6 border-2 border-dashed border-[#00A0FF]/60 hover:border-[#00A0FF] relative transition-all group/box"
                        >
                          {el.data?.title && (
                            <div className="flex items-center justify-between border-b border-slate-100/60 pb-3">
                              <input
                                type="text"
                                value={el.data.title}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  handleUpdateElementData(el.id, { title: val });
                                  handleUpdateElementContent(el.id, val);
                                }}
                                style={{ color: textColor }}
                                className="text-xl font-heading font-black bg-transparent outline-none border-b border-transparent focus:border-[#00A0FF]"
                              />
                            </div>
                          )}

                        {/* RENDER NESTED CHILDREN IN THE CONTAINER */}
                        {(!el.data?.children || el.data.children.length === 0) ? (
                          <div className="w-full min-h-[120px] border border-dashed border-slate-300 rounded-lg bg-white" />
                        ) : (() => {
                          const layoutMode = el.data?.layoutMode || 'grid-3';
                          const gridClass =
                            layoutMode === 'masonry'
                              ? 'columns-1 md:columns-3 gap-4 space-y-4 [&>div]:break-inside-avoid'
                              : layoutMode === 'vertical'
                              ? 'flex flex-col space-y-4'
                              : layoutMode === 'grid-2'
                              ? 'grid grid-cols-1 md:grid-cols-2 gap-4 items-start'
                              : layoutMode === 'grid-4'
                              ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-start'
                              : layoutMode === 'flex-row'
                              ? 'flex flex-wrap items-start gap-4'
                              : 'grid grid-cols-1 md:grid-cols-3 gap-4 items-start';

                          return (
                            <div className={gridClass}>
                              {el.data.children.map((child: CanvasElement, cIdx: number) => (
                                <div
                                  key={child.id || cIdx}
                                  draggable
                                  onDragStart={(e) => {
                                    e.stopPropagation();
                                    e.dataTransfer.setData('application/json', JSON.stringify({ isChild: true, parentBlockId: el.id, childIndex: cIdx }));
                                  }}
                                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                  onDrop={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const dataStr = e.dataTransfer.getData('application/json');
                                    if (!dataStr) return;
                                    try {
                                      const data = JSON.parse(dataStr);
                                      if (data.isChild && data.parentBlockId === el.id) {
                                        const fromIdx = data.childIndex;
                                        if (fromIdx !== undefined && fromIdx !== cIdx) {
                                          const updated = [...el.data.children];
                                          const [moved] = updated.splice(fromIdx, 1);
                                          updated.splice(cIdx, 0, moved);
                                          handleUpdateElementData(el.id, { children: updated });
                                        }
                                      }
                                    } catch (err) {
                                      console.error(err);
                                    }
                                  }}
                                  style={{
                                    backgroundColor: previewMode === 'MOBILE'
                                      ? ((child as any).data?.mobileBgColor !== undefined ? (child as any).data.mobileBgColor : ((child as any).data?.mobileBgImage ? 'transparent' : ((child as any).data?.cardBgColor || (child as any).bgColor || cardBg)))
                                      : ((child as any).data?.cardBgColor || (child as any).bgColor || cardBg),
                                    color: (child as any).textColor || textColor
                                  }}
                                  className="p-4 border border-slate-200/80 rounded-2xl relative group/child space-y-2 hover:border-[#00A0FF] transition-all cursor-grab active:cursor-grabbing shadow-xs hover:shadow-md"
                                >
                                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 border-b border-slate-200/60 pb-1">
                                  <span className="uppercase text-[#00A0FF] font-black">{child.type || 'Élément'}</span>
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = [...el.data.children];
                                        if (cIdx > 0) {
                                          const temp = updated[cIdx];
                                          updated[cIdx] = updated[cIdx - 1];
                                          updated[cIdx - 1] = temp;
                                          handleUpdateElementData(el.id, { children: updated });
                                        }
                                      }}
                                      className="hover:text-slate-700"
                                      title="Monter"
                                    >
                                      ▲
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = [...el.data.children];
                                        if (cIdx < updated.length - 1) {
                                          const temp = updated[cIdx];
                                          updated[cIdx] = updated[cIdx + 1];
                                          updated[cIdx + 1] = temp;
                                          handleUpdateElementData(el.id, { children: updated });
                                        }
                                      }}
                                      className="hover:text-slate-700"
                                      title="Descendre"
                                    >
                                      ▼
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = el.data.children.filter((_: any, i: number) => i !== cIdx);
                                        handleUpdateElementData(el.id, { children: updated });
                                      }}
                                      className="text-rose-500 hover:text-rose-700 font-bold"
                                    >
                                      Supprimer
                                    </button>
                                  </div>
                                </div>

                                {child.type === 'Heading' && (
                                  <input
                                    type="text"
                                    value={child.content}
                                    onChange={(e) => {
                                      const updated = el.data.children.map((ch: any, i: number) =>
                                        i === cIdx ? { ...ch, content: e.target.value } : ch
                                      );
                                      handleUpdateElementData(el.id, { children: updated });
                                    }}
                                    className="w-full text-xl font-heading font-black text-slate-800 bg-transparent border-b border-transparent focus:border-[#00A0FF] outline-none"
                                  />
                                )}

                                {child.type === 'Text' && (
                                  <textarea
                                    rows={2}
                                    value={child.content}
                                    onChange={(e) => {
                                      const updated = el.data.children.map((ch: any, i: number) =>
                                        i === cIdx ? { ...ch, content: e.target.value } : ch
                                      );
                                      handleUpdateElementData(el.id, { children: updated });
                                    }}
                                    className="w-full text-sm text-slate-600 font-medium bg-transparent border border-transparent focus:border-[#00A0FF] outline-none resize-none"
                                  />
                                )}

                                {child.type === 'Image' && (() => {
                                  const c = child as any;
                                  const imgHeight = c.imgHeight || c.data?.imgHeight || el.data?.imgHeight || 'h-56';
                                  const imgShape = c.imgShape || c.data?.imgShape || el.data?.imgShape || 'arcade';
                                  const shapeClass =
                                    imgShape === 'arcade'
                                      ? 'rounded-t-[80px]'
                                      : imgShape === 'circle'
                                      ? 'rounded-full'
                                      : imgShape === 'square'
                                      ? 'rounded-none'
                                      : 'rounded-3xl';
                                  const imgFit = c.imgObjectFit || c.data?.imgObjectFit || el.data?.imgObjectFit || 'object-cover';
                                  const imgPos = c.imgObjectPosition || c.data?.imgObjectPosition || el.data?.imgObjectPosition || 'center';

                                  return (
                                    <div className={`w-full ${imgHeight} ${shapeClass} overflow-hidden shadow-md bg-slate-100 relative flex items-center justify-center`}>
                                      <img
                                        src={child.content}
                                        alt="Child"
                                        className={`w-full h-full ${imgFit}`}
                                        style={{ objectPosition: imgPos }}
                                      />
                                    </div>
                                  );
                                })()}

                                {child.type === 'ButtonCTA' && (
                                  <button type="button" className="w-full py-3 bg-[#00A0FF] text-white rounded-xl font-bold text-sm shadow-md">
                                    {child.content || 'Bouton d action'}
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                        </div>
                      );
                    })()}

                    {/* SECTION PRINCIPALE (PLEIN ÉCRAN 100%) RENDERER */}
                    {(el.type === 'Section' || el.type === 'BlockSectionFull' || el.type === 'Section3Col') && (() => {
                      const isMobMode = previewMode === 'MOBILE';
                      const mainBg = isMobMode
                        ? (el.data?.mobileBgColor !== undefined ? el.data.mobileBgColor : (el.data?.mobileBgImage ? 'transparent' : (el.data?.bgColor || '#0F172A')))
                        : (el.data?.bgColor || '#0F172A');
                      const bgImage = isMobMode ? (el.data?.mobileBgImage || '') : (el.data?.bgImage || '');
                      const bgSize = isMobMode ? (el.data?.mobileBgSize || 'cover') : (el.data?.bgSize || 'cover');
                      const bgZoom = isMobMode ? (el.data?.mobileBgZoom !== undefined ? el.data.mobileBgZoom : 100) : (el.data?.bgZoom || 100);
                      const bgPosX = isMobMode ? (el.data?.mobileBgPosX !== undefined ? el.data.mobileBgPosX : 50) : (el.data?.bgPosX !== undefined ? el.data.bgPosX : 50);
                      const bgPosY = isMobMode ? (el.data?.mobileBgPosY !== undefined ? el.data.mobileBgPosY : 50) : (el.data?.bgPosY !== undefined ? el.data.bgPosY : 50);
                      const bgOverlay = el.data?.bgOverlay !== undefined ? el.data.bgOverlay : 0;
                      const textColor = el.data?.textColor || '#ffffff';
                      const innerWidth = el.data?.innerContentWidth || 'standard';

                      const innerWidthClass =
                        innerWidth === 'full'
                          ? 'w-full'
                          : innerWidth === 'wide'
                          ? 'max-w-6xl mx-auto'
                          : 'max-w-4xl mx-auto';

                      return (
                        <div
                          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                          onDrop={(e) => handleBlockDrop(e, el.id)}
                          style={{
                            backgroundColor: mainBg,
                            color: textColor,
                            minHeight: el.data?.minHeight ? `${el.data.minHeight}px` : undefined,
                            paddingTop: el.data?.paddingTop !== undefined ? `${el.data.paddingTop}px` : (el.data?.paddingY !== undefined ? `${el.data.paddingY}px` : undefined),
                            paddingBottom: el.data?.paddingBottom !== undefined ? `${el.data.paddingBottom}px` : (el.data?.paddingY !== undefined ? `${el.data.paddingY}px` : undefined),
                            paddingLeft: el.data?.paddingLeft !== undefined ? `${el.data.paddingLeft}px` : (el.data?.paddingX !== undefined ? `${el.data.paddingX}px` : undefined),
                            paddingRight: el.data?.paddingRight !== undefined ? `${el.data.paddingRight}px` : (el.data?.paddingX !== undefined ? `${el.data.paddingX}px` : undefined),
                            marginTop: el.data?.marginTop !== undefined ? `${el.data.marginTop}px` : (el.data?.marginY !== undefined ? `${el.data.marginY}px` : undefined),
                            marginBottom: el.data?.marginBottom !== undefined ? `${el.data.marginBottom}px` : (el.data?.marginY !== undefined ? `${el.data.marginY}px` : undefined),
                            marginLeft: el.data?.marginLeft !== undefined ? `${el.data.marginLeft}px` : (el.data?.marginX !== undefined ? `${el.data.marginX}px` : undefined),
                            marginRight: el.data?.marginRight !== undefined ? `${el.data.marginRight}px` : (el.data?.marginX !== undefined ? `${el.data.marginX}px` : undefined),
                            ...renderBorderStyles(el.data),
                          }}
                          className={`relative w-full shadow-none transition-all my-0 group/section border border-dashed border-slate-300 hover:border-[#00A0FF] flex flex-col justify-between p-0`}
                        >
                          {/* SECTION BACKGROUND IMAGE LAYER WITH ZOOM AND TRANSLATION */}
                          {bgImage && (
                            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                              <div
                                className="absolute inset-0 w-full h-full"
                                style={{
                                  backgroundImage: `url(${bgImage})`,
                                  backgroundSize: bgSize,
                                  backgroundPosition: 'top center',
                                  transform: `scale(${bgZoom / 100}) translate(${50 - bgPosX}%, ${50 - bgPosY}%)`,
                                  transformOrigin: 'top center',
                                }}
                              />
                            </div>
                          )}

                          {/* OVERLAY TINT FOR READABILITY */}
                          {bgOverlay > 0 && (
                            <div
                              className="absolute inset-0 pointer-events-none z-0"
                              style={{ backgroundColor: `rgba(0,0,0,${bgOverlay / 100})` }}
                            />
                          )}

                          <div className={`relative z-10 ${innerWidthClass} space-y-6 flex-1 flex flex-col h-full w-full`}>
                            {/* TITLE HEADER (ONLY IF SPECIFIED BY USER) */}
                            {el.data?.title && (
                              <div className="flex items-center justify-between border-b border-white/20 pb-3">
                                <input
                                  type="text"
                                  value={el.data.title}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    handleUpdateElementData(el.id, { title: val });
                                    handleUpdateElementContent(el.id, val);
                                  }}
                                  style={{ color: textColor }}
                                  className="text-xl sm:text-2xl font-heading font-black bg-transparent outline-none border-b border-transparent focus:border-[#00A0FF] w-full max-w-xl"
                                  placeholder="Titre de la Section..."
                                />
                                <span className="text-[10px] font-bold text-[#00A0FF] bg-blue-50 px-3 py-1 rounded-full border border-blue-200 shrink-0 flex items-center gap-1.5 shadow-sm">
                                  Section
                                </span>
                              </div>
                            )}

                            {/* RENDER NESTED CHILDREN INSIDE THE FULL SECTION */}
                            {(!el.data?.children || el.data.children.length === 0) ? (
                              <div className="w-full min-h-[120px] border border-dashed border-slate-300 rounded-lg bg-white" />
                            ) : (() => {
                              const childrenList = el.data?.children || [];
                              // Group children by row break and separate non-Div elements to ensure 100% full width for text/headings
                              const childRowGroups: number[][] = [];
                              let currentGroup: number[] = [];
                              childrenList.forEach((child: CanvasElement, index: number) => {
                                if (child.type !== 'ContentBox') {
                                  if (currentGroup.length > 0) {
                                    childRowGroups.push(currentGroup);
                                    currentGroup = [];
                                  }
                                  childRowGroups.push([index]);
                                } else if (child.data?.newRow && currentGroup.length > 0) {
                                  childRowGroups.push(currentGroup);
                                  currentGroup = [index];
                                } else {
                                  currentGroup.push(index);
                                }
                              });
                              if (currentGroup.length > 0) childRowGroups.push(currentGroup);

                              const colWidths: { [index: number]: number } = {};
                              childRowGroups.forEach((group) => {
                                const count = group.length;
                                const isNonDiv = count === 1 && childrenList[group[0]]?.type !== 'ContentBox';
                                const width = isNonDiv ? 100 : (count > 0 ? 100 / count : 100);
                                group.forEach((idx) => { colWidths[idx] = width; });
                              });

                              return (
                                <div
                                  ref={(node) => { sectionContainerRefs.current[el.id] = node; }}
                                  className={`flex ${previewMode === 'MOBILE' ? 'flex-col space-y-6' : 'flex-wrap gap-0'} items-stretch w-full relative flex-1 h-full`}
                                >
                                  {childrenList.map((child: CanvasElement, cIdx: number) => (
                                    <React.Fragment key={child.id || cIdx}>
                                      {(child.data?.newRow || child.type !== 'ContentBox') && <div className="w-full basis-full h-0 shrink-0" />}
                                      <div
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedElementId(el.id);
                                          setSelectedChildIndex(cIdx);
                                          setSelectedSubItem(null);
                                        }}
                                        onDragOver={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          e.dataTransfer.dropEffect = 'move';
                                        }}
                                        onDrop={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          try {
                                            const raw = e.dataTransfer.getData('text/plain');
                                            if (!raw) return;
                                            const dragData = JSON.parse(raw);
                                            if (dragData.type === 'BLOCK_SWAP' && dragData.parentId === el.id && dragData.index !== undefined && dragData.index !== cIdx) {
                                              const currentChildren = [...(el.data?.children || [])];
                                              const draggedBlock = currentChildren[dragData.index];
                                              currentChildren.splice(dragData.index, 1);
                                              currentChildren.splice(cIdx, 0, draggedBlock);
                                              handleUpdateElementData(el.id, { children: currentChildren });
                                              setSelectedChildIndex(cIdx);
                                            }
                                          } catch (err) {}
                                        }}
                                        style={{
                                          flex: previewMode === 'MOBILE' ? '1 1 100%' : `0 0 ${colWidths[cIdx]}%`,
                                          width: previewMode === 'MOBILE' ? '100%' : undefined,
                                          minWidth: previewMode === 'MOBILE' ? '100%' : '120px',
                                          marginTop: child.data?.marginTop !== undefined ? `${child.data.marginTop}px` : undefined,
                                          marginBottom: child.data?.marginBottom !== undefined ? `${child.data.marginBottom}px` : undefined,
                                        }}
                                        className={`relative group/child ${child.type === 'ContentBox' ? 'flex flex-col flex-1 h-full' : 'h-auto flex-none my-0'} overflow-visible z-40`}>
                                      {/* SYSTEME.IO STYLE FLOATING HOVER TOOLBAR BADGE FOR CHILD ELEMENTS */}
                                      <div
                                        className="absolute -top-3.5 left-3 z-[999] transition-all duration-200 flex items-center shadow-xl font-sans text-xs opacity-0 group-hover/child:opacity-100 pointer-events-none group-hover/child:pointer-events-auto"
                                      >
                                        {/* TYPE NAME BADGE */}
                                        <div
                                          draggable
                                          onDragStart={(e) => {
                                            e.stopPropagation();
                                            e.dataTransfer.setData('text/plain', JSON.stringify({
                                              type: 'BLOCK_SWAP',
                                              parentId: el.id,
                                              index: cIdx
                                            }));
                                            e.dataTransfer.effectAllowed = 'move';
                                          }}
                                          style={{ color: '#ffffff' }}
                                          className={`!text-white px-2.5 py-1 rounded-l-lg font-black text-[11px] uppercase tracking-wider flex items-center gap-1.5 shadow-md ${
                                             ['Heading', 'Text', 'Image', 'ButtonCTA', 'OptinForm'].includes(child.type)
                                               ? 'bg-[#FF7A00] hover:bg-orange-600'
                                               : 'bg-[#10B981] hover:bg-emerald-600'
                                           } cursor-grab active:cursor-grabbing transition-colors`}
                                          title="✋ Cliquez et glissez pour permuter ce bloc avec un autre"
                                        >
                                          <span className="text-xs font-black text-white/90">⋮⋮</span>
                                          <span className="!text-white font-black" style={{ color: '#ffffff' }}>
                                            {child.type === 'ContentBox' ? 'RANGÉE / DIV' : child.type}
                                          </span>
                                          <span className="p-0.5 rounded border border-white/80 bg-white/20 flex items-center justify-center shrink-0">
                                            <ChevronDown className="w-3 h-3 text-white" color="#ffffff" stroke="#ffffff" style={{ color: '#ffffff', stroke: '#ffffff' }} />
                                          </span>
                                        </div>

                                        {/* ACTIONS BADGE */}
                                        <div
                                          style={{ color: '#ffffff' }}
                                          className={`!text-white px-1.5 py-1 rounded-r-lg flex items-center gap-1 shadow-md ${
                                            ['Heading', 'Text', 'Image', 'ButtonCTA', 'OptinForm'].includes(child.type)
                                              ? 'border-l border-orange-400 bg-[#FF7A00]'
                                              : 'border-l border-emerald-400 bg-[#10B981]'
                                          }`}
                                        >
                                          {/* ⬆️ PLACER EN HAUT (AU-DESSUS DES DIVS) */}
                                           <button
                                             type="button"
                                             onClick={(e) => {
                                               e.stopPropagation();
                                               const currentChildren = [...(el.data?.children || [])];
                                               const [moved] = currentChildren.splice(cIdx, 1);
                                               currentChildren.unshift(moved);
                                               handleUpdateElementData(el.id, { children: currentChildren });
                                               setSelectedChildIndex(0);
                                             }}
                                             className="px-1.5 py-0.5 bg-blue-600 hover:bg-blue-700 font-extrabold text-[10px] rounded text-white flex items-center gap-1 transition-colors shadow-sm"
                                             style={{ color: '#ffffff' }}
                                             title="⬆️ Déplacer cet élément tout en haut de la Section (au-dessus de tous les Divs)"
                                           >
                                             <span>⬆️ En haut</span>
                                           </button>

                                           {/* ⚙️ CONTROLLER / INSPECTER */}
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setSelectedElementId(el.id);
                                              setSelectedChildIndex(cIdx);
                                              setSelectedSubItem(null);
                                            }}
                                            className="p-1 hover:bg-white/20 rounded transition-colors !text-white"
                                            style={{ color: '#ffffff' }}
                                            title="⚙️ Contrôler le bloc / Paramètres"
                                          >
                                            <Settings className="w-3.5 h-3.5 text-white" color="#ffffff" stroke="#ffffff" style={{ color: '#ffffff', stroke: '#ffffff' }} />
                                          </button>

                                          {/* 📋 DUPLIQUER */}
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              const copy = JSON.parse(JSON.stringify(child));
                                              copy.id = `child-${Date.now()}`;
                                              const updated = [...(el.data?.children || [])];
                                              updated.splice(cIdx + 1, 0, copy);
                                              handleUpdateElementData(el.id, { children: updated });
                                            }}
                                            className="p-1 hover:bg-white/20 rounded transition-colors !text-white"
                                            style={{ color: '#ffffff' }}
                                            title="📋 Dupliquer le bloc"
                                          >
                                            <Copy className="w-3.5 h-3.5 text-white" color="#ffffff" stroke="#ffffff" style={{ color: '#ffffff', stroke: '#ffffff' }} />
                                          </button>

                                          {/* ▲ MONTER */}
                                          <button
                                            type="button"
                                            disabled={cIdx === 0}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              if (cIdx > 0) {
                                                const updated = [...el.data.children];
                                                const temp = updated[cIdx - 1];
                                                updated[cIdx - 1] = updated[cIdx];
                                                updated[cIdx] = temp;
                                                handleUpdateElementData(el.id, { children: updated });
                                              }
                                            }}
                                            className="p-1 hover:bg-white/20 rounded transition-colors disabled:opacity-40 !text-white"
                                            style={{ color: '#ffffff' }}
                                            title="▲ Monter"
                                          >
                                            <ChevronUp className="w-3.5 h-3.5 text-white" color="#ffffff" stroke="#ffffff" style={{ color: '#ffffff', stroke: '#ffffff' }} />
                                          </button>

                                          {/* ▼ DESCENDRE */}
                                          <button
                                            type="button"
                                            disabled={cIdx === (el.data?.children || []).length - 1}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              if (cIdx < el.data.children.length - 1) {
                                                const updated = [...el.data.children];
                                                const temp = updated[cIdx + 1];
                                                updated[cIdx + 1] = updated[cIdx];
                                                updated[cIdx] = temp;
                                                handleUpdateElementData(el.id, { children: updated });
                                              }
                                            }}
                                            className="p-1 hover:bg-white/20 rounded transition-colors disabled:opacity-40 !text-white"
                                            style={{ color: '#ffffff' }}
                                            title="▼ Descendre"
                                          >
                                            <ChevronDown className="w-3.5 h-3.5 text-white" color="#ffffff" stroke="#ffffff" style={{ color: '#ffffff', stroke: '#ffffff' }} />
                                          </button>

                                          {/* 🗑️ SUPPRIMER */}
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              const updated = el.data.children.filter((_: any, i: number) => i !== cIdx);
                                              handleUpdateElementData(el.id, { children: updated });
                                              if (selectedChildIndex === cIdx) setSelectedChildIndex(null);
                                            }}
                                            className="p-1 hover:bg-red-700/80 rounded transition-colors !text-white"
                                            style={{ color: '#ffffff' }}
                                            title="🗑️ Supprimer le bloc"
                                          >
                                            <Trash2 className="w-3.5 h-3.5 text-white" color="#ffffff" stroke="#ffffff" style={{ color: '#ffffff', stroke: '#ffffff' }} />
                                          </button>
                                        </div>
                                      </div>

                                      {/* FLOATING HOVER TOOLBAR BADGE FOR IMAGE (ON OUTER OVERFLOW-VISIBLE CONTAINER FOR DIV) */}
                                       {(() => {
                                         const subChildren = child.data?.children || [];
                                         const imgSubIdx = subChildren.findIndex((sc: any) => sc.type === 'Image');
                                         if (imgSubIdx === -1 && child.type !== 'Image') return null;

                                         const isImgSel = selectedSubItem?.parentBlockId === el.id && selectedSubItem?.childIndex === cIdx;

                                         return (
                                           <div
                                             className={`absolute -top-3.5 right-3 z-[999] transition-all duration-200 flex items-center shadow-xl font-sans text-xs ${
                                               isImgSel ? 'opacity-100' : 'opacity-0 group-hover/child:opacity-100 pointer-events-none group-hover/child:pointer-events-auto'
                                             }`}
                                           >
                                             <div
                                               style={{ color: '#ffffff' }}
                                               className="bg-[#FF7A00] !text-white px-2.5 py-1 rounded-l-lg font-black text-[11px] uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer"
                                               onClick={(e) => {
                                                 e.stopPropagation();
                                                 setSelectedElementId(el.id);
                                                 setSelectedChildIndex(cIdx);
                                                 if (imgSubIdx !== -1) {
                                                   setSelectedSubItem({
                                                     blockId: `${el.id}-c${cIdx}`,
                                                     itemIndex: imgSubIdx,
                                                     subType: 'image',
                                                     childIndex: cIdx,
                                                     parentBlockId: el.id,
                                                   });
                                                 }
                                               }}
                                             >
                                               <span className="!text-white font-black" style={{ color: '#ffffff' }}>IMAGE</span>
                                               <span>⬇️</span>
                                             </div>
                                             <div
                                               style={{ color: '#ffffff' }}
                                               className="bg-[#FF7A00] !text-white px-1.5 py-1 rounded-r-lg flex items-center gap-1 shadow-md border-l border-orange-300"
                                             >
                                               <button
                                                 type="button"
                                                 onClick={(e) => {
                                                   e.stopPropagation();
                                                   if (imgSubIdx !== -1) {
                                                     const updatedSub = subChildren.filter((_: any, idx: number) => idx !== imgSubIdx);
                                                     const updatedChildren = [...(el.data?.children || [])];
                                                     updatedChildren[cIdx] = {
                                                       ...updatedChildren[cIdx],
                                                       data: { ...(updatedChildren[cIdx].data || {}), children: updatedSub },
                                                     };
                                                     handleUpdateElementData(el.id, { children: updatedChildren });
                                                     setSelectedSubItem(null);
                                                   }
                                                 }}
                                                 className="p-1 hover:bg-white/20 rounded transition-colors !text-white"
                                                 title="Supprimer l image"
                                               >
                                                 <Trash2 className="w-3.5 h-3.5 text-white" color="#ffffff" stroke="#ffffff" style={{ color: '#ffffff', stroke: '#ffffff' }} />
                                               </button>
                                             </div>
                                           </div>
                                         );
                                       })()}

                                       {/* INNER CLIPPED DIV FOR BACKGROUND, BORDER RADIUS, DASHED BORDER & CLIPPATH */}
                                      <div
                                        style={{
                                          backgroundColor: child.data?.bgColor || child.data?.cardBgColor || 'transparent',
                                          minHeight: child.data?.minHeight ? `${child.data.minHeight}px` : undefined,
                                          paddingLeft: child.data?.paddingLeft !== undefined ? `${child.data.paddingLeft}px` : (child.data?.paddingX !== undefined ? `${child.data.paddingX}px` : undefined),
                                          paddingRight: child.data?.paddingRight !== undefined ? `${child.data.paddingRight}px` : (child.data?.paddingX !== undefined ? `${child.data.paddingX}px` : undefined),
                                          paddingTop: child.data?.paddingTop !== undefined ? `${child.data.paddingTop}px` : (child.data?.paddingY !== undefined ? `${child.data.paddingY}px` : undefined),
                                          paddingBottom: child.data?.paddingBottom !== undefined ? `${child.data.paddingBottom}px` : (child.data?.paddingY !== undefined ? `${child.data.paddingY}px` : undefined),
                                          ...renderBorderStyles(child.data),
                                        }}
                                        className={`w-full ${child.type === 'ContentBox' ? 'h-full flex-1 flex flex-col min-h-[160px] border space-y-2' : 'h-auto flex-none border-0 p-2 m-0 flex flex-col justify-center items-center'} overflow-hidden transition-all ${
                                          selectedChildIndex === cIdx
                                            ? 'border-[#00A0FF] ring-2 ring-[#00A0FF]/40 shadow-lg'
                                            : 'border-white/10 hover:border-amber-500/60'
                                        }`}
                                      >

                                      {child.type === 'Heading' && (
                                        <input
                                          type="text"
                                          value={child.content}
                                          onContextMenu={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setSelectedElementId(el.id);
                                            setSelectedChildIndex(cIdx);
                                            const selection = window.getSelection();
                                            const selText = selection ? selection.toString() : '';
                                            setFloatingTextMenu({
                                              visible: true,
                                              x: Math.max(16, Math.min(window.innerWidth - 650, e.clientX - 250)),
                                              y: Math.max(80, e.clientY - 70),
                                              selectedText: selText || child.content,
                                              targetElId: el.id,
                                              childIdx: cIdx,
                                            });
                                          }}
                                          onChange={(e) => {
                                            const updated = el.data.children.map((ch: any, i: number) =>
                                              i === cIdx ? { ...ch, content: e.target.value } : ch
                                            );
                                            handleUpdateElementData(el.id, { children: updated });
                                          }}
                                          style={{
                                            color: child.data?.textColor || (el.data?.bgColor === '#ffffff' || !el.data?.bgColor || el.data?.bgColor === 'transparent' ? '#0F172A' : (el.data?.textColor || '#0F172A'))
                                          }}
                                          className="w-full text-xl sm:text-4xl font-heading font-black bg-transparent border-b border-transparent focus:border-[#00A0FF] outline-none py-2 text-center"
                                        />
                                      )}

                                      {child.type === 'Text' && (
                                        <textarea
                                          rows={2}
                                          value={child.content}
                                          onContextMenu={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setSelectedElementId(el.id);
                                            setSelectedChildIndex(cIdx);
                                            const selection = window.getSelection();
                                            const selText = selection ? selection.toString() : '';
                                            setFloatingTextMenu({
                                              visible: true,
                                              x: Math.max(16, Math.min(window.innerWidth - 650, e.clientX - 250)),
                                              y: Math.max(80, e.clientY - 70),
                                              selectedText: selText || child.content,
                                              targetElId: el.id,
                                              childIdx: cIdx,
                                            });
                                          }}
                                          onChange={(e) => {
                                            const updated = el.data.children.map((ch: any, i: number) =>
                                              i === cIdx ? { ...ch, content: e.target.value } : ch
                                            );
                                            handleUpdateElementData(el.id, { children: updated });
                                          }}
                                          style={{
                                            color: child.data?.textColor || (el.data?.bgColor === '#ffffff' || !el.data?.bgColor || el.data?.bgColor === 'transparent' ? '#0F172A' : (el.data?.textColor || '#0F172A'))
                                          }}
                                          className="w-full text-base sm:text-lg font-semibold leading-relaxed bg-transparent border border-transparent focus:border-[#00A0FF] outline-none resize-y py-1 text-center"
                                        />
                                      )}

                                      {child.type === 'Image' && (
                                        <div className="w-full rounded-xl overflow-hidden shadow-md border border-white/10 max-h-72">
                                          <img src={child.data?.img || child.content} alt="Child" className="w-full h-full object-cover" />
                                        </div>
                                      )}

                                      {child.type === 'OptinForm' && (
                                        <div className="max-w-md mx-auto p-6 bg-slate-950/80 rounded-2xl border border-white/10 space-y-3">
                                          <input
                                            type="email"
                                            disabled
                                            placeholder={child.data?.emailPlaceholder || 'Entrez votre e-mail...'}
                                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-400"
                                          />
                                          <button type="button" className="w-full py-3 bg-[#00A0FF] text-white font-bold text-xs rounded-xl shadow-md">
                                            {child.data?.buttonText || 'ACCÈS IMMÉDIAT'}
                                          </button>
                                        </div>
                                      )}

                                      {(child.type === 'BlockFeat4ColImg' || child.type === 'BlockFeat3ColImg' || child.type === 'BlockFeat2ColIconsLeft') && (() => {
                                        const colsClass =
                                          (child.type as string).includes('4')
                                            ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4'
                                            : (child.type as string).includes('2')
                                            ? 'grid-cols-1 md:grid-cols-2'
                                            : 'grid-cols-1 md:grid-cols-3';

                                        const itemsList = child.data?.items || getDefaultBlockData(child.type, child.content)?.items || [];

                                        const updateNestedColumnItem = (itemIdx: number, itemChanges: any) => {
                                           const currentChildren = [...(el.data?.children || [])];
                                           const targetChild = currentChildren[cIdx];
                                           const currentItems = targetChild.data?.items || getDefaultBlockData(child.type, child.content).items;
                                           const updatedItems = currentItems.map((item: any, i: number) =>
                                             i === itemIdx ? { ...item, ...itemChanges } : item
                                           );
                                           currentChildren[cIdx] = {
                                             ...targetChild,
                                             data: {
                                               ...(targetChild.data || {}),
                                               items: updatedItems,
                                             },
                                           };
                                           handleUpdateElementData(el.id, { children: currentChildren });
                                        };

                                        return (
                                          <div className={`grid ${colsClass} gap-4 p-4 bg-slate-950/60 rounded-none border border-white/10`}>
                                            {itemsList.map((it: any, idx: number) => {
                                              const isSelected = selectedSubItem?.parentBlockId === el.id && selectedSubItem?.childIndex === cIdx && selectedSubItem?.itemIndex === idx;

                                              return (
                                                <div
                                                  key={idx}
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedElementId(el.id);
                                                    setSelectedSubItem({
                                                      blockId: `${el.id}-c${cIdx}`,
                                                      itemIndex: idx,
                                                      subType: 'image',
                                                      childIndex: cIdx,
                                                      parentBlockId: el.id,
                                                    });
                                                  }}
                                                  style={{
                                                    backgroundColor: it.bgColor || child.data?.cardBgColor || 'rgba(15, 23, 42, 0.95)',
                                                    color: it.textColor || child.data?.textColor || '#ffffff',
                                                  }}
                                                  className={`p-4 rounded-none border-2 transition-all space-y-3 flex flex-col items-center relative group/card cursor-pointer ${
                                                    isSelected
                                                      ? 'border-[#00A0FF] shadow-lg ring-2 ring-[#00A0FF]/40'
                                                      : 'border-white/10 hover:border-white/30'
                                                  }`}
                                                >
                                                  {/* IMAGE FRAME WITH DROP TARGET */}
                                                  <div
                                                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                                    onDrop={(e) => {
                                                      e.preventDefault();
                                                      e.stopPropagation();
                                                      const dataStr = e.dataTransfer.getData('application/json');
                                                      if (dataStr) {
                                                        try {
                                                          const d = JSON.parse(dataStr);
                                                          const imgUrl = d.defaultContent || d.content || d.url || 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=400&q=80';
                                                          updateNestedColumnItem(idx, { img: imgUrl });
                                                        } catch (err) {}
                                                      }
                                                    }}
                                                    className={`w-full ${it.imgHeight || child.data?.imgHeight || 'h-36'} ${
                                                      (it.imgShape || child.data?.imgShape || 'square') === 'arcade'
                                                        ? 'rounded-t-[80px]'
                                                        : (it.imgShape || child.data?.imgShape) === 'circle'
                                                        ? 'rounded-full'
                                                        : 'rounded-none'
                                                    } overflow-hidden bg-slate-950/80 border border-white/20 relative group/img`}
                                                  >
                                                    {it.img ? (
                                                      <img
                                                        src={it.img}
                                                        alt={it.title}
                                                        className={`w-full h-full ${it.imgObjectFit || child.data?.imgObjectFit || 'object-cover'}`}
                                                        style={{ objectPosition: it.imgObjectPosition || child.data?.imgObjectPosition || 'center' }}
                                                      />
                                                    ) : (
                                                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs font-bold gap-1">
                                                        <span>🖼️</span>
                                                        <span>Déposer image</span>
                                                      </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-[#00A0FF]/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-white font-bold text-[10px] pointer-events-none transition-opacity">
                                                      Glisser une image ici
                                                    </div>
                                                  </div>

                                                  <input
                                                    type="text"
                                                    value={it.title || ''}
                                                    onChange={(e) => updateNestedColumnItem(idx, { title: e.target.value })}
                                                    className="w-full text-center font-heading font-extrabold text-sm uppercase bg-transparent border-b border-transparent focus:border-[#00A0FF] outline-none"
                                                    placeholder="Titre de la carte..."
                                                  />

                                                  <textarea
                                                    rows={2}
                                                    value={it.desc || ''}
                                                    onChange={(e) => updateNestedColumnItem(idx, { desc: e.target.value })}
                                                    className="w-full text-center text-xs font-medium opacity-80 bg-transparent border border-transparent focus:border-[#00A0FF] outline-none resize-none"
                                                    placeholder="Description..."
                                                  />

                                                  {/* QUICK COLOR PICKERS ON CARD */}
                                                  <div className="flex items-center gap-2 pt-2 opacity-0 group-hover/card:opacity-100 transition-opacity">
                                                    <input
                                                      type="color"
                                                      value={it.bgColor || '#0f172a'}
                                                      onChange={(e) => updateNestedColumnItem(idx, { bgColor: e.target.value })}
                                                      className="w-4 h-4 rounded cursor-pointer border-none bg-transparent"
                                                      title="Couleur de fond"
                                                    />
                                                    <input
                                                      type="color"
                                                      value={it.textColor || '#ffffff'}
                                                      onChange={(e) => updateNestedColumnItem(idx, { textColor: e.target.value })}
                                                      className="w-4 h-4 rounded cursor-pointer border-none bg-transparent"
                                                      title="Couleur de texte"
                                                    />
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        );
                                      })()}

                                      {child.type === 'ContentBox' && (
                                        <div
                                          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                          onDrop={(e) => {
                                            e.stopPropagation();
                                            handleBlockDrop(e, child.id);
                                          }}
                                          style={{
                                            backgroundColor: child.data?.bgColor || 'transparent',
                                          }}
                                          className="min-h-[80px] w-full border border-dashed border-slate-300 rounded-lg bg-white/60 transition-all hover:border-[#00A0FF]"
                                        >
                                          {(!child.data?.children || child.data.children.length === 0) ? (
                                            <div className="w-full h-full min-h-[80px] border-2 border-dashed border-sky-400/30 rounded-lg flex items-center justify-center p-3 text-[11px] text-sky-400/70 font-semibold bg-sky-500/5 select-none">
                                              <span>Glissez-déposez un élément ici (Image, Texte, Bouton...)</span>
                                            </div>
                                          ) : (
                                            <div className="w-full space-y-3">
                                              {(child.data.children || []).map((subChild: any, sIdx: number) => {
                                                const updateSubChildData = (changes: any) => {
                                                  const currentChildren = [...(el.data?.children || [])];
                                                  const targetChild = currentChildren[cIdx];
                                                  const currentSubList = [...(targetChild.data?.children || [])];
                                                  currentSubList[sIdx] = {
                                                    ...currentSubList[sIdx],
                                                    data: { ...(currentSubList[sIdx].data || {}), ...changes },
                                                    content: changes.content !== undefined ? changes.content : currentSubList[sIdx].content,
                                                  };
                                                  currentChildren[cIdx] = {
                                                    ...targetChild,
                                                    data: { ...(targetChild.data || {}), children: currentSubList },
                                                  };
                                                  handleUpdateElementData(el.id, { children: currentChildren });
                                                };

                                                const removeSubChild = (e?: React.MouseEvent) => {
                                                  if (e) e.stopPropagation();
                                                  const currentChildren = [...(el.data?.children || [])];
                                                  if (!currentChildren[cIdx]) return;
                                                  const targetChild = currentChildren[cIdx];
                                                  const currentSubList = (targetChild.data?.children || []).filter((_: any, i: number) => i !== sIdx);
                                                  currentChildren[cIdx] = {
                                                    ...targetChild,
                                                    data: { ...(targetChild.data || {}), children: currentSubList },
                                                  };
                                                  handleUpdateElementData(el.id, { children: currentChildren });
                                                  setSelectedSubItem(null);
                                                };

                                                const isSubSel = selectedSubItem?.parentBlockId === el.id && selectedSubItem?.childIndex === cIdx && selectedSubItem?.itemIndex === sIdx;

                                                if (subChild.type === 'Image') {
                                                  const subData = subChild.data || subChild;
                                                  const imgPadTop = subData.paddingTop !== undefined ? `${subData.paddingTop}px` : (subData.paddingY !== undefined ? `${subData.paddingY}px` : '0px');
                                                  const imgPadBottom = subData.paddingBottom !== undefined ? `${subData.paddingBottom}px` : (subData.paddingY !== undefined ? `${subData.paddingY}px` : '0px');
                                                  const imgPadLeft = subData.paddingLeft !== undefined ? `${subData.paddingLeft}px` : (subData.paddingX !== undefined ? `${subData.paddingX}px` : '0px');
                                                  const imgPadRight = subData.paddingRight !== undefined ? `${subData.paddingRight}px` : (subData.paddingX !== undefined ? `${subData.paddingX}px` : '0px');
                                                  const imgMarginTop = subData.marginTop !== undefined ? `${subData.marginTop}px` : '0px';
                                                  const imgMarginBottom = subData.marginBottom !== undefined ? `${subData.marginBottom}px` : '0px';

                                                  return (
                                                    <div
                                                      key={subChild.id || sIdx}
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedElementId(el.id);
                                                        setSelectedChildIndex(cIdx);
                                                        setSelectedSubItem({
                                                          blockId: `${el.id}-c${cIdx}`,
                                                          itemIndex: sIdx,
                                                          subType: 'image',
                                                          childIndex: cIdx,
                                                          parentBlockId: el.id,
                                                        });
                                                      }}
                                                      style={{
                                                        paddingTop: imgPadTop,
                                                        paddingBottom: imgPadBottom,
                                                        paddingLeft: imgPadLeft,
                                                        paddingRight: imgPadRight,
                                                        marginTop: imgMarginTop,
                                                        marginBottom: imgMarginBottom,
                                                      }}
                                                      className={`relative group/subimg w-full overflow-visible z-40 cursor-pointer transition-all ${
                                                        isSubSel ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-900' : 'hover:ring-1 hover:ring-amber-400/60'
                                                      }`}
                                                    >
                                                      {/* FLOATING HOVER TOOLBAR BADGE (SYSTEME.IO STYLE SCREEN 2) */}
                                                      <div
                                                        className={`hidden absolute -bottom-3.5 left-1/2 -translate-x-1/2 z-[999] transition-all duration-200 flex items-center shadow-xl font-sans text-xs ${
                                                          isSubSel ? 'opacity-100' : 'opacity-0 group-hover/subimg:opacity-100'
                                                        }`}
                                                      >
                                                        <div style={{ color: '#ffffff' }} className="bg-[#FF7A00] !text-white px-2 py-0.5 rounded-l font-extrabold text-[10px] uppercase flex items-center gap-1">
                                                          <span>Image</span>
                                                          <span>⬇️</span>
                                                        </div>
                                                        <div style={{ color: '#ffffff' }} className="bg-[#FF7A00] !text-white px-1 py-0.5 rounded-r flex items-center gap-1 border-l border-orange-300">
                                                          <button
                                                            type="button"
                                                            onClick={(e) => {
                                                              e.stopPropagation();
                                                              removeSubChild(e);
                                                            }}
                                                            className="p-0.5 hover:bg-black/20 rounded transition-colors"
                                                            title="Supprimer l image"
                                                          >
                                                            <Trash2 className="w-3.5 h-3.5 text-white" color="#ffffff" stroke="#ffffff" style={{ color: '#ffffff', stroke: '#ffffff' }} />
                                                          </button>
                                                        </div>
                                                      </div>

                                                      {/* RAW IMAGE WITH MOUSE DRAG-TO-PAN & SCROLL-ZOOM */}
                                                      <div
                                                        onMouseDown={(e) => {
                                                          const currentX = subChild.data?.posX !== undefined ? subChild.data.posX : 50;
                                                          const currentY = subChild.data?.posY !== undefined ? subChild.data.posY : 50;
                                                          handleImageMouseDown(e, currentX, currentY, (newX, newY) => {
                                                            updateSubChildData({ posX: newX, posY: newY });
                                                          });
                                                        }}
                                                        className="relative w-full h-full min-h-[140px] group/imgbox overflow-hidden cursor-grab active:cursor-grabbing select-none"
                                                      >
                                                        <img
                                                          src={subChild.data?.img || subChild.content || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80'}
                                                          alt="SubImage"
                                                          onMouseDown={(e) => {
                                                            const currentX = subChild.data?.posX !== undefined ? subChild.data.posX : 50;
                                                            const currentY = subChild.data?.posY !== undefined ? subChild.data.posY : 50;
                                                            handleImageMouseDown(e, currentX, currentY, (newX, newY) => {
                                                              updateSubChildData({ posX: newX, posY: newY });
                                                            });
                                                          }}
                                                          onDoubleClick={(e) => {
                                                            e.stopPropagation();
                                                            triggerImageFileUpload((base64Url) => {
                                                              updateSubChildData({ img: base64Url });
                                                            });
                                                          }}
                                                          onWheel={(e) => {
                                                            e.preventDefault();
                                                            const currZoom = subChild.data?.imgZoom || 100;
                                                            const nextZoom = Math.max(100, Math.min(300, currZoom + (e.deltaY < 0 ? 10 : -10)));
                                                            updateSubChildData({ imgZoom: nextZoom });
                                                          }}
                                                          style={{
                                                            objectFit: 'cover',
                                                            transform: `scale(${(subChild.data?.imgZoom || (subChild.imgZoom !== undefined ? subChild.imgZoom : 120)) / 100}) translate(${50 - (subChild.data?.posX !== undefined ? subChild.data.posX : (subChild.posX !== undefined ? subChild.posX : 50))}%, ${50 - (subChild.data?.posY !== undefined ? subChild.data.posY : (subChild.posY !== undefined ? subChild.posY : 50))}%)`,
                                                            ...renderBorderStyles(subChild.data || subChild),
                                                          }}
                                                          className="w-full h-full min-h-[140px] block cursor-grab active:cursor-grabbing select-none"
                                                        />
                                                        
                                                      </div>
                                                    </div>
                                                  );
                                                }

                                                return (
                                                  <div key={subChild.id || sIdx} className="relative group/subchild text-left py-1">
                                                    <div className="flex items-center justify-between opacity-0 group-hover/subchild:opacity-100 transition-opacity mb-1">
                                                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#00A0FF]">{subChild.type}</span>
                                                      <button
                                                        type="button"
                                                        onClick={(e) => removeSubChild(e)}
                                                        className="p-0.5 text-slate-400 hover:text-red-400 rounded transition-colors"
                                                        title="Supprimer l élément"
                                                      >
                                                        <Trash2 className="w-3 h-3" />
                                                      </button>
                                                    </div>

                                                    {subChild.type === 'Heading' ? (
                                                      <div
                                                        contentEditable
                                                        suppressContentEditableWarning
                                                        onMouseDown={(e) => e.stopPropagation()}
                                                        onPointerDown={(e) => e.stopPropagation()}
                                                        onDragStart={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                                        onContextMenu={(e) => handleOpenFormattingToolbar(e, el.id, cIdx, sIdx, subChild.content)}
                                                        onBlur={(e) => updateSubChildData({ content: e.currentTarget.innerHTML })}
                                                        onInput={(e) => updateSubChildData({ content: e.currentTarget.innerHTML })}
                                                        dangerouslySetInnerHTML={{ __html: subChild.content }}
                                                        style={{
                                                          color: subChild.data?.textColor || '#ffffff',
                                                          backgroundColor: subChild.data?.bgColor || 'transparent',
                                                          fontSize: subChild.data?.fontSize,
                                                          fontWeight: subChild.data?.fontWeight,
                                                          fontStyle: subChild.data?.fontStyle,
                                                          textDecoration: subChild.data?.textDecoration,
                                                        }}
                                                        className="w-full text-lg font-heading font-black bg-transparent border-b border-transparent focus:border-[#00A0FF] outline-none text-white select-text min-h-[30px]"
                                                      />
                                                    ) : subChild.type === 'ButtonCTA' ? (
                                                      <div className="text-center py-1">
                                                        <button type="button" className="px-6 py-2 bg-[#00A0FF] text-white font-bold text-xs rounded-lg shadow-md">
                                                          {subChild.content || 'Bouton CTA'}
                                                        </button>
                                                      </div>
                                                    ) : subChild.type === 'FormInput' ? (
                                                      <div className="space-y-1">
                                                        <label className="text-[10px] font-bold text-slate-300 block">{subChild.data?.title || 'Champ de formulaire'}</label>
                                                        <input
                                                          type="text"
                                                          disabled
                                                          placeholder={subChild.data?.placeholder || subChild.content || 'votre.email@exemple.com'}
                                                          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-400"
                                                        />
                                                      </div>
                                                    ) : (
                                                      <div
                                                        contentEditable
                                                        suppressContentEditableWarning
                                                        onMouseDown={(e) => e.stopPropagation()}
                                                        onPointerDown={(e) => e.stopPropagation()}
                                                        onDragStart={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                                        onContextMenu={(e) => handleOpenFormattingToolbar(e, el.id, cIdx, sIdx, subChild.content)}
                                                        onBlur={(e) => updateSubChildData({ content: e.currentTarget.innerHTML })}
                                                        onInput={(e) => updateSubChildData({ content: e.currentTarget.innerHTML })}
                                                        dangerouslySetInnerHTML={{ __html: subChild.content }}
                                                        style={{
                                                          color: subChild.data?.textColor || '#e2e8f0',
                                                          backgroundColor: subChild.data?.bgColor || 'transparent',
                                                          fontSize: subChild.data?.fontSize,
                                                          fontWeight: subChild.data?.fontWeight,
                                                          fontStyle: subChild.data?.fontStyle,
                                                          textDecoration: subChild.data?.textDecoration,
                                                        }}
                                                        className="w-full text-xs leading-relaxed bg-transparent border border-transparent focus:border-[#00A0FF] outline-none text-slate-200 select-text min-h-[30px]"
                                                      />
                                                    )}
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          )}
                                        </div>
                                      )}

                                      {child.type === 'ButtonCTA' && (
                                        <div className="text-center pt-2">
                                          <button type="button" className="px-8 py-3 bg-[#00A0FF] text-white font-bold text-xs rounded-xl shadow-lg">
                                            {child.content || child.data?.buttonText || 'Bouton d action'}
                                          </button>
                                        </div>
                                      )}
                                      {child.type === 'FormInput' && (
                                        <div className="max-w-md mx-auto space-y-1 text-left">
                                          <label className="text-[10px] font-bold text-slate-300 block">{child.data?.title || 'Champ de formulaire'}</label>
                                          <input
                                            type="text"
                                            disabled
                                            placeholder={child.data?.placeholder || child.content || 'votre.email@exemple.com'}
                                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-400"
                                          />
                                        </div>
                                      )}

                                    </div>
                                    </div>

                                    {/* VERTICAL SEAM RESIZER BETWEEN ADJACENT DIVS MATCHING SCREEN 2 */}
                                     {cIdx < childrenList.length - 1 && (
                                       <div
                                         onMouseDown={(e) => handleStartColWidthResize(e, el.id, cIdx, sectionContainerRefs.current[el.id])}
                                         className="w-4 -mx-2 cursor-col-resize z-40 flex flex-col items-center justify-center group/colseam self-stretch transition-all select-none relative"
                                         title="Cliquer-glisser la bordure pour ajuster la largeur des colonnes"
                                       >
                                         {/* Subtle seam line */}
                                         <div className="w-px h-full bg-slate-700/40 group-hover/colseam:bg-[#00A0FF]/60 transition-colors" />
                                         
                                         {/* Small blue grip handle notch in the center (Screen 2) */}
                                         <div className="absolute top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#00A0FF] group-hover/colseam:w-2 group-hover/colseam:h-7 rounded-sm shadow-md transition-all border border-white/30" />
                                       </div>
                                     )}
                                  </React.Fragment>
                                ))}
                              </div>
                            );
                          })()}
                        </div>
                        {/* NATURAL CLICK-AND-DRAG BOTTOM BORDER FOR SECTION HEIGHT RESIZING */}
                        <div
                          onMouseDown={(e) => handleStartSectionResize(e, el.id)}
                          className="absolute -bottom-2 left-0 right-0 h-4 cursor-ns-resize z-40 group/secborder flex items-center justify-center select-none"
                          title="Cliquer-glisser la bordure inférieure pour ajuster la hauteur"
                        >
                          <div className="w-full h-1 group-hover/secborder:h-1.5 bg-transparent group-hover/secborder:bg-[#00A0FF] transition-all shadow-md" />
                        </div>
                      </div>
                      );
                    })()}

                    {/* RICH DYNAMIC PRE-FILLED FEATURE BLOCKS RENDERERS WITH CLICK-TO-EDIT SUB-ITEMS */}
                    {(el.type === 'BlockFeat4ColImg') && (() => {
                      const mainBg = el.data?.bgColor || '#ffffff';
                      const cardBg = el.data?.cardBgColor || 'transparent';
                      const textColor = el.data?.textColor || '#0f172a';

                      return (
                        <div
                          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                          onDrop={(e) => handleBlockDrop(e, el.id)}
                          style={{ backgroundColor: mainBg, color: textColor }}
                          className="space-y-4 p-6 rounded-3xl shadow-xl relative transition-all"
                        >
                          <div className="text-center">
                            <input
                              type="text"
                              value={el.data?.title || el.content || 'BASES ET NUTRITION'}
                              onChange={(e) => {
                                const val = e.target.value;
                                handleUpdateElementData(el.id, { title: val });
                                handleUpdateElementContent(el.id, val);
                              }}
                              style={{ color: textColor }}
                              className="w-full text-center text-xl font-heading font-black bg-transparent border-b border-transparent focus:border-[#00A0FF] outline-none rounded-lg px-2 py-1"
                              placeholder="Titre de la section..."
                            />
                          </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 items-start relative">
                          {(el.data?.items || [
                            { id: '1', title: 'BASES', img: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=400&q=80', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit integer sed.' },
                            { id: '2', title: 'CUISINER', img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit integer sed.' },
                            { id: '3', title: 'EXTÉRIEUR', img: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=400&q=80', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit integer sed.' },
                            { id: '4', title: 'DRESSAGE', img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit integer sed.' },
                          ]).map((col: any, i: number) => {
                            const isImgSel = selectedSubItem?.blockId === el.id && selectedSubItem?.itemIndex === i && selectedSubItem?.subType === 'image';
                            const isTitleSel = selectedSubItem?.blockId === el.id && selectedSubItem?.itemIndex === i && selectedSubItem?.subType === 'title';
                            const isDescSel = selectedSubItem?.blockId === el.id && selectedSubItem?.itemIndex === i && selectedSubItem?.subType === 'desc';

                            const imgHeight = col.imgHeight || el.data?.imgHeight || (col.imgSize ? `${col.imgSize}px` : '280px');
                            const imgShape = col.imgShape || el.data?.imgShape || 'arcade';
                            const borderRadius =
                              col.borderRadius !== undefined && col.borderRadius !== 16
                                ? `${col.borderRadius}px`
                                : imgShape === 'arcade'
                                ? '80px 80px 16px 16px'
                                : imgShape === 'circle'
                                ? '9999px'
                                : imgShape === 'square'
                                ? '0px'
                                : '24px';
                            const imgFit = col.imgObjectFit || el.data?.imgObjectFit || col.objectFit || 'cover';
                            const imgPos = col.imgObjectPosition || el.data?.imgObjectPosition || 'center';

                            return (
                              <div key={col.id || i} className="flex flex-col items-center text-center space-y-3 relative group/col">
                                  {/* CLICKABLE & DROPPABLE IMAGE CONTAINER */}
                                  <div className="relative flex justify-center w-full">
                                    <div
                                      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                      onDrop={(e) => handleCardDrop(e, el.id, i)}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSnapGuide(null);
                                        setSelectedElementId(el.id);
                                        setSelectedSubItem({ blockId: el.id, itemIndex: i, subType: 'image' });
                                      }}
                                      className={`relative overflow-hidden shadow-md transition-all cursor-pointer ${
                                        imgHeight.startsWith('h-') ? imgHeight : ''
                                      } ${
                                        isImgSel
                                          ? 'ring-4 ring-[#00A0FF] ring-offset-2 scale-[1.02] shadow-2xl'
                                          : 'hover:ring-4 hover:ring-[#00A0FF]/60'
                                      }`}
                                      style={{
                                        width: col.imgWidth ? `${col.imgWidth}px` : '100%',
                                        maxWidth: '100%',
                                        height: imgHeight.startsWith('h-') ? undefined : imgHeight,
                                        borderRadius,
                                      }}
                                    >
                                      <img
                                        src={col.img}
                                        alt={col.alt || col.title}
                                        className="w-full h-full transition-transform duration-100 select-none pointer-events-none"
                                        style={{
                                          objectFit: (imgFit as any) || 'cover',
                                          objectPosition: imgPos.includes('%') ? imgPos : `${col.posX !== undefined ? col.posX : 50}% ${col.posY !== undefined ? col.posY : 50}%`,
                                          transform: `scale(${(col.imgZoom || 100) / 100})`,
                                        }}
                                      />

                                    {/* CLEAN DOT-FREE FRAME DRAG ZONES (4 CORNERS + 4 EDGES) */}
                                    {isImgSel && (
                                      <>
                                        {/* 1. TOP-LEFT CORNER DRAG ZONE */}
                                        <div
                                          onMouseDown={(e) => handleStartSubItemResize(e, el.id, i, 'corner-tl')}
                                          className="absolute top-0 left-0 w-6 h-6 cursor-nwse-resize z-30 hover:bg-[#00A0FF]/30 rounded-tl-lg transition-colors"
                                          title="Tirer pour redimensionner proportionnellement"
                                        />
                                        {/* 2. TOP-RIGHT CORNER DRAG ZONE */}
                                        <div
                                          onMouseDown={(e) => handleStartSubItemResize(e, el.id, i, 'corner-tr')}
                                          className="absolute top-0 right-0 w-6 h-6 cursor-nesw-resize z-30 hover:bg-[#00A0FF]/30 rounded-tr-lg transition-colors"
                                          title="Tirer pour redimensionner proportionnellement"
                                        />
                                        {/* 3. BOTTOM-LEFT CORNER DRAG ZONE */}
                                        <div
                                          onMouseDown={(e) => handleStartSubItemResize(e, el.id, i, 'corner-bl')}
                                          className="absolute bottom-0 left-0 w-6 h-6 cursor-nesw-resize z-30 hover:bg-[#00A0FF]/30 rounded-bl-lg transition-colors"
                                          title="Tirer pour redimensionner proportionnellement"
                                        />
                                        {/* 4. BOTTOM-RIGHT CORNER DRAG ZONE */}
                                        <div
                                          onMouseDown={(e) => handleStartSubItemResize(e, el.id, i, 'corner-br')}
                                          className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize z-30 hover:bg-[#00A0FF]/30 rounded-br-lg transition-colors"
                                          title="Tirer pour redimensionner proportionnellement"
                                        />
                                        {/* 5. TOP EDGE DRAG ZONE */}
                                        <div
                                          onMouseDown={(e) => handleStartSubItemResize(e, el.id, i, 'edge-t')}
                                          className="absolute top-0 left-6 right-6 h-3 cursor-ns-resize z-30 hover:bg-[#00A0FF]/20 transition-colors"
                                          title="Tirer le bord supérieur"
                                        />
                                        {/* 6. BOTTOM EDGE DRAG ZONE */}
                                        <div
                                          onMouseDown={(e) => handleStartSubItemResize(e, el.id, i, 'edge-b')}
                                          className="absolute bottom-0 left-6 right-6 h-3 cursor-ns-resize z-30 hover:bg-[#00A0FF]/20 transition-colors"
                                          title="Tirer le bord inférieur"
                                        />
                                        {/* 7. LEFT EDGE DRAG ZONE */}
                                        <div
                                          onMouseDown={(e) => handleStartSubItemResize(e, el.id, i, 'edge-l')}
                                          className="absolute top-6 bottom-6 left-0 w-3 cursor-ew-resize z-30 hover:bg-[#00A0FF]/20 transition-colors"
                                          title="Tirer le bord gauche"
                                        />
                                        {/* 8. RIGHT EDGE DRAG ZONE */}
                                        <div
                                          onMouseDown={(e) => handleStartSubItemResize(e, el.id, i, 'edge-r')}
                                          className="absolute top-6 bottom-6 right-0 w-3 cursor-ew-resize z-30 hover:bg-[#00A0FF]/20 transition-colors"
                                          title="Tirer le bord droit"
                                        />
                                      </>
                                    )}
                                  </div>


                                </div>

                                {/* INLINE LIVE EDITABLE TITLE ON CANVAS */}
                                <input
                                  type="text"
                                  value={col.title || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const updatedItems = (el.data?.items || getDefaultBlockData(el.type, el.content).items).map((it: any, idx: number) =>
                                      idx === i ? { ...it, title: val } : it
                                    );
                                    handleUpdateElementData(el.id, { items: updatedItems });
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedElementId(el.id);
                                    setSelectedSubItem({ blockId: el.id, itemIndex: i, subType: 'title' });
                                  }}
                                  className={`w-full text-center font-heading font-black text-base tracking-wider uppercase transition-all rounded-lg px-2 py-1 outline-none ${
                                    isTitleSel
                                      ? 'ring-2 ring-[#00A0FF] bg-blue-50/90 text-[#00A0FF] shadow-sm'
                                      : 'text-slate-900 bg-transparent hover:bg-slate-100/80 focus:bg-white focus:ring-2 focus:ring-[#00A0FF]'
                                  }`}
                                  placeholder="Titre..."
                                />

                                {/* INLINE LIVE EDITABLE PARAGRAPH DESCRIPTION ON CANVAS */}
                                <textarea
                                  value={col.desc || ''}
                                  rows={3}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const updatedItems = (el.data?.items || getDefaultBlockData(el.type, el.content).items).map((it: any, idx: number) =>
                                      idx === i ? { ...it, desc: val } : it
                                    );
                                    handleUpdateElementData(el.id, { items: updatedItems });
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedElementId(el.id);
                                    setSelectedSubItem({ blockId: el.id, itemIndex: i, subType: 'desc' });
                                  }}
                                  className={`w-full text-center text-xs leading-relaxed font-medium transition-all rounded-lg p-1.5 outline-none resize-none overflow-hidden ${
                                    isDescSel
                                      ? 'ring-2 ring-[#00A0FF] bg-blue-50/90 text-slate-900 font-bold shadow-sm'
                                      : 'text-slate-500 bg-transparent hover:bg-slate-100/80 focus:bg-white focus:text-slate-900 focus:ring-2 focus:ring-[#00A0FF]'
                                  }`}
                                  placeholder="Description..."
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {(el.type === 'BlockFeat3ColImg') && (() => {
                    const mainBg = el.data?.bgColor || '#ffffff';
                    const cardBg = el.data?.cardBgColor || 'transparent';
                    const textColor = el.data?.textColor || '#0f172a';

                    return (
                      <div
                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        onDrop={(e) => handleBlockDrop(e, el.id)}
                        style={{ backgroundColor: mainBg, color: textColor }}
                        className="p-6 rounded-3xl shadow-xl space-y-6 relative transition-all"
                      >
                        <div className="text-center space-y-1">
                          <input
                            type="text"
                            value={el.data?.subtitle || 'CE QUE VOUS OBTENEZ'}
                            onChange={(e) => handleUpdateElementData(el.id, { subtitle: e.target.value })}
                            className="w-full text-center text-[10px] font-black text-[#00A0FF] uppercase tracking-widest bg-transparent border-b border-transparent focus:border-[#00A0FF] outline-none"
                            placeholder="Sous-titre..."
                          />
                          <input
                            type="text"
                            value={el.data?.title || el.content || 'Le Savoir-Faire des Experts à Votre Portée'}
                            onChange={(e) => {
                              const val = e.target.value;
                              handleUpdateElementData(el.id, { title: val });
                              handleUpdateElementContent(el.id, val);
                            }}
                            className="w-full text-center text-xl font-heading font-black text-slate-900 bg-transparent border-b border-transparent focus:border-[#00A0FF] outline-none rounded-lg px-2 py-1"
                            placeholder="Titre de la section..."
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                          {(el.data?.items || [
                            { id: '1', title: 'Le savoir des experts', img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80', desc: 'Accédez à des connaissances approfondies et testées sur le terrain.' },
                            { id: '2', title: 'Des leçons pratiques', img: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=400&q=80', desc: 'Des exercices concrets pour passer immédiatement à l action.' },
                            { id: '3', title: 'Nouvelles relations', img: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=400&q=80', desc: 'Rejoignez un réseau actif d entrepreneurs passionnés.' },
                          ]).map((col: any, i: number) => {
                            const isImgSel = selectedSubItem?.blockId === el.id && selectedSubItem?.itemIndex === i && selectedSubItem?.subType === 'image';
                            const isTitleSel = selectedSubItem?.blockId === el.id && selectedSubItem?.itemIndex === i && selectedSubItem?.subType === 'title';
                            const isDescSel = selectedSubItem?.blockId === el.id && selectedSubItem?.itemIndex === i && selectedSubItem?.subType === 'desc';

                            const imgHeight = col.imgHeight || el.data?.imgHeight || (col.imgSize ? `${col.imgSize}px` : '220px');
                            const imgShape = col.imgShape || el.data?.imgShape || 'arcade';
                            const borderRadius =
                              col.borderRadius !== undefined && col.borderRadius !== 16
                                ? `${col.borderRadius}px`
                                : imgShape === 'arcade'
                                ? '80px 80px 16px 16px'
                                : imgShape === 'circle'
                                ? '9999px'
                                : imgShape === 'square'
                                ? '0px'
                                : '24px';
                            const imgFit = col.imgObjectFit || el.data?.imgObjectFit || col.objectFit || 'cover';
                            const imgPos = col.imgObjectPosition || el.data?.imgObjectPosition || 'center';

                            return (
                              <div key={col.id || i} className="space-y-3">
                                <div className="relative flex justify-center w-full">
                                  <div
                                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                    onDrop={(e) => handleCardDrop(e, el.id, i)}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedElementId(el.id);
                                      setSelectedSubItem({ blockId: el.id, itemIndex: i, subType: 'image' });
                                    }}
                                    className={`relative overflow-hidden shadow-sm transition-all cursor-pointer ${
                                      imgHeight.startsWith('h-') ? imgHeight : ''
                                    } ${
                                      isImgSel
                                        ? 'ring-4 ring-[#00A0FF] ring-offset-2 scale-[1.02] shadow-2xl'
                                        : 'hover:ring-4 hover:ring-[#00A0FF]/60'
                                    }`}
                                    style={{
                                      width: col.imgWidth ? `${col.imgWidth}px` : '100%',
                                      maxWidth: '100%',
                                      height: imgHeight.startsWith('h-') ? undefined : imgHeight,
                                      borderRadius,
                                    }}
                                  >
                                    <img
                                      src={col.img}
                                      alt={col.alt || col.title}
                                      className="w-full h-full transition-transform duration-100 select-none pointer-events-none"
                                      style={{
                                        objectFit: (imgFit as any) || 'cover',
                                        objectPosition: imgPos.includes('%') ? imgPos : `${col.posX !== undefined ? col.posX : 50}% ${col.posY !== undefined ? col.posY : 50}%`,
                                        transform: `scale(${(col.imgZoom || 100) / 100})`,
                                      }}
                                    />

                                    {/* CLEAN DOT-FREE FRAME DRAG ZONES (4 CORNERS + 4 EDGES) */}
                                    {isImgSel && (
                                      <>
                                        {/* 1. TOP-LEFT CORNER DRAG ZONE */}
                                        <div
                                          onMouseDown={(e) => handleStartSubItemResize(e, el.id, i, 'corner-tl')}
                                          className="absolute top-0 left-0 w-6 h-6 cursor-nwse-resize z-30 hover:bg-[#00A0FF]/30 rounded-tl-lg transition-colors"
                                          title="Tirer pour redimensionner proportionnellement"
                                        />
                                        {/* 2. TOP-RIGHT CORNER DRAG ZONE */}
                                        <div
                                          onMouseDown={(e) => handleStartSubItemResize(e, el.id, i, 'corner-tr')}
                                          className="absolute top-0 right-0 w-6 h-6 cursor-nesw-resize z-30 hover:bg-[#00A0FF]/30 rounded-tr-lg transition-colors"
                                          title="Tirer pour redimensionner proportionnellement"
                                        />
                                        {/* 3. BOTTOM-LEFT CORNER DRAG ZONE */}
                                        <div
                                          onMouseDown={(e) => handleStartSubItemResize(e, el.id, i, 'corner-bl')}
                                          className="absolute bottom-0 left-0 w-6 h-6 cursor-nesw-resize z-30 hover:bg-[#00A0FF]/30 rounded-bl-lg transition-colors"
                                          title="Tirer pour redimensionner proportionnellement"
                                        />
                                        {/* 4. BOTTOM-RIGHT CORNER DRAG ZONE */}
                                        <div
                                          onMouseDown={(e) => handleStartSubItemResize(e, el.id, i, 'corner-br')}
                                          className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize z-30 hover:bg-[#00A0FF]/30 rounded-br-lg transition-colors"
                                          title="Tirer pour redimensionner proportionnellement"
                                        />
                                        {/* 5. TOP EDGE DRAG ZONE */}
                                        <div
                                          onMouseDown={(e) => handleStartSubItemResize(e, el.id, i, 'edge-t')}
                                          className="absolute top-0 left-6 right-6 h-3 cursor-ns-resize z-30 hover:bg-[#00A0FF]/20 transition-colors"
                                          title="Tirer le bord supérieur"
                                        />
                                        {/* 6. BOTTOM EDGE DRAG ZONE */}
                                        <div
                                          onMouseDown={(e) => handleStartSubItemResize(e, el.id, i, 'edge-b')}
                                          className="absolute bottom-0 left-6 right-6 h-3 cursor-ns-resize z-30 hover:bg-[#00A0FF]/20 transition-colors"
                                          title="Tirer le bord inférieur"
                                        />
                                        {/* 7. LEFT EDGE DRAG ZONE */}
                                        <div
                                          onMouseDown={(e) => handleStartSubItemResize(e, el.id, i, 'edge-l')}
                                          className="absolute top-6 bottom-6 left-0 w-3 cursor-ew-resize z-30 hover:bg-[#00A0FF]/20 transition-colors"
                                          title="Tirer le bord gauche"
                                        />
                                        {/* 8. RIGHT EDGE DRAG ZONE */}
                                        <div
                                          onMouseDown={(e) => handleStartSubItemResize(e, el.id, i, 'edge-r')}
                                          className="absolute top-6 bottom-6 right-0 w-3 cursor-ew-resize z-30 hover:bg-[#00A0FF]/20 transition-colors"
                                          title="Tirer le bord droit"
                                        />
                                      </>
                                    )}
                                  </div>


                                </div>
                                {/* INLINE LIVE EDITABLE TITLE ON CANVAS */}
                                <input
                                  type="text"
                                  value={col.title || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const updatedItems = (el.data?.items || getDefaultBlockData(el.type, el.content).items).map((it: any, idx: number) =>
                                      idx === i ? { ...it, title: val } : it
                                    );
                                    handleUpdateElementData(el.id, { items: updatedItems });
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedElementId(el.id);
                                    setSelectedSubItem({ blockId: el.id, itemIndex: i, subType: 'title' });
                                  }}
                                  className={`w-full text-center font-heading font-black text-sm tracking-wider uppercase transition-all rounded-lg px-2 py-1 outline-none ${
                                    isTitleSel
                                      ? 'ring-2 ring-[#00A0FF] bg-blue-50/90 text-[#00A0FF] shadow-sm'
                                      : 'text-slate-900 bg-transparent hover:bg-slate-100/80 focus:bg-white focus:ring-2 focus:ring-[#00A0FF]'
                                  }`}
                                  placeholder="Titre..."
                                />

                                {/* INLINE LIVE EDITABLE PARAGRAPH DESCRIPTION ON CANVAS */}
                                <textarea
                                  value={col.desc || ''}
                                  rows={3}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const updatedItems = (el.data?.items || getDefaultBlockData(el.type, el.content).items).map((it: any, idx: number) =>
                                      idx === i ? { ...it, desc: val } : it
                                    );
                                    handleUpdateElementData(el.id, { items: updatedItems });
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedElementId(el.id);
                                    setSelectedSubItem({ blockId: el.id, itemIndex: i, subType: 'desc' });
                                  }}
                                  className={`w-full text-center text-xs leading-relaxed font-medium transition-all rounded-lg p-1.5 outline-none resize-none overflow-hidden ${
                                    isDescSel
                                      ? 'ring-2 ring-[#00A0FF] bg-blue-50/90 text-slate-900 font-bold shadow-sm'
                                      : 'text-slate-500 bg-transparent hover:bg-slate-100/80 focus:bg-white focus:text-slate-900 focus:ring-2 focus:ring-[#00A0FF]'
                                  }`}
                                  placeholder="Description..."
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {(el.type === 'BlockFeat2ColIconsLeft' || el.type === 'Col2') && (() => {
                    const mainBg = el.data?.bgColor || '#ffffff';
                    const cardBg = el.data?.cardBgColor || '#f8fafc';
                    const textColor = el.data?.textColor || '#0f172a';

                    return (
                      <div
                        style={{ backgroundColor: mainBg, color: textColor }}
                        className="p-6 rounded-3xl shadow-xl space-y-6"
                      >
                        <div className="text-center">
                          <input
                            type="text"
                            value={el.data?.title || el.content || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              handleUpdateElementData(el.id, { title: val });
                              handleUpdateElementContent(el.id, val);
                            }}
                            className="w-full text-center text-xl font-heading font-black text-slate-900 bg-transparent border-b border-transparent focus:border-[#00A0FF] outline-none rounded-lg px-2 py-1"
                            placeholder="Titre de la section..."
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {(el.data?.items || getDefaultBlockData(el.type, el.content).items).map((item: any, i: number) => (
                            <div key={item.id || i} className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                              <div className="w-10 h-10 rounded-xl bg-[#00A0FF]/10 text-[#00A0FF] flex items-center justify-center shrink-0 font-bold">
                                ✓
                              </div>
                              <div className="flex-1 space-y-1">
                                <input
                                  type="text"
                                  value={item.title || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const items = (el.data?.items || getDefaultBlockData(el.type, el.content).items).map((it: any, idx: number) =>
                                      idx === i ? { ...it, title: val } : it
                                    );
                                    handleUpdateElementData(el.id, { items });
                                  }}
                                  className="w-full font-heading font-extrabold text-sm text-slate-900 bg-transparent border-b border-transparent focus:border-[#00A0FF] outline-none"
                                  placeholder="Titre..."
                                />
                                <textarea
                                  value={item.desc || ''}
                                  rows={2}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const items = (el.data?.items || getDefaultBlockData(el.type, el.content).items).map((it: any, idx: number) =>
                                      idx === i ? { ...it, desc: val } : it
                                    );
                                    handleUpdateElementData(el.id, { items });
                                  }}
                                  className="w-full text-xs text-slate-500 bg-transparent border border-transparent focus:border-[#00A0FF] outline-none resize-none"
                                  placeholder="Description..."
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                    {el.type === 'BlockFeat4ColDark' && (
                      <div className="p-8 bg-slate-950 text-white rounded-3xl border border-slate-800 space-y-6 shadow-2xl">
                        <div className="text-center space-y-2">
                          <input
                            type="text"
                            value={el.data?.title || el.content || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              handleUpdateElementData(el.id, { title: val });
                              handleUpdateElementContent(el.id, val);
                            }}
                            className="w-full text-center text-2xl font-heading font-black text-white bg-transparent border-b border-transparent focus:border-[#00A0FF] outline-none rounded-lg px-2 py-1"
                            placeholder="Titre..."
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          {(el.data?.items || getDefaultBlockData(el.type, el.content).items).map((item: any, i: number) => (
                            <div key={item.id || i} className="p-5 bg-slate-900 rounded-2xl border border-slate-800 text-center space-y-2">
                              <div className="w-10 h-10 rounded-xl bg-[#00A0FF]/20 text-[#00A0FF] flex items-center justify-center mx-auto font-black text-sm">
                                {i + 1}
                              </div>
                              <input
                                type="text"
                                value={item.title || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const items = (el.data?.items || getDefaultBlockData(el.type, el.content).items).map((it: any, idx: number) =>
                                    idx === i ? { ...it, title: val } : it
                                  );
                                  handleUpdateElementData(el.id, { items });
                                }}
                                className="w-full text-center font-heading font-black text-sm text-white bg-transparent border-b border-transparent focus:border-[#00A0FF] outline-none"
                                placeholder="Titre..."
                              />
                              <textarea
                                value={item.desc || ''}
                                rows={2}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const items = (el.data?.items || getDefaultBlockData(el.type, el.content).items).map((it: any, idx: number) =>
                                    idx === i ? { ...it, desc: val } : it
                                  );
                                  handleUpdateElementData(el.id, { items });
                                }}
                                className="w-full text-center text-xs text-slate-400 bg-transparent border border-transparent focus:border-[#00A0FF] outline-none resize-none"
                                placeholder="Description..."
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* DEFAULT FALLBACK RENDERER FOR UNHANDLED CUSTOM BLOCKS */}
                    {!['Heading', 'Text', 'BulletList', 'Image', 'OptinForm', 'FormInput', 'ButtonCTA', 'Checkbox', 'Video', 'Audio', 'Countdown', 'Divider', 'Section', 'BlockSectionFull', 'ContentBox', 'BlockFeat4ColImg', 'BlockFeat3ColImg', 'BlockFeat2ColIconsLeft', 'BlockFeat4ColDark', 'Col4', 'Col3', 'Col2', 'BlockNavArizona', 'BlockHeroArizona', 'BlockBioArizona', 'BlockSoulSistersArizona', 'Block3ColArcadeArizona'].includes(el.type) && (
                      <div className="p-6 bg-white text-slate-900 rounded-none shadow-xl space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-none bg-[#00A0FF]/20 text-[#00A0FF] flex items-center justify-center font-bold text-xs">
                            📦
                          </div>
                          <input
                            type="text"
                            value={el.data?.title || el.content || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              handleUpdateElementData(el.id, { title: val });
                              handleUpdateElementContent(el.id, val);
                            }}
                            className="w-full font-heading font-black text-base text-slate-900 bg-transparent border-b border-transparent focus:border-[#00A0FF] outline-none"
                            placeholder="Nom du bloc..."
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {(el.data?.items && el.data.items.length > 0 ? el.data.items : []).map((item: any, i: number) => (
                            <div key={item.id || i} className="p-4 bg-slate-50 rounded-none border border-slate-200 space-y-1">
                              <input
                                type="text"
                                value={item.title || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const currentItems = el.data?.items || [
                                    { id: '1', title: 'Élément #1', desc: 'Description pré-remplie' },
                                    { id: '2', title: 'Élément #2', desc: 'Description pré-remplie' },
                                    { id: '3', title: 'Élément #3', desc: 'Description pré-remplie' },
                                  ];
                                  const items = currentItems.map((it: any, idx: number) =>
                                    idx === i ? { ...it, title: val } : it
                                  );
                                  handleUpdateElementData(el.id, { items });
                                }}
                                className="w-full font-bold text-xs text-slate-900 bg-transparent border-b border-transparent focus:border-[#00A0FF] outline-none"
                                placeholder="Titre..."
                              />
                              <textarea
                                value={item.desc || ''}
                                rows={2}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const currentItems = el.data?.items || [
                                    { id: '1', title: 'Élément #1', desc: 'Description pré-remplie' },
                                    { id: '2', title: 'Élément #2', desc: 'Description pré-remplie' },
                                    { id: '3', title: 'Élément #3', desc: 'Description pré-remplie' },
                                  ];
                                  const items = currentItems.map((it: any, idx: number) =>
                                    idx === i ? { ...it, desc: val } : it
                                  );
                                  handleUpdateElementData(el.id, { items });
                                }}
                                className="w-full text-[11px] text-slate-500 bg-transparent border border-transparent focus:border-[#00A0FF] outline-none resize-none"
                                placeholder="Description..."
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>

                  {/* INTER-ELEMENT DROP ZONE FOR FLUID REORDERING */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDragOverIndex(idx + 1);
                    }}
                    onDragLeave={() => setDragOverIndex(null)}
                    onDrop={(e) => {
                      e.stopPropagation();
                      handleCanvasDrop(e, idx + 1);
                    }}
                    className={`transition-all rounded-xl cursor-pointer flex items-center justify-center gap-2 font-bold text-xs ${
                      dragOverIndex === idx + 1
                        ? 'h-12 my-2 bg-[#00A0FF]/20 border-2 border-dashed border-[#00A0FF] text-[#00A0FF] shadow-lg ring-4 ring-[#00A0FF]/30 scale-[1.01]'
                        : 'h-0 m-0 p-0 border-0 overflow-hidden opacity-0'
                    }`}
                  >
                    {dragOverIndex === idx + 1 && (
                      <>
                        <span>📍</span>
                        <span>✨ Relâcher pour insérer ici (Position #{idx + 2})</span>
                      </>
                    )}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
      {renderFloatingToolbar()}
    </div>
  </div>
);
}