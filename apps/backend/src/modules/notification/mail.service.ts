import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

import type { MailMessage } from './notification.types';

export abstract class MailService {
  abstract send(message: MailMessage): Promise<void>;
}

@Injectable()
export class ResendMailService extends MailService {
  private readonly resend: Resend;
  private readonly from: string;

  constructor(private readonly config: ConfigService) {
    super();
    this.resend = new Resend(this.config.get<string>('mail.resendApiKey'));
    this.from =
      this.config.get<string>('mail.from') ??
      'Task Manager <onboarding@resend.dev>';
  }

  async send(message: MailMessage): Promise<void> {
    if (!this.config.get<string>('mail.resendApiKey')) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    const { error } = await this.resend.emails.send({
      from: this.from,
      ...message,
    });

    if (error) {
      throw new Error(`Resend rejected the email: ${error.message}`);
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
