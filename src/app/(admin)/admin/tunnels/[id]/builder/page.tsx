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

  const handleAddElement = (type: string, category: string, defaultContent: string) => {
    const newEl: CanvasElement = {
      id: `el-${Date.now()}`,
      type,
      category,
      content: defaultContent,
    };
    setElements((prev) => [...prev, newEl]);
    setSelectedElementId(newEl.id);
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
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/tunnels/${params.id}`}
            className="w-8 h-8 rounded-xl bg-[#00A0FF] text-white flex items-center justify-center font-extrabold text-sm shadow-md"
            title="Logo Onepreneur"
          >
            O
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
          
          {/* DESKTOP / MOBILE PREVIEW TOGGLE */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
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

          {/* EXIT BUTTON */}
          <Link href={`/admin/tunnels/${params.id}`}>
            <Button
              variant="outline"
              size="sm"
              className="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 font-bold text-xs gap-1.5 rounded-xl"
            >
              <LogOut className="w-4 h-4" />
              <span>Sortir</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* 2. MAIN BUILDER BODY (PALETTE SIDEBAR & CANVAS) */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT PALETTE PANEL (SCREENS 1, 2, 3) */}
        <div className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 overflow-y-auto">
          
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
                    className={`relative p-4 rounded-2xl border-2 transition-all cursor-move group ${
                      isSelected
                        ? 'border-[#00A0FF] bg-blue-500/10 ring-2 ring-[#00A0FF]/30'
                        : 'border-slate-800/80 hover:border-slate-700 bg-slate-950/40'
                    }`}
                  >
                    {/* ELEMENT CONTROLS TOOLBAR (UP, DOWN, PARAMS, DUPLICATE, DELETE) */}
                    {isSelected && (
                      <div className="absolute -top-3 right-4 bg-[#00A0FF] text-white px-2.5 py-1 rounded-xl text-[10px] font-black flex items-center gap-2 shadow-lg z-20">
                        <span className="uppercase">{el.type}</span>
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

                    {/* ELEMENT TYPE CONTENT RENDERERS */}
                    {el.type === 'Heading' && (
                      <h1 className="text-2xl sm:text-4xl font-heading font-black text-white leading-tight">
                        {el.content}
                      </h1>
                    )}

                    {el.type === 'Text' && (
                      <p className="text-sm text-slate-300 leading-relaxed font-medium">
                        {el.content}
                      </p>
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

                    {/* RICH PRE-FILLED FEATURE BLOCKS RENDERERS */}
                    {el.type === 'BlockFeat4ColImg' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-white text-slate-900 rounded-3xl shadow-xl">
                        {[
                          { title: 'BASES', img: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=400&q=80', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit integer sed.' },
                          { title: 'CUISINER', img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit integer sed.' },
                          { title: 'EXTÉRIEUR', img: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=400&q=80', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit integer sed.' },
                          { title: 'DRESSAGE', img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit integer sed.' },
                        ].map((col, i) => (
                          <div key={i} className="flex flex-col items-center text-center space-y-3">
                            <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-md">
                              <img src={col.img} alt={col.title} className="w-full h-full object-cover" />
                            </div>
                            <h3 className="font-heading font-black text-base text-slate-900 tracking-wider uppercase">{col.title}</h3>
                            <p className="text-xs text-slate-500 leading-relaxed font-medium">{col.desc}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {el.type === 'BlockFeat3ColImg' && (
                      <div className="p-6 bg-white text-slate-900 rounded-3xl shadow-xl space-y-6">
                        <div className="text-center space-y-1">
                          <h4 className="text-[10px] font-black text-[#00A0FF] uppercase tracking-widest">CE QUE VOUS OBTENEZ</h4>
                          <h2 className="text-xl font-heading font-black text-slate-900">Le Savoir-Faire des Experts à Votre Portée</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {[
                            { title: 'Le savoir des experts', img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80', desc: 'Accédez à des connaissances approfondies et testées sur le terrain.' },
                            { title: 'Des leçons pratiques', img: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=400&q=80', desc: 'Des exercices concrets pour passer immédiatement à l action.' },
                            { title: 'Nouvelles relations', img: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=400&q=80', desc: 'Rejoignez un réseau actif d entrepreneurs passionnés.' },
                          ].map((col, i) => (
                            <div key={i} className="space-y-3">
                              <div className="aspect-video rounded-2xl overflow-hidden shadow-sm">
                                <img src={col.img} alt={col.title} className="w-full h-full object-cover" />
                              </div>
                              <h4 className="font-heading font-extrabold text-sm text-slate-900">{col.title}</h4>
                              <p className="text-xs text-slate-500 leading-relaxed">{col.desc}</p>
                            </div>
                          ))}
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
