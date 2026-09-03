import { escapeHtml } from './escape-html.js';
import {
  BRAND,
  renderCallout,
  renderCta,
  renderEmailLayout,
  renderParagraph,
} from './layout.js';

export type InvitationTemplateInput = {
  recipientName: string;
  /** Omitted for platform administrators, who belong to no organisation. */
  organisationName?: string;
  setupUrl: string;
};

export const INVITATION_SUBJECT = `You are invited to ${BRAND.name}`;

export function renderInvitationTemplate(
  input: InvitationTemplateInput,
): string {
  const name = escapeHtml(input.recipientName);
  const invitedTo = input.organisationName
    ? `You have been invited to join <strong style="color: ${BRAND.heading};">${escapeHtml(input.organisationName)}</strong> on ${BRAND.name}, the directory of support services for refugees and displaced people in Armenia.`
    : `You have been invited to join ${BRAND.name} as a platform administrator.`;

  const bodyHtml = [
    renderParagraph(`Hello ${name},`),
    renderParagraph(invitedTo),
    renderParagraph(
      'Set a password to activate your account and get access to your dashboard.',
    ),
    renderCta('Set up your account', input.setupUrl),
    `<div style="height: 28px; line-height: 28px; font-size: 28px;">&nbsp;</div>`,
    renderCallout(
      'If you were not expecting this invitation, you can safely ignore this email. No account will be created until you set a password.',
      'info',
      undefined,
      { last: true },
    ),
  ].join('\n');

  return renderEmailLayout({
    preheader: input.organisationName
      ? `Activate your ${BRAND.name} account for ${input.organisationName}.`
      : `Activate your ${BRAND.name} administrator account.`,
    heading: `You are invited to ${BRAND.name}`,
    bodyHtml,
    footerNote: `You received this email because someone invited ${input.organisationName ? 'your organisation' : 'you'} to ${BRAND.name}.`,
  });
}
