'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, FileText, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RichTextEditor } from '@/components/editor/RichTextEditor';

export default function EditPageAdmin() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [menus, setMenus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [targetMenu, setTargetMenu] = useState('NONE');
  const [status, setStatus] = useState('PUBLISHED');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  useEffect(() => {
    // 1. Fetch available dynamic menus (HEADER, FOOTER_1, FOOTER_2, FOOTER_3)
    fetch('/api/admin/menus')
      .then((res) => res.json())
      .then((data) => {
        if (data.menus) setMenus(data.menus);
      })
      .catch(() => {});

    // 2. Fetch target page data
    fetch('/api/admin/pages')
      .then((res) => res.json())
      .then((data) => {
        if (data.pages) {
          const found = data.pages.find((p: any) => p.id === id);
          if (found) {
            setTitle(found.title || '');
            setSlug(found.slug || '');
            setContent(found.content || '');
            setCoverImage(found.coverImage || '');
            setTargetMenu(found.targetMenu || 'NONE');
            setStatus(found.status || 'PUBLISHED');
            setSeoTitle(found.seoTitle || '');
            setSeoDescription(found.seoDescription || '');
          }
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/admin/pages/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          title,
          slug,
          content,
          coverImage,
          targetMenu,
          status,
          seoTitle,
          seoDescription,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la mise à jour.');
      }

      router.push('/admin/pages');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-500 font-medium">Chargement de la page...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      <div className="flex items-center justify-between">
        <Link href="/admin/pages" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" />
          <span>Retour aux pages statiques</span>
        </Link>
        <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-600" />
          <span>Modifier la Page: {title}</span>
        </h1>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl font-bold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* MAIN CONTENT EDIT */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="p-6 bg-white space-y-5 border border-slate-200 shadow-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Titre de la page *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Slug URL *</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Éditeur de Contenu de la Page (Mise en forme, Liens, Médias, Vidéos, Tableaux, CTA) *
              </label>
              <RichTextEditor value={content} onChange={setContent} />
            </div>
          </Card>

          {/* SEO BOX */}
          <Card className="p-6 bg-white space-y-4 border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Référencement SEO</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Titre SEO (Meta Title)</label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Meta Description</label>
              <textarea
                rows={2}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </Card>
        </div>

        {/* SIDEBAR: OPTIONS & DYNAMIC MENU SELECTOR */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6 bg-white space-y-5 border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Menu className="w-4 h-4 text-purple-600" />
              <span>Publication & Emplacement Menu</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Statut de publication</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="PUBLISHED">Publié (En ligne)</option>
                <option value="DRAFT">Brouillon</option>
                <option value="ARCHIVED">Archivé</option>
              </select>
            </div>

            {/* DYNAMIC MENU DESTINATION SELECTOR INCLUDING FOOTER_1, FOOTER_2, FOOTER_3 */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Menu className="w-4 h-4 text-purple-600" />
                <span>Menu de Destination *</span>
              </label>
              <p className="text-[11px] text-slate-500 mb-1.5">
                Sélectionnez dans quel menu du site cette page sera automatiquement ajoutée.
              </p>
              <select
                value={targetMenu}
                onChange={(e) => setTargetMenu(e.target.value)}
                className="w-full px-3 py-2.5 bg-purple-50 border border-purple-200 rounded-xl text-xs font-extrabold text-purple-950 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="NONE">Aucun (Page autonome sans menu)</option>
                {menus
                  .filter((m) => !['FOOTER', 'RESSOURCES'].includes(m.location))
                  .map((m) => (
                    <option key={m.id} value={m.location}>
                      {m.title}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">URL Image de Couverture</label>
              <input
                type="text"
                placeholder="https://images.unsplash.com/..."
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <Button
              type="submit"
              disabled={saving}
              variant="primary"
              size="md"
              className="w-full font-extrabold gap-2 mt-4 shadow-md btn-purple"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Sauvegarde...' : 'Sauvegarder les modifications'}</span>
            </Button>
          </Card>
        </div>

      </form>

    </div>
  );
}
