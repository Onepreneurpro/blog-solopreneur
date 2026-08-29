import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { FileText, ShoppingBag, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardBody } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const articlesCount = await prisma.article.count();
  const productsCount = await prisma.product.count();
  const ordersCount = await prisma.order.count();

  const orders = await prisma.order.findMany();
  const totalRevenue = orders.reduce((acc, order) => acc + order.totalAmount, 0);

  const recentArticles = await prisma.article.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { category: true },
  });

  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { items: true },
  });

  return (
    <div className="space-y-8">
      
      {/* TITLE & HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Tableau de bord</h1>
          <p className="text-sm text-slate-500 mt-1">
            Vue d'ensemble de l activité de votre plateforme.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/articles/new">
            <Button variant="primary" size="sm">
              + Nouvel Article
            </Button>
          </Link>
          <Link href="/admin/templates/new">
            <Button variant="secondary" size="sm">
              + Nouveau Template
            </Button>
          </Link>
        </div>
      </div>

      {/* STAT CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <Card className="p-5 flex items-center justify-between bg-white">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Chiffre d'affaires</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{totalRevenue.toFixed(2)} €</div>
            <div className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +12% ce mois
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
            <DollarSign className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between bg-white">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Commandes</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{ordersCount}</div>
            <div className="text-xs text-slate-500 mt-1">Ventes réalisées</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200">
            <ShoppingCart className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between bg-white">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Articles Publiés</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{articlesCount}</div>
            <div className="text-xs text-slate-500 mt-1">Articles de blog</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
            <FileText className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between bg-white">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Produits Digitaux</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{productsCount}</div>
            <div className="text-xs text-slate-500 mt-1">Templates Notion & Excel</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </Card>

      </div>

      {/* RECENT CONTENT & ORDERS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* RECENT ARTICLES */}
        <Card className="bg-white">
          <CardHeader className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Derniers articles</h3>
            <Link href="/admin/articles" className="text-xs font-semibold text-emerald-600 hover:underline">
              Gérer les articles →
            </Link>
          </CardHeader>
          <CardBody className="p-0">
            <div className="divide-y divide-slate-100">
              {recentArticles.map((art) => (
                <div key={art.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">{art.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Catégorie : {art.category?.name || 'Aucune'} • {art.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* RECENT ORDERS */}
        <Card className="bg-white">
          <CardHeader className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Dernières commandes</h3>
            <Link href="/admin/commandes" className="text-xs font-semibold text-emerald-600 hover:underline">
              Toutes les commandes →
            </Link>
          </CardHeader>
          <CardBody className="p-0">
            <div className="divide-y divide-slate-100">
              {recentOrders.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500">Aucune commande pour l instant.</div>
              ) : (
                recentOrders.map((ord) => (
                  <div key={ord.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <div className="font-semibold text-slate-900 text-sm">
                        {ord.orderNumber} ({ord.totalAmount} €)
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Client : {ord.customerEmail}
                      </div>
                    </div>
                    <Badge variant="emerald">{ord.status}</Badge>
                  </div>
                ))
              )}
            </div>
          </CardBody>
        </Card>

      </div>

    </div>
  );
}
