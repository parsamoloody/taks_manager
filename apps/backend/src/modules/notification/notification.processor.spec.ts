/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unnecessary-type-assertion */
import type { Job } from 'bullmq';

import { NotificationProcessor } from './notification.processor';
import {
  NotificationJobName,
  type NotificationJobData,
} from './notification.types';

describe('NotificationProcessor', () => {
  const mail = { send: jest.fn() };
  const prisma = {
    task: {
      findUnique: jest.fn(),
    },
  };
  const config = {
    get: jest.fn(() => 'https://tasks.example.com'),
  };
  const processor = new NotificationProcessor(
    mail as never,
    prisma as never,
    config as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    mail.send.mockResolvedValue(undefined);
  });

  it('renders and sends workspace invitations', async () => {
    await processor.process({
      name: NotificationJobName.WORKSPACE_INVITATION,
      data: {
        to: 'person@example.com',
        workspaceName: 'Product',
        inviterName: 'Sam',
        inviteUrl: 'https://tasks.example.com/invite?token=abc',
        expiresAt: '2026-08-06T10:00:00.000Z',
      },
    } as Job<NotificationJobData>);

    expect(mail.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'person@example.com',
        subject: 'Invitation to join Product',
        html: expect.stringContaining('Accept invitation'),
      }),
    );
  });

  it('sends a task reminder to every current assignee', async () => {
    prisma.task.findUnique.mockResolvedValue({
      id: 'task-id',
      title: 'Ship release',
      dueDate: new Date('2026-08-01T12:00:00.000Z'),
      status: 'PENDING',
      assignee: [
        { user: { email: 'one@example.com' } },
        { user: { email: 'two@example.com' } },
      ],
      list: {
        board: {
          id: 'board-id',
          workspace: { id: 'workspace-id', name: 'Product' },
        },
      },
    });

    await processor.process({
      name: NotificationJobName.TASK_REMINDER,
      data: { taskId: 'task-id' },
    } as Job<NotificationJobData>);

    expect(mail.send).toHaveBeenCalledTimes(2);
    expect(mail.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'one@example.com',
        subject: 'Task due soon: Ship release',
        html: expect.stringContaining(
          '/workspaces/workspace-id/board/board-id?taskId=task-id',
        ),
      }),
    );
  });

  it('does not send stale reminders for completed tasks', async () => {
    prisma.task.findUnique.mockResolvedValue({
      id: 'task-id',
      dueDate: new Date(),
      status: 'DONE',
      assignee: [{ user: { email: 'one@example.com' } }],
    });

    await processor.process({
      name: NotificationJobName.TASK_REMINDER,
      data: { taskId: 'task-id' },
    } as Job<NotificationJobData>);

    expect(mail.send).not.toHaveBeenCalled();
  });
});
