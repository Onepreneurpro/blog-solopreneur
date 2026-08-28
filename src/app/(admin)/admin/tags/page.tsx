'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Tag as TagIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export default function AdminTagsPage() {
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchTags = () => {
    fetch('/api/admin/tags')
      .then((res) => res.json())
      .then((data) => {
        if (data.tags) setTags(data.tags);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTags();
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

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const res = await fetch('/api/admin/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug }),
      });

      if (!res.ok) throw new Error('Erreur de création du tag.');

      setName('');
      setSlug('');
      setShowModal(false);
      fetchTags();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteTag = async (id: string) => {
    if (!confirm('Supprimer ce tag ?')) return;

    try {
      const res = await fetch(`/api/admin/tags?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erreur de suppression.');
      fetchTags();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Gestion des Tags & Mots-Clés</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Organisez vos articles de blog par étiquettes et mots-clés de recherche.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowModal(true)} className="gap-1.5 font-bold">
          <Plus className="w-4 h-4" />
          <span>Nouveau Tag</span>
        </Button>
      </div>

      {/* CREATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="p-6 bg-white max-w-md w-full space-y-4 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900">Ajouter un tag</h2>
            <form onSubmit={handleCreateTag} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nom du Tag *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Notion, TJM, Solopreneur"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Slug URL *</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowModal(false)}>
                  Annuler
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={creating} className="font-bold">
                  {creating ? 'Création...' : 'Créer'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* TAGS TABLE */}
      <Card className="bg-white overflow-hidden shadow-sm border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="p-4">Nom</th>
                <th className="p-4">Slug</th>
                <th className="p-4">Articles liés</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">Chargement...</td>
                </tr>
              ) : tags.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">Aucun tag enregistré pour le moment.</td>
                </tr>
              ) : (
                tags.map((tg) => (
                  <tr key={tg.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-slate-900 flex items-center gap-2">
                      <TagIcon className="w-4 h-4 text-purple-600" />
                      <span>#{tg.name}</span>
                    </td>
                    <td className="p-4 text-xs font-mono text-slate-500">/{tg.slug}</td>
                    <td className="p-4">
                      <Badge variant="indigo">
                        {tg._count?.articles || 0} articles
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTag(tg.id)}
                        className="text-red-500 hover:bg-red-50"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
}
