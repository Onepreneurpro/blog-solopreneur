'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Tag, Edit, Save, X, ArrowUp, ArrowDown, LayoutTemplate, CheckCircle2, Type, AlignLeft, AlignCenter, AlignRight, Sliders, Palette, Layers, Globe, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

const GOOGLE_FONTS_OPTIONS = [
  { name: 'Plus Jakarta Sans', importName: 'Plus+Jakarta+Sans:wght@700;800;900' },
  { name: 'Outfit', importName: 'Outfit:wght@700;800;900' },
  { name: 'Syne', importName: 'Syne:wght@700;800' },
  { name: 'Space Grotesk', importName: 'Space+Grotesk:wght@700' },
  { name: 'Poppins', importName: 'Poppins:wght@700;800;900' },
  { name: 'Montserrat', importName: 'Montserrat:wght@800;900' },
  { name: 'Playfair Display', importName: 'Playfair+Display:ital,wght@0,800;1,700' },
  { name: 'Bricolage Grotesque', importName: 'Bricolage+Grotesque:opsz,wght@12..96,800' },
  { name: 'Inter', importName: 'Inter:wght@800;900' },
];

const PRESET_COLORS = [
  { label: 'Vert Neon', value: '#a3e635' },
  { label: 'Blanc', value: '#ffffff' },
  { label: 'Violet Lumineux', value: '#c084fc' },
  { label: 'Cyan / Bleu', value: '#38bdf8' },
  { label: 'Or / Jaune', value: '#fbbf24' },
  { label: 'Gris Clair', value: '#cbd5e1' },
];

