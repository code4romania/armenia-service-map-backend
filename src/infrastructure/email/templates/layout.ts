import { escapeHtml } from './escape-html.js';

export const BRAND = {
  name: 'Qezhet',
  domain: 'qezhet.am',
  siteUrl: 'https://www.qezhet.am',
  tagline: 'Support services for refugees and displaced people in Armenia.',
  blue: '#155dfc',
  blueDark: '#0f46c2',
  blueSoft: '#eff6ff',
  amber: '#e8922d',
  amberSoft: '#fef3e2',
  red: '#b42318',
  redSoft: '#fef3f2',
  green: '#067647',
  greenSoft: '#ecfdf3',
  card: '#ffffff',
  page: '#f3f4f6',
  heading: '#101828',
  text: '#374151',
  muted: '#6b7280',
  border: '#e5e7eb',
  inset: '#f9fafb',
};

export const FONT_STACK =
  "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export function renderButton(label: string, url: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 8px 0 0;">
      <tr>
        <td align="center" bgcolor="${BRAND.blue}" style="border-radius: 8px; background-color: ${BRAND.blue};">
          <a href="${url}" target="_blank" style="display: inline-block; padding: 13px 28px; font-family: ${FONT_STACK}; font-size: 15px; font-weight: 600; line-height: 20px; color: #ffffff; text-decoration: none; border-radius: 8px; border: 1px solid ${BRAND.blueDark};">${label}</a>
        </td>
      </tr>
    </table>
  `.trim();
}

/** Small text under a button for clients that strip button styling. */
export function renderLinkFallback(
  url: string,
  label = 'Button not working? Copy this link into your browser:',
): string {
  return `
    <p style="margin: 20px 0 0; font-family: ${FONT_STACK}; font-size: 12px; line-height: 1.6; color: ${BRAND.muted};">
      ${label}<br />
      <a href="${url}" target="_blank" style="color: ${BRAND.blue}; text-decoration: underline; word-break: break-all;">${url}</a>
    </p>
  `.trim();
}

/** Primary CTA plus its copy-link fallback. */
export function renderCta(
  label: string,
  url: string,
  fallbackLabel?: string,
): string {
  return `${renderButton(label, url)}\n${renderLinkFallback(url, fallbackLabel)}`;
}

export function renderParagraph(
  html: string,
  options: { last?: boolean } = {},
): string {
  return `<p style="margin: 0 0 ${options.last ? 0 : 16}px; font-family: ${FONT_STACK}; font-size: 15px; line-height: 1.65; color: ${BRAND.text};">${html}</p>`;
}

export type DetailRow = { label: string; value: string; multiline?: boolean };

/** Bordered key/value table. Values are escaped here; labels are trusted. */
export function renderDetailList(rows: DetailRow[]): string {
  const body = rows
    .map((row, index) => {
      const value = escapeHtml(row.value).replace(/\r?\n/g, '<br />');
      const borderTop =
        index === 0 ? '' : `border-top: 1px solid ${BRAND.border};`;
      if (row.multiline) {
        return `
          <tr class="detail-row">
            <td colspan="2" style="padding: 12px 16px; ${borderTop}">
              <div style="font-family: ${FONT_STACK}; font-size: 12px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: ${BRAND.muted}; margin-bottom: 6px;">${row.label}</div>
              <div style="font-family: ${FONT_STACK}; font-size: 14px; line-height: 1.6; color: ${BRAND.heading};">${value}</div>
            </td>
          </tr>`;
      }
      return `
          <tr class="detail-row">
            <td width="140" valign="top" style="padding: 12px 16px; ${borderTop} font-family: ${FONT_STACK}; font-size: 12px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: ${BRAND.muted};">${row.label}</td>
            <td valign="top" style="padding: 12px 16px; ${borderTop} font-family: ${FONT_STACK}; font-size: 14px; line-height: 1.6; color: ${BRAND.heading};">${value}</td>
          </tr>`;
    })
    .join('');
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 24px; border: 1px solid ${BRAND.border}; border-radius: 10px; background-color: ${BRAND.inset}; border-collapse: separate;">
      ${body}
    </table>
  `.trim();
}

export type CalloutTone = 'info' | 'warning' | 'danger' | 'success';

const CALLOUT_COLORS: Record<CalloutTone, { bg: string; accent: string }> = {
  info: { bg: BRAND.blueSoft, accent: BRAND.blue },
  warning: { bg: BRAND.amberSoft, accent: BRAND.amber },
  danger: { bg: BRAND.redSoft, accent: BRAND.red },
  success: { bg: BRAND.greenSoft, accent: BRAND.green },
};

