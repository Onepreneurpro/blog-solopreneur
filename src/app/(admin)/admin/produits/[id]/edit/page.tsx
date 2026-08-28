'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Trash2, Eye, Link as LinkIcon, Upload, CheckCircle2, Tag, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PRODUCT_FORMAT_OPTIONS } from '@/lib/product-formats';

export default function EditProductAdminPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [leadLists, setLeadLists] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [price, setPrice] = useState(29);
  const [compareAtPrice, setCompareAtPrice] = useState<number | undefined>(49);
  const [shortDescription, setShortDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [productCategoryId, setProductCategoryId] = useState('');
  const [fileType, setFileType] = useState('ZIP');
  const [isFreeResource, setIsFreeResource] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [status, setStatus] = useState('PUBLISHED');

  const [targetListId, setTargetListId] = useState('');
  const [welcomeStepId, setWelcomeStepId] = useState('');

  // Delivery options: 'LINK' (Option 1) vs 'FILE' (Option 2)
  const [deliveryOption, setDeliveryOption] = useState<'LINK' | 'FILE'>('LINK');
  const [externalLink, setExternalLink] = useState('');
  const [uploadedFileUrl, setUploadedFileUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // Load product categories
    fetch('/api/admin/categories-produits')
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories);
      });

    fetch('/api/admin/lead-lists')
      .then((res) => res.json())
      .then((data) => {
        if (data.lists) setLeadLists(data.lists);
      })
      .catch(() => {});

    fetch('/api/admin/campaigns')
      .then((res) => res.json())
      .then((data) => {
        if (data.campaigns) setCampaigns(data.campaigns);
      })
      .catch(() => {});

    // Load product
    fetch(`/api/admin/produits/${productId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.product) {
          const p = data.product;
          setName(p.name);
          setSlug(p.slug);
          setPrice(p.price);
          setCompareAtPrice(p.compareAtPrice || undefined);
          setShortDescription(p.shortDescription || '');
          setLongDescription(p.longDescription || '');
          setCoverImage(p.coverImage || '');
          setProductCategoryId(p.productCategoryId || '');
          setFileType(p.fileType || 'ZIP');
          setIsFreeResource(p.isFreeResource);
          setIsFeatured(p.isFeatured);
          setStatus(p.status || 'PUBLISHED');
          setTargetListId(p.targetListId || '');
          setWelcomeStepId(p.welcomeStepId || '');

          if (p.fileUrl?.startsWith('http://') || p.fileUrl?.startsWith('https://')) {
            setDeliveryOption('LINK');
            setExternalLink(p.fileUrl);
          } else if (p.fileUrl) {
            setDeliveryOption('FILE');
            setUploadedFileUrl(p.fileUrl);
          }
        } else {
          setError('Produit introuvable.');
        }
      })
      .catch(() => setError('Erreur de chargement.'))
      .finally(() => setLoading(false));
  }, [productId]);

  const handleCategoryChange = (catId: string) => {
    setProductCategoryId(catId);
    const selectedCat = categories.find((c) => c.id === catId);
    if (selectedCat) {
      const slug = selectedCat.slug.toLowerCase();
      if (slug.includes('notion')) setFileType('TEMPLATE NOTION');
      else if (slug.includes('sio')) setFileType('TEMPLATESIO');
      else if (slug.includes('excel')) setFileType('EXCEL');
      else if (slug.includes('outils') || slug.includes('gestion')) setFileType('WEB APP');
      else if (slug.includes('ressources') || slug.includes('guide')) setFileType('PDF');
    }
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

  const availableSequenceSteps: { id: string; label: string }[] = [];
  campaigns.forEach((camp) => {
    if (camp.sequences) {
      camp.sequences.forEach((step: any) => {
        if (step.stepOrder === 1 || step.triggerType === 'IMMEDIATE') {
          availableSequenceSteps.push({
            id: step.id,
            label: `[${camp.name}] Étape 1 - ${step.subject}`,
          });
          if (step.variants) {
            step.variants.forEach((v: any) => {
              availableSequenceSteps.push({
                id: v.id,
                label: `[${camp.name}] (Sous-email) ${v.subject}`,
              });
            });
          }
        }
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const finalFileUrl = deliveryOption === 'LINK' ? externalLink : uploadedFileUrl;

    try {
      const res = await fetch(`/api/admin/produits/${productId}`, {
        method: 'PUT',
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
          fileType,
          fileUrl: finalFileUrl,
          isFreeResource,
          isFeatured,
          status,
          targetListId: targetListId || null,
          welcomeStepId: welcomeStepId || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur de mise à jour.');

      router.push('/admin/produits');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer définitivement ce produit ?')) return;

    try {
      const res = await fetch(`/api/admin/produits/${productId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erreur de suppression.');

      router.push('/admin/produits');
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500 font-bold">
        Chargement de la fiche produit...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      <div className="flex items-center justify-between">
        <Link href="/admin/produits" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" />
          <span>Retour aux produits</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href={`/checkout?productId=${productId}`} target="_blank">
            <Button variant="outline" size="sm" className="gap-1 text-xs font-bold text-slate-700">
              <Eye className="w-3.5 h-3.5" />
              <span>Aperçu Client</span>
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={handleDelete} className="text-red-600 hover:bg-red-50">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <h1 className="text-2xl font-extrabold text-slate-900">Modifier le Produit</h1>

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
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-base font-bold text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                <span>Catégorie du Produit *</span>
              </label>
              <select
                value={productCategoryId}
                onChange={(e) => handleCategoryChange(e.target.value)}
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

            {/* SELECTION FORMAT DU PRODUIT */}
            <div>
              <label className="block text-xs font-bold text-purple-950 mb-1 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-purple-600" />
                <span>Format / Type *</span>
              </label>
              <select
                value={fileType}
                onChange={(e) => setFileType(e.target.value)}
                className="w-full px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg text-xs font-extrabold text-purple-950 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                {PRODUCT_FORMAT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label} ({opt.value})
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Prix barré (€)</label>
              <input
                type="number"
                step="0.01"
                value={compareAtPrice || ''}
                onChange={(e) => setCompareAtPrice(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-400 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>
          </div>
        </Card>

        {/* COMPORTEMENT LIVRAISON DU PRODUIT */}
        <Card className="p-6 bg-white space-y-4 border border-slate-200 shadow-sm">
          <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
            Mode de Livraison du Produit Digital
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setDeliveryOption('LINK')}
              className={`p-4 rounded-xl border-2 text-left space-y-1 transition-all ${
                deliveryOption === 'LINK'
                  ? 'border-purple-600 bg-purple-50/50 text-purple-950'
                  : 'border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                <LinkIcon className="w-4 h-4 text-purple-600" />
                <span>Option 1 : Lien Externe (Notion, Drive...)</span>
              </div>
              <p className="text-xs text-slate-500">
                Redirige l acheteur vers un lien externe ou un modèle Notion dupliquable.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setDeliveryOption('FILE')}
              className={`p-4 rounded-xl border-2 text-left space-y-1 transition-all ${
                deliveryOption === 'FILE'
                  ? 'border-purple-600 bg-purple-50/50 text-purple-950'
                  : 'border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                <Upload className="w-4 h-4 text-purple-600" />
                <span>Option 2 : Fichier Téléchargeable (PDF, ZIP, Excel)</span>
              </div>
              <p className="text-xs text-slate-500">
                L acheteur télécharge directement le fichier hébergé sur la plateforme.
              </p>
            </button>
          </div>

          {deliveryOption === 'LINK' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">URL de la ressource externe *</label>
              <input
                type="url"
                required={deliveryOption === 'LINK'}
                placeholder="https://notion.so/template-dupliquable..."
                value={externalLink}
                onChange={(e) => setExternalLink(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Téléverser le fichier digital *</label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                />
                {uploading && <span className="text-xs text-purple-600 font-bold">Upload en cours...</span>}
              </div>
              {uploadedFileUrl && (
                <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="truncate">{uploadedFileUrl}</span>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* VISUEL & DESCRIPTIONS */}
        <Card className="p-6 bg-white space-y-4 border border-slate-200 shadow-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Image de couverture (URL) *</label>
            <input
              type="text"
              required
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Courte description (Résumé Fiche) *</label>
            <input
              type="text"
              required
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description détaillée (Contenu complet)</label>
            <textarea
              rows={6}
              value={longDescription}
              onChange={(e) => setLongDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFreeResource}
                onChange={(e) => setIsFreeResource(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded"
              />
              <span className="text-xs font-bold text-slate-800">Ressource Offerte (0 € / Opt-in)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded"
              />
              <span className="text-xs font-bold text-slate-800">Mettre en Avant (Coup de Cœur)</span>
            </label>
          </div>
        </Card>

        {/* AUTOMATISATION & MARKETING EMAIL */}
        <Card className="p-6 space-y-4 border-2 border-purple-200 bg-slate-50/50 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 text-purple-900 font-extrabold text-sm sm:text-base border-b border-purple-100 pb-3">
            <Mail className="w-5 h-5 text-purple-600" />
            <span>AUTOMATISATION & MARKETING EMAIL (CRM)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* LISTE EMAIL */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Liste d'emails du {isFreeResource ? 'Lead' : 'Client'} *
              </label>
              <select
                value={targetListId}
                onChange={(e) => setTargetListId(e.target.value)}
                className="w-full h-11 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="">
                  {isFreeResource ? '⚡ Par défaut : Ressources Gratuites' : '⚡ Par défaut : Clients de la Boutique'}
                </option>
                {leadLists.map((list) => (
                  <option key={list.id} value={list.id}>
                    {list.name} {list.sourceType ? `(${list.sourceType})` : ''}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Liste où le contact sera automatiquement enregistré après la commande ou le téléchargement.
              </p>
            </div>

            {/* EMAIL DE BIENVENUE */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email de Bienvenue automatique
              </label>
              <select
                value={welcomeStepId}
                onChange={(e) => setWelcomeStepId(e.target.value)}
                className="w-full h-11 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="">
                  ⚡ Par défaut : Premier email de la séquence de la campagne
                </option>
                {availableSequenceSteps.map((step) => (
                  <option key={step.id} value={step.id}>
                    {step.label}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Email ou sous-email spécifique envoyé immédiatement dès la validation.
              </p>
            </div>
          </div>
        </Card>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 pt-4">
          <Link href="/admin/produits">
            <Button variant="outline" type="button">Annuler</Button>
          </Link>
          <Button
            type="submit"
            disabled={saving}
            variant="primary"
            className="bg-purple-700 hover:bg-purple-800 text-white font-extrabold gap-2 px-6"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Sauvegarde...' : 'Mettre à jour le Produit'}</span>
          </Button>
        </div>

      </form>
    </div>
  );
}
