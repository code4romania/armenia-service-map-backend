const BRAND = {
  blue: '#155dfc',
  card: '#ffffff',
  page: '#f3f4f6',
  heading: '#101828',
  text: '#374151',
  muted: '#6b7280',
  border: '#e5e7eb',
};

export function renderButton(label: string, url: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 4px 0;">
      <tr>
        <td align="center" bgcolor="${BRAND.blue}" style="border-radius: 8px;">
          <a href="${url}" target="_blank" style="display: inline-block; padding: 12px 28px; font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: bold; color: #ffffff; text-decoration: none; border-radius: 8px;">${label}</a>
        </td>
      </tr>
    </table>
  `.trim();
}

export function renderEmailLayout(input: {
  heading: string;
  bodyHtml: string;
  footerNote: string;
  unsubscribeUrl: string;
  unsubscribeLabel: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
</head>
<body style="margin: 0; padding: 0; background-color: ${BRAND.page};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${BRAND.page};">
    <tr>
      <td align="center" style="padding: 24px 12px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width: 600px; max-width: 600px; background-color: ${BRAND.card}; border-radius: 12px; overflow: hidden; border: 1px solid ${BRAND.border};">
          <tr>
            <td style="background-color: ${BRAND.blue}; padding: 20px 32px;">
              <span style="font-family: Arial, Helvetica, sans-serif; font-size: 20px; font-weight: bold; color: #ffffff;">RefugeeSupport</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <h1 style="margin: 0 0 16px; font-family: Arial, Helvetica, sans-serif; font-size: 22px; line-height: 1.3; color: ${BRAND.heading};">${input.heading}</h1>
              <div style="font-family: Arial, Helvetica, sans-serif; font-size: 15px; line-height: 1.6; color: ${BRAND.text};">${input.bodyHtml}</div>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 32px 28px; border-top: 1px solid ${BRAND.border};">
              <p style="margin: 0 0 8px; font-family: Arial, Helvetica, sans-serif; font-size: 12px; line-height: 1.5; color: ${BRAND.muted};">${input.footerNote}</p>
              <p style="margin: 0; font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: ${BRAND.muted};">
                <a href="${input.unsubscribeUrl}" target="_blank" style="color: ${BRAND.blue}; text-decoration: underline;">${input.unsubscribeLabel}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
