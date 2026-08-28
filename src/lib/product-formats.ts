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
