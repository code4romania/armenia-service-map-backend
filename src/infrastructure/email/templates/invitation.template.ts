export type InvitationTemplateInput = {
  recipientName: string;
  organisationName: string;
  setupUrl: string;
};

export function renderInvitationTemplate(input: InvitationTemplateInput): string {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2>You are invited to Armenia Service Map</h2>
      <p>Hello ${input.recipientName},</p>
      <p>You were invited to join <strong>${input.organisationName}</strong>.</p>
      <p>Please set your password and activate your account:</p>
      <p><a href="${input.setupUrl}">${input.setupUrl}</a></p>
      <p>If you were not expecting this invitation, please ignore this email.</p>
    </div>
  `.trim();
}
