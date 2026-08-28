'use client';

import React from 'react';
import { FreeEbookOptinPixel } from '@/components/public/pixel/FreeEbookOptinPixel';

interface ArticleBodyProps {
  content: string;
  isDark?: boolean;
}

export function ArticleBody({ content, isDark = false }: ArticleBodyProps) {
  if (!content) return null;

  let rawHtml = content || '';

  // Clean out any admin delete bars
  rawHtml = rawHtml.replace(/<div[^>]*class=["'][^"']*delete-block-bar[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, '');

  // Exact matching regex to isolate figure optin blocks from opening <figure> to closing </figure>
  const figureOptinRegex = /<figure[^>]*class=["'][^"']*optin-ebook-embed[^"']*[\s\S]*?<\/figure>/gi;
  const legacyDivOptinRegex = /<div[^>]*class=["'][^"']*optin-ebook-embed[^"']*[\s\S]*?<\/div>/gi;

  // Standardize any legacy div optin blocks to figure optin blocks
  const sanitizedHtml = rawHtml.replace(legacyDivOptinRegex, (match) => {
    return match.replace(/^<div/i, '<figure').replace(/<\/div>$/i, '</figure>');
  });

  const hasOptIn = sanitizedHtml.includes('optin-ebook-embed');

  if (!hasOptIn) {
    return (
      <div
        className={`p-6 sm:p-10 rounded-md border shadow-xl prose max-w-none leading-relaxed space-y-6 [&_img]:rounded-md [&_blockquote]:rounded-md [&_figure]:rounded-md ${
          isDark ? 'bg-slate-900/80 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
        }`}
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    );
  }

  // Extract all matched figure blocks and their inner HTML content
  const matches = Array.from(sanitizedHtml.matchAll(figureOptinRegex));
  const parts = sanitizedHtml.split(figureOptinRegex);

  return (
    <div
      className={`p-6 sm:p-10 rounded-md border shadow-xl prose max-w-none leading-relaxed space-y-6 [&_img]:rounded-md [&_blockquote]:rounded-md [&_figure]:rounded-md ${
        isDark ? 'bg-slate-900/80 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
      }`}
    >
      {parts.map((part, idx) => {
        let extractedTitle: string | undefined = undefined;
        let extractedSubtitle: string | undefined = undefined;
        let extractedBadge: string | undefined = undefined;
        let extractedBookCoverUrl: string | undefined = undefined;
        let extractedBookTitle: string | undefined = undefined;
        let extractedTargetListId: string | undefined = undefined;
        let extractedWelcomeStepId: string | undefined = undefined;

        if (idx < matches.length) {
          const matchHtml = matches[idx][0];

          // 1. Title extraction
          const titleMatch = matchHtml.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i);
          if (titleMatch && titleMatch[1]) {
            extractedTitle = titleMatch[1].replace(/&nbsp;/gi, ' ').replace(/\s+/g, ' ').trim();
          }

          // 2. Subtitle extraction
          const subtitleMatch = matchHtml.match(/<p[^>]*class=["'][^"']*optin-subtitle[^"']*["'][^>]*>([\s\S]*?)<\/p>/i)
            || matchHtml.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
          if (subtitleMatch && subtitleMatch[1]) {
            extractedSubtitle = subtitleMatch[1].replace(/&nbsp;/gi, ' ').replace(/\s+/g, ' ').trim();
          }

          // 3. Badge text extraction
          const badgeMatch =
            matchHtml.match(/<(?:div|span)[^>]*class=["'][^"']*optin-badge[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|span)>/i) ||
            matchHtml.match(/<(?:div|span)[^>]*class=["'][^"']*bg-\[#a3e635\][^"']*["'][^>]*>([\s\S]*?)<\/(?:div|span)>/i) ||
            matchHtml.match(/<(?:div|span)[^>]*rounded-full[^>]*>([\s\S]*?)<\/(?:div|span)>/i);

          if (badgeMatch && badgeMatch[1]) {
            const rawText = badgeMatch[1].replace(/<[^>]*>/g, '').replace(/🎁|✨/g, '');
            const cleanBadge = rawText.replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/\s+/g, ' ').trim();
            if (cleanBadge) {
              extractedBadge = cleanBadge;
            }
          }

          // 4. Book cover URL extraction
          const coverAttrMatch = matchHtml.match(/data-book-cover=["']([^"']*)["']/i);
          if (coverAttrMatch && coverAttrMatch[1]) {
            extractedBookCoverUrl = coverAttrMatch[1].trim();
          }

          if (!extractedBookCoverUrl) {
            const coverInputMatch = matchHtml.match(/class=["'][^"']*optin-cover-input[^"']*["'][^>]*value=["']([^"']*)["']/i);
            if (coverInputMatch && coverInputMatch[1]) {
              extractedBookCoverUrl = coverInputMatch[1].trim();
            }
          }

          if (!extractedBookCoverUrl) {
            const imgMatch = matchHtml.match(/<img[^>]*src=["']([^"']*)["']/i);
            if (imgMatch && imgMatch[1]) {
              extractedBookCoverUrl = imgMatch[1].trim();
            }
          }

          // 5. Book title extraction
          const bookTitleAttrMatch = matchHtml.match(/data-book-title=["']([^"']*)["']/i);
          if (bookTitleAttrMatch && bookTitleAttrMatch[1]) {
            extractedBookTitle = bookTitleAttrMatch[1].trim();
          }

          // 6. Target lead list extraction
          const targetListAttrMatch = matchHtml.match(/data-target-list-id=["']([^"']*)["']/i);
          if (targetListAttrMatch && targetListAttrMatch[1]) {
            extractedTargetListId = targetListAttrMatch[1].trim();
          }
          if (!extractedTargetListId) {
            const listOptionMatch = matchHtml.match(/optin-target-list-select[\s\S]*?<option[^>]*value=["']([^"']+)["'][^>]*selected/i);
            if (listOptionMatch && listOptionMatch[1]) {
              extractedTargetListId = listOptionMatch[1].trim();
            }
          }

          // 7. Welcome step extraction
          const welcomeStepAttrMatch = matchHtml.match(/data-welcome-step-id=["']([^"']*)["']/i);
          if (welcomeStepAttrMatch && welcomeStepAttrMatch[1]) {
            extractedWelcomeStepId = welcomeStepAttrMatch[1].trim();
          }
          if (!extractedWelcomeStepId) {
            const stepOptionMatch = matchHtml.match(/optin-welcome-step-select[\s\S]*?<option[^>]*value=["']([^"']+)["'][^>]*selected/i);
            if (stepOptionMatch && stepOptionMatch[1]) {
              extractedWelcomeStepId = stepOptionMatch[1].trim();
            }
          }
        }

        const blockSettings: any = {};
        if (extractedBadge) blockSettings.badgeText = extractedBadge;
        if (extractedBookCoverUrl) blockSettings.bookCoverUrl = extractedBookCoverUrl;
        if (extractedBookTitle) blockSettings.bookTitle = extractedBookTitle;
        if (extractedTargetListId) blockSettings.targetListId = extractedTargetListId;
        if (extractedWelcomeStepId) blockSettings.welcomeStepId = extractedWelcomeStepId;

        return (
          <React.Fragment key={idx}>
            {part.trim() && (
              <div dangerouslySetInnerHTML={{ __html: part }} />
            )}

            {/* Render 1 single live interactive FreeEbookOptinPixel component with custom article block title & cover */}
            {idx < parts.length - 1 && (
              <div className="my-8 not-prose">
                <FreeEbookOptinPixel
                  isEmbedded={true}
                  title={extractedTitle}
                  subtitle={extractedSubtitle}
                  settings={Object.keys(blockSettings).length > 0 ? blockSettings : undefined}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
