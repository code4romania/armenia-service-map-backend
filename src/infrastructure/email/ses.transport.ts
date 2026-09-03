import nodemailer from 'nodemailer';
import { MailMessage, MailTransport } from './mail.transport.js';

/** Minimal slice of the AWS SESv2 client that nodemailer's SES transport drives. */
export interface SesClientLike {
  send(command: unknown): Promise<unknown>;
  config?: { region?: () => Promise<string> };
}

/** Constructor shape of `SendEmailCommand` from `@aws-sdk/client-sesv2`. */
export type SendEmailCommandCtor = new (input: unknown) => unknown;

/**
 * Delivers email through Amazon SES using nodemailer's built-in SES transport
 * (raw MIME via SESv2 `SendEmail`). The SES client is injected so tests and
 * credential wiring stay outside this class.
 */
export class SesTransport implements MailTransport {
  private readonly transporter: ReturnType<typeof nodemailer.createTransport>;

  constructor(
    sesClient: SesClientLike,
    SendEmailCommand: SendEmailCommandCtor,
  ) {
    this.transporter = nodemailer.createTransport({
      SES: { sesClient, SendEmailCommand },
    });
  }

  async sendMail(message: MailMessage): Promise<unknown> {
    return this.transporter.sendMail(message);
  }
}
