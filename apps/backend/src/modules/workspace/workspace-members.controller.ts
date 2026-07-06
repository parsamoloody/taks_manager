import {
    Body,
    Controller,
    Delete,
    Param,
    Post,
    UseGuards,
} from '@nestjs/common';
import { WorkspaceMembersService } from './workspace-members.service';
import { AddWorkspaceMemberDto } from './dto/workspace_memeber.dto';
import { JwtGuard } from 'src/guard';
import { GetUser } from 'src/common/decorator';
import type { User } from '@prisma/client';

@Controller('workspaces/:workspaceId/members')
export class WorkspaceMembersController {
    constructor(
        private readonly workspaceMembersService: WorkspaceMembersService,
    ) { }
    @UseGuards(JwtGuard)
    @Post()
    addMember(
        @Param('workspaceId') workspaceId: string,
        @Body() dto: AddWorkspaceMemberDto,
        @GetUser() currentUser: User
    ) {
        return this.workspaceMembersService.addMember(
            workspaceId,
            dto,
            currentUser.id,
        );
    }
    @UseGuards(JwtGuard)
    @Delete(':userId')
    removeMember(
        @Param('workspaceId') workspaceId: string,
        @Param('userId') userId: string,
        @GetUser() currentUser: User
    ) {
        return this.workspaceMembersService.removeMember(
            workspaceId,
            userId,
            currentUser.id,
        );
    }
}