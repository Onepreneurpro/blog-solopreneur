export interface InjectTrackingOptions {
  html: string;
  baseUrl: string;
  queueId?: string;
  email?: string;
  stepId?: string;
}

export function injectTrackingToEmailHtml(options: InjectTrackingOptions): string {
  const { html, baseUrl, queueId = '', email = '', stepId = '' } = options;

  if (!html) return html;

  const cleanBaseUrl = baseUrl.replace(/\/+$/, '');

  // 1. REWRITE ALL <a href="..."> LINKS FOR CLICK TRACKING
  const linkRegex = /<a\s+([^>]*?)href=["']([^"']+)["']([^>]*?)>/gi;

  const htmlWithTrackedLinks = html.replace(
    linkRegex,
    (match, beforeHref, originalUrl, afterHref) => {
      // Skip tracking for unsubscribe links, mailto, tel, javascript, or anchors
      if (
        !originalUrl ||
        originalUrl.startsWith('#') ||
        originalUrl.startsWith('mailto:') ||
        originalUrl.startsWith('tel:') ||
        originalUrl.startsWith('javascript:') ||
        originalUrl.includes('/desabonnement')
      ) {
        return match;
      }

      // Build absolute target URL if relative
      let absoluteTargetUrl = originalUrl;
      if (originalUrl.startsWith('/')) {
        absoluteTargetUrl = `${cleanBaseUrl}${originalUrl}`;
      }

      // Build click tracking URL
      const trackingClickUrl = `${cleanBaseUrl}/api/track/click?url=${encodeURIComponent(
        absoluteTargetUrl
      )}${queueId ? `&queueId=${encodeURIComponent(queueId)}` : ''}${
        email ? `&email=${encodeURIComponent(email)}` : ''
      }${stepId ? `&stepId=${encodeURIComponent(stepId)}` : ''}`;

      return `<a ${beforeHref}href="${trackingClickUrl}"${afterHref}>`;
    }
  );

  // 2. APPEND OPEN TRACKING PIXEL (1x1 TRANSPARENT GIF)
  const openPixelUrl = `${cleanBaseUrl}/api/track/open?${
    queueId ? `queueId=${encodeURIComponent(queueId)}&` : ''
  }${email ? `email=${encodeURIComponent(email)}&` : ''}${
    stepId ? `stepId=${encodeURIComponent(stepId)}&` : ''
  }t=${Date.now()}`;

  const openPixelTag = `
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;table-layout:fixed;">
      <tr>
        <td align="center" style="font-size:1px;line-height:1px;max-height:1px;overflow:hidden;opacity:0.01;">
          <img src="${openPixelUrl}" width="1" height="1" border="0" alt="" style="display:block;width:1px;height:1px;border:0;outline:none;" />
        </td>
      </tr>
    </table>
  `;

  // Insert before closing div/body or at the end
  if (htmlWithTrackedLinks.includes('</div>')) {
    const lastDivIndex = htmlWithTrackedLinks.lastIndexOf('</div>');
    return (
      htmlWithTrackedLinks.slice(0, lastDivIndex) +
      openPixelTag +
      htmlWithTrackedLinks.slice(lastDivIndex)
    );
  }

  return htmlWithTrackedLinks + openPixelTag;
}
