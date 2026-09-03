import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
import { MailTransport } from './mail.transport.js';
import { SesTransport } from './ses.transport.js';
import { SmtpTransport } from './smtp.transport.js';

export type MailTransportKind = 'smtp' | 'ses';

export type EmailRuntimeConfig = {
  /** Defaults to `ses` (staging & production). Local dev sets `smtp` (mailcatcher). */
  transport?: MailTransportKind;
  host: string;
  port: number;
  from: string;
  ses?: { region: string; accessKeyId: string; secretAccessKey: string };
};

/** Minimal slice of Nest's `ConfigService` used to read email settings. */
export interface EmailConfigReader {
  get<T>(key: string, fallback?: T): T;
  getOrThrow<T>(key: string): T;
}

/**
 * Reads the email runtime from environment config.
 * SES reuses the AWS access keys already provisioned for S3 uploads
 * (`S3_ACCESS_KEY` / `S3_SECRET_KEY`); `SES_REGION` overrides `S3_REGION`
 * because the SES identity may live in a different region than the bucket.
 */
export function resolveEmailRuntime(
  config: EmailConfigReader,
): EmailRuntimeConfig {
  const transport = config.get<MailTransportKind>('MAIL_TRANSPORT', 'ses');
  const base: EmailRuntimeConfig = {
    transport,
    host: config.get<string>('MAIL_HOST', 'localhost'),
    port: config.get<number>('MAIL_PORT', 1025),
    from: config.getOrThrow<string>('MAIL_FROM'),
  };
  if (transport !== 'ses') return base;
  return {
    ...base,
    ses: {
      region:
        config.get<string>('SES_REGION') ??
        config.get<string>('S3_REGION', 'us-east-1'),
      accessKeyId: config.getOrThrow<string>('S3_ACCESS_KEY'),
      secretAccessKey: config.getOrThrow<string>('S3_SECRET_KEY'),
    },
  };
}

export function createMailTransport(
  runtime: EmailRuntimeConfig,
): MailTransport {
  if (runtime.transport === 'smtp') {
    return new SmtpTransport(runtime.host, runtime.port);
  }
  if (!runtime.ses) {
    throw new Error(
      'MAIL_TRANSPORT=ses requires S3_ACCESS_KEY, S3_SECRET_KEY and SES_REGION (or S3_REGION)',
    );
  }
  const client = new SESv2Client({
    region: runtime.ses.region,
    credentials: {
      accessKeyId: runtime.ses.accessKeyId,
      secretAccessKey: runtime.ses.secretAccessKey,
    },
  });
  return new SesTransport(client, SendEmailCommand);
}
