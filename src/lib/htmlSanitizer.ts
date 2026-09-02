/**
 * Sanitizes HTML produced by contenteditable elements to eliminate:
 * 1. Residual <div><br></div> and <p><br></p> wrappers.
 * 2. Unnecessary nested <div> line wrappers inserted by browsers.
 * 3. Trailing and leading empty line artifacts.
 */
export function sanitizeContentEditableHtml(html: string): string {
  if (!html) return '';
  let cleaned = html;

  // Remove empty <div><br></div>, <div><br/></div>, <p><br></p>, etc.
  cleaned = cleaned.replace(/<div>\s*<br\s*\/?>\s*<\/div>/gi, '');
  cleaned = cleaned.replace(/<p>\s*<br\s*\/?>\s*<\/p>/gi, '');

  // Convert browser-inserted <div>line</div> into clean line breaks or plain text
  const trimmed = cleaned.trim();
  if (/^<div>([^<]+)<\/div>$/i.test(trimmed)) {
    cleaned = trimmed.replace(/^<div>([^<]+)<\/div>$/i, '$1');
  } else {
    cleaned = cleaned.replace(/<div>(.*?)<\/div>/gi, (match, inner) => {
      const t = inner.trim();
      if (!t || t === '<br>' || t === '<br/>') return '';
      return `<br/>${t}`;
    });
  }

  // Remove leading/trailing line breaks
  cleaned = cleaned.replace(/^(<br\s*\/?>)+/gi, '');
  cleaned = cleaned.replace(/(<br\s*\/?>)+$/gi, '');

  return cleaned.trim();
}

/**
 * Validates whether a row group contains a mixture of 100% full-width columns
 * and fractioned columns (< 100%), logging a warning if found.
 */
export function validateRowGroupComposition(rowWidths: number[]): boolean {
  const hasFullWidth = rowWidths.some((w) => Math.round(w) === 100);
  const hasFractioned = rowWidths.some((w) => Math.round(w) < 100);
  if (hasFullWidth && hasFractioned) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        `[RowStructureWarning] Row contains a mix of 100% full-width and fractioned columns (${rowWidths.join('%, ')}%). These should be split into separate independent ROW elements!`
      );
    }
    return false;
  }
  return true;
}
