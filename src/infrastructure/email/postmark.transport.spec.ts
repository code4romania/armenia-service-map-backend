import { PostmarkTransport } from './postmark.transport';

describe('PostmarkTransport', () => {
  it('maps a MailMessage to the Postmark sendEmail payload with the configured stream', async () => {
    const sendEmail = jest.fn().mockResolvedValue({ MessageID: 'abc' });
    const transport = new PostmarkTransport({ sendEmail }, 'broadcast');

    await transport.sendMail({
      from: 'andrew.radulescu@wearetribus.com',
      to: 'someone@example.com',
      subject: 'Hello from Postmark',
      html: '<strong>Hello</strong> dear Postmark user.',
    });

    expect(sendEmail).toHaveBeenCalledWith({
      From: 'andrew.radulescu@wearetribus.com',
      To: 'someone@example.com',
      Subject: 'Hello from Postmark',
      HtmlBody: '<strong>Hello</strong> dear Postmark user.',
      MessageStream: 'broadcast',
    });
  });

  it('returns the Postmark response', async () => {
    const response = { MessageID: 'id-1', ErrorCode: 0 };
    const sendEmail = jest.fn().mockResolvedValue(response);
    const transport = new PostmarkTransport({ sendEmail }, 'outbound');

    await expect(
      transport.sendMail({ from: 'a@b', to: 'c@d', subject: 's', html: '<p>x</p>' }),
    ).resolves.toBe(response);
  });
});
