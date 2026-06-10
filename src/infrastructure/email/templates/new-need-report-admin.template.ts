import { escapeHtml } from './escape-html.js';
import { renderEmailLayout, renderButton } from './layout.js';

export type NewNeedReportAdminInput = {
  needTitle: string;
  needDescription: string;
  reporterName: string;
  regionName?: string;
  adminUrl: string;
};

export function renderNewNeedReportAdminTemplate(input: NewNeedReportAdminInput): {
  subject: string;
  html: string;
} {
  const subject = 'New need report submitted';
  const region = input.regionName
    ? `<p style="margin: 0 0 8px;"><strong>Region:</strong> ${escapeHtml(input.regionName)}</p>`
    : '';
  const bodyHtml = `
    <p style="margin: 0 0 16px;">A new need report has been submitted and is awaiting review.</p>
    <p style="margin: 0 0 8px;"><strong>Title:</strong> ${escapeHtml(input.needTitle)}</p>
    <p style="margin: 0 0 8px;"><strong>Reported by:</strong> ${escapeHtml(input.reporterName)}</p>
    ${region}
    <p style="margin: 0 0 16px;"><strong>Description:</strong><br />${escapeHtml(input.needDescription)}</p>
    ${renderButton('Review need report', input.adminUrl)}
  `.trim();
  const html = renderEmailLayout({
    heading: 'New need report submitted',
    bodyHtml,
    footerNote: 'You received this email because you are a RefugeeSupport administrator.',
    unsubscribeUrl: input.adminUrl,
    unsubscribeLabel: 'Open admin dashboard',
  });
  return { subject, html };
}
