import { prisma } from './prisma';

export type SiteThemeId = 'pixel-funnel' | 'modern-bento' | 'classic' | 'makers-purple' | 'drahmi-dark' | 'solopreneur-light' | 'minimalist-indigo' | 'blusky';

export interface ThemeConfig {
  id: SiteThemeId;
  name: string;
  description: string;
  previewColor: string;
  accentColor: string;
  badge: string;
}

export const THEMES: ThemeConfig[] = [
  {
    id: 'pixel-funnel',
    name: '🚀 Template Pixel Funnel HighLevel 2026 (Dark Funnel Studio)',
    description: 'Design Funnel Studio haute conversion inspiré de HighLevel & Pixel N Things (fond obscur #0b0f19, accents vert néon #a3e635, badges HighLevel, barre de statistiques 3-colonnes et opt-in eBook gratuit).',
    previewColor: '#0b0f19',
    accentColor: '#a3e635',
    badge: 'Funnel Studio 2026 🚀',
  },
  {
    id: 'blusky',
    name: '🌐 Template BluSky Solopreneur 2026 (Épuré Blanc & Bleu Ciel #00A0FF)',
    description: 'Design épuré et lumineux (fond blanc #ffffff, accents bleu ciel électrique #00A0FF, textes foncés ultra-lisibles, boutons à fort contraste et même structure Funnel Studio 2026).',
    previewColor: '#ffffff',
    accentColor: '#00A0FF',
    badge: 'BluSky Light 2026 🌐',
  },
  {
    id: 'modern-bento',
    name: '⚡ Template Modern Bento 2026 (Sombre Néon)',
    description: 'Design Bento futuriste obscur (#0a0915), widgets interactifs, touches Jaune Fluo (#ccff00) et violet électrique.',
    previewColor: '#0a0915',
    accentColor: '#ccff00',
    badge: 'Futuriste 2026 ⚡',
  },
  {
    id: 'classic',
    name: '🎨 Template Solopreneur Classic (Clair Original)',
    description: 'Design clair original épuré (#faf8ff) avec cartes blanches contrastées, accents violet et jaune, sans aucune interférence.',
    previewColor: '#faf8ff',
    accentColor: '#7c3aed',
    badge: 'Classic Original 🎨',
  },
  {
    id: 'makers-purple',
    name: 'Makers Academy (Violet Électrique & Néon Lime)',
    description: 'Design ultra-dynamique inspiré des meilleures académies solopreneurs (dégradé violet pastel, accents néon lime, bannières défilantes et cartes de conversion).',
    previewColor: '#7c3aed',
    accentColor: '#bef264',
    badge: 'Nouveau & Électrique ★',
  },
  {
    id: 'drahmi-dark',
    name: 'Drahmi Dark SaaS',
    description: 'Thème sombre haut de gamme style Fintech & Web3 (Space Grotesk + Inter, fond noir ardoise, verre dépoli et accents émeraude).',
    previewColor: '#090d16',
    accentColor: '#10b981',
    badge: 'Sombre & High-Tech',
  },
];

export async function getActiveTheme(): Promise<SiteThemeId> {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: 'site_theme' },
    });
    if (setting && setting.value) {
      const parsed = JSON.parse(setting.value);
      if (parsed.themeId) return parsed.themeId as SiteThemeId;
    }
  } catch (error) {
    // Fallback if table/cold boot
  }
  return 'pixel-funnel';
}

export function isDarkTheme(themeId: string): boolean {
  return themeId === 'pixel-funnel' || themeId === 'modern-bento' || themeId === 'drahmi-dark';
}
