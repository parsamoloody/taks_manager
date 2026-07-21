import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaService } from './common/prisma/prisma.service';
import { PrismaModule } from './common/prisma/prisma.module';
import { AppConfigModule } from './common/config/config.module';
import { WorkspaceModule } from './modules/workspace/workspace.module';
import { BoardModule } from './modules/board/board.module';
import { BoardMemberModule } from './modules/board_member/board_member.module';
import { TaskModule } from './modules/task/task.module';
import { ListModule } from './modules/list/list.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    AppConfigModule,
    WorkspaceModule,
    BoardModule,
    BoardMemberModule,
    TaskModule,
    ListModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
