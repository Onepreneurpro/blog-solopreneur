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

function extractStyleProps(styleStr: string | undefined): { bgColor?: string; textColor?: string; bgImage?: string } {
  const result: { bgColor?: string; textColor?: string; bgImage?: string } = {};
  if (!styleStr) return result;

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

  return result;
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

    // 1. Fetch HTML content with realistic User-Agent (Chrome/Windows)
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

    // Clean noise elements (scripts, styles, noscript, iframe, meta, link)
    $('script, style, noscript, iframe, svg, meta, link, nav.cookie, div.cookie').remove();

    const clonedElements: any[] = [];
    const now = Date.now();

    // Helper: Parse elements inside a container div / col
    const parseContainerChildren = ($container: any): any[] => {
      const children: any[] = [];
      const visitedTexts = new Set<string>();

      $container.find('h1, h2, h3, h4, h5, h6, p, img, a, button, input, textarea, select, span, div, li').each((i: number, el: any) => {
        const $el = $(el);
        const tagName = el.tagName ? el.tagName.toLowerCase() : '';
        const styleProps = extractStyleProps($el.attr('style'));
        const directText = $el.clone().children().remove().end().text().trim();
        const fullText = $el.text().trim();

        // 1. HEADINGS (h1 - h6 or elements with heading class/large text)
        if (tagName.startsWith('h') || $el.hasClass('heading') || $el.hasClass('title') || $el.hasClass('headline')) {
          if (fullText && fullText.length > 1 && !visitedTexts.has(fullText)) {
            visitedTexts.add(fullText);
            children.push({
              id: `cloned-heading-${now}-${Math.random().toString(36).substring(2, 6)}`,
              type: 'Heading',
              category: 'Texte',
              content: fullText,
              data: {
                fontSize: tagName === 'h1' ? 'text-4xl' : tagName === 'h2' ? 'text-3xl' : 'text-xl',
                fontWeight: 'font-black',
                textColor: styleProps.textColor || '#ffffff',
              },
            });
          }
        }
        // 2. IMAGES (img tags or inline background-images)
        else if (tagName === 'img') {
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
          }
        }
        // 3. BUTTONS / LINKS (a, button)
        else if (tagName === 'a' || tagName === 'button') {
          const isButtonLike = $el.hasClass('btn') || $el.hasClass('button') || $el.hasClass('cta') || tagName === 'button' || $el.attr('role') === 'button';
          if (fullText && fullText.length > 1 && fullText.length < 120 && isButtonLike) {
            if (!visitedTexts.has(fullText)) {
              visitedTexts.add(fullText);
              children.push({
                id: `cloned-btn-${now}-${Math.random().toString(36).substring(2, 6)}`,
                type: 'ButtonCTA',
                category: 'Bouton',
                content: fullText,
                data: {
                  btnColor: styleProps.bgColor || '#00A0FF',
                  textColor: styleProps.textColor || '#ffffff',
                  linkUrl: makeAbsoluteUrl($el.attr('href'), targetUrl),
                },
              });
            }
          }
        }
        // 4. FORM INPUTS (input, textarea, select)
        else if (tagName === 'input' || tagName === 'textarea') {
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
          }
        }
        // 5. PARAGRAPHS & TEXT (p, li, span, or text-only div)
        else if (tagName === 'p' || tagName === 'li' || (tagName === 'span' && directText.length > 3) || (tagName === 'div' && directText.length > 10 && $el.children().length === 0)) {
          const textToUse = directText.length > 3 ? directText : fullText;
          if (textToUse && textToUse.length > 2 && !visitedTexts.has(textToUse)) {
            visitedTexts.add(textToUse);
            children.push({
              id: `cloned-text-${now}-${Math.random().toString(36).substring(2, 6)}`,
              type: 'Text',
              category: 'Texte',
              content: textToUse,
              data: {
                fontSize: 'text-base',
                textColor: styleProps.textColor || '#e2e8f0',
              },
            });
          }
        }
      });

      return children;
    };

    // 2. Detect Sections (<section>, <header>, <footer>, <main>, or div.section, div.container, top-level divs)
    let $sections = $('section, header, footer, main, div[class*="section"], div[class*="hero"], div[class*="block"], div[class*="wrapper"], div[class*="container"]');
    if ($sections.length === 0) {
      $sections = $('body > div, body > main > div');
    }

    let sectionIndex = 0;

    $sections.each((sIdx: number, secEl: any) => {
      const $sec = $(secEl);
      const styleProps = extractStyleProps($sec.attr('style'));
      const bgColor = styleProps.bgColor || (sectionIndex % 2 === 0 ? '#0b1329' : '#0f172a');

      // Detect Columns / Grids inside this section
      const $cols = $sec.find('> div, > .container > div, > .row > div, > .grid > div, > [class*="col"]');
      const subChildren = parseContainerChildren($sec);

      if (subChildren.length === 0) return; // Skip empty containers

      sectionIndex++;
      const isMultiCol = $cols.length >= 2;
      const numCols = isMultiCol ? Math.min($cols.length, 3) : 1;
      const layoutMode = numCols === 3 ? 'grid-3' : numCols === 2 ? 'grid-2' : 'grid-1';

      const childCols: any[] = [];
      for (let c = 0; c < numCols; c++) {
        const colItems = isMultiCol ? parseContainerChildren($($cols[c])) : (c === 0 ? subChildren : []);
        childCols.push({
          id: `cloned-col-${now}-${sectionIndex}-${c}`,
          type: 'ContentBox',
          data: {
            cardBgColor: 'transparent',
            cardTextColor: '#ffffff',
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

    // Fallback if no specific section tags were matched: extract directly from body
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
