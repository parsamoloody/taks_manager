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
      upsert: jest.fn(),
      findMany: jest.fn(),
    },
    boardMember: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    actionToken: {
      updateMany: jest.fn(),
    },
    board: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
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
    prisma.workspaceMember.upsert.mockResolvedValue(member);
    prisma.actionToken.updateMany.mockResolvedValue({ count: 1 });
    prisma.$transaction
      .mockImplementationOnce((callback) => callback(prisma))
      .mockResolvedValueOnce([]);
    prisma.workspaceMember.findMany.mockResolvedValue([{ userId: 'user-id' }]);
    prisma.board.findMany.mockResolvedValue([]);

    await expect(
      service.acceptInvitation('raw-token', 'user-id'),
    ).resolves.toEqual(member);

    expect(prisma.workspaceMember.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: {
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

  it('queues a board-scoped invitation for a workspace member', async () => {
    const expiresAt = new Date('2026-08-02T10:00:00.000Z');
    prisma.board.findUnique.mockResolvedValue({
      workspaceId: 'workspace-id',
    });
    prisma.workspaceMember.findUnique
      .mockResolvedValueOnce({ role: WorkspaceRole.OWNER })
      .mockResolvedValueOnce({ role: WorkspaceRole.MEMBER });
    prisma.workspace.findUnique.mockResolvedValue({ name: 'Product' });
    prisma.user.findUnique
      .mockResolvedValueOnce({
        email: 'owner@example.com',
        firstName: 'Sam',
        lastName: 'Lee',
      })
      .mockResolvedValueOnce({ id: 'invited-user-id' });
    prisma.board.findFirst.mockResolvedValue({
      id: 'board-id',
      name: 'Roadmap',
    });
    prisma.boardMember.findUnique.mockResolvedValue(null);
    actionTokens.issue.mockResolvedValue({
      token: 'raw-token',
      record: { expiresAt },
    });

    await expect(
      service.inviteBoardMember(
        'board-id',
        { email: 'person@example.com' },
        'owner-id',
      ),
    ).resolves.toEqual({
      message: 'Board invitation queued',
      expiresAt,
    });

    expect(actionTokens.issue).toHaveBeenCalledWith({
      type: ActionTokenType.WORKSPACE_INVITATION,
      email: 'person@example.com',
      workspaceId: 'workspace-id',
      boardId: 'board-id',
      ttlMs: 72 * 60 * 60_000,
    });
    expect(notifications.sendWorkspaceInvitation).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceName: 'Product',
        boardName: 'Roadmap',
      }),
    );
  });

  it('adds an existing workspace member to an invited board', async () => {
    const member = {
      workspaceId: 'workspace-id',
      userId: 'user-id',
      role: WorkspaceRole.MEMBER,
    };
    actionTokens.findValid.mockResolvedValue({
      id: 'token-id',
      email: 'user@example.com',
      workspaceId: 'workspace-id',
      boardId: 'board-id',
    });
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-id',
      email: 'user@example.com',
    });
    prisma.workspaceMember.findUnique.mockResolvedValue(member);
    prisma.board.findFirst.mockResolvedValue({ id: 'board-id' });
    prisma.boardMember.findUnique.mockResolvedValue(null);
    prisma.actionToken.updateMany.mockResolvedValue({ count: 1 });
    prisma.workspaceMember.upsert.mockResolvedValue(member);
    prisma.boardMember.create.mockResolvedValue({
      boardId: 'board-id',
      userId: 'user-id',
    });
    prisma.$transaction
      .mockImplementationOnce((callback) => callback(prisma))
      .mockResolvedValueOnce([]);
    prisma.workspaceMember.findMany.mockResolvedValue([{ userId: 'user-id' }]);
    prisma.board.findMany.mockResolvedValue([]);

    await expect(
      service.acceptInvitation('raw-token', 'user-id'),
    ).resolves.toEqual(member);

    expect(prisma.boardMember.create).toHaveBeenCalledWith({
      data: {
        boardId: 'board-id',
        userId: 'user-id',
      },
    });
  });
});
