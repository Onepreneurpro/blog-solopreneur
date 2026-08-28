'use client';

import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Undo,
  Redo,
  Bold,
  Italic,
  Underline,
  Highlighter,
  Type,
  Palette,
  Eraser,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  Video,
  Code,
  Minus,
  Table as TableIcon,
  Sparkles,
  Eye,
  Edit3,
  Trash2,
  PlusCircle,
  Check,
  X,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
}

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'editor'>('preview');
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Floating Context Menu state
  const [bubbleMenu, setBubbleMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
  }>({ visible: false, x: 0, y: 0 });

  // Saved range for restoring selection when clicking modal inputs
  const savedRangeRef = useRef<Range | null>(null);

  // Link form state
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  // Image form state
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');

  // Underline thickness & offset state
  const [underlineThickness, setUnderlineThickness] = useState('3px');
  const [underlineOffset, setUnderlineOffset] = useState('0px');

  // Color popovers state (separated for sticky toolbar vs floating bubble menu)
  const [openStickyPopover, setOpenStickyPopover] = useState<'underline' | 'text' | 'neon' | null>(null);
  const [openBubblePopover, setOpenBubblePopover] = useState<'underline' | 'text' | 'neon' | null>(null);

  // Close color popovers when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.color-popover-container')) {
        setOpenStickyPopover(null);
        setOpenBubblePopover(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const underlineColors = [
    { label: 'Vert Néon', color: '#a3e635' },
    { label: 'Jaune Fluo', color: '#facc15' },
    { label: 'Cyan Fluo', color: '#22d3ee' },
    { label: 'Violet Électrique', color: '#a855f7' },
    { label: 'Bleu Vif', color: '#3b82f6' },
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

  // Video form state
  const [videoUrl, setVideoUrl] = useState('');

  // Lead lists & campaigns state for opt-in block hydration
  const [leadLists, setLeadLists] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Synchronize visual editor innerHTML when switching tabs or initial load
  useEffect(() => {
    if (visualRef.current && activeTab === 'preview') {
      if (visualRef.current.innerHTML !== value) {
        visualRef.current.innerHTML = value || '<p>Rédigez ou collez votre contenu ici...</p>';
      }
    }
  }, [value, activeTab]);

  const handleVisualInput = () => {
    if (visualRef.current) {
      onChange(visualRef.current.innerHTML);
    }
  };

  // Save selection before opening modal
  const saveSelection = () => {
    if (typeof window !== 'undefined') {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        savedRangeRef.current = sel.getRangeAt(0).cloneRange();
      }
    }
  };

  // Restore selection when inserting from modal
  const restoreSelection = () => {
    if (savedRangeRef.current && typeof window !== 'undefined') {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedRangeRef.current);
      }
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (activeTab !== 'preview') return;
    saveSelection();
    const initialX = Math.max(16, Math.min(window.innerWidth - 760, e.clientX - 300));
    setBubbleMenu({
      visible: true,
      x: initialX,
      y: Math.max(10, e.clientY - 60),
    });
  };

  // Dynamically clamp floating bubble menu within visible screen boundaries
  useLayoutEffect(() => {
    if (bubbleMenu.visible) {
      const bubbleEl = document.getElementById('floating-bubble-menu');
      if (bubbleEl) {
        const rect = bubbleEl.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        let adjustedX = bubbleMenu.x;

        if (adjustedX + rect.width > viewportWidth - 16) {
          adjustedX = Math.max(16, viewportWidth - rect.width - 16);
        }
        if (adjustedX < 16) {
          adjustedX = 16;
        }

        if (adjustedX !== bubbleMenu.x) {
          setBubbleMenu((prev) => ({ ...prev, x: adjustedX }));
        }
      }
    }
  }, [bubbleMenu.visible, bubbleMenu.x]);

  // Hide bubble menu on window scroll/click outside
  useEffect(() => {
    const handleScrollOrClickOutside = (e: Event) => {
      const bubbleEl = document.getElementById('floating-bubble-menu');
      if (bubbleEl && bubbleEl.contains(e.target as Node)) return;
      setBubbleMenu((prev) => ({ ...prev, visible: false }));
    };
    window.addEventListener('mousedown', handleScrollOrClickOutside);
    window.addEventListener('scroll', handleScrollOrClickOutside, true);
    return () => {
      window.removeEventListener('mousedown', handleScrollOrClickOutside);
      window.removeEventListener('scroll', handleScrollOrClickOutside, true);
    };
  }, []);

  // Handle direct PC cover file uploads inside embedded eBook block
  useEffect(() => {
    const handleFileChange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target && target.classList && target.classList.contains('optin-file-upload-input')) {
        const file = target.files?.[0];
        if (!file) return;

        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('title', `eBook Cover - ${file.name}`);

          const res = await fetch('/api/admin/medias', {
            method: 'POST',
            body: formData,
          });

          const data = await res.json();
          if (res.ok && data.media?.url) {
            const figure = target.closest('figure');
            if (figure) {
              figure.setAttribute('data-book-cover', data.media.url);
              const input = figure.querySelector('.optin-cover-input') as HTMLInputElement;
              if (input) {
                input.value = data.media.url;
              }
              handleVisualInput();
            }
          } else {
            alert(data.error || 'Erreur lors du téléversement de l image.');
          }
        } catch (err) {
          console.error('File upload error:', err);
          alert('Échec de l import de l image.');
        }
      }
    };

    document.addEventListener('change', handleFileChange);
    return () => {
      document.removeEventListener('change', handleFileChange);
    };
  }, []);

  // Listen for select changes inside optin-ebook-embed figure block and update figure attributes & option selected states
  useEffect(() => {
    const handleSelectChange = (e: Event) => {
      const target = e.target as HTMLSelectElement;
      if (target && target.classList) {
        const figure = target.closest('figure');
        if (figure) {
          if (target.classList.contains('optin-target-list-select')) {
            figure.setAttribute('data-target-list-id', target.value);
            const options = Array.from(target.options);
            options.forEach((opt) => {
              if (opt.value === target.value) {
                opt.setAttribute('selected', 'selected');
              } else {
                opt.removeAttribute('selected');
              }
            });
            handleVisualInput();
          } else if (target.classList.contains('optin-welcome-step-select')) {
            figure.setAttribute('data-welcome-step-id', target.value);
            const options = Array.from(target.options);
            options.forEach((opt) => {
              if (opt.value === target.value) {
                opt.setAttribute('selected', 'selected');
              } else {
                opt.removeAttribute('selected');
              }
            });
            handleVisualInput();
          }
        }
      }
    };

    document.addEventListener('change', handleSelectChange);
    return () => document.removeEventListener('change', handleSelectChange);
  }, []);

  // Hydrate & Sync optin select dropdowns when content or data loads
  useEffect(() => {
    if (activeTab === 'preview' && visualRef.current) {
      const optinFigures = visualRef.current.querySelectorAll('.optin-ebook-embed');
      optinFigures.forEach((fig) => {
        const targetListId = fig.getAttribute('data-target-list-id') || '';
        const welcomeStepId = fig.getAttribute('data-welcome-step-id') || '';

        const listSelect = fig.querySelector('.optin-target-list-select') as HTMLSelectElement;
        if (listSelect && targetListId) {
          listSelect.value = targetListId;
          Array.from(listSelect.options).forEach((opt) => {
            if (opt.value === targetListId) opt.setAttribute('selected', 'selected');
            else opt.removeAttribute('selected');
          });
        }

        const stepSelect = fig.querySelector('.optin-welcome-step-select') as HTMLSelectElement;
        if (stepSelect && welcomeStepId) {
          stepSelect.value = welcomeStepId;
          Array.from(stepSelect.options).forEach((opt) => {
            if (opt.value === welcomeStepId) opt.setAttribute('selected', 'selected');
            else opt.removeAttribute('selected');
          });
        }
      });
    }
  }, [leadLists, campaigns, value, activeTab]);

  // Helper to execute formatting commands
  const executeCommand = (command: string, valueArg: string = '') => {
    if (activeTab === 'preview' && visualRef.current) {
      visualRef.current.focus();
      document.execCommand(command, false, valueArg);
      handleVisualInput();
    } else {
      if (command === 'bold') insertTag('<strong>', '</strong>', 'Texte en gras');
      else if (command === 'italic') insertTag('<em>', '</em>', 'Texte en italique');
      else if (command === 'underline') insertTag('<u>', '</u>', 'Texte souligné');
      else if (command === 'formatBlock') insertTag(`<${valueArg}>`, `</${valueArg}>`, 'Titre');
      else if (command === 'insertUnorderedList') insertTag('<ul>\n  <li>', '</li>\n</ul>', 'Élément 1');
      else if (command === 'insertOrderedList') insertTag('<ol>\n  <li>', '</li>\n</ol>', 'Élément 1');
    }
  };

  const handleApplyHighlight = (color: string = '#a3e635', isLive: boolean = false) => {
    if (activeTab === 'preview' && visualRef.current) {
      visualRef.current.focus();
      restoreSelection();
      const selection = window.getSelection();

      let parentMark: HTMLElement | null = null;
      if (selection && selection.rangeCount > 0) {
        let node: Node | null = selection.getRangeAt(0).commonAncestorContainer;
        if (node.nodeType === Node.TEXT_NODE) node = node.parentNode;
        parentMark = (node as HTMLElement)?.closest?.('mark') || null;
      }

      if (parentMark) {
        parentMark.setAttribute('color', color);
        parentMark.style.setProperty('background-color', color, 'important');
        handleVisualInput();
        return;
      }

      const markHtml = (txt: string) =>
        `<mark color="${color}" style="background-color: ${color} !important; color: #0f172a !important; padding: 0.15rem 0.4rem; border-radius: 0.375rem; font-weight: 800;">${txt}</mark>`;

      if (!selection || selection.isCollapsed || !selection.toString().trim()) {
        if (!isLive) {
          document.execCommand('insertHTML', false, markHtml('Texte surligné'));
          handleVisualInput();
        }
      } else {
        const selectedText = selection.toString();
        document.execCommand('insertHTML', false, markHtml(selectedText));
        saveSelection();
        handleVisualInput();
      }
    } else {
      if (!isLive) {
        insertTag(`<mark color="${color}" style="background-color: ${color} !important; color: #0f172a !important; padding: 0.15rem 0.4rem; border-radius: 0.375rem; font-weight: 800;">`, '</mark>', 'Texte surligné');
      }
    }
  };

  const handleApplyUnderline = (
    color: string = '#a3e635',
    thicknessPx: string = underlineThickness,
    offsetPx: string = underlineOffset,
    isLive: boolean = false
  ) => {
    if (activeTab === 'preview' && visualRef.current) {
      visualRef.current.focus();
      restoreSelection();
      const selection = window.getSelection();

      let parentU: HTMLElement | null = null;
      if (selection && selection.rangeCount > 0) {
        let node: Node | null = selection.getRangeAt(0).commonAncestorContainer;
        if (node.nodeType === Node.TEXT_NODE) node = node.parentNode;
        parentU = (node as HTMLElement)?.closest?.('u') || null;
      }

      if (parentU) {
        parentU.style.textDecoration = 'underline';
        parentU.style.setProperty('text-decoration-color', color, 'important');
        parentU.style.setProperty('text-decoration-thickness', thicknessPx, 'important');
        parentU.style.setProperty('text-underline-offset', offsetPx, 'important');
        parentU.style.setProperty('text-decoration-skip-ink', 'none', 'important');
        handleVisualInput();
        return;
      }

      const uHtml = (txt: string) =>
        `<u style="text-decoration: underline; text-decoration-color: ${color} !important; text-decoration-thickness: ${thicknessPx} !important; text-underline-offset: ${offsetPx} !important; text-decoration-skip-ink: none !important;">${txt}</u>`;

      if (!selection || selection.isCollapsed || !selection.toString().trim()) {
        if (!isLive) {
          document.execCommand('insertHTML', false, uHtml('Texte souligné'));
          handleVisualInput();
        }
      } else {
        const selectedText = selection.toString();
        document.execCommand('insertHTML', false, uHtml(selectedText));
        saveSelection();
        handleVisualInput();
      }
    } else {
      if (!isLive) {
        insertTag(
          `<u style="text-decoration: underline; text-decoration-color: ${color}; text-decoration-thickness: ${thicknessPx}; text-underline-offset: ${offsetPx}; text-decoration-skip-ink: none;">`,
          '</u>',
          'Texte souligné'
        );
      }
    }
  };

  const handleApplyTextColor = (color: string, isLive: boolean = false) => {
    if (activeTab === 'preview' && visualRef.current) {
      visualRef.current.focus();
      restoreSelection();
      const selection = window.getSelection();

      let parentSpan: HTMLElement | null = null;
      if (selection && selection.rangeCount > 0) {
        let node: Node | null = selection.getRangeAt(0).commonAncestorContainer;
        if (node.nodeType === Node.TEXT_NODE) node = node.parentNode;
        parentSpan = (node as HTMLElement)?.closest?.('span[style*="color"]') || ((node as HTMLElement)?.tagName === 'SPAN' ? (node as HTMLElement) : null);
      }

      if (parentSpan && parentSpan !== visualRef.current) {
        parentSpan.style.color = color;
        handleVisualInput();
        return;
      }

      if (!selection || selection.isCollapsed || !selection.toString().trim()) {
        if (!isLive) {
          document.execCommand('insertHTML', false, `<span style="color: ${color};">Texte coloré</span>`);
          handleVisualInput();
        }
      } else {
        const selectedText = selection.toString();
        document.execCommand('insertHTML', false, `<span style="color: ${color};">${selectedText}</span>`);
        saveSelection();
        handleVisualInput();
      }
    } else {
      if (!isLive) {
        insertTag(`<span style="color: ${color};">`, '</span>', 'Texte coloré');
      }
    }
  };

  const handleApplyFontSize = (sizePx: string) => {
    if (activeTab === 'preview' && visualRef.current) {
      visualRef.current.focus();
      restoreSelection();
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !selection.toString().trim()) {
        document.execCommand('insertHTML', false, `<span style="font-size: ${sizePx}; line-height: 1.3;">Texte redimensionné</span>`);
      } else {
        const selectedText = selection.toString();
        document.execCommand('insertHTML', false, `<span style="font-size: ${sizePx}; line-height: 1.3;">${selectedText}</span>`);
      }
      handleVisualInput();
    } else {
      insertTag(`<span style="font-size: ${sizePx};">`, '</span>', 'Texte redimensionné');
    }
  };

  const handleRemoveHighlightAndUnderline = () => {
    if (activeTab === 'preview' && visualRef.current) {
      visualRef.current.focus();
      restoreSelection();
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        alert('Veuillez sélectionner le texte dont vous souhaitez effacer le surlignage ou le soulignage.');
        return;
      }

      const range = selection.getRangeAt(0);
      const container = document.createElement('div');
      container.appendChild(range.cloneContents());
      let innerHtml = container.innerHTML;

      // 1. Strip <mark> tags but preserve inner text and tags
      innerHtml = innerHtml.replace(/<mark[^>]*>([\s\S]*?)<\/mark>/gi, '$1');

      // 2. Strip <u> tags but preserve inner text and tags
      innerHtml = innerHtml.replace(/<u[^>]*>([\s\S]*?)<\/u>/gi, '$1');

      // 3. Clean inline style properties text-decoration and background-color
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = innerHtml;
      const elementsWithStyle = tempDiv.querySelectorAll('[style]');
      elementsWithStyle.forEach((el) => {
        const htmlEl = el as HTMLElement;
        htmlEl.style.removeProperty('text-decoration');
        htmlEl.style.removeProperty('text-decoration-color');
        htmlEl.style.removeProperty('text-decoration-thickness');
        htmlEl.style.removeProperty('background-color');
      });

      document.execCommand('insertHTML', false, tempDiv.innerHTML);
      handleVisualInput();
    } else {
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      let selectedText = value.substring(start, end);
      if (!selectedText) {
        alert('Veuillez sélectionner du texte dans l éditeur code.');
        return;
      }
      selectedText = selectedText.replace(/<mark[^>]*>([\s\S]*?)<\/mark>/gi, '$1');
      selectedText = selectedText.replace(/<u[^>]*>([\s\S]*?)<\/u>/gi, '$1');
      const newValue = value.substring(0, start) + selectedText + value.substring(end);
      onChange(newValue);
    }
  };

  const insertTag = (openTag: string, closeTag: string = '', defaultContent: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || defaultContent;

    const replacement = `${openTag}${selectedText}${closeTag}`;
    const newValue = value.substring(0, start) + replacement + value.substring(end);

    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + openTag.length, start + openTag.length + selectedText.length);
    }, 0);
  };

  const insertHTMLContent = (htmlContent: string) => {
    if (activeTab === 'preview' && visualRef.current) {
      visualRef.current.focus();
      restoreSelection();
      document.execCommand('insertHTML', false, htmlContent);
      handleVisualInput();
    } else {
      insertTag(htmlContent, '', '');
    }
  };

  const handleOpenModal = (modalType: 'link' | 'image' | 'video') => {
    saveSelection();
    if (modalType === 'link') setShowLinkModal(true);
    if (modalType === 'image') setShowImageModal(true);
    if (modalType === 'video') setShowVideoModal(true);
    setBubbleMenu((prev) => ({ ...prev, visible: false }));
  };

  const handleAddLink = (e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!linkUrl) return;

    const formattedLink = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer" style="color: #7c3aed; text-decoration: underline; font-weight: 700;">${linkText || linkUrl}</a>`;

    if (activeTab === 'preview' && visualRef.current) {
      visualRef.current.focus();
      restoreSelection();
      document.execCommand('insertHTML', false, formattedLink);
      handleVisualInput();
    } else {
      insertTag(formattedLink, '', '');
    }

    setLinkUrl('');
    setLinkText('');
    setShowLinkModal(false);
  };

  const handleAddImage = (e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!imageUrl) return;

    const html = `<figure class="my-6 text-center"><img src="${imageUrl}" alt="${imageAlt || 'Image'}" style="max-width:100%; border-radius:12px; margin: 16px auto; display:block; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);" /><figcaption class="text-center text-xs text-slate-500 mt-2 font-medium">${imageAlt}</figcaption></figure>`;
    insertHTMLContent(html);

    setImageUrl('');
    setImageAlt('');
    setShowImageModal(false);
  };

  const handleAddVideo = (e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!videoUrl) return;

    let embedHtml = '';
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      let videoId = '';
      if (videoUrl.includes('youtu.be')) {
        videoId = videoUrl.split('/').pop() || '';
      } else {
        const urlParams = new URLSearchParams(new URL(videoUrl).search);
        videoId = urlParams.get('v') || '';
      }
      embedHtml = `<div class="my-6 aspect-[16/9] w-full rounded-xl overflow-hidden shadow-md"><iframe src="https://www.youtube.com/embed/${videoId}" class="w-full h-full border-0" allowfullscreen></iframe></div>`;
    } else {
      embedHtml = `<video controls src="${videoUrl}" class="my-6 w-full rounded-xl border border-slate-200 shadow-md"></video>`;
    }

    insertHTMLContent(embedHtml);
    setVideoUrl('');
    setShowVideoModal(false);
  };

  const handleVisualClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const deleteBtn = target.closest('.delete-block-btn');
    if (deleteBtn) {
      e.preventDefault();
      e.stopPropagation();
      const customBlock = deleteBtn.closest('.custom-embed-block') || deleteBtn.closest('.cta-block') || deleteBtn.closest('.optin-ebook-embed');
      if (customBlock) {
        customBlock.remove();
        handleVisualInput();
      }
    }
  };

  const handleAddCTA = () => {
    const html = `<figure class="custom-embed-block cta-block my-8 p-6 bg-slate-900 text-white rounded-2xl text-center space-y-3 relative group" data-custom-embed="cta">
  <div class="delete-block-bar flex items-center justify-between border-b border-slate-800 pb-2 mb-2 select-none" contenteditable="false">
    <span class="text-[11px] font-heading font-black text-purple-400 uppercase tracking-wider">⚡ BLOC CTA BOUTIQUE</span>
    <button type="button" class="delete-block-btn px-2.5 py-1 bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer">🗑️ Supprimer ce bloc</button>
  </div>
  <h3 class="text-xl font-bold text-white">Prêt à passer au niveau supérieur ?</h3>
  <p class="text-sm text-slate-300">Découvrez nos templates et outils conçus pour les solopreneurs.</p>
  <a href="/boutique" class="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-lg shadow-md transition-colors">Découvrir la boutique</a>
</figure>`;
    insertHTMLContent(html);
  };

  useEffect(() => {
    async function fetchAutomationData() {
      try {
        const [listsRes, campRes] = await Promise.all([
          fetch('/api/admin/lead-lists'),
          fetch('/api/admin/campaigns'),
        ]);
        if (listsRes.ok) {
          const listsData = await listsRes.json();
          if (listsData.lists) setLeadLists(listsData.lists);
        }
        if (campRes.ok) {
          const campData = await campRes.json();
          if (campData.campaigns) setCampaigns(campData.campaigns);
        }
      } catch (err) {
        console.error('Failed to load lead lists & campaigns for editor:', err);
      }
    }
    fetchAutomationData();
  }, []);

  const handleAddOptInEbook = () => {
    const stepsList: Array<{ id: string; label: string; subject: string; attachmentName?: string }> = [];
    campaigns.forEach((camp: any) => {
      if (camp.sequences) {
        camp.sequences.forEach((seq: any) => {
          if (seq.stepOrder === 1 || seq.triggerType === 'IMMEDIATE') {
            stepsList.push({
              id: seq.id,
              label: `Email #1 (${camp.name})`,
              subject: seq.subject,
              attachmentName: seq.attachmentName,
            });

            if (seq.variants) {
              seq.variants.forEach((v: any, vIdx: number) => {
                stepsList.push({
                  id: v.id,
                  label: `Sous-email 1.${vIdx + 1} (${camp.name})`,
                  subject: v.subject,
                  attachmentName: v.attachmentName,
                });
              });
            }
          }
        });
      }
    });

    const html = `<figure class="custom-embed-block optin-ebook-embed my-8 p-7 bg-slate-950 text-white rounded-3xl border-2 border-[#a3e635] shadow-2xl space-y-4 text-center relative group" data-custom-embed="optin-ebook" data-book-cover="" data-book-title="GUIDE SOLOPRENEUR" data-target-list-id="" data-welcome-step-id="">
  <div class="delete-block-bar flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 mb-2 gap-2 select-none" contenteditable="false">
    <div class="flex items-center gap-2">
      <span class="text-[11px] font-heading font-black text-[#a3e635] uppercase tracking-wider">📖 BLOC OPT-IN EBOOK (ÉDITABLE)</span>
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <input type="text" placeholder="URL Image Couverture (https://...)" class="optin-cover-input px-3 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 w-52 focus:border-[#a3e635] focus:outline-none" oninput="this.closest('figure').setAttribute('data-book-cover', this.value)" />
      <label class="cursor-pointer px-2.5 py-1 bg-[#a3e635]/20 hover:bg-[#a3e635]/40 text-[#a3e635] border border-[#a3e635]/40 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1">
        <span>📷 Importer du PC</span>
        <input type="file" accept="image/*" class="optin-file-upload-input hidden" />
      </label>
      <button type="button" class="delete-block-btn px-2.5 py-1 bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer">🗑️ Supprimer</button>
    </div>
  </div>

  <div class="p-3 bg-slate-900 rounded-2xl border border-slate-800 space-y-2 select-none text-left" contenteditable="false">
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
      <div>
        <label class="block text-[11px] font-bold text-[#a3e635] mb-1">📋 Liste de Contacts Cible :</label>
        <select class="optin-target-list-select w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-semibold text-xs focus:border-[#a3e635] focus:outline-none cursor-pointer" onchange="this.closest('figure').setAttribute('data-target-list-id', this.value)">
          <option value="">⚙️ Liste par défaut (Opt-in eBook)</option>
          ${leadLists.map(l => `<option value="${l.id}">📁 ${l.name} (${l._count?.leads || 0} contacts)</option>`).join('')}
        </select>
      </div>
      <div>
        <label class="block text-[11px] font-bold text-[#a3e635] mb-1">✉️ Email de Bienvenue / eBook :</label>
        <select class="optin-welcome-step-select w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-semibold text-xs focus:border-[#a3e635] focus:outline-none cursor-pointer" onchange="this.closest('figure').setAttribute('data-welcome-step-id', this.value)">
          <option value="">⚙️ Email de bienvenue par défaut</option>
          ${stepsList.map(ws => `<option value="${ws.id}">📩 ${ws.label} : "${ws.subject}" ${ws.attachmentName ? `(📎 ${ws.attachmentName})` : ''}</option>`).join('')}
        </select>
      </div>
    </div>
  </div>

  <div class="flex justify-center w-full">
    <div class="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#a3e635] text-slate-950 font-heading font-black text-xs uppercase shadow-sm optin-badge">
      EBOOK GRATUIT A 100%
    </div>
  </div>
  <h3 class="text-xl font-heading font-black text-white leading-tight optin-title">Tout ce dont vous avez besoin pour structurer et faire décoller votre activité</h3>
  <p class="text-xs text-slate-300 font-normal leading-relaxed max-w-xl mx-auto optin-subtitle">Ne perdez plus des heures à configurer des outils bancales. Saisissez vos coordonnées pour recevoir votre eBook gratuit et sa séquence exclusive.</p>
  <div class="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-3 max-w-md mx-auto" contenteditable="false">
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
      <input type="text" placeholder="Votre prénom" class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-400" disabled />
      <input type="email" placeholder="Votre email pro" class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-400" disabled />
    </div>
    <button type="button" class="w-full py-2.5 bg-[#a3e635] text-slate-950 font-heading font-black text-xs rounded-xl shadow-md cursor-pointer" disabled>Send My FREE Guide 🚀</button>
  </div>
</figure>`;
    insertHTMLContent(html);
  };

  const handleAddTable = () => {
    const html = `<div class="my-6 overflow-x-auto"><table class="w-full border-collapse border border-slate-200 text-sm text-left"><thead class="bg-slate-100 font-bold text-slate-900"><tr><th class="p-3 border border-slate-200">Fonctionnalité</th><th class="p-3 border border-slate-200">Offre Gratuite</th><th class="p-3 border border-slate-200">Offre Premium</th></tr></thead><tbody><tr><td class="p-3 border border-slate-200">Ressources</td><td class="p-3 border border-slate-200">Standard</td><td class="p-3 border border-slate-200">Illimité</td></tr></tbody></table></div>`;
    insertHTMLContent(html);
  };

  return (
    <div className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden space-y-0 relative">
      
      {/* STICKY MAIN TOOLBAR */}
      <div className="sticky top-[70px] z-30 bg-slate-50/95 backdrop-blur-md border-b border-slate-200 shadow-xs divide-y divide-slate-200">
        
        {/* FORMATTING BUTTONS ROW 1 */}
        <div className="p-2 flex flex-wrap items-center gap-1 w-full">
          <button
            type="button"
            onClick={() => executeCommand('bold')}
            className="p-1.5 rounded text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-colors"
            title="Gras (Strong)"
          >
            <Bold className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => executeCommand('italic')}
            className="p-1.5 rounded text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-colors"
            title="Italique (Em)"
          >
            <Italic className="w-4 h-4" />
          </button>

          {/* UNDERLINE POPOVER */}
          <div className="relative color-popover-container">
            <button
              type="button"
              onClick={() => {
                saveSelection();
                setOpenStickyPopover((prev) => (prev === 'underline' ? null : 'underline'));
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 border border-slate-200 transition-colors cursor-pointer"
              title="Soulignage Personnalisé (Couleur & Épaisseur)"
            >
              <Underline className="w-3.5 h-3.5 text-slate-700" />
              <span>Souligné</span>
              <span className="w-2.5 h-2.5 rounded-full border border-slate-300 bg-[#a3e635] shrink-0 inline-block" />
              <span className="text-[10px] text-slate-400">▾</span>
            </button>

            {openStickyPopover === 'underline' && (
              <div className="absolute left-0 top-full mt-1.5 z-50 bg-slate-900 text-white rounded-2xl shadow-2xl p-3 border border-slate-700 w-64 space-y-3 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-[11px] font-extrabold text-[#a3e635] uppercase tracking-wider flex items-center gap-1">
                    <Underline className="w-3.5 h-3.5" />
                    <span>Soulignage Personnalisé</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Épaisseur :</label>
                    <select
                      value={underlineThickness}
                      onChange={(e) => setUnderlineThickness(e.target.value)}
                      className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-white font-bold text-xs focus:outline-none cursor-pointer"
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
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Hauteur / Position :</label>
                    <select
                      value={underlineOffset}
                      onChange={(e) => setUnderlineOffset(e.target.value)}
                      className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-white font-bold text-xs focus:outline-none cursor-pointer"
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
                  <label className="block text-[11px] font-bold text-slate-400 mb-1.5">Choisir la couleur :</label>
                  <div className="grid grid-cols-6 gap-1.5">
                    {underlineColors.map((c) => (
                      <button
                        key={c.color}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          handleApplyUnderline(c.color, underlineThickness, underlineOffset, false);
                          setOpenStickyPopover(null);
                        }}
                        style={{ backgroundColor: c.color }}
                        className="w-7 h-7 rounded-lg border border-slate-700 hover:scale-110 transition-transform cursor-pointer shadow-sm"
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-slate-400">Glisser pour choisir :</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      defaultValue="#a3e635"
                      onInput={(e) => handleApplyUnderline((e.target as HTMLInputElement).value, underlineThickness, underlineOffset, true)}
                      onChange={(e) => handleApplyUnderline(e.target.value, underlineThickness, underlineOffset, true)}
                      className="w-8 h-8 bg-transparent cursor-pointer rounded-lg border border-slate-700 p-0.5"
                      title="Glissez le curseur pour explorer toutes les nuances"
                    />
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setOpenStickyPopover(null)}
                      className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] rounded-md cursor-pointer shadow-xs"
                    >
                      OK
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* FONT SIZE SELECTOR */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <Type className="w-3.5 h-3.5 text-slate-600 ml-1" />
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleApplyFontSize(e.target.value);
                  e.target.value = '';
                }
              }}
              className="bg-transparent text-slate-800 font-bold text-xs focus:outline-none cursor-pointer pr-1"
              title="Taille du texte"
            >
              <option value="">Taille</option>
              <option value="12px">12px</option>
              <option value="14px">14px</option>
              <option value="18px">18px</option>
              <option value="24px">24px</option>
              <option value="32px">32px</option>
            </select>
          </div>

          {/* TEXT COLOR POPOVER */}
          <div className="relative color-popover-container">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                saveSelection();
                setOpenStickyPopover((prev) => (prev === 'text' ? null : 'text'));
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 border border-slate-200 transition-colors cursor-pointer"
              title="Palette de Couleurs de Texte"
            >
              <Palette className="w-3.5 h-3.5 text-slate-700" />
              <span>Couleur</span>
              <span className="text-[10px] text-slate-400">▾</span>
            </button>

            {openStickyPopover === 'text' && (
              <div className="absolute left-0 top-full mt-1.5 z-50 bg-slate-900 text-white rounded-2xl shadow-2xl p-3 border border-slate-700 w-64 space-y-3 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-[11px] font-extrabold text-[#a3e635] uppercase tracking-wider flex items-center gap-1">
                    <Palette className="w-3.5 h-3.5" />
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
                        handleApplyTextColor(c.color, false);
                        setOpenStickyPopover(null);
                      }}
                      style={{ backgroundColor: c.color }}
                      className="w-7 h-7 rounded-lg border border-slate-700 hover:scale-110 transition-transform cursor-pointer shadow-sm"
                      title={c.label}
                    />
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-slate-400">Glisser pour choisir :</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      defaultValue="#a3e635"
                      onInput={(e) => handleApplyTextColor((e.target as HTMLInputElement).value, true)}
                      onChange={(e) => handleApplyTextColor(e.target.value, true)}
                      className="w-8 h-8 bg-transparent cursor-pointer rounded-lg border border-slate-700 p-0.5"
                      title="Glissez le curseur pour explorer toutes les nuances"
                    />
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setOpenStickyPopover(null)}
                      className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] rounded-md cursor-pointer shadow-xs"
                    >
                      OK
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* NEON HIGHLIGHT POPOVER */}
          <div className="relative color-popover-container">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                saveSelection();
                setOpenStickyPopover((prev) => (prev === 'neon' ? null : 'neon'));
              }}
              className="px-2.5 py-1 rounded-lg bg-[#a3e635]/20 hover:bg-[#a3e635]/30 text-slate-950 font-black text-xs flex items-center gap-1.5 border border-[#a3e635]/40 transition-colors cursor-pointer shadow-2xs"
              title="Palette de Surlignage Néon (<mark>)"
            >
              <Highlighter className="w-3.5 h-3.5 text-slate-950" />
              <span>✨ Néon</span>
              <span className="text-[10px] text-slate-700">▾</span>
            </button>

            {openStickyPopover === 'neon' && (
              <div className="absolute left-0 top-full mt-1.5 z-50 bg-slate-900 text-white rounded-2xl shadow-2xl p-3 border border-slate-700 w-64 space-y-3 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-[11px] font-extrabold text-[#a3e635] uppercase tracking-wider flex items-center gap-1">
                    <Highlighter className="w-3.5 h-3.5" />
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
                        handleApplyHighlight(c.color, false);
                        setOpenStickyPopover(null);
                      }}
                      style={{ backgroundColor: c.color }}
                      className="w-7 h-7 rounded-lg border border-slate-700 hover:scale-110 transition-transform cursor-pointer shadow-sm"
                      title={c.label}
                    />
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-slate-400">Glisser pour choisir :</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      defaultValue="#a3e635"
                      onInput={(e) => handleApplyHighlight((e.target as HTMLInputElement).value, true)}
                      onChange={(e) => handleApplyHighlight(e.target.value, true)}
                      className="w-8 h-8 bg-transparent cursor-pointer rounded-lg border border-slate-700 p-0.5"
                      title="Glissez le curseur pour explorer toutes les nuances"
                    />
                    <button
                      type="button"
                      onClick={() => setOpenStickyPopover(null)}
                      className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] rounded-md cursor-pointer shadow-xs"
                    >
                      OK
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ERASE HIGHLIGHT & UNDERLINE BUTTON */}
          <button
            type="button"
            onClick={handleRemoveHighlightAndUnderline}
            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors flex items-center gap-1 border border-rose-200 cursor-pointer shadow-2xs"
            title="Effacer le surlignage et le soulignage du texte sélectionné (conserve la taille et la police)"
          >
            <Eraser className="w-3.5 h-3.5 text-rose-600" />
            <span className="hidden sm:inline">Effacer Néon/Souligné</span>
          </button>

          <div className="h-4 w-[1px] bg-slate-300 mx-1" />

          <button
            type="button"
            onClick={() => executeCommand('formatBlock', 'h2')}
            className="p-1.5 rounded text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-colors font-extrabold text-xs"
            title="Titre H2"
          >
            <Heading2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => executeCommand('formatBlock', 'h3')}
            className="p-1.5 rounded text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-colors font-extrabold text-xs"
            title="Sous-titre H3"
          >
            <Heading3 className="w-4 h-4" />
          </button>

          <div className="h-4 w-[1px] bg-slate-300 mx-1" />

          <button
            type="button"
            onClick={() => executeCommand('insertUnorderedList')}
            className="p-1.5 rounded text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-colors"
            title="Liste à puces"
          >
            <List className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => executeCommand('insertOrderedList')}
            className="p-1.5 rounded text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-colors"
            title="Liste numérotée"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => insertHTMLContent('<blockquote class="border-l-4 border-purple-500 pl-4 italic text-slate-700 my-4">Citation inspirante...</blockquote>')}
            className="p-1.5 rounded text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-colors"
            title="Bloc de citation"
          >
            <Quote className="w-4 h-4" />
          </button>

          <div className="h-4 w-[1px] bg-slate-300 mx-1" />

          <button
            type="button"
            onClick={() => handleOpenModal('link')}
            className="p-1.5 rounded text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-colors"
            title="Insérer un lien URL"
          >
            <LinkIcon className="w-4 h-4 text-purple-600" />
          </button>

          <button
            type="button"
            onClick={() => handleOpenModal('image')}
            className="p-1.5 rounded text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-colors"
            title="Insérer une image / photo"
          >
            <ImageIcon className="w-4 h-4 text-orange-500" />
          </button>

          <button
            type="button"
            onClick={() => handleOpenModal('video')}
            className="p-1.5 rounded text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-colors"
            title="Insérer une vidéo (YouTube / MP4)"
          >
            <Video className="w-4 h-4 text-blue-600" />
          </button>

          <div className="h-4 w-[1px] bg-slate-300 mx-1" />

          <button
            type="button"
            onClick={handleAddTable}
            className="p-1.5 rounded text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-colors"
            title="Insérer un tableau"
          >
            <TableIcon className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => insertHTMLContent('<pre><code class="language-javascript">// Votre code ici</code></pre>')}
            className="p-1.5 rounded text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-colors"
            title="Insérer du code"
          >
            <Code className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => insertHTMLContent('<hr class="my-8 border-slate-200" />')}
            className="p-1.5 rounded text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-colors"
            title="Séparateur horizontal"
          >
            <Minus className="w-4 h-4" />
          </button>

          <div className="h-4 w-[1px] bg-slate-300 mx-1" />

          {/* UNDO & REDO BUTTONS AT THE END */}
          <button
            type="button"
            onClick={() => executeCommand('undo')}
            className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer"
            title="Annuler (Ctrl+Z / Revenir)"
          >
            <Undo className="w-4 h-4 text-slate-700" />
          </button>

          <button
            type="button"
            onClick={() => executeCommand('redo')}
            className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer"
            title="Rétablir (Ctrl+Y / Avancer)"
          >
            <Redo className="w-4 h-4 text-slate-700" />
          </button>

        </div>

        {/* ROW 2: MODE TOGGLE ON EXTREME LEFT, BLOCKS ON EXTREME RIGHT */}
        <div className="bg-slate-100/90 px-3 py-1.5 flex items-center justify-between w-full gap-2">
          {/* EXTREME LEFT: EDITOR MODE TOGGLE */}
          <div className="flex items-center gap-1 bg-slate-200/90 p-0.5 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1 rounded-md font-bold transition-colors flex items-center gap-1.5 ${
                activeTab === 'preview' ? 'bg-purple-700 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Aperçu Réel Interactif</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'editor' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Éditeur Code / HTML</span>
            </button>
          </div>

          {/* EXTREME RIGHT: BLOCKS INSERTION */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAddCTA}
              className="px-3 py-1 rounded-lg bg-purple-100 text-purple-900 text-xs font-black hover:bg-purple-200 transition-colors flex items-center gap-1.5 border border-purple-300 cursor-pointer shadow-xs"
              title="Insérer un bloc d appel à l action (CTA)"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Bloc CTA</span>
            </button>

            <button
              type="button"
              onClick={handleAddOptInEbook}
              className="px-3 py-1 rounded-lg bg-[#a3e635] text-slate-950 text-xs font-black hover:bg-[#b8f542] transition-colors flex items-center gap-1.5 border border-[#86efac] cursor-pointer shadow-xs"
              title="Insérer le Gestionnaire du Bloc Opt-in eBook Gratuit"
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-950" />
              <span>📖 Opt-in eBook</span>
            </button>
          </div>
        </div>

      </div>

      {/* EDITOR INPUT OR INTERACTIVE LIVE PREVIEW */}
      {activeTab === 'preview' ? (
        <div className="relative">
          <div className="bg-purple-50/80 px-4 py-1.5 border-b border-purple-100 text-[11px] text-purple-950 font-bold flex items-center justify-between">
            <span>✨ Mode Aperçu Réel (Cliquez-droit ou sélectionnez du texte pour afficher le menu contextuel flottant)</span>
            <span className="text-[10px] bg-purple-200 text-purple-900 px-2 py-0.5 rounded font-black">Édition en direct</span>
          </div>

          <div
            ref={visualRef}
            contentEditable={true}
            suppressContentEditableWarning={true}
            onInput={handleVisualInput}
            onBlur={handleVisualInput}
            onContextMenu={handleContextMenu}
            onClick={handleVisualClick}
            className="p-8 prose prose-slate max-w-none text-slate-900 min-h-[400px] bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 leading-relaxed font-sans"
          />
        </div>
      ) : (
        <div className="relative bg-[#0d1117]">
          {/* CODE EDITOR HEADER BAR */}
          <div className="bg-[#161b22] px-4 py-2 border-b border-slate-800 text-xs text-slate-300 font-mono flex items-center justify-between">
            <span className="flex items-center gap-2 text-emerald-400 font-bold">
              <span>💻 Éditeur Code HTML Brut</span>
            </span>
            <span className="text-[11px] text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded font-mono border border-slate-700">
              HTML5 • UTF-8
            </span>
          </div>

          <textarea
            ref={textareaRef}
            rows={22}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Rédigez ou collez votre code HTML ici..."
            className="w-full p-6 font-mono text-sm leading-relaxed text-[#e6edf3] focus:outline-none bg-[#0d1117] selection:bg-purple-600 selection:text-white border-0 resize-y min-h-[500px]"
            style={{
              fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
              lineHeight: '1.6',
              caretColor: '#a3e635',
            }}
          />
        </div>
      )}

      {/* FLOATING CONTEXTUAL BUBBLE MENU WITH HIGH-CONTRAST VIVID BUTTONS */}
      {bubbleMenu.visible && mounted && createPortal(
        <div
          id="floating-bubble-menu"
          style={{ top: `${bubbleMenu.y}px`, left: `${bubbleMenu.x}px` }}
          className="fixed z-[99999] bg-slate-900 text-white rounded-2xl shadow-2xl p-2 flex items-center gap-1.5 border border-slate-700 max-w-[calc(100vw-32px)] overflow-visible animate-in fade-in zoom-in-95"
        >
          <button
            type="button"
            onClick={() => executeCommand('undo')}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs cursor-pointer"
            title="Annuler (Ctrl+Z / Revenir)"
          >
            <Undo className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('redo')}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs cursor-pointer"
            title="Rétablir (Ctrl+Y / Avancer)"
          >
            <Redo className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('bold')}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white font-extrabold rounded-lg text-xs"
            title="Gras (B)"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => executeCommand('italic')}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white font-extrabold italic rounded-lg text-xs"
            title="Italique (I)"
          >
            I
          </button>
          {/* UNDERLINE POPOVER IN BUBBLE */}
          <div className="relative color-popover-container shrink-0">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                saveSelection();
                setOpenBubblePopover((prev) => (prev === 'underline' ? null : 'underline'));
              }}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white font-extrabold rounded-lg text-xs flex items-center gap-1.5 whitespace-nowrap shrink-0 h-7 border border-slate-700 cursor-pointer"
              title="Soulignage Personnalisé"
            >
              <Underline className="w-3.5 h-3.5 text-slate-200 shrink-0" />
              <span>Souligné</span>
              <span className="w-2.5 h-2.5 rounded-full border border-slate-600 bg-[#a3e635] shrink-0 inline-block" />
              <span className="text-[10px] text-slate-400 shrink-0">▾</span>
            </button>

            {openBubblePopover === 'underline' && (
              <div className="absolute left-0 top-full mt-1.5 z-[100000] bg-slate-950 text-white rounded-2xl shadow-2xl p-3 border border-slate-700 w-64 space-y-3 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-[11px] font-extrabold text-[#a3e635] uppercase tracking-wider flex items-center gap-1">
                    <Underline className="w-3.5 h-3.5" />
                    <span>Soulignage Personnalisé</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Épaisseur :</label>
                    <select
                      value={underlineThickness}
                      onChange={(e) => setUnderlineThickness(e.target.value)}
                      className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-white font-bold text-xs focus:outline-none cursor-pointer"
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
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Hauteur / Position :</label>
                    <select
                      value={underlineOffset}
                      onChange={(e) => setUnderlineOffset(e.target.value)}
                      className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-white font-bold text-xs focus:outline-none cursor-pointer"
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
                  <label className="block text-[11px] font-bold text-slate-400 mb-1.5">Choisir la couleur :</label>
                  <div className="grid grid-cols-6 gap-1.5">
                    {underlineColors.map((c) => (
                      <button
                        key={c.color}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          handleApplyUnderline(c.color, underlineThickness, underlineOffset, false);
                          setOpenBubblePopover(null);
                        }}
                        style={{ backgroundColor: c.color }}
                        className="w-7 h-7 rounded-lg border border-slate-700 hover:scale-110 transition-transform cursor-pointer shadow-sm"
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-slate-400">Glisser pour choisir :</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      defaultValue="#a3e635"
                      onInput={(e) => handleApplyUnderline((e.target as HTMLInputElement).value, underlineThickness, underlineOffset, true)}
                      onChange={(e) => handleApplyUnderline(e.target.value, underlineThickness, underlineOffset, true)}
                      className="w-8 h-8 bg-transparent cursor-pointer rounded-lg border border-slate-700 p-0.5"
                      title="Glissez le curseur pour explorer toutes les nuances"
                    />
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setOpenBubblePopover(null)}
                      className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] rounded-md cursor-pointer shadow-xs"
                    >
                      OK
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* FONT SIZE SELECTOR IN FLOATING BUBBLE */}
          <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg border border-slate-700 shrink-0">
            <Type className="w-3.5 h-3.5 text-slate-300 ml-1 shrink-0" />
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleApplyFontSize(e.target.value);
                  e.target.value = '';
                }
              }}
              className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer pr-1"
              title="Taille du texte"
            >
              <option value="" className="bg-slate-900 text-white">Taille</option>
              <option value="12px" className="bg-slate-900 text-white">12px</option>
              <option value="14px" className="bg-slate-900 text-white">14px</option>
              <option value="18px" className="bg-slate-900 text-white">18px</option>
              <option value="24px" className="bg-slate-900 text-white">24px</option>
              <option value="32px" className="bg-slate-900 text-white">32px</option>
            </select>
          </div>

          {/* TEXT COLOR POPOVER IN BUBBLE */}
          <div className="relative color-popover-container shrink-0">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                saveSelection();
                setOpenBubblePopover((prev) => (prev === 'text' ? null : 'text'));
              }}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white font-extrabold rounded-lg text-xs flex items-center gap-1.5 whitespace-nowrap shrink-0 h-7 border border-slate-700 cursor-pointer"
              title="Palette de Couleurs de Texte"
            >
              <Palette className="w-3.5 h-3.5 text-slate-200 shrink-0" />
              <span>Couleur</span>
              <span className="text-[10px] text-slate-400 shrink-0">▾</span>
            </button>

            {openBubblePopover === 'text' && (
              <div className="absolute left-0 top-full mt-1.5 z-[100000] bg-slate-950 text-white rounded-2xl shadow-2xl p-3 border border-slate-700 w-64 space-y-3 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-[11px] font-extrabold text-[#a3e635] uppercase tracking-wider flex items-center gap-1">
                    <Palette className="w-3.5 h-3.5" />
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
                        handleApplyTextColor(c.color, false);
                        setOpenBubblePopover(null);
                      }}
                      style={{ backgroundColor: c.color }}
                      className="w-7 h-7 rounded-lg border border-slate-700 hover:scale-110 transition-transform cursor-pointer shadow-sm"
                      title={c.label}
                    />
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-slate-400">Glisser pour choisir :</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      defaultValue="#a3e635"
                      onInput={(e) => handleApplyTextColor((e.target as HTMLInputElement).value, true)}
                      onChange={(e) => handleApplyTextColor(e.target.value, true)}
                      className="w-8 h-8 bg-transparent cursor-pointer rounded-lg border border-slate-700 p-0.5"
                      title="Glissez le curseur pour explorer toutes les nuances"
                    />
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setOpenBubblePopover(null)}
                      className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] rounded-md cursor-pointer shadow-xs"
                    >
                      OK
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* NEON HIGHLIGHT POPOVER IN BUBBLE */}
          <div className="relative color-popover-container shrink-0">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                saveSelection();
                setOpenBubblePopover((prev) => (prev === 'neon' ? null : 'neon'));
              }}
              className="px-2.5 py-1 bg-[#a3e635] hover:bg-[#b8f542] text-slate-950 font-black rounded-lg text-xs flex items-center gap-1.5 whitespace-nowrap shrink-0 h-7 border border-[#86efac] cursor-pointer shadow-sm"
              title="Palette de Surlignage Néon (<mark>)"
            >
              <Highlighter className="w-3.5 h-3.5 text-slate-950 shrink-0" />
              <span>Néon</span>
              <span className="text-[10px] text-slate-800 shrink-0">▾</span>
            </button>

            {openBubblePopover === 'neon' && (
              <div className="absolute left-0 top-full mt-1.5 z-[100000] bg-slate-950 text-white rounded-2xl shadow-2xl p-3 border border-slate-700 w-64 space-y-3 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-[11px] font-extrabold text-[#a3e635] uppercase tracking-wider flex items-center gap-1">
                    <Highlighter className="w-3.5 h-3.5" />
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
                        handleApplyHighlight(c.color, false);
                        setOpenBubblePopover(null);
                      }}
                      style={{ backgroundColor: c.color }}
                      className="w-7 h-7 rounded-lg border border-slate-700 hover:scale-110 transition-transform cursor-pointer shadow-sm"
                      title={c.label}
                    />
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-slate-400">Glisser pour choisir :</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      defaultValue="#a3e635"
                      onInput={(e) => handleApplyHighlight((e.target as HTMLInputElement).value, true)}
                      onChange={(e) => handleApplyHighlight(e.target.value, true)}
                      className="w-8 h-8 bg-transparent cursor-pointer rounded-lg border border-slate-700 p-0.5"
                      title="Glissez le curseur pour explorer toutes les nuances"
                    />
                    <button
                      type="button"
                      onClick={() => setOpenBubblePopover(null)}
                      className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] rounded-md cursor-pointer shadow-xs"
                    >
                      OK
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ERASE FORMATTING IN FLOATING BUBBLE */}
          <button
            type="button"
            onClick={handleRemoveHighlightAndUnderline}
            className="p-1.5 bg-rose-900/60 hover:bg-rose-800 text-rose-200 font-extrabold rounded-lg text-xs flex items-center gap-1 border border-rose-700/50 cursor-pointer"
            title="Effacer surlignage et soulignage (conserve la taille et le style)"
          >
            <Eraser className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-[11px]">Effacer</span>
          </button>

          <div className="h-4 w-[1px] bg-slate-700 mx-0.5" />

          <button
            type="button"
            onClick={() => executeCommand('formatBlock', 'h2')}
            className="px-2 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-lg text-xs"
            title="Titre H2"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => executeCommand('formatBlock', 'h3')}
            className="px-2 py-1 bg-amber-300 hover:bg-amber-200 text-slate-950 font-black rounded-lg text-xs"
            title="Sous-titre H3"
          >
            H3
          </button>

          <div className="h-4 w-[1px] bg-slate-700 mx-0.5" />

          <button
            type="button"
            onClick={() => handleOpenModal('link')}
            className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow-sm"
            title="Insérer un lien hypertexte"
          >
            <LinkIcon className="w-3.5 h-3.5 text-white" />
            <span>Lien</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenModal('image')}
            className="px-2.5 py-1 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow-sm"
            title="Insérer une image / photo"
          >
            <ImageIcon className="w-3.5 h-3.5 text-white" />
            <span>Photo</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenModal('video')}
            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow-sm"
            title="Insérer une vidéo"
          >
            <Video className="w-3.5 h-3.5 text-white" />
            <span>Vidéo</span>
          </button>

          <button
            type="button"
            onClick={handleAddTable}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg text-xs"
            title="Insérer un tableau"
          >
            <TableIcon className="w-3.5 h-3.5 text-slate-200" />
          </button>

          <button
            type="button"
            onClick={handleAddCTA}
            className="px-2.5 py-1 bg-gradient-to-r from-purple-600 via-orange-500 to-amber-500 text-white rounded-lg text-xs font-black shadow-sm"
            title="Insérer un CTA"
          >
            CTA
          </button>

          <button
            type="button"
            onClick={handleAddOptInEbook}
            className="px-2.5 py-1 bg-[#a3e635] text-slate-950 rounded-lg text-xs font-black shadow-sm hover:bg-[#b8f542] whitespace-nowrap shrink-0 flex items-center gap-1"
            title="Insérer le Bloc Opt-in eBook Gratuit"
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-950 shrink-0" />
            <span>eBook</span>
          </button>

          <div className="h-4 w-[1px] bg-slate-700 mx-0.5" />

          <button
            type="button"
            onClick={() => setBubbleMenu((prev) => ({ ...prev, visible: false }))}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg"
            title="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>,
        document.body
      )}

      {/* LINK MODAL (NO NESTED FORM TAG TO PREVENT PARENT PAGE SUBMIT) */}
      {showLinkModal && mounted && createPortal(
        <div className="fixed inset-0 z-[99999] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-purple-600" />
                <span>Insérer un lien hypertexte</span>
              </h3>
              <button type="button" onClick={() => setShowLinkModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Texte de l hyperlien (optionnel)</label>
                <input
                  type="text"
                  placeholder="Ex: Consulter l étude complète"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Adresse URL du lien (https://...)*</label>
                <input
                  type="url"
                  required
                  placeholder="https://exemple.com/article"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddLink(e); }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowLinkModal(false)}>
                  Annuler
                </Button>
                <Button type="button" onClick={handleAddLink} variant="primary" size="sm" className="bg-purple-700 hover:bg-purple-800 text-white font-bold px-4">
                  Valider & Insérer le lien
                </Button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* IMAGE MODAL (NO NESTED FORM TAG TO PREVENT PARENT PAGE SUBMIT) */}
      {showImageModal && mounted && createPortal(
        <div className="fixed inset-0 z-[99999] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-orange-500" />
                <span>Insérer une photo / image</span>
              </h3>
              <button type="button" onClick={() => setShowImageModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">URL de l image (Lien web)*</label>
                <input
                  type="text"
                  required
                  placeholder="https://images.unsplash.com/photo-..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddImage(e); }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Légende / Texte alternatif (ALT)</label>
                <input
                  type="text"
                  placeholder="Ex: Graphique de trésorerie 2026"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddImage(e); }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowImageModal(false)}>
                  Annuler
                </Button>
                <Button type="button" onClick={handleAddImage} variant="primary" size="sm" className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-4">
                  Valider & Insérer la photo
                </Button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* VIDEO MODAL (NO NESTED FORM TAG TO PREVENT PARENT PAGE SUBMIT) */}
      {showVideoModal && mounted && createPortal(
        <div className="fixed inset-0 z-[99999] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Video className="w-5 h-5 text-blue-600" />
                <span>Insérer une vidéo (YouTube / MP4)</span>
              </h3>
              <button type="button" onClick={() => setShowVideoModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Lien YouTube ou URL MP4*</label>
                <input
                  type="text"
                  required
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddVideo(e); }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowVideoModal(false)}>
                  Annuler
                </Button>
                <Button type="button" onClick={handleAddVideo} variant="primary" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4">
                  Valider & Insérer la vidéo
                </Button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
