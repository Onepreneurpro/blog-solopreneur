import { prisma } from './prisma';

const DEMO_PRODUCTS = [
  // ----------------------------------------------------
  // 1. DASHBOARDS EXCEL (fileType: 'EXCEL')
  // ----------------------------------------------------
  {
    categorySlug: 'excel',
    name: 'Excel Dashboard Trésorerie & Suivi de CA 2026',
    slug: 'excel-dashboard-tresorerie-suivi-ca-2026',
    shortDescription: 'Tableau de bord financier complet sur Excel pour anticiper vos revenus, taxes URSSAF et trésorerie à 12 mois.',
    longDescription: "Ce modèle Excel avancé vous permet de suivre votre chiffre d'affaires encaissement par encaissement, de calculer automatiquement vos cotisations sociales et d anticiper vos soldes de trésorerie mois par mois.",
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

  // ----------------------------------------------------
  // 2. TEMPLATES NOTION (fileType: 'TEMPLATE NOTION')
  // ----------------------------------------------------
  {
    categorySlug: 'notion',
    name: 'Notion Freelance OS — Second Cerveau Complete',
    slug: 'notion-freelance-os-second-cerveau-complete',
    shortDescription: 'Le système tout-en-un ultime dans Notion pour gérer vos projets, clients, factures et notes en un seul endroit.',
    longDescription: 'Un workspace Notion clé en main intégrant CRM prospects, gestionnaire de projets avec Kanban, suivi du temps et coffre-fort documentaire.',
    price: 49.00,
    compareAtPrice: 89.00,
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    fileType: 'TEMPLATE NOTION',
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
    fileType: 'TEMPLATE NOTION',
    isFreeResource: false,
    isFeatured: false,
  },
  {
    categorySlug: 'notion',
    name: 'Notion CRM Pro & Pipeline de Vente',
    slug: 'notion-crm-pro-pipeline-vente',
    shortDescription: "Ne perdez plus aucun prospect : suivez le cycle de décision de vos prospects et votre chiffre d'affaires prévisionnel.",
    longDescription: 'Tableau de bord Notion dédié au closing commercial avec vues Kanban, rappels de relances et fiches clients détaillées.',
    price: 35.00,
    compareAtPrice: 59.00,
    coverImage: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80',
    fileType: 'TEMPLATE NOTION',
    isFreeResource: false,
    isFeatured: false,
  },
  {
    categorySlug: 'notion',
    name: 'Notion Second Brain — Méthode PARA',
    slug: 'notion-second-brain-methode-para',
    shortDescription: 'Organisez votre vie et vos connaissances avec la méthode PARA (Projets, Domaines, Ressources, Archives).',
    longDescription: 'Centralisez toutes vos idées, notes de réunions et ressources web dans une structure épurée et hautement productive.',
    price: 45.00,
    compareAtPrice: 79.00,
    coverImage: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80',
    fileType: 'TEMPLATE NOTION',
    isFreeResource: false,
    isFeatured: true,
  },
  {
    categorySlug: 'notion',
    name: 'Notion Finance & Facturation Freelance',
    slug: 'notion-finance-facturation-freelance',
    shortDescription: "Suivi dynamique de votre chiffre d'affaires, des factures émises et prévision des cotisations URSSAF.",
    longDescription: 'Espace de gestion comptable simplifié sur Notion avec calcul automatique de TVA, relances d impayés et bilan annuel.',
    price: 29.00,
    compareAtPrice: 49.00,
    coverImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
    fileType: 'TEMPLATE NOTION',
    isFreeResource: false,
    isFeatured: false,
  },
  {
    categorySlug: 'notion',
    name: 'Notion Hub Prospection & Cold Emailing',
    slug: 'notion-hub-prospection-cold-emailing',
    shortDescription: 'Séquences de prospection B2B, modèles de messages de relance et suivi des taux de réponse.',
    longDescription: "Organisez votre prospection sortante avec un suivi par lead, des scripts de vente prêts à l'emploi et des statistiques.",
    price: 25.00,
    compareAtPrice: 45.00,
    coverImage: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=800&q=80',
    fileType: 'TEMPLATE NOTION',
    isFreeResource: false,
    isFeatured: false,
  },
  {
    categorySlug: 'notion',
    name: 'Notion Client Portal — Espace de Collaboration Client',
    slug: 'notion-client-portal-espace-collaboration-client',
    shortDescription: 'Portail privé professionnel pour partager livrables, briefs, factures et plannings avec vos clients.',
    longDescription: 'Impressionnez vos clients avec un espace de marque dédié, sécurisé et interactif pour chaque mission de prestation.',
    price: 35.00,
    compareAtPrice: 65.00,
    coverImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    fileType: 'TEMPLATE NOTION',
    isFreeResource: false,
    isFeatured: true,
  },
  {
    categorySlug: 'notion',
    name: 'Notion Habit & Goal Tracker Pro',
    slug: 'notion-habit-goal-tracker-pro',
    shortDescription: 'Suivez vos objectifs trimestriels OKR, habitudes quotidiennes et routines de performance.',
    longDescription: 'Un tableau de suivi des habitudes avec jauges de progression automatiques et bilans hebdomadaires de productivité.',
    price: 19.00,
    compareAtPrice: 35.00,
    coverImage: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=800&q=80',
    fileType: 'TEMPLATE NOTION',
    isFreeResource: false,
    isFeatured: false,
  },
  {
    categorySlug: 'notion',
    name: 'Notion Agency OS — Multi-Membres & Équipe',
    slug: 'notion-agency-os-multi-membres-equipe',
    shortDescription: 'Workspace collaboratif complet pour agences web, studios et collectifs de freelances.',
    longDescription: 'Gérez plusieurs collaborateurs, assignez des tâches, suivez les marges par projet et partagez une base de connaissances commune.',
    price: 69.00,
    compareAtPrice: 119.00,
    coverImage: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80',
    fileType: 'TEMPLATE NOTION',
    isFreeResource: false,
    isFeatured: true,
  },
  {
    categorySlug: 'notion',
    name: 'Notion Content Marketing & Social Media Calendar',
    slug: 'notion-content-marketing-social-media-calendar',
    shortDescription: 'Calendrier éditorial multi-plateforme avec modèles de posts, carrousels et scripts vidéo.',
    longDescription: 'Planifiez vos campagnes réseaux sociaux de A à Z avec un pipeline visuel de validation et de recyclage de contenu.',
    price: 27.00,
    compareAtPrice: 49.00,
    coverImage: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=800&q=80',
    fileType: 'TEMPLATE NOTION',
    isFreeResource: false,
    isFeatured: false,
  },
  {
    categorySlug: 'notion',
    name: 'Notion Knowledge Base & Wiki Entreprise',
    slug: 'notion-knowledge-base-wiki-entreprise',
    shortDescription: 'Centre de documentation interne, processus SOPs et guides d onboarding.',
    longDescription: 'Rassemblez les connaissances de votre entreprise dans un wiki structuré, recherchable et simple à maintenir à jour.',
    price: 32.00,
    compareAtPrice: 59.00,
    coverImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80',
    fileType: 'TEMPLATE NOTION',
    isFreeResource: false,
    isFeatured: false,
  },
  {
    categorySlug: 'notion',
    name: 'Notion Project Manager Agile & Scrum',
    slug: 'notion-project-manager-agile-scrum',
    shortDescription: 'Gestionnaire de projet moderne avec Sprints, Backlog de fonctionnalités et Roadmaps visuelles.',
    longDescription: 'Appliquez les méthodologies Agile dans Notion : gestion de sprints de 2 semaines, suivi de vélocité et retrospectives.',
    price: 39.00,
    compareAtPrice: 69.00,
    coverImage: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80',
    fileType: 'TEMPLATE NOTION',
    isFreeResource: false,
    isFeatured: false,
  },

  // ----------------------------------------------------
  // 3. TEMPLATES SIO (fileType: 'TEMPLATESIO')
  // ----------------------------------------------------
  {
    categorySlug: 'templates-sio',
    name: 'Systeme.io Tunnel de Vente Ebook High-Converting',
    slug: 'systeme-io-tunnel-vente-ebook-high-converting',
    shortDescription: 'Tunnel de vente clés en main à importer en 1 clic dans Systeme.io avec page d amorce, bon de commande et Thank You page.',
    longDescription: 'Importez directement dans votre compte Systeme.io un tunnel de vente professionnel responsive testé pour maximiser les ventes de vos produits digitaux.',
    price: 47.00,
    compareAtPrice: 87.00,
    coverImage: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?auto=format&fit=crop&w=800&q=80',
    fileType: 'TEMPLATESIO',
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
    fileType: 'TEMPLATESIO',
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
    fileType: 'TEMPLATESIO',
    isFreeResource: false,
    isFeatured: false,
  },
  {
    categorySlug: 'templates-sio',
    name: 'Systeme.io Tunnel Webinar Automatisé & Replay Evergreen',
    slug: 'systeme-io-tunnel-webinar-automatise-replay-evergreen',
    shortDescription: 'Tunnel complet pour vendre vos accompagnements ou formations avec inscription webinar et relances e-mails.',
    longDescription: 'Un entonnoir complet pour diffuser vos conférences en ligne en mode automatique, capturer les leads et déclencher les achats.',
    price: 59.00,
    compareAtPrice: 99.00,
    coverImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
    fileType: 'TEMPLATESIO',
    isFreeResource: false,
    isFeatured: true,
  },
  {
    categorySlug: 'templates-sio',
    name: 'Systeme.io Landing Page VSL (Video Sales Letter)',
    slug: 'systeme-io-landing-page-vsl-video-sales-letter',
    shortDescription: 'Page de vente vidéo haute conversion avec compte à rebours et blocs de preuves sociales intégrant Stripe.',
    longDescription: 'Template Systeme.io axé sur la démonstration vidéo pour présenter l impact de votre offre et générer des ventes directes.',
    price: 49.00,
    compareAtPrice: 89.00,
    coverImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
    fileType: 'TEMPLATESIO',
    isFreeResource: false,
    isFeatured: false,
  },
  {
    categorySlug: 'templates-sio',
    name: 'Systeme.io Tunnel de Lancement d Offre (Launch Funnel)',
    slug: 'systeme-io-tunnel-lancement-offre-launch-funnel',
    shortDescription: 'Séquence 4 vidéos de valeur + page d ouverture des ventes pour vos lancements d accompagnement.',
    longDescription: 'Entonnoir de lancement de produit basé sur la méthode de lancement orchestré avec page de pré-inscription et compte à rebours.',
    price: 67.00,
    compareAtPrice: 119.00,
    coverImage: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80',
    fileType: 'TEMPLATESIO',
    isFreeResource: false,
    isFeatured: true,
  },
  {
    categorySlug: 'templates-sio',
    name: 'Systeme.io Template Espace Membre VIP & Coaching Mastermind',
    slug: 'systeme-io-template-espace-membre-vip-coaching-mastermind',
    shortDescription: 'Design premium sombre et épuré avec calendrier de suivi et ressources partagées pour vos clients VIP.',
    longDescription: 'Offrez un portail haut de gamme à vos clients de coaching individuel ou de Mastermind avec fiches de synthèse et téléchargements.',
    price: 45.00,
    compareAtPrice: 79.00,
    coverImage: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
    fileType: 'TEMPLATESIO',
    isFreeResource: false,
    isFeatured: false,
  },
  {
    categorySlug: 'templates-sio',
    name: 'Systeme.io Tunnel de Prise de RDV Qualifiés (High-Ticket)',
    slug: 'systeme-io-tunnel-prise-rdv-qualifies-high-ticket',
    shortDescription: 'Page de candidature avec questionnaire de cadrage et intégration calendrier de réservation en ligne.',
    longDescription: 'Filtrez les prospects non qualifiés avant vos appels téléphoniques de clôture grâce à un formulaire dynamique.',
    price: 55.00,
    compareAtPrice: 95.00,
    coverImage: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=800&q=80',
    fileType: 'TEMPLATESIO',
    isFreeResource: false,
    isFeatured: true,
  },
  {
    categorySlug: 'templates-sio',
    name: 'Systeme.io Pack 10 Pages de Remerciement & Order Bumps',
    slug: 'systeme-io-pack-10-pages-remerciement-order-bumps',
    shortDescription: 'Pages Thank You et offres complémentaires post-achat pour faire grimper le panier moyen.',
    longDescription: 'Incitez vos clients à ajouter un second produit en 1 clic grâce à des boutons d upsell et des pages de confirmation claires.',
    price: 32.00,
    compareAtPrice: 59.00,
    coverImage: 'https://images.unsplash.com/photo-1556742049-0a674648c668?auto=format&fit=crop&w=800&q=80',
    fileType: 'TEMPLATESIO',
    isFreeResource: false,
    isFeatured: false,
  },
  {
    categorySlug: 'templates-sio',
    name: 'Systeme.io Template Newsletter & Emails de Relance Ventes',
    slug: 'systeme-io-template-newsletter-emails-relance-ventes',
    shortDescription: "Modèles de newsletters responsive et séquences d'emails de relance de panier abandonné.",
    longDescription: 'Pack de templates d e-mails HTML/Text à intégrer dans vos campagnes automatisées et newsletters hebdomadaires.',
    price: 27.00,
    compareAtPrice: 49.00,
    coverImage: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
    fileType: 'TEMPLATESIO',
    isFreeResource: false,
    isFeatured: false,
  },
  {
    categorySlug: 'templates-sio',
    name: 'Systeme.io Tunnel Challenge 5 Jours (Event Funnel)',
    slug: 'systeme-io-tunnel-challenge-5-jours-event-funnel',
    shortDescription: 'Structure complète pour organiser un défi gratuit 5 jours et convertir vos participants en formation payante.',
    longDescription: "Gérez l inscription, l accès aux replays quotidiens et l ouverture du panier final avec un tunnel événementiel prêt à l'emploi.",
    price: 49.00,
    compareAtPrice: 89.00,
    coverImage: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80',
    fileType: 'TEMPLATESIO',
    isFreeResource: false,
    isFeatured: false,
  },
  {
    categorySlug: 'templates-sio',
    name: 'Systeme.io Template Micro-SaaS & Vente de Logiciels',
    slug: 'systeme-io-template-micro-saas-vente-logiciels',
    shortDescription: 'Design moderne style tech SaaS avec tableau comparatif de tarifs et FAQ interactive.',
    longDescription: 'Présentez votre outil ou votre application web avec une page de vente au design épuré inspiré des meilleures startups tech.',
    price: 57.00,
    compareAtPrice: 99.00,
    coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    fileType: 'TEMPLATESIO',
    isFreeResource: false,
    isFeatured: true,
  },

  // ----------------------------------------------------
  // 4. RESSOURCES & GUIDES (fileType: 'PDF')
  // ----------------------------------------------------
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

  // ----------------------------------------------------
  // 5. OUTILS DE GESTION (fileType: 'WEB APP')
  // ----------------------------------------------------
  {
    categorySlug: 'outils-de-gestion',
    name: 'ERP Web App Solopreneur — Gestion globale d Activité & Projets',
    slug: 'erp-web-app-solopreneur-gestion-globale',
    shortDescription: 'ERP web complet pour freelances & agences : gestion des clients, projets, temps facturable, charges et rentabilité en temps réel.',
    longDescription: 'Un ERP en ligne puissant conçu spécifiquement pour les indépendants et petites agences. Suivez l avancement de vos contrats, gérez votre catalogue de prestations, attribuez du temps par mission et générez vos tableaux de bord de trésorerie automatiquement.',
    price: 69.00,
    compareAtPrice: 129.00,
    coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    fileType: 'WEB APP',
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
    fileType: 'WEB APP',
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
    fileType: 'WEB APP',
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
    fileType: 'WEB APP',
    isFreeResource: false,
    isFeatured: true,
  },
  {
    categorySlug: 'outils-de-gestion',
    name: 'Gestionnaire de Projets & Temps Facturable Web App',
    slug: 'gestionnaire-projets-temps-facturable-web-app',
    shortDescription: 'Timer en ligne, suivi du temps passé par client et rapport de facturation automatisé.',
    longDescription: 'Suivez le temps exact consacré à chaque client, définissez vos taux horaires par projet et exportez des rapports d activité détaillés.',
    price: 45.00,
    compareAtPrice: 79.00,
    coverImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
    fileType: 'WEB APP',
    isFreeResource: false,
    isFeatured: false,
  },
  {
    categorySlug: 'outils-de-gestion',
    name: 'Portail Client & Signature de Devis Web App',
    slug: 'portail-client-signature-devis-web-app',
    shortDescription: 'Envoi de propositions commerciales en ligne avec validation, signature électronique et paiement d acompte.',
    longDescription: 'Accélérez votre processus de vente avec des devis interactifs signables directement en ligne par vos clients.',
    price: 55.00,
    compareAtPrice: 95.00,
    coverImage: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
    fileType: 'WEB APP',
    isFreeResource: false,
    isFeatured: true,
  },
  {
    categorySlug: 'outils-de-gestion',
    name: 'Calculateur d Impôts & Cotisations Micro-Entreprise Web App',
    slug: 'calculateur-impots-cotisations-micro-entreprise-web-app',
    shortDescription: 'Simulation en temps réel de votre net après cotisations URSSAF et versement libératoire de l impôt.',
    longDescription: "Anticipez vos prélèvements fiscaux et sociaux selon votre chiffre d'affaires et votre secteur d activité (Acre, CFP, TVA).",
    price: 22.00,
    compareAtPrice: 39.00,
    coverImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
    fileType: 'WEB APP',
    isFreeResource: false,
    isFeatured: false,
  },
  {
    categorySlug: 'outils-de-gestion',
    name: 'Outil de Gestion des Notes de Frais & Reçus Web App',
    slug: 'outil-gestion-notes-de-frais-recus-web-app',
    shortDescription: 'Numérisation, extraction automatique et catégorisation de vos reçus et factures d achats.',
    longDescription: 'Garez tous vos reçus de frais professionnels et exportez des récapitulatifs mensuels prêts pour votre comptable.',
    price: 35.00,
    compareAtPrice: 59.00,
    coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    fileType: 'WEB APP',
    isFreeResource: false,
    isFeatured: false,
  },
  {
    categorySlug: 'outils-de-gestion',
    name: 'Gestionnaire de Rendez-vous & Prise de RDV Coachs Web App',
    slug: 'gestionnaire-rendez-vous-prise-rdv-coachs-web-app',
    shortDescription: 'Calendrier de réservation en ligne synchronisé avec rappels automatiques e-mail et SMS.',
    longDescription: 'Permettez à vos clients de réserver leurs créneaux de coaching en direct selon vos disponibilités avec paiement préalable.',
    price: 49.00,
    compareAtPrice: 89.00,
    coverImage: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=800&q=80',
    fileType: 'WEB APP',
    isFreeResource: false,
    isFeatured: true,
  },
  {
    categorySlug: 'outils-de-gestion',
    name: 'Dashboard Analytics & Suivi de KPI Solopreneur Web App',
    slug: 'dashboard-analytics-suivi-kpi-solopreneur-web-app',
    shortDescription: "Centralisez vos statistiques Stripe, Google Analytics, taux de conversion et chiffre d'affaires.",
    longDescription: "Visualisez la santé globale de votre activité d'indépendant grâce à des indicateurs clés de performance agrégés.",
    price: 39.00,
    compareAtPrice: 69.00,
    coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    fileType: 'WEB APP',
    isFreeResource: false,
    isFeatured: false,
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
      console.log(`Updated product: ${item.name} (${item.fileType})`);
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
      console.log(`Created product: ${item.name} (${item.fileType})`);
    }
  }

  // NOW FIX ALL EXISTING PRODUCTS IN DATABASE SO categoryId IS NEVER NULL AND fileType IS ACCURATE
  const excelCat = categories.find((c) => c.slug === 'excel')?.id || null;
  const notionCat = categories.find((c) => c.slug === 'notion')?.id || null;
  const sioCat = categories.find((c) => c.slug === 'templates-sio')?.id || null;
  const resCat = categories.find((c) => c.slug === 'ressources')?.id || null;
  const gestionCat = categories.find((c) => c.slug === 'outils-de-gestion')?.id || null;

  const allProducts = await prisma.product.findMany();
  for (const prod of allProducts) {
    let targetCatId: string | null = prod.categoryId || prod.productCategoryId;
    let targetFileType = prod.fileType;

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

    if (!targetFileType || targetFileType === 'ZIP') {
      if (targetCatId === notionCat || prod.name.toLowerCase().includes('notion')) {
        targetFileType = 'TEMPLATE NOTION';
      } else if (targetCatId === sioCat || prod.name.toLowerCase().includes('systeme') || prod.name.toLowerCase().includes('sio')) {
        targetFileType = 'TEMPLATESIO';
      } else if (targetCatId === excelCat || prod.name.toLowerCase().includes('excel')) {
        targetFileType = 'EXCEL';
      } else if (targetCatId === gestionCat || prod.name.toLowerCase().includes('web app') || prod.name.toLowerCase().includes('logiciel') || prod.name.toLowerCase().includes('erp') || prod.name.toLowerCase().includes('crm')) {
        targetFileType = 'WEB APP';
      } else if (targetCatId === resCat || prod.name.toLowerCase().includes('pdf') || prod.name.toLowerCase().includes('ebook')) {
        targetFileType = 'PDF';
      }
    }

    await prisma.product.update({
      where: { id: prod.id },
      data: {
        ...(targetCatId ? { categoryId: targetCatId, productCategoryId: targetCatId } : {}),
        fileType: targetFileType,
      },
    });
  }

  console.log('--- Demo Products Seeding Completed & Formats Updated! ---');
}

if (require.main === module) {
  seedDemoProducts()
    .catch((err) => console.error('Seeding error:', err))
    .finally(() => prisma.$disconnect());
}
