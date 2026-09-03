import {
  createMailTransport,
  resolveEmailRuntime,
} from './mail-transport.factory';
import { SesTransport } from './ses.transport';
import { SmtpTransport } from './smtp.transport';

describe('createMailTransport', () => {
  it('defaults to SES when no transport is specified (staging / production)', () => {
    const transport = createMailTransport({
      host: 'localhost',
      port: 1025,
      from: 'from@test',
      ses: {
        region: 'eu-central-1',
        accessKeyId: 'AKIA',
        secretAccessKey: 'secret',
      },
    });
    expect(transport).toBeInstanceOf(SesTransport);
  });

  it('builds an SMTP transport when transport is "smtp" (local dev / mailcatcher)', () => {
    const transport = createMailTransport({
      transport: 'smtp',
      host: 'localhost',
      port: 1025,
      from: 'from@test',
    });
    expect(transport).toBeInstanceOf(SmtpTransport);
  });

  it('builds an SES transport when transport is "ses"', () => {
    const transport = createMailTransport({
      transport: 'ses',
      host: 'localhost',
      port: 1025,
      from: 'from@test',
      ses: {
        region: 'eu-central-1',
        accessKeyId: 'AKIA',
        secretAccessKey: 'secret',
      },
    });
    expect(transport).toBeInstanceOf(SesTransport);
  });

  it('refuses to build an SES transport without credentials', () => {
    expect(() =>
      createMailTransport({
        transport: 'ses',
        host: 'localhost',
        port: 1025,
        from: 'from@test',
      }),
    ).toThrow(/SES/);
  });
});

describe('resolveEmailRuntime', () => {
  const configFrom = (values: Record<string, string | number | undefined>) => ({
    get: <T>(key: string, fallback?: T) => (values[key] ?? fallback) as T,
    getOrThrow: <T>(key: string) => {
      if (values[key] === undefined) throw new Error(`missing ${key}`);
      return values[key] as T;
    },
  });

  it('defaults to SES with the shared S3 access keys and falls back to S3_REGION', () => {
    const runtime = resolveEmailRuntime(
      configFrom({
        MAIL_FROM: 'noreply@refugeesupport.am',
        S3_ACCESS_KEY: 'AKIA',
        S3_SECRET_KEY: 'secret',
        S3_REGION: 'eu-central-1',
      }),
    );
    expect(runtime.transport).toBe('ses');
    expect(runtime.ses).toEqual({
      region: 'eu-central-1',
      accessKeyId: 'AKIA',
      secretAccessKey: 'secret',
    });
  });

  it('prefers SES_REGION over S3_REGION when set', () => {
    const runtime = resolveEmailRuntime(
      configFrom({
        MAIL_TRANSPORT: 'ses',
        MAIL_FROM: 'noreply@refugeesupport.am',
        S3_ACCESS_KEY: 'AKIA',
        S3_SECRET_KEY: 'secret',
        S3_REGION: 'us-east-1',
        SES_REGION: 'eu-west-1',
      }),
    );
    expect(runtime.ses?.region).toBe('eu-west-1');
  });

  it('maps SMTP transport to MAIL_HOST/MAIL_PORT with defaults', () => {
    const runtime = resolveEmailRuntime(
      configFrom({ MAIL_TRANSPORT: 'smtp', MAIL_FROM: 'from@test' }),
    );
    expect(runtime).toEqual({
      transport: 'smtp',
      host: 'localhost',
      port: 1025,
      from: 'from@test',
    });
  });
});
