'use client';

import React, { useState, useEffect } from 'react';
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

export default function VisualPageBuilderPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stepId = searchParams?.get('stepId');

  const [funnel, setFunnel] = useState<any>(null);
  const [step, setStep] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ELEMENTS' | 'BLOCKS'>('ELEMENTS');
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
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // MAGNETIC SNAP GUIDE LINE STATE FOR AUTOMATIC ALIGNMENT
  const [snapGuide, setSnapGuide] = useState<{
    active: boolean;
    type?: 'height' | 'width' | 'both';
    val?: number;
  } | null>(null);

  // CANVAS BACKGROUND ALIGNMENT GRID STATE (GRILLAGE À CARREAUX ON/OFF)
  const [showCanvasGrid, setShowCanvasGrid] = useState<boolean>(true);

  // PAGE DISPLAY WIDTH MODE STATE (STANDARD 896px, LARGE 1152px, FULL SCREEN 100%)
  const [pageWidthMode, setPageWidthMode] = useState<'standard' | 'wide' | 'full'>('standard');

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

  // Canvas elements state
  const [elements, setElements] = useState<CanvasElement[]>([
    {
      id: 'el-1',
      type: 'Heading',
      category: 'Texte',
      content: 'Votre emploi de rêve n est qu à un clic',
    },
    {
      id: 'el-2',
      type: 'Text',
      category: 'Texte',
      content: 'Découvrez nos méthodes prouvées, nos templates d organisation et nos automations pour développer un business rentable.',
    },
    {
      id: 'el-3',
      type: 'OptinForm',
      category: 'Formulaire',
      content: 'Formulaire de Capture Email',
    },
  ]);

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
              }
            } catch (e) {
              console.error(e);
            }
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
        setSelectedElementId(newEl.id);
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
          setSelectedElementId(data.draggedElementId);
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

      setSelectedElementId(blockId);
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
      const targetEl = elements.find((item) => item.id === blockId);
      if (!targetEl) return;

      // Special handling for ContentBox and Section containers (stores children: CanvasElement[])
      if (targetEl.type === 'ContentBox' || targetEl.type === 'Section' || targetEl.type === 'BlockSectionFull') {
        const newChild: CanvasElement = {
          id: `child-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          type: data.type || (data.category === 'Média' ? 'Image' : 'Text'),
          category: data.category || 'Texte',
          content: data.defaultContent || data.content || (data.type === 'Image' ? 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80' : 'Nouveau texte inséré...'),
          data: getDefaultBlockData(data.type, data.defaultContent),
        };

        setElements((prev) =>
          prev.map((el) => {
            if (el.id !== blockId) return el;
            const currentChildren = el.data?.children || [];
            return {
              ...el,
              data: {
                ...el.data,
                children: [...currentChildren, newChild],
              },
            };
          })
        );

        if (!data.isNew && data.draggedElementId) {
          setElements((prev) => prev.filter((el) => el.id !== data.draggedElementId));
        }

        setSelectedElementId(blockId);
        return;
      }

      // Default card-based block drop
      const imageUrl = data.defaultContent || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80';

      setElements((prev) =>
        prev.map((el) => {
          if (el.id !== blockId) return el;
          if (el.data?.items && el.data.items.length > 0) {
            const currentItems = el.data.items;
            const updatedItems = currentItems.map((it: any, i: number) =>
              i === 0 ? { ...it, img: imageUrl } : it
            );
            return { ...el, data: { ...el.data, items: updatedItems, img: imageUrl } };
          }
          return { ...el, data: { ...el.data, img: imageUrl } };
        })
      );

      if (!data.isNew && data.draggedElementId) {
        setElements((prev) => prev.filter((el) => el.id !== data.draggedElementId));
      }

      setSelectedElementId(blockId);
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
    if (type === 'BlockFeat4ColImg' || type === 'Col4') {
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
    if (type === 'BlockFeat3ColImg' || type === 'Col3') {
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
    if (type === 'BlockFeat2ColIconsLeft' || type === 'Col2') {
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
        children: [],
      };
    }
    if (type === 'Section' || type === 'BlockSectionFull') {
      return {
        title: '',
        isFullWidth: true,
        bgColor: '#0F172A',
        bgImage: '',
        bgOverlay: 0,
        bgSize: 'cover',
        bgPosition: 'center',
        textColor: '#ffffff',
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

  const handleAddElement = (type: string, category: string, defaultContent: string) => {
    // If a container block is selected on the canvas, insert element directly into the container!
    if (selectedElementId) {
      const selectedEl = elements.find((e) => e.id === selectedElementId);
      if (selectedEl && (selectedEl.type === 'ContentBox' || selectedEl.type === 'Section' || selectedEl.type === 'BlockSectionFull')) {
        const newChild: CanvasElement = {
          id: `child-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          type,
          category,
          content: defaultContent,
          data: getDefaultBlockData(type, defaultContent),
        };
        const currentChildren = selectedEl.data?.children || [];
        handleUpdateElementData(selectedEl.id, { children: [...currentChildren, newChild] });
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

    // Default: Add standalone element to canvas
    const newEl: CanvasElement = {
      id: `el-${Date.now()}`,
      type,
      category,
      content: defaultContent,
      data: getDefaultBlockData(type, defaultContent),
    };
    setElements((prev) => [...prev, newEl]);
    setSelectedElementId(newEl.id);
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
          content: JSON.stringify(elements),
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

  return (
    <div className="h-screen w-screen bg-slate-950 text-white flex flex-col overflow-hidden">
      
      {/* 1. TOP BUILDER TOOLBAR (INDEPENDENT WORKSPACE MODE) */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between shrink-0 z-40">
        
        {/* LEFT TOOLBAR CONTROLS */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => router.push('/admin/tunnels')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors cursor-pointer"
            title="Revenir à la liste de tous vos Tunnels de Vente"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#00A0FF]" />
            <span className="hidden sm:inline">Tunnels</span>
          </button>

          <button
            onClick={() => router.push(`/admin/tunnels/${params.id}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00A0FF] hover:bg-[#0080FF] text-white text-xs font-black rounded-xl shadow-md transition-transform active:scale-95 cursor-pointer"
            title="Revenir aux étapes du tunnel (http://localhost:3000/admin/tunnels/1e3dcc95-0846-4b37-bfc2-4b312c573b5d)"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span>← Retour au Tunnel</span>
          </button>

          <div className="h-5 w-px bg-slate-800" />

          {/* UNDO / REDO */}
          <div className="flex items-center gap-1">
            <button
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Annuler (Ctrl+Z)"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Rétablir (Ctrl+Y)"
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>

          <div className="h-5 w-px bg-slate-800" />

          {/* POPUP & PARAMÈTRES */}
          <button className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Popup</span>
          </button>
          <button className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-blue-400" />
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
          
          {/* DESKTOP / MOBILE / GRID TOGGLE & DISPLAY WIDTH BUTTONS */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1">
            <button
              type="button"
              onClick={() => setPreviewMode('DESKTOP')}
              className={`p-1.5 rounded-lg transition-all ${
                previewMode === 'DESKTOP' ? 'bg-[#00A0FF] text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Aperçu Ordinateur"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode('MOBILE')}
              className={`p-1.5 rounded-lg transition-all ${
                previewMode === 'MOBILE' ? 'bg-[#00A0FF] text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Aperçu Mobile"
            >
              <Smartphone className="w-4 h-4" />
            </button>
            <div className="h-4 w-px bg-slate-800 my-auto" />
            <button
              type="button"
              onClick={() => setShowCanvasGrid(!showCanvasGrid)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                showCanvasGrid
                  ? 'bg-[#00A0FF]/20 text-[#00A0FF] border border-[#00A0FF]/50 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Activer/Désactiver le grillage à carreaux pour l alignement"
            >
              <span>🏁 Grille {showCanvasGrid ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          {/* PAGE DISPLAY WIDTH SELECTOR (STANDARD 896px, LARGE 1152px, FULL SCREEN 100%) */}
          <div className="hidden lg:flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1">
            <button
              type="button"
              onClick={() => handleSetPageWidthMode('standard')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                pageWidthMode === 'standard' ? 'bg-[#00A0FF] text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Affichage Standard (896px - Centré)"
            >
              📱 Standard (896px)
            </button>
            <button
              type="button"
              onClick={() => handleSetPageWidthMode('wide')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                pageWidthMode === 'wide' ? 'bg-[#00A0FF] text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Affichage Large (1152px - Étendu)"
            >
              💻 Large (1152px)
            </button>
            <button
              type="button"
              onClick={() => handleSetPageWidthMode('full')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                pageWidthMode === 'full' ? 'bg-[#00A0FF] text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Affichage Plein Écran (100% - Full Width)"
            >
            </button>
          </div>

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
        
        {/* LEFT PALETTE / INSPECTOR PANEL (SCREENS 1, 2, 3, 4, 5) */}
        <div className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 h-full overflow-hidden">
          
          {/* PERMANENT LEFT PALETTE (ÉLÉMENTS & BLOCS) */}
            <>
              {/* TABS: ÉLÉMENTS / BLOCS */}
              <div className="p-3 border-b border-slate-800 grid grid-cols-2 gap-2 bg-slate-950 shrink-0">
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
              </div>

              {/* PALETTE CONTENT FOR ELEMENTS AND BLOCS TABS */}
              <div className="p-4 space-y-6 text-xs overflow-y-auto flex-1 builder-sidebar-scroll">
                
                {activeTab === 'ELEMENTS' && (
                  <>
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

                {/* CATEGORY 3: DISPOSITION DES COLONNES & SECTIONS FULL-WIDTH */}
                <div className="space-y-2.5">
                  <div className="font-heading font-black text-slate-400 uppercase tracking-wider text-[10px]">
                    Disposition & Sections Full-Width
                  </div>

                  {/* FULL-WIDTH SECTION BUTTON */}
                  <button
                    draggable
                    onDragStart={(e) => handlePaletteDragStart(e, 'Section', 'Disposition', 'SECTION PRINCIPALE (PLEIN ÉCRAN 100%)')}
                    onClick={() => handleAddElement('Section', 'Disposition', 'SECTION PRINCIPALE (PLEIN ÉCRAN 100%)')}
                    className="w-full p-3 bg-gradient-to-r from-purple-900/60 to-blue-900/60 hover:from-purple-800 hover:to-blue-800 border border-purple-500/50 rounded-xl flex items-center justify-between text-left transition-all group cursor-grab active:cursor-grabbing shadow-lg mb-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <Maximize2 className="w-5 h-5 text-purple-300 group-hover:text-white shrink-0" />
                      <div>
                        <div className="text-xs font-black text-white">Section HTML5 (100% Plein Écran)</div>
                        <div className="text-[10px] text-purple-200 font-medium leading-tight">Balise &lt;section&gt; bord à bord pour colonnes, conteneurs, formulaires, images &amp; textes</div>
                      </div>
                    </div>
                    <Plus className="w-4 h-4 text-purple-300 shrink-0" />
                  </button>

                  {/* BLOC DIV CONTENEUR BUTTON */}
                  <button
                    draggable
                    onDragStart={(e) => handlePaletteDragStart(e, 'ContentBox', 'Disposition', 'Conteneur DIV')}
                    onClick={() => handleAddElement('ContentBox', 'Disposition', 'Conteneur DIV')}
                    className="w-full p-3 bg-slate-950 hover:bg-slate-900 border border-blue-500/40 hover:border-blue-400 rounded-xl flex items-center justify-between text-left transition-all group cursor-grab active:cursor-grabbing shadow-md mb-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <Box className="w-5 h-5 text-[#00A0FF] group-hover:text-white shrink-0" />
                      <div>
                        <div className="text-xs font-black text-white">📦 Bloc DIV / Conteneur (Mise en Page)</div>
                        <div className="text-[10px] text-slate-400 font-medium leading-tight">Balise &lt;div&gt; souple pour regrouper et centrer vos éléments dans la section</div>
                      </div>
                    </div>
                    <Plus className="w-4 h-4 text-[#00A0FF] shrink-0" />
                  </button>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      draggable
                      onDragStart={(e) => handlePaletteDragStart(e, 'Col4', 'Disposition', '4 Colonnes')}
                      onClick={() => handleAddElement('Col4', 'Disposition', '4 Colonnes')}
                      className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl flex flex-col items-center justify-center gap-1.5 text-center transition-all group cursor-grab active:cursor-grabbing"
                    >
                      <LayoutGrid className="w-5 h-5 text-slate-400 group-hover:text-[#00A0FF]" />
                      <span className="text-[10px] font-bold text-slate-300">4 colonnes</span>
                    </button>

                    <button
                      draggable
                      onDragStart={(e) => handlePaletteDragStart(e, 'Col3', 'Disposition', '3 Colonnes')}
                      onClick={() => handleAddElement('Col3', 'Disposition', '3 Colonnes')}
                      className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl flex flex-col items-center justify-center gap-1.5 text-center transition-all group cursor-grab active:cursor-grabbing"
                    >
                      <Columns className="w-5 h-5 text-slate-400 group-hover:text-[#00A0FF]" />
                      <span className="text-[10px] font-bold text-slate-300">3 colonnes</span>
                    </button>

                    <button
                      draggable
                      onDragStart={(e) => handlePaletteDragStart(e, 'Col2', 'Disposition', '2 Colonnes')}
                      onClick={() => handleAddElement('Col2', 'Disposition', '2 Colonnes')}
                      className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl flex flex-col items-center justify-center gap-1.5 text-center transition-all group cursor-grab active:cursor-grabbing"
                    >
                      <Rows className="w-5 h-5 text-slate-400 group-hover:text-[#00A0FF]" />
                      <span className="text-[10px] font-bold text-slate-300">2 colonnes</span>
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

                    {/* THE 11 READY-TO-USE FEATURE BLOCKS (FROM USER SCREENSHOTS) */}
                    <div className="space-y-3">
                      {[
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
                        11 blocs &gt;
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

                  </div>
                )}
              </div>
            )}
          </div>
        </>
        </div>

        {/* RIGHT LIVE CANVAS WORKSPACE */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleCanvasDrop(e)}
          className="flex-1 bg-slate-950 p-4 sm:p-6 overflow-y-auto flex justify-center"
        >
          <div
            className={`w-full bg-slate-900 rounded-3xl border border-slate-800 p-0 overflow-hidden shadow-2xl transition-all ${
              previewMode === 'MOBILE'
                ? 'max-w-sm'
                : pageWidthMode === 'full'
                ? 'max-w-full'
                : pageWidthMode === 'wide'
                ? 'max-w-6xl'
                : 'max-w-4xl'
            } ${
              showCanvasGrid
                ? 'bg-[linear-gradient(to_right,rgba(0,160,255,0.22)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,160,255,0.22)_1px,transparent_1px)] bg-[size:20px_20px]'
                : ''
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
                  ? 'h-14 bg-[#00A0FF]/30 border-2 border-dashed border-[#00A0FF] text-[#00A0FF] shadow-lg ring-4 ring-[#00A0FF]/40'
                  : 'h-2 bg-transparent hover:h-8 hover:bg-emerald-950/40 hover:border-b hover:border-emerald-500/40 text-emerald-400'
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
                const isSelected = el.id === selectedElementId;

                return (
                  <React.Fragment key={el.id}>
                  <div
                    key={el.id}
                    draggable
                    onDragStart={(e) => handleCanvasElementDragStart(e, idx, el.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.stopPropagation();
                      handleCanvasDrop(e, idx);
                    }}
                    onClick={() => setSelectedElementId(el.id)}
                    className={`relative rounded-2xl border-2 transition-all cursor-move group ${
                      isSelected
                        ? 'border-[#00A0FF] bg-blue-500/10 ring-2 ring-[#00A0FF]/30'
                        : 'border-slate-800/80 hover:border-slate-700 bg-slate-950/40'
                    }`}
                    style={{
                      marginTop: `${el.data?.marginTop || 0}px`,
                      marginRight: `${el.data?.marginRight || 0}px`,
                      marginBottom: `${el.data?.marginBottom || 0}px`,
                      marginLeft: `${el.data?.marginLeft || 0}px`,
                      paddingTop: `${el.data?.paddingTop !== undefined ? el.data.paddingTop : 16}px`,
                      paddingRight: `${el.data?.paddingRight !== undefined ? el.data.paddingRight : 16}px`,
                      paddingBottom: `${el.data?.paddingBottom !== undefined ? el.data.paddingBottom : 16}px`,
                      paddingLeft: `${el.data?.paddingLeft !== undefined ? el.data.paddingLeft : 16}px`,
                    }}
                  >
                    {/* SYSTEME.IO STYLE FLOATING HOVER TOOLBAR BADGE FOR ROOT ELEMENTS */}
                    <div
                      className={`absolute -top-3.5 left-3 z-30 transition-all duration-200 flex items-center shadow-xl font-sans text-xs ${
                        isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      {/* TYPE NAME BADGE */}
                      <div
                        className={`text-white px-2.5 py-1 rounded-l-lg font-black text-[11px] uppercase tracking-wider flex items-center gap-1 shadow-md ${
                          el.type === 'Section' || el.type === 'BlockSectionFull'
                            ? 'bg-purple-600'
                            : el.type === 'ContentBox'
                            ? 'bg-sky-500'
                            : 'bg-[#FF7700]'
                        }`}
                      >
                        <span>{el.type === 'Section' ? 'Section HTML5' : el.type === 'ContentBox' ? 'Conteneur DIV' : el.type}</span>
                        <span className="text-[10px]">⬇️</span>
                      </div>

                      {/* ACTIONS BADGE */}
                      <div
                        className={`text-white px-1.5 py-1 rounded-r-lg flex items-center gap-1 shadow-md border-l ${
                          el.type === 'Section' || el.type === 'BlockSectionFull'
                            ? 'bg-purple-600 border-purple-700'
                            : el.type === 'ContentBox'
                            ? 'bg-sky-500 border-sky-600'
                            : 'bg-[#FF7700] border-amber-600'
                        }`}
                      >
                        {/* ⚙️ PARAMÈTRES / INSPECTEUR */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedElementId(el.id);
                          }}
                          className="p-1 hover:bg-black/20 rounded transition-colors"
                          title="⚙️ Paramètres du bloc"
                        >
                          <Settings className="w-3.5 h-3.5 text-white" />
                        </button>

                        {/* 📋 DUPLIQUER */}
                        <button
                          type="button"
                          onClick={(e) => handleDuplicateElement(el.id, e)}
                          className="p-1 hover:bg-black/20 rounded transition-colors"
                          title="📋 Dupliquer le bloc"
                        >
                          <Copy className="w-3.5 h-3.5 text-white" />
                        </button>

                        {/* ▲ MONTER */}
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={(e) => moveElementToPosition(idx, 'up', e)}
                          className="p-1 hover:bg-black/20 rounded transition-colors disabled:opacity-40"
                          title="▲ Monter"
                        >
                          <ChevronUp className="w-3.5 h-3.5 text-white" />
                        </button>

                        {/* ▼ DESCENDRE */}
                        <button
                          type="button"
                          disabled={idx === elements.length - 1}
                          onClick={(e) => moveElementToPosition(idx, 'down', e)}
                          className="p-1 hover:bg-black/20 rounded transition-colors disabled:opacity-40"
                          title="▼ Descendre"
                        >
                          <ChevronDown className="w-3.5 h-3.5 text-white" />
                        </button>

                        {/* 🗑️ SUPPRIMER */}
                        <button
                          type="button"
                          onClick={(e) => handleDeleteElement(el.id, e)}
                          className="p-1 hover:bg-red-700 rounded transition-colors"
                          title="🗑️ Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-white" />
                        </button>
                      </div>
                    </div>

                    {/* ELEMENT TYPE CONTENT RENDERERS WITH DYNAMIC CUSTOMIZABLE DATA */}
                    {el.type === 'Heading' && (
                      <input
                        type="text"
                        value={el.content}
                        onChange={(e) => {
                          const val = e.target.value;
                          setElements((prev) => prev.map((item) => (item.id === el.id ? { ...item, content: val } : item)));
                        }}
                        className="w-full text-2xl sm:text-4xl font-heading font-black text-white bg-transparent border-b border-transparent focus:border-[#00A0FF] outline-none rounded-lg px-2 py-1 transition-all hover:bg-white/5 focus:bg-slate-900/80"
                        placeholder="Votre titre ici..."
                      />
                    )}

                    {el.type === 'Text' && (
                      <textarea
                        value={el.content}
                        onChange={(e) => {
                          const val = e.target.value;
                          setElements((prev) => prev.map((item) => (item.id === el.id ? { ...item, content: val } : item)));
                        }}
                        rows={2}
                        className="w-full text-sm text-slate-300 leading-relaxed font-medium bg-transparent border border-transparent focus:border-[#00A0FF] outline-none resize-none rounded-lg p-2 transition-all hover:bg-white/5 focus:bg-slate-900/80"
                        placeholder="Votre texte ici..."
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
                      <div className="aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
                        <img src={el.content} alt="Preview" className="w-full h-full object-cover" />
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
                          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                          onDrop={(e) => handleBlockDrop(e, el.id)}
                          style={{ backgroundColor: mainBg, color: textColor }}
                          className="p-6 sm:p-8 rounded-3xl shadow-xl space-y-6 border-2 border-dashed border-[#00A0FF]/60 hover:border-[#00A0FF] relative transition-all group/box"
                        >
                          <div className="flex items-center justify-between border-b border-slate-100/60 pb-3">
                            <input
                              type="text"
                              value={el.data?.title || el.content || 'Conteneur d éléments...'}
                              onChange={(e) => {
                                const val = e.target.value;
                                handleUpdateElementData(el.id, { title: val });
                                handleUpdateElementContent(el.id, val);
                              }}
                              style={{ color: textColor }}
                              className="text-xl font-heading font-black bg-transparent outline-none border-b border-transparent focus:border-[#00A0FF]"
                            />
                            <span className="text-[10px] font-bold text-[#00A0FF] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100 flex items-center gap-1">
                              <span>📦 Boîte Conteneur Réceptrice</span>
                            </span>
                          </div>

                        {/* RENDER NESTED CHILDREN IN THE CONTAINER */}
                        {(!el.data?.children || el.data.children.length === 0) ? (
                          <div className="p-10 border-2 border-dashed border-[#00A0FF]/40 bg-blue-50/40 rounded-2xl text-center space-y-3">
                            <div className="w-12 h-12 bg-[#00A0FF]/10 text-[#00A0FF] rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">
                              📥
                            </div>
                            <div className="text-base font-extrabold text-slate-800">
                              Glissez-déposez n importe quel élément ici
                            </div>
                            <div className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
                              Glissez des images, titres, paragraphes ou boutons depuis le menu à gauche pour les disposer côte à côte ou en liste dans ce conteneur.
                            </div>
                          </div>
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
                                  style={{ backgroundColor: (child as any).bgColor || cardBg, color: (child as any).textColor || textColor }}
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
                    {(el.type === 'Section' || el.type === 'BlockSectionFull') && (() => {
                      const mainBg = el.data?.bgColor || '#0F172A';
                      const bgImage = el.data?.bgImage || '';
                      const bgOverlay = el.data?.bgOverlay !== undefined ? el.data.bgOverlay : 0;
                      const bgSize = el.data?.bgSize || 'cover';
                      const bgPos = el.data?.bgPosition || 'center';
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
                            backgroundImage: bgImage ? `url(${bgImage})` : undefined,
                            backgroundSize: bgSize,
                            backgroundPosition: bgPos,
                            color: textColor,
                            minHeight: el.data?.minHeight ? `${el.data.minHeight}px` : undefined,
                          }}
                          className="relative w-full p-6 sm:p-10 shadow-2xl transition-all my-0 group/section border-2 border-dashed border-purple-500/60 hover:border-purple-400"
                        >
                          {/* OVERLAY TINT FOR READABILITY */}
                          {bgOverlay > 0 && (
                            <div
                              className="absolute inset-0 pointer-events-none z-0"
                              style={{ backgroundColor: `rgba(0,0,0,${bgOverlay / 100})` }}
                            />
                          )}

                          <div className={`relative z-10 ${innerWidthClass} space-y-6`}>
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
                                <span className="text-[10px] font-bold text-purple-300 bg-purple-950/80 px-3 py-1 rounded-full border border-purple-700 shrink-0 flex items-center gap-1.5 shadow-sm">
                                  🏛️ Section HTML5 (100% Plein Écran)
                                </span>
                              </div>
                            )}

                            {/* RENDER NESTED CHILDREN INSIDE THE FULL SECTION */}
                            {(!el.data?.children || el.data.children.length === 0) ? (
                              <div className="p-12 border-2 border-dashed border-purple-400/40 bg-purple-950/30 rounded-3xl text-center space-y-3">
                                <div className="w-14 h-14 bg-purple-500/20 text-purple-300 rounded-2xl flex items-center justify-center mx-auto text-3xl font-bold">
                                  🏛️
                                </div>
                                <div className="text-lg font-black text-white">
                                  Glissez-déposez n importe quel élément ou colonne ici
                                </div>
                                <div className="text-xs text-purple-200 font-medium max-w-md mx-auto leading-relaxed">
                                  Glissez vos colonnes (4, 3, 2 colonnes), votre conteneur d éléments, vos formulaires, images ou textes. Cette section s étendra à 100% sur toute la largeur de l écran de vos visiteurs !
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-6">
                                {(el.data?.children || []).map((child: CanvasElement, cIdx: number) => (
                                   <div
                                     key={child.id || cIdx}
                                     onClick={(e) => {
                                       e.stopPropagation();
                                       setSelectedElementId(el.id);
                                       setSelectedChildIndex(cIdx);
                                       setSelectedSubItem(null);
                                     }}
                                     className={`relative group/child p-3 rounded-2xl border transition-all ${
                                       selectedChildIndex === cIdx
                                         ? 'border-[#00A0FF] bg-blue-500/10 ring-2 ring-[#00A0FF]/40 shadow-lg'
                                         : 'border-transparent hover:border-amber-500/60 bg-slate-900/30'
                                     }`}
                                   >
                                     {/* SYSTEME.IO STYLE FLOATING HOVER TOOLBAR BADGE FOR CHILD ELEMENTS */}
                                     <div
                                       className={`absolute -top-3.5 left-3 z-30 transition-all duration-200 flex items-center shadow-xl font-sans text-xs ${
                                         selectedChildIndex === cIdx ? 'opacity-100' : 'opacity-0 group-hover/child:opacity-100'
                                       }`}
                                     >
                                       {/* TYPE NAME BADGE */}
                                       <div
                                         className={`text-white px-2.5 py-1 rounded-l-lg font-black text-[11px] uppercase tracking-wider flex items-center gap-1 shadow-md ${
                                           child.type === 'ContentBox' ? 'bg-sky-500' : 'bg-[#FF7700]'
                                         }`}
                                       >
                                         <span>{child.type === 'ContentBox' ? 'Conteneur DIV' : child.type}</span>
                                         <span className="text-[10px]">⬇️</span>
                                       </div>

                                       {/* ACTIONS BADGE */}
                                       <div
                                         className={`text-white px-1.5 py-1 rounded-r-lg flex items-center gap-1 shadow-md border-l ${
                                           child.type === 'ContentBox' ? 'bg-sky-500 border-sky-600' : 'bg-[#FF7700] border-amber-600'
                                         }`}
                                       >
                                         {/* ⚙️ CONTROLLER / INSPECTER */}
                                         <button
                                           type="button"
                                           onClick={(e) => {
                                             e.stopPropagation();
                                             setSelectedElementId(el.id);
                                             setSelectedChildIndex(cIdx);
                                             setSelectedSubItem(null);
                                           }}
                                           className="p-1 hover:bg-black/20 rounded transition-colors"
                                           title="⚙️ Contrôler le bloc / Paramètres"
                                         >
                                           <Settings className="w-3.5 h-3.5 text-white" />
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
                                           className="p-1 hover:bg-black/20 rounded transition-colors"
                                           title="📋 Dupliquer le bloc"
                                         >
                                           <Copy className="w-3.5 h-3.5 text-white" />
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
                                           className="p-1 hover:bg-black/20 rounded transition-colors disabled:opacity-40"
                                           title="▲ Monter"
                                         >
                                           <ChevronUp className="w-3.5 h-3.5 text-white" />
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
                                           className="p-1 hover:bg-black/20 rounded transition-colors disabled:opacity-40"
                                           title="▼ Descendre"
                                         >
                                           <ChevronDown className="w-3.5 h-3.5 text-white" />
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
                                           className="p-1 hover:bg-red-700 rounded transition-colors"
                                           title="🗑️ Supprimer le bloc"
                                         >
                                           <Trash2 className="w-3.5 h-3.5 text-white" />
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
                                        className="w-full text-xl sm:text-2xl font-heading font-black bg-transparent border-b border-transparent focus:border-[#00A0FF] outline-none"
                                      />
                                    )}

                                    {child.type === 'Text' && (
                                      <textarea
                                        rows={3}
                                        value={child.content}
                                        onChange={(e) => {
                                          const updated = el.data.children.map((ch: any, i: number) =>
                                            i === cIdx ? { ...ch, content: e.target.value } : ch
                                          );
                                          handleUpdateElementData(el.id, { children: updated });
                                        }}
                                        className="w-full text-sm leading-relaxed bg-transparent border border-transparent focus:border-[#00A0FF] outline-none resize-y"
                                      />
                                    )}

                                    {child.type === 'Image' && (
                                      <div className="space-y-2">
                                        <div className="max-w-sm rounded-xl overflow-hidden shadow-md border border-white/10 max-h-56">
                                          <img src={child.data?.img || child.content} alt="Child" className="w-full h-full object-cover" />
                                        </div>
                                        <input
                                          type="text"
                                          value={child.data?.img || child.content}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            const updated = el.data.children.map((ch: any, i: number) =>
                                              i === cIdx ? { ...ch, content: val, data: { ...ch.data, img: val } } : ch
                                            );
                                            handleUpdateElementData(el.id, { children: updated });
                                          }}
                                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono"
                                          placeholder="URL de l image..."
                                        />
                                      </div>
                                    )}

                                    {/* INTERACTIVE NESTED COLUMN CARDS IN SECTION */}
                                    {(child.type === 'Col4' || child.type === 'BlockFeat4ColImg' || child.type === 'Col3' || child.type === 'BlockFeat3ColImg' || child.type === 'Col2' || child.type === 'BlockFeat2ColIconsLeft') && (() => {
                                      const is4 = child.type.includes('4') || child.type === 'Col4';
                                      const is3 = child.type.includes('3') || child.type === 'Col3';
                                      const colsClass = is4 ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4' : is3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2';

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

                                      const itemsList = child.data?.items || getDefaultBlockData(child.type, child.content).items;

                                      return (
                                        <div className={`grid ${colsClass} gap-4 p-4 bg-slate-950/60 rounded-3xl border border-white/10`}>
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
                                                className={`p-4 rounded-2xl border-2 transition-all space-y-3 flex flex-col items-center relative group/card cursor-pointer ${
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
                                                    (it.imgShape || child.data?.imgShape || 'arcade') === 'arcade'
                                                      ? 'rounded-t-[80px]'
                                                      : (it.imgShape || child.data?.imgShape) === 'circle'
                                                      ? 'rounded-full'
                                                      : (it.imgShape || child.data?.imgShape) === 'square'
                                                      ? 'rounded-none'
                                                      : 'rounded-2xl'
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
                                                    🎯 Sélectionner la carte
                                                  </div>
                                                </div>

                                                {/* INLINE EDITABLE TITRE */}
                                                <input
                                                  type="text"
                                                  value={it.title || ''}
                                                  onChange={(e) => updateNestedColumnItem(idx, { title: e.target.value })}
                                                  className="w-full text-center text-xs font-heading font-black uppercase bg-transparent border-b border-transparent focus:border-[#00A0FF] outline-none"
                                                  style={{ color: it.textColor || '#ffffff' }}
                                                  placeholder="Titre de la carte..."
                                                />

                                                {/* INLINE EDITABLE DESCRIPTION */}
                                                <textarea
                                                  rows={2}
                                                  value={it.desc || ''}
                                                  onChange={(e) => updateNestedColumnItem(idx, { desc: e.target.value })}
                                                  className="w-full text-center text-[10px] bg-transparent border border-transparent focus:border-[#00A0FF] outline-none resize-none leading-relaxed"
                                                  style={{ color: it.textColor ? `${it.textColor}cc` : '#94a3b8' }}
                                                  placeholder="Description..."
                                                />

                                                {/* QUICK COLOR PICKERS ON CARD */}
                                                <div className="w-full pt-2 border-t border-white/10 flex items-center justify-between text-[9px] gap-1">
                                                  <div className="flex items-center gap-1">
                                                    <span className="text-slate-400 font-bold">Fond:</span>
                                                    <input
                                                      type="color"
                                                      value={it.bgColor || '#0f172a'}
                                                      onChange={(e) => updateNestedColumnItem(idx, { bgColor: e.target.value })}
                                                      className="w-4 h-4 rounded cursor-pointer border-none bg-transparent"
                                                      title="Couleur de fond"
                                                    />
                                                  </div>
                                                  <div className="flex items-center gap-1">
                                                    <span className="text-slate-400 font-bold">Texte:</span>
                                                    <input
                                                      type="color"
                                                      value={it.textColor || '#ffffff'}
                                                      onChange={(e) => updateNestedColumnItem(idx, { textColor: e.target.value })}
                                                      className="w-4 h-4 rounded cursor-pointer border-none bg-transparent"
                                                      title="Couleur de texte"
                                                    />
                                                  </div>
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      );
                                    })()}

                                    {child.type === 'ContentBox' && (
                                      <div className="p-4 bg-slate-950/60 rounded-2xl border border-dashed border-[#00A0FF] space-y-3">
                                        <div className="text-xs font-bold text-[#00A0FF]">📦 Conteneur d éléments imbriqué</div>
                                        <div className="text-xs text-slate-400">Insérez d autres cartes et éléments ici...</div>
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
                                ))}
                              </div>
                            )}
                          </div>

                          {/* INTERACTIVE BOTTOM RESIZE DRAG HANDLE BAR */}
                          <div
                            onMouseDown={(e) => handleStartSectionResize(e, el.id)}
                            title="Cliquer et glisser vers le haut/bas pour régler la hauteur"
                            className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-purple-950/90 to-transparent hover:from-purple-600/90 hover:to-purple-900/70 cursor-ns-resize flex items-center justify-center group/resize transition-all z-20"
                          >
                            <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-900/90 text-white font-mono text-[10px] border border-purple-400 shadow-md group-hover/resize:scale-110 transition-transform">
                              <span className="text-xs">↕️</span>
                              <span>Tirer pour ajuster la hauteur {el.data?.minHeight ? `(${el.data.minHeight}px)` : ''}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* RICH DYNAMIC PRE-FILLED FEATURE BLOCKS RENDERERS WITH CLICK-TO-EDIT SUB-ITEMS */}
                    {(el.type === 'BlockFeat4ColImg' || el.type === 'Col4') && (() => {
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

                  {(el.type === 'BlockFeat3ColImg' || el.type === 'Col3') && (() => {
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
                    {!['Heading', 'Text', 'BulletList', 'Image', 'OptinForm', 'FormInput', 'ButtonCTA', 'Checkbox', 'Video', 'Audio', 'Countdown', 'Divider', 'BlockFeat4ColImg', 'BlockFeat3ColImg', 'BlockFeat2ColIconsLeft', 'BlockFeat4ColDark', 'Col4', 'Col3', 'Col2', 'BlockNavArizona', 'BlockHeroArizona', 'BlockBioArizona', 'BlockSoulSistersArizona', 'Block3ColArcadeArizona'].includes(el.type) && (
                      <div className="p-6 bg-white text-slate-900 rounded-3xl shadow-xl space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-[#00A0FF]/20 text-[#00A0FF] flex items-center justify-center font-bold text-xs">
                            👍
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
                          {(el.data?.items && el.data.items.length > 0
                            ? el.data.items
                            : [
                                { id: '1', title: 'Élément #1', desc: 'Description pré-remplie prêt à personnaliser.' },
                                { id: '2', title: 'Élément #2', desc: 'Description pré-remplie prêt à personnaliser.' },
                                { id: '3', title: 'Élément #3', desc: 'Description pré-remplie prêt à personnaliser.' },
                              ]
                          ).map((item: any, i: number) => (
                            <div key={item.id || i} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
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
                    className={`transition-all rounded-xl cursor-pointer flex items-center justify-center gap-2 font-bold text-xs my-2 ${
                      dragOverIndex === idx + 1
                        ? 'h-12 bg-[#00A0FF]/20 border-2 border-dashed border-[#00A0FF] text-[#00A0FF] shadow-lg ring-4 ring-[#00A0FF]/30 scale-[1.01]'
                        : 'h-3 hover:h-8 bg-transparent hover:bg-slate-800/60 border border-dashed border-transparent hover:border-slate-700 text-slate-400 opacity-60 hover:opacity-100'
                    }`}
                  >
                    {dragOverIndex === idx + 1 ? (
                      <>
                        <span>📍</span>
                        <span>✨ Relâcher pour insérer ici (Position #{idx + 2})</span>
                      </>
                    ) : (
                      <span className="hidden hover:inline">➕ Déposer ici (Position #{idx + 2})</span>
                    )}
                  </div>
                </React.Fragment>
              );
              })}
            </div>

          </div>
        </div>

        {/* RIGHT SIDEBAR INSPECTOR PANEL (Appears on right when an element is clicked) */}
        {selectedElementId && (
          <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 h-full overflow-hidden shadow-2xl animate-in slide-in-from-right duration-200">
            {(() => {
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
                } else {
                  const updatedItems = elItems.map((it: any, idx: number) =>
                    idx === selectedSubItem.itemIndex ? { ...it, ...changes } : it
                  );
                  handleUpdateElementData(selectedEl.id, { items: updatedItems });
                }
              };

              return (
                <div className="flex flex-col h-full text-slate-200 overflow-hidden">
                  {/* TOP HEADER MATCHING SCREENSHOT 3: < Retour | Section > Rangée > Image */}
                  <div className="p-3 border-b border-slate-800 bg-slate-950 flex items-center justify-between gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setSelectedElementId(null);
                        setSelectedSubItem(null);
                      }}
                      className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors shrink-0"
                      title="Fermer l'inspecteur"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (selectedSubItem) {
                          setSelectedSubItem(null);
                        } else {
                          setSelectedElementId(null);
                        }
                      }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1 border border-slate-700 transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>&lt; Retour</span>
                    </button>
                    <div className="text-[11px] font-bold text-slate-400 truncate">
                      Section &gt; Rangée &gt;{' '}
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
                  </div>

                  {/* INSPECTOR CONTROLS SCROLLABLE CONTAINER */}
                  <div className="p-4 space-y-5 text-xs overflow-y-auto flex-1 builder-sidebar-scroll">
                    
                    {/* CONTRÔLE DU BLOC INTÉGRÉ ENTIER DANS LA SECTION */}
                    {selectedChildIndex !== null && !selectedSubItem && selectedEl.data?.children?.[selectedChildIndex] && (() => {
                      const activeChild = selectedEl.data.children[selectedChildIndex];
                      const activeShape = activeChild.data?.imgShape || 'arcade';

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

                          {/* FORME & DÉCOUPE DE TOUTES LES IMAGES DU BLOC */}
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-[#00A0FF] uppercase tracking-wider block">
                              🏛️ Forme & Découpe de TOUTES les Images du Bloc
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { key: 'arcade', label: '🏛️ Arche Arizona' },
                                { key: 'circle', label: '⚪ Cercle' },
                                { key: 'rounded-3xl', label: '🔲 Arrondi 3XL' },
                                { key: 'square', label: '⬛ Droit' },
                              ].map((s) => (
                                <button
                                  key={s.key}
                                  type="button"
                                  onClick={() => {
                                    const currentChildren = [...(selectedEl.data?.children || [])];
                                    const targetChild = currentChildren[selectedChildIndex];
                                    const currentItems = targetChild.data?.items || getDefaultBlockData(targetChild.type, targetChild.content).items || [];
                                    const updatedItems = currentItems.map((it: any) => ({ ...it, imgShape: s.key }));

                                    currentChildren[selectedChildIndex] = {
                                      ...targetChild,
                                      data: {
                                        ...(targetChild.data || {}),
                                        imgShape: s.key,
                                        items: updatedItems,
                                      },
                                    };
                                    handleUpdateElementData(selectedEl.id, { children: currentChildren });
                                  }}
                                  className={`py-2.5 px-2 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
                                    activeShape === s.key
                                      ? 'bg-[#00A0FF] text-white border-[#00A0FF] shadow-lg ring-2 ring-[#00A0FF]/40'
                                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white'
                                  }`}
                                >
                                  {s.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* COULEURS DE TOUTES LES CARTES DE LA COLONNE */}
                          <div className="space-y-2 pt-2 border-t border-slate-800">
                            <label className="text-[10px] font-black text-[#00A0FF] uppercase tracking-wider block">
                              🎨 Arrière-plan de TOUTES les cartes du bloc
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={activeChild.data?.cardBgColor || '#0f172a'}
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
                                className="w-8 h-8 rounded-lg cursor-pointer bg-slate-900 border border-slate-800"
                              />
                              <span className="text-xs font-mono text-slate-300">
                                {activeChild.data?.cardBgColor || '#0f172a'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* IF A SPECIFIC SUB-ITEM (IMAGE, TITLE, DESC) WAS CLICKED DIRECTLY */}
                    {selectedSubItem && currentSubItem ? (
                      <div className="space-y-4">
                        {/* 1. IF CLICKED SUB-ITEM IS AN IMAGE */}
                        {selectedSubItem.subType === 'image' && (
                          <>
                             {/* 1. SECTION FICHIER DE L IMAGE */}
                             <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden transition-all">
                               <button
                                 type="button"
                                 onClick={() => toggleAccordion('imageFile')}
                                 className="w-full px-4 py-3 bg-slate-950 hover:bg-slate-900 flex items-center justify-between transition-colors text-left"
                               >
                                 <span className="font-bold text-xs text-white flex items-center gap-2">
                                   <span className="text-[#00A0FF]">🖼️</span>
                                   <span>Fichier de l Image</span>
                                 </span>
                                 {openAccordion.imageFile ? (
                                   <ChevronDown className="w-4 h-4 text-[#00A0FF]" />
                                 ) : (
                                   <ChevronRight className="w-4 h-4 text-slate-500" />
                                 )}
                               </button>

                               {openAccordion.imageFile && (
                                 <div className="p-3.5 border-t border-slate-900 space-y-3 bg-slate-950/60">
                                   <div className="flex items-center justify-between">
                                     <label className="text-[10px] font-black text-[#00A0FF] uppercase tracking-wider block">
                                       Élément #{selectedSubItem.itemIndex + 1}
                                     </label>
                                     {currentSubItem.img && (
                                       <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded-full">
                                         ✓ Active
                                       </span>
                                     )}
                                   </div>

                                   <div className="flex items-center gap-2 pt-1">
                                     {currentSubItem.img && (
                                       <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-800 shrink-0 bg-slate-900 shadow-inner flex items-center justify-center">
                                         <img src={currentSubItem.img} alt="Aperçu" className="w-full h-full object-cover" />
                                       </div>
                                     )}

                                     <label className="flex-1 py-2.5 px-3 bg-[#00A0FF] hover:bg-[#0080FF] active:scale-[0.98] text-white rounded-xl cursor-pointer font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2">
                                       <span>📤</span>
                                       <span>{currentSubItem.img ? "Changer l'image (PC)" : "Choisir une image (PC)"}</span>
                                       <input
                                         type="file"
                                         accept="image/*"
                                         className="hidden"
                                         onChange={(e) => {
                                           const file = e.target.files?.[0];
                                           if (file) {
                                             const reader = new FileReader();
                                             reader.onload = (uploadEv) => {
                                               const url = uploadEv.target?.result as string;
                                               updateSubItemProperty({ img: url });
                                             };
                                             reader.readAsDataURL(file);
                                           }
                                         }}
                                       />
                                     </label>
                                   </div>
                                 </div>
                               )}
                             </div>

                             {/* 2. SECTION ALIGNEMENT ET RÉFÉRENCE */}
                             <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden transition-all">
                               <button
                                 type="button"
                                 onClick={() => toggleAccordion('align')}
                                 className="w-full px-4 py-3 bg-slate-950 hover:bg-slate-900 flex items-center justify-between transition-colors text-left"
                               >
                                 <span className="font-bold text-xs text-white flex items-center gap-2">
                                   <span className="text-base">📌</span>
                                   <span>Alignement & Référence</span>
                                 </span>
                                 {openAccordion.align ? (
                                   <ChevronDown className="w-4 h-4 text-[#00A0FF]" />
                                 ) : (
                                   <ChevronRight className="w-4 h-4 text-slate-500" />
                                 )}
                               </button>

                               {openAccordion.align && (
                                 <div className="p-3.5 border-t border-slate-900 space-y-3 bg-slate-950/60">
                                   <label className="flex items-center justify-between text-xs font-bold text-white cursor-pointer select-none">
                                     <span className="flex items-center gap-2">
                                       <span className="text-base">📌</span>
                                       <span className={currentSubItem.isFixedReference ? 'text-[#00A0FF]' : 'text-slate-200'}>
                                         Fixer comme référence
                                       </span>
                                     </span>
                                     <input
                                       type="checkbox"
                                       checked={!!currentSubItem.isFixedReference}
                                       onChange={(e) => {
                                         const val = e.target.checked;
                                         const updatedItems = elItems.map((it: any, idx: number) =>
                                           idx === selectedSubItem.itemIndex
                                             ? { ...it, isFixedReference: val }
                                             : { ...it, isFixedReference: false }
                                         );
                                         handleUpdateElementData(selectedEl.id, { items: updatedItems });
                                       }}
                                       className="w-4 h-4 rounded text-[#00A0FF] bg-slate-900 border-slate-700 cursor-pointer accent-[#00A0FF]"
                                     />
                                   </label>

                                   <p className="text-[10px] text-slate-400 leading-relaxed">
                                     {currentSubItem.isFixedReference
                                       ? `Modèle fixé (${currentSubItem.imgWidth || 280}px × ${currentSubItem.imgSize || 280}px). Cliquez ci-dessous pour tout aligner.`
                                       : 'Cochez pour définir cette image comme modèle de taille.'}
                                   </p>

                                   <button
                                     type="button"
                                     onClick={() => {
                                       const refItem = elItems.find((it: any) => it.isFixedReference) || currentSubItem;
                                       const targetW = refItem.imgWidth || 280;
                                       const targetH = refItem.imgSize || 280;

                                       const updatedItems = elItems.map((it: any) => ({
                                         ...it,
                                         imgWidth: targetW,
                                         imgSize: targetH,
                                       }));

                                       handleUpdateElementData(selectedEl.id, { items: updatedItems });
                                     }}
                                     className="w-full py-2.5 px-3 bg-[#00A0FF] hover:bg-[#0080FF] active:scale-[0.98] text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                                   >
                                     <span>📐</span>
                                     <span>Aligner toutes les images du bloc</span>
                                   </button>
                                 </div>
                               )}
                             </div>

                             {/* 3. SECTION PRINCIPALE : STYLES, DIMENSIONS & ESPACEMENTS */}
                             <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden transition-all">
                               {/* HEADER DE LA SECTION PRINCIPALE */}
                               <button
                                 type="button"
                                 onClick={() => toggleAccordion('stylesGroup')}
                                 className="w-full px-4 py-3 bg-slate-900/90 hover:bg-slate-900 flex items-center justify-between transition-colors text-left border-b border-slate-800/60"
                               >
                                 <span className="font-black text-xs text-[#00A0FF] flex items-center gap-2 uppercase tracking-wider">
                                   <span>🎨</span>
                                   <span>Styles, Dimensions & Marges</span>
                                 </span>
                                 {openAccordion.stylesGroup ? (
                                   <ChevronDown className="w-4 h-4 text-[#00A0FF]" />
                                 ) : (
                                   <ChevronRight className="w-4 h-4 text-slate-500" />
                                 )}
                               </button>

                               {/* CONTENEUR DES 4 SOUS-SECTIONS RETRACTABLES */}
                               {openAccordion.stylesGroup && (
                                 <div className="p-3 space-y-3 bg-slate-950/80">
                                   
                                   {/* 3.1 SOUS-SECTION : DIMENSION & ÉCHELLE */}
                                   <div className="bg-slate-900/90 rounded-xl border border-slate-800/80 overflow-hidden transition-all">
                                     <button
                                       type="button"
                                       onClick={() => toggleAccordion('dimensions')}
                                       className="w-full px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800/80 flex items-center justify-between transition-colors text-left"
                                     >
                                       <span className="font-bold text-[11px] text-white flex items-center gap-2">
                                         <span className="text-[#00A0FF]">📐</span>
                                         <span>Dimension & Échelle (Largeur / Hauteur / Zoom)</span>
                                       </span>
                                       {openAccordion.dimensions ? (
                                         <ChevronDown className="w-3.5 h-3.5 text-[#00A0FF]" />
                                       ) : (
                                         <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                                       )}
                                     </button>

                                     {openAccordion.dimensions && (
                                       <div className="p-3 border-t border-slate-800/60 space-y-3.5 bg-slate-950/40">
                                         {/* LARGEUR DE L IMAGE */}
                                         <div className="space-y-1.5">
                                           <div className="flex items-center justify-between text-[11px] font-bold">
                                             <span className="text-slate-300">Largeur de l image</span>
                                             <div className="flex items-center gap-1">
                                               <input
                                                 type="number"
                                                 value={currentSubItem.imgWidth || 280}
                                                 onChange={(e) => {
                                                   const val = Number(e.target.value);
                                                   const updatedItems = elItems.map((it: any, idx: number) =>
                                                     idx === selectedSubItem.itemIndex ? { ...it, imgWidth: val } : it
                                                   );
                                                   handleUpdateElementData(selectedEl.id, { items: updatedItems });
                                                 }}
                                                 className="w-14 px-2 py-0.5 bg-slate-900 border border-slate-800 rounded-lg text-center font-mono text-xs text-white"
                                               />
                                               <span className="text-slate-500 text-[10px]">px</span>
                                             </div>
                                           </div>
                                           <input
                                             type="range"
                                             min={50}
                                             max={800}
                                             value={currentSubItem.imgWidth || 280}
                                             onChange={(e) => {
                                               const val = Number(e.target.value);
                                               const updatedItems = elItems.map((it: any, idx: number) =>
                                                 idx === selectedSubItem.itemIndex ? { ...it, imgWidth: val } : it
                                               );
                                               handleUpdateElementData(selectedEl.id, { items: updatedItems });
                                             }}
                                             className="w-full accent-[#00A0FF]"
                                           />
                                         </div>

                                         {/* HAUTEUR / TAILLE DE L IMAGE */}
                                         <div className="space-y-1.5">
                                           <div className="flex items-center justify-between text-[11px] font-bold">
                                             <span className="text-slate-300">Hauteur / Taille de l image</span>
                                             <div className="flex items-center gap-1">
                                               <input
                                                 type="number"
                                                 value={currentSubItem.imgSize || 240}
                                                 onChange={(e) => {
                                                   const val = Number(e.target.value);
                                                   const updatedItems = elItems.map((it: any, idx: number) =>
                                                     idx === selectedSubItem.itemIndex ? { ...it, imgSize: val } : it
                                                   );
                                                   handleUpdateElementData(selectedEl.id, { items: updatedItems });
                                                 }}
                                                 className="w-14 px-2 py-0.5 bg-slate-900 border border-slate-800 rounded-lg text-center font-mono text-xs text-white"
                                               />
                                               <span className="text-slate-500 text-[10px]">px</span>
                                             </div>
                                           </div>
                                           <input
                                             type="range"
                                             min={50}
                                             max={800}
                                             value={currentSubItem.imgSize || 240}
                                             onChange={(e) => {
                                               const val = Number(e.target.value);
                                               const updatedItems = elItems.map((it: any, idx: number) =>
                                                 idx === selectedSubItem.itemIndex ? { ...it, imgSize: val } : it
                                               );
                                               handleUpdateElementData(selectedEl.id, { items: updatedItems });
                                             }}
                                             className="w-full accent-[#00A0FF]"
                                           />
                                         </div>

                                         {/* ZOOM & ÉCHELLE DE L IMAGE INTERNE */}
                                         <div className="space-y-1.5">
                                           <div className="flex items-center justify-between text-[11px] font-bold">
                                             <span className="text-[#00A0FF]">🔍 Zoom / Échelle interne</span>
                                             <span className="text-xs font-mono text-white">
                                               {currentSubItem.imgZoom || 100}%
                                             </span>
                                           </div>
                                           <input
                                             type="range"
                                             min={100}
                                             max={300}
                                             value={currentSubItem.imgZoom || 100}
                                             onChange={(e) => {
                                               const val = Number(e.target.value);
                                               const updatedItems = elItems.map((it: any, idx: number) =>
                                                 idx === selectedSubItem.itemIndex ? { ...it, imgZoom: val } : it
                                               );
                                               handleUpdateElementData(selectedEl.id, { items: updatedItems });
                                             }}
                                             className="w-full accent-[#00A0FF]"
                                           />
                                         </div>
                                       </div>
                                     )}
                                   </div>

                                   {/* 3.2 SOUS-SECTION : RECADRAGE & POSITION INTERNE */}
                                   <div className="bg-slate-900/90 rounded-xl border border-slate-800/80 overflow-hidden transition-all">
                                     <button
                                       type="button"
                                       onClick={() => toggleAccordion('crop')}
                                       className="w-full px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800/80 flex items-center justify-between transition-colors text-left"
                                     >
                                       <span className="font-bold text-[11px] text-white flex items-center gap-2">
                                         <span className="text-[#00A0FF]">🎯</span>
                                         <span>Recadrage & Position Interne</span>
                                       </span>
                                       {openAccordion.crop ? (
                                         <ChevronDown className="w-3.5 h-3.5 text-[#00A0FF]" />
                                       ) : (
                                         <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                                       )}
                                     </button>

                                     {openAccordion.crop && (
                                       <div className="p-3 border-t border-slate-800/60 space-y-3 bg-slate-950/40">
                                         {/* POSITION X (HORIZONTALE) */}
                                         <div className="space-y-1">
                                           <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                                             <span>Position Horizontale (X)</span>
                                             <span className="font-mono text-slate-400">
                                               {currentSubItem.posX !== undefined ? currentSubItem.posX : 50}%
                                             </span>
                                           </div>
                                           <input
                                             type="range"
                                             min={0}
                                             max={100}
                                             value={currentSubItem.posX !== undefined ? currentSubItem.posX : 50}
                                             onChange={(e) => {
                                               const val = Number(e.target.value);
                                               const updatedItems = elItems.map((it: any, idx: number) =>
                                                 idx === selectedSubItem.itemIndex ? { ...it, posX: val } : it
                                               );
                                               handleUpdateElementData(selectedEl.id, { items: updatedItems });
                                             }}
                                             className="w-full accent-[#00A0FF]"
                                           />
                                         </div>

                                         {/* POSITION Y (VERTICALE) */}
                                         <div className="space-y-1">
                                           <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                                             <span>Position Verticale (Y)</span>
                                             <span className="font-mono text-slate-400">
                                               {currentSubItem.posY !== undefined ? currentSubItem.posY : 50}%
                                             </span>
                                           </div>
                                           <input
                                             type="range"
                                             min={0}
                                             max={100}
                                             value={currentSubItem.posY !== undefined ? currentSubItem.posY : 50}
                                             onChange={(e) => {
                                               const val = Number(e.target.value);
                                               const updatedItems = elItems.map((it: any, idx: number) =>
                                                 idx === selectedSubItem.itemIndex ? { ...it, posY: val } : it
                                               );
                                               handleUpdateElementData(selectedEl.id, { items: updatedItems });
                                             }}
                                             className="w-full accent-[#00A0FF]"
                                           />
                                         </div>
                                         {/* MODE D AJUSTEMENT (OBJECT-FIT) */}
                                         <div className="space-y-1 pt-1">
                                           <label className="text-[10px] font-bold text-slate-400 block">Mode d ajustement</label>
                                           <select
                                             value={currentSubItem.objectFit || 'cover'}
                                             onChange={(e) => updateSubItemProperty({ objectFit: e.target.value })}
                                             className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-bold outline-none"
                                           >
                                             <option value="cover">Remplir le cadre (Cover)</option>
                                             <option value="contain">Ajuster sans rogner (Contain)</option>
                                             <option value="fill">Étirer (Fill)</option>
                                           </select>
                                         </div>
                                       </div>
                                     )}
                                   </div>

                                   {/* 3.3 SOUS-SECTION : ARRONDISSEMENT DES COINS */}
                                   <div className="bg-slate-900/90 rounded-xl border border-slate-800/80 overflow-hidden transition-all">
                                     <button
                                       type="button"
                                       onClick={() => toggleAccordion('border')}
                                       className="w-full px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800/80 flex items-center justify-between transition-colors text-left"
                                     >
                                       <span className="font-bold text-[11px] text-white flex items-center gap-2">
                                         <span className="text-[#00A0FF]">✨</span>
                                         <span>Arrondissement des Coins</span>
                                       </span>
                                       {openAccordion.border ? (
                                         <ChevronDown className="w-3.5 h-3.5 text-[#00A0FF]" />
                                       ) : (
                                         <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                                       )}
                                     </button>

                                     {openAccordion.border && (
                                       <div className="p-3 border-t border-slate-800/60 space-y-2 bg-slate-950/40">
                                         <div className="flex items-center justify-between text-[11px] font-bold">
                                           <span className="text-slate-300">Arrondissement des coins</span>
                                           <span className="text-xs font-mono text-slate-300">
                                             {currentSubItem.borderRadius !== undefined ? currentSubItem.borderRadius : 16}px
                                           </span>
                                         </div>
                                         <input
                                           type="range"
                                           min={0}
                                           max={60}
                                           value={currentSubItem.borderRadius !== undefined ? currentSubItem.borderRadius : 16}
                                           onChange={(e) => {
                                             const val = Number(e.target.value);
                                             const updatedItems = elItems.map((it: any, idx: number) =>
                                               idx === selectedSubItem.itemIndex ? { ...it, borderRadius: val } : it
                                             );
                                             handleUpdateElementData(selectedEl.id, { items: updatedItems });
                                           }}
                                           className="w-full accent-[#00A0FF]"
                                         />
                                       </div>
                                     )}
                                   </div>

                                   {/* 3.4 SOUS-SECTION : ESPACEMENTS & MARGES */}
                                   <div className="bg-slate-900/90 rounded-xl border border-slate-800/80 overflow-hidden transition-all">
                                     <button
                                       type="button"
                                       onClick={() => toggleAccordion('spacing')}
                                       className="w-full px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800/80 flex items-center justify-between transition-colors text-left"
                                     >
                                       <span className="font-bold text-[11px] text-white flex items-center gap-2">
                                         <span className="text-[#00A0FF]">📏</span>
                                         <span>Espacements & Marges (Padding / Margin)</span>
                                       </span>
                                       {openAccordion.spacing ? (
                                         <ChevronDown className="w-3.5 h-3.5 text-[#00A0FF]" />
                                       ) : (
                                         <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                                       )}
                                     </button>

                                     {openAccordion.spacing && (
                                       <div className="p-3 border-t border-slate-800/60 space-y-3 bg-slate-950/40">
                                         <div className="space-y-1">
                                           <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                                             <span>Marge Externe Haut/Bas (Margin Y)</span>
                                             <span className="font-mono text-slate-400">
                                               {currentSubItem.marginY || 0}px
                                             </span>
                                           </div>
                                           <input
                                             type="range"
                                             min={0}
                                             max={80}
                                             value={currentSubItem.marginY || 0}
                                             onChange={(e) => {
                                               const val = Number(e.target.value);
                                               const updatedItems = elItems.map((it: any, idx: number) =>
                                                 idx === selectedSubItem.itemIndex ? { ...it, marginY: val } : it
                                               );
                                               handleUpdateElementData(selectedEl.id, { items: updatedItems });
                                             }}
                                             className="w-full accent-[#00A0FF]"
                                           />
                                         </div>

                                         <div className="space-y-1">
                                           <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                                             <span>Remplissage Interne (Padding)</span>
                                             <span className="font-mono text-slate-400">
                                               {currentSubItem.padding || 0}px
                                             </span>
                                           </div>
                                           <input
                                             type="range"
                                             min={0}
                                             max={60}
                                             value={currentSubItem.padding || 0}
                                             onChange={(e) => {
                                               const val = Number(e.target.value);
                                               const updatedItems = elItems.map((it: any, idx: number) =>
                                                 idx === selectedSubItem.itemIndex ? { ...it, padding: val } : it
                                               );
                                               handleUpdateElementData(selectedEl.id, { items: updatedItems });
                                             }}
                                             className="w-full accent-[#00A0FF]"
                                           />
                                         </div>
                                       </div>
                                     )}
                                   </div>

                                 </div>
                               )}
                             </div>

                             {/* 7. SECTION ACTION SUR CLIC ET REDIRECTION */}
                             <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden transition-all">
                               <button
                                 type="button"
                                 onClick={() => toggleAccordion('action')}
                                 className="w-full px-4 py-3 bg-slate-950 hover:bg-slate-900 flex items-center justify-between transition-colors text-left"
                               >
                                 <span className="font-bold text-xs text-white flex items-center gap-2">
                                   <span className="text-[#00A0FF]">🔗</span>
                                   <span>Action sur Clic & Redirection</span>
                                 </span>
                                 {openAccordion.action ? (
                                   <ChevronDown className="w-4 h-4 text-[#00A0FF]" />
                                 ) : (
                                   <ChevronRight className="w-4 h-4 text-slate-500" />
                                 )}
                               </button>

                               {openAccordion.action && (
                                 <div className="p-3.5 border-t border-slate-900 space-y-3 bg-slate-950/60">
                                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                     Action sur une image cliquée
                                   </label>
                                   <select
                                     value={currentSubItem.clickAction || 'OpenURL'}
                                     onChange={(e) => {
                                       const val = e.target.value;
                                       const updatedItems = elItems.map((it: any, idx: number) =>
                                         idx === selectedSubItem.itemIndex ? { ...it, clickAction: val } : it
                                       );
                                       handleUpdateElementData(selectedEl.id, { items: updatedItems });
                                     }}
                                     className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-bold outline-none"
                                   >
                                     <option value="None">Aucune (None)</option>
                                     <option value="OpenURL">Ouvrir l URL de redirection</option>
                                     <option value="OpenPopup">Ouvrir la fenêtre Popup</option>
                                   </select>

                                   {(currentSubItem.clickAction || 'OpenURL') === 'OpenURL' && (
                                     <div className="space-y-1 pt-1">
                                       <label className="text-[10px] font-bold text-slate-400">
                                         URL de redirection (ex: https://...)
                                       </label>
                                       <input
                                         type="text"
                                         value={currentSubItem.redirectUrl || ''}
                                         placeholder="https://votre-site.com/offre"
                                         onChange={(e) => {
                                           const val = e.target.value;
                                           const updatedItems = elItems.map((it: any, idx: number) =>
                                             idx === selectedSubItem.itemIndex ? { ...it, redirectUrl: val } : it
                                           );
                                           handleUpdateElementData(selectedEl.id, { items: updatedItems });
                                         }}
                                         className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono"
                                       />
                                     </div>
                                   )}
                                 </div>
                               )}
                             </div>

                            {/* ATTRIBUT ALT & REMPLIR À 100% */}
                            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  Attribut Alt
                                </label>
                                <input
                                  type="text"
                                  value={currentSubItem.alt || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const updatedItems = elItems.map((it: any, idx: number) =>
                                      idx === selectedSubItem.itemIndex ? { ...it, alt: val } : it
                                    );
                                    handleUpdateElementData(selectedEl.id, { items: updatedItems });
                                  }}
                                  placeholder="Texte alternatif..."
                                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300"
                                />
                              </div>

                              <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer pt-1">
                                <input
                                  type="checkbox"
                                  checked={currentSubItem.fullWidth || false}
                                  onChange={(e) => {
                                    const val = e.target.checked;
                                    const updatedItems = elItems.map((it: any, idx: number) =>
                                      idx === selectedSubItem.itemIndex ? { ...it, fullWidth: val } : it
                                    );
                                    handleUpdateElementData(selectedEl.id, { items: updatedItems });
                                  }}
                                  className="w-4 h-4 rounded text-[#00A0FF] bg-slate-900 border-slate-800"
                                />
                                <span>Remplir à 100% en largeur</span>
                              </label>
                            </div>
                          </>
                        )}

                        {/* 2. IF CLICKED SUB-ITEM IS A TITLE */}
                        {selectedSubItem.subType === 'title' && (
                          <div className="space-y-3 p-3 bg-slate-950 rounded-2xl border border-slate-800">
                            <label className="text-[10px] font-black text-[#00A0FF] uppercase tracking-wider block">
                              Titre de l élément #{selectedSubItem.itemIndex + 1}
                            </label>
                            <input
                              type="text"
                              value={currentSubItem.title || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                const updatedItems = elData.items.map((it: any, idx: number) =>
                                  idx === selectedSubItem.itemIndex ? { ...it, title: val } : it
                                );
                                handleUpdateElementData(selectedEl.id, { items: updatedItems });
                              }}
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-bold outline-none focus:border-[#00A0FF]"
                            />
                          </div>
                        )}

                        {/* 3. IF CLICKED SUB-ITEM IS A DESCRIPTION */}
                        {selectedSubItem.subType === 'desc' && (
                          <div className="space-y-3 p-3 bg-slate-950 rounded-2xl border border-slate-800">
                            <label className="text-[10px] font-black text-[#00A0FF] uppercase tracking-wider block">
                              Description de l élément #{selectedSubItem.itemIndex + 1}
                            </label>
                            <textarea
                              rows={4}
                              value={currentSubItem.desc || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                const updatedItems = elData.items.map((it: any, idx: number) =>
                                  idx === selectedSubItem.itemIndex ? { ...it, desc: val } : it
                                );
                                handleUpdateElementData(selectedEl.id, { items: updatedItems });
                              }}
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-medium outline-none focus:border-[#00A0FF]"
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      /* OVERALL BLOCK SETTINGS (WHEN NO SUB-ITEM CLICKED SPECIFICALLY) */
                      <>
                        {/* SECTION TITLE / MAIN CONTENT EDITING */}
                        <div className="space-y-1.5 p-3 bg-slate-950 rounded-2xl border border-slate-800">
                          <label className="text-[10px] font-black text-[#00A0FF] uppercase tracking-wider">
                            Contenu Principal / Titre
                          </label>
                          <input
                            type="text"
                            value={elData.title || selectedEl.content || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              handleUpdateElementData(selectedEl.id, { title: val });
                              handleUpdateElementContent(selectedEl.id, val);
                            }}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-bold outline-none focus:border-[#00A0FF]"
                          />
                        </div>

                        {/* FORM INPUT SPECIFIC CONTROLS */}
                        {(selectedEl.type === 'OptinForm' || selectedEl.type === 'FormInput') && (
                          <div className="space-y-3 p-3 bg-slate-950 rounded-2xl border border-slate-800">
                            <label className="text-[10px] font-black text-[#00A0FF] uppercase tracking-wider block">
                              ⚙️ Configuration du Champ de Formulaire
                            </label>
                            <div className="space-y-2">
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400">Texte indicatif (Placeholder)</label>
                                <input
                                  type="text"
                                  value={elData.placeholder || selectedEl.content || 'Entrez votre adresse email...'}
                                  onChange={(e) => {
                                    handleUpdateElementData(selectedEl.id, { placeholder: e.target.value });
                                    handleUpdateElementContent(selectedEl.id, e.target.value);
                                  }}
                                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-[#00A0FF]"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400">Type de saisie</label>
                                <select
                                  value={elData.inputType || 'email'}
                                  onChange={(e) => handleUpdateElementData(selectedEl.id, { inputType: e.target.value })}
                                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-bold outline-none"
                                >
                                  <option value="email">Adresse Email</option>
                                  <option value="text">Nom complet / Texte</option>
                                  <option value="tel">Numéro de téléphone</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* BUTTON CTA SPECIFIC CONTROLS */}
                        {selectedEl.type === 'ButtonCTA' && (
                          <div className="space-y-3 p-3 bg-slate-950 rounded-2xl border border-slate-800">
                            <label className="text-[10px] font-black text-[#00A0FF] uppercase tracking-wider block">
                              🎯 Action & Style du Bouton
                            </label>
                            <div className="space-y-2">
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400">Texte du Bouton (CTA)</label>
                                <input
                                  type="text"
                                  value={elData.buttonText || selectedEl.content || 'Recevoir mon accès gratuit →'}
                                  onChange={(e) => {
                                    handleUpdateElementData(selectedEl.id, { buttonText: e.target.value });
                                    handleUpdateElementContent(selectedEl.id, e.target.value);
                                  }}
                                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-bold outline-none focus:border-[#00A0FF]"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400">Action au clic</label>
                                <select
                                  value={elData.clickAction || 'Submit'}
                                  onChange={(e) => handleUpdateElementData(selectedEl.id, { clickAction: e.target.value })}
                                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-bold outline-none"
                                >
                                  <option value="Submit">Soumettre le formulaire</option>
                                  <option value="OpenURL">Ouvrir l URL de redirection</option>
                                  <option value="OpenPopup">Ouvrir la fenêtre Popup</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* DISPOSITION INTERNE CÔTE À CÔTE POUR CONTENTBOX */}
                        {selectedEl.type === 'ContentBox' && (
                          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                            <div className="text-[10px] font-black text-[#00A0FF] uppercase tracking-wider block">
                              📐 Disposition Interne (Côte à côte)
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { key: 'masonry', label: '🧱 Mosaïque (Combler les vides)' },
                                { key: 'grid-3', label: '3 Colonnes (33%)' },
                                { key: 'grid-2', label: '2 Colonnes (50%)' },
                                { key: 'grid-4', label: '4 Colonnes (25%)' },
                                { key: 'vertical', label: '1 Colonne (Vertical)' },
                                { key: 'flex-row', label: 'Ligne Flexible (Wrap)' },
                              ].map((l) => (
                                <button
                                  key={l.key}
                                  type="button"
                                  onClick={() => handleUpdateElementData(selectedEl.id, { layoutMode: l.key })}
                                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                                    (elData.layoutMode || 'grid-3') === l.key
                                      ? 'bg-[#00A0FF] text-white border-[#00A0FF]'
                                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                                  }`}
                                >
                                  {l.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 📍 POSITION & ORDRE DANS LA PAGE */}
                        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                          <div className="text-[10px] font-black text-[#00A0FF] uppercase tracking-wider flex items-center justify-between">
                            <span>📍 Position & Ordre dans la Page</span>
                            <span className="text-[9px] font-mono text-emerald-400 font-bold">
                              Rang #{elements.findIndex(e => e.id === selectedEl.id) + 1} / {elements.length}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                const curIdx = elements.findIndex(e => e.id === selectedEl.id);
                                if (curIdx > 0) moveElementToPosition(curIdx, 'top', e);
                              }}
                              disabled={elements.findIndex(e => e.id === selectedEl.id) === 0}
                              className="py-2.5 px-2 bg-gradient-to-r from-emerald-900/80 to-teal-900/80 hover:from-emerald-800 hover:to-teal-800 border border-emerald-500/60 text-white font-black text-xs rounded-xl shadow-md disabled:opacity-30 flex items-center justify-center gap-1.5 transition-all"
                            >
                              <span>🔝</span>
                              <span>Placer Tout en Haut</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                const curIdx = elements.findIndex(e => e.id === selectedEl.id);
                                if (curIdx < elements.length - 1) moveElementToPosition(curIdx, 'bottom', e);
                              }}
                              disabled={elements.findIndex(e => e.id === selectedEl.id) === elements.length - 1}
                              className="py-2.5 px-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-30 flex items-center justify-center gap-1.5 transition-all"
                            >
                              <span>🔚</span>
                              <span>Placer Tout en Bas</span>
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                const curIdx = elements.findIndex(e => e.id === selectedEl.id);
                                if (curIdx > 0) moveElementToPosition(curIdx, 'up', e);
                              }}
                              disabled={elements.findIndex(e => e.id === selectedEl.id) === 0}
                              className="py-2 px-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-bold text-xs rounded-xl disabled:opacity-30 flex items-center justify-center gap-1 transition-all"
                            >
                              <span>▲ Monter 1 rang</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                const curIdx = elements.findIndex(e => e.id === selectedEl.id);
                                if (curIdx < elements.length - 1) moveElementToPosition(curIdx, 'down', e);
                              }}
                              disabled={elements.findIndex(e => e.id === selectedEl.id) === elements.length - 1}
                              className="py-2 px-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-bold text-xs rounded-xl disabled:opacity-30 flex items-center justify-center gap-1 transition-all"
                            >
                              <span>▼ Descendre 1 rang</span>
                            </button>
                          </div>
                        </div>

                        {/* 📐 LARGEUR DE L'AFFICHAGE DU BUILDER ET DU TUNNEL */}
                        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                          <div className="text-[10px] font-black text-[#00A0FF] uppercase tracking-wider flex items-center justify-between">
                            <span>📐 Largeur de l Affichage</span>
                            <span className="text-[9px] font-mono text-slate-400">
                              {pageWidthMode === 'standard' ? '896px' : pageWidthMode === 'wide' ? '1152px' : '100% Full'}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-1.5">
                            {[
                              { key: 'standard', label: '📱 Standard (896px)' },
                              { key: 'wide', label: '💻 Large (1152px)' },
                              { key: 'full', label: '🖥️ Plein Écran' },
                            ].map((w) => (
                              <button
                                key={w.key}
                                type="button"
                                onClick={() => handleSetPageWidthMode(w.key as any)}
                                className={`py-2 px-1 text-[10px] font-bold rounded-xl border transition-all text-center ${
                                  pageWidthMode === w.key
                                    ? 'bg-[#00A0FF] text-white border-[#00A0FF]'
                                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                                }`}
                              >
                                {w.label}
                              </button>
                            ))}
                          </div>

                          {/* CONVERT NON-SECTION ELEMENT TO FULL-WIDTH SECTION */}
                          {selectedEl.type !== 'Section' && selectedEl.type !== 'BlockSectionFull' && (
                            <button
                              type="button"
                              onClick={() => {
                                setElements((prev) =>
                                  prev.map((item) => {
                                    if (item.id !== selectedEl.id) return item;
                                    return {
                                      id: item.id,
                                      type: 'Section',
                                      category: 'DISPOSITION & SECTIONS FULL-WIDTH',
                                      content: item.content || 'Section Principale',
                                      data: {
                                        bgColor: item.data?.bgColor || '#0F172A',
                                        bgImage: item.data?.bgImage || '',
                                        bgOverlay: 0,
                                        textColor: item.data?.textColor || '#ffffff',
                                        innerContentWidth: 'standard',
                                        children: [
                                          {
                                            id: `sub-${Date.now()}`,
                                            type: item.type,
                                            category: item.category,
                                            content: item.content,
                                            data: item.data,
                                          },
                                        ],
                                      },
                                    };
                                  })
                                );
                              }}
                              className="w-full py-2.5 px-3 bg-gradient-to-r from-purple-900 to-indigo-900 hover:from-purple-800 hover:to-indigo-800 border border-purple-500/60 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
                            >
                              <span>🏛️</span>
                              <span>Placer dans une Section Plein Écran (100%)</span>
                            </button>
                          )}
                        </div>

                        {/* 📐 HAUTEUR DE LA SECTION */}
                        {(selectedEl.type === 'Section' || selectedEl.type === 'BlockSectionFull') && (
                          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                            <div className="text-[10px] font-black text-[#00A0FF] uppercase tracking-wider flex items-center justify-between">
                              <span>📐 Hauteur de la Section (Pixels)</span>
                              <span className="text-xs font-mono text-purple-300 font-bold">
                                {selectedEl.data?.minHeight ? `${selectedEl.data.minHeight}px` : 'Auto'}
                              </span>
                            </div>

                            <input
                              type="range"
                              min="100"
                              max="1200"
                              step="10"
                              value={selectedEl.data?.minHeight || 300}
                              onChange={(e) => handleUpdateElementData(selectedEl.id, { minHeight: parseInt(e.target.value) })}
                              className="w-full accent-[#00A0FF] cursor-pointer"
                            />

                            <div className="grid grid-cols-4 gap-1.5 pt-1">
                              {[
                                { label: '200px', val: 200 },
                                { label: '400px', val: 400 },
                                { label: '600px', val: 600 },
                                { label: '800px', val: 800 },
                              ].map((p) => (
                                <button
                                  key={p.val}
                                  type="button"
                                  onClick={() => handleUpdateElementData(selectedEl.id, { minHeight: p.val })}
                                  className={`py-1.5 px-1 text-[9px] font-bold rounded-lg border transition-all text-center ${
                                    selectedEl.data?.minHeight === p.val
                                      ? 'bg-purple-600 text-white border-purple-400'
                                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                                  }`}
                                >
                                  {p.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 🎨 COULEURS ET ARRIÈRE-PLAN DES BLOCS, COLONNES ET TEXTES */}
                        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
                          <div className="text-[10px] font-black text-[#00A0FF] uppercase tracking-wider block flex items-center justify-between">
                            <span>🎨 Couleurs & Arrière-plan</span>
                          </div>

                          {/* 1. Arrière-plan principal (Conteneur / Bloc / Texte) */}
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 block">
                              Arrière-plan du Conteneur / Bloc
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={elData.bgColor && elData.bgColor.startsWith('#') ? elData.bgColor : '#ffffff'}
                                onChange={(e) => handleUpdateElementData(selectedEl.id, { bgColor: e.target.value })}
                                className="w-8 h-8 rounded-lg cursor-pointer border border-slate-700 bg-transparent p-0"
                              />
                              <input
                                type="text"
                                value={elData.bgColor || '#ffffff'}
                                onChange={(e) => handleUpdateElementData(selectedEl.id, { bgColor: e.target.value })}
                                placeholder="#FFFFFF ou bg-white"
                                className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono outline-none focus:border-[#00A0FF]"
                              />
                            </div>
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {[
                                { name: 'Blanc', val: '#ffffff' },
                                { name: 'Crème Arizona', val: '#FEF5D7' },
                                { name: 'Gris Soft', val: '#F8FAFC' },
                                { name: 'Bleu Ciel', val: '#EFF6FF' },
                                { name: 'Sombre Slate', val: '#0F172A' },
                                { name: 'Néon Violet', val: '#FAF5FF' },
                                { name: 'Transparent', val: 'transparent' },
                              ].map((c) => (
                                <button
                                  key={c.val}
                                  type="button"
                                  onClick={() => handleUpdateElementData(selectedEl.id, { bgColor: c.val })}
                                  className="px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[10px] text-slate-300 font-bold hover:border-[#00A0FF] hover:text-white"
                                >
                                  {c.name}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* 2. Arrière-plan des Cartes Interne (si Conteneur / Col2 / Col3 / Col4) */}
                          {['ContentBox', 'Col2', 'Col3', 'Col4', 'Block3ColArcadeArizona', 'BlockFeat4ColImg', 'BlockFeat3ColImg'].includes(selectedEl.type) && (
                            <div className="space-y-2 pt-2 border-t border-slate-800/80">
                              <label className="text-[10px] font-bold text-slate-400 block">
                                Arrière-plan des Cartes & Colonnes
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={elData.cardBgColor && elData.cardBgColor.startsWith('#') ? elData.cardBgColor : '#f8fafc'}
                                  onChange={(e) => handleUpdateElementData(selectedEl.id, { cardBgColor: e.target.value })}
                                  className="w-8 h-8 rounded-lg cursor-pointer border border-slate-700 bg-transparent p-0"
                                />
                                <input
                                  type="text"
                                  value={elData.cardBgColor || '#f8fafc'}
                                  onChange={(e) => handleUpdateElementData(selectedEl.id, { cardBgColor: e.target.value })}
                                  placeholder="#F8FAFC ou bg-slate-50"
                                  className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono outline-none focus:border-[#00A0FF]"
                                />
                              </div>
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {[
                                  { name: 'Blanc Pure', val: '#ffffff' },
                                  { name: 'Gris Soft', val: '#f8fafc' },
                                  { name: 'Crème', val: '#fffdf5' },
                                  { name: 'Bleu Soft', val: '#f0f9ff' },
                                  { name: 'Sombre', val: '#1e293b' },
                                ].map((c) => (
                                  <button
                                    key={c.val}
                                    type="button"
                                    onClick={() => handleUpdateElementData(selectedEl.id, { cardBgColor: c.val })}
                                    className="px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[10px] text-slate-300 font-bold hover:border-[#00A0FF] hover:text-white"
                                  >
                                    {c.name}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* 3. Couleur des Textes & Titres */}
                          <div className="space-y-2 pt-2 border-t border-slate-800/80">
                            <label className="text-[10px] font-bold text-slate-400 block">
                              Couleur du Texte & Titre
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={elData.textColor && elData.textColor.startsWith('#') ? elData.textColor : '#1e293b'}
                                onChange={(e) => handleUpdateElementData(selectedEl.id, { textColor: e.target.value })}
                                className="w-8 h-8 rounded-lg cursor-pointer border border-slate-700 bg-transparent p-0"
                              />
                              <input
                                type="text"
                                value={elData.textColor || '#1e293b'}
                                onChange={(e) => handleUpdateElementData(selectedEl.id, { textColor: e.target.value })}
                                placeholder="#1E293B ou text-slate-800"
                                className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono outline-none focus:border-[#00A0FF]"
                              />
                            </div>
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {[
                                { name: 'Noir Slate', val: '#0f172a' },
                                { name: 'Doré Arizona', val: '#D69A3A' },
                                { name: 'Bleu Néon', val: '#00A0FF' },
                                { name: 'Vert Émeraude', val: '#10B981' },
                                { name: 'Blanc', val: '#ffffff' },
                              ].map((c) => (
                                <button
                                  key={c.val}
                                  type="button"
                                  onClick={() => handleUpdateElementData(selectedEl.id, { textColor: c.val })}
                                  className="px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[10px] text-slate-300 font-bold hover:border-[#00A0FF] hover:text-white"
                                >
                                  {c.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* IMAGE EXCLUSIVE CONTROLS (ONLY SHOW WHEN ELEMENT IS AN IMAGE) */}
                        {selectedEl.type === 'Image' && (
                          <>
                            {/* 1. FICHIER DE L IMAGE */}
                            <div className="space-y-3 p-3 bg-slate-950 rounded-2xl border border-slate-800">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                                Fichier de l image
                              </label>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={elData.img || selectedEl.content || ''}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      handleUpdateElementData(selectedEl.id, { img: val });
                                      handleUpdateElementContent(selectedEl.id, val);
                                    }}
                                    placeholder="https://..."
                                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-[11px] text-slate-300 font-mono"
                                  />
                                  <label className="p-2 bg-[#00A0FF] hover:bg-[#0082D6] text-white rounded-xl cursor-pointer shrink-0 font-bold text-xs shadow-md">
                                    <span>📤</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          const reader = new FileReader();
                                          reader.onload = (uploadEv) => {
                                            const url = uploadEv.target?.result as string;
                                            handleUpdateElementData(selectedEl.id, { img: url });
                                            handleUpdateElementContent(selectedEl.id, url);
                                          };
                                          reader.readAsDataURL(file);
                                        }
                                      }}
                                    />
                                  </label>
                                </div>
                              </div>
                            </div>

                            {/* 2. ACTION SUR UNE IMAGE CLIQUÉE */}
                            <div className="space-y-1.5 p-3 bg-slate-950 rounded-2xl border border-slate-800">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Action sur une image cliquée
                              </label>
                              <select
                                value={elData.clickAction || 'None'}
                                onChange={(e) => handleUpdateElementData(selectedEl.id, { clickAction: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-bold outline-none"
                              >
                                <option value="None">Aucune (None)</option>
                                <option value="OpenURL">Ouvrir l URL de redirection</option>
                                <option value="OpenPopup">Ouvrir la fenêtre Popup</option>
                              </select>
                            </div>

                            {/* 3. ATTRIBUT ALT */}
                            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  Attribut Alt
                                </label>
                                <input
                                  type="text"
                                  value={elData.alt || ''}
                                  onChange={(e) => handleUpdateElementData(selectedEl.id, { alt: e.target.value })}
                                  placeholder="Texte alternatif..."
                                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300"
                                />
                              </div>

                              <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer pt-1">
                                <input
                                  type="checkbox"
                                  checked={elData.fullWidth || false}
                                  onChange={(e) => handleUpdateElementData(selectedEl.id, { fullWidth: e.target.checked })}
                                  className="w-4 h-4 rounded text-[#00A0FF] bg-slate-900 border-slate-800"
                                />
                                <span>Remplir à 100% en largeur</span>
                              </label>
                            </div>

                            {/* 4. TAILLE DE L IMAGE */}
                            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                              <div className="flex items-center justify-between text-xs font-bold">
                                <span className="text-slate-400">Taille de l image</span>
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    value={elData.imgSize || 240}
                                    onChange={(e) => handleUpdateElementData(selectedEl.id, { imgSize: Number(e.target.value) })}
                                    className="w-14 px-2 py-0.5 bg-slate-900 border border-slate-800 rounded-lg text-center font-mono text-xs text-white"
                                  />
                                  <span className="text-slate-500 text-[10px]">px</span>
                                </div>
                              </div>
                              <input
                                type="range"
                                min={50}
                                max={800}
                                value={elData.imgSize || 240}
                                onChange={(e) => handleUpdateElementData(selectedEl.id, { imgSize: Number(e.target.value) })}
                                className="w-full accent-[#00A0FF]"
                              />
                            </div>
                          </>
                        )}

                    {/* 4.5 CONTRÔLE AVANCÉ DES IMAGES DU BLOC */}
                    {(elData.img !== undefined || elData.items || ['BlockHeroArizona', 'BlockBioArizona', 'BlockSoulSistersArizona', 'Block3ColArcadeArizona', 'Image', 'BlockFeat4ColImg', 'BlockFeat3ColImg', 'Col4', 'Col3', 'Col2', 'BlockFeat2ColIconsLeft', 'ContentBox'].includes(selectedEl.type)) && (
                      <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
                        <div className="text-[10px] font-black text-[#00A0FF] uppercase tracking-wider flex items-center justify-between">
                          <span>🖼️ Contrôle des Images du Bloc</span>
                        </div>

                        {/* 1. HAUTEUR DE L'IMAGE */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Hauteur des Images du Bloc
                          </label>
                          <div className="grid grid-cols-4 gap-1.5">
                            {[
                              { key: 'h-36', label: '144px' },
                              { key: 'h-48', label: '192px' },
                              { key: 'h-64', label: '256px' },
                              { key: 'h-80', label: '320px' },
                            ].map((h) => (
                              <button
                                key={h.key}
                                onClick={() => handleUpdateElementData(selectedEl.id, { imgHeight: h.key })}
                                className={`py-1.5 text-[10px] font-bold rounded-lg border transition-all ${
                                  (elData.imgHeight || 'h-48') === h.key
                                    ? 'bg-[#00A0FF] text-white border-[#00A0FF]'
                                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                                }`}
                              >
                                {h.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 2. FORME & DÉCOUPE */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Forme & Découpe de l Image
                          </label>
                          <div className="grid grid-cols-2 gap-1.5">
                            {[
                              { key: 'arcade', label: '🏛️ Arche Arizona' },
                              { key: 'rounded-3xl', label: '🔲 Arrondi 3XL' },
                              { key: 'circle', label: '⚪ Cercle' },
                              { key: 'square', label: '⬛ Droit' },
                            ].map((s) => (
                              <button
                                key={s.key}
                                onClick={() => handleUpdateElementData(selectedEl.id, { imgShape: s.key })}
                                className={`py-1.5 text-[11px] font-bold rounded-xl border transition-all flex items-center justify-center gap-1 ${
                                  (elData.imgShape || 'arcade') === s.key
                                    ? 'bg-[#00A0FF] text-white border-[#00A0FF]'
                                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                                }`}
                              >
                                {s.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 3. AJUSTEMENT (OBJECT FIT) */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Ajustement Image (Object Fit)
                          </label>
                          <div className="grid grid-cols-3 gap-1.5">
                            {[
                              { key: 'object-cover', label: 'Couvrir' },
                              { key: 'object-contain', label: 'Contenir' },
                              { key: 'object-fill', label: 'Étirer' },
                            ].map((fit) => (
                              <button
                                key={fit.key}
                                onClick={() => handleUpdateElementData(selectedEl.id, { imgObjectFit: fit.key })}
                                className={`py-1.5 text-[10px] font-bold rounded-lg border transition-all ${
                                  (elData.imgObjectFit || 'object-cover') === fit.key
                                    ? 'bg-[#00A0FF] text-white border-[#00A0FF]'
                                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                                }`}
                              >
                                {fit.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 4. CADRAGE VERTICAL */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Cadrage Vertical (Position)
                          </label>
                          <div className="grid grid-cols-3 gap-1.5">
                            {[
                              { key: 'top', label: 'Haut' },
                              { key: 'center', label: 'Centre' },
                              { key: 'bottom', label: 'Bas' },
                            ].map((pos) => (
                              <button
                                key={pos.key}
                                onClick={() => handleUpdateElementData(selectedEl.id, { imgObjectPosition: pos.key })}
                                className={`py-1.5 text-[10px] font-bold rounded-lg border transition-all ${
                                  (elData.imgObjectPosition || 'center') === pos.key
                                    ? 'bg-[#00A0FF] text-white border-[#00A0FF]'
                                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                                }`}
                              >
                                {pos.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 5. ALIGNER (LEFT, CENTER, RIGHT - SCREENSHOT 3) */}
                    <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Aligner
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {['Left', 'Center', 'Right'].map((align) => (
                          <button
                            key={align}
                            onClick={() => handleUpdateElementData(selectedEl.id, { align })}
                            className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                              (elData.align || 'Center') === align
                                ? 'bg-[#00A0FF] text-white border-[#00A0FF]'
                                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                            }`}
                          >
                            {align === 'Left' ? '← Gauche' : align === 'Center' ? '↔ Centre' : 'Droite →'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 6. MARGES EXTERNES & REMPLISSAGE INTERNE (PADDING / MARGIN) */}
                    <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
                      <div className="text-[10px] font-black text-[#00A0FF] uppercase tracking-wider block">
                        📏 Marges Externes (Margin) & Remplissage (Padding)
                      </div>

                      {/* MARGES EXTERNES (MARGIN) */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Marges Externes (Margin px)
                        </label>
                        <div className="grid grid-cols-4 gap-2 text-center">
                          {[
                            { key: 'marginTop', label: 'Haut' },
                            { key: 'marginRight', label: 'Droite' },
                            { key: 'marginBottom', label: 'Bas' },
                            { key: 'marginLeft', label: 'Gauche' },
                          ].map((m) => (
                            <div key={m.key} className="space-y-1">
                              <input
                                type="number"
                                value={elData[m.key] || 0}
                                onChange={(e) => handleUpdateElementData(selectedEl.id, { [m.key]: Number(e.target.value) })}
                                className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-center text-xs text-white font-mono focus:border-[#00A0FF] outline-none"
                              />
                              <span className="text-[9px] font-bold text-slate-500">{m.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* REMPLISSAGE INTERNE (PADDING) */}
                      <div className="space-y-1.5 border-t border-slate-900 pt-3">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Remplissage Interne (Padding px)
                        </label>
                        <div className="grid grid-cols-4 gap-2 text-center">
                          {[
                            { key: 'paddingTop', label: 'Haut', def: 16 },
                            { key: 'paddingRight', label: 'Droite', def: 16 },
                            { key: 'paddingBottom', label: 'Bas', def: 16 },
                            { key: 'paddingLeft', label: 'Gauche', def: 16 },
                          ].map((p) => (
                            <div key={p.key} className="space-y-1">
                              <input
                                type="number"
                                value={elData[p.key] !== undefined ? elData[p.key] : p.def}
                                onChange={(e) => handleUpdateElementData(selectedEl.id, { [p.key]: Number(e.target.value) })}
                                className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-center text-xs text-white font-mono focus:border-[#00A0FF] outline-none"
                              />
                              <span className="text-[9px] font-bold text-slate-500">{p.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 7. BORDURE & ARRONDI (SCREENSHOT 4 & 5) */}
                    <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-400">Arrondissement des coins</span>
                        <span className="text-xs font-mono text-slate-300">{elData.borderRadius || 16}px</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={60}
                        value={elData.borderRadius || 16}
                        onChange={(e) => handleUpdateElementData(selectedEl.id, { borderRadius: Number(e.target.value) })}
                        className="w-full accent-[#00A0FF]"
                      />
                    </div>

                    {/* 8. SOUS-ÉLÉMENTS ET COLONNES DU BLOC (IF MULTI-COLUMN BLOCK) */}
                    {elData.items && (
                      <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-black text-[#00A0FF] uppercase tracking-wider">
                            Cartes & Colonnes ({elData.items.length})
                          </label>
                          <button
                            onClick={() => handleAddItemToBlock(selectedEl.id)}
                            className="px-2 py-1 bg-[#00A0FF] hover:bg-[#0082D6] text-white rounded-lg text-[10px] font-bold flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Ajouter</span>
                          </button>
                        </div>

                        <div className="space-y-3">
                          {elData.items.map((item: any, idx: number) => (
                            <div key={item.id || idx} className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                              <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                                <span>Élément #{idx + 1}</span>
                                <button
                                  onClick={() => handleRemoveItemFromBlock(selectedEl.id, item.id)}
                                  className="text-rose-400 hover:text-rose-300 text-[10px]"
                                >
                                  Supprimer
                                </button>
                              </div>

                              <input
                                type="text"
                                value={item.title || ''}
                                placeholder="Titre..."
                                onChange={(e) => {
                                  const updatedItems = elData.items.map((it: any) =>
                                    it.id === item.id ? { ...it, title: e.target.value } : it
                                  );
                                  handleUpdateElementData(selectedEl.id, { items: updatedItems });
                                }}
                                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-bold"
                              />

                              {/* IMAGE FILE / URL UPLOAD FOR EACH COLUMN */}
                              <div className="space-y-1 pt-1">
                                <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                                  <span>🖼️ Image de la carte</span>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedSubItem({ blockId: selectedEl.id, itemIndex: idx, subType: 'image' })}
                                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                      selectedSubItem?.blockId === selectedEl.id && selectedSubItem?.itemIndex === idx
                                        ? 'bg-[#00A0FF] text-white'
                                        : 'bg-slate-800 text-slate-400 hover:text-white'
                                    }`}
                                  >
                                    {selectedSubItem?.blockId === selectedEl.id && selectedSubItem?.itemIndex === idx
                                      ? '✅ Prêt pour le menu à gauche'
                                      : 'Cliquer pour l assigner'}
                                  </button>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="text"
                                    value={item.img || ''}
                                    placeholder="URL Image..."
                                    onChange={(e) => {
                                      const updatedItems = elData.items.map((it: any) =>
                                        it.id === item.id ? { ...it, img: e.target.value } : it
                                      );
                                      handleUpdateElementData(selectedEl.id, { items: updatedItems });
                                    }}
                                    className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-[10px] text-slate-300 font-mono"
                                  />
                                  <label className="px-2 py-1 bg-[#00A0FF] hover:bg-[#0082D6] text-white rounded-lg cursor-pointer shrink-0 text-xs font-bold flex items-center gap-1 shadow-xs">
                                    <span>📁 Fichier</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          const reader = new FileReader();
                                          reader.onload = (uploadEv) => {
                                            const url = uploadEv.target?.result as string;
                                            const updatedItems = elData.items.map((it: any) =>
                                              it.id === item.id ? { ...it, img: url } : it
                                            );
                                            handleUpdateElementData(selectedEl.id, { items: updatedItems });
                                          };
                                          reader.readAsDataURL(file);
                                        }
                                      }}
                                    />
                                  </label>
                                </div>
                              </div>

                              <textarea
                                rows={2}
                                value={item.desc || ''}
                                placeholder="Description..."
                                onChange={(e) => {
                                  const updatedItems = elData.items.map((it: any) =>
                                    it.id === item.id ? { ...it, desc: e.target.value } : it
                                  );
                                  handleUpdateElementData(selectedEl.id, { items: updatedItems });
                                }}
                                className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

    </div>
  );
}
