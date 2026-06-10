import { escapeHtml } from './escape-html.js';
import type { SubscriptionLocale } from './subscription-confirmation.template.js';
import { renderEmailLayout, renderButton } from './layout.js';

export type NewServiceNotificationInput = {
  locale: SubscriptionLocale;
  serviceTitle: string;
  serviceShortDescription: string;
  serviceUrl: string;
  unsubscribeUrl: string;
};

const strings: Record<SubscriptionLocale, { subject: string; heading: string; cta: string; unsubscribe: string; footerNote: string }> = {
  en: {
    subject: 'A new service matching your interests was added',
    heading: 'A new service was added',
    cta: 'View service',
    unsubscribe: 'Unsubscribe',
    footerNote: 'You received this email because you subscribed to new service alerts on RefugeeSupport.',
  },
  hy: {
    subject: 'Ավելացվել է ձեր հետաքրքրություններին համապատասխան նոր ծառայություն',
    heading: 'Ավելացվել է նոր ծառայություն',
    cta: 'Դիտել ծառայությունը',
    unsubscribe: 'Չեղարկել բաժանորդագրությունը',
    footerNote: 'Դուք ստացել եք այս նամակը, քանի որ բաժանորդագրվել եք RefugeeSupport-ի նոր ծառայությունների ծանուցումներին։',
  },
};

export function renderNewServiceNotificationTemplate(input: NewServiceNotificationInput): { subject: string; html: string } {
  const s = strings[input.locale] ?? strings.en;
  const title = escapeHtml(input.serviceTitle);
  const description = escapeHtml(input.serviceShortDescription.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim());
  const bodyHtml = `
    <h2 style="margin: 0 0 8px; font-family: Arial, Helvetica, sans-serif; font-size: 18px; line-height: 1.3; color: #101828;">${title}</h2>
    <p style="margin: 0 0 24px;">${description}</p>
    ${renderButton(s.cta, input.serviceUrl)}
  `.trim();
  const html = renderEmailLayout({
    heading: s.heading,
    bodyHtml,
    footerNote: s.footerNote,
    unsubscribeUrl: input.unsubscribeUrl,
    unsubscribeLabel: s.unsubscribe,
  });
  return { subject: s.subject, html };
}
