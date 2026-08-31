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

function extractColorFromStyle(styleStr: string | undefined): string | null {
  if (!styleStr) return null;
  const match = styleStr.match(/background-color:\s*([^;]+)/i) || styleStr.match(/background:\s*([^;]+)/i);
  if (match) {
    const val = match[1].trim();
    if (val.startsWith('#') || val.startsWith('rgb')) return val;
  }
  return null;
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

    // 1. Fetch HTML content with realistic User-Agent
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
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

    // Remove noise elements (scripts, styles, noscript, iframe, meta, link)
    $('script, style, noscript, iframe, svg, meta, link').remove();

    const clonedElements: any[] = [];
    const now = Date.now();

    // Helper to extract content from an HTML element
    const parseContainerChildren = ($container: any): any[] => {
      const children: any[] = [];

      $container.find('h1, h2, h3, h4, h5, h6, p, img, a.btn, a.button, button, input, form').each((i: any, el: any) => {
        const $el = $(el);
        const tagName = el.tagName.toLowerCase();

        if (tagName.startsWith('h')) {
          const text = $el.text().trim();
          if (text && text.length > 1) {
            children.push({
              id: `cloned-heading-${now}-${Math.random().toString(36).substring(2, 6)}`,
              type: 'Heading',
              category: 'Texte',
              content: text,
              data: { fontSize: tagName === 'h1' ? 'text-4xl' : 'text-2xl', fontWeight: 'font-black' },
            });
          }
        } else if (tagName === 'p') {
          const text = $el.text().trim();
          if (text && text.length > 2) {
            children.push({
              id: `cloned-text-${now}-${Math.random().toString(36).substring(2, 6)}`,
              type: 'Text',
              category: 'Texte',
              content: text,
              data: { fontSize: 'text-base', textColor: '#e2e8f0' },
            });
          }
        } else if (tagName === 'img') {
          const src = $el.attr('src') || $el.attr('data-src') || $el.attr('srcset');
          const absSrc = makeAbsoluteUrl(src, targetUrl);
          if (absSrc && !absSrc.includes('tracking') && !absSrc.includes('pixel')) {
            children.push({
              id: `cloned-img-${now}-${Math.random().toString(36).substring(2, 6)}`,
              type: 'Image',
              category: 'Média',
              content: absSrc,
              data: { img: absSrc, imgObjectFit: 'cover' },
            });
          }
        } else if (tagName === 'a' || tagName === 'button') {
          const text = $el.text().trim();
          if (text && text.length > 1 && text.length < 100) {
            children.push({
              id: `cloned-btn-${now}-${Math.random().toString(36).substring(2, 6)}`,
              type: 'ButtonCTA',
              category: 'Bouton',
              content: text,
              data: { btnColor: '#00A0FF', textColor: '#ffffff' },
            });
          }
        } else if (tagName === 'input') {
          const placeholder = $el.attr('placeholder') || $el.attr('name') || 'Votre e-mail...';
          const type = $el.attr('type') || 'text';
          if (type !== 'hidden' && type !== 'submit') {
            children.push({
              id: `cloned-input-${now}-${Math.random().toString(36).substring(2, 6)}`,
              type: 'FormInput',
              category: 'Formulaire',
              content: placeholder,
              data: { placeholder, inputType: type },
            });
          }
        }
      });

      return children;
    };

    // 2. Identify Section Elements (<section>, or top-level containers)
    let $sections = $('section, header, footer, main');
    if ($sections.length === 0) {
      $sections = $('body > div, body > main > div');
    }

    if ($sections.length > 0) {
      $sections.each((sIdx: number, secEl: any) => {
        const $sec = $(secEl);
        const style = $sec.attr('style');
        const bgColor = extractColorFromStyle(style) || (sIdx % 2 === 0 ? '#0b1329' : '#0f172a');

        // Check columns inside section
        const $cols = $sec.find('> div, > .container > div, > .row > div, > .grid > div');
        const subChildren = parseContainerChildren($sec);

        if (subChildren.length === 0) return; // Skip empty sections

        const isMultiCol = $cols.length >= 2;
        const layoutMode = isMultiCol ? ($cols.length >= 3 ? 'grid-3' : 'grid-2') : 'grid-1';
        const numCols = isMultiCol ? Math.min($cols.length, 3) : 1;

        const childCols: any[] = [];
        for (let c = 0; c < numCols; c++) {
          const colItems = isMultiCol ? parseContainerChildren($($cols[c])) : (c === 0 ? subChildren : []);
          childCols.push({
            id: `cloned-col-${sIdx}-${c}-${now}`,
            type: 'ContentBox',
            data: {
              cardBgColor: 'transparent',
              cardTextColor: '#ffffff',
              children: colItems.length > 0 ? colItems : (c === 0 ? subChildren : []),
            },
          });
        }

        clonedElements.push({
          id: `cloned-sec-${now}-${sIdx}`,
          type: 'Section',
          category: 'Structure',
          content: `Section Clonée #${sIdx + 1}`,
          data: {
            bgColor,
            textColor: '#ffffff',
            layoutMode,
            children: childCols,
            paddingY: 48,
            paddingX: 24,
          },
        });
      });
    }

    // Fallback if no sections were extracted: create 1 master section
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
