import { escapeHtml } from './escape-html.js';
import { renderEmailLayout, renderButton } from './layout.js';

export type NewJoinNetworkAdminInput = {
  organisationName: string;
  contactName: string;
  contactEmail: string;
  servicesDescription: string;
  regionNames?: string[];
  adminUrl: string;
};

export function renderNewJoinNetworkAdminTemplate(input: NewJoinNetworkAdminInput): {
  subject: string;
  html: string;
} {
  const subject = 'New join-network request submitted';
  const regionNames = input.regionNames ?? [];
  const region = regionNames.length > 0
    ? `<p style="margin: 0 0 8px;"><strong>Regions:</strong> ${escapeHtml(regionNames.join(', '))}</p>`
    : '';
  const bodyHtml = `
    <p style="margin: 0 0 16px;">A new organisation has requested to join the network and is awaiting review.</p>
    <p style="margin: 0 0 8px;"><strong>Organisation:</strong> ${escapeHtml(input.organisationName)}</p>
    <p style="margin: 0 0 8px;"><strong>Contact:</strong> ${escapeHtml(input.contactName)} (${escapeHtml(input.contactEmail)})</p>
    ${region}
    <p style="margin: 0 0 16px;"><strong>Services:</strong><br />${escapeHtml(input.servicesDescription)}</p>
    ${renderButton('Review request', input.adminUrl)}
  `.trim();
  const html = renderEmailLayout({
    heading: 'New join-network request submitted',
    bodyHtml,
    footerNote: 'You received this email because you are a RefugeeSupport administrator.',
    unsubscribeUrl: input.adminUrl,
    unsubscribeLabel: 'Open admin dashboard',
  });
  return { subject, html };
}
