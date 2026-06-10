export type ResetPasswordTemplateInput = {
  recipientName: string;
  resetUrl: string;
};

export function renderResetPasswordTemplate(input: ResetPasswordTemplateInput): string {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2>Password Reset</h2>
      <p>Hello ${input.recipientName},</p>
      <p>You can reset your password using the link below:</p>
      <p><a href="${input.resetUrl}">${input.resetUrl}</a></p>
      <p>If you did not request this change, please ignore this email.</p>
    </div>
  `.trim();
}
