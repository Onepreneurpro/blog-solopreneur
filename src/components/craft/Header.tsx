'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
  stepData?: any;
  deviceMode: 'desktop' | 'tablet' | 'mobile';
  setDeviceMode: (mode: 'desktop' | 'tablet' | 'mobile') => void;
  stepId: string;
}

export const Header = ({ stepData, deviceMode, setDeviceMode, stepId }: HeaderProps) => {
  const { actions, query, canUndo, canRedo } = useEditor((state, query) => ({
    canUndo: query.history.canUndo(),
    canRedo: query.history.canRedo(),
  }));

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const json = query.serialize();
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

  return (
    <header className="h-14 bg-slate-950 border-b border-slate-800 px-4 flex items-center justify-between shrink-0 z-40 text-slate-100">
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
          <span className="text-xs font-black text-white font-heading">
            {stepData?.name || 'Étape Tunnel Beta 2'}
          </span>
          <span className="text-[9px] font-mono font-bold bg-[#00A0FF]/20 text-[#00A0FF] border border-[#00A0FF]/40 px-2 py-0.5 rounded-full">
            CRAFT.JS BETA 2
          </span>
        </div>
      </div>

      {/* DEVICE PREVIEW TOGGLE & UNDO/REDO */}
      <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1 rounded-xl">
        <button
          onClick={() => actions.history.undo()}
          disabled={!canUndo}
          title="Annuler (Ctrl+Z)"
          className={`p-1.5 rounded-lg transition-colors ${
            canUndo ? 'text-slate-200 hover:bg-slate-800' : 'text-slate-600 cursor-not-allowed'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={() => actions.history.redo()}
          disabled={!canRedo}
          title="Rétablir (Ctrl+Y)"
          className={`p-1.5 rounded-lg transition-colors ${
            canRedo ? 'text-slate-200 hover:bg-slate-800' : 'text-slate-600 cursor-not-allowed'
          }`}
        >
          <RotateCw className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-slate-800 my-auto" />

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

      {/* SAVE / PUBLISH ACTIONS */}
      <div className="flex items-center gap-3">
        {saveSuccess && (
          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 bg-emerald-950/80 border border-emerald-800 px-3 py-1 rounded-xl animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Sauvegardé avec succès !</span>
          </span>
        )}

        {stepData?.funnel && (
          <a
            href={`/funnel/${stepData.funnel.slug}/${stepData.slug}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 transition-colors"
          >
            <Eye className="w-4 h-4 text-purple-400" />
            <span>Aperçu Public</span>
          </a>
        )}

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
