import { EmailService } from './email.service';

describe('EmailService', () => {
  const service = new EmailService({
    transport: 'smtp',
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
    const service = new EmailService({ transport: 'smtp', host: 'localhost', port: 1025, from: 'from@test' });
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

  it('escapes HTML in the service title', async () => {
    const { service, sendMail } = makeService();
    await service.sendNewServiceNotification({
      to: 'a@b.com',
      locale: 'en',
      serviceTitle: '<script>x</script>Clinic & Co',
      serviceShortDescription: 'desc',
      serviceUrl: 'http://x/services/1',
      unsubscribeUrl: 'http://x/unsubscribe?token=tok',
    });
    const arg = sendMail.mock.calls.at(-1)[0];
    expect(arg.html).not.toContain('<script>x</script>');
    expect(arg.html).toContain('&lt;script&gt;');
    expect(arg.html).toContain('Clinic &amp; Co');
  });
});

describe('EmailService admin submission emails', () => {
  function makeService() {
    const service = new EmailService({ transport: 'smtp', host: 'localhost', port: 1025, from: 'from@test' });
    const sendMail = jest.fn().mockResolvedValue(undefined);
    // @ts-expect-error override private transport for assertion
    service.transport = { sendMail };
    return { service, sendMail };
  }

  it('sends new need report email to admin with details and dashboard link', async () => {
    const { service, sendMail } = makeService();
    await service.sendNewNeedReportToAdmin({
      to: 'admin@b.com',
      needTitle: 'Need winter clothing',
      needDescription: 'Family of four needs warm clothes.',
      reporterName: 'Anna',
      regionName: 'Tavush',
      adminUrl: 'http://x/admin/needs/need-1',
    });
    const arg = sendMail.mock.calls[0][0];
    expect(arg.to).toBe('admin@b.com');
    expect(arg.subject).toBe('New need report submitted');
    expect(arg.html).toContain('Need winter clothing');
    expect(arg.html).toContain('Anna');
    expect(arg.html).toContain('Tavush');
    expect(arg.html).toContain('http://x/admin/needs/need-1');
  });

  it('escapes HTML in a need report field', async () => {
    const { service, sendMail } = makeService();
    await service.sendNewNeedReportToAdmin({
      to: 'admin@b.com',
      needTitle: '<script>x</script>Help & support',
      needDescription: 'desc',
      reporterName: 'Anna',
      adminUrl: 'http://x/admin/needs/need-1',
    });
    const arg = sendMail.mock.calls.at(-1)[0];
    expect(arg.html).not.toContain('<script>x</script>');
    expect(arg.html).toContain('&lt;script&gt;');
    expect(arg.html).toContain('Help &amp; support');
  });

  it('sends new join-network request email to admin with org details and dashboard link', async () => {
    const { service, sendMail } = makeService();
    await service.sendNewJoinNetworkRequestToAdmin({
      to: 'admin@b.com',
      organisationName: 'Bridge to Hope',
      contactName: 'Mariam',
      contactEmail: 'mariam@example.com',
      servicesDescription: 'Legal aid and psychosocial support.',
      regionNames: ['Yerevan', 'Shirak'],
      adminUrl: 'http://x/admin/organisations/org-1',
    });
    const arg = sendMail.mock.calls[0][0];
    expect(arg.to).toBe('admin@b.com');
    expect(arg.subject).toBe('New join-network request submitted');
    expect(arg.html).toContain('Bridge to Hope');
    expect(arg.html).toContain('Mariam');
    expect(arg.html).toContain('mariam@example.com');
    expect(arg.html).toContain('Yerevan, Shirak');
    expect(arg.html).toContain('http://x/admin/organisations/org-1');
  });

  it('omits the regions line from the join-network email when none were selected', async () => {
    const { service, sendMail } = makeService();
    await service.sendNewJoinNetworkRequestToAdmin({
      to: 'admin@b.com',
      organisationName: 'Bridge to Hope',
      contactName: 'Mariam',
      contactEmail: 'mariam@example.com',
      servicesDescription: 'Legal aid.',
      regionNames: [],
      adminUrl: 'http://x/admin/organisations/org-1',
    });
    const arg = sendMail.mock.calls[0][0];
    expect(arg.html).not.toContain('Regions:');
  });
});
