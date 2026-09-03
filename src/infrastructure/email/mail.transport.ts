export interface MailMessage {
  from: string;
  to: string;
  subject: string;
  html: string;
}

/**
 * Internal seam used by {@link EmailService} so the concrete delivery mechanism
 * (SMTP for local dev / mailcatcher, Amazon SES on staging & production) can be
 * swapped without touching the email-building methods.
 */
export interface MailTransport {
  sendMail(message: MailMessage): Promise<unknown>;
}
