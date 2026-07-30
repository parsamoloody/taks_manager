import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';

import { ActionTokenService } from './action-token.service';
import {
  BullNotificationQueue,
  InMemoryNotificationQueue,
  NotificationQueue,
} from './notification.queue';
import { NotificationService } from './notification.service';
import { NotificationProcessor } from './notification.processor';
import {
  MailService,
  NoopMailService,
  ResendMailService,
} from './mail.service';
import { NOTIFICATION_QUEUE } from './notification.types';

const isTest = process.env.NODE_ENV === 'test';

@Module({
  imports: isTest
    ? []
    : [
        BullModule.forRootAsync({
          inject: [ConfigService],
          useFactory: (config: ConfigService) => ({
            connection: {
              host: config.get<string>('redis.host') ?? 'localhost',
              port: config.get<number>('redis.port') ?? 6379,
              password: config.get<string>('redis.password') || undefined,
            },
          }),
        }),
        BullModule.registerQueue({
          name: NOTIFICATION_QUEUE,
        }),
      ],
  providers: [
    ActionTokenService,
    NotificationService,
    {
      provide: MailService,
      useClass: isTest ? NoopMailService : ResendMailService,
    },
    {
      provide: NotificationQueue,
      useClass: isTest ? InMemoryNotificationQueue : BullNotificationQueue,
    },
    ...(!isTest ? [NotificationProcessor] : []),
  ],
  exports: [ActionTokenService, NotificationService, NotificationQueue],
})
export class NotificationModule {}
