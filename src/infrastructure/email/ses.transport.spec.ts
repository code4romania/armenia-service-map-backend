import { SesTransport } from './ses.transport';

type CapturedInput = {
  FromEmailAddress: string;
  Destination: { ToAddresses: string[] };
  Content: { Raw: { Data: Buffer } };
};

function fakeSes() {
  const inputs: CapturedInput[] = [];
  class SendEmailCommand {
    constructor(public readonly input: CapturedInput) {
      inputs.push(input);
    }
  }
  const send = jest.fn().mockResolvedValue({ MessageId: 'ses-msg-1' });
  return {
    inputs,
    SendEmailCommand,
    sesClient: {
      send,
      config: { region: () => Promise.resolve('eu-central-1') },
    },
  };
}

describe('SesTransport', () => {
  it('sends a raw MIME message through the SES client with from/to envelope', async () => {
    const ses = fakeSes();
    const transport = new SesTransport(ses.sesClient, ses.SendEmailCommand);

    await transport.sendMail({
      from: 'noreply@refugeesupport.am',
      to: 'someone@example.com',
      subject: 'Hello from SES',
      html: '<strong>Hello</strong> dear SES user.',
    });

    expect(ses.sesClient.send).toHaveBeenCalledTimes(1);
    expect(ses.inputs).toHaveLength(1);
    const input = ses.inputs[0];
    expect(input.FromEmailAddress).toBe('noreply@refugeesupport.am');
    expect(input.Destination.ToAddresses).toEqual(['someone@example.com']);
    const raw = input.Content.Raw.Data.toString('utf8');
    expect(raw).toContain('Subject: Hello from SES');
    expect(raw).toContain('Content-Type: text/html');
    expect(raw).toContain('<strong>Hello</strong> dear SES user.');
  });

  it('resolves with the SES message id', async () => {
    const ses = fakeSes();
    const transport = new SesTransport(ses.sesClient, ses.SendEmailCommand);

    const result = (await transport.sendMail({
      from: 'a@b.am',
      to: 'c@d.am',
      subject: 's',
      html: '<p>x</p>',
    })) as {
      messageId: string;
    };

    expect(result.messageId).toContain('ses-msg-1');
  });
});
