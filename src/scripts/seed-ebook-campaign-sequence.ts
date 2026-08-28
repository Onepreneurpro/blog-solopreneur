import { prisma } from '../lib/prisma';

async function seedEbookCampaign() {
  console.log('Seeding COMPAGNE EBOOK emails & sequence...');

  // 1. Find or create COMPAGNE EBOOK
  let campaign = await prisma.emailCampaign.findFirst({
    where: {
      OR: [
        { name: { contains: 'EBOOK' } },
        { name: { contains: 'eBook' } },
        { name: { contains: 'Ebook' } },
      ],
    },
  });

  if (!campaign) {
    const list = await prisma.leadList.findFirst({
      where: { sourceType: 'EBOOK_OPTIN' },
    });

    campaign = await prisma.emailCampaign.create({
      data: {
        name: 'COMPAGNE EBOOK',
        description: 'Séquence complète de bienvenue et de valeur pour les inscrits aux eBooks gratuits.',
        status: 'ACTIVE',
        ...(list ? { lists: { create: { listId: list.id } } } : {}),
      },
    });
  }

  // Clear existing sequence steps for clean seeding
  await prisma.emailSequenceStep.deleteMany({
    where: { campaignId: campaign.id },
  });

  console.log(`Campagne trouvée : "${campaign.name}" (${campaign.id})`);

  // 2. CREATE WELCOME EMAIL STEP #1 (Parent Step)
  const welcomeStep1 = await prisma.emailSequenceStep.create({
    data: {
      campaignId: campaign.id,
      stepOrder: 1,
      subject: '🎁 Votre eBook : 10 Habitudes d Organisation pour Solopreneurs',
      content: `Bonjour {prenom},\n\nFélicitations pour votre inscription ! Voici votre premier eBook offert : "10 Habitudes d Organisation pour Solopreneurs Indépendants".\n\nDans ce guide, vous allez découvrir comment structurer vos journées de freelance, éliminer les distractions et libérer jusqu à 10 heures par semaine.\n\nPrenez le temps d appliquer ces premières méthodes dès aujourd hui.\n\nÀ très vite pour la suite,\nL équipe Solopreneur&Co\n\n{desabonner}`,
      triggerType: 'IMMEDIATE',
      delayHours: 0,
      delayMinutes: 0,
      status: 'ACTIVE',
    },
  });

  // 3. CREATE SOUS-EMAIL 1.2 (Variant #1 for eBook Notion)
  await prisma.emailSequenceStep.create({
    data: {
      campaignId: campaign.id,
      stepOrder: 1,
      subject: '🎁 Votre eBook : Le Guide Ultime des Templates Notion pour Freelances',
      content: `Bonjour {prenom},\n\nMerci pour votre demande ! Voici votre eBook spécialisé : "Le Guide Ultime des Templates Notion pour Freelances".\n\nVous allez y découvrir comment centraliser tous vos projets, vos tâches et votre CRM client au même endroit dans un espace Notion épuré.\n\nTéléchargez le guide et commencez à structurer votre espace de travail dès maintenant !\n\nÀ très vite,\nL équipe Solopreneur&Co\n\n{desabonner}`,
      triggerType: 'IMMEDIATE',
      delayHours: 0,
      delayMinutes: 0,
      status: 'ACTIVE',
      parentId: welcomeStep1.id,
    },
  });

  // 4. CREATE SOUS-EMAIL 1.3 (Variant #2 for eBook Excel & TJM)
  await prisma.emailSequenceStep.create({
    data: {
      campaignId: campaign.id,
      stepOrder: 1,
      subject: '🎁 Votre eBook : Maîtriser son TJM & Tableau de Bord Excel Freelance',
      content: `Bonjour {prenom},\n\nMerci pour votre inscription ! Voici votre eBook gratuit : "Maîtriser son TJM & Tableau de Bord Excel Freelance".\n\nDécouvrez comment calculer votre Tarif Jour Moyen effectif, anticiper vos charges et piloter votre trésorerie au centime près sans stress.\n\nBonne lecture et excellent pilotage !\n\nL équipe Solopreneur&Co\n\n{desabonner}`,
      triggerType: 'IMMEDIATE',
      delayHours: 0,
      delayMinutes: 0,
      status: 'ACTIVE',
      parentId: welcomeStep1.id,
    },
  });

  console.log('✅ 3 Sous-emails de bienvenue créés pour l Email #1 !');

  // 5. CREATE 15 SEQUENCE EMAILS (Steps #2 to #16, spaced by 1 minute each)
  const sequenceData = [
    {
      order: 2,
      subject: '💡 Pourquoi 90% des freelances perdent 10h par semaine (et la solution)',
      content: `Bonjour {prenom},\n\nLa majorité des freelances passent des heures à chercher des fichiers, à saisir des données en double et à gérer l administratif à la main.\n\nLa clé pour décoller n est pas de travailler plus, mais d automatiser votre organisation.\n\nSur Solopreneur&Co, nous avons conçu des templates Notion et Excel gratuits spécialement pensés pour résoudre ce problème.\n\nRestez attentif, je vais vous partager nos meilleures ressources !\n\nÀ très vite,\nL équipe Solopreneur&Co\n\n{desabonner}`,
    },
    {
      order: 3,
      subject: '📊 Comment piloter ta trésorerie sans être un expert en comptabilité',
      content: `Bonjour {prenom},\n\nSavez-vous exactement combien il vous reste à encaisser ce mois-ci ?\n\nAvoir de la visibilité sur sa trésorerie est le secret numéro 1 pour travailler sereinement. Avec notre Dashboard Excel Freelance, vous pouvez suivre vos revenus mensuels, vos factures en attente et vos prévisions d impôts en un coup d œil.\n\nProfitez de nos ressources gratuites sur le site pour télécharger votre modèle Excel !\n\nL équipe Solopreneur&Co\n\n{desabonner}`,
    },
    {
      order: 4,
      subject: '🧠 Ton Second Cerveau sur Notion : Organise tous tes projets clients',
      content: `Bonjour {prenom},\n\nArrêtez de stocker vos idées, briefs clients et todos dans 5 carnets différents.\n\nLa méthode du Second Cerveau sur Notion vous permet d avoir un hub unique pour vos clients, vos livrables et vos objectifs annuels.\n\nRetrouvez nos templates Notion pré-configurés sur la plateforme !\n\nÀ bientôt,\nL équipe Solopreneur&Co\n\n{desabonner}`,
    },
    {
      order: 5,
      subject: '⚡ Calculer et doubler ton TJM avec la méthode du Tarif Horaire Effectif',
      content: `Bonjour {prenom},\n\nSi vous facturez 300€ la journée mais que vous passez 4 heures non facturées sur l administratif, votre TJM réel est de seulement 150€ !\n\nPour augmenter vos revenus, vous devez automatiser la gestion administrative et valoriser chaque heure de travail.\n\nNotre calculateur Excel gratuit vous aide à définir votre TJM cible idéal.\n\nBonne découverte,\nL équipe Solopreneur&Co\n\n{desabonner}`,
    },
    {
      order: 6,
      subject: '📂 Les 5 Templates Notion Gratuits indispensables pour ton activité',
      content: `Bonjour {prenom},\n\nVoici notre sélection des 5 templates Notion essentiels pour les freelances :\n1. Le Dashboard Général Solopreneur\n2. Le CRM de Suivi des Prospects\n3. Le Gérant de Projets & Tâches\n4. Le Planning Éditorial de Contenu\n5. La Bibliothèque de Ressources IA\n\nAccédez directement à la section Ressources Gratuites de notre site pour les dupliquer en 1 clic !\n\nÀ très vite,\nL équipe Solopreneur&Co\n\n{desabonner}`,
    },
    {
      order: 7,
      subject: '📈 Suivre ton chiffre d affaires freelance mois par mois (Template Excel)',
      content: `Bonjour {prenom},\n\nUn bon suivi comptable vous évite les mauvaises surprises en fin d année.\n\nGrâce à nos tableaux de bord Excel automatisés, suivez vos courbes de croissance, comparez vos mois et visualisez immédiatement l atteinte de votre chiffre d affaires objectif.\n\nConsultez nos Dashboards Excel disponibles sur le site !\n\nL équipe Solopreneur&Co\n\n{desabonner}`,
    },
    {
      order: 8,
      subject: '🎯 La règle des 3 priorités quotidiennes pour exploser ta productivité',
      content: `Bonjour {prenom},\n\nChaque matin, identifiez les 3 seules tâches à forte valeur ajoutée qui feront avancer votre activité.\n\nIntégrez cette habitude dans votre tableau de bord Notion pour ne plus jamais vous disperser au milieu de la journée.\n\nSimplifiez votre quotidien dès aujourd hui !\n\nL équipe Solopreneur&Co\n\n{desabonner}`,
    },
    {
      order: 9,
      subject: '💼 Créer un CRM Client Ultime sur Notion (Fini les prospects oubliés)',
      content: `Bonjour {prenom},\n\nCombien de prospects avez-vous relancés cette semaine ?\n\nUn CRM bien structuré sur Notion vous permet de suivre l état de chaque opportunité commerciale : du premier contact au devis signé et à la relance de règlement.\n\nDécouvrez nos modèles CRM sur le site !\n\nÀ bientôt,\nL équipe Solopreneur&Co\n\n{desabonner}`,
    },
    {
      order: 10,
      subject: '💸 Éviter les impayés et les retards de paiement (Checklist & Excel)',
      content: `Bonjour {prenom},\n\nLes retards de paiement sont le fléau des solopreneurs. Pour y remédier, mettez en place un processus de relance automatique à J+7 et J+15.\n\nNotre modèle Excel de suivi des factures vous alerte automatiquement dès qu un règlement dépasse l échéance.\n\nProtégez votre trésorerie dès maintenant !\n\nL équipe Solopreneur&Co\n\n{desabonner}`,
    },
    {
      order: 11,
      subject: '🤖 Automatiser 50% de tes tâches administratives avec l IA',
      content: `Bonjour {prenom},\n\nL Intelligence Artificielle combinée à vos espaces Notion vous permet de rédiger vos propositions commerciales, synthétiser vos réunions et générer vos idées de contenu en quelques secondes.\n\nProfitez de nos guides et templates optimisés IA sur le site Solopreneur&Co !\n\nÀ très vite,\nL équipe Solopreneur&Co\n\n{desabonner}`,
    },
    {
      order: 12,
      subject: '📑 Le modèle de devis et facture qui convertit tes prospects',
      content: `Bonjour {prenom},\n\nUn devis clair, professionnel et bien présenté rassure vos clients et accélère la signature.\n\nDécouvrez nos modèles de documents administratifs et nos outils d organisation pour solopreneurs sur notre plateforme.\n\nBonne structuration,\nL équipe Solopreneur&Co\n\n{desabonner}`,
    },
    {
      order: 13,
      subject: '🚀 3 Hacks Notion méconnus pour gagner 2 heures par jour',
      content: `Bonjour {prenom},\n\nUtilisez-vous les vues filtrées liées et les boutons d automatisation sur Notion ?\n\nCes fonctionnalités vous permettent de créer des tâches récurrentes en 1 clic et d afficher uniquement ce dont vous avez besoin au moment précis.\n\nRetrouvez nos espaces Notion pré-configurés sur le site !\n\nÀ bientôt,\nL équipe Solopreneur&Co\n\n{desabonner}`,
    },
    {
      order: 14,
      subject: '🎁 Récapitulatif : Télécharge tous nos Dashboards & Templates Gratuits',
      content: `Bonjour {prenom},\n\nVoici un récapitulatif de toutes les ressources gratuites mises à votre disposition sur Solopreneur&Co :\n- Dashboards Excel de gestion de trésorerie & TJM\n- Templates Notion de gestion de projets & CRM\n- Ebooks et guides d organisation solopreneur\n\nRendez-vous sur notre site pour télécharger tous vos outils !\n\nL équipe Solopreneur&Co\n\n{desabonner}`,
    },
    {
      order: 15,
      subject: '🔥 Passer au niveau supérieur : Le Pack All-in-One Solopreneur 2026',
      content: `Bonjour {prenom},\n\nSi vous souhaitez gagner du temps et obtenir un système clé en main complet, découvrez notre Boutique de Templates Notion et Dashboards Excel professionnels.\n\nAccédez à nos systèmes complets conçus pour faire décoller votre activité solopreneur !\n\nÀ très vite sur la boutique,\nL équipe Solopreneur&Co\n\n{desabonner}`,
    },
    {
      order: 16,
      subject: '✨ Ma promesse : Construire ton entreprise d un homme/femme libre',
      content: `Bonjour {prenom},\n\nLe but d être solopreneur n est pas d échanger tout son temps contre de l argent, mais d bâtir un système au service de sa liberté.\n\nEn utilisant les bons outils de productivité, Notion et Excel, vous reprenez le contrôle de votre temps et de votre chiffre d affaires.\n\nMerci de faire partie de la communauté Solopreneur&Co !\n\nÀ très bientôt,\nL équipe Solopreneur&Co\n\n{desabonner}`,
    },
  ];

  for (const item of sequenceData) {
    await prisma.emailSequenceStep.create({
      data: {
        campaignId: campaign.id,
        stepOrder: item.order,
        subject: item.subject,
        content: item.content,
        triggerType: 'DELAYED',
        delayHours: 0,
        delayMinutes: 1,
        status: 'ACTIVE',
      },
    });
  }

  console.log('✅ 15 Emails de séquence (espacés de 1 minute) créés avec succès !');
}

seedEbookCampaign()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
