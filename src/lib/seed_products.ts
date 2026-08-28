import { prisma } from './prisma';

const DEMO_PRODUCTS = [
  // 1. DASHBOARDS EXCEL
  {
    categorySlug: 'excel',
    name: 'Excel Dashboard Trésorerie & Suivi de CA 2026',
    slug: 'excel-dashboard-tresorerie-suivi-ca-2026',
    shortDescription: 'Tableau de bord financier complet sur Excel pour anticiper vos revenus, taxes URSSAF et trésorerie à 12 mois.',
    longDescription: 'Ce modèle Excel avancé vous permet de suivre votre chiffre d affaires encaissement par encaissement, de calculer automatiquement vos cotisations sociales et d anticiper vos soldes de trésorerie mois par mois.',
    price: 39.00,
    compareAtPrice: 69.00,
    coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    fileType: 'EXCEL',
    isFreeResource: false,
    isFeatured: true,
  },
  {
    categorySlug: 'excel',
    name: 'Excel Budget Personnel & Règle 50/30/20',
    slug: 'excel-budget-personnel-regle-50-30-20',
    shortDescription: 'Modèle automatique pour catégoriser vos dépenses, suivre votre épargne et appliquer la méthode 50/30/20.',
    longDescription: 'Prenez le contrôle de vos finances personnelles avec un tableau synthétique et visuel. Intègre la répartition automatique Besoins, Envies et Épargne.',
    price: 19.00,
    compareAtPrice: 35.00,
    coverImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
    fileType: 'EXCEL',
    isFreeResource: false,
    isFeatured: false,
  },
  {
    categorySlug: 'excel',
    name: 'Excel Business Plan & Prévisionnel 3 Ans',
    slug: 'excel-business-plan-previsionnel-3-ans',
    shortDescription: 'Le modèle financier indispensable pour banques et investisseurs avec compte de résultat prévisionnel.',
    longDescription: 'Modèle financier complet sur 36 mois incluant plan de financement, BFR, compte de résultat et seuil de rentabilité.',
    price: 59.00,
    compareAtPrice: 99.00,
    coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    fileType: 'EXCEL',
    isFreeResource: false,
    isFeatured: true,
  },

  // 2. TEMPLATES NOTION
  {
    categorySlug: 'notion',
    name: 'Notion Freelance OS — Second Cerveau Complete',
    slug: 'notion-freelance-os-second-cerveau-complete',
    shortDescription: 'Le système tout-en-un ultime dans Notion pour gérer vos projets, clients, factures et notes en un seul endroit.',
    longDescription: 'Un workspace Notion clé en main intégrant CRM prospects, gestionnaire de projets avec Kanban, suivi du temps et coffre-fort documentaire.',
    price: 49.00,
    compareAtPrice: 89.00,
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    fileType: 'NOTION',
    isFreeResource: false,
    isFeatured: true,
  },
  {
    categorySlug: 'notion',
    name: 'Notion Creator OS — Système de Création de Contenu',
    slug: 'notion-creator-os-systeme-creation-contenu',
    shortDescription: 'Planifiez, rédigez et suivez vos publications sur LinkedIn, YouTube et votre Blog avec un pipeline fluide.',
    longDescription: 'Optimisez votre production de contenu avec un calendrier éditorial dynamique, une banque d idées et un suivi des métriques d engagement.',
    price: 29.00,
    compareAtPrice: 49.00,
    coverImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
    fileType: 'NOTION',
    isFreeResource: false,
    isFeatured: false,
  },
  {
    categorySlug: 'notion',
    name: 'Notion CRM Pro & Pipeline de Vente',
    slug: 'notion-crm-pro-pipeline-vente',
    shortDescription: 'Ne perdez plus aucun prospect : suivez le cycle de décision de vos prospects et votre chiffre d affaires prévisionnel.',
    longDescription: 'Tableau de bord Notion dédié au closing commercial avec vues Kanban, rappels de relances et fiches clients détaillées.',
    price: 35.00,
    compareAtPrice: 59.00,
    coverImage: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80',
    fileType: 'NOTION',
    isFreeResource: false,
    isFeatured: false,
  },

  // 3. TEMPLATES SIO (SYSTEME.IO)
  {
    categorySlug: 'templates-sio',
    name: 'Systeme.io Tunnel de Vente Ebook High-Converting',
    slug: 'systeme-io-tunnel-vente-ebook-high-converting',
    shortDescription: 'Tunnel de vente clés en main à importer en 1 clic dans Systeme.io avec page d amorce, bon de commande et Thank You page.',
    longDescription: 'Importez directement dans votre compte Systeme.io un tunnel de vente professionnel responsive testé pour maximiser les ventes de vos produits digitaux.',
    price: 47.00,
    compareAtPrice: 87.00,
    coverImage: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?auto=format&fit=crop&w=800&q=80',
    fileType: 'ZIP',
    isFreeResource: false,
    isFeatured: true,
  },
  {
    categorySlug: 'templates-sio',
    name: 'Systeme.io Template Espace Membre Formation',
    slug: 'systeme-io-template-espace-membre-formation',
    shortDescription: 'Proposez une expérience d apprentissage haut de gamme à vos élèves avec ce design fluide et moderne.',
    longDescription: 'Un thème d espace membre Systeme.io épuré et moderne avec navigation par modules et barres de progression d apprentissage.',
    price: 37.00,
    compareAtPrice: 65.00,
    coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    fileType: 'ZIP',
    isFreeResource: false,
    isFeatured: false,
  },
  {
    categorySlug: 'templates-sio',
    name: 'Systeme.io Pack 5 Tunnels de Capture Lead Gen',
    slug: 'systeme-io-pack-5-tunnels-capture-lead-gen',
    shortDescription: '5 pages de capture optimisées pour maximiser le taux de conversion de vos visiteurs en abonnés qualifiés.',
    longDescription: 'Pack de 5 designs de landing pages de capture d e-mail prêtes à l emploi pour vos e-books, webinaires et newsletters.',
    price: 29.00,
    compareAtPrice: 49.00,
    coverImage: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=800&q=80',
    fileType: 'ZIP',
    isFreeResource: false,
    isFeatured: false,
  },

  // 4. RESSOURCES & GUIDES
  {
    categorySlug: 'ressources',
    name: 'Ebook : Négocier et Doubler son TJM Freelance',
    slug: 'ebook-negocier-doubler-tjm-freelance',
    shortDescription: 'Le guide complet de 45 pages pour justifier vos tarifs premium auprès des clients grands comptes.',
    longDescription: 'Découvrez la méthode étape par étape pour valoriser votre expertise, justifier un TJM plus élevé et convaincre vos clients sans friction.',
    price: 0.00,
    compareAtPrice: 29.00,
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    fileType: 'PDF',
    isFreeResource: true,
    isFeatured: true,
  },
  {
    categorySlug: 'ressources',
    name: 'Checklist Clôture d Exercice & Déclaration Micro-Entreprise',
    slug: 'checklist-cloture-exercice-declaration-micro-entreprise',
    shortDescription: 'La feuille de route pas-à-pas pour déclarer vos revenus et valider vos trimestres de retraite sans erreur.',
    longDescription: 'Guide pratique PDF et checklist interactive pour réaliser vos déclarations URSSAF et fiscales en toute sérénité.',
    price: 0.00,
    compareAtPrice: 19.00,
    coverImage: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
    fileType: 'PDF',
    isFreeResource: true,
    isFeatured: false,
  },

  // 5. OUTILS DE GESTION (WEB APPS)
  {
    categorySlug: 'outils-de-gestion',
    name: 'ERP Web App Solopreneur — Gestion globale d Activité & Projets',
    slug: 'erp-web-app-solopreneur-gestion-globale',
    shortDescription: 'ERP web complet pour freelances & agences : gestion des clients, projets, temps facturable, charges et rentabilité en temps réel.',
    longDescription: 'Un ERP en ligne puissant conçu spécifiquement pour les indépendants et petites agences. Suivez l avancement de vos contrats, gérez votre catalogue de prestations, attribuez du temps par mission et générez vos tableaux de bord de trésorerie automatiquement.',
    price: 69.00,
    compareAtPrice: 129.00,
    coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    fileType: 'ZIP',
    isFreeResource: false,
    isFeatured: true,
  },
  {
    categorySlug: 'outils-de-gestion',
    name: 'CRM Web App Coachs & Formateurs — Suivi Élèves & Ventes',
    slug: 'crm-web-app-coachs-formateurs-suivi-eleves',
    shortDescription: 'CRM dédié aux coachs, consultants et formateurs : pipeline d accompagnement, réservation de sessions et suivi des élèves.',
    longDescription: 'Centralisez vos prospects, vos apprenants et vos sessions de coaching. Suivez les étapes de votre funnel, automatisez la prise de rendez-vous et gardez un historique détaillé de chaque accompagnement individuel ou de groupe.',
    price: 59.00,
    compareAtPrice: 99.00,
    coverImage: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80',
    fileType: 'ZIP',
    isFreeResource: false,
    isFeatured: true,
  },
  {
    categorySlug: 'outils-de-gestion',
    name: 'Gestion de Stocks & Équipements Web App',
    slug: 'gestion-de-stocks-equipements-web-app',
    shortDescription: 'Application de gestion des stocks, matériel informatique, produits physiques et fournitures avec alerte de seuil critique.',
    longDescription: 'Pilotez vos inventaires sans prise de tête : entrées/sorties de marchandises, suivi du matériel confié aux prestataires, alertes automatiques de réapprovisionnement et valorisation financière de votre stock.',
    price: 49.00,
    compareAtPrice: 89.00,
    coverImage: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
    fileType: 'ZIP',
    isFreeResource: false,
    isFeatured: false,
  },
  {
    categorySlug: 'outils-de-gestion',
    name: 'Logiciel Facturation & Abonnements pour Freelances & Formateurs',
    slug: 'logiciel-facturation-abonnements-freelances-formateurs',
    shortDescription: 'Système de facturation conforme, devis en 1 clic et gestion des paiements récurrents/abonnements pour coachs et indépendants.',
    longDescription: 'Générez des factures légales avec mentions URSSAF/TVA, envoyez vos devis avec signature électronique et gérez les prélèvements récurrents de vos coachings ou accès de formation.',
    price: 39.00,
    compareAtPrice: 79.00,
    coverImage: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=800&q=80',
    fileType: 'ZIP',
    isFreeResource: false,
    isFeatured: true,
  },
  {
    categorySlug: 'outils-de-gestion',
    name: 'Kit Facturation & Relance Automatisee',
    slug: 'kit-facturation-relance-automatisee',
    shortDescription: 'Générez des factures professionnelles conformes et automatisez les relances en cas de retard de paiement.',
    longDescription: 'Outil de gestion de factures complet incluant modèles légaux, suivi des retards de paiement et modèles d e-mails de relance graduelle.',
    price: 29.00,
    compareAtPrice: 49.00,
    coverImage: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=800&q=80',
    fileType: 'EXCEL',
    isFreeResource: false,
    isFeatured: false,
  },
  {
    categorySlug: 'outils-de-gestion',
    name: 'Calculateur de TJM & Rentabilité Solopreneur',
    slug: 'calculateur-tjm-rentabilite-solopreneur',
    shortDescription: 'Calculez votre tarif journalier cible en intégrant vos charges, congés payés et objectifs de revenus nets.',
    longDescription: 'Déterminez le juste prix de vos prestations en fonction de votre temps facturable réel et de vos objectifs de rémunération nette.',
    price: 15.00,
    compareAtPrice: 29.00,
    coverImage: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=800&q=80',
    fileType: 'EXCEL',
    isFreeResource: false,
    isFeatured: false,
  },
];

