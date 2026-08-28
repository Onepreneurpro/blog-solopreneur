'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Save, Eye, EyeOff, MoveUp, MoveDown, ExternalLink, Check, Sparkles, Highlighter, Underline, Palette, LayoutGrid, Megaphone, RotateCcw, Zap, Layers, ShoppingBag, Gift, Star, BookOpen, User, Award, MessageSquare, TrendingUp, DollarSign, Repeat, Link as LinkIcon, Plus, Trash2, GripVertical, Type, AlignLeft, AlignCenter, AlignRight, Globe, MousePointerClick } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FormattedText } from '@/components/ui/FormattedText';

const GOOGLE_FONTS_OPTIONS = [
  { name: 'Plus Jakarta Sans', importName: 'Plus+Jakarta+Sans:wght@700;800;900' },
  { name: 'Outfit', importName: 'Outfit:wght@700;800;900' },
  { name: 'Syne', importName: 'Syne:wght@700;800' },
  { name: 'Space Grotesk', importName: 'Space+Grotesk:wght@700' },
  { name: 'Poppins', importName: 'Poppins:wght@700;800;900' },
  { name: 'Montserrat', importName: 'Montserrat:wght@800;900' },
  { name: 'Playfair Display', importName: 'Playfair+Display:ital,wght@0,800;1,700' },
  { name: 'Bricolage Grotesque', importName: 'Bricolage+Grotesque:opsz,wght@12..96,800' },
  { name: 'Inter', importName: 'Inter:wght@800;900' },
];

interface Section {
  id: string;
  sectionKey: string;
  title: string;
  subtitle: string | null;
  isEnabled: boolean;
  order: number;
  settings?: any;
}

const COLOR_PALETTE = [
  { name: 'Vert Néon HighLevel', hex: '#a3e635' },
  { name: 'Jaune Fluo', hex: '#ccff00' },
  { name: 'Violet Marque', hex: '#c084fc' },
  { name: 'Orange Fluo', hex: '#f97316' },
  { name: 'Vert Émeraude', hex: '#10b981' },
  { name: 'Bleu Néon', hex: '#38bdf8' },
  { name: 'Rose Magenta', hex: '#f43f5e' },
];

