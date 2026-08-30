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
  X,
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
  } | null>(null);

  // MAGNETIC SNAP GUIDE LINE STATE FOR AUTOMATIC ALIGNMENT
  const [snapGuide, setSnapGuide] = useState<{
    active: boolean;
    type?: 'height' | 'width' | 'both';
    val?: number;
  } | null>(null);

  // CANVAS BACKGROUND ALIGNMENT GRID STATE (GRILLAGE À CARREAUX ON/OFF)
  const [showCanvasGrid, setShowCanvasGrid] = useState<boolean>(true);

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
              if (Array.isArray(parsed)) setElements(parsed);
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
          if (targetIndex !== undefined) {
            const updated = [...prev];
            updated.splice(targetIndex, 0, newEl);
            return updated;
          }
          return [...prev, newEl];
        });
        setSelectedElementId(newEl.id);
      } else if (data.draggedElementId !== undefined) {
        const fromIndex = data.draggedIndex;
        const toIndex = targetIndex !== undefined ? targetIndex : elements.length - 1;
        if (fromIndex !== undefined && fromIndex !== toIndex) {
          setElements((prev) => {
            const updated = [...prev];
            const [moved] = updated.splice(fromIndex, 1);
            updated.splice(toIndex, 0, moved);
            return updated;
          });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const moveElement = (index: number, direction: -1 | 1, e: React.MouseEvent) => {
    e.stopPropagation();
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= elements.length) return;

    setElements((prev) => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return updated;
    });
  };

  const [editingBlock, setEditingBlock] = useState<CanvasElement | null>(null);

  const getDefaultBlockData = (type: string, name: string) => {
    if (type === 'BlockFeat4ColImg') {
      return {
        title: 'BASES ET NUTRITION',
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
        title: 'Le Savoir-Faire des Experts à Votre Portée',
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
        title: 'Nos Services & Garanties',
        items: [
          { id: '1', title: 'Succès du projet', desc: 'Accompagnement pas à pas pour garantir l atteinte de vos objectifs.' },
          { id: '2', title: 'Stratégie de Marque', desc: 'Positionnement fort pour vous démarquer sur votre marché.' },
          { id: '3', title: 'Un Support Excellent', desc: 'Une équipe réactive disponible pour répondre à toutes vos questions.' },
          { id: '4', title: 'Template Responsive', desc: 'Des interfaces optimisées pour tous les écrans mobiles et ordinateurs.' },
        ],
      };
    }
    if (type === 'BlockFeat4ColDark') {
      return {
        title: 'Votre titre accrocheur ici pour attirer l attention',
        items: [
          { id: '1', title: 'Rapidité', desc: 'Déploiement en 1 clic.' },
          { id: '2', title: 'Sécurité', desc: 'Données protégées.' },
          { id: '3', title: 'Performance', desc: 'Vitesse maximale.' },
          { id: '4', title: 'Support', desc: '24/7 disponible.' },
        ],
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

  const handleAddElement = (type: string, category: string, defaultContent: string) => {
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

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-400 font-bold">Chargement de l éditeur visuel...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between overflow-hidden">
      
      {/* 1. TOP BUILDER TOOLBAR (INDEPENDENT WORKSPACE MODE) */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between shrink-0 z-40">
        
        {/* LEFT TOOLBAR CONTROLS */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/admin/tunnels"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors"
            title="Revenir à la liste de tous vos Tunnels de Vente"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#00A0FF]" />
            <span className="hidden sm:inline">Tunnels</span>
          </Link>

          <Link
            href={`/admin/tunnels/${params.id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00A0FF]/20 hover:bg-[#00A0FF]/30 text-[#00A0FF] border border-[#00A0FF]/40 text-xs font-extrabold rounded-xl transition-colors"
            title="Revenir aux étapes du tunnel actuel (Screen 2)"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Retour au Tunnel</span>
          </Link>

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
          
          {/* DESKTOP / MOBILE / GRID TOGGLE BUTTONS */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1">
            <button
              onClick={() => setPreviewMode('DESKTOP')}
              className={`p-1.5 rounded-lg transition-all ${
                previewMode === 'DESKTOP' ? 'bg-[#00A0FF] text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Aperçu Ordinateur"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
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
              onClick={() => setShowCanvasGrid(!showCanvasGrid)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                showCanvasGrid
                  ? 'bg-[#00A0FF]/20 text-[#00A0FF] border border-[#00A0FF]/50 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Activer/Désactiver le grillage à carreaux pour l alignement"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grille {showCanvasGrid ? 'ON' : 'OFF'}</span>
            </button>
          </div>

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
          <Link href={`/admin/tunnels/${params.id}`}>
            <Button
              variant="outline"
              size="sm"
              className="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 font-bold text-xs gap-1.5 rounded-xl"
              title="Quitter le builder et revenir aux étapes du tunnel (Screen 2)"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>Sortir</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* 2. MAIN BUILDER BODY (PALETTE SIDEBAR & CANVAS) */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT PALETTE / INSPECTOR PANEL (SCREENS 1, 2, 3, 4, 5) */}
        <div className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 overflow-y-auto">
          
          {/* IF AN ELEMENT IS SELECTED -> SHOW LEFT SIDEBAR INSPECTOR (SCREENSHOTS 3, 4, 5) */}
          {selectedElementId ? (
            (() => {
              const selectedEl = elements.find((el) => el.id === selectedElementId);
              if (!selectedEl) return null;
              const rawData = selectedEl.data || {};
              const defaultData = getDefaultBlockData(selectedEl.type, selectedEl.content);
              const elItems =
                rawData.items && rawData.items.length > 0
                  ? rawData.items
                  : defaultData.items || [];
              const elData = { ...defaultData, ...rawData, items: elItems };

              const currentSubItem =
                selectedSubItem && selectedSubItem.blockId === selectedEl.id && elItems[selectedSubItem.itemIndex]
                  ? elItems[selectedSubItem.itemIndex]
                  : null;

              return (
                <div className="flex flex-col h-full text-slate-200">
                  {/* TOP HEADER MATCHING SCREENSHOT 3: < Retour | Section > Rangée > Image */}
                  <div className="p-3 border-b border-slate-800 bg-slate-950 flex items-center justify-between gap-2">
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
                  <div className="p-4 space-y-5 text-xs overflow-y-auto flex-1">
                    
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
                                               const updatedItems = elItems.map((it: any, idx: number) =>
                                                 idx === selectedSubItem.itemIndex ? { ...it, img: url } : it
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
                                             onChange={(e) => {
                                               const val = e.target.value;
                                               const updatedItems = elItems.map((it: any, idx: number) =>
                                                 idx === selectedSubItem.itemIndex ? { ...it, objectFit: val } : it
                                               );
                                               handleUpdateElementData(selectedEl.id, { items: updatedItems });
                                             }}
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

                        {/* 1. FICHIER DE L IMAGE (IMAGE UPLOAD & URL - SCREENSHOT 3) */}
                        {(selectedEl.type === 'Image' || selectedEl.type.includes('Img') || elData.items) && (
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
                              <p className="text-[10px] text-slate-500">
                                Cliquez sur une image spécifique ci-contre pour la modifier.
                              </p>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* 2. ACTION SUR UNE IMAGE CLIQUÉE (SCREENSHOT 3) */}
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

                    {/* 3. ATTRIBUT ALT & REMPLIR À 100% (SCREENSHOT 3) */}
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

                    {/* 4. TAILLE DE L IMAGE (SLIDER + NUMBER INPUT - SCREENSHOT 3) */}
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
                                <label className="p-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg cursor-pointer shrink-0 text-xs">
                                  <span>📁</span>
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

                  </div>
                </div>
              );
            })()
          ) : (
            /* IF NO ELEMENT IS SELECTED -> SHOW DEFAULT TABS (ÉLÉMENTS & BLOCS) */
            <>
              {/* TABS: ÉLÉMENTS / BLOCS */}
              <div className="p-3 border-b border-slate-800 grid grid-cols-2 gap-2 bg-slate-950">
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
              <div className="p-4 space-y-6 text-xs">
                
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

                {/* CATEGORY 3: DISPOSITION DES COLONNES */}
                <div className="space-y-2.5">
                  <div className="font-heading font-black text-slate-400 uppercase tracking-wider text-[10px]">
                    Disposition des colonnes
                  </div>
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
      )}
    </div>

        {/* RIGHT LIVE CANVAS WORKSPACE */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleCanvasDrop(e)}
          className="flex-1 bg-slate-950 p-6 overflow-y-auto flex justify-center"
        >
          <div
            className={`w-full bg-slate-900 rounded-3xl border border-slate-800 p-8 shadow-2xl transition-all space-y-6 ${
              previewMode === 'MOBILE' ? 'max-w-sm' : 'max-w-4xl'
            } ${
              showCanvasGrid
                ? 'bg-[linear-gradient(to_right,rgba(0,160,255,0.22)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,160,255,0.22)_1px,transparent_1px)] bg-[size:20px_20px]'
                : ''
            }`}
          >
            <div className="text-center text-xs text-slate-500 border-b border-slate-800 pb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-bold">
                <GripVertical className="w-4 h-4 text-purple-400" />
                <span>Zone de travail (Glisser-déposer d éléments actif)</span>
              </span>
              <span className="text-[11px] text-emerald-400 font-mono">Modèle : {step?.templateName || step?.name}</span>
            </div>

            {/* CANVAS RENDERED ELEMENTS */}
            <div className="space-y-4 min-h-[400px]">
              {elements.map((el, idx) => {
                const isSelected = el.id === selectedElementId;

                return (
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
                    {/* ELEMENT CONTROLS TOOLBAR (UP, DOWN, SETTINGS, DUPLICATE, DELETE) */}
                    {isSelected && (
                      <div className="absolute -top-3 right-4 bg-[#00A0FF] text-white px-2.5 py-1 rounded-xl text-[10px] font-black flex items-center gap-2 shadow-lg z-20">
                        <span className="uppercase">{el.type}</span>
                        <div className="h-3 w-px bg-white/40" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const targetData = el.data && el.data.items && el.data.items.length > 0
                              ? el.data
                              : getDefaultBlockData(el.type, el.content);
                            const updatedEl = { ...el, data: targetData };
                            handleUpdateElementData(el.id, targetData);
                            setEditingBlock(updatedEl);
                          }}
                          title="Personnaliser le bloc (Texte, Images, Colonnes...)"
                          className="flex items-center gap-1 hover:text-amber-300 bg-white/10 px-1.5 py-0.5 rounded-lg"
                        >
                          <Sliders className="w-3 h-3" />
                          <span>Personnaliser</span>
                        </button>
                        <div className="h-3 w-px bg-white/40" />
                        <button
                          onClick={(e) => moveElement(idx, -1, e)}
                          disabled={idx === 0}
                          title="Déplacer vers le haut (▲)"
                          className="disabled:opacity-40"
                        >
                          <ChevronUp className="w-3.5 h-3.5 hover:text-amber-300" />
                        </button>
                        <button
                          onClick={(e) => moveElement(idx, 1, e)}
                          disabled={idx === elements.length - 1}
                          title="Déplacer vers le bas (▼)"
                          className="disabled:opacity-40"
                        >
                          <ChevronDown className="w-3.5 h-3.5 hover:text-amber-300" />
                        </button>
                        <div className="h-3 w-px bg-white/40" />
                        <button onClick={(e) => handleDuplicateElement(el.id, e)} title="Dupliquer">
                          <Copy className="w-3.5 h-3.5 hover:text-amber-300" />
                        </button>
                        <button onClick={(e) => handleDeleteElement(el.id, e)} title="Supprimer">
                          <Trash2 className="w-3.5 h-3.5 hover:text-rose-300" />
                        </button>
                      </div>
                    )}

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

                    {el.type === 'OptinForm' && (
                      <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                        <div className="text-xs font-bold text-slate-300">Adresse Email *</div>
                        <div className="px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-500">
                          votre.email@exemple.com
                        </div>
                        <Button className="w-full bg-[#00A0FF] !text-white font-black text-xs py-3 rounded-xl">
                          Recevoir mon accès gratuit →
                        </Button>
                      </div>
                    )}

                    {el.type === 'Countdown' && (
                      <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-center space-y-1">
                        <div className="text-[10px] font-black text-amber-400 uppercase">Offre limitée</div>
                        <div className="text-2xl font-heading font-black text-amber-300">{el.content}</div>
                      </div>
                    )}

                    {el.type === 'Divider' && <hr className="border-slate-800 my-4" />}

                    {/* RICH DYNAMIC PRE-FILLED FEATURE BLOCKS RENDERERS WITH CLICK-TO-EDIT SUB-ITEMS */}
                    {el.type === 'BlockFeat4ColImg' && (
                      <div
                        className={`space-y-4 p-6 rounded-3xl shadow-xl relative transition-all ${
                          showCanvasGrid
                            ? 'bg-white bg-[linear-gradient(to_right,rgba(0,160,255,0.22)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,160,255,0.22)_1px,transparent_1px)] bg-[size:20px_20px]'
                            : 'bg-white'
                        }`}
                      >
                        {el.data?.title && (
                          <h2 className="text-center font-heading font-black text-xl text-slate-900">{el.data.title}</h2>
                        )}



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

                            return (
                              <div key={col.id || i} className="flex flex-col items-center text-center space-y-3 relative group/col">
                                {/* CLICKABLE IMAGE CONTAINER WITH DYNAMIC WIDTH, HEIGHT & BORDER RADIUS */}
                                <div className="relative flex justify-center w-full">
                                  <div
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSnapGuide(null);
                                      setSelectedElementId(el.id);
                                      setSelectedSubItem({ blockId: el.id, itemIndex: i, subType: 'image' });
                                    }}
                                    className={`relative overflow-hidden shadow-md transition-all cursor-pointer ${
                                      isImgSel
                                        ? 'ring-4 ring-[#00A0FF] ring-offset-2 scale-[1.02] shadow-2xl'
                                        : 'hover:ring-4 hover:ring-[#00A0FF]/60'
                                    }`}
                                    style={{
                                      width: col.imgWidth ? `${col.imgWidth}px` : '100%',
                                      maxWidth: '100%',
                                      height: col.imgSize ? `${col.imgSize}px` : '280px',
                                      borderRadius: `${col.borderRadius !== undefined ? col.borderRadius : 16}px`,
                                    }}
                                  >
                                    <img
                                      src={col.img}
                                      alt={col.alt || col.title}
                                      className="w-full h-full transition-transform duration-100 select-none pointer-events-none"
                                      style={{
                                        objectFit: (col.objectFit as any) || 'cover',
                                        objectPosition: `${col.posX !== undefined ? col.posX : 50}% ${col.posY !== undefined ? col.posY : 50}%`,
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
                    )}

                    {el.type === 'BlockFeat3ColImg' && (
                      <div
                        className={`p-6 rounded-3xl shadow-xl space-y-6 relative transition-all ${
                          showCanvasGrid
                            ? 'bg-white bg-[linear-gradient(to_right,rgba(0,160,255,0.22)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,160,255,0.22)_1px,transparent_1px)] bg-[size:20px_20px]'
                            : 'bg-white text-slate-900'
                        }`}
                      >
                        <div className="text-center space-y-1">
                          <h4 className="text-[10px] font-black text-[#00A0FF] uppercase tracking-widest">CE QUE VOUS OBTENEZ</h4>
                          <h2 className="text-xl font-heading font-black text-slate-900">Le Savoir-Faire des Experts à Votre Portée</h2>
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

                            return (
                              <div key={col.id || i} className="space-y-3">
                                <div className="relative flex justify-center w-full">
                                  <div
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedElementId(el.id);
                                      setSelectedSubItem({ blockId: el.id, itemIndex: i, subType: 'image' });
                                    }}
                                    className={`relative overflow-hidden shadow-sm transition-all cursor-pointer ${
                                      isImgSel
                                        ? 'ring-4 ring-[#00A0FF] ring-offset-2 scale-[1.02] shadow-2xl'
                                        : 'hover:ring-4 hover:ring-[#00A0FF]/60'
                                    }`}
                                    style={{
                                      width: col.imgWidth ? `${col.imgWidth}px` : '100%',
                                      maxWidth: '100%',
                                      height: col.imgSize ? `${col.imgSize}px` : '220px',
                                      borderRadius: `${col.borderRadius !== undefined ? col.borderRadius : 16}px`,
                                    }}
                                  >
                                    <img
                                      src={col.img}
                                      alt={col.alt || col.title}
                                      className="w-full h-full transition-transform duration-100 select-none pointer-events-none"
                                      style={{
                                        objectFit: (col.objectFit as any) || 'cover',
                                        objectPosition: `${col.posX !== undefined ? col.posX : 50}% ${col.posY !== undefined ? col.posY : 50}%`,
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
                    )}

                    {el.type === 'BlockFeat2ColIconsLeft' && (
                      <div className="p-6 bg-white text-slate-900 rounded-3xl shadow-xl space-y-6">
                        <div className="text-center">
                          <h2 className="text-xl font-heading font-black text-slate-900">Nos Services & Garanties</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {[
                            { title: 'Succès du projet', desc: 'Accompagnement pas à pas pour garantir l atteinte de vos objectifs.' },
                            { title: 'Stratégie de Marque', desc: 'Positionnement fort pour vous démarquer sur votre marché.' },
                            { title: 'Un Support Excellent', desc: 'Une équipe réactive disponible pour répondre à toutes vos questions.' },
                            { title: 'Template Responsive', desc: 'Des interfaces optimisées pour tous les écrans mobiles et ordinateurs.' },
                          ].map((item, i) => (
                            <div key={i} className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                              <div className="w-10 h-10 rounded-xl bg-[#00A0FF]/10 text-[#00A0FF] flex items-center justify-center shrink-0 font-bold">
                                ✓
                              </div>
                              <div>
                                <h4 className="font-heading font-extrabold text-sm text-slate-900">{item.title}</h4>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {el.type === 'BlockFeat4ColDark' && (
                      <div className="p-8 bg-slate-950 text-white rounded-3xl border border-slate-800 space-y-6 shadow-2xl">
                        <div className="text-center space-y-2">
                          <h2 className="text-2xl font-heading font-black text-white">Votre titre accrocheur ici pour attirer l attention</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          {[
                            { title: 'Rapidité', desc: 'Déploiement en 1 clic.' },
                            { title: 'Sécurité', desc: 'Données protégées.' },
                            { title: 'Performance', desc: 'Vitesse maximale.' },
                            { title: 'Support', desc: '24/7 disponible.' },
                          ].map((item, i) => (
                            <div key={i} className="p-5 bg-slate-900 rounded-2xl border border-slate-800 text-center space-y-2">
                              <div className="w-10 h-10 rounded-xl bg-[#00A0FF]/20 text-[#00A0FF] flex items-center justify-center mx-auto font-black text-sm">
                                {i + 1}
                              </div>
                              <h4 className="font-heading font-black text-sm text-white">{item.title}</h4>
                              <p className="text-xs text-slate-400">{item.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* DEFAULT FALLBACK RENDERER */}
                    {!['Heading', 'Text', 'BulletList', 'Image', 'OptinForm', 'Countdown', 'Divider', 'BlockFeat4ColImg', 'BlockFeat3ColImg', 'BlockFeat2ColIconsLeft', 'BlockFeat4ColDark'].includes(el.type) && (
                      <div className="p-6 bg-white text-slate-900 rounded-3xl shadow-xl space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-[#00A0FF]/20 text-[#00A0FF] flex items-center justify-center font-bold text-xs">
                            👍
                          </div>
                          <h3 className="font-heading font-black text-base text-slate-900">{el.content}</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                            <h4 className="font-bold text-xs text-slate-900">Élément #1</h4>
                            <p className="text-[11px] text-slate-500 mt-1">Description pré-remplie prêt à personnaliser.</p>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                            <h4 className="font-bold text-xs text-slate-900">Élément #2</h4>
                            <p className="text-[11px] text-slate-500 mt-1">Description pré-remplie prêt à personnaliser.</p>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                            <h4 className="font-bold text-xs text-slate-900">Élément #3</h4>
                            <p className="text-[11px] text-slate-500 mt-1">Description pré-remplie prêt à personnaliser.</p>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
