'use client';

import React, { useState } from 'react';
import {
  Code,
  Layout,
  Type,
  ImageIcon,
  Box,
  Sliders,
  Monitor,
  Tablet,
  Smartphone,
  Save,
  Sparkles,
  Layers,
  ChevronRight,
  Plus,
  Trash2,
  ExternalLink,
  Eye,
  LogOut,
  ArrowLeft,
  Settings,
  Check,
  MousePointer,
  Maximize2,
  Grid,
  Copy,
  ArrowUp,
  ArrowDown,
  Link,
  FormInput,
  List,
  MessageSquare,
  Video,
  FileText,
  ToggleLeft,
  HelpCircle,
  FolderPlus,
  Component,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface WebstudioNode {
  id: string;
  type: string;
  name: string;
  tag: string;
  style: Record<string, string>;
  attributes?: Record<string, string>;
  children?: WebstudioNode[];
  content?: string;
}

export interface WebstudioProjectData {
  version: string;
  engine: string;
  root: WebstudioNode;
}

interface WebstudioStudioEngineProps {
  stepId: string;
  funnelSlug?: string;
  stepSlug?: string;
  initialData?: string;
  onSaveSuccess?: () => void;
  onSwitchToMaisonV1?: () => void;
  onExit?: () => void;
}

export const DEFAULT_WEBSTUDIO_PROJECT: WebstudioProjectData = {
  version: '0.100.0',
  engine: 'webstudio-is/webstudio',
  root: {
    id: 'ws-root-page',
    type: 'Page',
    name: 'Body / Main Page',
    tag: 'div',
    style: {
      backgroundColor: '#0F172A',
      color: '#F8FAFC',
      fontFamily: 'system-ui, sans-serif',
      minHeight: '100vh',
      padding: '0px',
      margin: '0px',
    },
    children: [
      {
        id: 'ws-node-header',
        type: 'HeaderSection',
        name: 'Webstudio Navbar Section',
        tag: 'header',
        style: {
          backgroundColor: '#1E293B',
          padding: '16px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #334155',
        },
        children: [
          {
            id: 'ws-node-logo',
            type: 'Heading',
            name: 'Brand Logo Title',
            tag: 'h1',
            content: '🚀 Webstudio Funnel',
            style: {
              fontSize: '20px',
              fontWeight: '900',
              color: '#38BDF8',
            },
          },
          {
            id: 'ws-node-cta-nav',
            type: 'Button',
            name: 'Header CTA Button',
            tag: 'button',
            content: 'Commencer Maintenant',
            style: {
              backgroundColor: '#0284C7',
              color: '#FFFFFF',
              padding: '10px 20px',
              borderRadius: '12px',
              fontWeight: '700',
              fontSize: '13px',
            },
          },
        ],
      },
      {
        id: 'ws-node-hero',
        type: 'HeroSection',
        name: 'Hero Technicolor Container',
        tag: 'section',
        style: {
          padding: '64px 32px',
          maxWidth: '1100px',
          margin: '0 auto',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
        },
        children: [
          {
            id: 'ws-node-hero-title',
            type: 'Heading',
            name: 'Hero Title H1',
            tag: 'h1',
            content: 'Créez des Tunnels Haute Conversion avec Webstudio',
            style: {
              fontSize: '44px',
              fontWeight: '900',
              color: '#FFFFFF',
              lineHeight: '1.15',
            },
          },
          {
            id: 'ws-node-hero-desc',
            type: 'Paragraph',
            name: 'Hero Subtitle Paragraph',
            tag: 'p',
            content: 'Moteur visuel open-source haute performance avec gestion de l arbre DOM, jetons de design CSS et composants Radix UI.',
            style: {
              fontSize: '16px',
              color: '#94A3B8',
              maxWidth: '650px',
              lineHeight: '1.6',
            },
          },
          {
            id: 'ws-node-hero-btn',
            type: 'Button',
            name: 'Main Hero CTA',
            tag: 'button',
            content: '⚡ Réserver Mon Accès Gratuit',
            style: {
              backgroundColor: '#38BDF8',
              color: '#0F172A',
              padding: '16px 36px',
              borderRadius: '16px',
              fontWeight: '900',
              fontSize: '15px',
              marginTop: '12px',
            },
          },
        ],
      },
    ],
  },
};

export default function WebstudioStudioEngine({
  stepId,
  funnelSlug,
  stepSlug,
  initialData,
  onSaveSuccess,
  onSwitchToMaisonV1,
  onExit,
}: WebstudioStudioEngineProps) {
  const [projectData, setProjectData] = useState<WebstudioProjectData>(() => {
    if (initialData) {
      try {
        const parsed = typeof initialData === 'string' ? JSON.parse(initialData) : initialData;
        if (parsed?.root) return parsed;
      } catch (e) {
        console.error('Failed to parse initial Webstudio JSON', e);
      }
    }
    return DEFAULT_WEBSTUDIO_PROJECT;
  });

  const [selectedNodeId, setSelectedNodeId] = useState<string>('ws-node-hero-title');
  const [breakpoint, setBreakpoint] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showCodeExport, setShowCodeExport] = useState(false);
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeSideTab, setActiveSideTab] = useState<'tree' | 'library' | 'blocks'>('library');

  // Find selected node in tree
  const findNode = (node: WebstudioNode, targetId: string): WebstudioNode | null => {
    if (node.id === targetId) return node;
    if (node.children) {
      for (const child of node.children) {
        const res = findNode(child, targetId);
        if (res) return res;
      }
    }
    return null;
  };

  // Find parent of selected node
  const findParentNode = (node: WebstudioNode, targetId: string): WebstudioNode | null => {
    if (node.children) {
      for (const child of node.children) {
        if (child.id === targetId) return node;
        const res = findParentNode(child, targetId);
        if (res) return res;
      }
    }
    return null;
  };

  const selectedNode = findNode(projectData.root, selectedNodeId) || projectData.root;
  const parentNode = findParentNode(projectData.root, selectedNodeId);

  // Update node style
  const updateNodeStyle = (key: string, value: string) => {
    const updateRecursive = (node: WebstudioNode): WebstudioNode => {
      if (node.id === selectedNodeId) {
        return {
          ...node,
          style: {
            ...node.style,
            [key]: value,
          },
        };
      }
      if (node.children) {
        return {
          ...node,
          children: node.children.map(updateRecursive),
        };
      }
      return node;
    };

    setProjectData((prev) => ({
      ...prev,
      root: updateRecursive(prev.root),
    }));
  };

  // Update node content
  const updateNodeContent = (content: string) => {
    const updateRecursive = (node: WebstudioNode): WebstudioNode => {
      if (node.id === selectedNodeId) {
        return { ...node, content };
      }
      if (node.children) {
        return { ...node, children: node.children.map(updateRecursive) };
      }
      return node;
    };

    setProjectData((prev) => ({
      ...prev,
      root: updateRecursive(prev.root),
    }));
  };

  // Update node attribute (e.g. href, src, alt)
  const updateNodeAttribute = (key: string, value: string) => {
    const updateRecursive = (node: WebstudioNode): WebstudioNode => {
      if (node.id === selectedNodeId) {
        return {
          ...node,
          attributes: {
            ...node.attributes,
            [key]: value,
          },
        };
      }
      if (node.children) {
        return { ...node, children: node.children.map(updateRecursive) };
      }
      return node;
    };

    setProjectData((prev) => ({
      ...prev,
      root: updateRecursive(prev.root),
    }));
  };

  // Add new child node
  const handleAddChildNode = (
    type: string,
    tag: string,
    name: string,
    defaultStyle: Record<string, string>,
    defaultContent?: string,
    attributes?: Record<string, string>,
    childrenNodes?: WebstudioNode[]
  ) => {
    const newNode: WebstudioNode = {
      id: `ws-node-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type,
      name,
      tag,
      style: defaultStyle,
      content: defaultContent,
      attributes,
      children: childrenNodes,
    };

    const addRecursive = (node: WebstudioNode): WebstudioNode => {
      if (node.id === selectedNodeId) {
        return {
          ...node,
          children: [...(node.children || []), newNode],
        };
      }
      if (node.children) {
        return {
          ...node,
          children: node.children.map(addRecursive),
        };
      }
      return node;
    };

    setProjectData((prev) => ({
      ...prev,
      root: addRecursive(prev.root),
    }));
    setSelectedNodeId(newNode.id);
  };

  // Duplicate selected node
  const handleDuplicateNode = (id: string) => {
    if (id === 'ws-root-page') return;

    const duplicateRecursive = (node: WebstudioNode): WebstudioNode => {
      if (node.children) {
        const index = node.children.findIndex((c) => c.id === id);
        if (index !== -1) {
          const target = node.children[index];
          const clone: WebstudioNode = JSON.parse(JSON.stringify(target));
          clone.id = `ws-node-${Date.now()}`;
          clone.name = `${target.name} (Copie)`;
          const newChildren = [...node.children];
          newChildren.splice(index + 1, 0, clone);
          return { ...node, children: newChildren };
        }
        return { ...node, children: node.children.map(duplicateRecursive) };
      }
      return node;
    };

    setProjectData((prev) => ({
      ...prev,
      root: duplicateRecursive(prev.root),
    }));
  };

  // Move node up or down
  const handleMoveNode = (id: string, direction: 'up' | 'down') => {
    if (id === 'ws-root-page') return;

    const moveRecursive = (node: WebstudioNode): WebstudioNode => {
      if (node.children) {
        const index = node.children.findIndex((c) => c.id === id);
        if (index !== -1) {
          const newChildren = [...node.children];
          const targetIndex = direction === 'up' ? index - 1 : index + 1;
          if (targetIndex >= 0 && targetIndex < newChildren.length) {
            const [moved] = newChildren.splice(index, 1);
            newChildren.splice(targetIndex, 0, moved);
            return { ...node, children: newChildren };
          }
        }
        return { ...node, children: node.children.map(moveRecursive) };
      }
      return node;
    };

    setProjectData((prev) => ({
      ...prev,
      root: moveRecursive(prev.root),
    }));
  };

  // Delete selected node
  const handleDeleteNode = (id: string) => {
    if (id === 'ws-root-page') return;

    const deleteRecursive = (node: WebstudioNode): WebstudioNode => {
      if (!node.children) return node;
      return {
        ...node,
        children: node.children.filter((c) => c.id !== id).map(deleteRecursive),
      };
    };

    setProjectData((prev) => ({
      ...prev,
      root: deleteRecursive(prev.root),
    }));
    setSelectedNodeId('ws-root-page');
  };

  // Save to API
  const handleSaveToFunnel = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch('/api/webstudio/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stepId,
          webstudioData: projectData,
        }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        if (onSaveSuccess) onSaveSuccess();
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  // Recursive Tree Node Renderer for Navigator
  const renderTreeNavigator = (node: WebstudioNode, level = 0) => {
    const isSel = node.id === selectedNodeId;
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id} className="space-y-0.5">
        <div
          onClick={() => setSelectedNodeId(node.id)}
          style={{ paddingLeft: `${level * 14 + 10}px` }}
          className={`py-1.5 pr-2.5 rounded-lg text-xs font-mono font-medium flex items-center justify-between cursor-pointer transition-all ${
            isSel
              ? 'bg-[#38BDF8]/20 text-[#38BDF8] border-l-2 border-[#38BDF8]'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-1.5 min-w-0 truncate">
            <span className="text-slate-500 text-[10px]">&lt;{node.tag}&gt;</span>
            <span className="truncate">{node.name}</span>
          </div>
          {node.id !== 'ws-root-page' && isSel && (
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleMoveNode(node.id, 'up');
                }}
                className="text-slate-400 hover:text-white p-0.5"
                title="Monter"
              >
                <ArrowUp className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleMoveNode(node.id, 'down');
                }}
                className="text-slate-400 hover:text-white p-0.5"
                title="Descendre"
              >
                <ArrowDown className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDuplicateNode(node.id);
                }}
                className="text-cyan-400 hover:text-cyan-300 p-0.5"
                title="Dupliquer"
              >
                <Copy className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteNode(node.id);
                }}
                className="text-rose-400 hover:text-rose-300 p-0.5"
                title="Supprimer"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
        {hasChildren && node.children!.map((child) => renderTreeNavigator(child, level + 1))}
      </div>
    );
  };

  // Recursive Node Canvas Renderer
  const renderCanvasNode = (node: WebstudioNode) => {
    const isSel = node.id === selectedNodeId;
    const safeTag = (node.tag === 'body' || node.tag === 'html') ? 'div' : (node.tag || 'div');
    const Tag = safeTag as keyof JSX.IntrinsicElements;

    const inlineStyle: React.CSSProperties = {
      ...node.style,
      boxSizing: 'border-box',
      outline: isSel ? '2px solid #38BDF8' : undefined,
      outlineOffset: '2px',
      position: 'relative',
      cursor: 'pointer',
    };

    return (
      <Tag
        key={node.id}
        style={inlineStyle}
        {...(node.attributes || {})}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedNodeId(node.id);
        }}
      >
        {isSel && (
          <div className="absolute -top-5 left-0 bg-[#38BDF8] text-slate-950 font-mono font-bold text-[9px] px-2 py-0.5 rounded-t-md z-30 pointer-events-none uppercase tracking-wider flex items-center gap-1 shadow-md">
            <span>&lt;{node.tag}&gt;</span>
            <span>{node.name}</span>
          </div>
        )}
        {node.content}
        {node.children && node.children.map(renderCanvasNode)}
      </Tag>
    );
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans relative">
      {/* 1. TOP UNIFIED WEBSTUDIO TOOLBAR */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between shrink-0 shadow-lg z-40">
        <div className="flex items-center gap-3">
          {/* ENGINE MODE SWITCHER */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1">
            <button
              onClick={onSwitchToMaisonV1}
              className="px-3 py-1 rounded-lg text-xs font-bold text-slate-400 hover:text-white transition-all"
            >
              🎨 Maison V1
            </button>
            <button
              className="px-3 py-1 rounded-lg text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Webstudio V3 (OSS)</span>
            </button>
          </div>

          <div className="h-5 w-px bg-slate-800" />

          {/* BRAND LOGO & DOCS LINK */}
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-md">
              W
            </span>
            <div className="hidden sm:block">
              <div className="font-heading font-black text-xs text-white flex items-center gap-1.5">
                <span>Webstudio Studio</span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  v0.100.0 (OSS)
                </span>
              </div>
            </div>
          </div>

          <div className="h-5 w-px bg-slate-800" />

          {/* BREAKPOINT SWITCHER */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1">
            <button
              onClick={() => setBreakpoint('desktop')}
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                breakpoint === 'desktop' ? 'bg-[#0284C7] text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="1280px Desktop"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setBreakpoint('tablet')}
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                breakpoint === 'tablet' ? 'bg-[#0284C7] text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="768px Tablette"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setBreakpoint('mobile')}
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                breakpoint === 'mobile' ? 'bg-[#0284C7] text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="390px Mobile"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* SIDEBARS TOGGLES & ACTION BUTTONS */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLeftSidebar(!showLeftSidebar)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              showLeftSidebar
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Bibliothèque & DOM</span>
          </button>

          <button
            onClick={() => setShowRightSidebar(!showRightSidebar)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              showRightSidebar
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Inspecteur CSS</span>
          </button>

          <div className="h-5 w-px bg-slate-800" />

          {/* CODE EXPORT */}
          <button
            onClick={() => setShowCodeExport(true)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5"
          >
            <Code className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden lg:inline">Export Code</span>
          </button>

          {/* PUBLIC PAGE VIEW */}
          {funnelSlug && (
            <a
              href={`/funnel/${funnelSlug}/${stepSlug || ''}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-[#00A0FF] border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5 text-[#00A0FF]" />
              <span className="hidden sm:inline">Voir la page</span>
            </a>
          )}

          {/* SAVE */}
          <Button
            onClick={handleSaveToFunnel}
            disabled={saving}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-heading font-black text-xs gap-1.5 px-4 py-1.5 rounded-xl shadow-md"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Sauvegarde...' : saveSuccess ? '✅ Enregistré' : 'Sauvegarder'}</span>
          </Button>

          {/* EXIT */}
          {onExit && (
            <Button
              onClick={onExit}
              variant="outline"
              size="sm"
              className="text-slate-300 border-slate-700 bg-slate-800 hover:bg-slate-700 font-bold text-xs gap-1 rounded-xl px-3 py-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Quitter</span>
            </Button>
          )}
        </div>
      </header>

      {/* 2. MAIN WEBSTUDIO WORKSPACE (LEFT NAVIGATOR + CENTER CANVAS + RIGHT INSPECTOR) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT PANEL: WEBSTUDIO NAVIGATOR & COMPONENT LIBRARY */}
        {showLeftSidebar && (
          <div className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 z-30 shadow-2xl">
            <div className="p-2.5 border-b border-slate-800 grid grid-cols-3 gap-1 bg-slate-950">
              <button
                onClick={() => setActiveSideTab('library')}
                className={`py-1.5 text-[11px] font-bold rounded-lg flex items-center justify-center gap-1 transition-all ${
                  activeSideTab === 'library' ? 'bg-[#0284C7] text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Composants</span>
              </button>

              <button
                onClick={() => setActiveSideTab('tree')}
                className={`py-1.5 text-[11px] font-bold rounded-lg flex items-center justify-center gap-1 transition-all ${
                  activeSideTab === 'tree' ? 'bg-[#0284C7] text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Arbre DOM</span>
              </button>

              <button
                onClick={() => setActiveSideTab('blocks')}
                className={`py-1.5 text-[11px] font-bold rounded-lg flex items-center justify-center gap-1 transition-all ${
                  activeSideTab === 'blocks' ? 'bg-[#0284C7] text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>Blocs</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              {/* TAB 1: COMPONENT LIBRARY */}
              {activeSideTab === 'library' && (
                <div className="space-y-4">
                  {/* LAYOUT & STRUCTURE */}
                  <div className="space-y-2">
                    <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                      <Layout className="w-3 h-3" />
                      <span>Mise en Page & Conteneurs</span>
                    </div>

                    <button
                      onClick={() =>
                        handleAddChildNode(
                          'Container',
                          'div',
                          'Boîte Flex Box',
                          { display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px', backgroundColor: '#1E293B', borderRadius: '16px' }
                        )
                      }
                      className="w-full p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left text-xs font-bold text-slate-200 flex items-center justify-between group"
                    >
                      <span className="flex items-center gap-2">
                        <Box className="w-3.5 h-3.5 text-purple-400" />
                        <span>&lt;div&gt; Flexbox Box</span>
                      </span>
                      <Plus className="w-3.5 h-3.5 text-cyan-400 opacity-0 group-hover:opacity-100" />
                    </button>

                    <button
                      onClick={() =>
                        handleAddChildNode(
                          'GridContainer',
                          'div',
                          'Grille 2 Colonnes',
                          { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '24px', backgroundColor: '#0F172A' }
                        )
                      }
                      className="w-full p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left text-xs font-bold text-slate-200 flex items-center justify-between group"
                    >
                      <span className="flex items-center gap-2">
                        <Grid className="w-3.5 h-3.5 text-indigo-400" />
                        <span>&lt;div&gt; Grille 2 Cols</span>
                      </span>
                      <Plus className="w-3.5 h-3.5 text-cyan-400 opacity-0 group-hover:opacity-100" />
                    </button>

                    <button
                      onClick={() =>
                        handleAddChildNode(
                          'Section',
                          'section',
                          'Section Conteneur',
                          { padding: '48px 24px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }
                        )
                      }
                      className="w-full p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left text-xs font-bold text-slate-200 flex items-center justify-between group"
                    >
                      <span className="flex items-center gap-2">
                        <Layout className="w-3.5 h-3.5 text-cyan-400" />
                        <span>&lt;section&gt; Section</span>
                      </span>
                      <Plus className="w-3.5 h-3.5 text-cyan-400 opacity-0 group-hover:opacity-100" />
                    </button>
                  </div>

                  {/* TYPOGRAPHY */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                      <Type className="w-3 h-3" />
                      <span>Typographie & Titres</span>
                    </div>

                    <button
                      onClick={() =>
                        handleAddChildNode(
                          'Heading',
                          'h1',
                          'Titre Principal H1',
                          { fontSize: '40px', fontWeight: '900', color: '#FFFFFF', lineHeight: '1.2' },
                          'Titre H1 Webstudio'
                        )
                      }
                      className="w-full p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left text-xs font-bold text-slate-200 flex items-center justify-between group"
                    >
                      <span className="flex items-center gap-2">
                        <Type className="w-3.5 h-3.5 text-blue-400" />
                        <span>&lt;h1&gt; Titre H1</span>
                      </span>
                      <Plus className="w-3.5 h-3.5 text-cyan-400 opacity-0 group-hover:opacity-100" />
                    </button>

                    <button
                      onClick={() =>
                        handleAddChildNode(
                          'Heading',
                          'h2',
                          'Titre Section H2',
                          { fontSize: '28px', fontWeight: '800', color: '#38BDF8', marginTop: '12px' },
                          'Sous-Titre H2 Webstudio'
                        )
                      }
                      className="w-full p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left text-xs font-bold text-slate-200 flex items-center justify-between group"
                    >
                      <span className="flex items-center gap-2">
                        <Type className="w-3.5 h-3.5 text-cyan-400" />
                        <span>&lt;h2&gt; Titre H2</span>
                      </span>
                      <Plus className="w-3.5 h-3.5 text-cyan-400 opacity-0 group-hover:opacity-100" />
                    </button>

                    <button
                      onClick={() =>
                        handleAddChildNode(
                          'Paragraph',
                          'p',
                          'Paragraphe Texte',
                          { fontSize: '15px', color: '#94A3B8', lineHeight: '1.6' },
                          'Texte éditable directement dans Webstudio.'
                        )
                      }
                      className="w-full p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left text-xs font-bold text-slate-200 flex items-center justify-between group"
                    >
                      <span className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span>&lt;p&gt; Paragraphe</span>
                      </span>
                      <Plus className="w-3.5 h-3.5 text-cyan-400 opacity-0 group-hover:opacity-100" />
                    </button>
                  </div>

                  {/* MEDIA & BUTTONS */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" />
                      <span>Boutons & Médias</span>
                    </div>

                    <button
                      onClick={() =>
                        handleAddChildNode(
                          'Button',
                          'button',
                          'Bouton CTA',
                          { backgroundColor: '#0284C7', color: '#FFFFFF', padding: '14px 28px', borderRadius: '14px', fontWeight: '800', fontSize: '14px' },
                          '⚡ Action CTA Webstudio'
                        )
                      }
                      className="w-full p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left text-xs font-bold text-slate-200 flex items-center justify-between group"
                    >
                      <span className="flex items-center gap-2">
                        <Box className="w-3.5 h-3.5 text-sky-400" />
                        <span>&lt;button&gt; Bouton CTA</span>
                      </span>
                      <Plus className="w-3.5 h-3.5 text-cyan-400 opacity-0 group-hover:opacity-100" />
                    </button>

                    <button
                      onClick={() =>
                        handleAddChildNode(
                          'Image',
                          'img',
                          'Image Produit / Banner',
                          { width: '100%', borderRadius: '16px', border: '1px solid #334155' },
                          undefined,
                          { src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800', alt: 'Webstudio Banner' }
                        )
                      }
                      className="w-full p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left text-xs font-bold text-slate-200 flex items-center justify-between group"
                    >
                      <span className="flex items-center gap-2">
                        <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                        <span>&lt;img&gt; Image HD</span>
                      </span>
                      <Plus className="w-3.5 h-3.5 text-cyan-400 opacity-0 group-hover:opacity-100" />
                    </button>
                  </div>

                  {/* RADIX UI COMPONENTS */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1">
                      <Component className="w-3 h-3" />
                      <span>Composants Radix UI</span>
                    </div>

                    <button
                      onClick={() =>
                        handleAddChildNode(
                          'Accordion',
                          'div',
                          'Accordion FAQ (Radix UI)',
                          { backgroundColor: '#1E293B', padding: '16px', borderRadius: '16px', border: '1px solid #334155' },
                          '❓ FAQ Accordion Radix UI (Déroulant)'
                        )
                      }
                      className="w-full p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left text-xs font-bold text-purple-200 flex items-center justify-between group"
                    >
                      <span className="flex items-center gap-2">
                        <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
                        <span>Radix Accordion FAQ</span>
                      </span>
                      <Plus className="w-3.5 h-3.5 text-cyan-400 opacity-0 group-hover:opacity-100" />
                    </button>

                    <button
                      onClick={() =>
                        handleAddChildNode(
                          'Tabs',
                          'div',
                          'Onglets Tabs (Radix UI)',
                          { display: 'flex', gap: '8px', padding: '8px', backgroundColor: '#0F172A', borderRadius: '12px' },
                          '📁 Tabs Segment Navigation'
                        )
                      }
                      className="w-full p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left text-xs font-bold text-purple-200 flex items-center justify-between group"
                    >
                      <span className="flex items-center gap-2">
                        <List className="w-3.5 h-3.5 text-amber-400" />
                        <span>Radix Tabs Segment</span>
                      </span>
                      <Plus className="w-3.5 h-3.5 text-cyan-400 opacity-0 group-hover:opacity-100" />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: DOM TREE */}
              {activeSideTab === 'tree' && (
                <div className="space-y-2">
                  <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                    Arbre Hiérarchique Webstudio
                  </div>
                  {renderTreeNavigator(projectData.root)}
                </div>
              )}

              {/* TAB 3: PREBUILT BLOCKS */}
              {activeSideTab === 'blocks' && (
                <div className="space-y-3">
                  <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                    Modèles de Blocs Webstudio
                  </div>

                  <button
                    onClick={() =>
                      handleAddChildNode(
                        'GridSection',
                        'section',
                        'Grille 3 Cartes Avantages',
                        { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', padding: '40px 0px' },
                        undefined,
                        undefined,
                        [
                          {
                            id: `ws-card-1-${Date.now()}`,
                            type: 'Card',
                            name: 'Carte 1',
                            tag: 'div',
                            style: { backgroundColor: '#1E293B', padding: '24px', borderRadius: '16px' },
                            content: '⚡ Vitesse Ultra-Rapide',
                          },
                          {
                            id: `ws-card-2-${Date.now()}`,
                            type: 'Card',
                            name: 'Carte 2',
                            tag: 'div',
                            style: { backgroundColor: '#1E293B', padding: '24px', borderRadius: '16px' },
                            content: '🎨 Jetons Design CSS',
                          },
                          {
                            id: `ws-card-3-${Date.now()}`,
                            type: 'Card',
                            name: 'Carte 3',
                            tag: 'div',
                            style: { backgroundColor: '#1E293B', padding: '24px', borderRadius: '16px' },
                            content: '🚀 Conversion Élevée',
                          },
                        ]
                      )
                    }
                    className="w-full p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left text-xs font-bold text-slate-200 space-y-1"
                  >
                    <div className="text-cyan-400 font-bold">📦 Bloc Grille 3 Cartes</div>
                    <div className="text-[10px] text-slate-400">Insère 3 cartes de fonctionnalités pré-formatées</div>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CENTER VISUAL CANVAS WORKSPACE */}
        <div className="flex-1 bg-slate-950 p-6 overflow-y-auto flex flex-col items-center justify-start relative">
          {/* FLOATING ACTION TOOLBAR OVERLAY DIRECTLY ON CANVAS */}
          <div className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border border-slate-800 px-4 py-2 rounded-2xl shadow-xl flex items-center gap-3 mb-4 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
              <MousePointer className="w-3.5 h-3.5" />
              <span>Nœud : &lt;{selectedNode.tag}&gt; ({selectedNode.name})</span>
            </div>

            <div className="h-4 w-px bg-slate-800" />

            <button
              onClick={() => setActiveSideTab('library')}
              className="text-slate-300 hover:text-white flex items-center gap-1 font-bold"
            >
              <Plus className="w-3.5 h-3.5 text-cyan-400" />
              <span>+ Ajouter</span>
            </button>

            <button
              onClick={() => handleDuplicateNode(selectedNode.id)}
              disabled={selectedNode.id === 'ws-root-page'}
              className="text-slate-300 hover:text-white disabled:opacity-30 flex items-center gap-1 font-bold"
            >
              <Copy className="w-3.5 h-3.5 text-cyan-400" />
              <span>Dupliquer</span>
            </button>

            <button
              onClick={() => handleDeleteNode(selectedNode.id)}
              disabled={selectedNode.id === 'ws-root-page'}
              className="text-rose-400 hover:text-rose-300 disabled:opacity-30 flex items-center gap-1 font-bold"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Supprimer</span>
            </button>
          </div>

          <div
            className={`w-full transition-all shadow-2xl rounded-3xl overflow-hidden border border-slate-800 ${
              breakpoint === 'mobile' ? 'max-w-sm' : breakpoint === 'tablet' ? 'max-w-2xl' : 'max-w-5xl'
            }`}
          >
            {renderCanvasNode(projectData.root)}
          </div>
        </div>

        {/* RIGHT PANEL: WEBSTUDIO CSS STYLE INSPECTOR */}
        {showRightSidebar && (
          <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 z-30 shadow-2xl">
            <div className="p-3 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
              <div className="font-heading font-black text-xs text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>Inspecteur CSS Webstudio</span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 font-bold">&lt;{selectedNode.tag}&gt;</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {/* CONTENT EDITOR */}
              {selectedNode.content !== undefined && (
                <div className="space-y-1.5 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Texte du Nœud</label>
                  <textarea
                    rows={3}
                    value={selectedNode.content}
                    onChange={(e) => updateNodeContent(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:ring-2 focus:ring-cyan-500 resize-none font-medium"
                  />
                </div>
              )}

              {/* ATTRIBUTES SECTION (HREF / SRC) */}
              {(selectedNode.tag === 'a' || selectedNode.tag === 'img' || selectedNode.tag === 'button') && (
                <div className="space-y-3 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                  <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Link className="w-3.5 h-3.5" />
                    <span>Attributs HTML</span>
                  </div>
                  {selectedNode.tag === 'img' && (
                    <div className="space-y-2">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">URL de l Image (src)</label>
                        <input
                          type="text"
                          value={selectedNode.attributes?.src || ''}
                          onChange={(e) => updateNodeAttribute('src', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-cyan-500 font-mono"
                        />
                      </div>
                    </div>
                  )}
                  {(selectedNode.tag === 'a' || selectedNode.tag === 'button') && (
                    <div className="space-y-2">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Lien de Destination (href)</label>
                        <input
                          type="text"
                          value={selectedNode.attributes?.href || ''}
                          onChange={(e) => updateNodeAttribute('href', e.target.value)}
                          placeholder="https://..."
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-cyan-500 font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TYPOGRAPHY SECTION */}
              <div className="space-y-3 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5" />
                  <span>Typographie CSS</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Taille (fontSize)</label>
                    <input
                      type="text"
                      value={selectedNode.style.fontSize || '16px'}
                      onChange={(e) => updateNodeStyle('fontSize', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Couleur (color)</label>
                    <input
                      type="text"
                      value={selectedNode.style.color || '#FFFFFF'}
                      onChange={(e) => updateNodeStyle('color', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Graisse (fontWeight)</label>
                    <select
                      value={selectedNode.style.fontWeight || '400'}
                      onChange={(e) => updateNodeStyle('fontWeight', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white"
                    >
                      <option value="400">400 Normal</option>
                      <option value="600">600 Semi-Bold</option>
                      <option value="700">700 Bold</option>
                      <option value="900">900 Extra-Bold</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Alignement Texte</label>
                    <select
                      value={selectedNode.style.textAlign || 'left'}
                      onChange={(e) => updateNodeStyle('textAlign', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white"
                    >
                      <option value="left">Gauche</option>
                      <option value="center">Centre</option>
                      <option value="right">Droite</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* LAYOUT FLEX / GRID SECTION */}
              <div className="space-y-3 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Layout className="w-3.5 h-3.5" />
                  <span>Mise en Page (Flex/Grid)</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Affichage (display)</label>
                    <select
                      value={selectedNode.style.display || 'block'}
                      onChange={(e) => updateNodeStyle('display', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-cyan-500"
                    >
                      <option value="block">block</option>
                      <option value="flex">flex</option>
                      <option value="grid">grid</option>
                      <option value="inline-block">inline-block</option>
                    </select>
                  </div>
                  {selectedNode.style.display === 'flex' && (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Direction</label>
                        <select
                          value={selectedNode.style.flexDirection || 'row'}
                          onChange={(e) => updateNodeStyle('flexDirection', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white"
                        >
                          <option value="row">row (horizontale)</option>
                          <option value="column">column (verticale)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Alignement</label>
                        <select
                          value={selectedNode.style.alignItems || 'stretch'}
                          onChange={(e) => updateNodeStyle('alignItems', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white"
                        >
                          <option value="center">center</option>
                          <option value="flex-start">flex-start</option>
                          <option value="flex-end">flex-end</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* BACKGROUND & SPACING SECTION */}
              <div className="space-y-3 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Box className="w-3.5 h-3.5" />
                  <span>Fond & Espacements</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Fond (backgroundColor)</label>
                    <input
                      type="text"
                      value={selectedNode.style.backgroundColor || 'transparent'}
                      onChange={(e) => updateNodeStyle('backgroundColor', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Padding</label>
                      <input
                        type="text"
                        value={selectedNode.style.padding || '0px'}
                        onChange={(e) => updateNodeStyle('padding', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Bordure (borderRadius)</label>
                      <input
                        type="text"
                        value={selectedNode.style.borderRadius || '0px'}
                        onChange={(e) => updateNodeStyle('borderRadius', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CODE EXPORT MODAL */}
      {showCodeExport && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="font-heading font-black text-sm text-white flex items-center gap-2">
                <Code className="w-4 h-4 text-cyan-400" />
                <span>Export Code React / Remix Webstudio</span>
              </div>
              <button
                onClick={() => setShowCodeExport(false)}
                className="text-slate-400 hover:text-white font-bold text-xs"
              >
                ✕ Fermer
              </button>
            </div>
            <textarea
              readOnly
              rows={12}
              value={JSON.stringify(projectData, null, 2)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-cyan-300 outline-none"
            />
            <div className="flex justify-end">
              <Button
                onClick={() => setShowCodeExport(false)}
                className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs"
              >
                Fermer l export
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
