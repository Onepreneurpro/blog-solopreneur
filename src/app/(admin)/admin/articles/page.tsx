import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Plus, Edit, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { DeleteArticleButton } from '@/components/admin/DeleteArticleButton';

export const dynamic = 'force-dynamic';

export default async function AdminArticlesListPage() {
  const articles = await prisma.article.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      category: true,
      author: { select: { name: true } },
    },
  });

  return (
    <div className="space-y-6">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Gestion des Articles</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Créez, éditez et gérez tous les articles du blog.
          </p>
        </div>
        <Link href="/admin/articles/new">
          <Button variant="primary" size="sm" className="gap-1.5 font-bold">
            <Plus className="w-4 h-4" />
            <span>Créer un article</span>
          </Button>
        </Link>
      </div>

      <Card className="bg-white overflow-hidden shadow-sm border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="p-4">Titre</th>
                <th className="p-4">Catégorie</th>
                <th className="p-4">Auteur</th>
                <th className="p-4">Statut</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {articles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Aucun article rédigé pour l instant.
                  </td>
                </tr>
              ) : (
                articles.map((art) => (
                  <tr key={art.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-semibold text-slate-900 max-w-xs truncate">
                      {art.title}
                    </td>
                    <td className="p-4">
                      {art.category ? (
                        <Badge variant="indigo" className="bg-purple-100 text-purple-950 border-purple-300 font-extrabold whitespace-nowrap">{art.category.name}</Badge>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="p-4 text-xs font-medium text-slate-600">
                      {art.author?.name || 'Rédaction'}
                    </td>
                    <td className="p-4">
                      <Badge variant={art.status === 'PUBLISHED' ? 'emerald' : 'slate'}>
                        {art.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-xs text-slate-500">
                      {new Date(art.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* VIEW ARTICLE */}
                        <Link href={`/blog/${art.slug}`} target="_blank">
                          <Button variant="ghost" size="sm" title="Voir l article">
                            <Eye className="w-4 h-4 text-slate-500" />
                          </Button>
                        </Link>
                        {/* EDIT ARTICLE */}
                        <Link href={`/admin/articles/${art.id}/edit`}>
                          <Button variant="outline" size="sm" className="gap-1 font-semibold" title="Modifier l article">
                            <Edit className="w-3.5 h-3.5 text-slate-700" />
                            <span>Modifier</span>
                          </Button>
                        </Link>
                        {/* DELETE ARTICLE */}
                        <DeleteArticleButton articleId={art.id} articleTitle={art.title} />
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
