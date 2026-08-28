import { prisma } from '../lib/prisma';

async function main() {
  const article = await prisma.article.findFirst({
    orderBy: { updatedAt: 'desc' },
  });

  if (article) {
    console.log('ARTICLE TITLE:', article.title);
    const content = article.content;
    console.log('LENGTH:', content.length);
    console.log('CONTAINS optin-ebook-embed:', content.includes('optin-ebook-embed'));
    console.log('CONTAINS custom-embed-block:', content.includes('custom-embed-block'));

    const matches = content.match(/<[^>]+optin-ebook-embed[^>]*>/gi);
    console.log('MATCHING TAGS:', matches);

    // Find indices
    let idx = content.indexOf('optin-ebook-embed');
    if (idx !== -1) {
      console.log('SNIPPET AROUND OPTIN:\n', content.substring(Math.max(0, idx - 100), Math.min(content.length, idx + 600)));
    }
  }
}

main().finally(() => prisma.$disconnect());
