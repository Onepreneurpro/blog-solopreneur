import { prisma } from '../lib/prisma';

async function seedResourcesCampaign() {
  console.log('🚀 Seeding COMPAGNE RESSOURCES emails, 3 sub-emails & sequence...');

  // 1. Fetch all free resources from DB
  const freeResources = await prisma.product.findMany({
    where: { isFreeResource: true },
    orderBy: { createdAt: 'desc' },
  });

  console.log(`📌 Found ${freeResources.length} free resources in DB.`);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // Helper to build resource link URL
  const getResourceUrl = (resId?: string) => {
    if (resId) return `${baseUrl}/checkout?productId=${resId}`;
    return `${baseUrl}/ressources`;
  };

  // Helper link generator for HTML emails
  const makeLink = (text: string, resId?: string) => {
    const url = getResourceUrl(resId);
    return `<a href="${url}" style="color: #a3e635; font-weight: 800; text-decoration: underline;" target="_blank">${text}</a>`;
  };

  // 2. Find or create LeadList for FREE_RESOURCE
  let list = await prisma.leadList.findFirst({
    where: { sourceType: 'FREE_RESOURCE' },
  });

  if (!list) {
    list = await prisma.leadList.create({
      data: {
        name: 'Ressources Gratuites',
        slug: 'ressources-gratuites',
        description: 'Liste des membres ayant souscrit aux ressources gratuites du site',
        sourceType: 'FREE_RESOURCE',
        color: '#a3e635',
      },
    });
  }

  // 3. Find or create COMPAGNE RESSOURCES
  let campaign = await prisma.emailCampaign.findFirst({
    where: {
      OR: [
        { name: { contains: 'COMPAGNE RESSOURCES' } },
        { name: { contains: 'RESSOURCES' } },
        { name: { contains: 'Ressources' } },
      ],
    },
  });

  if (!campaign) {
    campaign = await prisma.emailCampaign.create({
      data: {
        name: 'COMPAGNE RESSOURCES',
        description: 'Séquence automatique de bienvenue (5 emails + 3 sous-emails variantes) et de valeur (15 emails) avec liens directs vers nos ressources gratuites.',
        status: 'ACTIVE',
        lists: {
          create: {
            listId: list.id,
          },
        },
      },
    });
  } else {
    // Ensure list connection exists
    const existingLink = await prisma.campaignLeadList.findUnique({
      where: {
        campaignId_listId: {
          campaignId: campaign.id,
          listId: list.id,
        },
      },
    });
    if (!existingLink) {
      await prisma.campaignLeadList.create({
        data: {
          campaignId: campaign.id,
          listId: list.id,
        },
      }).catch(() => {});
    }
  }

  console.log(`🎯 Target Campaign: "${campaign.name}" (${campaign.id})`);

  // Clear existing sequence steps for clean seeding
  await prisma.emailSequenceStep.deleteMany({
    where: { campaignId: campaign.id },
  });

  // Sample Resource References
  const r0 = freeResources[0]?.id;
  const r0Name = freeResources[0]?.name || 'Plan d action Prospection B2B';
  
  const r1 = freeResources[1]?.id || r0;
  const r1Name = freeResources[1]?.name || 'Calculateur de TJM & Tableau Excel';
  
  const r2 = freeResources[2]?.id || r0;
  const r2Name = freeResources[2]?.name || 'Template Notion PARA & CRM Client';

  // -------------------------------------------------------------
  // PART 1: WELCOME EMAIL #1 (PARENT STEP)
  // -------------------------------------------------------------
  const welcomeStep1 = await prisma.emailSequenceStep.create({
    data: {
      campaignId: campaign.id,
      stepOrder: 1,
      subject: '🎁 [Bienvenue 1/5] Bienvenue sur Solopreneur&Co ! Voici vos accès instantanés',
      content: `Bonjour {prenom},

Bienvenue au sein de la communauté Solopreneur&Co !

Nous sommes ravis de vous compter parmi nos membres. Notre mission est simple : vous fournir les meilleures méthodes, modèles Notion et calculateurs Excel pour structurer votre activité et booster vos revenus.

Pour commencer dès maintenant, vous pouvez accéder directement à notre catalogue complet de ressources gratuites :
👉 ${makeLink('Accéder à la bibliothèque de ressources gratuites', r0)}

Dans les prochains jours, vous recevrez également nos meilleurs conseils pratiques pour optimiser votre quotidien de freelance.

Excellente découverte,
L équipe Solopreneur&Co

{desabonner}`,
      triggerType: 'IMMEDIATE',
      delayHours: 0,
      delayMinutes: 0,
      status: 'ACTIVE',
    },
  });

  console.log('✅ Welcome Step #1 created (Parent Step)');

  // -------------------------------------------------------------
  // PART 2: 3 SOUS-EMAILS (VARIANTS LINKED TO STEP #1)
  // -------------------------------------------------------------
  const subEmail1 = await prisma.emailSequenceStep.create({
    data: {
      campaignId: campaign.id,
      stepOrder: 1,
      subject: '🎁 [Sous-Email 1.1] Variante Prospection B2B : Votre Guide de Démarrage',
      content: `Bonjour {prenom},

Voici votre sous-email spécifique dédié à la prospection B2B !

Si votre priorité actuelle est d acquérir de nouveaux clients sans démarchage agressif, nous avons préparé ce guide spécial :
👉 ${makeLink(`Accéder à : ${r0Name}`, r0)}

Découvrez comment identifier vos cibles idéales, rédiger des messages d approche percutants et conclure vos échanges.

À très vite,
L équipe Solopreneur&Co

{desabonner}`,
      triggerType: 'IMMEDIATE',
      delayHours: 0,
      delayMinutes: 0,
      status: 'ACTIVE',
      parentId: welcomeStep1.id,
    },
  });

  const subEmail2 = await prisma.emailSequenceStep.create({
    data: {
      campaignId: campaign.id,
      stepOrder: 1,
      subject: '📊 [Sous-Email 1.2] Variante Finance & TJM : Votre Calculateur Excel',
      content: `Bonjour {prenom},

Voici votre sous-email spécifique dédié à la rentabilité et au TJM !

Pour vous assurer que vos tarifs couvrent l ensemble de vos charges et dégagent un revenu confortable, téléchargez notre calculateur :
👉 ${makeLink(`Accéder à : ${r1Name}`, r1)}

Estimez votre Tarif Jour Moyen au centime près et pilotez votre trésorerie avec sérénité.

Bon calcul,
L équipe Solopreneur&Co

{desabonner}`,
      triggerType: 'IMMEDIATE',
      delayHours: 0,
      delayMinutes: 0,
      status: 'ACTIVE',
      parentId: welcomeStep1.id,
    },
  });

  const subEmail3 = await prisma.emailSequenceStep.create({
    data: {
      campaignId: campaign.id,
      stepOrder: 1,
      subject: '⚡ [Sous-Email 1.3] Variante Organisation : Votre Workspace Notion',
      content: `Bonjour {prenom},

Voici votre sous-email spécifique dédié à l organisation et à la productivité !

Pour regrouper tous vos projets clients, vos tâches et vos notes au même endroit, dupliquez notre modèle complet :
👉 ${makeLink(`Accéder à : ${r2Name}`, r2)}

Un espace unique pour libérer votre esprit et travailler avec efficacité.

À votre succès,
L équipe Solopreneur&Co

{desabonner}`,
      triggerType: 'IMMEDIATE',
      delayHours: 0,
      delayMinutes: 0,
      status: 'ACTIVE',
      parentId: welcomeStep1.id,
    },
  });

  console.log('✅ 3 Sous-emails (Variantes 1.1, 1.2, 1.3) rattachés avec succès à l Étape #1 !');

  // -------------------------------------------------------------
  // PART 3: WELCOME EMAILS 2 TO 5
  // -------------------------------------------------------------
  const remainingWelcomeEmails = [
    {
      stepOrder: 2,
      subject: '🚀 [Bienvenue 2/5] Comment bien démarrer avec vos premiers outils gratuits',
      delayHours: 0,
      delayMinutes: 30,
      triggerType: 'DELAYED',
      content: `Bonjour {prenom},

J espère que vous avez pu faire un premier tour de nos ressources !

Pour bien démarrer sans perdre de temps, nous vous recommandons de commencer par notre ressource phare :
👉 ${makeLink(`Télécharger ${r0Name} (100% Gratuit)`, r0)}

Ce guide pratique vous permet de poser les bases d un système commercial solide sans prospection feinte ou agressive.

Prenez 10 minutes pour le parcourir aujourd hui et appliquez le premier conseil dès cette semaine.

À très vite,
L équipe Solopreneur&Co

{desabonner}`,
    },
    {
      stepOrder: 3,
      subject: '📊 [Bienvenue 3/5] Calculez votre TJM idéal avec nos modèles Excel',
      delayHours: 2,
      delayMinutes: 0,
      triggerType: 'DELAYED',
      content: `Bonjour {prenom},

Savez-vous si votre Tarif Jour Moyen (TJM) couvre réellement l ensemble de vos charges, de vos congés et de vos investissements ?

Beaucoup d indépendants sous-estiment leur taux horaire et finissent par travailler trop sans générer le revenu mérité.

Nous avons préparé pour vous un calculateur spécial :
👉 ${makeLink(`Accéder à : ${r1Name}`, r1)}

Grâce à ce fichier prêt à l emploi, vous pourrez estimer au centime près votre rentabilité et fixer vos prix en toute confiance.

Bon calcul !
L équipe Solopreneur&Co

{desabonner}`,
    },
    {
      stepOrder: 4,
      subject: '⚡ [Bienvenue 4/5] Organisez vos projets avec notre Hub Notion',
      delayHours: 12,
      delayMinutes: 0,
      triggerType: 'DELAYED',
      content: `Bonjour {prenom},

L organisation est la colonne vertébrale de tout solopreneur qui réussit.

Si vos notes et vos tâches sont éparpillées entre 5 applications différentes, il est temps de centraliser votre activité dans un espace clair.

Découvrez notre méthode d organisation et nos templates sur-mesure :
👉 ${makeLink(`Télécharger : ${r2Name}`, r2)}

Un espace épuré pour suivre vos projets clients, vos todos et vos notes de réunion en un seul coup d œil.

À votre succès,
L équipe Solopreneur&Co

{desabonner}`,
    },
    {
      stepOrder: 5,
      subject: '🏆 [Bienvenue 5/5] Vos 3 privilèges membres & prochaines étapes',
      delayHours: 24,
      delayMinutes: 0,
      triggerType: 'DELAYED',
      content: `Bonjour {prenom},

Ceci est le dernier email de votre séquence d accueil !

En tant que membre privilégié de Solopreneur&Co, vous bénéficiez désormais de :
1. Accès illimité à toutes nos futures ressources et mises à jour gratuites.
2. Alertes en avant-première lors des sorties de nouveaux templates et guides.
3. Conseils hebdomadaires directement dans votre boîte mail.

Retrouvez l ensemble de nos outils téléchargeables ici :
👉 ${makeLink('Voir toutes les ressources offertes', undefined)}

Nous sommes ravis de vous accompagner dans votre aventure entrepreneuriale !

L équipe Solopreneur&Co

{desabonner}`,
    },
  ];

  // -------------------------------------------------------------
  // PART 4: 15 SEQUENCE EMAILS (VALEUR & RELATIONS RESSOURCES)
  // -------------------------------------------------------------
  const sequenceEmails = [
    {
      stepOrder: 6,
      subject: '💡 Email #6 : Les 3 erreurs qui plombent la prospection des freelances',
      delayHours: 48,
      delayMinutes: 0,
      content: `Bonjour {prenom},

Beaucoup de solopreneurs pensent que prospection rime avec démarchage agressif. C est faux !

Les 3 erreurs les plus courantes :
1. Ne pas définir clairement son profil de client idéal.
2. Envoyer des messages génériques copiés-collés sur LinkedIn.
3. Abandonner après la première prise de contact sans relance méthodique.

Pour corriger ces points immédiatement, téléchargez notre méthodologie complète :
👉 ${makeLink(`Accéder à : ${r0Name}`, r0)}

Ce plan d action vous guidera pas à pas pour signer vos premiers clients avec élégance.

Bien à vous,
L équipe Solopreneur&Co

{desabonner}`,
    },
    {
      stepOrder: 7,
      subject: '📈 Email #7 : Comment augmenter son TJM de 20% sans faire fuir ses clients',
      delayHours: 72,
      delayMinutes: 0,
      content: `Bonjour {prenom},

Augmenter ses tarifs fait peur à 95% des freelances. Pourtant, si votre valeur perçue est claire, vos clients accepteront naturellement votre juste prix.

Voici la formule :
1. Découpez votre offre en bénéfices concrets plutôt qu en heures vendues.
2. Présentez un livrable pro et structuré dès la proposition commerciale.
3. Utilisez notre calculateur de rentabilité pour fixer votre plancher.

👉 ${makeLink(`Télécharger le calculateur : ${r1Name}`, r1)}

Faites l exercice aujourd hui et ajustez vos prochains devis !

L équipe Solopreneur&Co

{desabonner}`,
    },
    {
      stepOrder: 8,
      subject: '🧠 Email #8 : Adoptez la méthode PARA sur Notion pour libérer votre esprit',
      delayHours: 96,
      delayMinutes: 0,
      content: `Bonjour {prenom},

Avez-vous déjà ressenti la sensation d surcharge mentale liée à des dizaines d onglets et fichiers ouverts ?

La méthode PARA (Projets, Domaines, Ressources, Archives) créée par Tiago Forte permet de classer n importe quelle information en moins de 3 secondes.

Nous l avons pré-intégrée dans notre template Notion solopreneur :
👉 ${makeLink(`Dupliquer le template : ${r2Name}`, r2)}

Fini le désordre numérique !

À très vite,
L équipe Solopreneur&Co

{desabonner}`,
    },
    {
      stepOrder: 9,
      subject: '⏱️ Email #9 : Gagner 5h par semaine en automatisant l administratif',
      delayHours: 120,
      delayMinutes: 0,
      content: `Bonjour {prenom},

Chaque minute passée à rédiger manuellement des devis ou des suivis de facturation est une minute en moins consacrée à la création de valeur.

En automatisant vos process et vos modèles de documents, vous économisez l équivalent d une demi-journée par semaine.

Retrouvez nos kits de démarrage gratuits :
👉 ${makeLink('Découvrir les kits d automatisation et modèles gratuits', undefined)}

Prenez le contrôle de votre temps dès maintenant.

L équipe Solopreneur&Co

{desabonner}`,
    },
    {
      stepOrder: 10,
      subject: '🎯 Email #10 : La checklist ultime avant d envoyer une proposition commerciale',
      delayHours: 144,
      delayMinutes: 0,
      content: `Bonjour {prenom},

Une proposition commerciale bâclée est la première cause de refus ou de négociation à la baisse.

Avant d envoyer votre prochain devis, vérifiez ces 4 points :
- Le problème du client est-il formulé avec ses propres mots ?
- Le calendrier des livrables est-il réaliste et clair ?
- Les conditions de paiement et d acompte sont-elles explicites ?
- Avez-vous inclus une ressource d accompagnement ?

👉 ${makeLink(`Consulter notre méthode complète : ${r0Name}`, r0)}

Faites de chaque proposition un contrat signé.

À très bientôt,
L équipe Solopreneur&Co

{desabonner}`,
    },
    {
      stepOrder: 11,
      subject: '💰 Email #11 : Trésorerie Freelance : Comment éviter les impayés et retards',
      delayHours: 168,
      delayMinutes: 0,
      content: `Bonjour {prenom},

Les retards de paiement sont la hantise des solopreneurs. Pour sécuriser votre trésorerie :
1. Demandez systématiquement un acompte de 30% à 50% avant le début de la mission.
2. Fixez des échéances claires avec des rappels automatiques.
3. Suivez vos encaissements semaine par semaine.

Utilisez notre outil gratuit de suivi de trésorerie Excel :
👉 ${makeLink(`Télécharger : ${r1Name}`, r1)}

Gardez l esprit tranquille et vos finances au vert.

L équipe Solopreneur&Co

{desabonner}`,
    },
    {
      stepOrder: 12,
      subject: '📂 Email #12 : Structurer ses dossiers clients sur Notion comme une agence',
      delayHours: 192,
      delayMinutes: 0,
      content: `Bonjour {prenom},

Offrir une expérience client irréprochable commence par la transparence et la clarté.

En créant un espace partagé Notion pour chaque client, vous lui donnez accès en temps réel à l avancement des travaux, aux compte-rendus et aux fichiers clés.

👉 ${makeLink(`Accéder au modèle de Portail Client : ${r2Name}`, r2)}

Impressionnez vos clients et démarquez-vous de la concurrence !

Excellente journée,
L équipe Solopreneur&Co

{desabonner}`,
    },
    {
      stepOrder: 13,
      subject: '✉️ Email #13 : 3 modèles d e-mails de relance qui font répondre les prospects',
      delayHours: 216,
      delayMinutes: 0,
      content: `Bonjour {prenom},

Un prospect ne vous répond pas ? Ne le prenez pas personnellement : il est simplement occupé !

La relance est un art. Un bon email de relance apporte de la valeur supplémentaire au lieu d envoyer un simple "Avez-vous pu lire mon message ?".

Découvrez nos scripts et modèles d e-mails prêts à l emploi dans notre guide prospection :
👉 ${makeLink(`Télécharger le guide gratuit : ${r0Name}`, r0)}

Relancez avec professionnalisme et obtenez enfin des réponses.

L équipe Solopreneur&Co

{desabonner}`,
    },
    {
      stepOrder: 14,
      subject: '📊 Email #14 : Anticiper ses cotisations Urssaf & impôts sans mauvaise surprise',
      delayHours: 240,
      delayMinutes: 0,
      content: `Bonjour {prenom},

Rien de pire que de recevoir son appel de cotisations sans avoir mis de côté l argent nécessaire.

Pour piloter vos provisions financières sans stress, découvrez notre tableau de bord de calcul prévisionnel :
👉 ${makeLink(`Télécharger : ${r1Name}`, r1)}

Entrez votre chiffre d affaires et voyez immédiatement votre revenu net disponible.

Bonne gestion,
L équipe Solopreneur&Co

{desabonner}`,
    },
    {
      stepOrder: 15,
      subject: '🛠️ Email #15 : Le stack d outils indispensables pour le solopreneur moderne',
      delayHours: 264,
      delayMinutes: 0,
      content: `Bonjour {prenom},

Vous n avez pas besoin de 20 logiciels payants pour faire tourner votre activité.

Un bon solopreneur s appuie sur un stack minimaliste mais ultra-efficace :
- **Notion** pour le second cerveau et la gestion de projet.
- **Excel / Google Sheets** pour le pilotage financier rigoureux.
- **Canva / Typeform** pour le marketing et les formulaires.

Retrouvez tous nos modèles d intégration gratuits :
👉 ${makeLink('Consulter la bibliothèque de ressources offertes', undefined)}

Simplifiez votre stack dès aujourd hui !

L équipe Solopreneur&Co

{desabonner}`,
    },
    {
      stepOrder: 16,
      subject: '🚀 Email #16 : Passer du statut de freelance exécutant à celui de consultant stratégique',
      delayHours: 288,
      delayMinutes: 0,
      content: `Bonjour {prenom},

La différence entre un freelance rémunéré 250€/jour et un consultant rémunéré 800€/jour ne réside pas dans les compétences techniques, mais dans le positionnement.

En passant d une logique d heures vendues à une logique d accompagnement axé sur les résultats de vos clients, vous changez de dimension.

👉 ${makeLink(`Consulter nos ressources d accompagnement : ${r0Name}`, r0)}

Faites évoluer votre posture dès vos prochains échanges.

L équipe Solopreneur&Co

{desabonner}`,
    },
    {
      stepOrder: 17,
      subject: '📑 Email #17 : Modèle de Contrat & Conditions Générales de Vente',
      delayHours: 312,
      delayMinutes: 0,
      content: `Bonjour {prenom},

Protéger son travail avec des clauses claires est essentiel pour éviter les litiges sur le périmètre de la mission.

Découvrez nos modèles juridiques et nos recommandations sur notre plateforme :
👉 ${makeLink('Accéder aux modèles et ressources gratuites', undefined)}

Sécurisez vos missions en toute sérénité.

L équipe Solopreneur&Co

{desabonner}`,
    },
    {
      stepOrder: 18,
      subject: '🌟 Email #18 : Comment obtenir des recommandations et avis 5 étoiles',
      delayHours: 336,
      delayMinutes: 0,
      content: `Bonjour {prenom},

Le bouche-à-oreille et les preuves sociales sont le moteur de croissance le plus puissant pour un indépendant.

Après chaque mission réussie, demandez systématiquement un témoignage avec une trame structurée (Problème initial -> Solution apportée -> Résultats obtenus).

Découvrez nos modèles de questionnaires d avis dans notre Hub Notion :
👉 ${makeLink(`Accéder à : ${r2Name}`, r2)}

Transformez vos clients satisfaits en ambassadeurs !

L équipe Solopreneur&Co

{desabonner}`,
    },
    {
      stepOrder: 19,
      subject: '📈 Email #19 : Bilan financier trimestriel : Fixer ses objectifs de CA',
      delayHours: 360,
      delayMinutes: 0,
      content: `Bonjour {prenom},

Faire le point chaque trimestre permet de rectifier le tir rapidement si vous êtes en retard sur vos objectifs annuels.

Grâce à nos tableaux Excel de bord de gestion, analysez vos meilleures sources de revenus et vos clients les plus rentables :
👉 ${makeLink(`Télécharger le Dashboard Excel : ${r1Name}`, r1)}

Prenez de la hauteur sur votre business.

L équipe Solopreneur&Co

{desabonner}`,
    },
    {
      stepOrder: 20,
      subject: '🎁 Email #20 : Résumé de vos ressources gratuites & Prochaines étapes',
      delayHours: 384,
      delayMinutes: 0,
      content: `Bonjour {prenom},

Ceci est le dernier email de votre séquence complète de 20 emails d accompagnement !

Nous espérons que ces ressources et conseils vous ont permis de structurer votre activité et de gagner en clarté.

Pour rappel, l ensemble de vos outils gratuits reste accessible 24h/24 :
👉 ${makeLink('Accéder à la bibliothèque globale des ressources', undefined)}

Merci pour votre confiance et excellent développement !

L équipe Solopreneur&Co

{desabonner}`,
    },
  ];

  // Insert remaining welcome and sequence emails
  const remainingEmails = [...remainingWelcomeEmails, ...sequenceEmails];

  console.log(`✉️ Saving ${remainingEmails.length} remaining sequence steps to database...`);

  for (const item of remainingEmails) {
    await prisma.emailSequenceStep.create({
      data: {
        campaignId: campaign.id,
        stepOrder: item.stepOrder,
        subject: item.subject,
        content: item.content,
        triggerType: (item as any).triggerType || 'DELAYED',
        delayHours: item.delayHours,
        delayMinutes: item.delayMinutes,
        status: 'ACTIVE',
      },
    });
  }

  console.log(`✅ SUCCESS! COMPAGNE RESSOURCES now contains 23 total emails (5 Welcome + 3 Sub-Emails + 15 Sequence Nurture) !`);
}

seedResourcesCampaign()
  .catch((e) => {
    console.error('❌ Error seeding COMPAGNE RESSOURCES:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
