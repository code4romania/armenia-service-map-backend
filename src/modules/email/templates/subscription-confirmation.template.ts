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
}> = {
  en: {
    subject: 'You are subscribed to new services',
    heading: 'You are subscribed',
    intro: 'Thanks for subscribing to Armenia Service Map.',
    filtersLabel: 'You will be notified about:',
    anyFilters: 'all new services',
    promise: 'We will email you whenever a new service matching these filters is added.',
    unsubscribe: 'Unsubscribe',
  },
  hy: {
    subject: 'Դուք բաժանորդագրված եք նոր ծառայություններին',
    heading: 'Դուք բաժանորդագրված եք',
    intro: 'Շնորհակալություն Armenia Service Map-ին բաժանորդագրվելու համար։',
    filtersLabel: 'Դուք կստանաք ծանուցումներ՝',
    anyFilters: 'բոլոր նոր ծառայությունների մասին',
    promise: 'Մենք ձեզ նամակ կուղարկենք, երբ ավելացվի այս զտիչներին համապատասխան նոր ծառայություն։',
    unsubscribe: 'Չեղարկել բաժանորդագրությունը',
  },
};

export function renderSubscriptionConfirmationTemplate(input: SubscriptionConfirmationInput): { subject: string; html: string } {
  const s = strings[input.locale] ?? strings.en;
  const filters = [input.regionName, input.topicName].filter(Boolean).join(' · ') || s.anyFilters;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2>${s.heading}</h2>
      <p>${s.intro}</p>
      <p><strong>${s.filtersLabel}</strong> ${filters}</p>
      <p>${s.promise}</p>
      <p><a href="${input.unsubscribeUrl}">${s.unsubscribe}</a></p>
    </div>
  `.trim();
  return { subject: s.subject, html };
}