const BLOCK_MODELS_DEFAULT: Record<string, { label: string; title: string; subtitle: string; settings: any }> = {
  HERO: {
    label: '🚀 HERO (Section Héro Complete)',
    title: "Les formations & templates qui te font <mark color='#a3e635'>gagner plus</mark> en freelance.",
    subtitle: "Des automatisations sur mesure, des templates Notion optimisés et des tableaux Excel conçus pour découpler ton chiffre d affaires.",
    settings: {
      topTickerText: 'Offre Limitée 2026 : Pack Tout-en-Un à -70% !',
      floatingBadge: 'Architecte IA & Solopreneur',
      btn1Text: 'Voir la boutique & les templates',
      btn1Url: '/boutique',
      btn2Text: 'Ressources Gratuites',
      btn2Url: '/ressources',
      creatorName: 'Thomas',
      creatorTitle: 'Fondateur Solopreneur&Co',
      creatorSubtitle: 'Architecte de Systèmes Notion & Excel',
      creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      creatorQuote: '"Je conçois des systèmes d organisation et de vente clés en main, des templates Notion prêts à l emploi et des dashboards Excel automatisés pour aider les freelances à maximiser leur TJM et gagner jusqu à 10h par semaine."',
      exp1: 'Templates Notion v3',
      exp2: 'Dashboards Excel',
      exp3: 'Workflows IA 2026',
      exp4: 'Accompagnement',
      stat1Val: '+20-40%',
      stat1Label: 'Augmentation du Taux de Clics',
      stat2Val: '3-4x',
      stat2Label: 'Croissance des Revenus',
      stat3Val: '60-80%',
      stat3Label: 'Clients Récurrents',
      solopreneursCount: '+5,400 Solopreneurs Équipés',
    },
  },
  TICKER: {
    label: '🟡 TICKER (Bandeau Fluo)',
    title: 'ACCÈS IMMÉDIAT AUX TEMPLATES NOTION & EXCEL',
    subtitle: '',
    settings: {
      item1Text: 'ACCÈS IMMÉDIAT AUX TEMPLATES NOTION & EXCEL',
      item2Text: 'BOOSTE TON TJM ET TES REVENUS FREELANCE',
      item3Text: 'PLUS DE 5 000 SOLOPRENEURS ACCOMPAGNÉS',
    },
  },
  CATEGORIES: {
    label: '📦 CATEGORIES (Collections)',
    title: 'Parcourez nos collections thématiques',
    subtitle: 'Des outils pensés pour chaque étape de votre croissance en solopreneur.',
    settings: {
      col1Name: 'Sales Funnels',
      col1Url: '/boutique',
      col2Name: 'Email Swipes',
      col2Url: '/boutique',
      col3Name: 'Ebooks & Guides',
      col3Url: '/boutique',
      col4Name: 'Lead Magnets',
      col4Url: '/boutique',
    },
  },
  PRODUCTS: {
    label: '🛒 PRODUCTS (Boutique)',
    title: 'Nos Formations & Templates Best-Sellers',
    subtitle: 'Des systèmes validés par plus de 5 000 freelances pour automatiser et développer leur activité.',
    settings: {
      btn1Text: 'Voir toute la boutique →',
      btn1Url: '/boutique',
    },
  },
  DARK_FEATURE: {
    label: '🎁 DARK_FEATURE (eBook Optin)',
    title: 'Tout ce dont vous avez besoin pour structurer et faire <mark color="#a3e635">décoller votre activité</mark>.',
    subtitle: 'Ne perdez plus des heures à configurer des outils bancales. Accédez à nos systèmes complets.',
    settings: {
      badgeText: 'EBOOK OFFERT A 100%',
      btnText: 'Send My FREE Guide 🚀',
      reassuranceText1: '100% Gratuit sans engagement',
      reassuranceText2: 'Téléchargement instantané',
      bookCoverUrl: '',
    },
  },
  FREE_RESOURCES: {
    label: '📚 FREE_RESOURCES (Guides)',
    title: 'Guides, Checklists & Modèles 100% Gratuits',
    subtitle: 'Téléchargez nos outils gratuits pour améliorer instantanément vos process.',
    settings: {},
  },
  ARTICLES: {
    label: '📰 ARTICLES (Blog)',
    title: 'Dernières stratégies & conseils de notre blog',
    subtitle: 'Découvrez nos méthodes pour prospecter, s organiser et développer votre activité.',
    settings: {},
  },
  TESTIMONIALS: {
    label: '💬 TESTIMONIALS (Avis Clients)',
    title: 'Ce que disent les solopreneurs',
    subtitle: 'Rejoignez des milliers de freelances et créateurs qui font confiance à Solopreneur & Co.',
    settings: {
      badgeText: '★★★★★ RECOMMANDÉ PAR +500 SOLOPRENEURS',
      items: [
        { name: 'Rene Wells', role: 'Business Owner', quote: 'Professional work, awesome! From high-converting sales funnels to email sequences, everything was super smooth and increased our revenue immediately.', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80', rating: 5 },
        { name: 'Sophie C.', role: 'Consultante Marketing', quote: 'Les templates et systèmes de vente ont totalement changé ma gestion quotidienne. Je gagne plus de 5h par semaine !', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80', rating: 5 },
        { name: 'Alexandre Mercier', role: 'Consultant IA & Data', quote: 'Grâce au Dashboard Excel et aux templates Notion, j ai pu doubler mes revenus en 3 mois. Indispensable !', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80', rating: 5 },
      ],
    },
  },
  NEWSLETTER: {
    label: '📬 NEWSLETTER (Capture Email)',
    title: 'Recevez nos meilleurs conseils chaque semaine',
    subtitle: 'Rejoignez +5 000 indépendants et recevez gratuitement nos nouveaux outils.',
    settings: {},
  },
  FINAL_CTA: {
    label: '⚡ FINAL_CTA (Appel Jaune)',
    title: 'Prêt à décupler ton efficacité et tes revenus en freelance ?',
    subtitle: 'Accède instantanément à tous nos templates Notion, tableaux Excel automatisés et guides pratiques.',
    settings: {
      badgeText: 'ACCÈS IMMÉDIAT EN 1 CLIC',
      btnText: 'Accéder à la boutique & aux templates ⚡',
      btnUrl: '/boutique',
      proof1: 'Paiement 100% sécurisé',
      proof2: 'Téléchargement instantané',
      proof3: 'Mises à jour gratuites à vie',
    },
  },
};

interface LeadList {
  id: string;
  name: string;
  color: string;
  sourceType?: string;
  _count?: { leads: number };
}

export default function AdminHomepageBuilderPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [leadLists, setLeadLists] = useState<LeadList[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [activeSiteTheme, setActiveSiteTheme] = useState<string>('pixel-funnel');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingBlockId, setSavingBlockId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Flexible Text Formatting & Google Fonts state for Homepage
  const [activeHeroTab, setActiveHeroTab] = useState<'badge' | 'title' | 'subtitle' | 'cta'>('title');
  const [sectionTabs, setSectionTabs] = useState<Record<string, 'badge' | 'title' | 'subtitle' | 'cta' | 'reassurance'>>({});

  const [homeHeroFontGlobal, setHomeHeroFontGlobal] = useState(false);
  const [homeHeroFontFamily, setHomeHeroFontFamily] = useState('Plus Jakarta Sans');

  const [homeHeroBadgeFont, setHomeHeroBadgeFont] = useState('Plus Jakarta Sans');
  const [homeHeroBadgeSize, setHomeHeroBadgeSize] = useState('12px');
  const [homeHeroBadgeColor, setHomeHeroBadgeColor] = useState('#a3e635');

  const [homeHeroTitleFont, setHomeHeroTitleFont] = useState('Plus Jakarta Sans');
  const [homeHeroTitleSize, setHomeHeroTitleSize] = useState('48px');
  const [homeHeroTitleColor, setHomeHeroTitleColor] = useState('#ffffff');

  const [homeHeroAccentFont, setHomeHeroAccentFont] = useState('Plus Jakarta Sans');
  const [homeHeroAccentColor, setHomeHeroAccentColor] = useState('#a3e635');

  const [homeHeroSubtitleFont, setHomeHeroSubtitleFont] = useState('Plus Jakarta Sans');
  const [homeHeroSubtitleSize, setHomeHeroSubtitleSize] = useState('18px');
  const [homeHeroSubtitleColor, setHomeHeroSubtitleColor] = useState('#cbd5e1');

  const [homeHeroAlign, setHomeHeroAlign] = useState('center');

  const [uThickness, setUThickness] = useState('4px');
  const [uOffset, setUOffset] = useState('3px');
  const [uColor, setUColor] = useState('#ccff00');

  const selectedColor = homeHeroAccentColor;
  const selectedThickness = 'medium';

  const fetchSections = async () => {
    try {
      // Fetch Lead Lists for form assignment
      fetch('/api/admin/lead-lists')
        .then((res) => res.json())
        .then((data) => {
          if (data.lists) setLeadLists(data.lists);
        })
        .catch((err) => console.error('Error fetching lead lists:', err));

      // Fetch Campaigns for specific welcome email selection
      fetch('/api/admin/campaigns')
        .then((res) => res.json())
        .then((data) => {
          if (data.campaigns) setCampaigns(data.campaigns);
        })
        .catch((err) => console.error('Error fetching campaigns:', err));

      // Fetch Theme
      fetch('/api/admin/theme')
        .then((res) => res.json())
        .then((data) => {
          if (data.activeTheme) setActiveSiteTheme(data.activeTheme);
        })
        .catch(() => {});

      // Fetch Homepage Hero Settings
      fetch('/api/admin/parametres')
        .then((res) => res.json())
        .then((data) => {
          if (data.settings) {
            const s = data.settings;
            if (s.homeHeroFontGlobal !== undefined) setHomeHeroFontGlobal(Boolean(s.homeHeroFontGlobal));
            if (s.homeHeroFontFamily) setHomeHeroFontFamily(s.homeHeroFontFamily);

            if (s.homeHeroBadgeFont) setHomeHeroBadgeFont(s.homeHeroBadgeFont);
            if (s.homeHeroBadgeSize) setHomeHeroBadgeSize(s.homeHeroBadgeSize);
            if (s.homeHeroBadgeColor) setHomeHeroBadgeColor(s.homeHeroBadgeColor);

            if (s.homeHeroTitleFont) setHomeHeroTitleFont(s.homeHeroTitleFont);
            if (s.homeHeroTitleSize) setHomeHeroTitleSize(s.homeHeroTitleSize);
            if (s.homeHeroTitleColor) setHomeHeroTitleColor(s.homeHeroTitleColor);

            if (s.homeHeroAccentFont) setHomeHeroAccentFont(s.homeHeroAccentFont);
            if (s.homeHeroAccentColor) setHomeHeroAccentColor(s.homeHeroAccentColor);

            if (s.homeHeroSubtitleFont) setHomeHeroSubtitleFont(s.homeHeroSubtitleFont);
            if (s.homeHeroSubtitleSize) setHomeHeroSubtitleSize(s.homeHeroSubtitleSize);
            if (s.homeHeroSubtitleColor) setHomeHeroSubtitleColor(s.homeHeroSubtitleColor);

            if (s.homeHeroAlign) setHomeHeroAlign(s.homeHeroAlign);
          }
        })
        .catch(() => {});

      const res = await fetch('/api/admin/homepage');
      const data = await res.json();
      if (data.sections) {
        const parsed = data.sections.map((s: any) => {
          let settingsObj = {};
          if (typeof s.settings === 'string' && s.settings.trim() !== '') {
            try {
              settingsObj = JSON.parse(s.settings);
            } catch (e) {}
          } else if (typeof s.settings === 'object' && s.settings !== null) {
            settingsObj = s.settings;
          }
          return { ...s, settings: settingsObj };
        });
        setSections(parsed);
      }
    } catch (err) {
      console.error('Failed to load homepage sections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const handleToggle = (id: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isEnabled: !s.isEnabled } : s))
    );
  };

  const handleFieldChange = (id: string, field: 'title' | 'subtitle', value: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const handleSettingChange = (id: string, settingKey: string, value: string) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const currentSettings = s.settings || {};
          return {
            ...s,
            settings: {
              ...currentSettings,
              [settingKey]: value,
            },
          };
        }
        return s;
      })
    );
  };

  const handleCreatorAvatarUpload = async (secId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', `Avatar - ${file.name}`);

      const res = await fetch('/api/admin/medias', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.media) {
        handleSettingChange(secId, 'creatorAvatar', data.media.url);
      } else {
        alert(data.error || 'Erreur lors du téléversement de l avatar.');
      }
    } catch (err) {
      console.error(err);
      alert('Échec du téléversement de la photo d avatar.');
    }
  };

  const handleBookCoverUpload = async (secId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', `eBook Cover - ${file.name}`);

      const res = await fetch('/api/admin/medias', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.media) {
        handleSettingChange(secId, 'bookCoverUrl', data.media.url);
      } else {
        alert(data.error || 'Erreur lors du téléversement de la couverture.');
      }
    } catch (err) {
      console.error(err);
      alert('Échec du téléversement de l image de couverture.');
    }
  };

  const handleTestimonialAvatarUpload = async (secId: string, itemIdx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', `Testimonial Avatar - ${file.name}`);

      const res = await fetch('/api/admin/medias', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.media) {
        handleTestimonialFieldChange(secId, itemIdx, 'avatar', data.media.url);
      } else {
        alert(data.error || 'Erreur lors du téléversement de la photo de témoignage.');
      }
    } catch (err) {
      console.error(err);
      alert('Échec du téléversement de la photo.');
    }
  };

  const handleTestimonialFieldChange = (secId: string, itemIdx: number, field: string, value: any) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id === secId) {
          const settingsObj = s.settings || {};
          const items = Array.isArray(settingsObj.items) ? [...settingsObj.items] : [
            { name: 'Rene Wells', role: 'Business Owner', quote: 'Professional work, awesome! From high-converting sales funnels to email sequences, everything was super smooth and increased our revenue immediately.', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80', rating: 5 },
            { name: 'Sophie C.', role: 'Consultante Marketing', quote: 'Les templates et systèmes de vente ont totalement changé ma gestion quotidienne. Je gagne plus de 5h par semaine !', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80', rating: 5 },
            { name: 'Alexandre Mercier', role: 'Consultant IA & Data', quote: 'Grâce au Dashboard Excel et aux templates Notion, j ai pu doubler mes revenus en 3 mois. Indispensable !', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80', rating: 5 },
            { name: 'Marc L.', role: 'Solopreneur Digital', quote: 'Excellente qualité des livrables. Les fichiers sont prêts à dupliquer et le support est ultra rapide.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80', rating: 5 },
            { name: 'Claire D.', role: 'Coach Indépendante', quote: 'Un vrai game-changer pour structurer mes offres et automatiser mes relances clients.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80', rating: 5 },
            { name: 'Thomas B.', role: 'Freelance Copywriter', quote: 'Les séquences email prêtes à l emploi m ont permis de signer 3 nouveaux clients dès la première semaine.', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80', rating: 5 },
          ];
          items[itemIdx] = { ...items[itemIdx], [field]: value };
          return { ...s, settings: { ...settingsObj, items } };
        }
        return s;
      })
    );
  };

  const handleAddTestimonial = (secId: string) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id === secId) {
          const settingsObj = s.settings || {};
          const items = Array.isArray(settingsObj.items) ? [...settingsObj.items] : [
            { name: 'Rene Wells', role: 'Business Owner', quote: 'Professional work, awesome! From high-converting sales funnels to email sequences, everything was super smooth and increased our revenue immediately.', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80', rating: 5 },
            { name: 'Sophie C.', role: 'Consultante Marketing', quote: 'Les templates et systèmes de vente ont totalement changé ma gestion quotidienne. Je gagne plus de 5h par semaine !', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80', rating: 5 },
            { name: 'Alexandre Mercier', role: 'Consultant IA & Data', quote: 'Grâce au Dashboard Excel et aux templates Notion, j ai pu doubler mes revenus en 3 mois. Indispensable !', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80', rating: 5 },
            { name: 'Marc L.', role: 'Solopreneur Digital', quote: 'Excellente qualité des livrables. Les fichiers sont prêts à dupliquer et le support est ultra rapide.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80', rating: 5 },
            { name: 'Claire D.', role: 'Coach Indépendante', quote: 'Un vrai game-changer pour structurer mes offres et automatiser mes relances clients.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80', rating: 5 },
            { name: 'Thomas B.', role: 'Freelance Copywriter', quote: 'Les séquences email prêtes à l emploi m ont permis de signer 3 nouveaux clients dès la première semaine.', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80', rating: 5 },
          ];
          items.push({
            name: 'Nouveau Client',
            role: 'Solopreneur & Creator',
            quote: 'Un système ultra efficace qui a transformé mon activité.',
            avatar: '',
            rating: 5,
          });
          return { ...s, settings: { ...settingsObj, items } };
        }
        return s;
      })
    );
  };

  const handleRemoveTestimonial = (secId: string, itemIdx: number) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id === secId) {
          const settingsObj = s.settings || {};
          const items = Array.isArray(settingsObj.items) ? [...settingsObj.items] : [];
          const updated = items.filter((_, idx) => idx !== itemIdx);
          return { ...s, settings: { ...settingsObj, items: updated } };
        }
        return s;
      })
    );
  };

  const insertFormattedTag = (
    id: string,
    field: 'title' | 'subtitle',
    tagType: 'mark' | 'u' | 'color',
    overrideColor?: string,
    overrideThickness?: string,
    overrideOffset?: string
  ) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const currentValue = (s as any)[field] || '';
          let tagToInsert = '';
          const col = overrideColor || uColor || selectedColor;
          const thick = overrideThickness || uThickness || '4px';
          const off = overrideOffset || uOffset || '3px';

          if (tagType === 'mark') {
            tagToInsert = `<mark color="${col}">texte surligné</mark>`;
          } else if (tagType === 'color') {
            tagToInsert = `<color color="${col}">texte en couleur</color>`;
          } else {
            tagToInsert = `<u color="${col}" thickness="${thick}" offset="${off}">texte souligné</u>`;
          }
          return {
            ...s,
            [field]: currentValue ? `${currentValue} ${tagToInsert}` : tagToInsert,
          };
        }
        return s;
      })
    );
  };

  const handleAddSectionFromModel = (sectionKey: string, insertAtIndex?: number) => {
    const model = BLOCK_MODELS_DEFAULT[sectionKey] || {
      title: `Nouvelle Section ${sectionKey}`,
      subtitle: '',
      settings: {},
    };

    const newSection: Section = {
      id: `sec-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      sectionKey,
      title: model.title,
      subtitle: model.subtitle,
      isEnabled: true,
      order: sections.length + 1,
      settings: JSON.parse(JSON.stringify(model.settings)),
    };

    setSections((prev) => {
      const updated = [...prev];
      if (typeof insertAtIndex === 'number' && insertAtIndex >= 0 && insertAtIndex <= updated.length) {
        updated.splice(insertAtIndex, 0, newSection);
      } else {
        updated.push(newSection);
      }
      return updated.map((s, idx) => ({ ...s, order: idx + 1 }));
    });

    setMessage(`Bloc "${sectionKey}" ajouté avec succès ! Vous pouvez personnaliser ses détails ci-dessous.`);
    setTimeout(() => setMessage(null), 4000);
  };

  const handleDeleteSection = (id: string, sectionKey: string) => {
    if (!window.confirm(`Voulez-vous vraiment supprimer le bloc "${sectionKey}" de la page ?`)) return;
    setSections((prev) => prev.filter((s) => s.id !== id).map((s, idx) => ({ ...s, order: idx + 1 })));
    setMessage(`Bloc "${sectionKey}" supprimé.`);
    setTimeout(() => setMessage(null), 3000);
  };

  useEffect(() => {
    const handleCustomAdd = (e: any) => {
      if (e.detail?.sectionKey) {
        handleAddSectionFromModel(e.detail.sectionKey);
      }
    };
    window.addEventListener('addSectionFromSidebar', handleCustomAdd);
    return () => window.removeEventListener('addSectionFromSidebar', handleCustomAdd);
  }, [sections]);

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;

    const updated = [...sections];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;

    setSections(updated);
  };

  const handleSaveBlock = async (section: Section) => {
    setSavingBlockId(section.id);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/homepage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: section.id,
          isEnabled: section.isEnabled,
          title: section.title,
          subtitle: section.subtitle,
          settings: section.settings,
          order: section.order,
        }),
      });
      if (res.ok) {
        setMessage(`Bloc "${section.sectionKey}" enregistré avec succès !`);
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      console.error('Failed to save block:', err);
    } finally {
      setSavingBlockId(null);
    }
  };

  const handleResetDefaults = async () => {
    if (!window.confirm('Voulez-vous vraiment restaurer/réinitialiser tous les blocs par défaut de la page d accueil ?')) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/homepage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetDefaults: true }),
      });
      const data = await res.json();
      if (data.sections) {
        const parsed = data.sections.map((s: any) => {
          let settingsObj = {};
          if (typeof s.settings === 'string' && s.settings.trim() !== '') {
            try {
              settingsObj = JSON.parse(s.settings);
            } catch (e) {}
          } else if (typeof s.settings === 'object' && s.settings !== null) {
            settingsObj = s.settings;
          }
          return { ...s, settings: settingsObj };
        });
        setSections(parsed);
        setMessage('Tous les blocs ont été restaurés avec succès !');
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      console.error('Failed to reset homepage defaults:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const heroFormatting = {
        homeHeroFontGlobal: false,
        homeHeroFontFamily,
        homeHeroBadgeFont,
        homeHeroBadgeSize,
        homeHeroBadgeColor,
        homeHeroTitleFont,
        homeHeroTitleSize,
        homeHeroTitleColor,
        homeHeroAccentFont,
        homeHeroAccentColor,
        homeHeroSubtitleFont,
        homeHeroSubtitleSize,
        homeHeroSubtitleColor,
        homeHeroAlign,
      };

      const payload = sections.map((sec, idx) => {
        let secSettings = typeof sec.settings === 'string' ? (JSON.parse(sec.settings || '{}') || {}) : (sec.settings || {});
        if (sec.sectionKey === 'HERO') {
          secSettings = { ...secSettings, heroStyles: heroFormatting };
        }
        return {
          id: sec.id,
          sectionKey: sec.sectionKey,
          title: sec.title,
          subtitle: sec.subtitle,
          isEnabled: sec.isEnabled,
          order: idx,
          settings: secSettings,
        };
      });

      await fetch('/api/admin/parametres', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(heroFormatting),
      });

      const res = await fetch('/api/admin/homepage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections: payload }),
      });

      if (res.ok) {
        setMessage('Configuration complète de la page d accueil enregistrée avec succès !');
        setTimeout(() => setMessage(null), 4000);
      } else {
        setMessage('Erreur lors de l enregistrement.');
      }
    } catch (err) {
      console.error('Failed to save homepage builder:', err);
    } finally {
      setSaving(false);
    }
  };

  const isPixelFunnelActive = activeSiteTheme === 'pixel-funnel';
  const heroSection = sections.find((s) => s.sectionKey === 'HERO') || sections[0];

  return (
    <div className="space-y-6 w-full max-w-none pt-2">
      
      {/* TOP HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-heading font-black text-slate-950 tracking-tight">Constructeur de Page d Accueil</h1>
            <Badge variant="emerald" className="text-xs font-heading font-black bg-[#a3e635] text-slate-950">
              {isPixelFunnelActive ? 'Studio Pixel HighLevel 🚀' : 'Studio Builder ⚡'}
            </Badge>
          </div>
          <p className="text-xs text-slate-600 font-medium mt-1">
            Gérez chaque élément du Hero (avec ses 3 cartes stats), du bandeau fluo et des 4 cartes de collections.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
          <Button
            type="button"
            onClick={handleResetDefaults}
            disabled={saving}
            variant="outline"
            size="sm"
            className="gap-1.5 font-bold text-xs text-slate-800 bg-white border-2 border-slate-200 hover:bg-slate-100 shadow-xs"
            title="Restaure tous les blocs par défaut"
          >
            <RotateCcw className="w-3.5 h-3.5 text-purple-600" />
            <span>Restaurer tous</span>
          </Button>

          <Link href="/" target="_blank">
            <Button variant="outline" size="sm" className="gap-1.5 font-bold text-xs text-slate-800 bg-white border-2 border-slate-200 hover:bg-slate-100 shadow-xs">
              <span>Voir le site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </Link>

          <Button
            onClick={handleSaveAll}
            disabled={saving}
            size="sm"
            className="btn-purple gap-1.5 font-heading font-black text-xs px-5 py-2.5 shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Enregistrement...' : 'Enregistrer tout'}</span>
          </Button>
        </div>
      </div>

      {/* PIXEL FUNNEL HIGHLEVEL THEME MODE INDICATOR BANNER */}
      {isPixelFunnelActive && (
        <div className="p-5 bg-slate-950 text-white rounded-3xl border-2 border-[#a3e635]/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#a3e635] text-slate-950 flex items-center justify-center font-black text-lg shadow-md shrink-0">
              🚀
            </div>
            <div>
              <div className="text-sm font-heading font-black text-white flex items-center gap-2">
                <span>Contrôleur Complet : Position #1 (Hero), Position #2 (Bandeau Fluo) & Position #3 (Collections)</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#a3e635] text-slate-950">
                  Dark Studio Mode
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                Chaque champ ci-dessous commande directement les éléments de votre page d accueil.
              </p>
            </div>
          </div>

          <Link href="/admin/themes">
            <Button size="sm" className="bg-[#a3e635] text-slate-950 font-heading font-black text-xs px-4 py-2 hover:bg-[#86efac] border-0 shrink-0">
              <span>Changer de Thème</span>
            </Button>
          </Link>
        </div>
      )}

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-2xl text-xs font-heading font-black shadow-sm">
          {message}
        </div>
      )}

      {/* ÉDITEUR ULTRA SOUPLE PAR ÉLÉMENT DE LA PAGE D'ACCUEIL */}
      <Card className="p-6 bg-white border border-slate-200 shadow-sm space-y-6 rounded-3xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-purple-600" />
            <h2 className="text-base font-extrabold text-slate-900">
              Outils de Formatage & Polices Google Fonts (Page d Accueil)
            </h2>
          </div>
          <Button
            type="button"
            onClick={handleSaveAll}
            disabled={saving}
            size="sm"
            className="bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs gap-1.5 px-4"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Enregistrer les styles</span>
          </Button>
        </div>

        {/* SELECTIONS D'ÉLÉMENT PAR ONGLETS INTERACTIFS */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
          <button
            type="button"
            onClick={() => setActiveHeroTab('badge')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              activeHeroTab === 'badge'
                ? 'bg-purple-700 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#a3e635]" />
            <span>1. Badge Flottant / Ticker</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveHeroTab('title')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              activeHeroTab === 'title'
                ? 'bg-purple-700 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>2. Titre H1 Hero</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveHeroTab('subtitle')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              activeHeroTab === 'subtitle'
                ? 'bg-purple-700 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>3. Sous-titre / Description</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveHeroTab('cta')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              activeHeroTab === 'cta'
                ? 'bg-purple-700 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <MousePointerClick className="w-3.5 h-3.5" />
            <span>4. Boutons d Action (CTA)</span>
          </button>
        </div>

        {/* CONTENU DE L'ONGLET SÉLECTIONNÉ */}
        <div className="p-5 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-4">

          {/* TAB 1: BADGE FLOTTANT */}
          {activeHeroTab === 'badge' && (
            <div className="space-y-4">
              {/* 1. POLICE / TAILLE / COULEUR DU BADGE (HAUT) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-purple-950 mb-1">Police du Badge</label>
                  <select
                    value={homeHeroBadgeFont}
                    onChange={(e) => setHomeHeroBadgeFont(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-purple-300 rounded-lg text-xs font-bold text-slate-900"
                  >
                    {GOOGLE_FONTS_OPTIONS.map((f) => (
                      <option key={f.name} value={f.name}>{f.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-purple-950 mb-1">Taille de Police</label>
                  <select
                    value={homeHeroBadgeSize}
                    onChange={(e) => setHomeHeroBadgeSize(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-purple-300 rounded-lg text-xs font-bold text-slate-900"
                  >
                    <option value="11px">Très Discret (11px)</option>
                    <option value="12px">Discret (12px)</option>
                    <option value="13px">Compact (13px)</option>
                    <option value="14px">Standard (14px)</option>
                    <option value="16px">Grand (16px)</option>
                    <option value="18px">Très Grand (18px)</option>
                    <option value="22px">Géant (22px)</option>
                    <option value="26px">Ultra Géant (26px)</option>
                    <option value="32px">Maxi Géant (32px)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-purple-950 mb-1">Couleur du Badge</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={homeHeroBadgeColor}
                      onChange={(e) => setHomeHeroBadgeColor(e.target.value)}
                      className="w-9 h-9 p-0.5 rounded cursor-pointer border border-slate-300"
                    />
                    <div className="flex items-center gap-1">
                      {COLOR_PALETTE.map((c) => (
                        <button
                          key={c.hex}
                          type="button"
                          onClick={() => setHomeHeroBadgeColor(c.hex)}
                          style={{ backgroundColor: c.hex }}
                          className="w-5 h-5 rounded-full border border-slate-400"
                          title={c.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. CONTENU DU TEXTE DU BADGE (BAS) */}
              <div>
                <label className="block text-xs font-extrabold text-purple-950 mb-1">
                  Contenu du Texte du Badge Flottant / Ticker
                </label>
                <input
                  type="text"
                  value={heroSection?.settings?.topTickerText || heroSection?.settings?.floatingBadge || '🚀 Nouveau Système 2026 • +5,400 Solopreneurs Équipés'}
                  onChange={(e) => {
                    if (heroSection) {
                      handleSettingChange(heroSection.id, 'topTickerText', e.target.value);
                      handleSettingChange(heroSection.id, 'floatingBadge', e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 bg-white border border-purple-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Texte du badge..."
                />
              </div>
            </div>
          )}

          {/* TAB 2: TITRE PRINCIPAL H1 HERO */}
          {activeHeroTab === 'title' && (
            <div className="space-y-4">
              {/* 1. POLICE / TAILLE / COULEUR DU TITRE H1 (HAUT) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-purple-950 mb-1">Police du Titre H1</label>
                  <select
                    value={homeHeroTitleFont}
                    onChange={(e) => setHomeHeroTitleFont(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-purple-300 rounded-lg text-xs font-bold text-slate-900"
                  >
                    {GOOGLE_FONTS_OPTIONS.map((f) => (
                      <option key={f.name} value={f.name}>{f.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-purple-950 mb-1">Taille du Titre H1</label>
                  <select
                    value={homeHeroTitleSize}
                    onChange={(e) => setHomeHeroTitleSize(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-purple-300 rounded-lg text-xs font-bold text-slate-900"
                  >
                    <option value="32px">Moyenne (32px)</option>
                    <option value="48px">Grande (48px)</option>
                    <option value="64px">Géante (64px)</option>
                    <option value="72px">Ultra Géante (72px)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-purple-950 mb-1">Couleur du Titre H1</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={homeHeroTitleColor}
                      onChange={(e) => setHomeHeroTitleColor(e.target.value)}
                      className="w-9 h-9 p-0.5 rounded cursor-pointer border border-slate-300"
                    />
                    <div className="flex items-center gap-1">
                      {COLOR_PALETTE.map((c) => (
                        <button
                          key={c.hex}
                          type="button"
                          onClick={() => setHomeHeroTitleColor(c.hex)}
                          style={{ backgroundColor: c.hex }}
                          className="w-5 h-5 rounded-full border border-slate-400"
                          title={c.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. PERSONNALISATION AVANCÉE DU SOULIGNEMENT <u> (MILIEU) */}
              <div className="p-3 bg-white border border-purple-200 rounded-xl space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-purple-950 flex items-center gap-1.5">
                    <Underline className="w-3.5 h-3.5 text-purple-700" />
                    Personnalisation du Soulignement (&lt;u&gt;) : Épaisseur & Décalage
                  </span>
                  <button
                    type="button"
                    onClick={() => heroSection && insertFormattedTag(heroSection.id, 'title', 'u', uColor, uThickness, uOffset)}
                    className="px-2.5 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-black shadow-xs flex items-center gap-1"
                  >
                    + Insérer &lt;u&gt; réglé
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Épaisseur du trait</label>
                    <select
                      value={uThickness}
                      onChange={(e) => setUThickness(e.target.value)}
                      className="w-full px-2 py-1 bg-slate-50 border border-purple-200 rounded-lg text-xs font-bold text-slate-900"
                    >
                      <option value="1px">Très fine (1px)</option>
                      <option value="2px">Fine (2px)</option>
                      <option value="4px">Moyenne - Standard (4px)</option>
                      <option value="6px">Épaisse (6px)</option>
                      <option value="8px">Très épaisse (8px)</option>
                      <option value="12px">Ultra épaisse (12px)</option>
                      <option value="35%">Socle partiel (35% hauteur)</option>
                      <option value="50%">Surlignage bas (50% hauteur)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Décalage / Position sous texte</label>
                    <select
                      value={uOffset}
                      onChange={(e) => setUOffset(e.target.value)}
                      className="w-full px-2 py-1 bg-slate-50 border border-purple-200 rounded-lg text-xs font-bold text-slate-900"
                    >
                      <option value="0px">Collé au texte (0px)</option>
                      <option value="2px">Proche (2px)</option>
                      <option value="4px">Standard (4px)</option>
                      <option value="6px">Éloigné (6px)</option>
                      <option value="9px">Très éloigné (9px)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Couleur du trait</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={uColor}
                        onChange={(e) => setUColor(e.target.value)}
                        className="w-7 h-7 p-0.5 rounded cursor-pointer border border-slate-300"
                      />
                      <div className="flex items-center gap-1 overflow-x-auto">
                        {COLOR_PALETTE.slice(0, 5).map((c) => (
                          <button
                            key={c.hex}
                            type="button"
                            onClick={() => setUColor(c.hex)}
                            style={{ backgroundColor: c.hex }}
                            className="w-4 h-4 rounded-full border border-slate-400 shrink-0"
                            title={c.name}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. CONTENU DU TITRE PRINCIPAL H1 (BAS) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-extrabold text-purple-950">
                    Contenu du Titre Principal H1
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => heroSection && insertFormattedTag(heroSection.id, 'title', 'mark')}
                      className="px-2 py-0.5 rounded bg-[#a3e635] text-slate-950 text-[10px] font-black"
                    >
                      + Surligner Néon (&lt;mark&gt;)
                    </button>
                    <button
                      type="button"
                      onClick={() => heroSection && insertFormattedTag(heroSection.id, 'title', 'color', uColor)}
                      className="px-2 py-0.5 rounded bg-purple-100 text-purple-950 border border-purple-300 text-[10px] font-black"
                    >
                      + Couleur Texte (&lt;color&gt;)
                    </button>
                    <button
                      type="button"
                      onClick={() => heroSection && insertFormattedTag(heroSection.id, 'title', 'u')}
                      className="px-2 py-0.5 rounded bg-white text-purple-950 border border-purple-300 text-[10px] font-black"
                    >
                      + Souligner (&lt;u&gt;)
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={heroSection?.title || ''}
                  onChange={(e) => heroSection && handleFieldChange(heroSection.id, 'title', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-purple-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Titre H1..."
                />
              </div>
            </div>
          )}

          {/* TAB 3: SOUS-TITRE / DESCRIPTION */}
          {activeHeroTab === 'subtitle' && (
            <div className="space-y-4">
              {/* 1. POLICE / TAILLE / COULEUR DU SOUS-TITRE (HAUT) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-purple-950 mb-1">Police du Sous-titre</label>
                  <select
                    value={homeHeroSubtitleFont}
                    onChange={(e) => setHomeHeroSubtitleFont(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-purple-300 rounded-lg text-xs font-bold text-slate-900"
                  >
                    {GOOGLE_FONTS_OPTIONS.map((f) => (
                      <option key={f.name} value={f.name}>{f.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-purple-950 mb-1">Taille du Sous-titre</label>
                  <select
                    value={homeHeroSubtitleSize}
                    onChange={(e) => setHomeHeroSubtitleSize(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-purple-300 rounded-lg text-xs font-bold text-slate-900"
                  >
                    <option value="14px">Discret (14px)</option>
                    <option value="16px">Standard (16px)</option>
                    <option value="18px">Grand (18px)</option>
                    <option value="22px">Très Grand (22px)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-purple-950 mb-1">Couleur du Sous-titre</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={homeHeroSubtitleColor}
                      onChange={(e) => setHomeHeroSubtitleColor(e.target.value)}
                      className="w-9 h-9 p-0.5 rounded cursor-pointer border border-slate-300"
                    />
                    <div className="flex items-center gap-1">
                      {COLOR_PALETTE.map((c) => (
                        <button
                          key={c.hex}
                          type="button"
                          onClick={() => setHomeHeroSubtitleColor(c.hex)}
                          style={{ backgroundColor: c.hex }}
                          className="w-5 h-5 rounded-full border border-slate-400"
                          title={c.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. PERSONNALISATION AVANCÉE DU SOULIGNEMENT <u> (MILIEU) */}
              <div className="p-3 bg-white border border-purple-200 rounded-xl space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-purple-950 flex items-center gap-1.5">
                    <Underline className="w-3.5 h-3.5 text-purple-700" />
                    Personnalisation du Soulignement (&lt;u&gt;) : Épaisseur & Décalage
                  </span>
                  <button
                    type="button"
                    onClick={() => heroSection && insertFormattedTag(heroSection.id, 'subtitle', 'u', uColor, uThickness, uOffset)}
                    className="px-2.5 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-black shadow-xs flex items-center gap-1"
                  >
                    + Insérer &lt;u&gt; réglé
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Épaisseur du trait</label>
                    <select
                      value={uThickness}
                      onChange={(e) => setUThickness(e.target.value)}
                      className="w-full px-2 py-1 bg-slate-50 border border-purple-200 rounded-lg text-xs font-bold text-slate-900"
                    >
                      <option value="1px">Très fine (1px)</option>
                      <option value="2px">Fine (2px)</option>
                      <option value="4px">Moyenne - Standard (4px)</option>
                      <option value="6px">Épaisse (6px)</option>
                      <option value="8px">Très épaisse (8px)</option>
                      <option value="12px">Ultra épaisse (12px)</option>
                      <option value="35%">Socle partiel (35% hauteur)</option>
                      <option value="50%">Surlignage bas (50% hauteur)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Décalage / Position sous texte</label>
                    <select
                      value={uOffset}
                      onChange={(e) => setUOffset(e.target.value)}
                      className="w-full px-2 py-1 bg-slate-50 border border-purple-200 rounded-lg text-xs font-bold text-slate-900"
                    >
                      <option value="0px">Collé au texte (0px)</option>
                      <option value="2px">Proche (2px)</option>
                      <option value="4px">Standard (4px)</option>
                      <option value="6px">Éloigné (6px)</option>
                      <option value="9px">Très éloigné (9px)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Couleur du trait</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={uColor}
                        onChange={(e) => setUColor(e.target.value)}
                        className="w-7 h-7 p-0.5 rounded cursor-pointer border border-slate-300"
                      />
                      <div className="flex items-center gap-1 overflow-x-auto">
                        {COLOR_PALETTE.slice(0, 5).map((c) => (
                          <button
                            key={c.hex}
                            type="button"
                            onClick={() => setUColor(c.hex)}
                            style={{ backgroundColor: c.hex }}
                            className="w-4 h-4 rounded-full border border-slate-400 shrink-0"
                            title={c.name}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. CONTENU DU SOUS-TITRE / DESCRIPTION (BAS) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-extrabold text-purple-950">
                    Contenu du Sous-titre / Description (Modifiable librement)
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => heroSection && insertFormattedTag(heroSection.id, 'subtitle', 'color', uColor)}
                      className="px-2 py-0.5 rounded bg-purple-100 text-purple-950 border border-purple-300 text-[10px] font-black"
                    >
                      + Couleur Texte (&lt;color&gt;)
                    </button>
                  </div>
                </div>
                <textarea
                  rows={2}
                  value={heroSection?.subtitle || ''}
                  onChange={(e) => heroSection && handleFieldChange(heroSection.id, 'subtitle', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-purple-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Description..."
                />
              </div>
            </div>
          )}

          {/* TAB 4: BOUTONS D'ACTION (CTA) */}
          {activeHeroTab === 'cta' && (
            <div className="space-y-6">
              {/* BOUTON PRINCIPAL #1 */}
              <div className="p-4 bg-white border border-purple-200 rounded-xl space-y-4 shadow-2xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-extrabold text-purple-950 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#a3e635]" />
                    Bouton Principal (#1) - Action Majeure
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">Ex: Boutique / Offre principale</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Texte du Bouton Principal</label>
                    <input
                      type="text"
                      value={heroSection?.settings?.btn1Text || 'Voir la boutique & les templates'}
                      onChange={(e) => heroSection && handleSettingChange(heroSection.id, 'btn1Text', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-purple-200 rounded-lg text-xs font-bold text-slate-900 focus:bg-white"
                      placeholder="Texte du bouton..."
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Lien / URL de destination</label>
                    <input
                      type="text"
                      value={heroSection?.settings?.btn1Url || '/boutique'}
                      onChange={(e) => heroSection && handleSettingChange(heroSection.id, 'btn1Url', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-purple-200 rounded-lg text-xs font-bold text-slate-900 focus:bg-white"
                      placeholder="/boutique..."
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Style Visuel du Bouton</label>
                    <select
                      value={heroSection?.settings?.btn1Style || 'yellow'}
                      onChange={(e) => heroSection && handleSettingChange(heroSection.id, 'btn1Style', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-purple-200 rounded-lg text-xs font-bold text-slate-900 focus:bg-white"
                    >
                      <option value="yellow">⚡ Fluo Néon (Jaune/Vert - Recommandé)</option>
                      <option value="purple">💜 Violet Solopreneur</option>
                      <option value="white">⚪ Blanc Moderne</option>
                      <option value="dark">⚫ Sombre Élégant</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* BOUTON SECONDAIRE #2 */}
              <div className="p-4 bg-white border border-purple-200 rounded-xl space-y-4 shadow-2xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-extrabold text-purple-950 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                    Bouton Secondaire (#2) - Action Complémentaire
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">Ex: Ressources Gratuites</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Texte du Bouton Secondaire</label>
                    <input
                      type="text"
                      value={heroSection?.settings?.btn2Text || 'Ressources Gratuites'}
                      onChange={(e) => heroSection && handleSettingChange(heroSection.id, 'btn2Text', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-purple-200 rounded-lg text-xs font-bold text-slate-900 focus:bg-white"
                      placeholder="Texte du bouton..."
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Lien / URL de destination</label>
                    <input
                      type="text"
                      value={heroSection?.settings?.btn2Url || '/ressources'}
                      onChange={(e) => heroSection && handleSettingChange(heroSection.id, 'btn2Url', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-purple-200 rounded-lg text-xs font-bold text-slate-900 focus:bg-white"
                      placeholder="/ressources..."
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Style Visuel du Bouton</label>
                    <select
                      value={heroSection?.settings?.btn2Style || 'transparent'}
                      onChange={(e) => heroSection && handleSettingChange(heroSection.id, 'btn2Style', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-purple-200 rounded-lg text-xs font-bold text-slate-900 focus:bg-white"
                    >
                      <option value="transparent">🔲 Contour Translucide (Recommandé)</option>
                      <option value="yellow">⚡ Fluo Néon (Jaune/Vert)</option>
                      <option value="purple">💜 Violet Solopreneur</option>
                      <option value="white">⚪ Blanc Moderne</option>
                      <option value="dark">⚫ Sombre Élégant</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* APERÇU INTERACTIF HOMEPAGE HERO */}
        <div
          className={`p-6 bg-[#050811] text-white rounded-2xl border border-slate-800 space-y-4 shadow-xl ${
            homeHeroAlign === 'left' ? 'text-left' : homeHeroAlign === 'right' ? 'text-right' : 'text-center'
          }`}
        >
          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block">
            Aperçu interactif Hero (Police : {homeHeroFontGlobal ? homeHeroFontFamily : 'Individuelle par élément'})
          </span>

          {loading ? (
            <div className="py-6 space-y-3 animate-pulse">
              <div className="h-5 bg-slate-800 rounded-full w-56 mx-auto" />
              <div className="h-9 bg-slate-800 rounded-xl w-3/4 mx-auto" />
              <div className="h-4 bg-slate-800 rounded-lg w-1/2 mx-auto" />
            </div>
          ) : (
            <>
              <div
                onClick={() => setActiveHeroTab('badge')}
                style={{
                  fontFamily: `'${homeHeroFontGlobal ? homeHeroFontFamily : homeHeroBadgeFont}', sans-serif`,
                  fontSize: homeHeroBadgeSize,
                  color: homeHeroBadgeColor,
                  borderColor: `${homeHeroBadgeColor}40`,
                  backgroundColor: `${homeHeroBadgeColor}15`,
                }}
                className={`inline-block px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider border cursor-pointer hover:ring-2 hover:ring-white transition-all ${
                  activeHeroTab === 'badge' ? 'ring-2 ring-purple-400' : ''
                }`}
              >
                {heroSection?.settings?.topTickerText || heroSection?.settings?.floatingBadge || '⚡ Badge Hero'}
              </div>

              <h3
                onClick={() => setActiveHeroTab('title')}
                style={{
                  fontFamily: `'${homeHeroFontGlobal ? homeHeroFontFamily : homeHeroTitleFont}', sans-serif`,
                  fontSize: homeHeroTitleSize,
                  color: homeHeroTitleColor,
                }}
                className={`font-black tracking-tight leading-tight cursor-pointer hover:opacity-90 transition-all ${
                  activeHeroTab === 'title' ? 'ring-1 ring-purple-400 p-1 rounded' : ''
                }`}
              >
                <FormattedText text={heroSection?.title || 'Titre Hero'} defaultMarkColor={homeHeroAccentColor} />
              </h3>

              {heroSection?.subtitle && (
                <p
                  onClick={() => setActiveHeroTab('subtitle')}
                  style={{
                    fontFamily: `'${homeHeroFontGlobal ? homeHeroFontFamily : homeHeroSubtitleFont}', sans-serif`,
                    fontSize: homeHeroSubtitleSize,
                    color: homeHeroSubtitleColor,
                  }}
                  className={`max-w-2xl leading-relaxed cursor-pointer hover:opacity-90 transition-all ${
                    homeHeroAlign === 'left' ? 'mr-auto' : homeHeroAlign === 'right' ? 'ml-auto' : 'mx-auto'
                  } ${activeHeroTab === 'subtitle' ? 'ring-1 ring-purple-400 p-1 rounded' : ''}`}
                >
                  <FormattedText text={heroSection.subtitle} defaultMarkColor={homeHeroAccentColor} />
                </p>
              )}
            </>
          )}
        </div>
      </Card>

          {/* SECTIONS LIST CANVAS DROPZONE */}
          {loading ? (
            <div className="py-12 text-center text-slate-500 font-medium bg-white rounded-3xl border border-slate-200">
              Chargement des blocs de la page d accueil...
            </div>
          ) : (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
              }}
              onDrop={(e) => {
                e.preventDefault();
                try {
                  const data = e.dataTransfer.getData('application/json');
                  if (data) {
                    const parsed = JSON.parse(data);
                    if (parsed.sectionKey) {
                      handleAddSectionFromModel(parsed.sectionKey);
                    }
                  }
                } catch (err) {
                  console.error(err);
                }
              }}
              className="space-y-6 min-h-[300px] p-2 border-2 border-dashed border-slate-200/80 rounded-3xl bg-slate-50/50"
            >
          {sections.map((sec, index) => {
            const settings = sec.settings || {};
            const isTickerSection = sec.sectionKey === 'TICKER';

            return (
              <Card
                key={sec.id}
                className={`p-6 bg-white transition-all rounded-3xl border ${
                  sec.isEnabled ? 'border-slate-200/90 shadow-sm' : 'border-slate-200 opacity-60 bg-slate-50/50'
                }`}
              >
                <div className="space-y-6">
                  
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    
                    {/* REORDER CONTROLS + FORM */}
                    <div className="flex items-start gap-4 flex-grow">
                      
                      {/* REORDER BUTTONS */}
                      <div className="flex flex-col gap-1 pt-1">
                        <button
                          onClick={() => handleMove(index, 'up')}
                          disabled={index === 0}
                          className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 text-slate-600"
                          title="Déplacer vers le haut"
                        >
                          <MoveUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleMove(index, 'down')}
                          disabled={index === sections.length - 1}
                          className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 text-slate-600"
                          title="Déplacer vers le bas"
                        >
                          <MoveDown className="w-4 h-4" />
                        </button>
                      </div>

                      {/* FORM FIELDS */}
                      <div className="space-y-5 flex-grow">
                        
                        {/* HEADER BADGE & PREVIEW */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="indigo" className="text-[11px] font-mono font-extrabold uppercase px-2.5 py-0.5">
                              {sec.sectionKey}
                            </Badge>

                            {isPixelFunnelActive && (
                              <span className="px-2.5 py-0.5 bg-[#a3e635] text-slate-950 text-[10px] font-heading font-black rounded-full shadow-xs">
                                Contrôle Complet Pixels
                              </span>
                            )}

                            <span className="text-xs text-slate-400 font-semibold">Position #{index + 1}</span>
                          </div>

                          {/* LIVE PREVIEW OF FORMATTED TITLE (IF NOT TICKER) */}
                          {!isTickerSection && (
                            <div className="text-xs bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl text-white max-w-md truncate shadow-sm">
                              <span className="text-[10px] text-slate-400 font-bold uppercase mr-1.5">Aperçu :</span>
                              <FormattedText text={sec.title} className="font-extrabold text-white" />
                            </div>
                          )}
                        </div>

                        {/* RENDER TITLE & SUBTITLE FIELDS ONLY FOR NON-TICKER AND NON-HERO SECTIONS */}
                        {!isTickerSection && (
                          sec.sectionKey === 'HERO' ? (
                            <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-purple-950 text-xs font-bold my-2">
                              <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                                <span>
                                  Le titre, le sous-titre, les polices, les tailles et les couleurs du bloc <strong>HERO</strong> sont désormais directement contrôlés par le module <strong>« Outils de Formatage & Polices Google Fonts »</strong> en haut de page.
                                </span>
                              </div>
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                className="bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shrink-0"
                              >
                                Remonter au module ↑
                              </Button>
                            </div>
                          ) : (
                            (() => {
                              const activeTab = sectionTabs[sec.id] || 'title';
                              return (
                                <div className="space-y-4">
                                  {/* MENU D'ONGLETS DU BLOC (5 ONGLETS) */}
                                  <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-purple-100/70 border border-purple-200 rounded-xl text-xs font-bold shadow-2xs">
                                    <button
                                      type="button"
                                      onClick={() => setSectionTabs((prev) => ({ ...prev, [sec.id]: 'badge' }))}
                                      className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 font-heading font-black ${
                                        activeTab === 'badge' ? 'bg-purple-700 text-white shadow-xs' : 'text-purple-950 hover:bg-purple-200/60'
                                      }`}
                                    >
                                      🏷️ 1. Badge Flottant
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => setSectionTabs((prev) => ({ ...prev, [sec.id]: 'title' }))}
                                      className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 font-heading font-black ${
                                        activeTab === 'title' ? 'bg-purple-700 text-white shadow-xs' : 'text-purple-950 hover:bg-purple-200/60'
                                      }`}
                                    >
                                      ✍️ 2. Titre H1 / H2
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => setSectionTabs((prev) => ({ ...prev, [sec.id]: 'subtitle' }))}
                                      className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 font-heading font-black ${
                                        activeTab === 'subtitle' ? 'bg-purple-700 text-white shadow-xs' : 'text-purple-950 hover:bg-purple-200/60'
                                      }`}
                                    >
                                      📝 3. Sous-titre / Description
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => setSectionTabs((prev) => ({ ...prev, [sec.id]: 'cta' }))}
                                      className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 font-heading font-black ${
                                        activeTab === 'cta' ? 'bg-purple-700 text-white shadow-xs' : 'text-purple-950 hover:bg-purple-200/60'
                                      }`}
                                    >
                                      🚀 4. Bouton d Action
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => setSectionTabs((prev) => ({ ...prev, [sec.id]: 'reassurance' }))}
                                      className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 font-heading font-black ${
                                        activeTab === 'reassurance' ? 'bg-purple-700 text-white shadow-xs' : 'text-purple-950 hover:bg-purple-200/60'
                                      }`}
                                    >
                                      🛡️ 5. Réassurances 1 & 2
                                    </button>
                                  </div>

                                  {/* TAB 1: BADGE FLOTTANT */}
                                  {activeTab === 'badge' && (
                                    <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl space-y-4 shadow-2xs">
                                      <div className="flex items-center justify-between">
                                        <label className="block text-xs font-extrabold uppercase text-purple-950 flex items-center gap-1.5">
                                          <span>🏷️ 1. Personnalisation du Badge Flottant Supérieur du Bloc</span>
                                        </label>
                                      </div>

                                      {/* POLICE / TAILLE / COULEURS DU BADGE */}
                                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-3 bg-white border border-purple-200 rounded-xl">
                                        <div>
                                          <label className="block text-[11px] font-bold text-purple-950 mb-1">Police du Badge</label>
                                          <select
                                            value={sec.settings?.badgeFont || 'Plus Jakarta Sans'}
                                            onChange={(e) => handleSettingChange(sec.id, 'badgeFont', e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-purple-300 rounded-lg text-xs font-bold text-slate-900"
                                          >
                                            {GOOGLE_FONTS_OPTIONS.map((f) => (
                                              <option key={f.name} value={f.name}>{f.name}</option>
                                            ))}
                                          </select>
                                        </div>

                                        <div>
                                          <label className="block text-[11px] font-bold text-purple-950 mb-1">Taille du Badge</label>
                                          <select
                                            value={sec.settings?.badgeSize || '13px'}
                                            onChange={(e) => handleSettingChange(sec.id, 'badgeSize', e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-purple-300 rounded-lg text-xs font-bold text-slate-900"
                                          >
                                            <option value="11px">Très Discret (11px)</option>
                                            <option value="12px">Discret (12px)</option>
                                            <option value="13px">Compact (13px)</option>
                                            <option value="14px">Standard (14px)</option>
                                            <option value="16px">Grand (16px)</option>
                                            <option value="18px">Très Grand (18px)</option>
                                            <option value="22px">Géant (22px)</option>
                                            <option value="26px">Ultra Géant (26px)</option>
                                            <option value="32px">Maxi Géant (32px)</option>
                                          </select>
                                        </div>

                                        <div>
                                          <label className="block text-[11px] font-bold text-purple-950 mb-1">Couleur Texte & Icône</label>
                                          <div className="flex items-center gap-2">
                                            <input
                                              type="color"
                                              value={sec.settings?.badgeColor || '#a3e635'}
                                              onChange={(e) => handleSettingChange(sec.id, 'badgeColor', e.target.value)}
                                              className="w-8 h-8 p-0.5 rounded cursor-pointer border border-slate-300 shrink-0"
                                            />
                                            <div className="flex items-center gap-1 overflow-x-auto">
                                              {COLOR_PALETTE.slice(0, 4).map((c) => (
                                                <button
                                                  key={c.hex}
                                                  type="button"
                                                  onClick={() => handleSettingChange(sec.id, 'badgeColor', c.hex)}
                                                  style={{ backgroundColor: c.hex }}
                                                  className="w-4.5 h-4.5 rounded-full border border-slate-400 shrink-0"
                                                  title={c.name}
                                                />
                                              ))}
                                            </div>
                                          </div>
                                        </div>

                                        <div>
                                          <label className="block text-[11px] font-bold text-purple-950 mb-1">Couleur Fond (Bouton Flottant)</label>
                                          <div className="flex items-center gap-2">
                                            <input
                                              type="color"
                                              value={sec.settings?.badgeBgColor || '#a3e635'}
                                              onChange={(e) => handleSettingChange(sec.id, 'badgeBgColor', e.target.value)}
                                              className="w-8 h-8 p-0.5 rounded cursor-pointer border border-slate-300 shrink-0"
                                            />
                                            <div className="flex items-center gap-1 overflow-x-auto">
                                              {COLOR_PALETTE.slice(0, 4).map((c) => (
                                                <button
                                                  key={c.hex}
                                                  type="button"
                                                  onClick={() => handleSettingChange(sec.id, 'badgeBgColor', c.hex)}
                                                  style={{ backgroundColor: c.hex }}
                                                  className="w-4.5 h-4.5 rounded-full border border-slate-400 shrink-0"
                                                  title={c.name}
                                                />
                                              ))}
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      <div>
                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Contenu du Texte du Badge Flottant</label>
                                        <input
                                          type="text"
                                          value={sec.settings?.badgeText || sec.settings?.topTickerText || sec.settings?.floatingBadge || ''}
                                          onChange={(e) => {
                                            handleSettingChange(sec.id, 'badgeText', e.target.value);
                                            handleSettingChange(sec.id, 'topTickerText', e.target.value);
                                            handleSettingChange(sec.id, 'floatingBadge', e.target.value);
                                          }}
                                          className="w-full px-3.5 py-2.5 bg-white border border-purple-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                          placeholder="Saisissez le texte du badge (ex: EBOOK OFFERT A 100%)..."
                                        />
                                      </div>
                                    </div>
                                  )}

                                  {/* TAB 2: TITRE PRINCIPAL H1 / H2 */}
                                  {activeTab === 'title' && (
                                    <div className="space-y-4">
                                      {/* POLICE / TAILLE / COULEUR DU TITRE */}
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-white border border-purple-200 rounded-xl shadow-2xs">
                                        <div>
                                          <label className="block text-[11px] font-bold text-purple-950 mb-1">Police du Titre</label>
                                          <select
                                            value={sec.settings?.titleFont || 'Plus Jakarta Sans'}
                                            onChange={(e) => handleSettingChange(sec.id, 'titleFont', e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-purple-300 rounded-lg text-xs font-bold text-slate-900"
                                          >
                                            {GOOGLE_FONTS_OPTIONS.map((f) => (
                                              <option key={f.name} value={f.name}>{f.name}</option>
                                            ))}
                                          </select>
                                        </div>

                                        <div>
                                          <label className="block text-[11px] font-bold text-purple-950 mb-1">Taille du Titre</label>
                                          <select
                                            value={sec.settings?.titleSize || '32px'}
                                            onChange={(e) => handleSettingChange(sec.id, 'titleSize', e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-purple-300 rounded-lg text-xs font-bold text-slate-900"
                                          >
                                            <option value="28px">Moyenne (28px)</option>
                                            <option value="32px">Standard (32px)</option>
                                            <option value="40px">Grande (40px)</option>
                                            <option value="48px">Très Grande (48px)</option>
                                            <option value="64px">Géante (64px)</option>
                                          </select>
                                        </div>

                                        <div>
                                          <label className="block text-[11px] font-bold text-purple-950 mb-1">Couleur du Titre</label>
                                          <div className="flex items-center gap-2">
                                            <input
                                              type="color"
                                              value={sec.settings?.titleColor || '#ffffff'}
                                              onChange={(e) => handleSettingChange(sec.id, 'titleColor', e.target.value)}
                                              className="w-9 h-9 p-0.5 rounded cursor-pointer border border-slate-300 shrink-0"
                                            />
                                            <div className="flex items-center gap-1 overflow-x-auto">
                                              {COLOR_PALETTE.map((c) => (
                                                <button
                                                  key={c.hex}
                                                  type="button"
                                                  onClick={() => handleSettingChange(sec.id, 'titleColor', c.hex)}
                                                  style={{ backgroundColor: c.hex }}
                                                  className="w-5 h-5 rounded-full border border-slate-400 shrink-0"
                                                  title={c.name}
                                                />
                                              ))}
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      {/* PANNEAU DE PERSONNALISATION DU SOULIGNEMENT <u> */}
                                      <div className="p-3 bg-purple-50/60 border border-purple-200 rounded-xl space-y-3 shadow-2xs">
                                        <div className="flex items-center justify-between">
                                          <span className="text-[11px] font-extrabold text-purple-950 flex items-center gap-1.5">
                                            <Underline className="w-3.5 h-3.5 text-purple-700" />
                                            Personnalisation du Soulignement (&lt;u&gt;) : Épaisseur & Décalage
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => insertFormattedTag(sec.id, 'title', 'u', uColor, uThickness, uOffset)}
                                            className="px-2 py-0.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-[10px] font-black shadow-xs"
                                          >
                                            + Insérer &lt;u&gt; au Titre
                                          </button>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                                          <div>
                                            <label className="block text-[10px] font-bold text-slate-600 mb-1">Épaisseur du trait</label>
                                            <select
                                              value={uThickness}
                                              onChange={(e) => setUThickness(e.target.value)}
                                              className="w-full px-2 py-1 bg-white border border-purple-200 rounded-lg text-xs font-bold text-slate-900"
                                            >
                                              <option value="1px">Très fine (1px)</option>
                                              <option value="2px">Fine (2px)</option>
                                              <option value="4px">Moyenne - Standard (4px)</option>
                                              <option value="6px">Épaisse (6px)</option>
                                              <option value="8px">Très épaisse (8px)</option>
                                              <option value="12px">Ultra épaisse (12px)</option>
                                              <option value="35%">Socle partiel (35% hauteur)</option>
                                              <option value="50%">Surlignage bas (50% hauteur)</option>
                                            </select>
                                          </div>

                                          <div>
                                            <label className="block text-[10px] font-bold text-slate-600 mb-1">Décalage / Position sous texte</label>
                                            <select
                                              value={uOffset}
                                              onChange={(e) => setUOffset(e.target.value)}
                                              className="w-full px-2 py-1 bg-white border border-purple-200 rounded-lg text-xs font-bold text-slate-900"
                                            >
                                              <option value="0px">Collé au texte (0px)</option>
                                              <option value="2px">Proche (2px)</option>
                                              <option value="4px">Standard (4px)</option>
                                              <option value="6px">Éloigné (6px)</option>
                                              <option value="9px">Très éloigné (9px)</option>
                                            </select>
                                          </div>

                                          <div>
                                            <label className="block text-[10px] font-bold text-slate-600 mb-1">Couleur du trait</label>
                                            <div className="flex items-center gap-2">
                                              <input
                                                type="color"
                                                value={uColor}
                                                onChange={(e) => setUColor(e.target.value)}
                                                className="w-7 h-7 p-0.5 rounded cursor-pointer border border-slate-300"
                                              />
                                              <div className="flex items-center gap-1 overflow-x-auto">
                                                {COLOR_PALETTE.slice(0, 5).map((c) => (
                                                  <button
                                                    key={c.hex}
                                                    type="button"
                                                    onClick={() => setUColor(c.hex)}
                                                    style={{ backgroundColor: c.hex }}
                                                    className="w-4 h-4 rounded-full border border-slate-400 shrink-0"
                                                    title={c.name}
                                                  />
                                                ))}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      {/* INPUT TITRE */}
                                      <div className="space-y-2">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                          <label className="block text-[11px] font-extrabold uppercase text-slate-700">
                                            ✍️ 2. Titre principal du bloc H1 / H2
                                          </label>
                                          
                                          {/* QUICK FORMATTING INSERT BUTTONS */}
                                          <div className="flex items-center gap-1.5">
                                            <button
                                              type="button"
                                              onClick={() => insertFormattedTag(sec.id, 'title', 'mark')}
                                              className="px-2 py-0.5 rounded bg-[#a3e635] text-slate-950 text-[10px] font-black"
                                            >
                                              + Surligner Néon (&lt;mark&gt;)
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => insertFormattedTag(sec.id, 'title', 'color', uColor)}
                                              className="px-2 py-0.5 rounded bg-purple-100 text-purple-950 border border-purple-300 text-[10px] font-black"
                                            >
                                              + Couleur Texte (&lt;color&gt;)
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => insertFormattedTag(sec.id, 'title', 'u', uColor, uThickness, uOffset)}
                                              className="px-2 py-0.5 rounded bg-white text-purple-950 border border-purple-300 text-[10px] font-black"
                                            >
                                              + Souligner (&lt;u&gt;)
                                            </button>
                                          </div>
                                        </div>

                                        <input
                                          type="text"
                                          value={sec.title}
                                          onChange={(e) => handleFieldChange(sec.id, 'title', e.target.value)}
                                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                          placeholder="Titre du bloc..."
                                        />
                                      </div>
                                    </div>
                                  )}

                                  {/* TAB 3: SOUS-TITRE / DESCRIPTION */}
                                  {activeTab === 'subtitle' && (
                                    <div className="space-y-4 p-4 bg-purple-50/70 border border-purple-200 rounded-xl shadow-2xs">
                                      {/* POLICE / TAILLE / COULEUR DU SOUS-TITRE */}
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-white border border-purple-200 rounded-xl">
                                        <div>
                                          <label className="block text-[11px] font-bold text-purple-950 mb-1">Police du Sous-titre</label>
                                          <select
                                            value={sec.settings?.subtitleFont || 'Plus Jakarta Sans'}
                                            onChange={(e) => handleSettingChange(sec.id, 'subtitleFont', e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-purple-300 rounded-lg text-xs font-bold text-slate-900"
                                          >
                                            {GOOGLE_FONTS_OPTIONS.map((f) => (
                                              <option key={f.name} value={f.name}>{f.name}</option>
                                            ))}
                                          </select>
                                        </div>

                                        <div>
                                          <label className="block text-[11px] font-bold text-purple-950 mb-1">Taille du Sous-titre</label>
                                          <select
                                            value={sec.settings?.subtitleSize || '16px'}
                                            onChange={(e) => handleSettingChange(sec.id, 'subtitleSize', e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-purple-300 rounded-lg text-xs font-bold text-slate-900"
                                          >
                                            <option value="14px">Discret (14px)</option>
                                            <option value="16px">Standard (16px)</option>
                                            <option value="18px">Grand (18px)</option>
                                            <option value="20px">Très Grand (20px)</option>
                                          </select>
                                        </div>

                                        <div>
                                          <label className="block text-[11px] font-bold text-purple-950 mb-1">Couleur du Sous-titre</label>
                                          <div className="flex items-center gap-2">
                                            <input
                                              type="color"
                                              value={sec.settings?.subtitleColor || '#94a3b8'}
                                              onChange={(e) => handleSettingChange(sec.id, 'subtitleColor', e.target.value)}
                                              className="w-9 h-9 p-0.5 rounded cursor-pointer border border-slate-300 shrink-0"
                                            />
                                            <div className="flex items-center gap-1 overflow-x-auto">
                                              {COLOR_PALETTE.map((c) => (
                                                <button
                                                  key={c.hex}
                                                  type="button"
                                                  onClick={() => handleSettingChange(sec.id, 'subtitleColor', c.hex)}
                                                  style={{ backgroundColor: c.hex }}
                                                  className="w-5 h-5 rounded-full border border-slate-400 shrink-0"
                                                  title={c.name}
                                                />
                                              ))}
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="space-y-2">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                          <label className="block text-[11px] font-extrabold uppercase text-purple-950">
                                            📝 3. Sous-titre / Description du bloc (Modifiable librement)
                                          </label>

                                          <div className="flex items-center gap-1.5">
                                            <button
                                              type="button"
                                              onClick={() => insertFormattedTag(sec.id, 'subtitle', 'mark')}
                                              className="px-2 py-0.5 rounded bg-[#a3e635] text-slate-950 text-[10px] font-black"
                                            >
                                              + Surligner Néon (&lt;mark&gt;)
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => insertFormattedTag(sec.id, 'subtitle', 'color', uColor)}
                                              className="px-2 py-0.5 rounded bg-purple-100 text-purple-950 border border-purple-300 text-[10px] font-black"
                                            >
                                              + Couleur Texte (&lt;color&gt;)
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => insertFormattedTag(sec.id, 'subtitle', 'u', uColor, uThickness, uOffset)}
                                              className="px-2 py-0.5 rounded bg-white text-purple-950 border border-purple-300 text-[10px] font-black"
                                            >
                                              + Souligner (&lt;u&gt;)
                                            </button>
                                          </div>
                                        </div>

                                        <textarea
                                          rows={4}
                                          value={sec.subtitle || ''}
                                          onChange={(e) => handleFieldChange(sec.id, 'subtitle', e.target.value)}
                                          className="w-full px-3.5 py-2.5 bg-white border border-purple-300 rounded-xl text-xs font-semibold text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                          placeholder="Saisissez la description du bloc..."
                                        />
                                      </div>
                                    </div>
                                  )}

                                  {/* TAB 4: BOUTON D'ACTION (CTA) */}
                                  {activeTab === 'cta' && (
                                    <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl space-y-4 shadow-2xs">
                                      <label className="block text-xs font-extrabold uppercase text-purple-950">
                                        🚀 4. Texte & Style du Bouton d Action (Bouton d Envoi)
                                      </label>

                                      {/* POLICE / TAILLE / COULEUR DU BOUTON */}
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-white border border-purple-200 rounded-xl">
                                        <div>
                                          <label className="block text-[11px] font-bold text-purple-950 mb-1">Police du Bouton</label>
                                          <select
                                            value={sec.settings?.btnFont || 'Plus Jakarta Sans'}
                                            onChange={(e) => handleSettingChange(sec.id, 'btnFont', e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-purple-300 rounded-lg text-xs font-bold text-slate-900"
                                          >
                                            {GOOGLE_FONTS_OPTIONS.map((f) => (
                                              <option key={f.name} value={f.name}>{f.name}</option>
                                            ))}
                                          </select>
                                        </div>

                                        <div>
                                          <label className="block text-[11px] font-bold text-purple-950 mb-1">Taille du Texte</label>
                                          <select
                                            value={sec.settings?.btnSize || '15px'}
                                            onChange={(e) => handleSettingChange(sec.id, 'btnSize', e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-purple-300 rounded-lg text-xs font-bold text-slate-900"
                                          >
                                            <option value="13px">Compact (13px)</option>
                                            <option value="15px">Standard (15px)</option>
                                            <option value="18px">Grand (18px)</option>
                                            <option value="20px">Très Grand (20px)</option>
                                          </select>
                                        </div>

                                        <div>
                                          <label className="block text-[11px] font-bold text-purple-950 mb-1">Couleur du Bouton</label>
                                          <div className="flex items-center gap-2">
                                            <input
                                              type="color"
                                              value={sec.settings?.btnColor || '#a3e635'}
                                              onChange={(e) => handleSettingChange(sec.id, 'btnColor', e.target.value)}
                                              className="w-9 h-9 p-0.5 rounded cursor-pointer border border-slate-300 shrink-0"
                                            />
                                            <div className="flex items-center gap-1 overflow-x-auto">
                                              {COLOR_PALETTE.map((c) => (
                                                <button
                                                  key={c.hex}
                                                  type="button"
                                                  onClick={() => handleSettingChange(sec.id, 'btnColor', c.hex)}
                                                  style={{ backgroundColor: c.hex }}
                                                  className="w-5 h-5 rounded-full border border-slate-400 shrink-0"
                                                  title={c.name}
                                                />
                                              ))}
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      <div>
                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Texte du Bouton d Action (Envoi)</label>
                                        <input
                                          type="text"
                                          value={sec.settings?.btnText || sec.settings?.btn1Text || ''}
                                          onChange={(e) => {
                                            handleSettingChange(sec.id, 'btnText', e.target.value);
                                            handleSettingChange(sec.id, 'btn1Text', e.target.value);
                                          }}
                                          className="w-full px-3.5 py-2.5 bg-white border border-purple-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                          placeholder="Send My FREE Guide 🚀..."
                                        />
                                      </div>
                                    </div>
                                  )}

                                  {/* TAB 5: PUCES DE RÉASSURANCE */}
                                  {activeTab === 'reassurance' && (
                                    <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl space-y-4 shadow-2xs">
                                      <label className="block text-xs font-extrabold uppercase text-purple-950">
                                        🛡️ 5. Puces de Réassurance (Sous le bouton)
                                      </label>

                                      {/* POLICE / TAILLE / COULEUR DES RÉASSURANCES */}
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-white border border-purple-200 rounded-xl">
                                        <div>
                                          <label className="block text-[11px] font-bold text-purple-950 mb-1">Police des Puces</label>
                                          <select
                                            value={sec.settings?.reassuranceFont || 'Plus Jakarta Sans'}
                                            onChange={(e) => handleSettingChange(sec.id, 'reassuranceFont', e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-purple-300 rounded-lg text-xs font-bold text-slate-900"
                                          >
                                            {GOOGLE_FONTS_OPTIONS.map((f) => (
                                              <option key={f.name} value={f.name}>{f.name}</option>
                                            ))}
                                          </select>
                                        </div>

                                        <div>
                                          <label className="block text-[11px] font-bold text-purple-950 mb-1">Taille des Puces</label>
                                          <select
                                            value={sec.settings?.reassuranceSize || '12px'}
                                            onChange={(e) => handleSettingChange(sec.id, 'reassuranceSize', e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-purple-300 rounded-lg text-xs font-bold text-slate-900"
                                          >
                                            <option value="11px">Très Discret (11px)</option>
                                            <option value="12px">Standard (12px)</option>
                                            <option value="13px">Grand (13px)</option>
                                            <option value="14px">Très Grand (14px)</option>
                                          </select>
                                        </div>

                                        <div>
                                          <label className="block text-[11px] font-bold text-purple-950 mb-1">Couleur des Puces</label>
                                          <div className="flex items-center gap-2">
                                            <input
                                              type="color"
                                              value={sec.settings?.reassuranceColor || '#94a3b8'}
                                              onChange={(e) => handleSettingChange(sec.id, 'reassuranceColor', e.target.value)}
                                              className="w-9 h-9 p-0.5 rounded cursor-pointer border border-slate-300 shrink-0"
                                            />
                                            <div className="flex items-center gap-1 overflow-x-auto">
                                              {COLOR_PALETTE.map((c) => (
                                                <button
                                                  key={c.hex}
                                                  type="button"
                                                  onClick={() => handleSettingChange(sec.id, 'reassuranceColor', c.hex)}
                                                  style={{ backgroundColor: c.hex }}
                                                  className="w-5 h-5 rounded-full border border-slate-400 shrink-0"
                                                  title={c.name}
                                                />
                                              ))}
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                        <div>
                                          <label className="block text-[11px] font-bold text-slate-700 mb-1">🛡️ Réassurance 1 (Sous le bouton)</label>
                                          <input
                                            type="text"
                                            value={sec.settings?.reassuranceText1 || sec.settings?.proof1 || ''}
                                            onChange={(e) => {
                                              handleSettingChange(sec.id, 'reassuranceText1', e.target.value);
                                              handleSettingChange(sec.id, 'proof1', e.target.value);
                                            }}
                                            className="w-full px-3.5 py-2 bg-white border border-purple-300 rounded-xl text-xs font-medium text-slate-900"
                                            placeholder="100% Gratuit sans engagement..."
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-[11px] font-bold text-slate-700 mb-1">⚡ Réassurance 2 (Sous le bouton)</label>
                                          <input
                                            type="text"
                                            value={sec.settings?.reassuranceText2 || sec.settings?.proof2 || ''}
                                            onChange={(e) => {
                                              handleSettingChange(sec.id, 'reassuranceText2', e.target.value);
                                              handleSettingChange(sec.id, 'proof2', e.target.value);
                                            }}
                                            className="w-full px-3.5 py-2 bg-white border border-purple-300 rounded-xl text-xs font-medium text-slate-900"
                                            placeholder="Téléchargement instantané..."
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })()
                          )
                        )}

                        {/* HIGHLEVEL PIXEL FUNNEL FULL CONTROL SETTINGS FOR HERO (POSITION #1) */}
                        {sec.sectionKey === 'HERO' && (
                          <div className="p-5 bg-slate-950 text-white rounded-2xl border border-slate-800 space-y-4 shadow-inner">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                              <div className="flex items-center gap-2 text-xs font-heading font-black text-[#a3e635]">
                                <Zap className="w-4 h-4" />
                                <span>Position #1 : Gestionnaires de Tous les Éléments de la Section HERO :</span>
                              </div>
                              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#a3e635]/20 text-[#a3e635] border border-[#a3e635]/30">
                                Position #1
                              </span>
                            </div>

                            {/* 1. TOP TICKER BADGE & FLOATING BADGE */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                              <div>
                                <label className="block text-[11px] text-slate-300 font-bold mb-1">⚡ Bandeau Flottant Supérieur</label>
                                <input
                                  type="text"
                                  value={settings.topTickerText || 'Offre Limitée 2026 : Pack Tout-en-Un à -70% !'}
                                  onChange={(e) => handleSettingChange(sec.id, 'topTickerText', e.target.value)}
                                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-bold"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] text-slate-300 font-bold mb-1">🏅 Badge Flottant Carte Créateur</label>
                                <input
                                  type="text"
                                  value={settings.floatingBadge || 'Architecte IA & Solopreneur'}
                                  onChange={(e) => handleSettingChange(sec.id, 'floatingBadge', e.target.value)}
                                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-bold"
                                />
                              </div>
                            </div>

                            {/* 2. BUTTONS CONFIGURATION */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1 border-t border-slate-800/80">
                              <div>
                                <label className="block text-[11px] text-slate-300 font-bold mb-1">🟢 Texte Bouton Principal (Bouton 1)</label>
                                <input
                                  type="text"
                                  value={settings.btn1Text || 'Voir la boutique & les templates'}
                                  onChange={(e) => handleSettingChange(sec.id, 'btn1Text', e.target.value)}
                                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-bold"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] text-slate-300 font-bold mb-1">🔗 Lien Bouton Principal</label>
                                <input
                                  type="text"
                                  value={settings.btn1Url || '/boutique'}
                                  onChange={(e) => handleSettingChange(sec.id, 'btn1Url', e.target.value)}
                                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-bold"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] text-slate-300 font-bold mb-1">⚪ Texte Bouton Secondaire (Bouton 2)</label>
                                <input
                                  type="text"
                                  value={settings.btn2Text || 'Ressources Gratuites'}
                                  onChange={(e) => handleSettingChange(sec.id, 'btn2Text', e.target.value)}
                                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-bold"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] text-slate-300 font-bold mb-1">🔗 Lien Bouton Secondaire</label>
                                <input
                                  type="text"
                                  value={settings.btn2Url || '/ressources'}
                                  onChange={(e) => handleSettingChange(sec.id, 'btn2Url', e.target.value)}
                                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-bold"
                                />
                              </div>
                            </div>

                            {/* 3. CREATOR PROFILE INFO */}
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs pt-1 border-t border-slate-800/80">
                              
                              {/* CREATOR AVATAR FIELD WITH PREVIEW & UPLOAD */}
                              <div>
                                <label className="block text-[11px] text-slate-300 font-bold mb-1">🖼️ Avatar du Créateur</label>
                                <div className="flex items-center gap-2">
                                  {settings.creatorAvatar ? (
                                    <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-[#a3e635] shrink-0 shadow-md">
                                      <img src={settings.creatorAvatar} alt="Avatar" className="w-full h-full object-cover" />
                                    </div>
                                  ) : (
                                    <div className="w-9 h-9 rounded-full bg-purple-900/60 text-[#a3e635] border border-purple-700 flex items-center justify-center text-xs font-black shrink-0">
                                      👤
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0 space-y-1">
                                    <input
                                      type="text"
                                      placeholder="URL (ex: https://...)"
                                      value={settings.creatorAvatar || ''}
                                      onChange={(e) => handleSettingChange(sec.id, 'creatorAvatar', e.target.value)}
                                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-[11px]"
                                    />
                                    <label className="inline-block cursor-pointer text-[10px] text-[#a3e635] font-black hover:underline">
                                      <span>📷 Changer la photo...</span>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => handleCreatorAvatarUpload(sec.id, e)}
                                      />
                                    </label>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <label className="block text-[11px] text-slate-300 font-bold mb-1">👤 Nom du Créateur</label>
                                <input
                                  type="text"
                                  value={settings.creatorName || 'Thomas'}
                                  onChange={(e) => handleSettingChange(sec.id, 'creatorName', e.target.value)}
                                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-bold"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] text-slate-300 font-bold mb-1">💼 Titre du Créateur</label>
                                <input
                                  type="text"
                                  value={settings.creatorTitle || 'Fondateur Solopreneur&Co'}
                                  onChange={(e) => handleSettingChange(sec.id, 'creatorTitle', e.target.value)}
                                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-bold"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] text-slate-300 font-bold mb-1">✨ Sous-titre Spécialiste</label>
                                <input
                                  type="text"
                                  value={settings.creatorSubtitle || 'Architecte de Systèmes Notion & Excel'}
                                  onChange={(e) => handleSettingChange(sec.id, 'creatorSubtitle', e.target.value)}
                                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-bold"
                                />
                              </div>
                            </div>

                            {/* 4. CREATOR QUOTE */}
                            <div className="space-y-1 pt-1 border-t border-slate-800/80">
                              <label className="block text-[11px] text-slate-300 font-bold">💬 Texte de la Citation ("Ma Bibliothèques & Systèmes")</label>
                              <textarea
                                rows={2}
                                value={settings.creatorQuote || '"Je conçois des systèmes d organisation et de vente clés en main, des templates Notion prêts à l emploi et des dashboards Excel automatisés pour aider les freelances à maximiser leur TJM et gagner jusqu à 10h par semaine."'}
                                onChange={(e) => handleSettingChange(sec.id, 'creatorQuote', e.target.value)}
                                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-normal text-xs leading-relaxed"
                              />
                            </div>

                            {/* 5. 4 EXPERTISE ICONSET PILLS */}
                            <div className="space-y-2 pt-1 border-t border-slate-800/80">
                              <label className="block text-[11px] text-[#a3e635] font-heading font-black uppercase tracking-wider">
                                🛠️ Les 4 Puces d Expertises & Outils Inclus
                              </label>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                <div>
                                  <label className="block text-[11px] text-slate-300 font-bold mb-1">Puce 1 (Notion)</label>
                                  <input
                                    type="text"
                                    value={settings.exp1 || 'Templates Notion v3'}
                                    onChange={(e) => handleSettingChange(sec.id, 'exp1', e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-bold"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] text-slate-300 font-bold mb-1">Puce 2 (Excel)</label>
                                  <input
                                    type="text"
                                    value={settings.exp2 || 'Dashboards Excel'}
                                    onChange={(e) => handleSettingChange(sec.id, 'exp2', e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-bold"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] text-slate-300 font-bold mb-1">Puce 3 (IA)</label>
                                  <input
                                    type="text"
                                    value={settings.exp3 || 'Workflows IA 2026'}
                                    onChange={(e) => handleSettingChange(sec.id, 'exp3', e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-bold"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] text-slate-300 font-bold mb-1">Puce 4 (Service)</label>
                                  <input
                                    type="text"
                                    value={settings.exp4 || 'Accompagnement'}
                                    onChange={(e) => handleSettingChange(sec.id, 'exp4', e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-bold"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* 6. 3 STATS CARDS (+20-40% Augmentation du Taux de Clics...) */}
                            <div className="space-y-2 pt-1 border-t border-slate-800/80">
                              <label className="block text-[11px] text-[#a3e635] font-heading font-black uppercase tracking-wider">
                                📊 Les 3 Cartes Statistiques du Hero (+20-40% Augmentation du Taux de Clics...)
                              </label>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                <div className="space-y-1">
                                  <label className="block text-[10px] text-slate-400 font-bold">Stat 1 (Valeur / Titre)</label>
                                  <input
                                    type="text"
                                    value={settings.stat1Val || '+20-40%'}
                                    onChange={(e) => handleSettingChange(sec.id, 'stat1Val', e.target.value)}
                                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-bold"
                                  />
                                  <input
                                    type="text"
                                    value={settings.stat1Label || 'Augmentation du Taux de Clics'}
                                    onChange={(e) => handleSettingChange(sec.id, 'stat1Label', e.target.value)}
                                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 text-[11px]"
                                  />
                                </div>

                                <div className="space-y-1">
                                  <label className="block text-[10px] text-slate-400 font-bold">Stat 2 (Valeur / Titre)</label>
                                  <input
                                    type="text"
                                    value={settings.stat2Val || '3-4x'}
                                    onChange={(e) => handleSettingChange(sec.id, 'stat2Val', e.target.value)}
                                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-bold"
                                  />
                                  <input
                                    type="text"
                                    value={settings.stat2Label || 'Croissance des Revenus'}
                                    onChange={(e) => handleSettingChange(sec.id, 'stat2Label', e.target.value)}
                                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 text-[11px]"
                                  />
                                </div>

                                <div className="space-y-1">
                                  <label className="block text-[10px] text-slate-400 font-bold">Stat 3 (Valeur / Titre)</label>
                                  <input
                                    type="text"
                                    value={settings.stat3Val || '60-80%'}
                                    onChange={(e) => handleSettingChange(sec.id, 'stat3Val', e.target.value)}
                                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-bold"
                                  />
                                  <input
                                    type="text"
                                    value={settings.stat3Label || 'Clients Récurrents'}
                                    onChange={(e) => handleSettingChange(sec.id, 'stat3Label', e.target.value)}
                                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 text-[11px]"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* 7. FOOTER STATS & SOLOPRENEURS */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1 border-t border-slate-800/80">
                              <div>
                                <label className="block text-[11px] text-slate-300 font-bold mb-1">⭐ Note / Évaluation</label>
                                <input
                                  type="text"
                                  value={settings.ratingText || '5.0 / 5'}
                                  onChange={(e) => handleSettingChange(sec.id, 'ratingText', e.target.value)}
                                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-bold"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] text-slate-300 font-bold mb-1">👥 Compteur de Solopreneurs</label>
                                <input
                                  type="text"
                                  value={settings.solopreneursCount || '+5,400 Solopreneurs Équipés'}
                                  onChange={(e) => handleSettingChange(sec.id, 'solopreneursCount', e.target.value)}
                                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-bold"
                                />
                              </div>
                            </div>

                          </div>
                        )}

                        {/* POSITION #2 TICKER: YELLOW DEFILANT BANNER CONTROLS */}
                        {sec.sectionKey === 'TICKER' && (
                          <div className="p-5 bg-slate-950 text-white rounded-2xl border border-slate-800 space-y-4 shadow-inner">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                              <div className="flex items-center gap-2 text-xs font-heading font-black text-[#a3e635]">
                                <Zap className="w-4 h-4" />
                                <span>Position #2 : Gestion du Bandeau Fluo Défilant</span>
                              </div>
                              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#a3e635]/20 text-[#a3e635] border border-[#a3e635]/30">
                                Position #2
                              </span>
                            </div>

                            {/* YELLOW TICKER DEFILANT BANNER TEXT INPUTS */}
                            <div className="space-y-2">
                              <label className="block text-[11px] text-[#a3e635] font-heading font-black uppercase tracking-wider">
                                🟡 Bandeau Fluo Défilant (Texte du Défilement)
                              </label>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                <div>
                                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Message 1</label>
                                  <input
                                    type="text"
                                    value={settings.item1Text || 'ACCÈS IMMÉDIAT AUX TEMPLATES NOTION & EXCEL'}
                                    onChange={(e) => handleSettingChange(sec.id, 'item1Text', e.target.value)}
                                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-bold"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Message 2</label>
                                  <input
                                    type="text"
                                    value={settings.item2Text || 'BOOSTE TON TJM ET TES REVENUS FREELANCE'}
                                    onChange={(e) => handleSettingChange(sec.id, 'item2Text', e.target.value)}
                                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-bold"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Message 3</label>
                                  <input
                                    type="text"
                                    value={settings.item3Text || 'PLUS DE 5 000 SOLOPRENEURS ACCOMPAGNÉS'}
                                    onChange={(e) => handleSettingChange(sec.id, 'item3Text', e.target.value)}
                                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-bold"
                                  />
                                </div>
                              </div>
                            </div>

                          </div>
                        )}

                        {/* POSITION #3 CATEGORIES: 4 COLLECTIONS CARDS CONTROLS */}
                        {sec.sectionKey === 'CATEGORIES' && (
                          <div className="p-5 bg-slate-950 text-white rounded-2xl border border-slate-800 space-y-4 shadow-inner">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                              <div className="flex items-center gap-2 text-xs font-heading font-black text-[#a3e635]">
                                <Layers className="w-4 h-4" />
                                <span>Position #3 : Gestion des 4 Cartes de Collections</span>
                              </div>
                              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#a3e635]/20 text-[#a3e635] border border-[#a3e635]/30">
                                Position #3
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                              {/* CARTE 1 */}
                              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                                <label className="block text-[11px] text-[#a3e635] font-bold">Carte 1 (Intitulé & Lien)</label>
                                <input
                                  type="text"
                                  value={settings.col1Name || 'Sales Funnels'}
                                  onChange={(e) => handleSettingChange(sec.id, 'col1Name', e.target.value)}
                                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-bold"
                                  placeholder="Nom de la collection 1"
                                />
                                <input
                                  type="text"
                                  value={settings.col1Url || '/boutique'}
                                  onChange={(e) => handleSettingChange(sec.id, 'col1Url', e.target.value)}
                                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 text-[11px]"
                                  placeholder="Lien de redirection..."
                                />
                              </div>

                              {/* CARTE 2 */}
                              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                                <label className="block text-[11px] text-blue-400 font-bold">Carte 2 (Intitulé & Lien)</label>
                                <input
                                  type="text"
                                  value={settings.col2Name || 'Email Swipes'}
                                  onChange={(e) => handleSettingChange(sec.id, 'col2Name', e.target.value)}
                                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-bold"
                                  placeholder="Nom de la collection 2"
                                />
                                <input
                                  type="text"
                                  value={settings.col2Url || '/boutique'}
                                  onChange={(e) => handleSettingChange(sec.id, 'col2Url', e.target.value)}
                                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 text-[11px]"
                                  placeholder="Lien de redirection..."
                                />
                              </div>

                              {/* CARTE 3 */}
                              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                                <label className="block text-[11px] text-amber-400 font-bold">Carte 3 (Intitulé & Lien)</label>
                                <input
                                  type="text"
                                  value={settings.col3Name || 'Ebooks & Guides'}
                                  onChange={(e) => handleSettingChange(sec.id, 'col3Name', e.target.value)}
                                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-bold"
                                  placeholder="Nom de la collection 3"
                                />
                                <input
                                  type="text"
                                  value={settings.col3Url || '/boutique'}
                                  onChange={(e) => handleSettingChange(sec.id, 'col3Url', e.target.value)}
                                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 text-[11px]"
                                  placeholder="Lien de redirection..."
                                />
                              </div>

                              {/* CARTE 4 */}
                              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                                <label className="block text-[11px] text-purple-400 font-bold">Carte 4 (Intitulé & Lien)</label>
                                <input
                                  type="text"
                                  value={settings.col4Name || 'Lead Magnets'}
                                  onChange={(e) => handleSettingChange(sec.id, 'col4Name', e.target.value)}
                                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-bold"
                                  placeholder="Nom de la collection 4"
                                />
                                <input
                                  type="text"
                                  value={settings.col4Url || '/boutique'}
                                  onChange={(e) => handleSettingChange(sec.id, 'col4Url', e.target.value)}
                                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 text-[11px]"
                                  placeholder="Lien de redirection..."
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* POSITION #5 DARK_FEATURE: EBOOK OPTIN FORM & COVER CONTROLS */}
                        {sec.sectionKey === 'DARK_FEATURE' && (
                          <div className="p-5 bg-slate-950 text-white rounded-2xl border border-slate-800 space-y-4 shadow-inner">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                              <div className="flex items-center gap-2 text-xs font-heading font-black text-[#a3e635]">
                                <Gift className="w-4 h-4" />
                                <span>Position #5 : Gestionnaire du Bloc Opt-in eBook Gratuit (DARK_FEATURE)</span>
                              </div>
                              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#a3e635]/20 text-[#a3e635] border border-[#a3e635]/30">
                                Position #5
                              </span>
                            </div>

                            {/* TARGET LEAD LIST SELECTOR */}
                            <div className="p-3.5 bg-slate-900 rounded-xl border border-[#a3e635]/40 space-y-2">
                              <div className="flex items-center justify-between">
                                <label className="block text-xs font-heading font-black text-[#a3e635] flex items-center gap-1.5">
                                  <span>📋 Liste de Contacts Cible pour ce Formulaire :</span>
                                </label>
                                <Link href="/admin/contacts" target="_blank" className="text-[10px] text-[#a3e635] hover:underline font-bold">
                                  + Gérer les listes →
                                </Link>
                              </div>
                              <p className="text-[10px] text-slate-300 font-medium">
                                Les personnes qui remplissent ce formulaire sur le site seront automatiquement placées dans la liste choisie ci-dessous et déclencheront sa séquence d emails d accompagnement.
                              </p>
                              <select
                                value={settings.targetListId || ''}
                                onChange={(e) => handleSettingChange(sec.id, 'targetListId', e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold text-xs focus:outline-none cursor-pointer focus:border-[#a3e635]"
                              >
                                <option value="">⚙️ Liste par défaut (Opt-in eBook Gratuit)</option>
                                {leadLists.map((list) => (
                                  <option key={list.id} value={list.id}>
                                    📁 {list.name} ({list._count?.leads || 0} contacts)
                                  </option>
                                ))}
                              </select>

                              {/* SELECT SPECIFIC WELCOME STEP VARIANT */}
                              <div className="pt-2 border-t border-slate-800 space-y-1">
                                <label className="block text-xs font-heading font-black text-[#a3e635] flex items-center gap-1.5">
                                  <span>✉️ Sélectionner le Message de Bienvenue Spécifique pour cet eBook :</span>
                                </label>
                                <p className="text-[10px] text-slate-300 font-medium">
                                  Si vous avez plusieurs sous-emails de bienvenue dans l Email #1 (ex: 3 emails pour 3 ebooks), choisissez celui qui sera envoyé exclusivement lors de cette inscription.
                                </p>

                                {(() => {
                                  const stepsList: Array<{ id: string; label: string; subject: string; attachmentName?: string }> = [];
                                  
                                  campaigns.forEach((camp: any) => {
                                    const isLinked = !settings.targetListId || camp.lists?.some((l: any) => l.listId === settings.targetListId);
                                    if (isLinked && camp.sequences) {
                                      camp.sequences.forEach((seq: any) => {
                                        if (seq.stepOrder === 1 || seq.triggerType === 'IMMEDIATE') {
                                          stepsList.push({
                                            id: seq.id,
                                            label: `Email #1 Principal (${camp.name})`,
                                            subject: seq.subject,
                                            attachmentName: seq.attachmentName,
                                          });

                                          if (seq.variants) {
                                            seq.variants.forEach((v: any, vIdx: number) => {
                                              stepsList.push({
                                                id: v.id,
                                                label: `Sous-email 1.${vIdx + 1} (${camp.name})`,
                                                subject: v.subject,
                                                attachmentName: v.attachmentName,
                                              });
                                            });
                                          }
                                        }
                                      });
                                    }
                                  });

                                  return (
                                    <select
                                      value={settings.welcomeStepId || ''}
                                      onChange={(e) => handleSettingChange(sec.id, 'welcomeStepId', e.target.value)}
                                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold text-xs focus:outline-none cursor-pointer focus:border-[#a3e635]"
                                    >
                                      <option value="">⚙️ Premier email de bienvenue par défaut de la séquence</option>
                                      {stepsList.map((ws) => (
                                        <option key={ws.id} value={ws.id}>
                                          📩 {ws.label} : "{ws.subject}" {ws.attachmentName ? `(📎 ${ws.attachmentName})` : ''}
                                        </option>
                                      ))}
                                    </select>
                                  );
                                })()}
                              </div>
                            </div>

                            {/* BADGE FLOTTANT SUPÉRIEUR SÉPARÉ */}
                            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                              <label className="block text-xs font-heading font-black text-[#a3e635] flex items-center gap-1.5">
                                <span>🏷️ Personnalisation du Badge Flottant Supérieur du Bloc :</span>
                              </label>
                              <input
                                type="text"
                                value={settings.badgeText || 'EBOOK OFFERT A 100%'}
                                onChange={(e) => handleSettingChange(sec.id, 'badgeText', e.target.value)}
                                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold text-xs focus:outline-none focus:border-[#a3e635]"
                                placeholder="Saisissez le texte du badge..."
                              />
                            </div>

                            {/* 3. COVER IMAGE & RECOMMENDED DIMENSIONS */}
                            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <label className="block text-xs font-heading font-black text-[#a3e635]">
                                  📘 Image de la Couverture de l eBook (Mockup 3D / Couverture)
                                </label>
                                <span className="text-[11px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2.5 py-1 rounded-full shadow-xs">
                                  📐 Dimensions recommandées : 600 x 800 px (Format 3:4)
                                </span>
                              </div>

                              <div className="flex items-center gap-3">
                                {settings.bookCoverUrl ? (
                                  <div className="relative w-16 h-20 rounded-lg overflow-hidden border border-[#a3e635] shrink-0 shadow-md">
                                    <img src={settings.bookCoverUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                                  </div>
                                ) : (
                                  <div className="w-16 h-20 rounded-lg bg-emerald-950 text-[#a3e635] border border-emerald-800 flex flex-col items-center justify-center text-center p-1 shrink-0">
                                    <span className="text-lg">📘</span>
                                    <span className="text-[9px] font-bold">CSS Card</span>
                                  </div>
                                )}

                                <div className="flex-1 min-w-0 space-y-1.5">
                                  <input
                                    type="text"
                                    placeholder="URL de l image (ex: https://... ou /uploads/...)"
                                    value={settings.bookCoverUrl || ''}
                                    onChange={(e) => handleSettingChange(sec.id, 'bookCoverUrl', e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-xs"
                                  />
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <label className="inline-block cursor-pointer text-xs text-[#a3e635] font-black hover:underline">
                                      <span>📷 Téléverser une image de couverture...</span>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => handleBookCoverUpload(sec.id, e)}
                                      />
                                    </label>
                                    <span className="text-[10px] text-slate-400 font-medium">Formats acceptés : PNG, JPG, WEBP (Max 5Mo)</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* POSITION #8 TESTIMONIALS: FULL TESTIMONIALS CARDS MANAGER */}
                        {sec.sectionKey === 'TESTIMONIALS' && (
                          <div className="p-5 bg-slate-950 text-white rounded-2xl border border-slate-800 space-y-4 shadow-inner">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                              <div className="flex items-center gap-2 text-xs font-heading font-black text-[#a3e635]">
                                <Star className="w-4 h-4 text-[#a3e635] fill-[#a3e635]" />
                                <span>Position #8 : Gestionnaire Complet des Témoignages Clients (TESTIMONIALS)</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#a3e635]/20 text-[#a3e635] border border-[#a3e635]/30">
                                  Position #8
                                </span>
                                <Button
                                  type="button"
                                  onClick={() => handleAddTestimonial(sec.id)}
                                  size="sm"
                                  className="bg-[#a3e635] text-slate-950 hover:bg-[#86efac] font-heading font-black text-xs gap-1 border-0"
                                >
                                  <span>+ Ajouter un Témoignage</span>
                                </Button>
                              </div>
                            </div>

                            {/* HEADER BADGE TEXT */}
                            <div className="space-y-1">
                              <label className="block text-[11px] text-slate-300 font-bold">🏷️ Badge Flottant Supérieur (Avis)</label>
                              <input
                                type="text"
                                value={settings.badgeText || '★★★★★ RECOMMANDÉ PAR +500 SOLOPRENEURS'}
                                onChange={(e) => handleSettingChange(sec.id, 'badgeText', e.target.value)}
                                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-bold text-xs"
                              />
                            </div>

                            {/* LIST OF TESTIMONIAL CARDS */}
                            {(() => {
                              const itemsList = Array.isArray(settings.items) ? settings.items : [
                                { name: 'Rene Wells', role: 'Business Owner', quote: 'Professional work, awesome! From high-converting sales funnels to email sequences, everything was super smooth and increased our revenue immediately.', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80', rating: 5 },
                                { name: 'Sophie C.', role: 'Consultante Marketing', quote: 'Les templates et systèmes de vente ont totalement changé ma gestion quotidienne. Je gagne plus de 5h par semaine !', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80', rating: 5 },
                                { name: 'Alexandre Mercier', role: 'Consultant IA & Data', quote: 'Grâce au Dashboard Excel et aux templates Notion, j ai pu doubler mes revenus en 3 mois. Indispensable !', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80', rating: 5 },
                                { name: 'Marc L.', role: 'Solopreneur Digital', quote: 'Excellente qualité des livrables. Les fichiers sont prêts à dupliquer et le support est ultra rapide.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80', rating: 5 },
                                { name: 'Claire D.', role: 'Coach Indépendante', quote: 'Un vrai game-changer pour structurer mes offres et automatiser mes relances clients.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80', rating: 5 },
                                { name: 'Thomas B.', role: 'Freelance Copywriter', quote: 'Les séquences email prêtes à l emploi m ont permis de signer 3 nouveaux clients dès la première semaine.', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80', rating: 5 },
                              ];

                              return (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                  {itemsList.map((item: any, itemIdx: number) => (
                                    <div key={itemIdx} className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3 relative group">
                                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                        <span className="text-[11px] font-heading font-black text-[#a3e635]">
                                          Témoignage #{itemIdx + 1}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveTestimonial(sec.id, itemIdx)}
                                          className="text-rose-400 hover:text-rose-300 font-bold text-[11px] px-2 py-0.5 rounded bg-rose-950/40 border border-rose-800"
                                        >
                                          Supprimer
                                        </button>
                                      </div>

                                      {/* AVATAR + NAME + ROLE */}
                                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div>
                                          <label className="block text-[10px] text-slate-300 font-bold mb-1">🖼️ Photo Avatar</label>
                                          <div className="flex items-center gap-2">
                                            {item.avatar ? (
                                              <img src={item.avatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-[#a3e635] shrink-0" />
                                            ) : (
                                              <div className="w-8 h-8 rounded-full bg-purple-900/60 text-[#a3e635] border border-purple-700 flex items-center justify-center text-xs font-black shrink-0">
                                                👤
                                              </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                              <input
                                                type="text"
                                                placeholder="URL..."
                                                value={item.avatar || ''}
                                                onChange={(e) => handleTestimonialFieldChange(sec.id, itemIdx, 'avatar', e.target.value)}
                                                className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-[10px]"
                                              />
                                              <label className="inline-block cursor-pointer text-[9px] text-[#a3e635] font-bold hover:underline mt-0.5">
                                                <span>📷 Téléverser...</span>
                                                <input
                                                  type="file"
                                                  accept="image/*"
                                                  className="hidden"
                                                  onChange={(e) => handleTestimonialAvatarUpload(sec.id, itemIdx, e)}
                                                />
                                              </label>
                                            </div>
                                          </div>
                                        </div>

                                        <div>
                                          <label className="block text-[10px] text-slate-300 font-bold mb-1">👤 Nom & Prénom</label>
                                          <input
                                            type="text"
                                            value={item.name || ''}
                                            onChange={(e) => handleTestimonialFieldChange(sec.id, itemIdx, 'name', e.target.value)}
                                            className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-bold text-xs"
                                            placeholder="Ex: Sophie C."
                                          />
                                        </div>

                                        <div>
                                          <label className="block text-[10px] text-slate-300 font-bold mb-1">💼 Titre / Profession</label>
                                          <input
                                            type="text"
                                            value={item.role || ''}
                                            onChange={(e) => handleTestimonialFieldChange(sec.id, itemIdx, 'role', e.target.value)}
                                            className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-medium text-xs"
                                            placeholder="Ex: Consultante"
                                          />
                                        </div>
                                      </div>

                                      {/* RATING & QUOTE */}
                                      <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                          <label className="block text-[10px] text-slate-300 font-bold">💬 Citation / Avis Client</label>
                                          <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] text-slate-400 font-bold">Étoiles :</span>
                                            <select
                                              value={item.rating || 5}
                                              onChange={(e) => handleTestimonialFieldChange(sec.id, itemIdx, 'rating', Number(e.target.value))}
                                              className="bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-amber-400 font-black text-[11px]"
                                            >
                                              <option value={5}>★★★★★ (5/5)</option>
                                              <option value={4}>★★★★ (4/5)</option>
                                              <option value={3}>★★★ (3/5)</option>
                                            </select>
                                          </div>
                                        </div>

                                        <textarea
                                          rows={2}
                                          value={item.quote || item.review || ''}
                                          onChange={(e) => handleTestimonialFieldChange(sec.id, itemIdx, 'quote', e.target.value)}
                                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs leading-relaxed font-normal"
                                          placeholder="Saisissez l avis laissé par ce client..."
                                        />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              );
                            })()}
                          </div>
                        )}

                        {sec.sectionKey === 'PRODUCTS' && (
                          <div className="p-4 bg-slate-950 text-white rounded-2xl border border-slate-800 space-y-3">
                            <div className="flex items-center gap-2 text-xs font-heading font-black text-[#a3e635]">
                              <ShoppingBag className="w-4 h-4" />
                              <span>Paramètres de la Grille Produits HighLevel :</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                              <div>
                                <label className="block text-[11px] text-slate-400 font-bold mb-1">Texte du Lien "Voir Tout"</label>
                                <input
                                  type="text"
                                  value={settings.btn1Text || 'Voir toute la boutique →'}
                                  onChange={(e) => handleSettingChange(sec.id, 'btn1Text', e.target.value)}
                                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-bold"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] text-slate-400 font-bold mb-1">Lien de la Boutique</label>
                                <input
                                  type="text"
                                  value={settings.btn1Url || '/boutique'}
                                  onChange={(e) => handleSettingChange(sec.id, 'btn1Url', e.target.value)}
                                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-bold"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* POSITION #10 FINAL_CTA: YELLOW BANNER BADGE & BUTTON CONTROLS */}
                        {sec.sectionKey === 'FINAL_CTA' && (
                          <div className="p-5 bg-slate-950 text-white rounded-2xl border border-slate-800 space-y-4 shadow-inner">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                              <div className="flex items-center gap-2 text-xs font-heading font-black text-[#a3e635]">
                                <Zap className="w-4 h-4 text-[#a3e635] fill-[#a3e635]" />
                                <span>Position #10 : Gestionnaire du Bandeau Jaune CTA Final (FINAL_CTA)</span>
                              </div>
                              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#a3e635]/20 text-[#a3e635] border border-[#a3e635]/30">
                                Position #10
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                              <div>
                                <label className="block text-[11px] text-slate-300 font-bold mb-1">🏷️ Badge Flottant Supérieur</label>
                                <input
                                  type="text"
                                  value={settings.badgeText || 'ACCÈS IMMÉDIAT EN 1 CLIC'}
                                  onChange={(e) => handleSettingChange(sec.id, 'badgeText', e.target.value)}
                                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-bold"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] text-[#a3e635] font-bold mb-1">⚡ Texte du Bouton Principal</label>
                                <input
                                  type="text"
                                  value={settings.btnText || settings.btn1Text || 'Accéder à la boutique & aux templates ⚡'}
                                  onChange={(e) => {
                                    handleSettingChange(sec.id, 'btnText', e.target.value);
                                    handleSettingChange(sec.id, 'btn1Text', e.target.value);
                                  }}
                                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-bold"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] text-slate-300 font-bold mb-1">🔗 Lien de Redirection du Bouton</label>
                                <input
                                  type="text"
                                  value={settings.btnUrl || settings.btn1Url || '/boutique'}
                                  onChange={(e) => {
                                    handleSettingChange(sec.id, 'btnUrl', e.target.value);
                                    handleSettingChange(sec.id, 'btn1Url', e.target.value);
                                  }}
                                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-[11px]"
                                />
                              </div>
                            </div>

                            {/* 3 REASSURANCE BULLETS UNDER BUTTON */}
                            <div className="space-y-2 pt-1 border-t border-slate-800/80">
                              <label className="block text-[11px] text-[#a3e635] font-heading font-black uppercase tracking-wider">
                                🛡️ Puces de Réassurance (Sous le bouton principal)
                              </label>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                <div>
                                  <label className="block text-[10px] text-slate-300 font-bold mb-1">✓ Puce 1</label>
                                  <input
                                    type="text"
                                    value={settings.proof1 || 'Paiement 100% sécurisé'}
                                    onChange={(e) => handleSettingChange(sec.id, 'proof1', e.target.value)}
                                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-bold"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] text-slate-300 font-bold mb-1">✓ Puce 2</label>
                                  <input
                                    type="text"
                                    value={settings.proof2 || 'Téléchargement instantané'}
                                    onChange={(e) => handleSettingChange(sec.id, 'proof2', e.target.value)}
                                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-bold"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] text-slate-300 font-bold mb-1">✓ Puce 3</label>
                                  <input
                                    type="text"
                                    value={settings.proof3 || 'Mises à jour gratuites à vie'}
                                    onChange={(e) => handleSettingChange(sec.id, 'proof3', e.target.value)}
                                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-bold"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                      </div>
                    </div>

                    {/* TOGGLE & ACTIONS SIDEBAR */}
                    <div className="flex flex-col items-end gap-3 shrink-0 pt-1 border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-6">
                      <Button
                        type="button"
                        onClick={() => handleToggle(sec.id)}
                        variant={sec.isEnabled ? 'primary' : 'outline'}
                        size="sm"
                        className={`gap-1.5 font-heading font-black text-xs w-full justify-center ${
                          sec.isEnabled ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-0' : 'text-slate-500'
                        }`}
                      >
                        {sec.isEnabled ? (
                          <>
                            <Eye className="w-4 h-4" />
                            <span>Affiché</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-4 h-4" />
                            <span>Masqué</span>
                          </>
                        )}
                      </Button>

                      <Button
                        type="button"
                        onClick={() => handleSaveBlock(sec)}
                        disabled={savingBlockId === sec.id}
                        variant="outline"
                        size="sm"
                        className="gap-1.5 font-bold text-xs text-slate-800 bg-white border-2 border-slate-200 hover:bg-slate-100 w-full justify-center shadow-xs"
                      >
                        <Save className="w-3.5 h-3.5 text-purple-600" />
                        <span>{savingBlockId === sec.id ? 'Sauvegarde...' : 'Enregistrer bloc'}</span>
                      </Button>

                      <Button
                        type="button"
                        onClick={() => handleDeleteSection(sec.id, sec.sectionKey)}
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 font-bold text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 w-full justify-center"
                        title="Supprimer ce bloc de la page"
                      >
                        <Trash2 className="w-4 h-4 text-rose-600" />
                        <span>Supprimer bloc</span>
                      </Button>
                    </div>

                  </div>

                </div>
              </Card>
            );
          })}
        </div>
      )}

    </div>
  );
}
