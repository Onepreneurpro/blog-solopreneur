import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(req: Request) {
  let browser = null;
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

    // Launch headless Chrome browser
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    );

    // Navigate and wait for DOM and network idle
    await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 30000 });

    const pageTitle = await page.title();
    const now = Date.now();

    // Execute in-browser DOM parsing with computed styles
    const extractedData = await page.evaluate((nowVal: any) => {
      const results: any[] = [];

      // Helper to check if element is visible
      const isVisible = (el: Element) => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
      };

      // Helper to convert rgb(r, g, b) to hex
      const rgbToHex = (rgb: string) => {
        if (!rgb || rgb === 'transparent' || rgb === 'rgba(0, 0, 0, 0)') return 'transparent';
        const match = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (!match) return rgb;
        return '#' + [match[1], match[2], match[3]].map((x) => parseInt(x).toString(16).padStart(2, '0')).join('');
      };

      const cleanTextStr = (str: string) => str.replace(/\s+/g, ' ').trim();

      // Find all sections or main layout blocks
      const sections = Array.from(
        document.querySelectorAll('section, header, footer, main, div[class*="section"], div[class*="hero"], div[class*="block"], div[class*="wrapper"], body > div')
      ).filter((sec) => isVisible(sec) && sec.clientHeight > 40);

      const targetSections = sections.length > 0 ? sections : [document.body];

      targetSections.forEach((sec, sIdx) => {
        const secStyle = window.getComputedStyle(sec);
        const secBg = rgbToHex(secStyle.backgroundColor);
        const secTextCol = rgbToHex(secStyle.color);

        // Find columns / rows inside this section
        const cols = Array.from(sec.querySelectorAll(':scope > div, :scope > .container > div, :scope > .row > div, :scope > .grid > div, [class*="col"]')).filter(
          (c) => isVisible(c) && c.clientWidth > 40
        );

        const isMultiCol = cols.length >= 2 && cols.length <= 4;
        const numCols = isMultiCol ? Math.min(cols.length, 3) : 1;
        const layoutMode = numCols === 3 ? 'grid-3' : numCols === 2 ? 'grid-2' : 'grid-1';

        const parseBlockElements = (rootEl: Element) => {
          const items: any[] = [];
          const textSet = new Set<string>();

          // Find all buttons, headings, text, images, inputs
          const els = Array.from(rootEl.querySelectorAll('h1, h2, h3, h4, h5, h6, p, img, a, button, input, textarea, [class*="btn"], [class*="button"]')).filter(
            (e) => isVisible(e)
          );

          els.forEach((e) => {
            const tag = e.tagName.toLowerCase();
            const style = window.getComputedStyle(e);
            const text = cleanTextStr(e.textContent || '');
            const bg = rgbToHex(style.backgroundColor);
            const fg = rgbToHex(style.color);

            // BUTTONS / CTAs
            const isBtn = tag === 'button' || tag === 'a' || e.classList.contains('btn') || e.classList.contains('button') || e.getAttribute('role') === 'button';
            if (isBtn && text.length > 1 && text.length < 120 && !textSet.has(text)) {
              textSet.add(text);
              const linkUrl = e.getAttribute('href') || '#';
              const btnColor = bg !== 'transparent' ? bg : text.toLowerCase().includes('oui') || text.includes('✅') ? '#16a34a' : '#dc2626';
              items.push({
                id: `cloned-btn-${nowVal}-${Math.random().toString(36).substring(2, 6)}`,
                type: 'ButtonCTA',
                category: 'Bouton',
                content: text,
                data: {
                  btnColor,
                  textColor: fg !== 'transparent' ? fg : '#ffffff',
                  linkUrl,
                },
              });
              return;
            }

            // HEADINGS
            if (tag.startsWith('h') || e.classList.contains('title') || e.classList.contains('heading')) {
              if (text && text.length > 1 && !textSet.has(text)) {
                textSet.add(text);
                items.push({
                  id: `cloned-heading-${nowVal}-${Math.random().toString(36).substring(2, 6)}`,
                  type: 'Heading',
                  category: 'Texte',
                  content: text,
                  data: {
                    fontSize: tag === 'h1' ? 'text-4xl' : tag === 'h2' ? 'text-3xl' : 'text-xl',
                    fontWeight: 'font-black',
                    textColor: fg !== 'transparent' ? fg : '#ffffff',
                  },
                });
                return;
              }
            }

            // IMAGES
            if (tag === 'img') {
              const imgEl = e as HTMLImageElement;
              const src = imgEl.src || imgEl.getAttribute('data-src') || '';
              if (src && !src.includes('pixel') && !src.includes('tracking') && imgEl.naturalWidth > 20) {
                items.push({
                  id: `cloned-img-${nowVal}-${Math.random().toString(36).substring(2, 6)}`,
                  type: 'Image',
                  category: 'Média',
                  content: src,
                  data: {
                    img: src,
                    imgObjectFit: 'cover',
                  },
                });
                return;
              }
            }

            // PARAGRAPHS & TEXT
            if (tag === 'p' || tag === 'li') {
              if (text && text.length > 2 && !textSet.has(text)) {
                textSet.add(text);
                items.push({
                  id: `cloned-text-${nowVal}-${Math.random().toString(36).substring(2, 6)}`,
                  type: 'Text',
                  category: 'Texte',
                  content: text,
                  data: {
                    fontSize: 'text-base',
                    textColor: fg !== 'transparent' ? fg : '#ffffff',
                  },
                });
                return;
              }
            }
          });

          return items;
        };

        const childCols: any[] = [];
        for (let c = 0; c < numCols; c++) {
          const colEl = isMultiCol ? cols[c] : sec;
          const colStyle = colEl ? window.getComputedStyle(colEl) : null;
          const colBg = colStyle ? rgbToHex(colStyle.backgroundColor) : 'transparent';
          const colItems = parseBlockElements(colEl);

          childCols.push({
            id: `cloned-col-${nowVal}-${sIdx}-${c}`,
            type: 'ContentBox',
            data: {
              cardBgColor: colBg !== 'transparent' ? colBg : 'transparent',
              cardTextColor: '#ffffff',
              children: colItems,
            },
          });
        }

        results.push({
          id: `cloned-sec-${nowVal}-${sIdx}`,
          type: 'Section',
          category: 'Structure',
          content: `Section Clonée #${sIdx + 1}`,
          data: {
            bgColor: secBg !== 'transparent' ? secBg : (sIdx % 2 === 0 ? '#0b1329' : '#0f172a'),
            textColor: secTextCol !== 'transparent' ? secTextCol : '#ffffff',
            layoutMode,
            children: childCols,
            paddingY: 48,
            paddingX: 24,
          },
        });
      });

      return results;
    }, now);

    await browser.close();

    return NextResponse.json({
      success: true,
      elements: extractedData,
      sourceUrl: targetUrl,
      title: pageTitle,
      totalSections: extractedData.length,
    });
  } catch (error: any) {
    if (browser) await browser.close();
    console.error('Puppeteer Clone Error:', error);
    return NextResponse.json({ error: error.message || 'Erreur lors du clonage de la page' }, { status: 500 });
  }
}
