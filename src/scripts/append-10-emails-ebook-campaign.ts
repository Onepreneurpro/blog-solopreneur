import { prisma } from '../lib/prisma';

async function append10Emails() {
  console.log('Adding 10 more sequence emails to COMPAGNE EBOOK...');

  // 1. Find COMPAGNE EBOOK
  const campaign = await prisma.emailCampaign.findFirst({
    where: {
      OR: [
        { name: { contains: 'EBOOK' } },
        { name: { contains: 'eBook' } },
        { name: { contains: 'Ebook' } },
      ],
    },
  });

  if (!campaign) {
    throw new Error('COMPAGNE EBOOK not found!');
  }

  console.log(`Campaign found: "${campaign.name}" (${campaign.id})`);

  // 2. Additional 10 sequence emails (Steps #17 to #26)
  const additionalEmails = [
    {
      order: 17,
      subject: '⏰ Comment gérer la fatigue et le burnout du freelance',
      content: `Bonjour {prenom},\n\nTravailler seul expose souvent au surmenage et au flou entre vie pro et vie perso.\n\nLa meilleure façon de se protéger est d fixer des limites claires et d utiliser un planning time-blocké sur Notion pour savoir exactement quand s arrêter.\n\nPrenez soin de votre énergie, c est votre premier actif !\n\nL équipe Solopreneur&Co\n\n{desabonner}`,
    },
    {
      order: 18,
      subject: '📌 Matrice d Eisenhower sur Notion : Trier l urgent de l important',
      content: `Bonjour {prenom},\n\nSavez-vous faire la différence entre ce qui est vraiment important pour votre chiffre d affaires et ce qui est simplement urgent ?\n\nGrâce à notre vue Matrice d Eisenhower intégrée dans nos templates Notion gratuits, classez vos tâches en 4 quadrants et concentrez-vous sur l essentiel.\n\nRetrouvez nos modèles sur le site !\n\nÀ très vite,\nL équipe Solopreneur&Co\n\n{desabonner}`,
    },
    {
      order: 19,
      subject: '💡 Négocier ses prix sans peur de perdre le client',
      content: `Bonjour {prenom},\n\nQuand un client vous demande une baisse de tarif, ne réduisez jamais vos prix sans réduire le périmètre de la mission.\n\nUtilisez notre calculateur de valeur et nos modèles de propositions d accompagnement pour imposer votre Tarif Jour Moyen avec assurance.\n\nBonne négociation !\n\nL équipe Solopreneur&Co\n\n{desabonner}`,
    },
    {
      order: 20,
      subject: '📁 Modèle de Suivi des Dépenses & Taxes en Micro-Entreprise',
      content: `Bonjour {prenom},\n\nAnticiper vos cotisations sociales URSSAF et vos impôts est indispensable pour ne pas être pris au dépourvu lors de vos déclarations.\n\nNotre Dashboard Excel gratuit inclut une formule de calcul automatique de vos cotisations estimées selon votre chiffre d affaires encaisse.\n\nTéléchargez votre tableau de bord sur Solopreneur&Co !\n\nÀ bientôt,\nL équipe Solopreneur&Co\n\n{desabonner}`,
    },
    {
      order: 21,
      subject: '🔄 La routine hebdomadaire du vendredi (Revue Notion en 15 min)',
      content: `Bonjour {prenom},\n\nBloquez 15 minutes chaque vendredi après-midi pour :\n1. Archiver les projets terminés\n2. Vérifier les paiements reçus\n3. Planifier les 3 priorités du lundi matin sur Notion\n\nVous commencerez ainsi votre week-end l esprit totalement libéré !\n\nL équipe Solopreneur&Co\n\n{desabonner}`,
    },
    {
      order: 22,
      subject: '🎨 Harmoniser sa charte graphique et ses propositions avec Notion',
      content: `Bonjour {prenom},\n\nLa première impression est décisive. Offrez à vos clients un portail d accueil Notion personnalisé et professionnel dès la signature du devis.\n\nDécouvrez nos templates de Portails Clients Notion disponibles sur notre plateforme !\n\nBonne personnalisation,\nL équipe Solopreneur&Co\n\n{desabonner}`,
    },
    {
      order: 23,
      subject: '📈 Passer de 2K€ à 5K€ par mois : Les 3 leviers d automatisation',
      content: `Bonjour {prenom},\n\nPour franchir le cap des 5 000€ mensuels, vous devez automatiser 3 piliers :\n- La prospection et le CRM\n- La facturation et le suivi de caisse\n- La livraison client structurée\n\nNos outils Excel et Notion sont spécialement optimisés pour soutenir cette croissance.\n\nÀ très vite,\nL équipe Solopreneur&Co\n\n{desabonner}`,
    },
    {
      order: 24,
      subject: '🛡️ Les clauses juridiques indispensables dans vos contrats freelance',
      content: `Bonjour {prenom},\n\nUn bon contrat protège votre travail et garantit le versement d acompte avant le début des prestations.\n\nRetrouvez nos checklists et modèles de documents administratifs gratuits sur Solopreneur&Co !\n\nL équipe Solopreneur&Co\n\n{desabonner}`,
    },
    {
      order: 25,
      subject: '🌟 Le pouvoir des recommandations et des avis clients automatisés',
      content: `Bonjour {prenom},\n\nDès la fin d une mission, envoyez un questionnaire de satisfaction automatique pour récolter un témoignage client.\n\nIntégrez ces avis dans vos propositions et vos tableaux Notion pour convaincre vos futurs prospects sans effort.\n\nÀ bientôt,\nL équipe Solopreneur&Co\n\n{desabonner}`,
    },
    {
      order: 26,
      subject: '🎁 Votre accès privilégié à toutes les futures mises à jour',
      content: `Bonjour {prenom},\n\nMerci de suivre notre séquence d emails ! Vous faites désormais partie de la communauté Solopreneur&Co.\n\nGardez notre page Ressources Gratuites dans vos favoris : nous y ajoutons très régulièrement de nouveaux templates Notion et dashboards Excel.\n\nExcellente réussite dans tous vos projets,\nL équipe Solopreneur&Co\n\n{desabonner}`,
    },
  ];

  for (const item of additionalEmails) {
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

  console.log('✅ 10 Emails supplémentaires (Steps #17 à #26) ajoutés avec succès !');
}

append10Emails()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