export default function AdminProductCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state for adding new product category
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  // Inline Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Active Formatting Tab: 'global' | 'badge' | 'title' | 'accent' | 'subtitle'
  const [activeTab, setActiveTab] = useState<'global' | 'badge' | 'title' | 'accent' | 'subtitle'>('global');

  // Store Hero Texts
  const [storeHeroBadge, setStoreHeroBadge] = useState('BOUTIQUE PRO POUR SOLOPRENEURS & FREELANCES');
  const [storeHeroTitle, setStoreHeroTitle] = useState('Templates Notion & Dashboards Excel');
  const [storeHeroTitleAccent, setStoreHeroTitleAccent] = useState('Haute Performance');
  const [storeHeroSubtitle, setStoreHeroSubtitle] = useState('Automatisez votre organisation, suivez vos finances et développez votre activité d indépendant avec des systèmes testés et prêts à l emploi.');

  // Flexible Formatting Parameters
  const [storeHeroFontGlobal, setStoreHeroFontGlobal] = useState(true);
  const [storeHeroFontFamily, setStoreHeroFontFamily] = useState('Plus Jakarta Sans');
  
  const [storeHeroBadgeFont, setStoreHeroBadgeFont] = useState('Plus Jakarta Sans');
  const [storeHeroBadgeSize, setStoreHeroBadgeSize] = useState('11px');
  const [storeHeroBadgeColor, setStoreHeroBadgeColor] = useState('#a3e635');
  
  const [storeHeroTitleFont, setStoreHeroTitleFont] = useState('Plus Jakarta Sans');
  const [storeHeroTitleSize, setStoreHeroTitleSize] = useState('48px');
  const [storeHeroTitleColor, setStoreHeroTitleColor] = useState('#ffffff');
  
  const [storeHeroAccentFont, setStoreHeroAccentFont] = useState('Plus Jakarta Sans');
  const [storeHeroAccentColor, setStoreHeroAccentColor] = useState('#a3e635');
  
  const [storeHeroSubtitleFont, setStoreHeroSubtitleFont] = useState('Plus Jakarta Sans');
  const [storeHeroSubtitleSize, setStoreHeroSubtitleSize] = useState('16px');
  const [storeHeroSubtitleColor, setStoreHeroSubtitleColor] = useState('#cbd5e1');
  
  const [storeHeroAlign, setStoreHeroAlign] = useState('center');

  const [savingHero, setSavingHero] = useState(false);
  const [heroSuccess, setHeroSuccess] = useState('');

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories-produits');
      const data = await res.json();
      if (data.categories) setCategories(data.categories);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHeroSettings = async () => {
    try {
      const res = await fetch('/api/admin/parametres');
      const data = await res.json();
      if (data.settings) {
        const s = data.settings;
        if (s.storeHeroBadge) setStoreHeroBadge(s.storeHeroBadge);
        if (s.storeHeroTitle) setStoreHeroTitle(s.storeHeroTitle);
        if (s.storeHeroTitleAccent !== undefined) setStoreHeroTitleAccent(s.storeHeroTitleAccent);
        if (s.storeHeroSubtitle) setStoreHeroSubtitle(s.storeHeroSubtitle);

        if (s.storeHeroFontGlobal !== undefined) setStoreHeroFontGlobal(Boolean(s.storeHeroFontGlobal));
        if (s.storeHeroFontFamily) setStoreHeroFontFamily(s.storeHeroFontFamily);

        if (s.storeHeroBadgeFont) setStoreHeroBadgeFont(s.storeHeroBadgeFont);
        if (s.storeHeroBadgeSize) setStoreHeroBadgeSize(s.storeHeroBadgeSize);
        if (s.storeHeroBadgeColor) setStoreHeroBadgeColor(s.storeHeroBadgeColor);

        if (s.storeHeroTitleFont) setStoreHeroTitleFont(s.storeHeroTitleFont);
        if (s.storeHeroTitleSize) setStoreHeroTitleSize(s.storeHeroTitleSize);
        if (s.storeHeroTitleColor) setStoreHeroTitleColor(s.storeHeroTitleColor);

        if (s.storeHeroAccentFont) setStoreHeroAccentFont(s.storeHeroAccentFont);
        if (s.storeHeroAccentColor) setStoreHeroAccentColor(s.storeHeroAccentColor);

        if (s.storeHeroSubtitleFont) setStoreHeroSubtitleFont(s.storeHeroSubtitleFont);
        if (s.storeHeroSubtitleSize) setStoreHeroSubtitleSize(s.storeHeroSubtitleSize);
        if (s.storeHeroSubtitleColor) setStoreHeroSubtitleColor(s.storeHeroSubtitleColor);

        if (s.storeHeroAlign) setStoreHeroAlign(s.storeHeroAlign);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchHeroSettings();
  }, []);

  // Dynamically load selected Google Fonts for live preview
  useEffect(() => {
    const fontsToLoad = new Set([
      storeHeroFontFamily,
      storeHeroBadgeFont,
      storeHeroTitleFont,
      storeHeroAccentFont,
      storeHeroSubtitleFont,
    ]);

    fontsToLoad.forEach((fontName) => {
      if (!fontName) return;
      const fontObj = GOOGLE_FONTS_OPTIONS.find((f) => f.name === fontName);
      if (fontObj) {
        const linkId = `google-font-preview-${fontName.replace(/\s+/g, '-')}`;
        if (!document.getElementById(linkId)) {
          const link = document.createElement('link');
          link.id = linkId;
          link.rel = 'stylesheet';
          link.href = `https://fonts.googleapis.com/css2?family=${fontObj.importName}&display=swap`;
          document.head.appendChild(link);
        }
      }
    });
  }, [
    storeHeroFontFamily,
    storeHeroBadgeFont,
    storeHeroTitleFont,
    storeHeroAccentFont,
    storeHeroSubtitleFont,
  ]);

  const handleGlobalFontChange = (font: string) => {
    setStoreHeroFontFamily(font);
    if (storeHeroFontGlobal) {
      setStoreHeroBadgeFont(font);
      setStoreHeroTitleFont(font);
      setStoreHeroAccentFont(font);
      setStoreHeroSubtitleFont(font);
    }
  };

  const handleToggleFontGlobal = (isGlobal: boolean) => {
    setStoreHeroFontGlobal(isGlobal);
    if (isGlobal) {
      setStoreHeroBadgeFont(storeHeroFontFamily);
      setStoreHeroTitleFont(storeHeroFontFamily);
      setStoreHeroAccentFont(storeHeroFontFamily);
      setStoreHeroSubtitleFont(storeHeroFontFamily);
    }
  };

  const handleNameChange = (val: string) => {
    setName(val);
    const generatedSlug = val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    setSlug(generatedSlug);
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setError('');

    try {
      const res = await fetch('/api/admin/categories-produits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug, description }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la création.');

      setName('');
      setSlug('');
      setDescription('');
      fetchCategories();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleStartEdit = (cat: any) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditSlug(cat.slug);
    setEditDescription(cat.description || '');
  };

  const handleSaveEdit = async (id: string) => {
    setSavingEdit(true);
    try {
      const res = await fetch('/api/admin/categories-produits', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          name: editName,
          slug: editSlug,
          description: editDescription,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur de mise à jour.');

      setEditingId(null);
      fetchCategories();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cette catégorie de produits ?')) return;

    try {
      const res = await fetch(`/api/admin/categories-produits?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erreur lors de la suppression.');
      fetchCategories();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleMove = async (index: number, direction: 'UP' | 'DOWN') => {
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const newCategories = [...categories];
    const temp = newCategories[index];
    newCategories[index] = newCategories[targetIndex];
    newCategories[targetIndex] = temp;

    const reorderPayload = newCategories.map((c, i) => ({
      id: c.id,
      position: i + 1,
    }));

    setCategories(newCategories);

    try {
      await fetch('/api/admin/categories-produits', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reorder: reorderPayload }),
      });
    } catch (err) {
      console.error('Failed to reorder categories:', err);
      fetchCategories();
    }
  };

  const handleSaveHeroSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingHero(true);
    setHeroSuccess('');

    try {
      const res = await fetch('/api/admin/parametres', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeHeroBadge,
          storeHeroTitle,
          storeHeroTitleAccent,
          storeHeroSubtitle,

          storeHeroFontGlobal,
          storeHeroFontFamily,

          storeHeroBadgeFont: storeHeroFontGlobal ? storeHeroFontFamily : storeHeroBadgeFont,
          storeHeroBadgeSize,
          storeHeroBadgeColor,

          storeHeroTitleFont: storeHeroFontGlobal ? storeHeroFontFamily : storeHeroTitleFont,
          storeHeroTitleSize,
          storeHeroTitleColor,

          storeHeroAccentFont: storeHeroFontGlobal ? storeHeroFontFamily : storeHeroAccentFont,
          storeHeroAccentColor,

          storeHeroSubtitleFont: storeHeroFontGlobal ? storeHeroFontFamily : storeHeroSubtitleFont,
          storeHeroSubtitleSize,
          storeHeroSubtitleColor,

          storeHeroAlign,
        }),
      });

      if (!res.ok) throw new Error('Erreur lors de la sauvegarde de l entête.');
      setHeroSuccess('L entête de la boutique a été mis à jour avec succès !');
      setTimeout(() => setHeroSuccess(''), 4000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingHero(false);
    }
  };

  return (
    <div className="space-y-8 w-full">
      
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Tag className="w-6 h-6 text-purple-600" />
          <span>Gestion des Catégories de Produits</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Gérez et réordonnez l affichage des catégories de produits. L ordre ci-dessous se reflète immédiatement dans la barre de navigation.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl font-bold">
          {error}
        </div>
      )}

      {/* 1. GESTION DES CATÉGORIES ET CLASSEMENT (EN HAUT) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full">
        
        {/* FORMULAIRE AJOUT CATEGORIE */}
        <div className="md:col-span-4 space-y-4">
          <Card className="p-6 bg-white border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-purple-600" />
              <span>Ajouter une Catégorie</span>
            </h3>

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nom de la catégorie *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Formations vidéo, Ebooks PDF"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Slug URL *</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description (Optionnelle)</label>
                <textarea
                  rows={3}
                  placeholder="Résumé attrayant de cette gamme de produits..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <Button
                type="submit"
                disabled={adding}
                variant="primary"
                size="md"
                className="w-full font-extrabold bg-purple-700 hover:bg-purple-800 text-white shadow-sm border-0"
              >
                <Plus className="w-4 h-4 mr-1" />
                <span>{adding ? 'Création...' : 'Créer la catégorie'}</span>
              </Button>
            </form>
          </Card>
        </div>

        {/* TABLEAU DES CATEGORIES */}
        <div className="md:col-span-8">
          <Card className="bg-white overflow-hidden shadow-sm border border-slate-200 w-full">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="p-4 w-20 text-center">Position</th>
                    <th className="p-4">Catégorie</th>
                    <th className="p-4">Slug URL</th>
                    <th className="p-4">Produits</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500">Chargement des catégories...</td>
                    </tr>
                  ) : categories.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500">Aucune catégorie de produit pour le moment.</td>
                    </tr>
                  ) : (
                    categories.map((cat, idx) => (
                      <tr key={cat.id} className="hover:bg-slate-50 transition-colors">
                        
                        {/* POSITION & BOUTONS FLÉCHÉS */}
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <div className="flex flex-col gap-0.5">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMove(idx, 'UP')}
                                className="p-1 text-slate-400 hover:text-purple-700 disabled:opacity-20 disabled:hover:text-slate-400 transition-colors"
                                title="Monter dans le classement"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === categories.length - 1}
                                onClick={() => handleMove(idx, 'DOWN')}
                                className="p-1 text-slate-400 hover:text-purple-700 disabled:opacity-20 disabled:hover:text-slate-400 transition-colors"
                                title="Descendre dans le classement"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                              #{idx + 1}
                            </span>
                          </div>
                        </td>

                        {/* DETAILS / ÉDITION INLINE */}
                        <td colSpan={editingId === cat.id ? 4 : 1} className="p-4">
                          {editingId === cat.id ? (
                            <div className="space-y-3 p-3 bg-purple-50 rounded-xl border border-purple-200">
                              <div className="flex items-center justify-between border-b border-purple-200 pb-2">
                                <span className="text-xs font-bold text-purple-950">Modifier la catégorie</span>
                                <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                                  <X className="w-4 h-4 text-slate-500" />
                                </Button>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Nom *</label>
                                  <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="w-full px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-lg bg-white"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Slug URL *</label>
                                  <input
                                    type="text"
                                    value={editSlug}
                                    onChange={(e) => setEditSlug(e.target.value)}
                                    className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg bg-white"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 mb-1">Description</label>
                                <input
                                  type="text"
                                  value={editDescription}
                                  onChange={(e) => setEditDescription(e.target.value)}
                                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                                />
                              </div>
                              <div className="flex justify-end gap-2 pt-1">
                                <Button variant="outline" size="sm" onClick={() => setEditingId(null)}>
                                  Annuler
                                </Button>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  disabled={savingEdit}
                                  onClick={() => handleSaveEdit(cat.id)}
                                  className="bg-purple-700 hover:bg-purple-800 text-white font-bold"
                                >
                                  <Save className="w-3.5 h-3.5 mr-1" />
                                  <span>{savingEdit ? 'Sauvegarde...' : 'Enregistrer'}</span>
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="font-extrabold text-slate-900 flex items-center gap-2">
                                <Tag className="w-4 h-4 text-purple-600 flex-shrink-0" />
                                <span>{cat.name}</span>
                              </div>
                              {cat.description && (
                                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{cat.description}</p>
                              )}
                            </div>
                          )}
                        </td>

                        {editingId !== cat.id && (
                          <>
                            <td className="p-4 text-xs font-mono text-slate-500">
                              {cat.slug === 'ressources' ? '/ressources' : `/boutique/categorie/${cat.slug}`}
                            </td>
                            <td className="p-4">
                              <Badge variant="indigo" className="text-xs bg-purple-100 text-purple-900 border-purple-300 font-extrabold">
                                {cat._count?.products || 0} produit(s)
                              </Badge>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStartEdit(cat)}
                                  className="px-2.5 py-1 text-xs font-bold text-purple-900 border-purple-200 bg-purple-50 hover:bg-purple-100 gap-1"
                                  title="Modifier ou renommer la catégorie"
                                >
                                  <Edit className="w-3.5 h-3.5 text-purple-700" />
                                  <span>Modifier</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteCategory(cat.id)}
                                  className="text-red-500 hover:bg-red-50"
                                  title="Supprimer la catégorie"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

      </div>

      {/* 2. EDITEUR ULTRA SOUPLE PAR ÉLÉMENT DE L'ENTÊTE DE LA BOUTIQUE */}
      <Card className="p-6 bg-white border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <LayoutTemplate className="w-5 h-5 text-purple-600" />
            <h2 className="text-base font-extrabold text-slate-900">
              Éditeur de Formatage Cible par Élément (Textes, Polices, Tailles & Couleurs)
            </h2>
          </div>
          {heroSuccess && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{heroSuccess}</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSaveHeroSettings} className="space-y-6">
          
          {/* SELECTIONS D'ÉLÉMENT PAR ONGLETS (TABS INTERACTIFS) */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
            <button
              type="button"
              onClick={() => setActiveTab('global')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === 'global'
                  ? 'bg-purple-700 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Réglages Globaux & Alignement</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('badge')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === 'badge'
                  ? 'bg-purple-700 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#a3e635]" />
              <span>1. Badge Kicker</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('title')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === 'title'
                  ? 'bg-purple-700 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>2. Titre Principal</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('accent')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === 'accent'
                  ? 'bg-purple-700 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>3. Mot Neon Accentué</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('subtitle')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === 'subtitle'
                  ? 'bg-purple-700 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>4. Sous-titre / Description</span>
            </button>
          </div>

          {/* CONTENU DE L'ONGLET SÉLECTIONNÉ */}
          <div className="p-5 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-4">
            
            {/* TAB 0: REGLAGES GLOBAUX */}
            {activeTab === 'global' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-purple-950">Option de Police globale :</span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={storeHeroFontGlobal}
                      onChange={(e) => handleToggleFontGlobal(e.target.checked)}
                      className="w-4 h-4 text-purple-600 rounded"
                    />
                    <span className="text-xs font-bold text-purple-950">
                      Appliquer la même police à TOUS les textes
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Police Google Fonts Globale
                    </label>
                    <select
                      value={storeHeroFontFamily}
                      onChange={(e) => handleGlobalFontChange(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-purple-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {GOOGLE_FONTS_OPTIONS.map((f) => (
                        <option key={f.name} value={f.name}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Alignement Global de l Entête
                    </label>
                    <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-purple-300">
                      <button
                        type="button"
                        onClick={() => setStoreHeroAlign('left')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded flex items-center justify-center gap-1.5 transition-colors ${
                          storeHeroAlign === 'left' ? 'bg-purple-700 text-white' : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <AlignLeft className="w-4 h-4" />
                        <span>Gauche</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setStoreHeroAlign('center')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded flex items-center justify-center gap-1.5 transition-colors ${
                          storeHeroAlign === 'center' ? 'bg-purple-700 text-white' : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <AlignCenter className="w-4 h-4" />
                        <span>Centré</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setStoreHeroAlign('right')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded flex items-center justify-center gap-1.5 transition-colors ${
                          storeHeroAlign === 'right' ? 'bg-purple-700 text-white' : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <AlignRight className="w-4 h-4" />
                        <span>Droite</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 1: BADGE KICKER */}
            {activeTab === 'badge' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-purple-950 mb-1">
                    Texte du Badge Kicker (Opt-in) *
                  </label>
                  <input
                    type="text"
                    value={storeHeroBadge}
                    onChange={(e) => setStoreHeroBadge(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-purple-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="BOUTIQUE PRO POUR SOLOPRENEURS & FREELANCES"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {!storeHeroFontGlobal && (
                    <div>
                      <label className="block text-[11px] font-bold text-purple-950 mb-1">Police du Badge</label>
                      <select
                        value={storeHeroBadgeFont}
                        onChange={(e) => setStoreHeroBadgeFont(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-purple-300 rounded-lg text-xs font-bold"
                      >
                        {GOOGLE_FONTS_OPTIONS.map((f) => (
                          <option key={f.name} value={f.name}>{f.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold text-purple-950 mb-1">Taille de Police</label>
                    <select
                      value={storeHeroBadgeSize}
                      onChange={(e) => setStoreHeroBadgeSize(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-purple-300 rounded-lg text-xs font-bold"
                    >
                      <option value="10px">Discret (10px)</option>
                      <option value="12px">Standard (12px)</option>
                      <option value="14px">Grand (14px)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-purple-950 mb-1">Couleur du Badge</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={storeHeroBadgeColor}
                        onChange={(e) => setStoreHeroBadgeColor(e.target.value)}
                        className="w-9 h-9 p-0.5 rounded cursor-pointer border border-slate-300"
                      />
                      <div className="flex items-center gap-1">
                        {PRESET_COLORS.map((c) => (
                          <button
                            key={c.value}
                            type="button"
                            onClick={() => setStoreHeroBadgeColor(c.value)}
                            style={{ backgroundColor: c.value }}
                            className="w-5 h-5 rounded-full border border-slate-400"
                            title={c.label}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: TITRE PRINCIPAL */}
            {activeTab === 'title' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-purple-950 mb-1">
                    Texte du Titre Principal (Lignes 1 & 2) *
                  </label>
                  <input
                    type="text"
                    required
                    value={storeHeroTitle}
                    onChange={(e) => setStoreHeroTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-purple-300 rounded-lg text-xs font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Templates Notion & Dashboards Excel"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {!storeHeroFontGlobal && (
                    <div>
                      <label className="block text-[11px] font-bold text-purple-950 mb-1">Police du Titre</label>
                      <select
                        value={storeHeroTitleFont}
                        onChange={(e) => setStoreHeroTitleFont(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-purple-300 rounded-lg text-xs font-bold"
                      >
                        {GOOGLE_FONTS_OPTIONS.map((f) => (
                          <option key={f.name} value={f.name}>{f.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold text-purple-950 mb-1">Taille de Police</label>
                    <select
                      value={storeHeroTitleSize}
                      onChange={(e) => setStoreHeroTitleSize(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-purple-300 rounded-lg text-xs font-bold"
                    >
                      <option value="32px">Moyenne (32px)</option>
                      <option value="48px">Grande (48px)</option>
                      <option value="64px">Géante (64px)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-purple-950 mb-1">Couleur du Titre</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={storeHeroTitleColor}
                        onChange={(e) => setStoreHeroTitleColor(e.target.value)}
                        className="w-9 h-9 p-0.5 rounded cursor-pointer border border-slate-300"
                      />
                      <div className="flex items-center gap-1">
                        {PRESET_COLORS.map((c) => (
                          <button
                            key={c.value}
                            type="button"
                            onClick={() => setStoreHeroTitleColor(c.value)}
                            style={{ backgroundColor: c.value }}
                            className="w-5 h-5 rounded-full border border-slate-400"
                            title={c.label}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: ACCENT NEON */}
            {activeTab === 'accent' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-purple-950 mb-1">
                    Texte Accentué (Fin de Titre)
                  </label>
                  <input
                    type="text"
                    value={storeHeroTitleAccent}
                    onChange={(e) => setStoreHeroTitleAccent(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-purple-300 rounded-lg text-xs font-extrabold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Haute Performance"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {!storeHeroFontGlobal && (
                    <div>
                      <label className="block text-[11px] font-bold text-purple-950 mb-1">Police du Mot Accentué</label>
                      <select
                        value={storeHeroAccentFont}
                        onChange={(e) => setStoreHeroAccentFont(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-purple-300 rounded-lg text-xs font-bold"
                      >
                        {GOOGLE_FONTS_OPTIONS.map((f) => (
                          <option key={f.name} value={f.name}>{f.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold text-purple-950 mb-1">Couleur Neon d Accent</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={storeHeroAccentColor}
                        onChange={(e) => setStoreHeroAccentColor(e.target.value)}
                        className="w-9 h-9 p-0.5 rounded cursor-pointer border border-slate-300"
                      />
                      <div className="flex items-center gap-1">
                        {PRESET_COLORS.map((c) => (
                          <button
                            key={c.value}
                            type="button"
                            onClick={() => setStoreHeroAccentColor(c.value)}
                            style={{ backgroundColor: c.value }}
                            className="w-5 h-5 rounded-full border border-slate-400"
                            title={c.label}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: SOUS-TITRE / DESCRIPTION */}
            {activeTab === 'subtitle' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-purple-950 mb-1">
                    Texte du Sous-titre / Description *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={storeHeroSubtitle}
                    onChange={(e) => setStoreHeroSubtitle(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-purple-300 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Automatisez votre organisation, suivez vos finances..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {!storeHeroFontGlobal && (
                    <div>
                      <label className="block text-[11px] font-bold text-purple-950 mb-1">Police du Sous-titre</label>
                      <select
                        value={storeHeroSubtitleFont}
                        onChange={(e) => setStoreHeroSubtitleFont(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-purple-300 rounded-lg text-xs font-bold"
                      >
                        {GOOGLE_FONTS_OPTIONS.map((f) => (
                          <option key={f.name} value={f.name}>{f.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold text-purple-950 mb-1">Taille du Sous-titre</label>
                    <select
                      value={storeHeroSubtitleSize}
                      onChange={(e) => setStoreHeroSubtitleSize(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-purple-300 rounded-lg text-xs font-bold"
                    >
                      <option value="14px">Discret (14px)</option>
                      <option value="16px">Standard (16px)</option>
                      <option value="20px">Grand (20px)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-purple-950 mb-1">Couleur du Sous-titre</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={storeHeroSubtitleColor}
                        onChange={(e) => setStoreHeroSubtitleColor(e.target.value)}
                        className="w-9 h-9 p-0.5 rounded cursor-pointer border border-slate-300"
                      />
                      <div className="flex items-center gap-1">
                        {PRESET_COLORS.map((c) => (
                          <button
                            key={c.value}
                            type="button"
                            onClick={() => setStoreHeroSubtitleColor(c.value)}
                            style={{ backgroundColor: c.value }}
                            className="w-5 h-5 rounded-full border border-slate-400"
                            title={c.label}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* PREVIEW INTERACTIF EN DIRECT - CLIQUER SUR UN ÉLÉMENT LE SÉLECTIONNE */}
          <div
            className={`p-6 bg-[#050811] text-white rounded-2xl border border-slate-800 space-y-4 shadow-xl ${
              storeHeroAlign === 'left' ? 'text-left' : storeHeroAlign === 'right' ? 'text-right' : 'text-center'
            }`}
          >
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block">
              Aperçu interactif (Cliquez sur un texte ci-dessous pour le personnaliser)
            </span>

            {/* BADGE PREVIEW */}
            {storeHeroBadge && (
              <div
                onClick={() => setActiveTab('badge')}
                style={{
                  fontFamily: `'${storeHeroFontGlobal ? storeHeroFontFamily : storeHeroBadgeFont}', sans-serif`,
                  fontSize: storeHeroBadgeSize,
                  color: storeHeroBadgeColor,
                  borderColor: `${storeHeroBadgeColor}40`,
                  backgroundColor: `${storeHeroBadgeColor}15`,
                }}
                className={`inline-block px-3.5 py-1 rounded text-xs font-black uppercase tracking-wider border cursor-pointer hover:ring-2 hover:ring-white transition-all ${
                  activeTab === 'badge' ? 'ring-2 ring-purple-400' : ''
                }`}
              >
                {storeHeroBadge}
              </div>
            )}

            {/* TITLE & ACCENT PREVIEW */}
            <h3
              onClick={() => setActiveTab('title')}
              className="font-black tracking-tight leading-tight cursor-pointer hover:opacity-90 transition-all"
            >
              <span
                style={{
                  fontFamily: `'${storeHeroFontGlobal ? storeHeroFontFamily : storeHeroTitleFont}', sans-serif`,
                  fontSize: storeHeroTitleSize,
                  color: storeHeroTitleColor,
                }}
                className={activeTab === 'title' ? 'underline decoration-purple-400 underline-offset-4' : ''}
              >
                {storeHeroTitle}{' '}
              </span>
              {storeHeroTitleAccent && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTab('accent');
                  }}
                  style={{
                    fontFamily: `'${storeHeroFontGlobal ? storeHeroFontFamily : storeHeroAccentFont}', sans-serif`,
                    fontSize: storeHeroTitleSize,
                    color: storeHeroAccentColor,
                  }}
                  className={`hover:opacity-90 transition-all ${
                    activeTab === 'accent' ? 'underline decoration-[#a3e635] underline-offset-4' : ''
                  }`}
                >
                  {storeHeroTitleAccent}
                </span>
              )}
            </h3>

            {/* SUBTITLE PREVIEW */}
            {storeHeroSubtitle && (
              <p
                onClick={() => setActiveTab('subtitle')}
                style={{
                  fontFamily: `'${storeHeroFontGlobal ? storeHeroFontFamily : storeHeroSubtitleFont}', sans-serif`,
                  fontSize: storeHeroSubtitleSize,
                  color: storeHeroSubtitleColor,
                }}
                className={`max-w-2xl line-clamp-2 leading-relaxed cursor-pointer hover:opacity-90 transition-all ${
                  storeHeroAlign === 'left' ? 'mr-auto' : storeHeroAlign === 'right' ? 'ml-auto' : 'mx-auto'
                } ${activeTab === 'subtitle' ? 'ring-1 ring-purple-400 p-1 rounded' : ''}`}
              >
                {storeHeroSubtitle}
              </p>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={savingHero}
              variant="primary"
              size="md"
              className="bg-purple-700 hover:bg-purple-800 text-white font-extrabold shadow-sm gap-2 px-8 py-3"
            >
              <Save className="w-4 h-4" />
              <span>{savingHero ? 'Sauvegarde...' : 'Enregistrer l entête de la boutique'}</span>
            </Button>
          </div>

        </form>
      </Card>

    </div>
  );
}
