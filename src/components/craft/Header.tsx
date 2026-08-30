'use client';

import React, { useState, useEffect } from 'react';
import { useEditor } from '@craftjs/core';
import {
  ArrowLeft,
  Save,
  RotateCcw,
  RotateCw,
  Monitor,
  Tablet,
  Smartphone,
  CheckCircle2,
  Eye,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
  stepData?: any;
  deviceMode: 'desktop' | 'tablet' | 'mobile';
  setDeviceMode: (mode: 'desktop' | 'tablet' | 'mobile') => void;
  pageLayoutMode?: 'centered' | 'full';
  setPageLayoutMode?: (mode: 'centered' | 'full') => void;
  stepId: string;
}

export const Header = ({
  stepData,
  deviceMode,
  setDeviceMode,
  pageLayoutMode = 'centered',
  setPageLayoutMode,
  stepId,
}: HeaderProps) => {
  const { actions, query, canUndo, canRedo } = useEditor((state, query) => ({
    canUndo: query.history.canUndo(),
    canRedo: query.history.canRedo(),
  }));

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // KEYBOARD SHORTCUTS FOR UNDO (Ctrl+Z) AND REDO (Ctrl+Y / Ctrl+Shift+Z)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept inside editable text if user is typing text, unless Ctrl key is pressed
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          if (canRedo) {
            e.preventDefault();
            actions.history.redo();
          }
        } else {
          if (canUndo) {
            e.preventDefault();
            actions.history.undo();
          }
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        if (canRedo) {
          e.preventDefault();
          actions.history.redo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, actions]);

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const rawJson = query.serialize();
      const parsed = JSON.parse(rawJson);

      // Inject current pageLayoutMode into ROOT node props before saving
      if (parsed && parsed.ROOT) {
        parsed.ROOT.props = {
          ...parsed.ROOT.props,
          pageLayoutMode,
        };
      }

      const json = JSON.stringify(parsed);

      const res = await fetch(`/api/admin/funnel-steps/${stepId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: json,
        }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save Craft.js canvas:', err);
    } finally {
      setSaving(false);
    }
  };

  const publicUrl =
    stepData?.funnel?.slug && stepData?.slug
      ? `/funnel/${stepData.funnel.slug}/${stepData.slug}`
      : stepData?.funnel?.slug
      ? `/funnel/${stepData.funnel.slug}`
      : '#';

  return (
    <header className="h-14 bg-slate-950 border-b border-slate-800 px-4 flex items-center justify-between shrink-0 z-40 text-slate-100 select-none">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/tunnels-beta2"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-[#00A0FF]" />
          <span>Tunnels Beta 2</span>
        </Link>

        <div className="h-4 w-px bg-slate-800" />

        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-white font-heading truncate max-w-[140px] sm:max-w-xs">
            {stepData?.name || 'Étape Tunnel Beta 2'}
          </span>
          <span className="text-[9px] font-mono font-bold bg-[#00A0FF]/20 text-[#00A0FF] border border-[#00A0FF]/40 px-2 py-0.5 rounded-full">
            CRAFT.JS BETA 2
          </span>
        </div>
      </div>

      {/* CENTER ACTIONS: UNDO/REDO, PAGE LAYOUT MODE, DEVICE PREVIEW */}
      <div className="flex items-center gap-2.5">
        {/* UNDO / REDO BUTTONS (ANNULER / AVANCER) */}
        <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl gap-1">
          <button
            onClick={() => actions.history.undo()}
            disabled={!canUndo}
            title="Annuler la dernière action (Ctrl+Z)"
            className={`px-2.5 py-1 text-xs font-black rounded-lg flex items-center gap-1.5 transition-all ${
              canUndo
                ? 'bg-slate-800 text-white hover:bg-slate-700 active:scale-95 shadow-xs'
                : 'text-slate-600 bg-slate-950/50 cursor-not-allowed opacity-50'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#00A0FF]" />
            <span>Annuler</span>
          </button>

          <button
            onClick={() => actions.history.redo()}
            disabled={!canRedo}
            title="Avancer / Rétablir l action (Ctrl+Y)"
            className={`px-2.5 py-1 text-xs font-black rounded-lg flex items-center gap-1.5 transition-all ${
              canRedo
                ? 'bg-slate-800 text-white hover:bg-slate-700 active:scale-95 shadow-xs'
                : 'text-slate-600 bg-slate-950/50 cursor-not-allowed opacity-50'
            }`}
          >
            <RotateCw className="w-3.5 h-3.5 text-[#00A0FF]" />
            <span>Avancer</span>
          </button>
        </div>

        {/* PAGE LAYOUT MODE (CENTRED VS PLEINE PAGE) */}
        {setPageLayoutMode && (
          <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setPageLayoutMode('centered')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors ${
                pageLayoutMode === 'centered'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
              title="Mode Centré Boîte (1024px)"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mode Centré</span>
            </button>
            <button
              onClick={() => setPageLayoutMode('full')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors ${
                pageLayoutMode === 'full'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
              title="Mode Pleine Page (100% Full Width)"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pleine Page (Fill)</span>
            </button>
          </div>
        )}

        {/* DEVICE PREVIEW TOGGLE */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setDeviceMode('desktop')}
            className={`p-1.5 rounded-lg transition-colors ${
              deviceMode === 'desktop' ? 'bg-[#00A0FF] text-white' : 'text-slate-400 hover:bg-slate-800'
            }`}
            title="Vue Bureau"
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeviceMode('tablet')}
            className={`p-1.5 rounded-lg transition-colors ${
              deviceMode === 'tablet' ? 'bg-[#00A0FF] text-white' : 'text-slate-400 hover:bg-slate-800'
            }`}
            title="Vue Tablette"
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeviceMode('mobile')}
            className={`p-1.5 rounded-lg transition-colors ${
              deviceMode === 'mobile' ? 'bg-[#00A0FF] text-white' : 'text-slate-400 hover:bg-slate-800'
            }`}
            title="Vue Mobile"
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SAVE / PUBLISH ACTIONS */}
      <div className="flex items-center gap-3">
        {saveSuccess && (
          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 bg-emerald-950/80 border border-emerald-800 px-3 py-1 rounded-xl animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Sauvegardé avec succès !</span>
          </span>
        )}

        <a
          href={publicUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors"
          title="Ouvrir la page publique du tunnel dans un nouvel onglet"
        >
          <Eye className="w-4 h-4 text-purple-400" />
          <span>Voir la page</span>
        </a>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-[#00A0FF] hover:bg-[#0080FF] text-white text-xs font-black rounded-xl shadow-lg transition-all"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</span>
        </button>
      </div>
    </header>
  );
};
