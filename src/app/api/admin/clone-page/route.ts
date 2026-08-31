import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

function makeAbsoluteUrl(relativeUrl: string | undefined, baseUrl: string): string {
  if (!relativeUrl) return '';
  if (relativeUrl.startsWith('data:')) return relativeUrl;
  try {
    return new URL(relativeUrl, baseUrl).href;
  } catch (e) {
    return relativeUrl;
  }
}

function extractStyleProps(styleStr: string | undefined, classNameStr: string | undefined): { bgColor?: string; textColor?: string; bgImage?: string } {
  const result: { bgColor?: string; textColor?: string; bgImage?: string } = {};

  // Extract from inline style
  if (styleStr) {
    const bgMatch = styleStr.match(/background-color:\s*([^;]+)/i) || styleStr.match(/background:\s*([^;]+)/i);
    if (bgMatch) {
      const val = bgMatch[1].trim();
      if (val.startsWith('#') || val.startsWith('rgb') || val.startsWith('hsl')) {
        result.bgColor = val;
      }
    }

    const textMatch = styleStr.match(/(?:^|;)\s*color:\s*([^;]+)/i);
    if (textMatch) {
      const val = textMatch[1].trim();
      if (val.startsWith('#') || val.startsWith('rgb') || val.startsWith('hsl')) {
        result.textColor = val;
      }
    }

    const imgMatch = styleStr.match(/background-image:\s*url\(['"]?([^'"]+)['"]?\)/i);
    if (imgMatch) {
      result.bgImage = imgMatch[1];
    }
  }

  // Extract common color hints from class names if no inline style
  if (classNameStr) {
    const cls = classNameStr.toLowerCase();
    if (!result.bgColor) {
      if (cls.includes('bg-red') || cls.includes('red-bg') || cls.includes('btn-danger')) result.bgColor = '#dc2626';
      else if (cls.includes('bg-green') || cls.includes('green-bg') || cls.includes('btn-success')) result.bgColor = '#16a34a';
      else if (cls.includes('bg-blue') || cls.includes('blue-bg') || cls.includes('btn-primary')) result.bgColor = '#00A0FF';
      else if (cls.includes('bg-[#') || cls.includes('bg-dark')) result.bgColor = '#181825';
    }
    if (!result.textColor) {
      if (cls.includes('text-yellow') || cls.includes('text-amber')) result.textColor = '#facc15';
      else if (cls.includes('text-green')) result.textColor = '#4ade80';
      else if (cls.includes('text-red')) result.textColor = '#f87171';
      else if (cls.includes('text-white')) result.textColor = '#ffffff';
    }
  }

  return result;
}

function cleanText(str: string): string {
  return str.replace(/\s+/g, ' ').trim();
}

