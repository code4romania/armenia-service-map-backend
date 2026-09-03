import { escapeHtml } from './escape-html.js';
import {
  BRAND,
  renderCallout,
  renderCta,
  renderEmailLayout,
  renderParagraph,
} from './layout.js';

export type OrganisationReviewOutcomeInput = {
  recipientName: string;
  organisationName: string;
  outcome: 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  /** Login / dashboard link shown on approval. */
  dashboardUrl?: string;
};

export function renderOrganisationReviewOutcomeTemplate(
  input: OrganisationReviewOutcomeInput,
): {
  subject: string;
  html: string;
} {
  const isApproved = input.outcome === 'APPROVED';
  const name = escapeHtml(input.recipientName);
  const organisation = `<strong style="color: ${BRAND.heading};">${escapeHtml(input.organisationName)}</strong>`;

  if (isApproved) {
    const subject = 'Your organisation has been approved';
    const bodyHtml = [
      renderParagraph(`Hello ${name},`),
      renderParagraph(
        `Good news: ${organisation} has been approved to join ${BRAND.name}. Your organisation is now part of the network.`,
      ),
      renderCallout(
        'You can now sign in, complete your organisation profile and publish the services you offer so people in need can find them.',
        'success',
      ),
      input.dashboardUrl
        ? renderCta('Open your dashboard', input.dashboardUrl)
        : '',
    ].join('\n');
    return {
      subject,
      html: renderEmailLayout({
        preheader: `${input.organisationName} is now part of the ${BRAND.name} network.`,
        heading: subject,
        bodyHtml,
        footerNote: `You received this email because you submitted a request for ${input.organisationName} to join ${BRAND.name}.`,
      }),
    };
  }

  const subject = 'Your organisation application was not approved';
  const reasonBlock = input.rejectionReason
    ? renderCallout(
        escapeHtml(input.rejectionReason).replace(/\r?\n/g, '<br />'),
        'danger',
        'Reason provided by the reviewer',
      )
    : '';
  const bodyHtml = [
    renderParagraph(`Hello ${name},`),
    renderParagraph(
      `Thank you for your interest in ${BRAND.name}. After review, the request for ${organisation} to join the network was not approved.`,
    ),
    reasonBlock,
    renderParagraph(
      `If you believe this was a mistake or you can provide additional information, you are welcome to submit a new request at <a href="${BRAND.siteUrl}/join-the-network" style="color: ${BRAND.blue};">${BRAND.domain}/join-the-network</a>.`,
      { last: true },
    ),
  ].join('\n');
  return {
    subject,
    html: renderEmailLayout({
      preheader: `The request for ${input.organisationName} was reviewed.`,
      heading: subject,
      bodyHtml,
      footerNote: `You received this email because you submitted a request for ${input.organisationName} to join ${BRAND.name}.`,
    }),
  };
}
