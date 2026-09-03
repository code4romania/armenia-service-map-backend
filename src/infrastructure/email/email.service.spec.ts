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

  it('renders a platform-administrator invitation when there is no organisation', () => {
    const html = service.renderInvitation({
      recipientName: 'Jane',
      setupUrl: 'https://example.com/setup',
    });

    expect(html).toContain('platform administrator');
    expect(html).not.toContain('undefined');
  });
});

describe('EmailService subscription emails', () => {
  function makeService() {
    const service = new EmailService({
      transport: 'smtp',
      host: 'localhost',
      port: 1025,
      from: 'from@test',
    });
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
    expect(arg.html).not.toContain('RefugeeSupport');
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
    const service = new EmailService({
      transport: 'smtp',
      host: 'localhost',
      port: 1025,
      from: 'from@test',
    });
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

describe('EmailService account emails (branded layout)', () => {
  function makeService() {
    const service = new EmailService({
      transport: 'smtp',
      host: 'localhost',
      port: 1025,
      from: 'from@test',
    });
    const sendMail = jest.fn().mockResolvedValue(undefined);
    // @ts-expect-error override private transport for assertion
    service.transport = { sendMail };
    return { service, sendMail };
  }

  it('renders invitation inside the branded layout with a CTA button and escaped input', () => {
    const { service } = makeService();
    const html = service.renderInvitation({
      recipientName: '<b>Jane</b>',
      organisationName: 'Clinic & Co',
      setupUrl: 'https://example.com/setup?token=abc',
    });
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('Qezhet');
    expect(html).not.toContain('RefugeeSupport');
    expect(html).not.toContain('Armenia Service Map');
    expect(html).not.toContain('<b>Jane</b>');
    expect(html).toContain('&lt;b&gt;Jane&lt;/b&gt;');
    expect(html).toContain('Clinic &amp; Co');
    expect(html).toContain('href="https://example.com/setup?token=abc"');
    expect(html).toContain('Set up your account');
  });

  it('sends reset-password email inside the branded layout with escaped name', async () => {
    const { service, sendMail } = makeService();
    await service.sendResetPassword({
      to: 'a@b.com',
      recipientName: '<script>x</script>',
      resetUrl: 'https://example.com/reset?token=abc',
    });
    const arg = sendMail.mock.calls[0][0];
    expect(arg.subject).toBe('Reset your password');
    expect(arg.html).toContain('<!DOCTYPE html>');
    expect(arg.html).not.toContain('<script>x</script>');
    expect(arg.html).toContain('href="https://example.com/reset?token=abc"');
    expect(arg.html).toContain('Reset password');
  });

  it('sends approval outcome with a dashboard button', async () => {
    const { service, sendMail } = makeService();
    await service.sendOrganisationReviewOutcome({
      to: 'a@b.com',
      recipientName: 'Mariam',
      organisationName: 'Bridge & Hope',
      outcome: 'APPROVED',
      dashboardUrl: 'https://example.com/login',
    });
    const arg = sendMail.mock.calls[0][0];
    expect(arg.subject).toBe('Your organisation has been approved');
    expect(arg.html).toContain('<!DOCTYPE html>');
    expect(arg.html).toContain('Bridge &amp; Hope');
    expect(arg.html).toContain('href="https://example.com/login"');
    expect(arg.html).not.toContain('Reason provided');
  });

  it('sends rejection outcome with escaped reason and no dashboard button', async () => {
    const { service, sendMail } = makeService();
    await service.sendOrganisationReviewOutcome({
      to: 'a@b.com',
      recipientName: 'Mariam',
      organisationName: 'Bridge to Hope',
      outcome: 'REJECTED',
      rejectionReason: 'Missing <docs> & licence',
      dashboardUrl: 'https://example.com/login',
    });
    const arg = sendMail.mock.calls[0][0];
    expect(arg.subject).toBe('Your organisation application was not approved');
    expect(arg.html).toContain('Reason provided');
    expect(arg.html).toContain('Missing &lt;docs&gt; &amp; licence');
    expect(arg.html).not.toContain('href="https://example.com/login"');
  });
});

describe('Email layout', () => {
  function makeService() {
    const service = new EmailService({
      transport: 'smtp',
      host: 'localhost',
      port: 1025,
      from: 'from@test',
    });
    const sendMail = jest.fn().mockResolvedValue(undefined);
    // @ts-expect-error override private transport for assertion
    service.transport = { sendMail };
    return { service, sendMail };
  }

  it('includes a preheader, site link and copy-link fallback for CTA emails', async () => {
    const { service, sendMail } = makeService();
    await service.sendNewServiceNotification({
      to: 'a@b.com',
      locale: 'en',
      serviceTitle: 'Free clinic',
      serviceShortDescription: 'Care.',
      serviceUrl: 'http://x/services/1',
      unsubscribeUrl: 'http://x/unsubscribe?token=tok',
    });
    const html: string = sendMail.mock.calls[0][0].html;
    expect(html).toContain('class="preheader"');
    expect(html).toContain('qezhet.am');
    expect(html).not.toContain('refugeesupport');
    // fallback link text shows the URL for clients that block buttons
    expect(html.split('http://x/services/1').length).toBeGreaterThanOrEqual(3);
  });

  it('renders admin details as a definition table rather than bold labels', async () => {
    const { service, sendMail } = makeService();
    await service.sendNewNeedReportToAdmin({
      to: 'admin@b.com',
      needTitle: 'Need winter clothing',
      needDescription: 'Families need coats.',
      reporterName: 'Anna',
      regionName: 'Tavush',
      adminUrl: 'http://x/admin/needs/need-1',
    });
    const html: string = sendMail.mock.calls[0][0].html;
    expect(html).toContain('class="detail-row"');
    expect(html).not.toContain('<strong>Region:</strong>');
    expect(html).not.toContain('Unsubscribe');
  });
});