function isDuplicateText(newText: string, existingTexts: string[]): boolean {
  const normNew = cleanText(newText).toLowerCase();
  if (normNew.length < 2) return true;

  for (const existing of existingTexts) {
    const normExisting = cleanText(existing).toLowerCase();
    if (normExisting === normNew || (normExisting.includes(normNew) && normNew.length < 15)) {
      return true;
    }
  }
  return false;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL valide requise' }, { status: 400 });
    }

    let targetUrl = url.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = `https://${targetUrl}`;
    }

    // 1. Fetch HTML content
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'no-cache',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Impossible d'accéder à la page (${response.status} ${response.statusText})` },
        { status: 400 }
      );
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const pageTitle = $('title').text().trim() || 'Page Clonée';

    // Remove noise elements
    $('script, style, noscript, iframe, svg, meta, link, nav.cookie, div.cookie').remove();

    const clonedElements: any[] = [];
    const now = Date.now();

    // Helper: Parse elements inside a container div / col
    const parseContainerChildren = ($container: any): any[] => {
      const children: any[] = [];
      const extractedTextList: string[] = [];

      $container.find('h1, h2, h3, h4, h5, h6, p, img, a, button, input, textarea, select, li, [class*="btn"], [class*="button"]').each((i: number, el: any) => {
        const $el = $(el);
        const tagName = el.tagName ? el.tagName.toLowerCase() : '';
        const styleProps = extractStyleProps($el.attr('style'), $el.attr('class'));
        const rawText = cleanText($el.text());

        // 1. BUTTONS / CTAs (a, button, or elements with btn/button class)
        const isButton = tagName === 'button' || tagName === 'a' || $el.hasClass('btn') || $el.hasClass('button') || $el.hasClass('cta') || $el.attr('role') === 'button';
        if (isButton && rawText && rawText.length > 1 && rawText.length < 120) {
          if (!isDuplicateText(rawText, extractedTextList)) {
            extractedTextList.push(rawText);
            const btnBg = styleProps.bgColor || (rawText.toLowerCase().includes('oui') || rawText.includes('✅') ? '#16a34a' : '#dc2626');
            children.push({
              id: `cloned-btn-${now}-${Math.random().toString(36).substring(2, 6)}`,
              type: 'ButtonCTA',
              category: 'Bouton',
              content: rawText,
              data: {
                btnColor: btnBg,
                textColor: styleProps.textColor || '#ffffff',
                linkUrl: makeAbsoluteUrl($el.attr('href'), targetUrl),
              },
            });
            return;
          }
        }

        // 2. HEADINGS (h1 - h6 or title class)
        if (tagName.startsWith('h') || $el.hasClass('title') || $el.hasClass('heading') || $el.hasClass('headline')) {
          if (rawText && !isDuplicateText(rawText, extractedTextList)) {
            extractedTextList.push(rawText);
            children.push({
              id: `cloned-heading-${now}-${Math.random().toString(36).substring(2, 6)}`,
              type: 'Heading',
              category: 'Texte',
              content: rawText,
              data: {
                fontSize: tagName === 'h1' ? 'text-4xl' : tagName === 'h2' ? 'text-3xl' : 'text-xl',
                fontWeight: 'font-black',
                textColor: styleProps.textColor || '#ffffff',
              },
            });
            return;
          }
        }

        // 3. IMAGES (img tags)
        if (tagName === 'img') {
          const src = $el.attr('src') || $el.attr('data-src') || $el.attr('data-lazy-src') || $el.attr('srcset');
          const absSrc = makeAbsoluteUrl(src, targetUrl);
          if (absSrc && !absSrc.includes('tracking') && !absSrc.includes('pixel') && !absSrc.endsWith('.svg')) {
            children.push({
              id: `cloned-img-${now}-${Math.random().toString(36).substring(2, 6)}`,
              type: 'Image',
              category: 'Média',
              content: absSrc,
              data: {
                img: absSrc,
                imgObjectFit: 'cover',
              },
            });
            return;
          }
        }

        // 4. FORM INPUTS (input, textarea)
        if (tagName === 'input' || tagName === 'textarea') {
          const placeholder = $el.attr('placeholder') || $el.attr('name') || 'Votre e-mail...';
          const type = $el.attr('type') || 'text';
          if (type !== 'hidden' && type !== 'submit') {
            children.push({
              id: `cloned-input-${now}-${Math.random().toString(36).substring(2, 6)}`,
              type: 'FormInput',
              category: 'Formulaire',
              content: placeholder,
              data: {
                placeholder,
                inputType: type,
                title: $el.prev('label').text().trim() || 'Champ de formulaire',
              },
            });
            return;
          }
        }

        // 5. PARAGRAPHS & LIST ITEMS (p, li)
        if (tagName === 'p' || tagName === 'li') {
          if (rawText && rawText.length > 1 && !isDuplicateText(rawText, extractedTextList)) {
            extractedTextList.push(rawText);
            children.push({
              id: `cloned-text-${now}-${Math.random().toString(36).substring(2, 6)}`,
              type: 'Text',
              category: 'Texte',
              content: rawText,
              data: {
                fontSize: 'text-base',
                textColor: styleProps.textColor || '#ffffff',
              },
            });
          }
        }
      });

      return children;
    };

    // 2. Identify Section Elements (<section>, or top-level containers)
    let $sections = $('section, header, footer, main, div[class*="section"], div[class*="hero"], div[class*="block"], div[class*="wrapper"]');
    if ($sections.length === 0) {
      $sections = $('body > div, body > main > div');
    }

    let sectionIndex = 0;

    $sections.each((sIdx: number, secEl: any) => {
      const $sec = $(secEl);
      const styleProps = extractStyleProps($sec.attr('style'), $sec.attr('class'));
      const bgColor = styleProps.bgColor || (sectionIndex % 2 === 0 ? '#0b1329' : '#0f172a');

      // Deep search for columns / grids inside section
      let $cols = $sec.find('[class*="col"], [class*="grid"] > div, .row > div, .container > div');
      if ($cols.length < 2) {
        $cols = $sec.children('div');
      }

      const subChildren = parseContainerChildren($sec);
      if (subChildren.length === 0) return; // Skip empty containers

      sectionIndex++;
      const isMultiCol = $cols.length >= 2 && $cols.length <= 4;
      const numCols = isMultiCol ? Math.min($cols.length, 3) : 1;
      const layoutMode = numCols === 3 ? 'grid-3' : numCols === 2 ? 'grid-2' : 'grid-1';

      const childCols: any[] = [];
      for (let c = 0; c < numCols; c++) {
        const $col = isMultiCol ? $($cols[c]) : null;
        const colStyle = $col ? extractStyleProps($col.attr('style'), $col.attr('class')) : {};
        const colItems = $col ? parseContainerChildren($col) : subChildren;

        childCols.push({
          id: `cloned-col-${now}-${sectionIndex}-${c}`,
          type: 'ContentBox',
          data: {
            cardBgColor: colStyle.bgColor || 'transparent',
            cardTextColor: colStyle.textColor || '#ffffff',
            children: colItems.length > 0 ? colItems : (c === 0 ? subChildren : []),
          },
        });
      }

      clonedElements.push({
        id: `cloned-sec-${now}-${sectionIndex}`,
        type: 'Section',
        category: 'Structure',
        content: `Section Clonée #${sectionIndex}`,
        data: {
          bgColor,
          textColor: styleProps.textColor || '#ffffff',
          layoutMode,
          children: childCols,
          paddingY: 48,
          paddingX: 24,
        },
      });
    });

    // Fallback if no specific section tags were matched
    if (clonedElements.length === 0) {
      const allChildren = parseContainerChildren($('body'));
      clonedElements.push({
        id: `cloned-sec-master-${now}`,
        type: 'Section',
        category: 'Structure',
        content: `Page Clonée: ${pageTitle}`,
        data: {
          bgColor: '#0b1329',
          textColor: '#ffffff',
          layoutMode: 'grid-1',
          children: [
            {
              id: `cloned-col-master-${now}`,
              type: 'ContentBox',
              data: {
                cardBgColor: 'transparent',
                children: allChildren,
              },
            },
          ],
        },
      });
    }

    return NextResponse.json({
      success: true,
      elements: clonedElements,
      sourceUrl: targetUrl,
      title: pageTitle,
      totalSections: clonedElements.length,
    });
  } catch (error: any) {
    console.error('Error cloning URL:', error);
    return NextResponse.json({ error: error.message || 'Erreur lors du clonage de la page' }, { status: 500 });
  }
}
