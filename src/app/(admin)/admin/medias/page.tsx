'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Copy, Check, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function AdminMediasPage() {
  const [medias, setMedias] = useState<any[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newUrl, setNewUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');

  const fetchMedias = () => {
    fetch('/api/admin/medias')
      .then((res) => res.json())
      .then((data) => {
        if (data.medias) setMedias(data.medias);
      });
  };

  useEffect(() => {
    fetchMedias();
  }, []);

  const handleAddMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl) return;

    await fetch('/api/admin/medias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: newUrl, title: newTitle }),
    });

    setNewUrl('');
    setNewTitle('');
    fetchMedias();
  };

  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Médiathèque</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Gérez vos images et copiez facilement les URLs pour vos articles et produits.
        </p>
      </div>

      {/* ADD MEDIA LINK FORM */}
      <Card className="p-5 bg-white">
        <form onSubmit={handleAddMedia} className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Ajouter une image externe</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              required
              placeholder="URL de l image (https://...)"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <input
              type="text"
              placeholder="Titre / Description"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <Button type="submit" variant="primary" size="sm" className="gap-1.5 font-bold">
            <Plus className="w-4 h-4" />
            <span>Ajouter la média</span>
          </Button>
        </form>
      </Card>

      {/* MEDIAS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {medias.map((med) => (
          <Card key={med.id} className="p-3 bg-white space-y-3">
            <div className="relative aspect-[16/10] w-full rounded-lg overflow-hidden bg-slate-100">
              <Image src={med.url} alt={med.title || 'Media'} fill className="object-cover" />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-900 truncate max-w-[120px]">{med.title || 'Image'}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(med.url, med.id)}
                className="p-1.5 h-auto text-xs gap-1"
              >
                {copiedId === med.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === med.id ? 'Copié' : 'Copier'}</span>
              </Button>
            </div>
          </Card>
        ))}
      </div>

    </div>
  );
}
