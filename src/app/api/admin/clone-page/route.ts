import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(req: Request) {
  let browser = null;
  try {
    const body = await req.json();
    const { url, mode = 'native' } = body; // 'native' | 'raw'

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
    await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 35000 });

    const pageTitle = await page.title();
    const now = Date.now();

    // MODE 1: RAW PIXEL-PERFECT HTML/CSS COPY
    if (mode === 'raw') {
      const rawData = await page.evaluate((baseUrl: string, nowVal: any) => {
        // Rewrite relative URLs to absolute URLs
        const makeAbs = (rel: string) => {
          if (!rel) return '';
          if (rel.startsWith('data:') || rel.startsWith('http://') || rel.startsWith('https://')) return rel;
          try {
            return new URL(rel, baseUrl).href;
          } catch (e) {
            return rel;
          }
        };

        // Fix all img src and a href in DOM
        document.querySelectorAll('img').forEach((img) => {
          const src = img.getAttribute('src') || img.getAttribute('data-src') || '';
          if (src) img.setAttribute('src', makeAbs(src));
        });

        document.querySelectorAll('a').forEach((a) => {
          const href = a.getAttribute('href') || '';
          if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
            a.setAttribute('href', makeAbs(href));
          }
        });

        // 1. Extract CSS Stylesheet URLs and Inline CSS <style>
        const stylesheetUrls: string[] = [];
        document.querySelectorAll('link[rel="stylesheet"]').forEach((link: any) => {
          if (link.href && !link.href.includes('google-analytics')) {
            stylesheetUrls.push(makeAbs(link.getAttribute('href') || link.href));
          }
        });

        let customCss = '';
        document.querySelectorAll('style').forEach((styleEl: any) => {
          const cssText = styleEl.textContent || '';
          if (cssText.length > 5 && !cssText.includes('google-analytics')) {
            customCss += cssText + '\n';
          }
        });

        // 2. Extract JS Script URLs and Inline JS <script>
        const scriptUrls: string[] = [];
        document.querySelectorAll('script[src]').forEach((scriptEl: any) => {
          const src = scriptEl.getAttribute('src');
          if (src && !src.includes('google-analytics') && !src.includes('facebook') && !src.includes('gtm')) {
            scriptUrls.push(makeAbs(src));
          }
        });

        let customJs = '';
        document.querySelectorAll('script:not([src])').forEach((scriptEl: any) => {
          const jsText = scriptEl.textContent || '';
          if (jsText.length > 5 && !jsText.includes('gtag') && !jsText.includes('fbq') && !jsText.includes('GoogleAnalytics')) {
            customJs += jsText + '\n';
          }
        });

        // Remove noise elements
        document.querySelectorAll('script, nav.cookie, div.cookie, iframe[src*="facebook"]').forEach((el) => el.remove());

        const bodyHtml = document.body ? document.body.innerHTML : '';

        return [
          {
            id: `cloned-raw-${nowVal}`,
            type: 'RawHTML',
            category: 'Structure',
            content: `Page Clonée Pixel-Perfect: ${document.title || 'Landing Page'}`,
            data: {
              rawHtml: bodyHtml,
              customCss,
              stylesheetUrls,
              scriptUrls,
              customJs,
            },
          },
        ];
      }, targetUrl, now);

      await browser.close();
      return NextResponse.json({
        success: true,
        elements: rawData,
        sourceUrl: targetUrl,
        title: pageTitle,
        totalSections: 1,
        mode: 'raw',
      });
    }

    // MODE 2: NATIVE BUILDER BLOCKS CONVERSION
    const extractedData = await page.evaluate((nowVal: any) => {
      const results: any[] = [];

      const stylesheetUrls: string[] = [];
      Array.from(document.querySelectorAll('link[rel="stylesheet"]')).forEach((link: any) => {
        if (link.href && !link.href.includes('google-analytics') && !link.href.includes('pixel')) {
          stylesheetUrls.push(link.href);
        }
      });

      let customCss = '';
      Array.from(document.querySelectorAll('style')).forEach((styleEl: any) => {
        const cssText = styleEl.textContent || '';
        if (cssText.length > 5 && !cssText.includes('google-analytics')) {
          customCss += cssText + '\n';
        }
      });

      const scriptUrls: string[] = [];
      Array.from(document.querySelectorAll('script[src]')).forEach((scriptEl: any) => {
        const src = scriptEl.src;
        if (src && !src.includes('google-analytics') && !src.includes('facebook') && !src.includes('gtm') && !src.includes('pixel')) {
          scriptUrls.push(src);
        }
      });

      let customJs = '';
      Array.from(document.querySelectorAll('script:not([src])')).forEach((scriptEl: any) => {
        const jsText = scriptEl.textContent || '';
        if (jsText.length > 5 && !jsText.includes('gtag') && !jsText.includes('fbq') && !jsText.includes('GoogleAnalytics')) {
          customJs += jsText + '\n';
        }
      });

      const isVisible = (el: Element) => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
      };

      const rgbToHex = (rgb: string) => {
        if (!rgb || rgb === 'transparent' || rgb === 'rgba(0, 0, 0, 0)') return 'transparent';
        const match = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (!match) return rgb;
        return '#' + [match[1], match[2], match[3]].map((x) => parseInt(x).toString(16).padStart(2, '0')).join('');
      };

      const cleanTextStr = (str: string) => str.replace(/\s+/g, ' ').trim();

      const sections = Array.from(
        document.querySelectorAll('section, header, footer, main, div[class*="section"], div[class*="hero"], div[class*="block"], div[class*="wrapper"], body > div')
      ).filter((sec) => isVisible(sec) && sec.clientHeight > 40);

      const targetSections = sections.length > 0 ? sections : [document.body];

      targetSections.forEach((sec, sIdx) => {
        const secStyle = window.getComputedStyle(sec);
        const secBg = rgbToHex(secStyle.backgroundColor);
        const secTextCol = rgbToHex(secStyle.color);

        const cols = Array.from(sec.querySelectorAll(':scope > div, :scope > .container > div, :scope > .row > div, :scope > .grid > div, [class*="col"]')).filter(
          (c) => isVisible(c) && c.clientWidth > 40
        );

        const isMultiCol = cols.length >= 2 && cols.length <= 4;
        const numCols = isMultiCol ? Math.min(cols.length, 3) : 1;
        const layoutMode = numCols === 3 ? 'grid-3' : numCols === 2 ? 'grid-2' : 'grid-1';

        const parseBlockElements = (rootEl: Element) => {
          const items: any[] = [];
          const textSet = new Set<string>();

          const els = Array.from(rootEl.querySelectorAll('h1, h2, h3, h4, h5, h6, p, img, a, button, input, textarea, [class*="btn"], [class*="button"]')).filter(
            (e) => isVisible(e)
          );

          els.forEach((e) => {
            const tag = e.tagName.toLowerCase();
            const style = window.getComputedStyle(e);
            const text = cleanTextStr(e.textContent || '');
            const bg = rgbToHex(style.backgroundColor);
            const fg = rgbToHex(style.color);
            const className = e.className || '';

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
                  className,
                },
              });
              return;
            }

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
                    className,
                  },
                });
                return;
              }
            }

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
                    className,
                  },
                });
                return;
              }
            }

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
                    className,
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
              className: colEl ? colEl.className : '',
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
            className: sec.className || '',
            stylesheetUrls: sIdx === 0 ? stylesheetUrls : [],
            customCss: sIdx === 0 ? customCss : '',
            scriptUrls: sIdx === 0 ? scriptUrls : [],
            customJs: sIdx === 0 ? customJs : '',
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
      mode: 'native',
    });
  } catch (error: any) {
    if (browser) await browser.close();
    console.error('Puppeteer Clone Error:', error);
    return NextResponse.json({ error: error.message || 'Erreur lors du clonage de la page' }, { status: 500 });
  }
}
