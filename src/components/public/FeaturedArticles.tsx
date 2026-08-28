import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, BookOpen } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { FormattedText } from '@/components/ui/FormattedText';

interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  coverImage?: string | null;
  publishedAt?: Date | null;
  category?: { name: string; slug: string } | null;
}

interface FeaturedArticlesProps {
  articles: ArticleItem[];
  title?: string;
  subtitle?: string | null;
  settings?: any;
}

export function FeaturedArticles({
  articles = [],
  title = "Conseils & Guides pour Solopreneurs",
  subtitle = "Découvrez nos méthodes pour prospecter, s organiser et développer votre activité.",
  settings = {},
}: FeaturedArticlesProps) {
  if (!articles || articles.length === 0) return null;

  const btnSettings = typeof settings === 'string' ? (JSON.parse(settings || '{}') || {}) : (settings || {});
  const linkText = btnSettings.btn1Text || 'Voir tous les articles';
  const linkUrl = btnSettings.btn1Url || '/blog';

  return (
    <section className="py-16 bg-white border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-heading font-extrabold bg-purple-100 text-purple-900 border border-purple-200 mb-2">
              <BookOpen className="w-3.5 h-3.5 text-purple-700" />
              <span>Derniers Articles</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 tracking-tight">
              <FormattedText text={title} />
            </h2>
            {subtitle && (
              <p className="text-slate-600 mt-1 text-sm font-semibold">
                <FormattedText text={subtitle} />
              </p>
            )}
          </div>
          <Link href={linkUrl} className="text-xs font-heading font-extrabold text-purple-700 hover:text-purple-900 inline-flex items-center gap-1">
            <span>{linkText}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* ARTICLES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {articles.map((art) => (
            <Card key={art.id} className="bg-white border border-slate-200/80 hover:border-purple-600 rounded-3xl overflow-hidden flex flex-col h-full transition-all shadow-xs hover:shadow-xl">
              {art.coverImage && (
                <Link href={`/blog/${art.slug}`} className="relative block aspect-[16/10] overflow-hidden bg-slate-100">
                  <Image
                    src={art.coverImage}
                    alt={art.title}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                  />
                  {art.category && (
                    <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-heading font-black bg-white/90 backdrop-blur-md text-slate-900 border border-slate-200 shadow-xs">
                      {art.category.name}
                    </span>
                  )}
                </Link>
              )}

              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-base sm:text-lg font-heading font-black text-slate-900 hover:text-purple-700 line-clamp-2 mb-2">
                  <Link href={`/blog/${art.slug}`}>{art.title}</Link>
                </h3>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed font-semibold mb-6">
                  {art.excerpt}
                </p>

                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-semibold">
                    {art.publishedAt ? new Date(art.publishedAt).toLocaleDateString('fr-FR') : ''}
                  </span>

                  <Link href={`/blog/${art.slug}`} className="text-xs font-heading font-extrabold text-purple-700 flex items-center gap-1">
                    <span>Lire</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>

      </div>
    </section>
  );
}
