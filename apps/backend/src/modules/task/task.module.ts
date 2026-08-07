import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { NotificationModule } from '../notification/notification.module';
import { TaskAiService } from './task-ai.service';

@Module({
  imports: [NotificationModule, ConfigModule],
  controllers: [TaskController],
  providers: [TaskService, TaskAiService],
})
export class TaskModule {}