/** Highlighted note with a coloured left edge. `html` is trusted (escape before calling). */
export function renderCallout(
  html: string,
  tone: CalloutTone = 'info',
  title?: string,
  options: { last?: boolean } = {},
): string {
  const colors = CALLOUT_COLORS[tone];
  const heading = title
    ? `<div style="font-family: ${FONT_STACK}; font-size: 13px; font-weight: 600; color: ${BRAND.heading}; margin-bottom: 4px;">${title}</div>`
    : '';
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 ${options.last ? 0 : 24}px;">
      <tr>
        <td style="padding: 14px 16px; background-color: ${colors.bg}; border-left: 4px solid ${colors.accent}; border-radius: 8px;">
          ${heading}
          <div style="font-family: ${FONT_STACK}; font-size: 14px; line-height: 1.6; color: ${BRAND.text};">${html}</div>
        </td>
      </tr>
    </table>
  `.trim();
}

export type EmailLayoutInput = {
  /** Hidden inbox preview text. Plain text, escaped here. */
  preheader: string;
  heading: string;
  /** Trusted HTML built with the helpers above. */
  bodyHtml: string;
  footerNote: string;
  /** Optional secondary footer link, e.g. unsubscribe. */
  footerLink?: { label: string; url: string };
  /** Language of the message body. Defaults to "en". */
  lang?: string;
};

export function renderEmailLayout(input: EmailLayoutInput): string {
  const preheader = escapeHtml(input.preheader);
  const footerLink = input.footerLink
    ? ` &nbsp;·&nbsp; <a href="${input.footerLink.url}" target="_blank" style="color: ${BRAND.muted}; text-decoration: underline;">${input.footerLink.label}</a>`
    : '';

  return `<!DOCTYPE html>
<html lang="${input.lang ?? 'en'}" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>${escapeHtml(input.heading)}</title>
  <style>
    body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table { border-collapse: collapse; mso-table-lspace: 0; mso-table-rspace: 0; }
    img { border: 0; line-height: 100%; outline: none; text-decoration: none; }
    a { color: ${BRAND.blue}; }
    .preheader { display: none !important; visibility: hidden; opacity: 0; color: transparent; height: 0; width: 0; max-height: 0; max-width: 0; overflow: hidden; mso-hide: all; font-size: 1px; line-height: 1px; }
    @media only screen and (max-width: 620px) {
      .container { width: 100% !important; max-width: 100% !important; border-radius: 0 !important; }
      .content { padding: 28px 20px !important; }
      .header { padding: 20px !important; }
      .footer { padding: 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${BRAND.page}; font-family: ${FONT_STACK};">
  <div class="preheader">${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${BRAND.page};">
    <tr>
      <td align="center" style="padding: 32px 12px;">
        <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="width: 600px; max-width: 600px; background-color: ${BRAND.card}; border-radius: 14px; border: 1px solid ${BRAND.border}; border-collapse: separate; overflow: hidden;">
          <tr>
            <td class="header" style="padding: 24px 36px 20px; border-bottom: 1px solid ${BRAND.border};">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td valign="middle" style="padding-right: 10px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" valign="middle" width="32" height="32" bgcolor="${BRAND.blue}" style="width: 32px; height: 32px; border-radius: 9px; background-color: ${BRAND.blue}; font-family: ${FONT_STACK}; font-size: 17px; font-weight: 700; color: #ffffff; line-height: 32px;">Q</td>
                      </tr>
                    </table>
                  </td>
                  <td valign="middle" style="font-family: ${FONT_STACK}; font-size: 19px; font-weight: 700; letter-spacing: -0.01em; color: ${BRAND.heading};">
                    ${BRAND.name}<span style="color: ${BRAND.muted}; font-weight: 500;">.am</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="height: 4px; line-height: 4px; font-size: 4px; background-color: ${BRAND.blue};">&nbsp;</td>
          </tr>
          <tr>
            <td class="content" style="padding: 36px 36px 32px;">
              <h1 style="margin: 0 0 20px; font-family: ${FONT_STACK}; font-size: 24px; line-height: 1.3; font-weight: 700; letter-spacing: -0.01em; color: ${BRAND.heading};">${input.heading}</h1>
              ${input.bodyHtml}
            </td>
          </tr>
          <tr>
            <td class="footer" style="padding: 20px 36px 24px; background-color: ${BRAND.inset}; border-top: 1px solid ${BRAND.border};">
              <p style="margin: 0 0 6px; font-family: ${FONT_STACK}; font-size: 12px; line-height: 1.6; color: ${BRAND.muted};">${input.footerNote}</p>
              <p style="margin: 0; font-family: ${FONT_STACK}; font-size: 12px; line-height: 1.6; color: ${BRAND.muted};">
                <a href="${BRAND.siteUrl}" target="_blank" style="color: ${BRAND.muted}; text-decoration: underline;">${BRAND.domain}</a>${footerLink}
              </p>
            </td>
          </tr>
        </table>
        <p style="margin: 16px 0 0; font-family: ${FONT_STACK}; font-size: 11px; line-height: 1.5; color: #9ca3af;">${BRAND.tagline}</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
