'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Trash2, Eye, FileText, Menu, ExternalLink, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export default function AdminPagesPage() {
  const [pages, setPages] = useState<any[]>([]);
  const [menus, setMenus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPagesAndMenus = async () => {
    try {
      const [pRes, mRes] = await Promise.all([
        fetch('/api/admin/pages'),
        fetch('/api/admin/menus'),
      ]);
      const pData = await pRes.json();
      const mData = await mRes.json();

      if (pData.pages) setPages(pData.pages);
      if (mData.menus) setMenus(mData.menus);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPagesAndMenus();
  }, []);

  const handleDeletePage = async (id: string) => {
    if (!confirm('Supprimer cette page statique ?')) return;

    try {
      const res = await fetch(`/api/admin/pages?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erreur de suppression.');
      fetchPagesAndMenus();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getMenuLabel = (location: string | null) => {
    if (!location || location === 'NONE') return 'Page Autonome (Sans menu)';
    const found = menus.find((m) => m.location === location);
    return found ? found.title : location;
  };

  return (
    <div className="space-y-6">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-purple-600" />
            <span>Gestion des Pages Statiques</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Créez et modifiez vos pages d information avec l éditeur visuel avancé et associez-les aux Menus Dynamiques du site.
          </p>
        </div>

        <Link href="/admin/pages/new">
          <Button variant="primary" size="sm" className="gap-1.5 font-bold btn-purple shadow-sm">
            <Plus className="w-4 h-4" />
            <span>Créer une Page (Éditeur Avancé)</span>
          </Button>
        </Link>
      </div>

      {/* PAGES TABLE */}
      <Card className="bg-white overflow-hidden shadow-sm border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="p-4">Titre de la Page</th>
                <th className="p-4">Slug URL</th>
                <th className="p-4">Menu de Destination (Menus Dynamiques)</th>
                <th className="p-4">Statut</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">Chargement des pages...</td>
                </tr>
              ) : pages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">Aucune page statique créée pour le moment. Cliquez sur "Créer une Page".</td>
                </tr>
              ) : (
                pages.map((pg) => (
                  <tr key={pg.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-slate-900 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-purple-600" />
                      <span>{pg.title}</span>
                    </td>
                    <td className="p-4 text-xs font-mono text-slate-500">/{pg.slug}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 bg-purple-50 text-purple-950 border border-purple-200 rounded-full">
                        <Menu className="w-3 h-3 text-purple-600" />
                        <span>{getMenuLabel(pg.targetMenu)}</span>
                      </span>
                    </td>
                    <td className="p-4">
                      <Badge variant={pg.status === 'PUBLISHED' ? 'emerald' : 'slate'}>
                        {pg.status === 'PUBLISHED' ? 'Publié' : pg.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        
                        {/* EDIT PAGE BUTTON */}
                        <Link href={`/admin/pages/${pg.id}/edit`}>
                          <Button variant="outline" size="sm" className="gap-1 font-semibold text-xs text-purple-700 border-purple-200 bg-purple-50 hover:bg-purple-100" title="Modifier la page">
                            <Edit className="w-3.5 h-3.5 text-purple-600" />
                            <span>Modifier</span>
                          </Button>
                        </Link>

                        {/* LIVE PREVIEW BUTTON */}
                        <Link href={`/${pg.slug}`} target="_blank">
                          <Button variant="ghost" size="sm" title="Aperçu de la page en direct">
                            <ExternalLink className="w-4 h-4 text-slate-600" />
                          </Button>
                        </Link>

                        {/* DELETE BUTTON */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePage(pg.id)}
                          className="text-red-500 hover:bg-red-50"
                          title="Supprimer la page"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
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
