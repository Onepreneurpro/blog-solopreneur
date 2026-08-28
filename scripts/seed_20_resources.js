const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding 20 free demo resources...');

  const resourcesData = [
    {
      name: 'Checklist : 10 Étapes pour Prospecter sans SPAM (PDF)',
      slug: 'checklist-10-etapes-prospection-pdf',
      shortDescription: 'Plan d action étape par étape pour signer vos premiers clients B2B sans démarchage agressif.',
      longDescription: `<h3>Le guide pas à pas pour structurer votre prospection commerciale B2B</h3>
<p>Cette checklist complète vous donne la feuille de route exacte pour aborder des décideurs de manière authentique et convertir vos échanges en contrats signés.</p>
<ul>
  <li><strong>Étape 1 :</strong> Ciblage des prospects idéaux (ICP & Persona)</li>
  <li><strong>Étape 2 :</strong> Optimisation de votre profil professionnel LinkedIn</li>
  <li><strong>Étape 3 :</strong> Rédaction de messages d approche ultra-personnalisés</li>
  <li><strong>Étape 4 :</strong> Traitement des objections courantes en appel de découverte</li>
</ul>`,
      fileUrl: 'https://example.com/downloads/checklist-prospection-b2b.pdf',
      downloadsCount: 520,
    },
    {
      name: 'Modèle de Devis & Contrat Freelance Réutilisable',
      slug: 'modele-devis-contrat-freelance-pdf',
      shortDescription: 'Protégez vos prestations et évitez les impayés grâce à ce modèle juridique clé en main.',
      longDescription: `<h3>Modèle de contrat et devis conforme pour indépendants</h3>
<p>Inclus toutes les clauses essentielles : conditions d acompte, pénalités de retard de paiement, propriété intellectuelle et modalités d annulation.</p>
<ul>
  <li>Clause d acompte obligatoire 30% ou 50%</li>
  <li>Pénalités de retard conformes à la loi</li>
  <li>Cession de droits d auteur encadrée</li>
</ul>`,
      fileUrl: 'https://example.com/downloads/modele-contrat-freelance.pdf',
      downloadsCount: 410,
    },
    {
      name: 'Guide Pratique : Calculer son TJM (Taux Journalier Moyen)',
      slug: 'guide-calcul-tjm-freelance',
      shortDescription: 'Déterminez votre tarif journalier idéal selon vos charges, votre expérience et vos objectifs de revenus.',
      longDescription: `<h3>Ne bradez plus vos prestations d indépendant</h3>
<p>Ce guide vous explique la formule mathématique exacte pour passer de votre salaire mensuel cible à votre TJM facturable.</p>
<ul>
  <li>Prise en compte des charges sociales (URSSAF, Micro-entreprise, SASU)</li>
  <li>Facteur de jours non travaillés (vacances, prospection, formation)</li>
  <li>Simulateur de revenus nets mensuels</li>
</ul>`,
      fileUrl: 'https://example.com/downloads/guide-calcul-tjm.pdf',
      downloadsCount: 340,
    },
    {
      name: 'Fiche Mémorandum : 50 Hooks LinkedIn à Fort Impact',
      slug: 'fiche-50-hooks-linkedin-copywriting',
      shortDescription: 'Capturez l attention de vos lecteurs dès la première ligne de vos posts LinkedIn.',
      longDescription: `<h3>Décuplez l engagement de vos publications réseau</h3>
<p>Une collection de 50 structures d accroches accrocheuses basées sur les meilleurs principes de copywriting.</p>
<ul>
  <li>Hooks basés sur la curiosité et le contre-intuitif</li>
  <li>Hooks storytelling et partage d expérience</li>
  <li>Formules AIDA et PAS déclinées pour le B2B</li>
</ul>`,
      fileUrl: 'https://example.com/downloads/50-hooks-linkedin.pdf',
      downloadsCount: 680,
    },
    {
      name: 'Cheat Sheet : Raccourcis Clavier & Formules Notion',
      slug: 'cheat-sheet-raccourcis-formules-notion',
      shortDescription: 'Boostez votre vitesse d exécution sur Notion grâce à cette fiche mémo synthétique.',
      longDescription: `<h3>Maîtrisez Notion comme un pro en quelques minutes</h3>
<p>Tous les raccourcis markdown, les commandes slash / et les fonctions de formule les plus utiles réunies sur une page synthétique.</p>`,
      fileUrl: 'https://example.com/downloads/cheat-sheet-notion.pdf',
      downloadsCount: 290,
    },
    {
      name: 'Template Excel : Suivi Simplifié des Dépenses Pro',
      slug: 'template-excel-suivi-depenses-simplifie',
      shortDescription: 'Catégorisez vos justificatifs et suivez vos dépenses professionnelles mois par mois.',
      longDescription: `<h3>Gardez une comptabilité propre pour votre bilan annuel</h3>
<p>Feuille de calcul pré-configurée avec calcul automatique de la TVA déductible et synthèse annuelle.</p>`,
      fileUrl: 'https://example.com/downloads/suivi-depenses.xlsx',
      downloadsCount: 380,
    },
    {
      name: 'Guide SEO : 15 Règles pour Ranker en Première Page Google',
      slug: 'guide-seo-premiere-page-google',
      shortDescription: 'Optimisez vos articles de blog et vos pages produits pour le référencement naturel.',
      longDescription: `<h3>Attirez du trafic qualifié sans dépenser un euro en publicité</h3>
<p>Guide condensé sur l optimisation On-Page, la structure des balises Hn, la vitesse de chargement et le maillage interne.</p>`,
      fileUrl: 'https://example.com/downloads/guide-seo-google.pdf',
      downloadsCount: 450,
    },
    {
      name: 'Kit de Bienvenue Client (Onboarding Pack PDF)',
      slug: 'kit-onboarding-client-freelance',
      shortDescription: 'Cadrez la collaboration dès la signature pour éviter les quiproquos et retards.',
      longDescription: `<h3>Un processus d accueil client fluide et professionnel</h3>
<p>Présentez vos outils de travail, vos horaires de disponibilité et les règles de validation de projet.</p>`,
      fileUrl: 'https://example.com/downloads/kit-onboarding-client.pdf',
      downloadsCount: 260,
    },
    {
      name: 'Checklist RGPD & Mentions Légales pour Site Web',
      slug: 'checklist-rgpd-mentions-legales-site',
      shortDescription: 'Assurez la conformité juridique de votre blog, boutique ou site vitrine.',
      longDescription: `<h3>Mettez votre site en conformité légale rapidement</h3>
<p>Vérifiez la présence des bandeaux de cookies, de la politique de confidentialité et des mentions légales obligatoires.</p>`,
      fileUrl: 'https://example.com/downloads/checklist-rgpd.pdf',
      downloadsCount: 210,
    },
    {
      name: 'Fiche Pratique : Automatiser son Business avec Make & Zapier',
      slug: 'fiche-automatisation-make-zapier',
      shortDescription: 'Découvrez 10 workflows no-code pour économiser 5 heures de travail répétitif par semaine.',
      longDescription: `<h3>Connectez vos outils préférés sans écrire une ligne de code</h3>
<p>Scénarios pratiques : envoi automatique de factures, synchronisation CRM et alertes Slack/Email.</p>`,
      fileUrl: 'https://example.com/downloads/10-scenarios-make-zapier.pdf',
      downloadsCount: 310,
    },
    {
      name: 'Guide Copywriting : Rédiger une Landing Page qui Convertit',
      slug: 'guide-copywriting-landing-page',
      shortDescription: 'La structure anatomique d une page de vente à fort taux de conversion.',
      longDescription: `<h3>Transformez vos visiteurs en acheteurs engagés</h3>
<p>Analyse détaillée des sections clés : Titre, Problème, Agitation, Solution, Preuve Sociale et Appel à l action.</p>`,
      fileUrl: 'https://example.com/downloads/guide-copywriting.pdf',
      downloadsCount: 490,
    },
    {
      name: 'Modèle de Relance des Impayés (3 Emails Types)',
      slug: 'modele-relance-factures-impayees-emails',
      shortDescription: 'Récupérez vos créances sans détériorer la relation avec vos clients.',
      longDescription: `<h3>Scripts d emails de relance diplomatiques mais fermes</h3>
<p>Du rappel courtois à 5 jours du terme jusqu à la mise en demeure formelle.</p>`,
      fileUrl: 'https://example.com/downloads/scripts-relance-impayes.pdf',
      downloadsCount: 370,
    },
    {
      name: 'Calculateur de Marge Brute & Prix de Vente (Excel)',
      slug: 'calculateur-marge-brute-prix-vente-excel',
      shortDescription: 'Déterminez votre prix de vente optimal selon votre coût d acquisition et votre marge cible.',
      longDescription: `<h3>Sécurisez la rentabilité de chaque vente effectuée</h3><p>Calcul automatique de la marge en valeur et en pourcentage avec prise en compte des frais de commission Stripe.</p>`,
      fileUrl: 'https://example.com/downloads/calculateur-marge.xlsx',
      downloadsCount: 280,
    },
    {
      name: 'Plan d Action Newsletter : De 0 à 1000 Abonnés',
      slug: 'plan-action-newsletter-1000-abonnes',
      shortDescription: 'Les stratégies concrètes pour bâtir une liste d emails engagée.',
      longDescription: `<h3>Construisez votre actif le plus précieux en ligne</h3><p>Création d un lead magnet irrésistible, mise en place des formulaires et séquence de bienvenue automatisée.</p>`,
      fileUrl: 'https://example.com/downloads/plan-newsletter.pdf',
      downloadsCount: 420,
    },
    {
      name: 'Fiche Méthode : La Routine Hebdomadaire du Solopreneur Efficient',
      slug: 'routine-hebdomadaire-solopreneur-efficient',
      shortDescription: 'Blocs de temps, revue hebdomadaire et priorisation sans surmenage.',
      longDescription: `<h3>Organisez vos semaines pour produire plus sans vous épuiser</h3><p>Découpage par journées thématiques (Deep Work, RDV clients, Création de contenu, Administratif).</p>`,
      fileUrl: 'https://example.com/downloads/routine-hebdomadaire.pdf',
      downloadsCount: 330,
    },
    {
      name: 'Guide Cold Email : Obtenir des Rendez-vous B2B Qualifiés',
      slug: 'guide-cold-email-prospection-b2b',
      shortDescription: 'Rédigez des emails de prospection à froid que vos prospects ouvrent et y répondent.',
      longDescription: `<h3>Sortez du lot dans la boîte de réception de vos futurs clients</h3><p>Techniques de délivrabilité, rédaction d objets courts et scripts de suivi.</p>`,
      fileUrl: 'https://example.com/downloads/guide-cold-email.pdf',
      downloadsCount: 390,
    },
    {
      name: 'Template de Questionnaire de Cadrage Projet',
      slug: 'template-questionnaire-cadrage-projet',
      shortDescription: 'Faites préciser les besoins et le budget de vos futurs clients avant de faire un devis.',
      longDescription: `<h3>Gagnez du temps en ne chiffrant que des projets qualifiés</h3><p>20 questions ciblées pour comprendre le contexte, les attentes et les contraintes techniques du prospect.</p>`,
      fileUrl: 'https://example.com/downloads/questionnaire-cadrage.pdf',
      downloadsCount: 240,
    },
    {
      name: 'Fiche Pratique : Configurer son Nom de Domaine & DNS Pro',
      slug: 'fiche-config-dns-nom-domaine-email-pro',
      shortDescription: 'Évitez les spams avec une configuration propre SPF, DKIM et DMARC.',
      longDescription: `<h3>Assurez la délivrabilité maximale de vos courriels professionnels</h3><p>Instructions pas à pas pour enregistrer vos clés de sécurité chez OVH, Gandi, Cloudflare ou Namecheap.</p>`,
      fileUrl: 'https://example.com/downloads/guide-dns-spf-dkim.pdf',
      downloadsCount: 195,
    },
    {
      name: 'Guide IA pour Solopreneurs : 30 Prompts ChatGPT Utiles',
      slug: 'guide-ia-30-prompts-chatgpt-solopreneurs',
      shortDescription: 'Accélérez votre rédaction, vos brainstormings et la synthèse de vos documents.',
      longDescription: `<h3>Exploitez l intelligence artificielle comme assistant quotidien</h3><p>Prompts prêts à copier-coller pour la rédaction d articles, la reformulation d emails et la recherche d idées.</p>`,
      fileUrl: 'https://example.com/downloads/30-prompts-chatgpt.pdf',
      downloadsCount: 610,
    },
    {
      name: 'Checklist Clôture d Exercice & Déclaration Micro-Entreprise',
      slug: 'checklist-cloture-declaration-micro-entreprise',
      shortDescription: 'N oubliez aucune échéance URSSAF ou fiscale lors de vos déclarations.',
      longDescription: `<h3>Déclarez vos revenus sans stress et en toute légalité</h3><p>Planning des déclarations mensuelles/trimestrielles, abattements forfaitaires et option pour le versement libératoire.</p>`,
      fileUrl: 'https://example.com/downloads/checklist-declaration-urssaf.pdf',
      downloadsCount: 350,
    },
  ];

  for (const item of resourcesData) {
    await prisma.product.upsert({
      where: { slug: item.slug },
      update: {
        name: item.name,
        shortDescription: item.shortDescription,
        longDescription: item.longDescription,
        fileUrl: item.fileUrl,
        downloadsCount: item.downloadsCount,
        price: 0,
        isFreeResource: true,
        status: 'PUBLISHED',
      },
      create: {
        name: item.name,
        slug: item.slug,
        shortDescription: item.shortDescription,
        longDescription: item.longDescription,
        fileUrl: item.fileUrl,
        downloadsCount: item.downloadsCount,
        price: 0,
        isFreeResource: true,
        status: 'PUBLISHED',
      },
    });
  }

  console.log('Successfully seeded 20 free demo resources!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
