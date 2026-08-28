import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, ShoppingBag, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersListPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      items: { include: { product: true } },
    },
  });

  return (
    <div className="space-y-6 w-full">
      
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-purple-600" />
          <span>Gestion des Commandes</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Historique, paiements et détails de toutes les transactions clients.
        </p>
      </div>

      <Card className="bg-white overflow-hidden shadow-sm border border-slate-200 w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="p-4">N° Commande</th>
                <th className="p-4">Client E-mail</th>
                <th className="p-4">Produit(s)</th>
                <th className="p-4">Montant</th>
                <th className="p-4">Statut Paiement</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Aucune commande enregistrée.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-mono font-bold whitespace-nowrap">
                      <Link
                        href={`/admin/commandes/${ord.id}`}
                        className="text-purple-700 hover:text-purple-900 hover:underline flex items-center gap-1 font-extrabold"
                      >
                        <span>{ord.orderNumber}</span>
                      </Link>
                    </td>
                    <td className="p-4 font-medium text-slate-900 whitespace-nowrap">{ord.customerEmail}</td>
                    <td className="p-4 font-medium text-slate-800">
                      {ord.items[0]?.title || 'Produit'}
                      {ord.items.length > 1 && (
                        <span className="text-xs text-slate-400 font-bold ml-1">+{ord.items.length - 1} autre(s)</span>
                      )}
                    </td>
                    <td className="p-4 font-extrabold text-slate-900 whitespace-nowrap">{ord.totalAmount} €</td>
                    <td className="p-4 whitespace-nowrap">
                      <Badge variant={ord.status === 'COMPLETED' ? 'emerald' : ord.status === 'REFUNDED' ? 'indigo' : 'slate'} className="font-bold">
                        {ord.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(ord.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <Link href={`/admin/commandes/${ord.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 font-bold text-xs text-purple-900 border-purple-200 bg-purple-50 hover:bg-purple-100"
                        >
                          <Eye className="w-3.5 h-3.5 text-purple-700" />
                          <span>Détails</span>
                        </Button>
                      </Link>
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
