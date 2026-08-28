'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { MarkdownImporter } from '@/components/admin/MarkdownImporter';

export default function EditArticleAdminPage() {
  const router = useRouter();
  const params = useParams();
  const articleId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<any[]>([]);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState('PUBLISHED');
  const [readingTime, setReadingTime] = useState(5);

  useEffect(() => {
    // Load categories
    fetch('/api/admin/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories);
      });

    // Load article details
    fetch(`/api/admin/articles/${articleId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.article) {
          const art = data.article;
          setTitle(art.title);
          setSlug(art.slug);
          setExcerpt(art.excerpt || '');
          setContent(art.content || '');
          setCoverImage(art.coverImage || '');
          setCategoryId(art.categoryId || '');
          setStatus(art.status || 'PUBLISHED');
          setReadingTime(art.readingTime || 5);
        } else {
          setError('Article non trouvé.');
        }
      })
      .catch(() => setError('Erreur de chargement de l article.'))
      .finally(() => setLoading(false));
  }, [articleId]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    const generatedSlug = val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    setSlug(generatedSlug);
  };

  const handleMarkdownImport = (imported: { title?: string; excerpt?: string; content: string }) => {
    if (imported.title) {
      handleTitleChange(imported.title);
    }
    if (imported.excerpt) {
      setExcerpt(imported.excerpt);
    }
    if (imported.content) {
      setContent(imported.content);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await fetch(`/api/admin/articles/${articleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          excerpt,
          content,
          coverImage,
          categoryId: categoryId || null,
          status,
          readingTime: Number(readingTime),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur de mise à jour.');

      router.push('/admin/articles');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ? Cette action est irréversible.')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/articles/${articleId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erreur lors de la suppression.');

      router.push('/admin/articles');
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-medium">Chargement de l article...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      <div className="flex items-center justify-between">
        <Link href="/admin/articles" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" />
          <span>Retour aux articles</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link href={`/blog/${slug}`} target="_blank">
            <Button variant="outline" size="sm" className="gap-1.5 font-semibold">
              <Eye className="w-4 h-4" />
              <span>Voir sur le site</span>
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={handleDelete} className="text-red-600 hover:bg-red-50 gap-1.5 font-bold">
            <Trash2 className="w-4 h-4" />
            <span>Supprimer</span>
          </Button>
        </div>
      </div>

      <h1 className="text-2xl font-bold text-slate-900">Modifier l article</h1>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
          {error}
        </div>
      )}

      {/* MARKDOWN IMPORT BAR */}
      <Card className="p-4 bg-purple-50/50 border border-purple-200">
        <MarkdownImporter onImport={handleMarkdownImport} />
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        <Card className="p-6 bg-white space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Titre de l article *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-base font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Slug URL *</label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Catégorie</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">-- Choisir une catégorie --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Statut</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="PUBLISHED">Publié</option>
                <option value="DRAFT">Brouillon</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Temps de lecture (minutes)</label>
              <input
                type="number"
                value={readingTime}
                onChange={(e) => setReadingTime(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Extrait / Résumé</label>
            <textarea
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">URL Image de couverture</label>
            <input
              type="text"
              placeholder="https://images.unsplash.com/..."
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </Card>

        {/* RICH TEXT EDITOR */}
        <Card className="p-6 bg-white space-y-3">
          <label className="block text-xs font-semibold text-slate-700">Contenu rédigé de l article *</label>
          <RichTextEditor
            value={content}
            onChange={(newContent) => setContent(newContent)}
          />
        </Card>

        <Button
          type="submit"
          disabled={saving}
          variant="primary"
          size="lg"
          className="w-full font-bold gap-2 shadow-md bg-purple-700 hover:bg-purple-800 text-white"
        >
          <Save className="w-5 h-5" />
          <span>{saving ? 'Enregistrement en cours...' : 'Enregistrer les modifications'}</span>
        </Button>

      </form>

    </div>
  );
}
