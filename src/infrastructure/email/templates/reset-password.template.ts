import { escapeHtml } from './escape-html.js';
import {
  BRAND,
  renderCallout,
  renderCta,
  renderEmailLayout,
  renderParagraph,
} from './layout.js';

export type ResetPasswordTemplateInput = {
  recipientName: string;
  resetUrl: string;
};

export const RESET_PASSWORD_SUBJECT = 'Reset your password';

export function renderResetPasswordTemplate(
  input: ResetPasswordTemplateInput,
): string {
  const name = escapeHtml(input.recipientName);

  const bodyHtml = [
    renderParagraph(`Hello ${name},`),
    renderParagraph(
      `We received a request to reset the password for your ${BRAND.name} account. Choose a new password using the button below.`,
    ),
    renderCta('Reset password', input.resetUrl),
    `<div style="height: 28px; line-height: 28px; font-size: 28px;">&nbsp;</div>`,
    renderCallout(
      'If you did not request a password reset, you can safely ignore this email. Your current password will keep working.',
      'warning',
      undefined,
      { last: true },
    ),
  ].join('\n');

  return renderEmailLayout({
    preheader: `Choose a new password for your ${BRAND.name} account.`,
    heading: 'Reset your password',
    bodyHtml,
    footerNote: `You received this email because a password reset was requested for your ${BRAND.name} account.`,
  });
}
