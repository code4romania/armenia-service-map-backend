import type { SubscriptionLocale } from './subscription-confirmation.template.js';
import { escapeHtml } from './escape-html.js';

export type NewServiceNotificationInput = {
  locale: SubscriptionLocale;
  serviceTitle: string;
  serviceShortDescription: string;
  serviceUrl: string;
  unsubscribeUrl: string;
};

const strings: Record<SubscriptionLocale, { subject: string; heading: string; cta: string; unsubscribe: string }> = {
  en: {
    subject: 'A new service matching your interests was added',
    heading: 'A new service was added',
    cta: 'View service',
    unsubscribe: 'Unsubscribe',
  },
  hy: {
    subject: 'Ավելացվել է ձեր հետաքրքրություններին համապատասխան նոր ծառայություն',
    heading: 'Ավելացվել է նոր ծառայություն',
    cta: 'Դիտել ծառայությունը',
    unsubscribe: 'Չեղարկել բաժանորդագրությունը',
  },
};

export function renderNewServiceNotificationTemplate(input: NewServiceNotificationInput): { subject: string; html: string } {
  const s = strings[input.locale] ?? strings.en;
  const description = escapeHtml(input.serviceShortDescription.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim());
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2>${s.heading}</h2>
      <h3>${escapeHtml(input.serviceTitle)}</h3>
      <p>${description}</p>
      <p><a href="${input.serviceUrl}">${s.cta}</a></p>
      <hr />
      <p style="font-size:12px;color:#6b7280;"><a href="${input.unsubscribeUrl}">${s.unsubscribe}</a></p>
    </div>
  `.trim();
  return { subject: s.subject, html };
}
