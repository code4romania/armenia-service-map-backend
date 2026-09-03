import { escapeHtml } from './escape-html.js';
import type { SubscriptionLocale } from './subscription-confirmation.template.js';
import {
  BRAND,
  FONT_STACK,
  renderCta,
  renderEmailLayout,
  renderParagraph,
} from './layout.js';

export type NewServiceNotificationInput = {
  locale: SubscriptionLocale;
  serviceTitle: string;
  serviceShortDescription: string;
  serviceUrl: string;
  unsubscribeUrl: string;
};

const strings: Record<
  SubscriptionLocale,
  {
    subject: string;
    heading: string;
    intro: string;
    cta: string;
    fallback: string;
    unsubscribe: string;
    footerNote: string;
  }
> = {
  en: {
    subject: 'A new service matching your interests was added',
    heading: 'A new service was added',
    intro: 'A service matching your subscription was just published on Qezhet.',
    cta: 'View service',
    fallback: 'Button not working? Copy this link into your browser:',
    unsubscribe: 'Unsubscribe',
    footerNote:
      'You received this email because you subscribed to new service alerts on Qezhet.',
  },
  hy: {
    subject:
      'Ավելացվել է ձեր հետաքրքրություններին համապատասխան նոր ծառայություն',
    heading: 'Ավելացվել է նոր ծառայություն',
    intro:
      'Qezhet-ում հենց նոր հրապարակվել է ձեր բաժանորդագրությանը համապատասխան ծառայություն։',
    cta: 'Դիտել ծառայությունը',
    fallback: 'Կոճակը չի աշխատում։ Պատճենեք այս հղումը ձեր դիտարկիչում՝',
    unsubscribe: 'Չեղարկել բաժանորդագրությունը',
    footerNote:
      'Դուք ստացել եք այս նամակը, քանի որ բաժանորդագրվել եք Qezhet-ի նոր ծառայությունների ծանուցումներին։',
  },
};

export function renderNewServiceNotificationTemplate(
  input: NewServiceNotificationInput,
): { subject: string; html: string } {
  const locale: SubscriptionLocale =
    input.locale in strings ? input.locale : 'en';
  const s = strings[locale];
  const title = escapeHtml(input.serviceTitle);
  const description = escapeHtml(
    input.serviceShortDescription
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
  );

  const serviceCard = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 24px; border: 1px solid ${BRAND.border}; border-radius: 10px; background-color: ${BRAND.inset}; border-collapse: separate;">
      <tr>
        <td style="padding: 18px 20px;">
          <div style="font-family: ${FONT_STACK}; font-size: 18px; line-height: 1.35; font-weight: 700; color: ${BRAND.heading}; margin-bottom: 6px;">${title}</div>
          ${description ? `<div style="font-family: ${FONT_STACK}; font-size: 14px; line-height: 1.6; color: ${BRAND.text};">${description}</div>` : ''}
        </td>
      </tr>
    </table>
  `.trim();

  const bodyHtml = [
    renderParagraph(s.intro),
    serviceCard,
    renderCta(s.cta, input.serviceUrl, s.fallback),
  ].join('\n');

  const html = renderEmailLayout({
    lang: locale,
    preheader: input.serviceTitle,
    heading: s.heading,
    bodyHtml,
    footerNote: s.footerNote,
    footerLink: { label: s.unsubscribe, url: input.unsubscribeUrl },
  });
  return { subject: s.subject, html };
}
