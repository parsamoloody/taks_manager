/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { BadRequestException } from '@nestjs/common';
import { ActionTokenType } from '@prisma/client';

import { ActionTokenService } from './action-token.service';

describe('ActionTokenService', () => {
  const actionToken = {
    deleteMany: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
  };
  const service = new ActionTokenService({ actionToken } as never);

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(new Date('2026-07-30T10:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('stores a hash instead of the raw token', async () => {
    actionToken.deleteMany.mockResolvedValue({ count: 1 });
    actionToken.create.mockImplementation(({ data }) =>
      Promise.resolve({ id: 'token-id', ...data }),
    );

    const result = await service.issue({
      type: ActionTokenType.PASSWORD_RESET,
      email: ' USER@example.com ',
      userId: 'user-id',
      ttlMs: 30 * 60_000,
    });

    expect(result.token).toHaveLength(64);
    expect(result.record.tokenHash).toHaveLength(64);
    expect(result.record.tokenHash).not.toBe(result.token);
    expect(actionToken.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: 'user@example.com',
        tokenHash: service.hash(result.token),
        expiresAt: new Date('2026-07-30T10:30:00.000Z'),
      }),
    });
  });

  it('rejects expired tokens', async () => {
    actionToken.findUnique.mockResolvedValue({
      type: ActionTokenType.PASSWORD_RESET,
      usedAt: null,
      expiresAt: new Date('2026-07-30T09:59:59.000Z'),
    });

    await expect(
      service.findValid('expired', ActionTokenType.PASSWORD_RESET),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
