import { prisma } from '../lib/prisma';

async function main() {
  const article = await prisma.article.findFirst({
    where: { slug: 'methode-para-notion-organisation-projets-offre-lancement-1' },
  });

  if (!article) {
    console.log('Article not found by slug, finding first...');
  }
  const targetArticle = article || (await prisma.article.findFirst({ orderBy: { updatedAt: 'desc' } }));

  if (!targetArticle) return;
  console.log('ARTICLE:', targetArticle.title);
  let rawHtml = targetArticle.content || '';

  // Strip delete bars
  rawHtml = rawHtml.replace(/<div[^>]*class=["'][^"']*delete-block-bar[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, '');

  console.log('--- TESTING FIGURE REGEX ---');
  const figureRegex = /<figure[^>]*class=["'][^"']*optin-ebook-embed[^"']*[\s\S]*?<\/figure>/gi;

  const matches = rawHtml.match(figureRegex);
  console.log('MATCH COUNT:', matches?.length);
  if (matches) {
    matches.forEach((m, idx) => {
      console.log(`MATCH ${idx} LENGTH:`, m.length);
      console.log(`MATCH ${idx} ENDS WITH:`, m.substring(m.length - 20));
    });
  }

  const parts = rawHtml.split(figureRegex);
  console.log('PARTS COUNT:', parts.length);
  parts.forEach((p, idx) => {
    console.log(`PART ${idx} CONTAINS "Tout ce dont":`, p.includes('Tout ce dont'));
  });
}

main().finally(() => prisma.$disconnect());
