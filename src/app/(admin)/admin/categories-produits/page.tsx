'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Tag, Edit, Save, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

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

  useEffect(() => {
    fetchCategories();
  }, []);

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

  return (
    <div className="space-y-6 w-full">
      
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Tag className="w-6 h-6 text-purple-600" />
          <span>Catégories de Produits Digitaux</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Gérez, renommez et éditez vos catégories de produits (Ressources Gratuites, Templates Notion, Dashboards Excel, etc.).
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl font-bold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full">
        
        {/* ADD PRODUCT CATEGORY FORM */}
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

        {/* CATEGORIES TABLE WITH EDIT CONTROLS */}
        <div className="md:col-span-8">
          <Card className="bg-white overflow-hidden shadow-sm border border-slate-200 w-full">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Catégorie</th>
                    <th className="p-4">Slug URL</th>
                    <th className="p-4">Produits</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-500">Chargement des catégories...</td>
                    </tr>
                  ) : categories.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-500">Aucune catégorie de produit pour le moment.</td>
                    </tr>
                  ) : (
                    categories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-slate-50 transition-colors">
                        <td colSpan={editingId === cat.id ? 4 : 1} className="p-4">
                          {editingId === cat.id ? (
                            /* INLINE EDIT FORM */
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
                              {cat.slug === 'ressources' ? '/ressources' : `/boutique/${cat.slug}`}
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

    </div>
  );
}
