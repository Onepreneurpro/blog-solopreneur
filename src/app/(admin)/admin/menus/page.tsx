'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Save, X, MoveVertical, CornerDownRight, FileText, Globe, Layers, ArrowUp, ArrowDown, GripVertical, Sparkles, Folder, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardBody } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function AdminMenusPage() {
  const [menus, setMenus] = useState<any[]>([]);
  const [staticPages, setStaticPages] = useState<any[]>([]);
  const [blogCategories, setBlogCategories] = useState<any[]>([]);
  const [productCategories, setProductCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMenuId, setSelectedMenuId] = useState<string>('');

  // Drag & Drop State
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragOverItemId, setDragOverItemId] = useState<string | null>(null);

  // Form state for adding new link
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [selectedParentId, setSelectedParentId] = useState<string>('none');
  const [adding, setAdding] = useState(false);

  // Inline edit state
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editParentId, setEditParentId] = useState<string>('none');
  const [savingEdit, setSavingEdit] = useState(false);

  // Menu Title edit state
  const [editingMenuTitle, setEditingMenuTitle] = useState(false);
  const [menuTitleText, setMenuTitleText] = useState('');
  const [savingMenuTitle, setSavingMenuTitle] = useState(false);

  const handleSaveMenuTitle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMenuId || !menuTitleText.trim()) return;

    setSavingMenuTitle(true);
    try {
      const res = await fetch('/api/admin/menus', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_MENU_TITLE',
          menuId: selectedMenuId,
          menuTitle: menuTitleText.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors du changement de titre.');

      setEditingMenuTitle(false);
      fetchMenusAndPages();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingMenuTitle(false);
    }
  };

  const fetchMenusAndPages = async () => {
    try {
      const [mRes, pRes, bRes, prRes] = await Promise.all([
        fetch('/api/admin/menus'),
        fetch('/api/admin/pages'),
        fetch('/api/admin/categories'),
        fetch('/api/admin/categories-produits'),
      ]);
      const mData = await mRes.json();
      const pData = await pRes.json();
      const bData = await bRes.json();
      const prData = await prRes.json();

      if (mData.menus) {
        setMenus(mData.menus);
        if (mData.menus.length > 0 && !selectedMenuId) {
          setSelectedMenuId(mData.menus[0].id);
        }
      }
      if (pData.pages) setStaticPages(pData.pages);
      if (bData.categories) setBlogCategories(bData.categories);
      if (prData.categories) setProductCategories(prData.categories);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenusAndPages();
  }, []);

  const selectedMenu = menus.find((m) => m.id === selectedMenuId);

  // Handle selecting static page from dropdown
  const handleSelectStaticPage = (pageSlug: string) => {
    if (!pageSlug) return;
    const page = staticPages.find((p) => p.slug === pageSlug);
    if (page) {
      setNewTitle(page.title);
      setNewUrl(`/${page.slug}`);
    }
  };

  // Handle selecting blog category from dropdown
  const handleSelectBlogCategory = (catSlug: string) => {
    if (!catSlug) return;
    const cat = blogCategories.find((c) => c.slug === catSlug);
    if (cat) {
      setNewTitle(cat.name);
      setNewUrl(`/blog/categorie/${cat.slug}`);
    }
  };

  // Handle selecting product category from dropdown
  const handleSelectProductCategory = (catSlug: string) => {
    if (!catSlug) return;
    const cat = productCategories.find((c) => c.slug === catSlug);
    if (cat) {
      setNewTitle(cat.name);
      setNewUrl(`/boutique/categorie/${cat.slug}`);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMenuId || !newTitle || !newUrl) return;

    setAdding(true);
    try {
      const order = selectedMenu ? selectedMenu.items.length + 1 : 0;
      await fetch('/api/admin/menus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          menuId: selectedMenuId,
          title: newTitle,
          url: newUrl,
          parentId: selectedParentId,
          order,
        }),
      });
      setNewTitle('');
      setNewUrl('');
      setSelectedParentId('none');
      fetchMenusAndPages();
    } finally {
      setAdding(false);
    }
  };

  const handleStartEdit = (item: any) => {
    setEditingItemId(item.id);
    setEditTitle(item.title);
    setEditUrl(item.url);
    setEditParentId(item.parentId || 'none');
  };

  const handleSaveEdit = async (id: string) => {
    setSavingEdit(true);
    try {
      const res = await fetch('/api/admin/menus', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          title: editTitle,
          url: editUrl,
          parentId: editParentId,
        }),
      });

      if (!res.ok) throw new Error('Erreur de mise à jour.');

      setEditingItemId(null);
      fetchMenusAndPages();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Supprimer cet élément de menu ?')) return;
    await fetch(`/api/admin/menus?id=${id}`, { method: 'DELETE' });
    fetchMenusAndPages();
  };

  const handleMoveOrder = async (item: any, direction: 'UP' | 'DOWN') => {
    if (!selectedMenu) return;
    const items = [...selectedMenu.items];
    const currentIndex = items.findIndex((i) => i.id === item.id);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'UP' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const targetItem = items[targetIndex];

    try {
      await Promise.all([
        fetch('/api/admin/menus', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: item.id, order: targetItem.order }),
        }),
        fetch('/api/admin/menus', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: targetItem.id, order: item.order }),
        }),
      ]);
      fetchMenusAndPages();
    } catch (err) {
      console.error(err);
    }
  };

  // Drag & Drop Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItemId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (draggedItemId !== id) {
      setDragOverItemId(id);
    }
  };

  const handleDragLeave = () => {
    setDragOverItemId(null);
  };

  const handleDrop = async (e: React.DragEvent, targetItemId: string) => {
    e.preventDefault();
    setDragOverItemId(null);

    if (!draggedItemId || draggedItemId === targetItemId) return;

    try {
      let newParentId = targetItemId;
      const targetItem = selectedMenu?.items.find((i: any) => i.id === targetItemId);
      if (targetItem && targetItem.parentId) {
        newParentId = targetItem.parentId;
      }

      await fetch('/api/admin/menus', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: draggedItemId,
          parentId: newParentId,
        }),
      });

      fetchMenusAndPages();
    } catch (err) {
      console.error('Drag & Drop error:', err);
    } finally {
      setDraggedItemId(null);
    }
  };

  const handleMakeMainLevel = async (itemId: string) => {
    try {
      await fetch('/api/admin/menus', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: itemId,
          parentId: 'none',
        }),
      });
      fetchMenusAndPages();
    } catch (err) {
      console.error(err);
    }
  };

  // Organize items hierarchically for sub-menu rendering
  const getOrganizedItems = (items: any[]) => {
    const parents = items.filter((i) => !i.parentId);
    const childrenMap: { [parentId: string]: any[] } = {};

    items.forEach((i) => {
      if (i.parentId) {
        if (!childrenMap[i.parentId]) childrenMap[i.parentId] = [];
        childrenMap[i.parentId].push(i);
      }
    });

    const result: { item: any; isChild: boolean }[] = [];
    parents.forEach((p) => {
      result.push({ item: p, isChild: false });
      if (childrenMap[p.id]) {
        childrenMap[p.id].forEach((c) => {
          result.push({ item: c, isChild: true });
        });
      }
    });

    items.forEach((i) => {
      if (i.parentId && !result.some((r) => r.item.id === i.id)) {
        result.push({ item: i, isChild: true });
      }
    });

    return result;
  };

  return (
    <div className="space-y-6 max-w-5xl">
      
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <span>Gestion des Menus Dynamiques</span>
          <Badge variant="emerald" className="bg-purple-100 text-purple-900 border-purple-300 font-extrabold">
            Glisser-Déposer Actif
          </Badge>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Glissez et déposez un élément (ex: <code>FAQ</code>) sur une catégorie parente (ex: <code>Templates Notion</code>) pour le placer instantanément en sous-menu déroulant !
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* MENU SELECTOR */}
        <div className="md:col-span-4 space-y-4">
          <Card className="p-5 bg-white border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Sélectionner un menu</h3>
            <div className="space-y-2">
              {menus.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMenuId(m.id)}
                  className={`w-full text-left p-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-between ${
                    selectedMenuId === m.id
                      ? 'bg-purple-700 text-white shadow-md'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <span>{m.title}</span>
                  <Badge variant={selectedMenuId === m.id ? 'slate' : 'outline'} className="text-[10px]">
                    {m.location}
                  </Badge>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* MENU EDITOR */}
        <div className="md:col-span-8 space-y-6">
          {selectedMenu && (
            <Card className="bg-white border border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 pb-4 space-y-3">
                {/* ROW 1: MENU TITLE */}
                <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl tracking-tight leading-none">
                  {selectedMenu.title}
                </h3>

                {/* ROW 2: RENOMMER BUTTON (LEFT) AND ASTUCE BADGE (RIGHT) PERFECTLY ALIGNED IN FLEX CENTER */}
                <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
                  <div>
                    {editingMenuTitle ? (
                      <form onSubmit={handleSaveMenuTitle} className="flex items-center gap-2 flex-wrap">
                        <input
                          type="text"
                          required
                          value={menuTitleText}
                          onChange={(e) => setMenuTitleText(e.target.value)}
                          placeholder="Nom du menu (ex: Apropos)"
                          className="px-3 py-1.5 bg-slate-50 border border-purple-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 w-60"
                        />
                        <Button type="submit" disabled={savingMenuTitle} size="sm" className="btn-purple font-bold text-xs gap-1 py-1.5 px-3">
                          <Save className="w-3.5 h-3.5" />
                          <span>Enregistrer</span>
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => setEditingMenuTitle(false)} className="text-xs py-1.5 px-2">
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </form>
                    ) : (
                      <button
                        onClick={() => {
                          setMenuTitleText(selectedMenu.title);
                          setEditingMenuTitle(true);
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3.5 py-1.5 rounded-xl transition-all shadow-2xs cursor-pointer flex-shrink-0"
                        title="Renommer le titre de ce menu"
                      >
                        <Edit className="w-3.5 h-3.5 text-purple-600" />
                        <span>Renommer</span>
                      </button>
                    )}
                  </div>

                  <div className="inline-flex items-center gap-1.5 text-xs text-purple-700 font-bold bg-purple-50 px-3.5 py-1.5 rounded-full border border-purple-200 shadow-2xs flex-shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                    <span>Astuce : Glissez les éléments pour sous-menus</span>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="space-y-6 pt-4">
                
                {/* ITEMS LIST WITH DRAG & DROP NESTING */}
                <div className="space-y-2.5">
                  {selectedMenu.items.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400">Aucun élément dans ce menu pour le moment.</div>
                  ) : (
                    getOrganizedItems(selectedMenu.items).map(({ item, isChild }) => (
                      <div
                        key={item.id}
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, item.id)}
                        onDragOver={(e) => handleDragOver(e, item.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, item.id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-grab active:cursor-grabbing ${
                          dragOverItemId === item.id
                            ? 'bg-amber-100 border-2 border-amber-500 scale-[1.02] shadow-lg ring-2 ring-amber-400/50'
                            : isChild
                            ? 'ml-6 sm:ml-8 bg-purple-50/80 border-purple-200 hover:border-purple-300'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100/80'
                        }`}
                      >
                        {editingItemId === item.id ? (
                          /* INLINE EDIT FORM */
                          <div className="space-y-3">
                            <div className="flex items-center justify-between border-b pb-2">
                              <span className="text-xs font-bold text-purple-900">Renommer & Modifier l élément</span>
                              <Button variant="ghost" size="sm" onClick={() => setEditingItemId(null)}>
                                <X className="w-4 h-4 text-slate-500" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 mb-1">Intitulé / Nom *</label>
                                <input
                                  type="text"
                                  value={editTitle}
                                  onChange={(e) => setEditTitle(e.target.value)}
                                  className="w-full px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-lg bg-white"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 mb-1">URL cible *</label>
                                <input
                                  type="text"
                                  value={editUrl}
                                  onChange={(e) => setEditUrl(e.target.value)}
                                  className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg bg-white"
                                />
                              </div>
                            </div>

                            {/* SUB-MENU PARENT SELECTOR */}
                            <div>
                              <label className="block text-[10px] font-bold text-purple-900 mb-1">Emplacement Sous-menu (Parent)</label>
                              <select
                                value={editParentId}
                                onChange={(e) => setEditParentId(e.target.value)}
                                className="w-full px-3 py-1.5 text-xs border border-purple-200 rounded-lg bg-white text-purple-950 font-semibold"
                              >
                                <option value="none">Aucun (Élément principal)</option>
                                {selectedMenu.items
                                  .filter((i: any) => i.id !== item.id && !i.parentId)
                                  .map((p: any) => (
                                    <option key={p.id} value={p.id}>
                                      ↳ Placer dans le sous-menu de : {p.title}
                                    </option>
                                  ))}
                              </select>
                            </div>

                            <div className="flex justify-end gap-2 pt-1">
                              <Button variant="outline" size="sm" onClick={() => setEditingItemId(null)}>
                                Annuler
                              </Button>
                              <Button
                                variant="primary"
                                size="sm"
                                disabled={savingEdit}
                                onClick={() => handleSaveEdit(item.id)}
                                className="bg-purple-700 hover:bg-purple-800 text-white font-bold"
                              >
                                <Save className="w-3.5 h-3.5 mr-1" />
                                <span>{savingEdit ? 'Sauvegarde...' : 'Enregistrer'}</span>
                              </Button>
                            </div>
                          </div>
                        ) : (
                          /* ITEM ROW VIEW */
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <GripVertical className="w-4 h-4 text-slate-400 flex-shrink-0 cursor-grab" />
                              
                              {isChild && <CornerDownRight className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />}

                              <div className="min-w-0">
                                <div className="font-extrabold text-xs text-slate-900 truncate flex items-center gap-1.5">
                                  <span>{item.title}</span>
                                  {isChild && <Badge variant="indigo" className="text-[9px] py-0 px-1.5 font-bold">Sous-menu</Badge>}
                                </div>
                                <div className="text-[11px] font-mono text-slate-400 truncate">{item.url}</div>
                              </div>
                            </div>

                            {/* ACTIONS: MOVE UP/DOWN, MAKE MAIN LEVEL, MODIFIER, SUPPRIMER */}
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {isChild && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleMakeMainLevel(item.id)}
                                  className="px-2 py-0.5 text-[10px] font-bold text-slate-600 bg-white hover:bg-slate-100"
                                  title="Extraire du sous-menu (Rendre principal)"
                                >
                                  Sortir du sous-menu
                                </Button>
                              )}

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMoveOrder(item, 'UP')}
                                className="p-1 text-slate-400 hover:text-slate-700"
                                title="Monter"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMoveOrder(item, 'DOWN')}
                                className="p-1 text-slate-400 hover:text-slate-700"
                                title="Descendre"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </Button>

                              {/* MODIFIER BUTTON */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStartEdit(item)}
                                className="px-2.5 py-1 text-xs font-bold text-purple-700 border-purple-200 bg-purple-50 hover:bg-purple-100 gap-1"
                                title="Modifier ou renommer"
                              >
                                <Edit className="w-3.5 h-3.5 text-purple-600" />
                                <span>Modifier</span>
                              </Button>

                              {/* SUPPRIMER BUTTON */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteItem(item.id)}
                                className="p-1.5 text-red-600 hover:bg-red-50"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* ADD NEW ITEM FORM WITH CONTEXTUAL SELECTORS */}
                <form onSubmit={handleAddItem} className="pt-5 border-t border-slate-100 space-y-4">
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Plus className="w-4 h-4 text-purple-600" />
                    <span>Ajouter un lien au menu</span>
                  </h4>

                  {/* 1. FOOTER 1: BLOG CATEGORIES SELECTOR */}
                  {selectedMenu.location === 'FOOTER_1' && (
                    <div className="bg-purple-50/80 p-3.5 rounded-xl border border-purple-200 space-y-1">
                      <label className="block text-xs font-bold text-purple-950 flex items-center gap-1.5">
                        <Folder className="w-4 h-4 text-purple-600" />
                        <span>Prérégler depuis une Catégorie du Blog</span>
                      </label>
                      <select
                        onChange={(e) => handleSelectBlogCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-purple-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">-- Choisir une catégorie du blog --</option>
                        {blogCategories.map((cat) => (
                          <option key={cat.id} value={cat.slug}>
                            📁 {cat.name} (/blog/categorie/{cat.slug})
                          </option>
                        ))}
                      </select>
                      <p className="text-[11px] text-purple-700 font-medium">Sélectionnez une catégorie pour préremplir l intitulé et l URL ci-dessous.</p>
                    </div>
                  )}

                  {/* 2. FOOTER 2: PRODUCT CATEGORIES SELECTOR */}
                  {selectedMenu.location === 'FOOTER_2' && (
                    <div className="bg-purple-50/80 p-3.5 rounded-xl border border-purple-200 space-y-1">
                      <label className="block text-xs font-bold text-purple-950 flex items-center gap-1.5">
                        <ShoppingBag className="w-4 h-4 text-purple-600" />
                        <span>Prérégler depuis une Catégorie de la Boutique</span>
                      </label>
                      <select
                        onChange={(e) => handleSelectProductCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-purple-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">-- Choisir une catégorie boutique --</option>
                        {productCategories.map((cat) => (
                          <option key={cat.id} value={cat.slug}>
                            🛒 {cat.name} (/boutique/categorie/{cat.slug})
                          </option>
                        ))}
                      </select>
                      <p className="text-[11px] text-purple-700 font-medium">Sélectionnez une catégorie pour préremplir l intitulé et l URL ci-dessous.</p>
                    </div>
                  )}

                  {/* 3. FOOTER 3: STATIC PAGES SELECTOR */}
                  {selectedMenu.location === 'FOOTER_3' && (
                    <div className="bg-purple-50/80 p-3.5 rounded-xl border border-purple-200 space-y-1">
                      <label className="block text-xs font-bold text-purple-950 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-purple-600" />
                        <span>Prérégler depuis une Page Statique existante</span>
                      </label>
                      <select
                        onChange={(e) => handleSelectStaticPage(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-purple-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">-- Choisir une page statique créée --</option>
                        {staticPages.map((page) => (
                          <option key={page.id} value={page.slug}>
                            📄 {page.title} (/{page.slug})
                          </option>
                        ))}
                      </select>
                      <p className="text-[11px] text-purple-700 font-medium">Sélectionnez une page pour préremplir l intitulé et l URL ci-dessous.</p>
                    </div>
                  )}

                  {/* 4. HEADER (MENU PRINCIPAL): STATIC PAGES + PRODUCT CATEGORIES + BLOG CATEGORIES */}
                  {selectedMenu.location === 'HEADER' && (
                    <div className="bg-purple-50/80 p-4 rounded-xl border border-purple-200 space-y-3">
                      <div className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-purple-600" />
                        <span>Prérégler depuis un élément existant (Pages, Boutique, Blog)</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-purple-900 mb-1">📄 Pages Statiques</label>
                          <select
                            onChange={(e) => handleSelectStaticPage(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-purple-200 rounded-lg text-xs font-semibold text-slate-800"
                          >
                            <option value="">-- Choisir page --</option>
                            {staticPages.map((page) => (
                              <option key={page.id} value={page.slug}>
                                📄 {page.title}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-purple-900 mb-1">🛒 Catégories Boutique</label>
                          <select
                            onChange={(e) => handleSelectProductCategory(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-purple-200 rounded-lg text-xs font-semibold text-slate-800"
                          >
                            <option value="">-- Choisir boutique --</option>
                            {productCategories.map((cat) => (
                              <option key={cat.id} value={cat.slug}>
                                🛒 {cat.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-purple-900 mb-1">📁 Catégories Blog</label>
                          <select
                            onChange={(e) => handleSelectBlogCategory(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-purple-200 rounded-lg text-xs font-semibold text-slate-800"
                          >
                            <option value="">-- Choisir blog --</option>
                            {blogCategories.map((cat) => (
                              <option key={cat.id} value={cat.slug}>
                                📁 {cat.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* EDITABLE TITLE & URL INPUTS (ALWAYS PRESERVED AND EDITABLE) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Intitulé du lien *</label>
                      <input
                        type="text"
                        required
                        placeholder="Intitulé (ex: CGV, Freelance, Templates)"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">URL cible *</label>
                      <input
                        type="text"
                        required
                        placeholder="URL (ex: /blog/categorie/freelance)"
                        value={newUrl}
                        onChange={(e) => setNewUrl(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  {/* SELECT PARENT FOR SUB-MENU */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Placer en sous-menu de (Optionnel)</label>
                    <select
                      value={selectedParentId}
                      onChange={(e) => setSelectedParentId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="none">Aucun (Élément principal du menu)</option>
                      {selectedMenu.items
                        .filter((i: any) => !i.parentId)
                        .map((p: any) => (
                          <option key={p.id} value={p.id}>
                            ↳ Créer un sous-menu sous : {p.title}
                          </option>
                        ))}
                    </select>
                  </div>

                  <Button type="submit" disabled={adding} variant="primary" size="sm" className="gap-1.5 font-bold bg-purple-700 hover:bg-purple-800 text-white">
                    <Plus className="w-4 h-4" />
                    <span>{adding ? 'Ajout...' : 'Ajouter au menu'}</span>
                  </Button>
                </form>

              </CardBody>
            </Card>
          )}
        </div>

      </div>

    </div>
  );
}
