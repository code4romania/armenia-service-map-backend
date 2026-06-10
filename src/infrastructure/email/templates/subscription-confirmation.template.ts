import { escapeHtml } from './escape-html.js';
import { renderEmailLayout } from './layout.js';

export type SubscriptionLocale = 'en' | 'hy';

export type SubscriptionConfirmationInput = {
  locale: SubscriptionLocale;
  regionName?: string;
  topicName?: string;
  unsubscribeUrl: string;
};

const strings: Record<SubscriptionLocale, {
  subject: string;
  heading: string;
  intro: string;
  filtersLabel: string;
  anyFilters: string;
  promise: string;
  unsubscribe: string;
  footerNote: string;
}> = {
  en: {
    subject: 'You are subscribed to new services',
    heading: 'You are subscribed',
    intro: 'Thanks for subscribing to Armenia Service Map.',
    filtersLabel: 'You will be notified about:',
    anyFilters: 'all new services',
    promise: 'We will email you whenever a new service matching these filters is added.',
    unsubscribe: 'Unsubscribe',
    footerNote: 'You received this email because you subscribed to new service alerts on RefugeeSupport.',
  },
  hy: {
    subject: 'Դուք բաժանորդագրված եք նոր ծառայություններին',
    heading: 'Դուք բաժանորդագրված եք',
    intro: 'Շնորհակալություն Armenia Service Map-ին բաժանորդագրվելու համար։',
    filtersLabel: 'Դուք կստանաք ծանուցումներ՝',
    anyFilters: 'բոլոր նոր ծառայությունների մասին',
    promise: 'Մենք ձեզ նամակ կուղարկենք, երբ ավելացվի այս զտիչներին համապատասխան նոր ծառայություն։',
    unsubscribe: 'Չեղարկել բաժանորդագրությունը',
    footerNote: 'Դուք ստացել եք այս նամակը, քանի որ բաժանորդագրվել եք RefugeeSupport-ի նոր ծառայությունների ծանուցումներին։',
  },
};

export function renderSubscriptionConfirmationTemplate(input: SubscriptionConfirmationInput): { subject: string; html: string } {
  const s = strings[input.locale] ?? strings.en;
  const filters = [input.regionName, input.topicName].filter(Boolean).map(escapeHtml).join(' · ') || s.anyFilters;
  const bodyHtml = `
    <p style="margin: 0 0 16px;">${s.intro}</p>
    <p style="margin: 0 0 16px;"><strong>${s.filtersLabel}</strong> ${filters}</p>
    <p style="margin: 0;">${s.promise}</p>
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
