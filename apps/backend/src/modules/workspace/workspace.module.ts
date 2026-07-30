import { Module } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { WorkspaceController } from './workspace.controller';
import { WorkspaceMembersService } from './workspace-members.service';
import { WorkspaceMembersController } from './workspace-members.controller';
import { WorkspaceInvitationsController } from './workspace-invitations.controller';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [NotificationModule],
  controllers: [
    WorkspaceController,
    WorkspaceMembersController,
    WorkspaceInvitationsController,
  ],
  providers: [WorkspaceService, WorkspaceMembersService],
})
export class WorkspaceModule {}
