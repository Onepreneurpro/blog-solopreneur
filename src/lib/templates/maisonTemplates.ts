export interface MaisonTemplate {
  id: string;
  name: string;
  category: string;
  previewImage: string;
  description: string;
  elements: Array<{
    id: string;
    type: string;
    category: string;
    content: string;
    data?: any;
  }>;
}

export const MAISON_TEMPLATES: MaisonTemplate[] = [
  // 1. TEMPLATE VERT DIGITAL PRODUCT PRO (CLONE DE LA PHOTO)
  {
    id: 'green-sales-pro',
    name: '🟢 Digital Product Pro (Template Vert 19€)',
    category: 'Page de Vente Produit Digital',
    previewImage: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=600&q=80',
    description: 'Design Vert Émeraude avec 10 sections complètes : Titre Hero, Vidéo, Grille 4 piliers, Modules, Comparatif et Offre 19€.',
    elements: [
      {
        id: 'el-green-1',
        type: 'Heading',
        category: 'Texte',
        content: '🚀 Lancez Votre Produit Numérique Rentable — Même Si Vous Partez de Zéro',
      },
      {
        id: 'el-green-2',
        type: 'Text',
        category: 'Texte',
        content: 'Découvrez la méthode exacte étape par étape pour concevoir, lancer et automatiser les ventes de vos produits digitaux avec notre framework clé en main.',
      },
      {
        id: 'el-green-3',
        type: 'BlockFeat4ColImg',
        category: 'Fonctionnalités',
        content: 'Quatre colonnes d éléments (grande image, titre et texte)',
        data: {
          title: '🎯 Les Compétences Clés Pour Transformer Vos Idées En Revenus',
          items: [
            {
              id: '1',
              title: '🔍 Niche Rentable',
              img: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=400&q=80',
              desc: 'Identifiez précisément les sujets les plus recherchés et monétisables.',
            },
            {
              id: '2',
              title: '📦 Offre Irrésistible',
              img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
              desc: 'Structurez un produit numérique à forte valeur ajoutée en quelques jours.',
            },
            {
              id: '3',
              title: '📈 Stratégie Prix',
              img: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=400&q=80',
              desc: 'Fixez les meilleurs tarifs pour maximiser vos conversions sans brader.',
            },
            {
              id: '4',
              title: '🚀 Ventes Automatiques',
              img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80',
              desc: 'Automatisez la livraison et le suivi client pour encaisser 24h/24.',
            },
          ],
        },
      },
      {
        id: 'el-green-4',
        type: 'BlockFeat2ColIconsLeft',
        category: 'Fonctionnalités',
        content: '2 colonnes avec grandes icônes sur la gauche',
        data: {
          title: '📚 Programme Détaillé Des Modules de Formation',
          items: [
            {
              id: '1',
              title: 'Module 1 & 2 : Validation de Niche & Offre',
              desc: 'Apprenez à identifier les besoins urgents de votre audience et créez un produit à forte valeur (Ebook, Template Notion, Masterclass).',
            },
            {
              id: '2',
              title: 'Module 3 & 4 : Systèmes de Vente Automatisés',
              desc: 'Configurez vos pages de vente sans aucune compétence technique et automatisez la réception des paiements 24/7.',
            },
            {
              id: '3',
              title: 'Module 5 & 6 : Trafic & Conversions',
              desc: 'Découvrez comment attirer des acheteurs qualifiés quotidiennement sans dépenser une fortune en publicité.',
            },
            {
              id: '4',
              title: 'Accès Illimité à Vie & Mises à Jour',
              desc: 'Accédez à toutes les futures révisions du programme sans aucun frais supplémentaire.',
            },
          ],
        },
      },
      {
        id: 'el-green-5',
        type: 'ButtonCTA',
        category: 'Formulaire',
        content: '🛒 Obtenir Mon Accès Immédiat Pour 19€ (Réduction -90%)',
      },
    ],
  },

  // 2. CAPTURE EBOOK & LEAD
  {
    id: 'ebook-optin-1',
    name: 'Votre emploi de rêve n est qu à un clic',
    category: 'Capture eBook & Lead',
    previewImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80',
    description: 'Header avec titre accrocheur, sous-titre de réassurance, grille 3 avantages et formulaire d inscription rapide.',
    elements: [
      {
        id: 'el-eb-1',
        type: 'Heading',
        category: 'Texte',
        content: 'Votre emploi de rêve n est qu à un clic',
      },
      {
        id: 'el-eb-2',
        type: 'Text',
        category: 'Texte',
        content: 'Découvrez nos méthodes prouvées, nos templates d organisation et nos automations pour développer un business rentable sans vous épuiser.',
      },
      {
        id: 'el-eb-3',
        type: 'BlockFeat3ColImg',
        category: 'Fonctionnalités',
        content: 'Trois colonnes d éléments (grande image, titre, texte)',
        data: {
          title: 'Ce que vous allez recevoir gratuitement :',
          subtitle: 'INCLUS DANS VOTRE ACCÈS',
          items: [
            {
              id: '1',
              title: 'Séquences d emails exclusives',
              img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80',
              desc: 'Recevez nos stratégies directement dans votre boîte mail.',
            },
            {
              id: '2',
              title: 'Guide complet PDF & Notion',
              img: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=400&q=80',
              desc: 'Des templates prêts à être copiés-collés immédiatement.',
            },
            {
              id: '3',
              title: 'Méthode 100% gratuite',
              img: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=400&q=80',
              desc: 'Accès immédiat sans aucun engagement ni carte bancaire.',
            },
          ],
        },
      },
      {
        id: 'el-eb-4',
        type: 'OptinForm',
        category: 'Formulaire',
        content: 'Formulaire de Capture Email',
      },
    ],
  },

  // 3. DARK MINIMALIST
  {
    id: 'dark-theater',
    name: 'Votre aventure théâtrale vous attend',
    category: 'Dark Minimalist',
    previewImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
    description: 'Design sombre haut de gamme avec grille 4 piliers sombres et capteur de membres.',
    elements: [
      {
        id: 'el-dt-1',
        type: 'Heading',
        category: 'Texte',
        content: 'Votre Aventure Théâtrale & Artistique Vous Attend',
      },
      {
        id: 'el-dt-2',
        type: 'Text',
        category: 'Texte',
        content: 'Plongez dans l univers de la scène avec nos formations et ateliers immersifs pour révéler votre potentiel créatif.',
      },
      {
        id: 'el-dt-3',
        type: 'BlockFeat4ColDark',
        category: 'Fonctionnalités',
        content: 'Quatre colonnes d éléments (grande icône, titre, texte)',
        data: {
          title: 'Pourquoi rejoindre notre académie théâtrale ?',
          items: [
            { id: '1', title: 'Ateliers en Direct', desc: 'Séances de répétition guidées chaque semaine.' },
            { id: '2', title: 'Techniques de Scène', desc: 'Masterclass dispensées par des comédiens pros.' },
            { id: '3', title: 'Réseau d Artistes', desc: 'Rejoignez une communauté bienveillante et motivée.' },
            { id: '4', title: 'Représentations', desc: 'Mettez en pratique devant un vrai public sur scène.' },
          ],
        },
      },
      {
        id: 'el-dt-4',
        type: 'OptinForm',
        category: 'Formulaire',
        content: 'Réservez votre séance d essai offerte 🎭',
      },
    ],
  },

  // 4. FULL HERO IMAGE
  {
    id: 'country-lane',
    name: 'Amusez-vous à la ferme Country Lane !',
    category: 'Full Hero Image',
    previewImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80',
    description: 'Bannière panoramique nature avec 3 cartes d activités et pass privilège.',
    elements: [
      {
        id: 'el-cl-1',
        type: 'Heading',
        category: 'Texte',
        content: 'Amusez-vous à la ferme Country Lane !',
      },
      {
        id: 'el-cl-2',
        type: 'Text',
        category: 'Texte',
        content: 'Profitez d un séjour inoubliable en pleine nature pour toute la famille. Activités plein air, produits locaux et détente garantie.',
      },
      {
        id: 'el-cl-3',
        type: 'BlockFeat3ColImg',
        category: 'Fonctionnalités',
        content: 'Trois colonnes d éléments (grande image, titre, texte)',
        data: {
          title: 'Nos Activités et Expériences à la Ferme',
          subtitle: 'POUR TOUTE LA FAMILLE',
          items: [
            {
              id: '1',
              title: 'Visites de la Ferme',
              img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400&q=80',
              desc: 'Découvrez le quotidien de nos animaux et participez aux soins.',
            },
            {
              id: '2',
              title: 'Ateliers Produits Locaux',
              img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
              desc: 'Dégustez nos produits du terroir préparés avec amour.',
            },
            {
              id: '3',
              title: 'Espaces Détente',
              img: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=400&q=80',
              desc: 'Profitez de grands espaces au calme loin du bruit de la ville.',
            },
          ],
        },
      },
      {
        id: 'el-cl-4',
        type: 'OptinForm',
        category: 'Formulaire',
        content: 'Obtenir mon pass privilège -20% 🌾',
      },
    ],
  },

  // 5. BLACK FRIDAY FLASH
  {
    id: 'black-friday-flash',
    name: 'BLACK FRIDAY Flash Deal',
    category: 'Promotion & Offre Limitée',
    previewImage: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=600&q=80',
    description: 'Bannière de promotion avec compte à rebours 24h et bouton CTA vert fluo.',
    elements: [
      {
        id: 'el-[#00A0FF]-1',
        type: 'Heading',
        category: 'Texte',
        content: '⚡ VENTE FLASH - Jusqu à -80% Sur Tout le Catalogue !',
      },
      {
        id: 'el-bf-2',
        type: 'Countdown',
        category: 'Autre',
        content: '24:00:00',
      },
      {
        id: 'el-bf-3',
        type: 'Text',
        category: 'Texte',
        content: 'Offre limitée aux 50 premiers inscrits. Obtenez l intégralité de nos programmes d accompagnement à un tarif historique.',
      },
      {
        id: 'el-bf-4',
        type: 'ButtonCTA',
        category: 'Formulaire',
        content: '👉 Profiter de la Réduction Immédiate',
      },
    ],
  },

  // 6. SAAS & MODERNE
  {
    id: 'webmaven-clean',
    name: 'Webmaven - Plugins puissants',
    category: 'SaaS & Moderne',
    previewImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
    description: 'Page SaaS moderne avec avantages techniques et bouton d essai gratuit.',
    elements: [
      {
        id: 'el-[#00A0FF]-wm-1',
        type: 'Heading',
        category: 'Texte',
        content: 'Webmaven — La Suite d Outils et Plugins Puissants',
      },
      {
        id: 'el-wm-2',
        type: 'Text',
        category: 'Texte',
        content: 'Boostez votre productivité et vos ventes grâce à nos outils logiciels pensés pour les solopreneurs exigeants.',
      },
      {
        id: 'el-wm-3',
        type: 'BlockFeat3ColImg',
        category: 'Fonctionnalités',
        content: 'Trois colonnes d éléments (grande image, titre, texte)',
        data: {
          title: 'Pourquoi choisir Webmaven pour votre entreprise ?',
          subtitle: 'FONCTIONNALITÉS CLÉS',
          items: [
            {
              id: '1',
              title: 'Vitesse Maximale',
              img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80',
              desc: 'Optimisation extrême pour vos pages web et tunnels.',
            },
            {
              id: '2',
              title: 'Automatisations CRM',
              img: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=400&q=80',
              desc: 'Connectez vos séquences d emails en quelques clics.',
            },
            {
              id: '3',
              title: 'Analytiques en Direct',
              img: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=400&q=80',
              desc: 'Suivez vos taux de conversion et revenus en temps réel.',
            },
          ],
        },
      },
      {
        id: 'el-wm-4',
        type: 'OptinForm',
        category: 'Formulaire',
        content: 'Essayer Webmaven gratuitement pendant 14 jours ⚡',
      },
    ],
  },
];
