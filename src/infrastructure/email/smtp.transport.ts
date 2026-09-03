import nodemailer from 'nodemailer';
import { MailMessage, MailTransport } from './mail.transport.js';

/** Adapts nodemailer's SMTP transport (local dev / mailcatcher) to the {@link MailTransport} seam. */
export class SmtpTransport implements MailTransport {
  private readonly transporter: ReturnType<typeof nodemailer.createTransport>;

  constructor(host: string, port: number) {
    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: false,
    });
  }

  async sendMail(message: MailMessage): Promise<unknown> {
    return this.transporter.sendMail(message);
  }
}
