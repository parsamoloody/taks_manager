import { Module } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { WorkspaceController } from './workspace.controller';
import { WorkspaceMembersService } from './workspace-members.service';
import { WorkspaceMembersController } from './workspace-members.controller';

@Module({
  controllers:[WorkspaceController, WorkspaceMembersController],
  providers: [WorkspaceService, WorkspaceMembersService],
})
export class WorkspaceModule {}
