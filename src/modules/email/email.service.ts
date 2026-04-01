import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter } from 'nodemailer';
import { renderInvitationTemplate, InvitationTemplateInput } from './templates/invitation.template.js';
import { renderResetPasswordTemplate } from './templates/reset-password.template.js';

type EmailRuntimeConfig = {
  host: string;
  port: number;
  from: string;
};

@Injectable()
export class EmailService {
  private readonly transport: Transporter;
  private readonly fromAddress: string;

  constructor(configOrRuntime: ConfigService | EmailRuntimeConfig) {
    const runtime =
      'get' in configOrRuntime
        ? {
            host: configOrRuntime.get<string>('MAIL_HOST', 'localhost'),
            port: configOrRuntime.get<number>('MAIL_PORT', 1025),
            from: configOrRuntime.getOrThrow<string>('MAIL_FROM'),
          }
        : configOrRuntime;

    this.fromAddress = runtime.from;
    this.transport = nodemailer.createTransport({
      host: runtime.host,
      port: runtime.port,
      secure: false,
    });
  }

  renderInvitation(input: InvitationTemplateInput): string {
    return renderInvitationTemplate(input);
  }

  async sendInvitation(input: InvitationTemplateInput & { to: string }) {
    const html = this.renderInvitation(input);
    await this.transport.sendMail({
      from: this.fromAddress,
      to: input.to,
      subject: 'You are invited to Armenia Service Map',
      html,
    });
  }

  async sendResetPassword(input: { to: string; recipientName: string; resetUrl: string }) {
    const html = renderResetPasswordTemplate({
      recipientName: input.recipientName,
      resetUrl: input.resetUrl,
    });
    await this.transport.sendMail({
      from: this.fromAddress,
      to: input.to,
      subject: 'Reset your password',
      html,
    });
  }
}
