import { EmailService } from './email.service';

describe('EmailService', () => {
  const service = new EmailService({
    host: 'localhost',
    port: 1025,
    from: 'noreply@refugeesupport.am',
  });

  it('renders invitation template with setup URL', () => {
    const html = service.renderInvitation({
      recipientName: 'Jane',
      organisationName: 'Refugee Support',
      setupUrl: 'https://example.com/setup',
    });

    expect(html).toContain('https://example.com/setup');
    expect(html).toContain('Refugee Support');
  });
});

describe('EmailService subscription emails', () => {
  function makeService() {
    const service = new EmailService({ host: 'localhost', port: 1025, from: 'from@test' });
    const sendMail = jest.fn().mockResolvedValue(undefined);
    // @ts-expect-error override private transport for assertion
    service.transport = { sendMail };
    return { service, sendMail };
  }

  it('sends Armenian confirmation with hy subject and unsubscribe link', async () => {
    const { service, sendMail } = makeService();
    await service.sendSubscriptionConfirmation({
      to: 'a@b.com',
      locale: 'hy',
      regionName: 'Tavush',
      topicName: 'Healthcare',
      unsubscribeUrl: 'http://x/unsubscribe?token=tok',
    });
    const arg = sendMail.mock.calls[0][0];
    expect(arg.to).toBe('a@b.com');
    expect(arg.html).toContain('http://x/unsubscribe?token=tok');
    expect(arg.html).toContain('Tavush');
  });

  it('sends new-service notification with service link', async () => {
    const { service, sendMail } = makeService();
    await service.sendNewServiceNotification({
      to: 'a@b.com',
      locale: 'en',
      serviceTitle: 'Free clinic',
      serviceShortDescription: 'A clinic',
      serviceUrl: 'http://x/services/1',
      unsubscribeUrl: 'http://x/unsubscribe?token=tok',
    });
    const arg = sendMail.mock.calls[0][0];
    expect(arg.html).toContain('Free clinic');
    expect(arg.html).toContain('http://x/services/1');
    expect(arg.html).toContain('http://x/unsubscribe?token=tok');
  });
});
