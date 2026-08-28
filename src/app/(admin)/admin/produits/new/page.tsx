'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Link as LinkIcon, Upload, CheckCircle2, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function NewProductAdminPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<any[]>([]);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [price, setPrice] = useState(29);
  const [compareAtPrice, setCompareAtPrice] = useState<number | undefined>(49);
  const [shortDescription, setShortDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [productCategoryId, setProductCategoryId] = useState('');
  const [isFreeResource, setIsFreeResource] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);

  // Delivery options: 'LINK' (Option 1) vs 'FILE' (Option 2)
  const [deliveryOption, setDeliveryOption] = useState<'LINK' | 'FILE'>('LINK');
  const [externalLink, setExternalLink] = useState('');
  const [uploadedFileUrl, setUploadedFileUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch('/api/admin/categories-produits')
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) {
          setCategories(data.categories);
          if (data.categories.length > 0) {
            setProductCategoryId(data.categories[0].id);
          }
        }
      })
      .catch(() => {});
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/medias', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur d upload.');

      setUploadedFileUrl(data.media.url);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const finalFileUrl = deliveryOption === 'LINK' ? externalLink : uploadedFileUrl;

    try {
      const res = await fetch('/api/admin/produits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          slug,
          price: Number(price),
          compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
          shortDescription,
          longDescription,
          coverImage,
          productCategoryId: productCategoryId || null,
          fileUrl: finalFileUrl,
          isFreeResource,
          isFeatured,
          status: 'PUBLISHED',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur de création.');

      router.push('/admin/produits');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      <Link href="/admin/produits" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900">
        <ArrowLeft className="w-4 h-4" />
        <span>Retour aux produits</span>
      </Link>

      <h1 className="text-2xl font-extrabold text-slate-900">Créer un Produit Digital</h1>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl font-bold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* INFORMATIONS PRINCIPALES & CATÉGORIE DU PRODUIT */}
        <Card className="p-6 bg-white space-y-4 border border-slate-200 shadow-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nom du produit digital *</label>
            <input
              type="text"
              required
              placeholder="Ex: Dashboard Excel Trésorerie 2026"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-base font-bold text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Slug URL *</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            {/* SELECTION CATÉGORIE DU PRODUIT */}
            <div>
              <label className="block text-xs font-bold text-purple-950 mb-1 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-purple-600" />
                <span>Catégorie du Produit Digital *</span>
              </label>
              <select
                value={productCategoryId}
                onChange={(e) => setProductCategoryId(e.target.value)}
                className="w-full px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg text-xs font-extrabold text-purple-950 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="">-- Sélectionner une catégorie --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.slug})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Prix (€) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ancien Prix barré (€)</label>
              <input
                type="number"
                step="0.01"
                value={compareAtPrice || ''}
                onChange={(e) => setCompareAtPrice(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isFreeResource}
                onChange={(e) => setIsFreeResource(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span>Ressource 100% Gratuite (0 €)</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
              />
              <span>Mettre en avant (Best-seller)</span>
            </label>
          </div>
        </Card>

        {/* SECURE DELIVERY OPTIONS (OPTION 1 VS OPTION 2) */}
        <Card className="p-6 bg-white space-y-4 border border-slate-200 shadow-sm">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Livraison du Fichier & Sécurisation après Paiement</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Le produit sera disponible au téléchargement ou débloqué <strong>uniquement après validation du paiement</strong>.
            </p>
          </div>

          {/* TOGGLE OPTIONS */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setDeliveryOption('LINK')}
              className={`p-4 rounded-xl border text-left transition-all ${deliveryOption === 'LINK' ? 'border-purple-600 bg-purple-50/60 ring-2 ring-purple-500/20' : 'border-slate-200 hover:border-slate-300'}`}
            >
              <div className="flex items-center gap-2 font-bold text-xs text-purple-900 mb-1">
                <LinkIcon className="w-4 h-4 text-purple-600" />
                <span>Option 1 : Lien Externe Sécurisé</span>
              </div>
              <p className="text-[11px] text-slate-500">Lien Notion, Google Drive ou Dropbox protégé par jeton post-achat.</p>
            </button>

            <button
              type="button"
              onClick={() => setDeliveryOption('FILE')}
              className={`p-4 rounded-xl border text-left transition-all ${deliveryOption === 'FILE' ? 'border-purple-600 bg-purple-50/60 ring-2 ring-purple-500/20' : 'border-slate-200 hover:border-slate-300'}`}
            >
              <div className="flex items-center gap-2 font-bold text-xs text-purple-900 mb-1">
                <Upload className="w-4 h-4 text-purple-600" />
                <span>Option 2 : Uploader le Fichier sur le Site</span>
              </div>
              <p className="text-[11px] text-slate-500">Hébergement direct du fichier (Excel, PDF, Zip) sur le serveur.</p>
            </button>
          </div>

          {/* OPTION 1 CONTENT */}
          {deliveryOption === 'LINK' && (
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">URL du produit / Lien Notion *</label>
              <input
                type="url"
                placeholder="https://notion.so/workspace-duplication-link..."
                value={externalLink}
                onChange={(e) => setExternalLink(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>
          )}

          {/* OPTION 2 CONTENT */}
          {deliveryOption === 'FILE' && (
            <div className="pt-2 space-y-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Uploader le Fichier (.xlsx, .pdf, .zip) *</label>
              <input
                type="file"
                onChange={handleFileUpload}
                className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
              />
              {uploading && <div className="text-xs text-purple-600 font-semibold">Téléversement du fichier...</div>}
              {uploadedFileUrl && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Fichier téléversé : <code className="font-mono">{uploadedFileUrl}</code></span>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* DESCRIPTIONS & COVER IMAGE */}
        <Card className="p-6 bg-white space-y-4 border border-slate-200 shadow-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description courte</label>
            <input
              type="text"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description détaillée (HTML)</label>
            <textarea
              rows={5}
              value={longDescription}
              onChange={(e) => setLongDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">URL Image de présentation</label>
            <input
              type="text"
              placeholder="https://images.unsplash.com/..."
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
            />
          </div>
        </Card>

        <Button
          type="submit"
          disabled={saving}
          variant="primary"
          size="lg"
          className="w-full font-extrabold gap-2 shadow-md btn-purple"
        >
          <Save className="w-5 h-5" />
          <span>{saving ? 'Création en cours...' : 'Créer le produit digital'}</span>
        </Button>

      </form>

    </div>
  );
}
