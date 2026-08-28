import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Plus, Edit, Eye, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { DeleteProductButton } from './DeleteProductButton';

export const dynamic = 'force-dynamic';

export default async function AdminProductsListPage() {
  const products = await prisma.product.findMany({
    where: {
      isFreeResource: false,
    },
    orderBy: { createdAt: 'desc' },
    include: { category: true },
  });

  return (
    <div className="space-y-6 w-full">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Boutique des Produits</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gérez vos templates Notion, dashboards Excel et produits digitaux de la boutique.
          </p>
        </div>
        <Link href="/admin/produits/new">
          <Button variant="primary" size="sm" className="gap-1.5 font-bold bg-purple-700 hover:bg-purple-800 text-white">
            <Plus className="w-4 h-4" />
            <span>Nouveau produit digital</span>
          </Button>
        </Link>
      </div>

      <Card className="bg-white overflow-hidden shadow-sm border border-slate-200 w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="p-4">Produit</th>
                <th className="p-4">Catégorie</th>
                <th className="p-4">Prix</th>
                <th className="p-4">Téléchargements</th>
                <th className="p-4">Statut</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Aucun produit enregistré pour le moment.
                  </td>
                </tr>
              ) : (
                products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-2 min-w-0">
                          <ShoppingBag className="w-4 h-4 text-purple-600 flex-shrink-0" />
                          <span className="font-extrabold text-slate-900 text-sm">{prod.name}</span>
                        </div>
                        {prod.isFeatured && (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-amber-300 text-amber-950 font-black px-2 py-0.5 rounded-full border border-amber-400 shadow-sm flex-shrink-0 whitespace-nowrap">
                            ★ Best-seller
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      {prod.category ? (
                        <Badge variant="indigo" className="bg-purple-100 text-purple-900 border-purple-300 font-bold whitespace-nowrap">{prod.category.name}</Badge>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="p-4 font-extrabold text-slate-900 whitespace-nowrap">
                      {`${prod.price} €`}
                    </td>
                    <td className="p-4 text-xs font-medium text-slate-600">
                      {prod.downloadsCount}
                    </td>
                    <td className="p-4">
                      <Badge variant={prod.status === 'PUBLISHED' ? 'emerald' : 'slate'}>
                        {prod.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                        {/* VIEW PRODUCT ON SITE */}
                        <Link href={`/boutique/${prod.slug}`} target="_blank">
                          <Button variant="ghost" size="sm" title="Voir sur le site">
                            <Eye className="w-4 h-4 text-slate-500 hover:text-slate-800" />
                          </Button>
                        </Link>

                        {/* EDIT PRODUCT */}
                        <Link href={`/admin/produits/${prod.id}/edit`}>
                          <Button variant="outline" size="sm" className="gap-1 font-bold text-purple-900 border-purple-200 bg-purple-50 hover:bg-purple-100" title="Modifier le produit">
                            <Edit className="w-3.5 h-3.5 text-purple-700" />
                            <span>Modifier</span>
                          </Button>
                        </Link>

                        {/* DELETE PRODUCT */}
                        <DeleteProductButton productId={prod.id} productName={prod.name} />
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
