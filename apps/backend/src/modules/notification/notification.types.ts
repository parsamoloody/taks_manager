export const NOTIFICATION_QUEUE = 'notifications';

export enum NotificationJobName {
  WORKSPACE_INVITATION = 'workspace-invitation',
  PASSWORD_RESET = 'password-reset',
  TASK_REMINDER = 'task-reminder',
}

export interface WorkspaceInvitationJob {
  to: string;
  workspaceName: string;
  boardName?: string;
  inviterName: string;
  inviteUrl: string;
  expiresAt: string;
}

export interface PasswordResetJob {
  to: string;
  resetUrl: string;
  expiresAt: string;
}

export interface TaskReminderJob {
  taskId: string;
}

export type NotificationJobData =
  WorkspaceInvitationJob | PasswordResetJob | TaskReminderJob;

export interface MailMessage {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
}
