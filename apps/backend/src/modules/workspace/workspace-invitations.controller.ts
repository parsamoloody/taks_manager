import {
  Body,
  Controller,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import type { User } from '@prisma/client';

import { GetUser } from 'src/common/decorator';
import { JwtGuard } from 'src/guard';

import {
  AcceptWorkspaceInvitationDto,
  AddWorkspaceMemberDto,
} from './dto/workspace_memeber.dto';
import { WorkspaceMembersService } from './workspace-members.service';

@ApiTags('Workspace Invitations')
@ApiBearerAuth()
@Controller()
export class WorkspaceInvitationsController {
  constructor(
    private readonly workspaceMembersService: WorkspaceMembersService,
  ) {}

  @UseGuards(JwtGuard)
  @Post('workspaces/:workspaceId/invitations')
  @HttpCode(202)
  @ApiOperation({ summary: 'Invite someone to a workspace by email' })
  @ApiParam({ name: 'workspaceId', description: 'Workspace identifier' })
  @ApiBody({ type: AddWorkspaceMemberDto })
  invite(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: AddWorkspaceMemberDto,
    @GetUser() currentUser: User,
  ) {
    return this.workspaceMembersService.inviteMember(
      workspaceId,
      dto,
      currentUser.id,
    );
  }

  @UseGuards(JwtGuard)
  @Post('boards/:boardId/invitations')
  @HttpCode(202)
  @ApiOperation({ summary: 'Invite someone to a board by email' })
  @ApiParam({ name: 'boardId', description: 'Board identifier' })
  @ApiBody({ type: AddWorkspaceMemberDto })
  inviteToBoard(
    @Param('boardId') boardId: string,
    @Body() dto: AddWorkspaceMemberDto,
    @GetUser() currentUser: User,
  ) {
    return this.workspaceMembersService.inviteBoardMember(
      boardId,
      dto,
      currentUser.id,
    );
  }

  @UseGuards(JwtGuard)
  @Post('workspace-invitations/accept')
  @HttpCode(200)
  @ApiOperation({ summary: 'Accept a workspace invitation' })
  @ApiBody({ type: AcceptWorkspaceInvitationDto })
  accept(
    @Body() dto: AcceptWorkspaceInvitationDto,
    @GetUser() currentUser: User,
  ) {
    return this.workspaceMembersService.acceptInvitation(
      dto.token,
      currentUser.id,
    );
  }
}
