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
  ChevronDown,
  Plus,
  Trash2,
  Copy,
  ExternalLink,
  Eye,
  Settings,
  Check,
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
  initialData?: string;
  onSaveSuccess?: () => void;
}

export const DEFAULT_WEBSTUDIO_PROJECT: WebstudioProjectData = {
  version: '0.100.0',
  engine: 'webstudio-is/webstudio',
  root: {
    id: 'ws-root-page',
    type: 'Page',
    name: 'Body / Main Page',
    tag: 'body',
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
  initialData,
  onSaveSuccess,
}: WebstudioStudioEngineProps) {
  const [projectData, setProjectData] = useState<WebstudioProjectData>(() => {
    if (initialData) {
      try {
        const parsed = JSON.parse(initialData);
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
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeSideTab, setActiveSideTab] = useState<'tree' | 'library'>('tree');

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

  const selectedNode = findNode(projectData.root, selectedNodeId) || projectData.root;

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

  // Add new child node
  const handleAddChildNode = (type: string, tag: string, name: string, defaultStyle: Record<string, string>, defaultContent?: string) => {
    const newNode: WebstudioNode = {
      id: `ws-node-${Date.now()}`,
      type,
      name,
      tag,
      style: defaultStyle,
      content: defaultContent,
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
          style={{ paddingLeft: `${level * 16 + 12}px` }}
          className={`py-1.5 pr-3 rounded-lg text-xs font-mono font-medium flex items-center justify-between cursor-pointer transition-all ${
            isSel
              ? 'bg-[#38BDF8]/20 text-[#38BDF8] border-l-2 border-[#38BDF8]'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            <span className="text-slate-500 text-[10px]">&lt;{node.tag}&gt;</span>
            <span className="truncate">{node.name}</span>
          </div>
          {node.id !== 'ws-root-page' && isSel && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteNode(node.id);
              }}
              className="text-rose-400 hover:text-rose-300 p-0.5"
              title="Supprimer le nœud"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {hasChildren && node.children!.map((child) => renderTreeNavigator(child, level + 1))}
      </div>
    );
  };

  // Recursive Node Canvas Renderer
  const renderCanvasNode = (node: WebstudioNode) => {
    const isSel = node.id === selectedNodeId;
    const Tag = (node.tag || 'div') as keyof JSX.IntrinsicElements;

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
        onClick={(e) => {
          e.stopPropagation();
          setSelectedNodeId(node.id);
        }}
      >
        {isSel && (
          <div className="absolute -top-5 left-0 bg-[#38BDF8] text-slate-950 font-mono font-bold text-[9px] px-2 py-0.5 rounded-t-md z-30 pointer-events-none uppercase tracking-wider flex items-center gap-1">
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
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* 1. TOP WEBSTUDIO STUDIO BAR */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-md">
              W
            </span>
            <div>
              <div className="font-heading font-black text-sm text-white flex items-center gap-2">
                <span>Webstudio Studio</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  v0.100.0 (OSS)
                </span>
              </div>
              <a
                href="https://docs.webstudio.is/"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-slate-400 hover:text-cyan-300 font-mono flex items-center gap-1"
              >
                <span>docs.webstudio.is</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800" />

          {/* BREAKPOINT SWITCHER */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1">
            <button
              onClick={() => setBreakpoint('desktop')}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                breakpoint === 'desktop' ? 'bg-[#0284C7] text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>1280px</span>
            </button>
            <button
              onClick={() => setBreakpoint('tablet')}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                breakpoint === 'tablet' ? 'bg-[#0284C7] text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
              <span>768px</span>
            </button>
            <button
              onClick={() => setBreakpoint('mobile')}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                breakpoint === 'mobile' ? 'bg-[#0284C7] text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>390px</span>
            </button>
          </div>
        </div>

        {/* RIGHT ACTION CONTROLS */}
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowCodeExport(true)}
            variant="outline"
            size="sm"
            className="text-xs font-bold border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 gap-1.5 rounded-xl"
          >
            <Code className="w-4 h-4 text-cyan-400" />
            <span>Export Code (React/Remix)</span>
          </Button>

          <Button
            onClick={handleSaveToFunnel}
            disabled={saving}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-heading font-black text-xs gap-2 px-5 py-2 rounded-xl shadow-lg"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Enregistrement Webstudio...' : saveSuccess ? '✅ Enregistré Webstudio' : 'Sauvegarder Webstudio'}</span>
          </Button>
        </div>
      </header>

      {/* 2. STUDIO MAIN BODY (NAVIGATOR + CANVAS + INSPECTOR) */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL: WEBSTUDIO NAVIGATOR & COMPONENT LIBRARY */}
        <div className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
          <div className="p-3 border-b border-slate-800 grid grid-cols-2 gap-2 bg-slate-950">
            <button
              onClick={() => setActiveSideTab('tree')}
              className={`py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeSideTab === 'tree' ? 'bg-[#0284C7] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Arbre DOM</span>
            </button>
            <button
              onClick={() => setActiveSideTab('library')}
              className={`py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeSideTab === 'library' ? 'bg-[#0284C7] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Composants</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {activeSideTab === 'tree' ? (
              <div className="space-y-2">
                <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Structure des Nœuds Webstudio
                </div>
                {renderTreeNavigator(projectData.root)}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Catalogue Composants Radix & HTML
                </div>
                <div className="space-y-2">
                  <button
                    onClick={() =>
                      handleAddChildNode(
                        'Heading',
                        'h2',
                        'Titre Section',
                        { fontSize: '28px', fontWeight: '800', color: '#FFFFFF', marginTop: '16px' },
                        'Nouveau Titre Webstudio'
                      )
                    }
                    className="w-full p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left text-xs font-bold text-slate-200 flex items-center justify-between group"
                  >
                    <span className="flex items-center gap-2">
                      <Type className="w-4 h-4 text-cyan-400" />
                      <span>&lt;h2&gt; Titre Section</span>
                    </span>
                    <Plus className="w-3.5 h-3.5 text-cyan-400 opacity-0 group-hover:opacity-100" />
                  </button>

                  <button
                    onClick={() =>
                      handleAddChildNode(
                        'Paragraph',
                        'p',
                        'Texte Paragraphe',
                        { fontSize: '14px', color: '#94A3B8', lineHeight: '1.6' },
                        'Texte de paragraphe éditable dans le moteur Webstudio.'
                      )
                    }
                    className="w-full p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left text-xs font-bold text-slate-200 flex items-center justify-between group"
                  >
                    <span className="flex items-center gap-2">
                      <Type className="w-4 h-4 text-slate-400" />
                      <span>&lt;p&gt; Paragraphe Texte</span>
                    </span>
                    <Plus className="w-3.5 h-3.5 text-cyan-400 opacity-0 group-hover:opacity-100" />
                  </button>

                  <button
                    onClick={() =>
                      handleAddChildNode(
                        'Button',
                        'button',
                        'Bouton CTA',
                        { backgroundColor: '#38BDF8', color: '#0F172A', padding: '12px 24px', borderRadius: '12px', fontWeight: '800' },
                        'Action CTA Webstudio'
                      )
                    }
                    className="w-full p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left text-xs font-bold text-slate-200 flex items-center justify-between group"
                  >
                    <span className="flex items-center gap-2">
                      <Box className="w-4 h-4 text-blue-400" />
                      <span>&lt;button&gt; Bouton CTA</span>
                    </span>
                    <Plus className="w-3.5 h-3.5 text-cyan-400 opacity-0 group-hover:opacity-100" />
                  </button>

                  <button
                    onClick={() =>
                      handleAddChildNode(
                        'Container',
                        'div',
                        'Flex Container',
                        { display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px', backgroundColor: '#1E293B', borderRadius: '16px' }
                      )
                    }
                    className="w-full p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left text-xs font-bold text-slate-200 flex items-center justify-between group"
                  >
                    <span className="flex items-center gap-2">
                      <Layout className="w-4 h-4 text-purple-400" />
                      <span>&lt;div&gt; Boîte Flexbox</span>
                    </span>
                    <Plus className="w-3.5 h-3.5 text-cyan-400 opacity-0 group-hover:opacity-100" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CENTER VISUAL CANVAS WORKSPACE */}
        <div className="flex-1 bg-slate-950 p-6 overflow-y-auto flex justify-center items-start">
          <div
            className={`w-full transition-all shadow-2xl rounded-3xl overflow-hidden border border-slate-800 ${
              breakpoint === 'mobile' ? 'max-w-sm' : breakpoint === 'tablet' ? 'max-w-2xl' : 'max-w-5xl'
            }`}
          >
            {renderCanvasNode(projectData.root)}
          </div>
        </div>

        {/* RIGHT PANEL: WEBSTUDIO CSS STYLE INSPECTOR */}
        <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0">
          <div className="p-3 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
            <div className="font-heading font-black text-xs text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Inspecteur Style CSS Webstudio</span>
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
                        <option value="row">row</option>
                        <option value="column">column</option>
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
