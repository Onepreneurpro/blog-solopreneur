'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Palette, Check, Trash2, RotateCcw, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { THEMES, SiteThemeId } from '@/lib/theme';

export default function AdminThemesManagerPage() {
  const router = useRouter();
  const [activeTheme, setActiveTheme] = useState<SiteThemeId>('modern-bento');
  const [hiddenThemes, setHiddenThemes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchThemeData = () => {
    fetch('/api/admin/theme')
      .then((res) => res.json())
      .then((data) => {
        if (data.activeTheme) setActiveTheme(data.activeTheme);
        if (data.hiddenThemes) setHiddenThemes(data.hiddenThemes);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchThemeData();
  }, []);

  const handleActivateTheme = async (themeId: SiteThemeId) => {
    setUpdatingId(themeId);
    try {
      await fetch('/api/admin/theme', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ themeId }),
      });
      setActiveTheme(themeId);
      router.refresh();
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteTheme = async (themeId: string) => {
    if (themeId === activeTheme) {
      alert('Impossible de supprimer le thème actuellement actif.');
      return;
    }
    const updated = [...hiddenThemes, themeId];
    setHiddenThemes(updated);
    await fetch('/api/admin/theme', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hiddenThemes: updated }),
    });
  };

  const handleRestoreTheme = async (themeId: string) => {
    const updated = hiddenThemes.filter((id) => id !== themeId);
    setHiddenThemes(updated);
    await fetch('/api/admin/theme', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hiddenThemes: updated }),
    });
  };

  const visibleThemes = THEMES.filter((t) => !hiddenThemes.includes(t.id));
  const removedThemes = THEMES.filter((t) => hiddenThemes.includes(t.id));

  return (
    <div className="space-y-8 max-w-5xl pt-4">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="emerald">Apparence & CMS</Badge>
          </div>
          <h1 className="text-3xl font-heading font-black text-slate-950 tracking-tight">
            Gestionnaire de Thèmes & Templates du Site
          </h1>
          <p className="text-xs text-slate-600 mt-1 font-medium">
            Activez, personnalisez ou supprimez les thèmes et templates de votre plateforme en 1 clic.
          </p>
        </div>

        <a href="/" target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm" className="gap-2 font-extrabold bg-white border-2 border-slate-200">
            <span>Voir le site public</span>
            <ExternalLink className="w-4 h-4" />
          </Button>
        </a>
      </div>

      {/* VISIBLE THEMES GRID */}
      <div>
        <h2 className="text-sm font-heading font-black text-slate-900 uppercase tracking-wider mb-4">
          Thèmes Disponibles ({visibleThemes.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleThemes.map((theme) => {
            const isActive = activeTheme === theme.id;
            const isUpdating = updatingId === theme.id;

            return (
              <Card
                key={theme.id}
                className={`p-6 flex flex-col justify-between transition-all rounded-3xl ${
                  isActive
                    ? 'border-2 border-emerald-600 shadow-xl bg-white ring-4 ring-emerald-500/10'
                    : 'border-2 border-slate-200 bg-white hover:border-slate-300 shadow-sm'
                }`}
              >
                <div className="space-y-4">
                  
                  {/* PREVIEW BOX */}
                  <div
                    className="h-32 rounded-2xl border border-slate-200/80 p-4 flex flex-col justify-between relative overflow-hidden shadow-inner"
                    style={{ backgroundColor: theme.previewColor }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-7 h-7 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-black text-xs shadow-md">
                        S
                      </div>
                      <div className="w-12 h-2.5 rounded-full opacity-70" style={{ backgroundColor: theme.accentColor }} />
                    </div>

                    <div className="space-y-1.5">
                      <div className="w-2/3 h-3 rounded bg-white/40" />
                      <div className="w-1/2 h-2 rounded bg-white/30" />
                    </div>

                    {isActive && (
                      <div className="absolute top-2.5 right-2.5">
                        <span className="px-3 py-1 bg-emerald-500 text-slate-950 text-xs font-heading font-black rounded-full shadow-md">
                          ✓ Actif
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-heading font-black text-slate-950 text-base">{theme.name}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed mt-1 font-medium">{theme.description}</p>
                  </div>

                  <div>
                    <span className="px-2.5 py-1 bg-purple-100 text-purple-800 text-[10px] font-heading font-black rounded-full border border-purple-200">
                      {theme.badge}
                    </span>
                  </div>

                </div>

                {/* CARD ACTIONS */}
                <div className="pt-6 border-t border-slate-100 mt-6 flex items-center gap-2">
                  <Button
                    variant={isActive ? "outline" : "primary"}
                    size="md"
                    disabled={isActive || isUpdating}
                    onClick={() => handleActivateTheme(theme.id)}
                    className="flex-1 gap-2 font-heading font-black text-xs"
                  >
                    {isActive ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Thème Actif</span>
                      </>
                    ) : (
                      <>
                        <Palette className="w-4 h-4" />
                        <span>{isUpdating ? 'Activation...' : 'Activer'}</span>
                      </>
                    )}
                  </Button>

                  {!isActive && (
                    <Button
                      variant="danger"
                      size="md"
                      onClick={() => handleDeleteTheme(theme.id)}
                      className="px-3 text-xs"
                      title="Supprimer ce thème"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* REMOVED / HIDDEN THEMES RESTORATION SECTION */}
      {removedThemes.length > 0 && (
        <div className="pt-8 border-t border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <Trash2 className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-heading font-black text-slate-700 uppercase tracking-wider">
              Thèmes Supprimés ({removedThemes.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {removedThemes.map((theme) => (
              <Card key={theme.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="font-heading font-bold text-xs text-slate-800">{theme.name}</div>
                  <div className="text-[11px] text-slate-500">Masqué du catalogue</div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRestoreTheme(theme.id)}
                  className="gap-1 text-xs font-bold bg-white text-purple-700 border-purple-200 hover:bg-purple-50"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restaurer</span>
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
