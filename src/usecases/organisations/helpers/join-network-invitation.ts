import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../../../infrastructure/email/email.service.js';
import { buildSetupPasswordUrl } from '../../../modules/auth/helpers/setup-password-link.js';

export function splitContactName(contactName?: string | null) {
  const normalized = (contactName ?? '').trim().replace(/\s+/g, ' ');
  if (!normalized) {
    return { firstName: 'Organisation', lastName: 'Admin' };
  }

  const parts = normalized.split(' ');
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: 'Admin' };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
}

export async function sendInvitationEmail(input: {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  /** Omitted for platform (super admin) accounts that belong to no organisation. */
  organisationName?: string;
  jwt: JwtService;
  config: ConfigService;
  emailService: EmailService;
}) {
  const setupUrl = await buildSetupPasswordUrl({
    userId: input.userId,
    expiresIn: '7d',
    jwt: input.jwt,
    config: input.config,
  });

  await input.emailService.sendInvitation({
    to: input.email,
    recipientName: `${input.firstName} ${input.lastName}`.trim(),
    organisationName: input.organisationName,
    setupUrl,
  });
}
