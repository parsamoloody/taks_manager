/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unnecessary-type-assertion */
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  const queue = {
    enqueueWorkspaceInvitation: jest.fn(),
    enqueuePasswordReset: jest.fn(),
    scheduleTaskReminder: jest.fn(),
    cancelTaskReminder: jest.fn(),
  };
  const config = {
    get: jest.fn((key: string) => {
      const values = {
        'app.frontBaseUrl': 'https://tasks.example.com/',
        'notifications.taskReminderLeadMinutes': 90,
      };
      return values[key];
    }),
  };
  const service = new NotificationService(queue as never, config as never);

  beforeEach(() => {
    jest.clearAllMocks();
    queue.enqueueWorkspaceInvitation.mockResolvedValue(undefined);
    queue.enqueuePasswordReset.mockResolvedValue(undefined);
    queue.scheduleTaskReminder.mockResolvedValue(undefined);
    queue.cancelTaskReminder.mockResolvedValue(undefined);
  });

  it('queues an invitation with the frontend acceptance URL', async () => {
    await service.sendWorkspaceInvitation({
      to: 'person@example.com',
      workspaceName: 'Product',
      inviterName: 'Sam',
      token: 'token with spaces',
      expiresAt: new Date('2026-08-06T10:00:00.000Z'),
    });

    expect(queue.enqueueWorkspaceInvitation).toHaveBeenCalledWith({
      to: 'person@example.com',
      workspaceName: 'Product',
      inviterName: 'Sam',
      inviteUrl:
        'https://tasks.example.com/invitations/accept?token=token+with+spaces',
      expiresAt: '2026-08-06T10:00:00.000Z',
    });
  });

  it('schedules reminders using the configured lead time', async () => {
    await service.syncTaskReminder({
      taskId: 'task-id',
      dueDate: new Date('2026-08-01T12:00:00.000Z'),
      status: 'PENDING',
      assigneeCount: 2,
    });

    expect(queue.scheduleTaskReminder).toHaveBeenCalledWith(
      { taskId: 'task-id' },
      new Date('2026-08-01T10:30:00.000Z'),
    );
  });

  it.each([
    { dueDate: null, status: 'PENDING', assigneeCount: 1 },
    {
      dueDate: new Date('2026-08-01T12:00:00.000Z'),
      status: 'DONE',
      assigneeCount: 1,
    },
    {
      dueDate: new Date('2026-08-01T12:00:00.000Z'),
      status: 'PENDING',
      assigneeCount: 0,
    },
  ])('cancels reminders that are no longer needed', async (input) => {
    await service.syncTaskReminder({ taskId: 'task-id', ...input });

    expect(queue.cancelTaskReminder).toHaveBeenCalledWith('task-id');
    expect(queue.scheduleTaskReminder).not.toHaveBeenCalled();
  });
});
