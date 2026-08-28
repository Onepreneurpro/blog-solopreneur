export const PRODUCT_FORMAT_OPTIONS = [
  { value: 'PDF', label: 'PDF' },
  { value: 'DOC', label: 'DOC / Word' },
  { value: 'ZIP', label: 'Archive ZIP' },
  { value: 'EXCEL', label: 'Fichier Excel' },
  { value: 'TEMPLATESIO', label: 'Template Systeme.io' },
  { value: 'TEMPLATE NOTION', label: 'Template Notion' },
  { value: 'WEB APP', label: 'Application Web' },
] as const;

export function getFileTypeLabel(fileType?: string | null): string {
  if (!fileType) return 'Digital';
  const norm = fileType.trim().toUpperCase();
  
  if (norm === 'PDF') return 'PDF';
  if (norm === 'DOC' || norm === 'WORD') return 'DOC / Word';
  if (norm === 'ZIP') return 'Archive ZIP';
  if (norm === 'EXCEL') return 'Fichier Excel';
  if (norm === 'TEMPLATESIO' || norm === 'SIO' || norm === 'SYSTEMEIO') return 'Template Systeme.io';
  if (norm === 'TEMPLATE NOTION' || norm === 'NOTION' || norm === 'TEMPLATENOTION') return 'Template Notion';
  if (norm === 'WEB APP' || norm === 'WEBAPP' || norm === 'APPWEB') return 'Application Web';
  
  return fileType;
}

export function getProductFormatLogo(product?: {
  name?: string | null;
  fileType?: string | null;
  category?: { slug?: string | null; name?: string | null } | string | null;
} | null): { logoUrl: string; alt: string; badgeLabel: string } {
  const nameStr = (product?.name || '').toLowerCase();
  const typeStr = (product?.fileType || '').toLowerCase();
  const catStr = typeof product?.category === 'string' 
    ? product.category.toLowerCase() 
    : ((product?.category?.slug || '') + ' ' + (product?.category?.name || '')).toLowerCase();

  const fullSearch = `${nameStr} ${typeStr} ${catStr}`;

  // 1. Notion Logo
  if (fullSearch.includes('notion')) {
    return {
      logoUrl: '/images/logos/notion-logo.webp',
      alt: 'Logo Notion',
      badgeLabel: 'Template Notion',
    };
  }

  // 2. Excel Logo
  if (fullSearch.includes('excel')) {
    return {
      logoUrl: '/images/logos/excel-logo.png',
      alt: 'Logo Excel',
      badgeLabel: 'Fichier Excel',
    };
  }

  // 3. Systeme.io Logo
  if (fullSearch.includes('systeme') || fullSearch.includes('sio')) {
    return {
      logoUrl: '/images/logos/systemeio-logo.jpg',
      alt: 'Logo Systeme.io',
      badgeLabel: 'Template Systeme.io',
    };
  }

  // 4. Web App / PWA Logo
  if (
    fullSearch.includes('web app') ||
    fullSearch.includes('webapp') ||
    fullSearch.includes('pwa') ||
    fullSearch.includes('logiciel') ||
    fullSearch.includes('saas') ||
    fullSearch.includes('erp') ||
    fullSearch.includes('crm web')
  ) {
    return {
      logoUrl: '/images/logos/pwa-logo.png',
      alt: 'Logo PWA',
      badgeLabel: 'Application Web PWA',
    };
  }

  // Default fallback (e.g. Notion / PDF)
  return {
    logoUrl: '/images/logos/notion-logo.webp',
    alt: 'Logo Format',
    badgeLabel: getFileTypeLabel(product?.fileType),
  };
}
