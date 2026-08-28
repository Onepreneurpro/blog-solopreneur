import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Plus, Eye, Layers, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

export default async function AdminTemplatesListPage() {
  const templates = await prisma.product.findMany({
    where: {
      isFreeResource: false,
    },
    orderBy: { createdAt: 'desc' },
    include: {
      category: true,
    },
  });

  return (
    <div className="space-y-6">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-slate-900 tracking-tight">
            Gestion des Templates Notion & Excel
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Créez, gérez et suivez les ventes de vos templates Notion et tableaux de bord Excel.
          </p>
        </div>
        <Link href="/admin/templates/new">
          <Button variant="primary" size="sm" className="gap-1.5 font-bold">
            <Plus className="w-4 h-4" />
            <span>Nouveau Template</span>
          </Button>
        </Link>
      </div>

      <Card className="bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="p-4">Template</th>
                <th className="p-4">Type / Catégorie</th>
                <th className="p-4">Prix</th>
                <th className="p-4">Téléchargements</th>
                <th className="p-4">Statut</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {templates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Aucun template configuré pour l instant.
                  </td>
                </tr>
              ) : (
                templates.map((tpl) => (
                  <tr key={tpl.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-slate-900 max-w-xs truncate">
                      {tpl.name}
                      {tpl.isFeatured && <span className="ml-2 text-amber-500 text-xs font-normal">★ Best-seller</span>}
                    </td>
                    <td className="p-4">
                      {tpl.category?.slug === 'notion' ? (
                        <Badge variant="emerald" className="gap-1">
                          <Layers className="w-3 h-3" /> Template Notion
                        </Badge>
                      ) : (
                        <Badge variant="indigo" className="gap-1">
                          <FileSpreadsheet className="w-3 h-3" /> Dashboard Excel
                        </Badge>
                      )}
                    </td>
                    <td className="p-4 font-extrabold text-slate-900">
                      {tpl.price} €
                      {tpl.compareAtPrice && <span className="ml-1.5 text-xs text-slate-400 line-through font-normal">{tpl.compareAtPrice} €</span>}
                    </td>
                    <td className="p-4 text-xs font-medium text-slate-600">
                      {tpl.downloadsCount} ventes
                    </td>
                    <td className="p-4">
                      <Badge variant={tpl.status === 'PUBLISHED' ? 'emerald' : 'slate'}>
                        {tpl.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/boutique/${tpl.slug}`} target="_blank">
                          <Button variant="ghost" size="sm" title="Voir la fiche">
                            <Eye className="w-4 h-4 text-slate-500" />
                          </Button>
                        </Link>
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