export async function seedDemoProducts() {
  console.log('--- Starting Demo Products Seeding ---');

  // Fetch existing categories
  const categories = await prisma.productCategory.findMany();
  const categoryMap = new Map<string, string>();
  categories.forEach((cat) => {
    categoryMap.set(cat.slug, cat.id);
  });

  for (const item of DEMO_PRODUCTS) {
    let categoryId = categoryMap.get(item.categorySlug);

    // If category slug doesn't match exactly, find by partial match or fallback to first
    if (!categoryId) {
      const matchCat = categories.find(c => c.slug.includes(item.categorySlug) || item.categorySlug.includes(c.slug));
      if (matchCat) {
        categoryId = matchCat.id;
      } else if (categories.length > 0) {
        categoryId = categories[0].id;
      }
    }

    if (!categoryId) {
      console.log(`Skipping product ${item.name}: No category found.`);
      continue;
    }

    // Upsert product by slug setting BOTH categoryId and productCategoryId
    const existing = await prisma.product.findUnique({ where: { slug: item.slug } });
    if (existing) {
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          name: item.name,
          shortDescription: item.shortDescription,
          longDescription: item.longDescription,
          price: item.price,
          compareAtPrice: item.compareAtPrice,
          coverImage: item.coverImage,
          fileType: item.fileType,
          isFreeResource: item.isFreeResource,
          isFeatured: item.isFeatured,
          categoryId: categoryId,
          productCategoryId: categoryId,
          status: 'PUBLISHED',
        },
      });
      console.log(`Updated product: ${item.name}`);
    } else {
      await prisma.product.create({
        data: {
          name: item.name,
          slug: item.slug,
          shortDescription: item.shortDescription,
          longDescription: item.longDescription,
          price: item.price,
          compareAtPrice: item.compareAtPrice,
          coverImage: item.coverImage,
          fileType: item.fileType,
          isFreeResource: item.isFreeResource,
          isFeatured: item.isFeatured,
          categoryId: categoryId,
          productCategoryId: categoryId,
          status: 'PUBLISHED',
        },
      });
      console.log(`Created product: ${item.name}`);
    }
  }

  // NOW FIX ALL EXISTING PRODUCTS IN DATABASE SO categoryId IS NEVER NULL
  const excelCat = categories.find((c) => c.slug === 'excel')?.id || null;
  const notionCat = categories.find((c) => c.slug === 'notion')?.id || null;
  const sioCat = categories.find((c) => c.slug === 'templates-sio')?.id || null;
  const resCat = categories.find((c) => c.slug === 'ressources')?.id || null;
  const gestionCat = categories.find((c) => c.slug === 'outils-de-gestion')?.id || null;

  const allProducts = await prisma.product.findMany();
  for (const prod of allProducts) {
    let targetCatId: string | null = prod.categoryId || prod.productCategoryId;

    if (!targetCatId) {
      const lowerName = prod.name.toLowerCase();
      if (lowerName.includes('excel') || lowerName.includes('budget') || lowerName.includes('trésorerie') || lowerName.includes('devis') || lowerName.includes('frais') || lowerName.includes('marge') || lowerName.includes('dépenses')) {
        targetCatId = excelCat;
      } else if (lowerName.includes('notion')) {
        targetCatId = notionCat;
      } else if (lowerName.includes('systeme') || lowerName.includes('sio') || lowerName.includes('tunnel')) {
        targetCatId = sioCat;
      } else if (lowerName.includes('guide') || lowerName.includes('ebook') || lowerName.includes('checklist') || lowerName.includes('fiche') || lowerName.includes('cheat') || lowerName.includes('modèle')) {
        targetCatId = resCat;
      } else {
        targetCatId = gestionCat || excelCat;
      }
    }

    if (targetCatId) {
      await prisma.product.update({
        where: { id: prod.id },
        data: {
          categoryId: targetCatId,
          productCategoryId: targetCatId,
        },
      });
    }
  }

  console.log('--- Demo Products Seeding Completed & Category IDs Fixed! ---');
}

if (require.main === module) {
  seedDemoProducts()
    .catch((err) => console.error('Seeding error:', err))
    .finally(() => prisma.$disconnect());
}
