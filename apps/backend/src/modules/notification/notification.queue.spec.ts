import { BullNotificationQueue } from './notification.queue';
import { NotificationJobName } from './notification.types';

describe('BullNotificationQueue', () => {
  const remove = jest.fn();
  const queue = {
    add: jest.fn(),
    getJob: jest.fn(),
  };
  const notificationQueue = new BullNotificationQueue(queue as never);

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(new Date('2026-07-30T10:00:00.000Z'));
    queue.add.mockResolvedValue({});
    remove.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('replaces an existing delayed reminder using a stable job id', async () => {
    queue.getJob.mockResolvedValue({ remove });

    await notificationQueue.scheduleTaskReminder(
      { taskId: 'task-id' },
      new Date('2026-07-30T11:00:00.000Z'),
    );

    expect(queue.getJob).toHaveBeenCalledWith('task-reminder-task-id');
    expect(remove).toHaveBeenCalled();
    expect(queue.add).toHaveBeenCalledWith(
      NotificationJobName.TASK_REMINDER,
      { taskId: 'task-id' },
      expect.objectContaining({
        jobId: 'task-reminder-task-id',
        delay: 3_600_000,
        attempts: 5,
      }),
    );
  });

  it('removes a queued reminder when cancelled', async () => {
    queue.getJob.mockResolvedValue({ remove });

    await notificationQueue.cancelTaskReminder('task-id');

    expect(remove).toHaveBeenCalled();
  });
});
