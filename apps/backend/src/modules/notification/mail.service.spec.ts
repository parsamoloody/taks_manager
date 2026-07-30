import { ResendMailService } from './mail.service';

describe('ResendMailService', () => {
  it('allows the application to start without a Resend API key', async () => {
    const config = {
      get: jest.fn((key: string) =>
        key === 'mail.from' ? 'Task Manager <test@example.com>' : undefined,
      ),
    };

    const mail = new ResendMailService(config as never);

    await expect(
      mail.send({
        to: 'person@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
        text: 'Test',
      }),
    ).rejects.toThrow('RESEND_API_KEY is not configured');
  });
});
