import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { NotificationQueue } from './notification.queue';

@Injectable()
export class NotificationService {
  constructor(
    private readonly queue: NotificationQueue,
    private readonly config: ConfigService,
  ) {}

  async sendWorkspaceInvitation(input: {
    to: string;
    workspaceName: string;
    boardName?: string;
    inviterName: string;
    token: string;
    expiresAt: Date;
  }): Promise<void> {
    await this.queue.enqueueWorkspaceInvitation({
      to: input.to,
      workspaceName: input.workspaceName,
      ...(input.boardName ? { boardName: input.boardName } : {}),
      inviterName: input.inviterName,
      inviteUrl: this.frontendUrl('/invitations/accept', input.token),
      expiresAt: input.expiresAt.toISOString(),
    });
  }

  async sendPasswordReset(input: {
    to: string;
    token: string;
    expiresAt: Date;
  }): Promise<void> {
    await this.queue.enqueuePasswordReset({
      to: input.to,
      resetUrl: this.frontendUrl('/reset-password', input.token),
      expiresAt: input.expiresAt.toISOString(),
    });
  }

  async syncTaskReminder(input: {
    taskId: string;
    dueDate: Date | null;
    status: string;
    assigneeCount: number;
  }): Promise<void> {
    if (
      !input.dueDate ||
      input.status === 'DONE' ||
      input.assigneeCount === 0
    ) {
      await this.queue.cancelTaskReminder(input.taskId);
      return;
    }

    const leadMinutes =
      this.config.get<number>('notifications.taskReminderLeadMinutes') ?? 60;
    const remindAt = new Date(input.dueDate.getTime() - leadMinutes * 60_000);

    await this.queue.scheduleTaskReminder({ taskId: input.taskId }, remindAt);
  }

  cancelTaskReminder(taskId: string): Promise<void> {
    return this.queue.cancelTaskReminder(taskId);
  }

  private frontendUrl(path: string, token: string): string {
    const baseUrl =
      this.config.get<string>('app.frontBaseUrl') ?? 'http://localhost:3000';
    const url = new URL(path, `${baseUrl.replace(/\/$/, '')}/`);
    url.searchParams.set('token', token);
    return url.toString();
  }
}
