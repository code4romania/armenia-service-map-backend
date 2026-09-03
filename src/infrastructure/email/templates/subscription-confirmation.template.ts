import { escapeHtml } from './escape-html.js';
import {
  BRAND,
  FONT_STACK,
  renderEmailLayout,
  renderParagraph,
} from './layout.js';

export type SubscriptionLocale = 'en' | 'hy';

export type SubscriptionConfirmationInput = {
  locale: SubscriptionLocale;
  regionName?: string;
  topicName?: string;
  unsubscribeUrl: string;
};

const strings: Record<
  SubscriptionLocale,
  {
    subject: string;
    heading: string;
    intro: string;
    filtersLabel: string;
    regionLabel: string;
    topicLabel: string;
    anyFilters: string;
    promise: string;
    unsubscribe: string;
    footerNote: string;
  }
> = {
  en: {
    subject: 'You are subscribed to new services',
    heading: 'You are subscribed',
    intro:
      'Thanks for subscribing to Qezhet. We will let you know as soon as a new service is published that matches your interests.',
    filtersLabel: 'You will be notified about',
    regionLabel: 'Region',
    topicLabel: 'Topic',
    anyFilters: 'All new services',
    promise:
      'You can unsubscribe at any time using the link at the bottom of any of our emails.',
    unsubscribe: 'Unsubscribe',
    footerNote:
      'You received this email because you subscribed to new service alerts on Qezhet.',
  },
  hy: {
    subject: 'Դուք բաժանորդագրված եք նոր ծառայություններին',
    heading: 'Դուք բաժանորդագրված եք',
    intro:
      'Շնորհակալություն Qezhet-ին բաժանորդագրվելու համար։ Մենք ձեզ կտեղեկացնենք, հենց որ հրապարակվի ձեր հետաքրքրություններին համապատասխան նոր ծառայություն։',
    filtersLabel: 'Դուք կստանաք ծանուցումներ',
    regionLabel: 'Մարզ',
    topicLabel: 'Թեմա',
    anyFilters: 'Բոլոր նոր ծառայությունների մասին',
    promise:
      'Դուք ցանկացած պահի կարող եք չեղարկել բաժանորդագրությունը՝ օգտվելով մեր ցանկացած նամակի ներքևի հղումից։',
    unsubscribe: 'Չեղարկել բաժանորդագրությունը',
    footerNote:
      'Դուք ստացել եք այս նամակը, քանի որ բաժանորդագրվել եք Qezhet-ի նոր ծառայությունների ծանուցումներին։',
  },
};

function renderFilterChips(
  chips: { label: string; value: string }[],
  fallback: string,
): string {
  const items = chips.length > 0 ? chips : [{ label: '', value: fallback }];
  const cells = items
    .map(
      (chip) => `
        <td style="padding: 0 8px 8px 0;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="padding: 8px 14px; border-radius: 999px; background-color: ${BRAND.blueSoft}; border: 1px solid #bfdbfe; font-family: ${FONT_STACK}; font-size: 14px; line-height: 1.4; color: ${BRAND.blueDark}; white-space: nowrap;">
                ${chip.label ? `<span style="color: ${BRAND.muted}; font-size: 12px;">${chip.label} · </span>` : ''}<strong>${escapeHtml(chip.value)}</strong>
              </td>
            </tr>
          </table>
        </td>`,
    )
    .join('');
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 16px;">
      <tr>${cells}</tr>
    </table>
  `.trim();
}

export function renderSubscriptionConfirmationTemplate(
  input: SubscriptionConfirmationInput,
): { subject: string; html: string } {
  const locale: SubscriptionLocale =
    input.locale in strings ? input.locale : 'en';
  const s = strings[locale];
  const chips: { label: string; value: string }[] = [];
  if (input.regionName)
    chips.push({ label: s.regionLabel, value: input.regionName });
  if (input.topicName)
    chips.push({ label: s.topicLabel, value: input.topicName });

  const bodyHtml = [
    renderParagraph(s.intro),
    `<p style="margin: 0 0 10px; font-family: ${FONT_STACK}; font-size: 12px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: ${BRAND.muted};">${s.filtersLabel}</p>`,
    renderFilterChips(chips, s.anyFilters),
    renderParagraph(s.promise, { last: true }),
  ].join('\n');

  const html = renderEmailLayout({
    lang: locale,
    preheader:
      chips.length > 0 ? chips.map((c) => c.value).join(' · ') : s.anyFilters,
    heading: s.heading,
    bodyHtml,
    footerNote: s.footerNote,
    footerLink: { label: s.unsubscribe, url: input.unsubscribeUrl },
  });
  return { subject: s.subject, html };
}
