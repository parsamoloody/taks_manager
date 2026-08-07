import { ResendMailService } from './mail.service';

describe('ResendMailService', () => {
  it('skips delivery and resolves when the Resend API key is missing', async () => {
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
    ).resolves.toBeUndefined();
  });
});
