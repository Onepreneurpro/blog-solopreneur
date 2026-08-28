import { prisma } from '../lib/prisma';

async function main() {
  const article = await prisma.article.findFirst({
    orderBy: { updatedAt: 'desc' },
  });

  if (article) {
    console.log('ARTICLE ID:', article.id);
    console.log('ARTICLE TITLE:', article.title);
    console.log('--- ARTICLE CONTENT START ---');
    console.log(JSON.stringify(article.content));
    console.log('--- ARTICLE CONTENT END ---');
  }
}

main().finally(() => prisma.$disconnect());
