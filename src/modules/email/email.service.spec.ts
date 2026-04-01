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
