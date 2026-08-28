'use client';

import React, { useState, useEffect } from 'react';
import { Save, Search, Globe, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function AdminSeoPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [siteName, setSiteName] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [ogImage, setOgImage] = useState('');
  const [twitterHandle, setTwitterHandle] = useState('');
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState('');
  const [robotsTxt, setRobotsTxt] = useState('');

  useEffect(() => {
    fetch('/api/admin/seo')
      .then((res) => res.json())
      .then((data) => {
        if (data.seo) {
          setSiteName(data.seo.siteName || '');
          setMetaTitle(data.seo.metaTitle || '');
          setMetaDescription(data.seo.metaDescription || '');
          setOgImage(data.seo.ogImage || '');
          setTwitterHandle(data.seo.twitterHandle || '');
          setGoogleAnalyticsId(data.seo.googleAnalyticsId || '');
          setRobotsTxt(data.seo.robotsTxt || '');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/admin/seo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteName,
          metaTitle,
          metaDescription,
          ogImage,
          twitterHandle,
          googleAnalyticsId,
          robotsTxt,
        }),
      });

      if (!res.ok) throw new Error('Erreur d enregistrement.');
      setMessage('Configuration SEO enregistrée avec succès !');
    } catch (err: any) {
      setMessage(`Erreur: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-medium">Chargement des paramètres SEO...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Configuration SEO & Référencement</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Gérez le titre global, la meta description, l image OpenGraph et les balises pour les moteurs de recherche.
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-sm font-semibold border ${message.startsWith('Erreur') ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* PREVIEW CARD GOOGLE */}
        <Card className="p-6 bg-white space-y-3 border border-slate-200">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <Search className="w-4 h-4 text-purple-600" />
            <span>Aperçu dans les résultats Google</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="text-xs text-emerald-700 font-medium">https://solopreneur.io</div>
            <div className="text-base font-bold text-blue-700 hover:underline cursor-pointer">
              {metaTitle || 'Titre Meta de votre site'}
            </div>
            <div className="text-xs text-slate-600 line-clamp-2">
              {metaDescription || 'Veuillez saisir une description méta pour votre site web...'}
            </div>
          </div>
        </Card>

        {/* GENERAL METADATA */}
        <Card className="p-6 bg-white space-y-4 border border-slate-200">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            <Globe className="w-4 h-4 text-purple-600" />
            <span>Métadonnées Générales</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nom du Site Web</label>
            <input
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Titre Méta Principal (Meta Title)</label>
            <input
              type="text"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description Méta Principale (Meta Description)</label>
            <textarea
              rows={3}
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>
        </Card>

        {/* SOCIAL & TRACKING */}
        <Card className="p-6 bg-white space-y-4 border border-slate-200">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            <Share2 className="w-4 h-4 text-purple-600" />
            <span>Partage Social & Tracking</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">URL Image de Partage (Open Graph Image)</label>
            <input
              type="text"
              value={ogImage}
              onChange={(e) => setOgImage(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Compte Twitter / X</label>
              <input
                type="text"
                value={twitterHandle}
                onChange={(e) => setTwitterHandle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ID Google Analytics (GA4)</label>
              <input
                type="text"
                placeholder="G-XXXXXXXXXX"
                value={googleAnalyticsId}
                onChange={(e) => setGoogleAnalyticsId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Fichier robots.txt</label>
            <textarea
              rows={3}
              value={robotsTxt}
              onChange={(e) => setRobotsTxt(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
            />
          </div>
        </Card>

        <Button
          type="submit"
          disabled={saving}
          variant="primary"
          size="lg"
          className="w-full font-bold gap-2 shadow-md"
        >
          <Save className="w-5 h-5" />
          <span>{saving ? 'Enregistrement en cours...' : 'Enregistrer la configuration SEO'}</span>
        </Button>

      </form>

    </div>
  );
}
