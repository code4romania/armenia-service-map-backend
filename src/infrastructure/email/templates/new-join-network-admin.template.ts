import {
  BRAND,
  renderCta,
  renderDetailList,
  renderEmailLayout,
  renderParagraph,
  DetailRow,
} from './layout.js';

export type NewJoinNetworkAdminInput = {
  organisationName: string;
  contactName: string;
  contactEmail: string;
  servicesDescription: string;
  regionNames?: string[];
  adminUrl: string;
};

export function renderNewJoinNetworkAdminTemplate(
  input: NewJoinNetworkAdminInput,
): {
  subject: string;
  html: string;
} {
  const subject = 'New join-network request submitted';
  const regionNames = input.regionNames ?? [];
  const rows: DetailRow[] = [
    { label: 'Organisation', value: input.organisationName },
    { label: 'Contact', value: `${input.contactName} · ${input.contactEmail}` },
  ];
  if (regionNames.length > 0)
    rows.push({ label: 'Regions', value: regionNames.join(', ') });
  rows.push({
    label: 'Services',
    value: input.servicesDescription,
    multiline: true,
  });

  const bodyHtml = [
    renderParagraph(
      'A new organisation has asked to join the network and is waiting for review.',
    ),
    renderDetailList(rows),
    renderCta('Review request', input.adminUrl, 'Or open it directly:'),
  ].join('\n');

  const html = renderEmailLayout({
    preheader: `${input.organisationName} · ${input.contactName}`,
    heading: subject,
    bodyHtml,
    footerNote: `You received this email because you are a ${BRAND.name} administrator.`,
    footerLink: { label: 'Open admin dashboard', url: input.adminUrl },
  });
  return { subject, html };
}
