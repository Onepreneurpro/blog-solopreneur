import { prisma } from '../lib/prisma';

async function main() {
  const articles = await prisma.article.findMany({
    where: { content: { contains: 'optin-ebook-embed' } },
  });

  console.log(`Found ${articles.length} articles with optin-ebook-embed.`);

  for (const article of articles) {
    // Replace old div or figure optin blocks with clean figure template
    let content = article.content;
    
    // Remove any broken/duplicated optin blocks and keep single clean figure
    const cleanFigure = `<figure class="custom-embed-block optin-ebook-embed my-8 p-6 bg-slate-950 text-white rounded-3xl border-2 border-[#a3e635] shadow-2xl space-y-4 text-center relative group" data-custom-embed="optin-ebook">
  <div class="delete-block-bar flex items-center justify-between border-b border-slate-800 pb-2 mb-2 select-none" contenteditable="false">
    <span class="text-[11px] font-heading font-black text-[#a3e635] uppercase tracking-wider">📖 BLOC OPT-IN EBOOK GRATUIT</span>
    <button type="button" class="delete-block-btn px-2.5 py-1 bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer">🗑️ Supprimer ce bloc</button>
  </div>
  <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#a3e635] text-slate-950 font-heading font-black text-xs uppercase shadow-xs">
    🎁 EBOOK OFFERT A 100%
  </div>
  <h3 class="text-2xl font-heading font-black text-white">Tout ce dont vous avez besoin pour structurer et faire décoller votre activité</h3>
  <p class="text-sm text-slate-300 font-medium max-w-xl mx-auto">Ne perdez plus des heures à configurer des outils bancales. Saisissez vos coordonnées pour recevoir votre eBook gratuit et sa séquence exclusive.</p>
  <div class="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-3 max-w-md mx-auto">
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
      <input type="text" placeholder="Votre prénom" class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white" disabled />
      <input type="email" placeholder="Votre email pro" class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white" disabled />
    </div>
    <button type="button" class="w-full py-2.5 bg-[#a3e635] text-slate-950 font-heading font-black text-xs rounded-xl shadow-md cursor-pointer">Send My FREE Guide 🚀</button>
  </div>
</figure>`;

    // Replace all optin blocks with 1 clean figure block
    content = content.replace(/<(?:figure|div)[^>]*class=["'][^"']*optin-ebook-embed[^"']*["'][^>]*>[\s\S]*?<\/(?:figure|div)>/gi, cleanFigure);

    await prisma.article.update({
      where: { id: article.id },
      data: { content },
    });
    console.log(`Cleaned article ${article.title}`);
  }
}

main().finally(() => prisma.$disconnect());
