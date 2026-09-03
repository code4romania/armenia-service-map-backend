import {
  BRAND,
  renderCta,
  renderDetailList,
  renderEmailLayout,
  renderParagraph,
  DetailRow,
} from './layout.js';

export type NewNeedReportAdminInput = {
  needTitle: string;
  needDescription: string;
  reporterName: string;
  regionName?: string;
  adminUrl: string;
};

export function renderNewNeedReportAdminTemplate(
  input: NewNeedReportAdminInput,
): {
  subject: string;
  html: string;
} {
  const subject = 'New need report submitted';
  const rows: DetailRow[] = [
    { label: 'Title', value: input.needTitle },
    { label: 'Reported by', value: input.reporterName },
  ];
  if (input.regionName) rows.push({ label: 'Region', value: input.regionName });
  rows.push({
    label: 'Description',
    value: input.needDescription,
    multiline: true,
  });

  const bodyHtml = [
    renderParagraph(
      'A new need report has been submitted and is waiting for review.',
    ),
    renderDetailList(rows),
    renderCta('Review need report', input.adminUrl, 'Or open it directly:'),
  ].join('\n');

  const html = renderEmailLayout({
    preheader: `${input.needTitle} · reported by ${input.reporterName}`,
    heading: subject,
    bodyHtml,
    footerNote: `You received this email because you are a ${BRAND.name} administrator.`,
    footerLink: { label: 'Open admin dashboard', url: input.adminUrl },
  });
  return { subject, html };
}
