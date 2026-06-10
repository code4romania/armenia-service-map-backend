export interface MailMessage {
  from: string;
  to: string;
  subject: string;
  html: string;
}

/**
 * Internal seam used by {@link EmailService} so the concrete delivery mechanism
 * (SMTP for local dev / mailcatcher, Postmark in production) can be swapped
 * without touching the email-building methods.
 */
export interface MailTransport {
  sendMail(message: MailMessage): Promise<unknown>;
}

/** Minimal slice of the Postmark `ServerClient` we depend on. */
export interface PostmarkClient {
  sendEmail(message: {
    From: string;
    To: string;
    Subject: string;
    HtmlBody: string;
    MessageStream: string;
  }): Promise<unknown>;
}

export class PostmarkTransport implements MailTransport {
  constructor(
    private readonly client: PostmarkClient,
    private readonly messageStream: string,
  ) {}

  async sendMail(message: MailMessage): Promise<unknown> {
    return this.client.sendEmail({
      From: message.from,
      To: message.to,
      Subject: message.subject,
      HtmlBody: message.html,
      MessageStream: this.messageStream,
    });
  }
}
