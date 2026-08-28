'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Tag, Edit, Save, X, ArrowUp, ArrowDown, LayoutTemplate, CheckCircle2, Type, AlignLeft, AlignCenter, AlignRight, Sliders, Eye, Palette } from 'lucide-react';
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

  // Store Hero Settings state
  const [storeHeroBadge, setStoreHeroBadge] = useState('BOUTIQUE PRO POUR SOLOPRENEURS & FREELANCES');
  const [storeHeroTitle, setStoreHeroTitle] = useState('Templates Notion & Dashboards Excel');
  const [storeHeroTitleAccent, setStoreHeroTitleAccent] = useState('Haute Performance');
  const [storeHeroSubtitle, setStoreHeroSubtitle] = useState('Automatisez votre organisation, suivez vos finances et développez votre activité d indépendant avec des systèmes testés et prêts à l emploi.');
  const [storeHeroFontFamily, setStoreHeroFontFamily] = useState('Plus Jakarta Sans');
  const [storeHeroTitleSize, setStoreHeroTitleSize] = useState('large');
  const [storeHeroSubtitleSize, setStoreHeroSubtitleSize] = useState('normal');
  const [storeHeroBadgeStyle, setStoreHeroBadgeStyle] = useState('green');
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
        if (data.settings.storeHeroBadge) setStoreHeroBadge(data.settings.storeHeroBadge);
        if (data.settings.storeHeroTitle) setStoreHeroTitle(data.settings.storeHeroTitle);
        if (data.settings.storeHeroTitleAccent !== undefined) setStoreHeroTitleAccent(data.settings.storeHeroTitleAccent);
        if (data.settings.storeHeroSubtitle) setStoreHeroSubtitle(data.settings.storeHeroSubtitle);
        if (data.settings.storeHeroFontFamily) setStoreHeroFontFamily(data.settings.storeHeroFontFamily);
        if (data.settings.storeHeroTitleSize) setStoreHeroTitleSize(data.settings.storeHeroTitleSize);
        if (data.settings.storeHeroSubtitleSize) setStoreHeroSubtitleSize(data.settings.storeHeroSubtitleSize);
        if (data.settings.storeHeroBadgeStyle) setStoreHeroBadgeStyle(data.settings.storeHeroBadgeStyle);
        if (data.settings.storeHeroAlign) setStoreHeroAlign(data.settings.storeHeroAlign);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchHeroSettings();
  }, []);

  // Dynamically load selected Google Font for preview
  useEffect(() => {
    if (!storeHeroFontFamily) return;
    const fontObj = GOOGLE_FONTS_OPTIONS.find((f) => f.name === storeHeroFontFamily);
    if (fontObj) {
      const linkId = 'google-font-preview-link';
      let link = document.getElementById(linkId) as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }
      link.href = `https://fonts.googleapis.com/css2?family=${fontObj.importName}&display=swap`;
    }
  }, [storeHeroFontFamily]);

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
          storeHeroFontFamily,
          storeHeroTitleSize,
          storeHeroSubtitleSize,
          storeHeroBadgeStyle,
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

      {/* 2. GESTION ET FORMATAGE COMPLET DE TOUS LES ÉLÉMENTS DE L'ENTÊTE DE LA BOUTIQUE */}
      <Card className="p-6 bg-white border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <LayoutTemplate className="w-5 h-5 text-purple-600" />
            <h2 className="text-base font-extrabold text-slate-900">
              Personnalisation & Formatage de l Entête de la Boutique (Tous les textes)
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
          
          {/* SAISIE DES TEXTES (BADGE, TITRE & SOUS-TITRE) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                1. Texte du Badge Kicker (Opt-in) *
              </label>
              <input
                type="text"
                value={storeHeroBadge}
                onChange={(e) => setStoreHeroBadge(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="BOUTIQUE PRO POUR SOLOPRENEURS & FREELANCES"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                2. Titre Principal (Lignes 1 & 2) *
              </label>
              <input
                type="text"
                required
                value={storeHeroTitle}
                onChange={(e) => setStoreHeroTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Templates Notion & Dashboards Excel"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                3. Titre Accentué (Couleur Vert Neon)
              </label>
              <input
                type="text"
                value={storeHeroTitleAccent}
                onChange={(e) => setStoreHeroTitleAccent(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-extrabold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Haute Performance"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              4. Sous-titre / Description de l entête *
            </label>
            <textarea
              rows={2}
              required
              value={storeHeroSubtitle}
              onChange={(e) => setStoreHeroSubtitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Automatisez votre organisation, suivez vos finances..."
            />
          </div>

          {/* SECTION OUTILS DE FORMATAGE POUR CHAQUE ÉLÉMENT */}
          <div className="p-5 bg-purple-50/70 border border-purple-200 rounded-xl space-y-5">
            <div className="flex items-center gap-2 text-xs font-extrabold text-purple-950 border-b border-purple-200 pb-2.5">
              <Sliders className="w-4 h-4 text-purple-700" />
              <span>Outils de Formatage Avancés (Polices Google Fonts, Tailles & Styles pour chaque élément)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              
              {/* 1. POLICE GOOGLE FONTS (TITRE & SOUS-TITRE) */}
              <div>
                <label className="block text-[11px] font-bold text-purple-950 mb-1 flex items-center gap-1">
                  <Type className="w-3.5 h-3.5 text-purple-600" />
                  <span>Police Google Fonts</span>
                </label>
                <select
                  value={storeHeroFontFamily}
                  onChange={(e) => setStoreHeroFontFamily(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-purple-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {GOOGLE_FONTS_OPTIONS.map((f) => (
                    <option key={f.name} value={f.name}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. TAILLE DU TITRE PRINCIPAL */}
              <div>
                <label className="block text-[11px] font-bold text-purple-950 mb-1">
                  Taille du Titre Principal
                </label>
                <select
                  value={storeHeroTitleSize}
                  onChange={(e) => setStoreHeroTitleSize(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-purple-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="normal">Standard (Medium)</option>
                  <option value="large">Grand (Large)</option>
                  <option value="giant">Très Grand (Géant)</option>
                </select>
              </div>

              {/* 3. TAILLE DU SOUS-TITRE */}
              <div>
                <label className="block text-[11px] font-bold text-purple-950 mb-1">
                  Taille du Sous-titre
                </label>
                <select
                  value={storeHeroSubtitleSize}
                  onChange={(e) => setStoreHeroSubtitleSize(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-purple-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="small">Discret (Petit)</option>
                  <option value="normal">Standard (Moyen)</option>
                  <option value="large">Grand (Bien visible)</option>
                </select>
              </div>

              {/* 4. STYLE & COULEUR DU BADGE */}
              <div>
                <label className="block text-[11px] font-bold text-purple-950 mb-1 flex items-center gap-1">
                  <Palette className="w-3.5 h-3.5 text-purple-600" />
                  <span>Style & Style du Badge</span>
                </label>
                <select
                  value={storeHeroBadgeStyle}
                  onChange={(e) => setStoreHeroBadgeStyle(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-purple-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="green">🟢 Vert Neon (Défaut)</option>
                  <option value="purple">🟣 Violet Premium</option>
                  <option value="dark">⚫ Sombre Minimal</option>
                  <option value="hidden">🚫 Masquer le Badge</option>
                </select>
              </div>

            </div>

            {/* ALIGNEMENT GLOBAL DU BLOC */}
            <div className="pt-2">
              <label className="block text-[11px] font-bold text-purple-950 mb-1">
                Alignement Global de l Entête (Titre, Badge & Sous-titre)
              </label>
              <div className="flex items-center gap-2 max-w-md bg-white p-1 rounded-lg border border-purple-300">
                <button
                  type="button"
                  onClick={() => setStoreHeroAlign('left')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded flex items-center justify-center gap-1.5 transition-colors ${
                    storeHeroAlign === 'left' ? 'bg-purple-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <AlignLeft className="w-4 h-4" />
                  <span>Gauche</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStoreHeroAlign('center')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded flex items-center justify-center gap-1.5 transition-colors ${
                    storeHeroAlign === 'center' ? 'bg-purple-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <AlignCenter className="w-4 h-4" />
                  <span>Centré</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStoreHeroAlign('right')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded flex items-center justify-center gap-1.5 transition-colors ${
                    storeHeroAlign === 'right' ? 'bg-purple-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <AlignRight className="w-4 h-4" />
                  <span>Droite</span>
                </button>
              </div>
            </div>

          </div>

          {/* PREVIEW BOX INTERRACTIF AVEC POLICES ET TOUS LES TEXTES */}
          <div
            className={`p-6 bg-[#050811] text-white rounded-xl border border-slate-800 space-y-3 shadow-inner ${
              storeHeroAlign === 'left' ? 'text-left' : storeHeroAlign === 'right' ? 'text-right' : 'text-center'
            }`}
          >
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block">
              Aperçu en direct (Police Google Font : {storeHeroFontFamily})
            </span>

            {/* BADGE PREVIEW */}
            {storeHeroBadgeStyle !== 'hidden' && storeHeroBadge && (
              <div
                style={{ fontFamily: `'${storeHeroFontFamily}', sans-serif` }}
                className={`inline-block px-3 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                  storeHeroBadgeStyle === 'purple'
                    ? 'bg-purple-900/40 text-purple-300 border border-purple-500/50'
                    : storeHeroBadgeStyle === 'dark'
                    ? 'bg-slate-900 text-slate-300 border border-slate-700'
                    : 'bg-[#a3e635]/15 text-[#a3e635] border border-[#a3e635]/30'
                }`}
              >
                {storeHeroBadge}
              </div>
            )}

            {/* TITLE PREVIEW */}
            <h3
              style={{ fontFamily: `'${storeHeroFontFamily}', sans-serif` }}
              className={`font-black tracking-tight text-white leading-tight ${
                storeHeroTitleSize === 'normal'
                  ? 'text-xl sm:text-2xl'
                  : storeHeroTitleSize === 'giant'
                  ? 'text-3xl sm:text-5xl'
                  : 'text-2xl sm:text-4xl'
              }`}
            >
              {storeHeroTitle} {storeHeroTitleAccent && <span className="text-[#a3e635]">{storeHeroTitleAccent}</span>}
            </h3>

            {/* SUBTITLE PREVIEW */}
            {storeHeroSubtitle && (
              <p
                style={{ fontFamily: `'${storeHeroFontFamily}', sans-serif` }}
                className={`text-slate-300 max-w-xl line-clamp-2 leading-relaxed ${
                  storeHeroAlign === 'left' ? 'mr-auto' : storeHeroAlign === 'right' ? 'ml-auto' : 'mx-auto'
                } ${
                  storeHeroSubtitleSize === 'small'
                    ? 'text-[11px]'
                    : storeHeroSubtitleSize === 'large'
                    ? 'text-base font-semibold'
                    : 'text-xs'
                }`}
              >
                {storeHeroSubtitle}
              </p>
            )}
          </div>

          <div className="flex justify-end pt-1">
            <Button
              type="submit"
              disabled={savingHero}
              variant="primary"
              size="md"
              className="bg-purple-700 hover:bg-purple-800 text-white font-extrabold shadow-sm gap-2 px-6"
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
