import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

import type { MailMessage } from './notification.types';

export abstract class MailService {
  abstract send(message: MailMessage): Promise<void>;
}

@Injectable()
export class ResendMailService extends MailService {
  private readonly logger = new Logger(ResendMailService.name);
  private resend?: Resend;
  private readonly from: string;

  constructor(private readonly config: ConfigService) {
    super();
    this.from =
      this.config.get<string>('mail.from') ??
      'Task Manager <onboarding@resend.dev>';
  }

  async send(message: MailMessage): Promise<void> {
    const apiKey = this.config.get<string>('mail.resendApiKey');
    if (!apiKey) {
      this.logger.warn(
        'RESEND_API_KEY is not configured. Skipping email delivery for %s.',
        message.to,
      );
      return;
    }

    try {
      this.resend ??= new Resend(apiKey);
      const { error } = await this.resend.emails.send({
        from: this.from,
        ...message,
      });

      if (error) {
        throw new Error(`Resend rejected the email: ${error.message}`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${String(message.to)}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }
}

@Injectable()
export class NoopMailService extends MailService {
  private readonly logger = new Logger(NoopMailService.name);

  send(message: MailMessage): Promise<void> {
    this.logger.debug(`Skipped email to ${String(message.to)} in test mode`);
    return Promise.resolve();
  }
}
