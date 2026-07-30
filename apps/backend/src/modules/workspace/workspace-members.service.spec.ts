/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call */
import { ActionTokenType, WorkspaceRole } from '@prisma/client';

import { WorkspaceMembersService } from './workspace-members.service';

describe('WorkspaceMembersService invitations', () => {
  const prisma = {
    workspace: {
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    workspaceMember: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
    actionToken: {
      updateMany: jest.fn(),
    },
    board: {
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };
  const config = {
    get: jest.fn(() => 72),
  };
  const actionTokens = {
    issue: jest.fn(),
    findValid: jest.fn(),
  };
  const notifications = {
    sendWorkspaceInvitation: jest.fn(),
  };
  const service = new WorkspaceMembersService(
    prisma as never,
    config as never,
    actionTokens as never,
    notifications as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    notifications.sendWorkspaceInvitation.mockResolvedValue(undefined);
  });

  it('issues and queues an invitation after owner authorization', async () => {
    const expiresAt = new Date('2026-08-02T10:00:00.000Z');
    prisma.workspaceMember.findUnique
      .mockResolvedValueOnce({ role: WorkspaceRole.OWNER })
      .mockResolvedValueOnce(null);
    prisma.workspace.findUnique.mockResolvedValue({ name: 'Product' });
    prisma.user.findUnique
      .mockResolvedValueOnce({
        email: 'owner@example.com',
        firstName: 'Sam',
        lastName: 'Lee',
      })
      .mockResolvedValueOnce({ id: 'invited-user-id' });
    actionTokens.issue.mockResolvedValue({
      token: 'raw-token',
      record: { expiresAt },
    });

    const result = await service.inviteMember(
      'workspace-id',
      { email: ' PERSON@example.com ' },
      'owner-id',
    );

    expect(actionTokens.issue).toHaveBeenCalledWith({
      type: ActionTokenType.WORKSPACE_INVITATION,
      email: 'person@example.com',
      workspaceId: 'workspace-id',
      ttlMs: 72 * 60 * 60_000,
    });
    expect(notifications.sendWorkspaceInvitation).toHaveBeenCalledWith({
      to: 'person@example.com',
      workspaceName: 'Product',
      inviterName: 'Sam Lee',
      token: 'raw-token',
      expiresAt,
    });
    expect(result).toEqual({
      message: 'Workspace invitation queued',
      expiresAt,
    });
  });

  it('accepts an invitation for its matching user email', async () => {
    const member = {
      workspaceId: 'workspace-id',
      userId: 'user-id',
      role: WorkspaceRole.MEMBER,
    };
    actionTokens.findValid.mockResolvedValue({
      id: 'token-id',
      email: 'user@example.com',
      workspaceId: 'workspace-id',
    });
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-id',
      email: 'USER@example.com',
    });
    prisma.workspaceMember.findUnique.mockResolvedValue(null);
    prisma.workspaceMember.create.mockResolvedValue(member);
    prisma.actionToken.updateMany.mockResolvedValue({ count: 1 });
    prisma.$transaction
      .mockImplementationOnce((callback) => callback(prisma))
      .mockResolvedValueOnce([]);
    prisma.workspaceMember.findMany.mockResolvedValue([{ userId: 'user-id' }]);
    prisma.board.findMany.mockResolvedValue([]);

    await expect(
      service.acceptInvitation('raw-token', 'user-id'),
    ).resolves.toEqual(member);

    expect(prisma.workspaceMember.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          workspaceId: 'workspace-id',
          userId: 'user-id',
          role: WorkspaceRole.MEMBER,
        },
      }),
    );
    expect(prisma.actionToken.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'token-id',
        usedAt: null,
        expiresAt: { gt: expect.any(Date) },
      },
      data: { usedAt: expect.any(Date) },
    });
  });
});
