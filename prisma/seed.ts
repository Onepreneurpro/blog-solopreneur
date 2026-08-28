import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('--- SEEDING DATABASE ---');

  // Ensure directories exist
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  const privateDir = path.join(process.cwd(), 'private_downloads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  if (!fs.existsSync(privateDir)) fs.mkdirSync(privateDir, { recursive: true });

  // Create sample downloadable file
  const sampleFile1 = path.join(privateDir, 'notion-freelance-os.pdf');
  const sampleFile2 = path.join(privateDir, 'excel-cashflow-dashboard.xlsx');
  fs.writeFileSync(sampleFile1, 'Guide & Liens d access au Template Notion Freelance OS');
  fs.writeFileSync(sampleFile2, 'Fichier Excel Tableau de Bord Tresorerie');

  // 1. Admin User
  const passwordHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@solopreneur.io' },
    update: {},
    create: {
      email: 'admin@solopreneur.io',
      name: 'Alexandre Morel',
      passwordHash,
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    },
  });

  console.log('Admin user created/updated:', admin.email);

  // 2. Categories
  const catFreelance = await prisma.category.upsert({
    where: { slug: 'freelance' },
    update: {},
    create: {
      name: 'Freelance',
      slug: 'freelance',
      description: 'Conseils, prospection et gestion de relation client pour indépendants.',
      seoTitle: 'Conseils & Guides Freelance | Solopreneur Platform',
      seoDescription: 'Découvrez comment lancer et développer votre activité de freelance.',
    },
  });

  const catProductivity = await prisma.category.upsert({
    where: { slug: 'productivite' },
    update: {},
    create: {
      name: 'Productivité',
      slug: 'productivite',
      description: 'Systèmes d organisation, automatisation et gestion du temps.',
      seoTitle: 'Productivité & Systèmes pour Indépendants',
      seoDescription: 'Optimisez votre temps et vos process au quotidien.',
    },
  });

  const catFinance = await prisma.category.upsert({
    where: { slug: 'finance' },
    update: {},
    create: {
      name: 'Finance',
      slug: 'finance',
      description: 'Trésorerie, facturation et gestion financière des solopreneurs.',
      seoTitle: 'Gestion Financière & Trésorerie Freelance',
      seoDescription: 'Maîtrisez votre chiffre d affaires et votre trésorerie.',
    },
  });

  const catMarketing = await prisma.category.upsert({
    where: { slug: 'marketing' },
    update: {},
    create: {
      name: 'Marketing',
      slug: 'marketing',
      description: 'Acquisition client, stratégie de contenu et personal branding.',
      seoTitle: 'Marketing & Acquisition Client Solopreneur',
      seoDescription: 'Attirez des clients idéaux de manière organique.',
    },
  });

  // Subcategory under Freelance
  await prisma.category.upsert({
    where: { slug: 'trouver-des-clients' },
    update: {},
    create: {
      name: 'Trouver des clients',
      slug: 'trouver-des-clients',
      description: 'Stratégies de prospection et vente.',
      parentId: catFreelance.id,
    },
  });

  // 3. Product Categories
  const pCatNotion = await prisma.productCategory.upsert({
    where: { slug: 'notion' },
    update: {},
    create: {
      name: 'Templates Notion',
      slug: 'notion',
      description: 'Workspaces et dashboards Notion prêts à l emploi.',
    },
  });

  const pCatExcel = await prisma.productCategory.upsert({
    where: { slug: 'excel' },
    update: {},
    create: {
      name: 'Dashboards Excel',
      slug: 'excel',
      description: 'Tableaux de bord financiers et de suivi sur Excel & Google Sheets.',
    },
  });

  // 4. Tags
  const tagNotion = await prisma.tag.upsert({ where: { slug: 'notion' }, update: {}, create: { name: 'Notion', slug: 'notion' } });
  const tagExcel = await prisma.tag.upsert({ where: { slug: 'excel' }, update: {}, create: { name: 'Excel', slug: 'excel' } });
  const tagClient = await prisma.tag.upsert({ where: { slug: 'client' }, update: {}, create: { name: 'Client', slug: 'client' } });

  // 5. Sample Articles
  const art1 = await prisma.article.upsert({
    where: { slug: 'comment-fixer-ses-tarifs-freelance-en-2026' },
    update: {},
    create: {
      title: 'Comment fixer ses tarifs freelance en 2026 sans sous-évaluer son travail',
      slug: 'comment-fixer-ses-tarifs-freelance-en-2026',
      excerpt: 'Découvrez la méthode complète pour calculer votre TJM et fixer des prix au forfait rentables et attrayants pour vos clients.',
      content: `
<h2>Pourquoi la plupart des freelances sous-estiment leur TJM</h2>
<p>Fixer son tarif est l'un des plus grands défis de l'indépendant. Nombreux sont ceux qui se basent sur leur ancien salaire brut ou sur les prix pratiqués par des freelances juniors sur les plateformes de mise en relation.</p>

<h3>1. Le calcul inversé de votre rémunération</h3>
<p>Pour définir un tarif juste, vous devez partir de vos charges personnelles, de vos charges professionnelles (URSSAF, outils, assurances) et du nombre de jours réellement facturables par an (généralement entre 120 et 140 jours après déduction des congés et du temps administratif).</p>

<blockquote>Un freelance ne travaille pas 220 jours par an pour ses clients. Il consacre au moins 30% de son temps à la prospection, la gestion et la veille.</blockquote>

<h3>2. Passer du TJM au prix au forfait</h3>
<p>Vendre son temps fixe une limite mécanique à vos revenus. En adoptant la vente à la valeur (value-based pricing), vous facturez l'impact commercial de votre travail plutôt que le nombre d'heures passées.</p>

<p>Téléchargez notre modèle Excel de calcul de TJM dans la section ressources gratuites pour simuler vos revenus !</p>
      `,
      coverImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1200',
      authorId: admin.id,
      categoryId: catFinance.id,
      status: 'PUBLISHED',
      readingTime: 5,
      seoTitle: 'Fixer ses tarifs Freelance : Méthode TJM & Prix au Forfait',
      seoDescription: 'Guide pratique pour calculer votre TJM freelance et valoriser vos compétences.',
      publishedAt: new Date(),
    },
  });

  await prisma.articleTag.upsert({
    where: { articleId_tagId: { articleId: art1.id, tagId: tagClient.id } },
    update: {},
    create: { articleId: art1.id, tagId: tagClient.id },
  });

  const art2 = await prisma.article.upsert({
    where: { slug: 'construire-un-second-cerveau-avec-notion' },
    update: {},
    create: {
      title: 'Construire un Second Cerveau efficace avec Notion pour Solopreneurs',
      slug: 'construire-un-second-cerveau-avec-notion',
      excerpt: 'Organisez vos projets, vos notes de réunions et vos ressources dans un système centralisé pour libérer votre espace mental.',
      content: `
<h2>La méthode CODE appliquée au Solopreneuriat</h2>
<p>Le concept du Second Cerveau (Second Brain) démocratisé par Tiago Forte repose sur 4 piliers : Capture, Organize, Distill, Express.</p>
<p>Grâce à Notion, vous pouvez lier vos projets en cours à vos objectifs trimestriels et à votre CRM client de manière totalement fluide.</p>

<h3>La structure PARA : Projets, Domaines, Ressources, Archives</h3>
<p>En classant chaque note dans l'une de ces 4 catégories, vous ne perdez plus jamais une information essentielle et pouvez retrouver n'importe quel fichier en moins de 3 secondes.</p>
      `,
      coverImage: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=1200',
      authorId: admin.id,
      categoryId: catProductivity.id,
      status: 'PUBLISHED',
      readingTime: 6,
      seoTitle: 'Second Cerveau Notion : Guide d Organisation Solopreneur',
      seoDescription: 'Structurez votre prise de note et votre gestion de projets avec la méthode PARA sur Notion.',
      publishedAt: new Date(),
    },
  });

  await prisma.articleTag.upsert({
    where: { articleId_tagId: { articleId: art2.id, tagId: tagNotion.id } },
    update: {},
    create: { articleId: art2.id, tagId: tagNotion.id },
  });

  // 6. Sample Digital Products
  await prisma.product.upsert({
    where: { slug: 'notion-freelance-os-dashboard' },
    update: {},
    create: {
      name: 'Notion Freelance OS — Système Complet',
      slug: 'notion-freelance-os-dashboard',
      shortDescription: 'Le template Notion tout-en-un pour gérer vos projets, vos clients, vos factures et vos objectifs.',
      longDescription: `
<h3>Un système d exploitation conçu sur mesure pour les freelances et coachs</h3>
<p>Gérer une activité indépendante demande d'interchanger continuellement les casquettes : commercial, chef de projet, comptable et créateur.</p>
<p>Le template <strong>Notion Freelance OS</strong> regroupe toutes ces fonctions dans un espace épuré et connecté :</p>
<ul>
  <li><strong>CRM Clients</strong> : Suivi des prospects, propositions commerciales et fiches clients.</li>
  <li><strong>Gestion de Projets & Tâches</strong> : Vue Kanban, Timeline et jalons de livraison.</li>
  <li><strong>Finances & Facturation</strong> : Suivi des revenus, relances d imminence de paiement.</li>
  <li><strong>Bibliothèque de Ressources</strong> : Templates d e-mails, modèles de propositions et briefs.</li>
</ul>
      `,
      coverImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&q=80&w=1200',
      price: 39,
      compareAtPrice: 59,
      productCategoryId: pCatNotion.id,
      fileUrl: sampleFile1,
      isFeatured: true,
      downloadsCount: 142,
      status: 'PUBLISHED',
      seoTitle: 'Template Notion Freelance OS | Dashboard Indépendant Tout-en-un',
      seoDescription: 'Centralisez vos clients, vos projets et votre facturation sur Notion avec ce template clé en main.',
    },
  });

  await prisma.product.upsert({
    where: { slug: 'dashboard-excel-tresorerie-suivi' },
    update: {},
    create: {
      name: 'Dashboard Excel Trésorerie & Suivi Financier',
      slug: 'dashboard-excel-tresorerie-suivi',
      shortDescription: 'Visualisez en temps réel votre cashflow, vos charges et vos prévisions de chiffre d affaires.',
      longDescription: `
<h3>Prenez le contrôle total de vos finances indépendantes</h3>
<p>Ce tableau de bord automatique sur Excel & Google Sheets inclut :</p>
<ul>
  <li>Graphiques interactifs de suivi de trésorerie mois par mois.</li>
  <li>Calculateur de cotisations sociales et TVA automatique.</li>
  <li>Simulateur de seuil de rentabilité et d épargne de sécurité.</li>
</ul>
      `,
      coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200',
      price: 29,
      compareAtPrice: 45,
      productCategoryId: pCatExcel.id,
      fileUrl: sampleFile2,
      isFeatured: true,
      downloadsCount: 89,
      status: 'PUBLISHED',
      seoTitle: 'Dashboard Excel Trésorerie Freelance & Solopreneur',
      seoDescription: 'Pilotez votre trésorerie et vos cotisations avec un tableau de bord Excel automatisé.',
    },
  });

  // 7. Free Resource Product
  await prisma.product.upsert({
    where: { slug: 'checklist-prospection-freelance-pdf' },
    update: {},
    create: {
      name: 'Checklist : 10 Étapes pour Prospecter sans SPAM (PDF)',
      slug: 'checklist-prospection-freelance-pdf',
      shortDescription: 'Guide pratique et plan d action étape par étape pour décrocher vos premiers clients de qualité.',
      longDescription: '<p>Une méthode éprouvée pour entrer en contact avec vos prospects de façon naturelle et obtenir un taux de réponse supérieur à 40%.</p>',
      coverImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1200',
      price: 0,
      isFreeResource: true,
      fileUrl: sampleFile1,
      downloadsCount: 512,
      status: 'PUBLISHED',
      seoTitle: 'Checklist Prospection Freelance Gratuite',
      seoDescription: 'Téléchargez gratuitement notre guide de prospection éthique pour freelances.',
    },
  });

  // 8. Static Pages
  await prisma.page.upsert({
    where: { slug: 'a-propos' },
    update: {},
    create: {
      title: 'À propos de Solopreneur & Co',
      slug: 'a-propos',
      content: `
<h2>Notre Mission</h2>
<p>Solopreneur & Co a été créé pour donner aux freelances, consultants et créateurs indépendants les mêmes armes et outils d organisation que les grandes entreprises, en plus simple et plus efficace.</p>
<p>Nous croyons qu une activité indépendante florissante repose sur 3 piliers : un contenu à forte valeur ajoutée, des systèmes d organisation épurés et une liberté totale dans sa gestion au quotidien.</p>
      `,
      status: 'PUBLISHED',
    },
  });

  await prisma.page.upsert({
    where: { slug: 'contact' },
    update: {},
    create: {
      title: 'Contactez-nous',
      slug: 'contact',
      content: `
<p>Une question sur l un de nos templates Notion ou dashboards Excel ? Besoins d un conseil sur votre organisation ?</p>
<p>Envoyez-nous un e-mail à : <strong>hello@solopreneur.io</strong>. Nous vous répondons sous 24h ouvrées.</p>
      `,
      status: 'PUBLISHED',
    },
  });

  await prisma.page.upsert({
    where: { slug: 'faq' },
    update: {},
    create: {
      title: 'Foire Aux Questions (FAQ)',
      slug: 'faq',
      content: `
<h3>Comment fonctionnent les templates Notion ?</h3>
<p>Dès la confirmation de votre commande, vous recevez un lien de duplication immédiat. En un clic, le template s ajoute à votre espace Notion personnel.</p>
<h3>Puis-je obtenir une facture ?</h3>
<p>Oui, toutes nos commandes génèrent une facture avec TVA téléchargeable depuis votre compte client.</p>
      `,
      status: 'PUBLISHED',
    },
  });

  // 9. Menus
  const headerMenu = await prisma.menu.upsert({
    where: { location: 'HEADER' },
    update: {},
    create: {
      title: 'Menu Principal',
      location: 'HEADER',
    },
  });

  await prisma.menuItem.deleteMany({ where: { menuId: headerMenu.id } });

  await prisma.menuItem.createMany({
    data: [
      { menuId: headerMenu.id, title: 'Accueil', url: '/', order: 1, type: 'CUSTOM' },
      { menuId: headerMenu.id, title: 'Blog', url: '/blog', order: 2, type: 'CUSTOM' },
      { menuId: headerMenu.id, title: 'Ressources', url: '/ressources', order: 3, type: 'CUSTOM' },
      { menuId: headerMenu.id, title: 'Boutique', url: '/boutique', order: 4, type: 'CUSTOM' },
      { menuId: headerMenu.id, title: 'Templates Notion', url: '/boutique?category=notion', order: 5, type: 'CUSTOM' },
      { menuId: headerMenu.id, title: 'Dashboards Excel', url: '/boutique?category=excel', order: 6, type: 'CUSTOM' },
    ],
  });

  const footerMenu = await prisma.menu.upsert({
    where: { location: 'FOOTER' },
    update: {},
    create: {
      title: 'Menu Pied de Page',
      location: 'FOOTER',
    },
  });

  await prisma.menuItem.deleteMany({ where: { menuId: footerMenu.id } });

  await prisma.menuItem.createMany({
    data: [
      { menuId: footerMenu.id, title: 'À propos', url: '/a-propos', order: 1, type: 'PAGE' },
      { menuId: footerMenu.id, title: 'Contact', url: '/contact', order: 2, type: 'PAGE' },
      { menuId: footerMenu.id, title: 'FAQ', url: '/faq', order: 3, type: 'PAGE' },
    ],
  });

  // 10. Homepage Sections
  const sections = [
    { sectionKey: 'HERO', title: 'Les outils et ressources pour développer votre activité indépendante.', subtitle: 'Articles, templates Notion et dashboards Excel prêts à l emploi pour freelances, solopreneurs et coachs.', isEnabled: true, order: 1 },
    { sectionKey: 'CATEGORIES', title: 'Explorez par thématique', subtitle: 'Des guides et ressources ciblés pour chaque étape de votre croissance.', isEnabled: true, order: 2 },
    { sectionKey: 'ARTICLES', title: 'Derniers articles du blog', subtitle: 'Des conseils pratiques sans langue de bois pour optimiser votre quotidien.', isEnabled: true, order: 3 },
    { sectionKey: 'RESOURCES', title: 'Ressources gratuites', subtitle: 'Téléchargez nos guides et checklists 100% offerts.', isEnabled: true, order: 4 },
    { sectionKey: 'PRODUCTS', title: 'Templates & Dashboards populaires', subtitle: 'Des outils de travail professionnels pour accélérer vos résultats.', isEnabled: true, order: 5 },
    { sectionKey: 'NEWSLETTER', title: 'Recevez nos meilleurs conseils chaque semaine', subtitle: 'Rejoignez +5 000 indépendants et recevez gratuitement nos nouveaux outils.', isEnabled: true, order: 6 },
  ];

  for (const sec of sections) {
    await prisma.homepageSection.upsert({
      where: { sectionKey: sec.sectionKey },
      update: sec,
      create: sec,
    });
  }

  // 11. Site Settings
  await prisma.siteSetting.upsert({
    where: { key: 'general' },
    update: {
      value: JSON.stringify({
        siteName: 'Solopreneur & Co',
        siteTagline: 'Plateforme de contenu & ressources digitales pour indépendants',
        contactEmail: 'hello@solopreneur.io',
        currency: 'EUR',
        currencySymbol: '€',
      }),
    },
    create: {
      key: 'general',
      value: JSON.stringify({
        siteName: 'Solopreneur & Co',
        siteTagline: 'Plateforme de contenu & ressources digitales pour indépendants',
        contactEmail: 'hello@solopreneur.io',
        currency: 'EUR',
        currencySymbol: '€',
      }),
    },
  });

  console.log('--- SEEDING COMPLETED SUCCESSFULLY ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
