/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call */
import { ActionTokenType } from '@prisma/client';

import { AuthService } from './auth.service';

describe('AuthService password reset', () => {
  const prisma = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    actionToken: {
      updateMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };
  const config = {
    get: jest.fn((key: string) =>
      key === 'notifications.passwordResetTtlMinutes' ? 45 : 'test',
    ),
  };
  const actionTokens = {
    issue: jest.fn(),
    findValid: jest.fn(),
  };
  const notifications = {
    sendPasswordReset: jest.fn(),
  };
  const service = new AuthService(
    prisma as never,
    {} as never,
    config as never,
    actionTokens as never,
    notifications as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    notifications.sendPasswordReset.mockResolvedValue(undefined);
  });

  it('queues a reset for an existing account', async () => {
    const expiresAt = new Date('2026-07-30T10:45:00.000Z');
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-id',
      email: 'user@example.com',
    });
    actionTokens.issue.mockResolvedValue({
      token: 'raw-token',
      record: { expiresAt },
    });

    const response = await service.requestPasswordReset(' USER@example.com ');

    expect(actionTokens.issue).toHaveBeenCalledWith({
      type: ActionTokenType.PASSWORD_RESET,
      email: 'user@example.com',
      userId: 'user-id',
      ttlMs: 45 * 60_000,
    });
    expect(notifications.sendPasswordReset).toHaveBeenCalledWith({
      to: 'user@example.com',
      token: 'raw-token',
      expiresAt,
    });
    expect(response.message).toContain('If an account exists');
  });

  it('returns the same response for an unknown email', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const response = await service.requestPasswordReset('unknown@example.com');

    expect(actionTokens.issue).not.toHaveBeenCalled();
    expect(notifications.sendPasswordReset).not.toHaveBeenCalled();
    expect(response.message).toContain('If an account exists');
  });

  it('atomically consumes a valid token and changes the password', async () => {
    actionTokens.findValid.mockResolvedValue({
      id: 'token-id',
      userId: 'user-id',
    });
    prisma.actionToken.updateMany.mockResolvedValue({ count: 1 });
    prisma.user.update.mockResolvedValue({ id: 'user-id' });
    prisma.$transaction.mockImplementation((callback) => callback(prisma));

    await expect(
      service.resetPassword({
        token: 'raw-token',
        password: 'newStrongPassword123',
      }),
    ).resolves.toEqual({ message: 'Password reset successfully' });

    expect(prisma.actionToken.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'token-id',
        usedAt: null,
        expiresAt: { gt: expect.any(Date) },
      },
      data: { usedAt: expect.any(Date) },
    });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-id' },
      data: {
        hashedPassword: expect.not.stringMatching('newStrongPassword123'),
      },
    });
  });
});
