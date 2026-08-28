import React from 'react';
import { Hero } from '@/components/public/Hero';
import { HeroModernBento } from '@/components/public/modern/HeroModernBento';
import { HeroPixelFunnel } from '@/components/public/pixel/HeroPixelFunnel';
import { TickerBanner } from '@/components/public/TickerBanner';
import { CategoryGrid } from '@/components/public/CategoryGrid';
import { CategoryGridModern } from '@/components/public/modern/CategoryGridModern';
import { CollectionsPixel } from '@/components/public/pixel/CollectionsPixel';
import { FeaturedProducts } from '@/components/public/FeaturedProducts';
import { FeaturedProductsModern } from '@/components/public/modern/FeaturedProductsModern';
import { FeaturedProductsPixel } from '@/components/public/pixel/FeaturedProductsPixel';
import { DarkFeatureSection } from '@/components/public/DarkFeatureSection';
import { DarkFeatureModern } from '@/components/public/modern/DarkFeatureModern';
import { FreeEbookOptinPixel } from '@/components/public/pixel/FreeEbookOptinPixel';
import { FreeResourcesSection } from '@/components/public/FreeResourcesSection';
import { FeaturedArticles } from '@/components/public/FeaturedArticles';
import { Testimonials } from '@/components/public/Testimonials';
import { TestimonialsPixel } from '@/components/public/pixel/TestimonialsPixel';
import { FinalYellowCTA } from '@/components/public/FinalYellowCTA';
import { FinalCtaModern } from '@/components/public/modern/FinalCtaModern';
import { prisma } from '@/lib/prisma';
import { getActiveTheme } from '@/lib/theme';

export const dynamic = 'force-dynamic';

const DEFAULT_SECTIONS_ORDER = [
  'HERO',
  'TICKER',
  'CATEGORIES',
  'PRODUCTS',
  'DARK_FEATURE',
  'RESOURCES',
  'ARTICLES',
  'TESTIMONIALS',
  'FINAL_CTA',
];

export default async function HomePage() {
  let articles: any[] = [];
  let products: any[] = [];
  let freeResources: any[] = [];
  let activeSections: any[] = [];
  let activeTheme = 'pixel-funnel';

  try {
    activeTheme = await getActiveTheme();

    let dbSections = await prisma.homepageSection.findMany({
      orderBy: { order: 'asc' },
    });

    activeSections = dbSections.filter((s) => s.isEnabled);

    articles = await prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      take: 3,
      orderBy: { publishedAt: 'desc' },
      include: {
        category: { select: { name: true, slug: true } },
      },
    });

    products = await prisma.product.findMany({
      where: { status: 'PUBLISHED', isFreeResource: false },
      take: 6,
      orderBy: { downloadsCount: 'desc' },
      include: {
        category: { select: { name: true, slug: true } },
      },
    });

    freeResources = await prisma.product.findMany({
      where: { status: 'PUBLISHED', isFreeResource: true },
      take: 2,
      orderBy: { downloadsCount: 'desc' },
    });
  } catch (error) {
    console.error('Error loading homepage data:', error);
  }

  const sectionsToRender = activeSections.length > 0
    ? activeSections
    : DEFAULT_SECTIONS_ORDER.map((key, i) => ({ sectionKey: key, title: '', subtitle: '', isEnabled: true, order: i, settings: {} }));

  const isClassic = activeTheme === 'classic' || activeTheme === 'makers-purple' || activeTheme === 'solopreneur-light';
  const isPixelFunnel = activeTheme === 'pixel-funnel';

  return (
    <div className="flex flex-col min-h-screen">
      {sectionsToRender.map((sec) => {
        switch (sec.sectionKey) {
          case 'HERO':
            if (isPixelFunnel) return <HeroPixelFunnel key={sec.id || 'HERO'} title={sec.title} subtitle={sec.subtitle} settings={sec.settings} />;
            if (isClassic) return <Hero key={sec.id || 'HERO'} title={sec.title} subtitle={sec.subtitle} settings={sec.settings} />;
            return <HeroModernBento key={sec.id || 'HERO'} title={sec.title} subtitle={sec.subtitle} settings={sec.settings} />;

          case 'TICKER':
            return <TickerBanner key={sec.id || 'TICKER'} settings={sec.settings} isDark={!isClassic} />;

          case 'CATEGORIES':
            if (isPixelFunnel) return <CollectionsPixel key={sec.id || 'CATEGORIES'} title={sec.title} subtitle={sec.subtitle} settings={sec.settings} />;
            if (isClassic) return <CategoryGrid key={sec.id || 'CATEGORIES'} title={sec.title} subtitle={sec.subtitle} settings={sec.settings} />;
            return <CategoryGridModern key={sec.id || 'CATEGORIES'} title={sec.title} subtitle={sec.subtitle} settings={sec.settings} />;

          case 'PRODUCTS':
            if (isPixelFunnel) return <FeaturedProductsPixel key={sec.id || 'PRODUCTS'} products={products} title={sec.title} subtitle={sec.subtitle} settings={sec.settings} />;
            if (isClassic) return <FeaturedProducts key={sec.id || 'PRODUCTS'} products={products} title={sec.title} subtitle={sec.subtitle} settings={sec.settings} />;
            return <FeaturedProductsModern key={sec.id || 'PRODUCTS'} products={products} title={sec.title} subtitle={sec.subtitle} settings={sec.settings} />;

          case 'DARK_FEATURE':
            if (isPixelFunnel) return <FreeEbookOptinPixel key={sec.id || 'DARK_FEATURE'} title={sec.title} subtitle={sec.subtitle} settings={sec.settings} />;
            if (isClassic) return <DarkFeatureSection key={sec.id || 'DARK_FEATURE'} title={sec.title} subtitle={sec.subtitle} settings={sec.settings} />;
            return <DarkFeatureModern key={sec.id || 'DARK_FEATURE'} title={sec.title} subtitle={sec.subtitle} settings={sec.settings} />;

          case 'RESOURCES':
            return <FreeResourcesSection key={sec.id || 'RESOURCES'} resources={freeResources} title={sec.title} subtitle={sec.subtitle} settings={sec.settings} isDark={!isClassic} />;

          case 'ARTICLES':
            return <FeaturedArticles key={sec.id || 'ARTICLES'} articles={articles} title={sec.title} subtitle={sec.subtitle} settings={sec.settings} />;

          case 'TESTIMONIALS':
            if (isPixelFunnel) return <TestimonialsPixel key={sec.id || 'TESTIMONIALS'} title={sec.title} subtitle={sec.subtitle} settings={sec.settings} />;
            return <Testimonials key={sec.id || 'TESTIMONIALS'} title={sec.title} subtitle={sec.subtitle} settings={sec.settings} />;

          case 'FINAL_CTA':
            if (isClassic) return <FinalYellowCTA key={sec.id || 'FINAL_CTA'} title={sec.title} subtitle={sec.subtitle} settings={sec.settings} />;
            return <FinalCtaModern key={sec.id || 'FINAL_CTA'} title={sec.title} subtitle={sec.subtitle} settings={sec.settings} />;

          default:
            return null;
        }
      })}
    </div>
  );
}
