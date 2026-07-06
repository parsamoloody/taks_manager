import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { WorkspaceRole } from '@prisma/client';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { AddWorkspaceMemberDto } from './dto/workspace_memeber.dto';

@Injectable()
export class WorkspaceMembersService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async addMember(
    workspaceId: string,
    dto: AddWorkspaceMemberDto,
    currentUserId: string,
  ) {
    await this.ensureOwner(workspaceId, currentUserId);

    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const exists =
      await this.prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId,
            userId: user.id,
          },
        },
      });

    if (exists) {
      throw new ConflictException(
        'User is already a member',
      );
    }

    return this.prisma.workspaceMember.create({
      data: {
        workspaceId,
        userId: user.id,
        role: WorkspaceRole.MEMBER,
      },
    });
  }

  async removeMember(
    workspaceId: string,
    userId: string,
    currentUserId: string,
  ) {
    await this.ensureOwner(workspaceId, currentUserId);

    if (userId === currentUserId) {
      throw new ForbiddenException(
        'Owner cannot remove themselves',
      );
    }

    await this.prisma.workspaceMember.delete({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });

    return {
      message: 'Member removed successfully',
    };
  }

  private async ensureOwner(
    workspaceId: string,
    userId: string,
  ) {
    const member =
      await this.prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId,
            userId,
          },
        },
      });

    if (!member) {
      throw new NotFoundException('Workspace not found');
    }

    if (member.role !== WorkspaceRole.OWNER) {
      throw new ForbiddenException(
        'Only the workspace owner can manage members',
      );
    }
  }
}