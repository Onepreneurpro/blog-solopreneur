'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Plus, Trash2, Edit, Save, X, Download, FileText, Upload, CheckCircle2, Eye, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export default function AdminRessourcesPage() {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State for creating a new resource
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  // Inline Edit State for editing an existing resource
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editShortDesc, setEditShortDesc] = useState('');
  const [editLongDesc, setEditLongDesc] = useState('');
  const [editCoverImage, setEditCoverImage] = useState('');
  const [editFileUrl, setEditFileUrl] = useState('');
  const [editUploading, setEditUploading] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchResources = async () => {
    try {
      const res = await fetch('/api/admin/ressources');
      const data = await res.json();
      if (data.resources) setResources(data.resources);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isEdit) setEditUploading(true);
    else setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/medias', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur d upload.');

      if (isEdit) setEditFileUrl(data.media.url);
      else setFileUrl(data.media.url);
    } catch (err: any) {
      alert(err.message);
    } finally {
      if (isEdit) setEditUploading(false);
      else setUploading(false);
    }
  };

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setError('');

    try {
      const res = await fetch('/api/admin/ressources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          slug,
          shortDescription,
          longDescription,
          coverImage,
          fileUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la création.');

      setName('');
      setSlug('');
      setShortDescription('');
      setLongDescription('');
      setCoverImage('');
      setFileUrl('');
      fetchResources();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleStartEdit = (resItem: any) => {
    setEditingId(resItem.id);
    setEditName(resItem.name);
    setEditSlug(resItem.slug);
    setEditShortDesc(resItem.shortDescription || '');
    setEditLongDesc(resItem.longDescription || '');
    setEditCoverImage(resItem.coverImage || '');
    setEditFileUrl(resItem.fileUrl || '');
  };

  const handleSaveEdit = async (id: string) => {
    setSavingEdit(true);
    try {
      const res = await fetch('/api/admin/ressources', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          name: editName,
          slug: editSlug,
          shortDescription: editShortDesc,
          longDescription: editLongDesc,
          coverImage: editCoverImage,
          fileUrl: editFileUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur de mise à jour.');

      setEditingId(null);
      fetchResources();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteResource = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cette ressource gratuite ?')) return;

    try {
      const res = await fetch(`/api/admin/ressources?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erreur lors de la suppression.');
      fetchResources();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-purple-600" />
            <span>Gestion des Ressources & Guides Gratuits</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gérez le contenu et les fichiers téléchargeables offerts sur la page <code className="text-purple-700 font-mono font-bold">/ressources</code>.
          </p>
        </div>

        <Link href="/ressources" target="_blank">
          <Button variant="outline" size="sm" className="gap-1.5 font-semibold border-purple-300 text-purple-800 bg-purple-50 hover:bg-purple-100">
            <Eye className="w-4 h-4 text-purple-600" />
            <span>Voir la page /ressources</span>
          </Button>
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl font-bold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* ADD FREE RESOURCE FORM */}
        <div className="md:col-span-5 space-y-4">
          <Card className="p-6 bg-white border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-purple-600" />
              <span>Ajouter une Ressource Gratuite</span>
            </h3>

            <form onSubmit={handleCreateResource} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Titre de la ressource *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Checklist 10 Étapes Prospection"
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Description courte (Card)</label>
                <input
                  type="text"
                  placeholder="Guide pratique et plan d action étape par étape..."
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Fichier Téléchargeable ou Lien Externe *</label>
                <input
                  type="text"
                  placeholder="https://... ou uploader ci-dessous"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono mb-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

                <input
                  type="file"
                  onChange={(e) => handleFileUpload(e, false)}
                  className="block w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-purple-100 file:text-purple-800 hover:file:bg-purple-200"
                />
                {uploading && <div className="text-xs text-purple-600 font-semibold mt-1">Téléversement du fichier...</div>}
                {fileUrl && (
                  <div className="p-2.5 bg-purple-50 border border-purple-200 rounded-lg text-[11px] text-purple-950 flex items-center gap-1.5 mt-2 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                    <span className="truncate">URL définie : <code className="font-mono">{fileUrl}</code></span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description détaillée (HTML optionnel)</label>
                <textarea
                  rows={3}
                  value={longDescription}
                  onChange={(e) => setLongDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* SOLID VIOLET BUTTON */}
              <Button
                type="submit"
                disabled={adding}
                variant="primary"
                size="md"
                className="w-full font-black bg-purple-700 hover:bg-purple-800 text-white shadow-md border-0"
              >
                <Plus className="w-4 h-4 mr-1 text-white" />
                <span>{adding ? 'Création...' : 'Créer la ressource gratuite'}</span>
              </Button>
            </form>
          </Card>
        </div>

        {/* RESOURCES LIST WITH TAILORED INLINE EDITING */}
        <div className="md:col-span-7">
          <Card className="bg-white overflow-hidden shadow-sm border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Ressource</th>
                    <th className="p-4">Téléchargements</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-slate-500">Chargement des ressources...</td>
                    </tr>
                  ) : resources.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-slate-500">Aucune ressource gratuite disponible.</td>
                    </tr>
                  ) : (
                    resources.map((resItem) => (
                      <tr key={resItem.id} className="hover:bg-slate-50 transition-colors">
                        <td colSpan={editingId === resItem.id ? 3 : 1} className="p-4">
                          {editingId === resItem.id ? (
                            /* INLINE RESOURCE EDIT FORM */
                            <div className="space-y-3 p-4 bg-purple-50/70 rounded-xl border border-purple-200">
                              <div className="flex items-center justify-between border-b border-purple-200 pb-2">
                                <span className="text-xs font-extrabold text-purple-950 flex items-center gap-1.5">
                                  <Edit className="w-3.5 h-3.5 text-purple-700" />
                                  <span>Éditer la Ressource Gratuite</span>
                                </span>
                                <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                                  <X className="w-4 h-4 text-slate-500" />
                                </Button>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-700 mb-1">Titre de la ressource *</label>
                                  <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="w-full px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-lg bg-white"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-700 mb-1">Slug URL *</label>
                                  <input
                                    type="text"
                                    value={editSlug}
                                    onChange={(e) => setEditSlug(e.target.value)}
                                    className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg bg-white"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-slate-700 mb-1">Description courte (Card)</label>
                                <input
                                  type="text"
                                  value={editShortDesc}
                                  onChange={(e) => setEditShortDesc(e.target.value)}
                                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-slate-700 mb-1">Fichier ou Lien Externe *</label>
                                <input
                                  type="text"
                                  value={editFileUrl}
                                  onChange={(e) => setEditFileUrl(e.target.value)}
                                  className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg bg-white mb-2"
                                />
                                <input
                                  type="file"
                                  onChange={(e) => handleFileUpload(e, true)}
                                  className="block w-full text-xs text-slate-500 file:mr-3 file:py-1 file:px-2.5 file:rounded-full file:border-0 file:text-[11px] file:font-semibold file:bg-purple-100 file:text-purple-800"
                                />
                                {editUploading && <div className="text-[11px] text-purple-600 font-semibold mt-1">Téléversement...</div>}
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-slate-700 mb-1">Description détaillée (HTML)</label>
                                <textarea
                                  rows={3}
                                  value={editLongDesc}
                                  onChange={(e) => setEditLongDesc(e.target.value)}
                                  className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg bg-white"
                                />
                              </div>

                              <div className="flex justify-end gap-2 pt-2 border-t border-purple-200/60">
                                <Button variant="outline" size="sm" onClick={() => setEditingId(null)}>
                                  Annuler
                                </Button>
                                {/* SOLID VIOLET BUTTON */}
                                <Button
                                  variant="primary"
                                  size="sm"
                                  disabled={savingEdit}
                                  onClick={() => handleSaveEdit(resItem.id)}
                                  className="bg-purple-700 hover:bg-purple-800 text-white font-extrabold border-0 shadow-md"
                                >
                                  <Save className="w-3.5 h-3.5 mr-1" />
                                  <span>{savingEdit ? 'Sauvegarde...' : 'Enregistrer la ressource'}</span>
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="font-extrabold text-slate-900 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-purple-600 flex-shrink-0" />
                                <span>{resItem.name}</span>
                              </div>
                              {resItem.shortDescription && (
                                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{resItem.shortDescription}</p>
                              )}
                              <div className="mt-1">
                                <span className="text-[10px] font-mono text-slate-400">/boutique/{resItem.slug}</span>
                              </div>
                            </div>
                          )}
                        </td>

                        {editingId !== resItem.id && (
                          <>
                            <td className="p-4">
                              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-300 text-amber-950 border border-amber-400 inline-flex items-center gap-1">
                                <Download className="w-3 h-3 text-amber-950" />
                                {resItem.downloadsCount || 0}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStartEdit(resItem)}
                                  className="px-2.5 py-1 text-xs font-bold text-purple-900 border-purple-200 bg-purple-50 hover:bg-purple-100 gap-1"
                                  title="Éditer cette ressource gratuite"
                                >
                                  <Edit className="w-3.5 h-3.5 text-purple-700" />
                                  <span>Éditer</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteResource(resItem.id)}
                                  className="text-red-500 hover:bg-red-50"
                                  title="Supprimer la ressource"
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
