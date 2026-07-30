import { Processor, WorkerHost } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import type { Job } from 'bullmq';

import { PrismaService } from 'src/common/prisma/prisma.service';

import { MailService } from './mail.service';
import {
  NOTIFICATION_QUEUE,
  NotificationJobName,
  type NotificationJobData,
  type PasswordResetJob,
  type TaskReminderJob,
  type WorkspaceInvitationJob,
} from './notification.types';
import {
  passwordResetTemplate,
  taskReminderTemplate,
  workspaceInvitationTemplate,
} from './templates';

@Processor(NOTIFICATION_QUEUE)
export class NotificationProcessor extends WorkerHost {
  constructor(
    private readonly mail: MailService,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    super();
  }

  async process(job: Job<NotificationJobData>): Promise<void> {
    const jobName = job.name as NotificationJobName;

    switch (jobName) {
      case NotificationJobName.WORKSPACE_INVITATION:
        return this.sendWorkspaceInvitation(job.data as WorkspaceInvitationJob);
      case NotificationJobName.PASSWORD_RESET:
        return this.sendPasswordReset(job.data as PasswordResetJob);
      case NotificationJobName.TASK_REMINDER:
        return this.sendTaskReminder(job.data as TaskReminderJob);
      default:
        throw new Error(`Unsupported notification job: ${job.name}`);
    }
  }

  private async sendWorkspaceInvitation(
    data: WorkspaceInvitationJob,
  ): Promise<void> {
    const template = workspaceInvitationTemplate(data);
    await this.mail.send({ to: data.to, ...template });
  }

  private async sendPasswordReset(data: PasswordResetJob): Promise<void> {
    const template = passwordResetTemplate(data);
    await this.mail.send({ to: data.to, ...template });
  }

  private async sendTaskReminder(data: TaskReminderJob): Promise<void> {
    const task = await this.prisma.task.findUnique({
      where: { id: data.taskId },
      include: {
        assignee: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        list: {
          include: {
            board: {
              include: {
                workspace: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (
      !task ||
      !task.dueDate ||
      task.status === 'DONE' ||
      task.assignee.length === 0
    ) {
      return;
    }

    const baseUrl =
      this.config.get<string>('app.frontBaseUrl') ?? 'http://localhost:3000';
    const taskUrl = new URL(
      `/workspaces/${task.list.board.workspace.id}/board/${task.list.board.id}`,
      `${baseUrl.replace(/\/$/, '')}/`,
    );
    taskUrl.searchParams.set('taskId', task.id);

    const template = taskReminderTemplate({
      taskTitle: task.title,
      workspaceName: task.list.board.workspace.name,
      dueDate: task.dueDate,
      taskUrl: taskUrl.toString(),
    });

    await Promise.all(
      task.assignee.map(({ user }) =>
        this.mail.send({ to: user.email, ...template }),
      ),
    );
  }
}
