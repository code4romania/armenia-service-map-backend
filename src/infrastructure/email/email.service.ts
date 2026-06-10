import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';
import { ServerClient } from 'postmark';
import { MailMessage, MailTransport, PostmarkTransport } from './postmark.transport.js';
import { renderInvitationTemplate, InvitationTemplateInput } from './templates/invitation.template.js';
import { renderResetPasswordTemplate } from './templates/reset-password.template.js';
import { renderSubscriptionConfirmationTemplate, SubscriptionLocale } from './templates/subscription-confirmation.template.js';
import { renderNewServiceNotificationTemplate } from './templates/new-service-notification.template.js';
import { renderNewNeedReportAdminTemplate } from './templates/new-need-report-admin.template.js';
import { renderNewJoinNetworkAdminTemplate } from './templates/new-join-network-admin.template.js';

type EmailRuntimeConfig = {
  host: string;
  port: number;
  from: string;
  postmarkServerToken?: string;
  postmarkMessageStream?: string;
};

/** Adapts nodemailer's SMTP transport to the {@link MailTransport} seam. */
class SmtpTransport implements MailTransport {
  private readonly transporter: ReturnType<typeof nodemailer.createTransport>;

  constructor(host: string, port: number) {
    this.transporter = nodemailer.createTransport({ host, port, secure: false });
  }

  async sendMail(message: MailMessage): Promise<unknown> {
    return this.transporter.sendMail(message);
  }
}

@Injectable()
export class EmailService {
  private readonly transport: MailTransport;
  private readonly fromAddress: string;

  constructor(configOrRuntime: ConfigService | EmailRuntimeConfig) {
    const runtime =
      'get' in configOrRuntime
        ? {
            host: configOrRuntime.get<string>('MAIL_HOST', 'localhost'),
            port: configOrRuntime.get<number>('MAIL_PORT', 1025),
            from: configOrRuntime.getOrThrow<string>('MAIL_FROM'),
            postmarkServerToken: configOrRuntime.get<string>('POSTMARK_SERVER_TOKEN'),
            postmarkMessageStream: configOrRuntime.get<string>('POSTMARK_MESSAGE_STREAM', 'outbound'),
          }
        : configOrRuntime;

    this.fromAddress = runtime.from;
    this.transport = runtime.postmarkServerToken
      ? new PostmarkTransport(
          new ServerClient(runtime.postmarkServerToken),
          runtime.postmarkMessageStream ?? 'outbound',
        )
      : new SmtpTransport(runtime.host, runtime.port);
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

  async sendOrganisationReviewOutcome(input: {
    to: string;
    recipientName: string;
    organisationName: string;
    outcome: 'APPROVED' | 'REJECTED';
    rejectionReason?: string;
  }) {
    const isApproved = input.outcome === 'APPROVED';
    const subject = isApproved
      ? 'Your organisation has been approved'
      : 'Your organisation application was not approved';

    const reasonBlock =
      !isApproved && input.rejectionReason
        ? `<p><strong>Reason provided:</strong> ${input.rejectionReason}</p>`
        : '';

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>${subject}</h2>
        <p>Hello ${input.recipientName},</p>
        <p>
          Your request for <strong>${input.organisationName}</strong> to join Armenia Service Map was
          ${isApproved ? 'approved' : 'reviewed and rejected'}.
        </p>
        ${reasonBlock}
      </div>
    `.trim();

    await this.transport.sendMail({
      from: this.fromAddress,
      to: input.to,
      subject,
      html,
    });
  }

  async sendSubscriptionConfirmation(input: {
    to: string;
    locale: SubscriptionLocale;
    regionName?: string;
    topicName?: string;
    unsubscribeUrl: string;
  }) {
    const { subject, html } = renderSubscriptionConfirmationTemplate(input);
    await this.transport.sendMail({ from: this.fromAddress, to: input.to, subject, html });
  }

  async sendNewServiceNotification(input: {
    to: string;
    locale: SubscriptionLocale;
    serviceTitle: string;
    serviceShortDescription: string;
    serviceUrl: string;
    unsubscribeUrl: string;
  }) {
    const { subject, html } = renderNewServiceNotificationTemplate(input);
    await this.transport.sendMail({ from: this.fromAddress, to: input.to, subject, html });
  }

  async sendNewNeedReportToAdmin(input: {
    to: string;
    needTitle: string;
    needDescription: string;
    reporterName: string;
    regionName?: string;
    adminUrl: string;
  }) {
    const { to, ...rest } = input;
    const { subject, html } = renderNewNeedReportAdminTemplate(rest);
    await this.transport.sendMail({ from: this.fromAddress, to, subject, html });
  }

  async sendNewJoinNetworkRequestToAdmin(input: {
    to: string;
    organisationName: string;
    contactName: string;
    contactEmail: string;
    servicesDescription: string;
    regionName?: string;
    adminUrl: string;
  }) {
    const { to, ...rest } = input;
    const { subject, html } = renderNewJoinNetworkAdminTemplate(rest);
    await this.transport.sendMail({ from: this.fromAddress, to, subject, html });
  }
}
