import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';

import {
  NOTIFICATION_QUEUE,
  NotificationJobName,
  type PasswordResetJob,
  type TaskReminderJob,
  type WorkspaceInvitationJob,
} from './notification.types';

export abstract class NotificationQueue {
  abstract enqueueWorkspaceInvitation(
    data: WorkspaceInvitationJob,
  ): Promise<void>;

  abstract enqueuePasswordReset(data: PasswordResetJob): Promise<void>;

  abstract scheduleTaskReminder(
    data: TaskReminderJob,
    remindAt: Date,
  ): Promise<void>;

  abstract cancelTaskReminder(taskId: string): Promise<void>;
}

@Injectable()
export class BullNotificationQueue extends NotificationQueue {
  constructor(
    @InjectQueue(NOTIFICATION_QUEUE)
    private readonly queue: Queue,
  ) {
    super();
  }

  async enqueueWorkspaceInvitation(
    data: WorkspaceInvitationJob,
  ): Promise<void> {
    await this.queue.add(
      NotificationJobName.WORKSPACE_INVITATION,
      data,
      this.defaultOptions(),
    );
  }

  async enqueuePasswordReset(data: PasswordResetJob): Promise<void> {
    await this.queue.add(
      NotificationJobName.PASSWORD_RESET,
      data,
      this.defaultOptions(),
    );
  }

  async scheduleTaskReminder(
    data: TaskReminderJob,
    remindAt: Date,
  ): Promise<void> {
    const jobId = this.taskReminderJobId(data.taskId);
    const existingJob = await this.queue.getJob(jobId);

    if (existingJob) {
      await existingJob.remove();
    }

    await this.queue.add(NotificationJobName.TASK_REMINDER, data, {
      ...this.defaultOptions(),
      jobId,
      delay: Math.max(0, remindAt.getTime() - Date.now()),
    });
  }

  async cancelTaskReminder(taskId: string): Promise<void> {
    const job = await this.queue.getJob(this.taskReminderJobId(taskId));

    if (job) {
      await job.remove();
    }
  }

  private defaultOptions() {
    return {
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 5_000,
      },
      removeOnComplete: 100,
      removeOnFail: 1_000,
    };
  }

  private taskReminderJobId(taskId: string): string {
    return `task-reminder-${taskId}`;
  }
}

@Injectable()
export class InMemoryNotificationQueue extends NotificationQueue {
  readonly invitations: WorkspaceInvitationJob[] = [];
  readonly passwordResets: PasswordResetJob[] = [];
  readonly taskReminders = new Map<
    string,
    { data: TaskReminderJob; remindAt: Date }
  >();

  enqueueWorkspaceInvitation(data: WorkspaceInvitationJob): Promise<void> {
    this.invitations.push(data);
    return Promise.resolve();
  }

  enqueuePasswordReset(data: PasswordResetJob): Promise<void> {
    this.passwordResets.push(data);
    return Promise.resolve();
  }

  scheduleTaskReminder(data: TaskReminderJob, remindAt: Date): Promise<void> {
    this.taskReminders.set(data.taskId, { data, remindAt });
    return Promise.resolve();
  }

  cancelTaskReminder(taskId: string): Promise<void> {
    this.taskReminders.delete(taskId);
    return Promise.resolve();
  }
}
