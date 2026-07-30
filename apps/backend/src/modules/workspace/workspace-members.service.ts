import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { WorkspaceRole } from '@prisma/client';
import { ActionTokenType } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { AddWorkspaceMemberDto } from './dto/workspace_memeber.dto';
import { ActionTokenService } from '../notification/action-token.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class WorkspaceMembersService {
  private readonly logger = new Logger(WorkspaceMembersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly actionTokens: ActionTokenService,
    private readonly notifications: NotificationService,
  ) {}

  async inviteMember(
    workspaceId: string,
    dto: AddWorkspaceMemberDto,
    currentUserId: string,
  ) {
    try {
      const email = dto.email.trim().toLowerCase();
      await this.ensureOwner(workspaceId, currentUserId);

      const [workspace, inviter, invitedUser] = await Promise.all([
        this.prisma.workspace.findUnique({
          where: { id: workspaceId },
          select: { name: true },
        }),
        this.prisma.user.findUnique({
          where: { id: currentUserId },
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        }),
        this.prisma.user.findUnique({
          where: { email },
          select: { id: true },
        }),
      ]);

      if (!workspace || !inviter) {
        throw new NotFoundException('Workspace or inviter not found');
      }

      if (invitedUser) {
        const existingMember = await this.prisma.workspaceMember.findUnique({
          where: {
            workspaceId_userId: {
              workspaceId,
              userId: invitedUser.id,
            },
          },
        });

        if (existingMember) {
          throw new ConflictException(
            'User is already a member of this workspace',
          );
        }
      }

      const ttlHours =
        this.config.get<number>('notifications.invitationTtlHours') ?? 168;
      const { token, record } = await this.actionTokens.issue({
        type: ActionTokenType.WORKSPACE_INVITATION,
        email,
        workspaceId,
        ttlMs: ttlHours * 60 * 60_000,
      });
      const inviterName =
        [inviter.firstName, inviter.lastName].filter(Boolean).join(' ') ||
        inviter.email;

      await this.notifications.sendWorkspaceInvitation({
        to: email,
        workspaceName: workspace.name,
        inviterName,
        token,
        expiresAt: record.expiresAt,
      });

      return {
        message: 'Workspace invitation queued',
        expiresAt: record.expiresAt,
      };
    } catch (error) {
      this.handleError(error, 'Failed to invite workspace member');
    }
  }

  async acceptInvitation(tokenValue: string, currentUserId: string) {
    try {
      const token = await this.actionTokens.findValid(
        tokenValue,
        ActionTokenType.WORKSPACE_INVITATION,
      );
      const user = await this.prisma.user.findUnique({
        where: { id: currentUserId },
        select: { id: true, email: true },
      });

      if (!user || user.email.toLowerCase() !== token.email.toLowerCase()) {
        throw new ForbiddenException(
          'This invitation belongs to another email address',
        );
      }

      if (!token.workspaceId) {
        throw new BadRequestException('Invitation is invalid');
      }

      const workspaceId = token.workspaceId;
      const existingMember = await this.prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId,
            userId: user.id,
          },
        },
      });

      if (existingMember) {
        throw new ConflictException(
          'User is already a member of this workspace',
        );
      }

      const member = await this.prisma.$transaction(async (transaction) => {
        const consumed = await transaction.actionToken.updateMany({
          where: {
            id: token.id,
            usedAt: null,
            expiresAt: { gt: new Date() },
          },
          data: { usedAt: new Date() },
        });

        if (consumed.count !== 1) {
          throw new BadRequestException('Token is invalid or expired');
        }

        return transaction.workspaceMember.create({
          data: {
            workspaceId,
            userId: user.id,
            role: WorkspaceRole.MEMBER,
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        });
      });

      await this.syncWorkspaceBoardMembers(workspaceId);
      return member;
    } catch (error) {
      this.handleError(error, 'Failed to accept workspace invitation');
    }
  }

  async addMember(
    workspaceId: string,
    dto: AddWorkspaceMemberDto,
    currentUserId: string,
  ) {
    try {
      // Validate inputs
      if (!workspaceId || !currentUserId) {
        throw new BadRequestException('Workspace ID and User ID are required');
      }

      if (!dto.email) {
        throw new BadRequestException('Email is required');
      }

      // Verify current user is owner
      await this.ensureOwner(workspaceId, currentUserId);

      // Find user by email
      const user = await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });

      if (!user) {
        throw new NotFoundException('User with this email does not exist');
      }

      // Check if already a member
      const exists = await this.prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId,
            userId: user.id,
          },
        },
      });

      if (exists) {
        throw new ConflictException(
          'User is already a member of this workspace',
        );
      }

      // Add member
      const member = await this.prisma.workspaceMember.create({
        data: {
          workspaceId,
          userId: user.id,
          role: WorkspaceRole.MEMBER,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      await this.syncWorkspaceBoardMembers(workspaceId);

      this.logger.log(`User ${user.id} added to workspace ${workspaceId}`);

      return member;
    } catch (error) {
      this.handleError(error, 'Failed to add member to workspace');
    }
  }

  async findAll(workspaceId: string) {
    try {
      // Validate input
      if (!workspaceId) {
        throw new BadRequestException('Workspace ID is required');
      }

      // Verify workspace exists
      const workspace = await this.prisma.workspace.findUnique({
        where: {
          id: workspaceId,
        },
      });

      if (!workspace) {
        throw new NotFoundException('Workspace not found');
      }

      const members = await this.prisma.workspaceMember.findMany({
        where: {
          workspaceId,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: {
          joinedAt: 'desc',
        },
      });

      this.logger.log(
        `Retrieved ${members.length} members for workspace ${workspaceId}`,
      );

      return members;
    } catch (error) {
      this.handleError(error, 'Failed to retrieve workspace members');
    }
  }

  async findOne(workspaceId: string, userId: string) {
    try {
      // Validate inputs
      if (!workspaceId || !userId) {
        throw new BadRequestException('Workspace ID and User ID are required');
      }

      const member = await this.prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId,
            userId,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      if (!member) {
        throw new NotFoundException('Member not found in this workspace');
      }

      this.logger.log(
        `Retrieved member ${userId} from workspace ${workspaceId}`,
      );

      return member;
    } catch (error) {
      this.handleError(error, 'Failed to retrieve workspace member');
    }
  }

  async removeMember(
    workspaceId: string,
    userId: string,
    currentUserId: string,
  ) {
    try {
      // Validate inputs
      if (!workspaceId || !userId || !currentUserId) {
        throw new BadRequestException(
          'Workspace ID, User ID, and current User ID are required',
        );
      }

      // Verify current user is owner
      await this.ensureOwner(workspaceId, currentUserId);

      // Prevent self-removal
      if (userId === currentUserId) {
        throw new ForbiddenException(
          'Owner cannot remove themselves from workspace',
        );
      }

      // Verify member exists
      const member = await this.prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId,
            userId,
          },
        },
      });

      if (!member) {
        throw new NotFoundException('Member not found in this workspace');
      }

      // Remove member
      await this.prisma.workspaceMember.delete({
        where: {
          workspaceId_userId: {
            workspaceId,
            userId,
          },
        },
      });

      await this.syncWorkspaceBoardMembers(workspaceId);

      this.logger.log(`User ${userId} removed from workspace ${workspaceId}`);

      return {
        message: 'Member removed successfully',
        userId,
        workspaceId,
      };
    } catch (error) {
      this.handleError(error, 'Failed to remove member from workspace');
    }
  }

  private async ensureOwner(
    workspaceId: string,
    userId: string,
  ): Promise<void> {
    try {
      // Validate inputs
      if (!workspaceId || !userId) {
        throw new BadRequestException('Workspace ID and User ID are required');
      }

      const member = await this.prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId,
            userId,
          },
        },
      });

      if (!member) {
        throw new NotFoundException('You are not a member of this workspace');
      }

      if (member.role !== WorkspaceRole.OWNER) {
        throw new ForbiddenException(
          'Only the workspace owner can perform this action',
        );
      }
    } catch (error) {
      if (
        error instanceof ForbiddenException ||
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(`Error checking workspace ownership: ${error}`);
      throw new InternalServerErrorException(
        'Failed to verify workspace ownership',
      );
    }
  }

  private async syncWorkspaceBoardMembers(workspaceId: string): Promise<void> {
    const [workspaceMembers, boards] = await Promise.all([
      this.prisma.workspaceMember.findMany({
        where: { workspaceId },
        select: { userId: true },
      }),
      this.prisma.board.findMany({
        where: {
          workspaceId,
          visibility: { not: 'PRIVATE' },
        },
        select: { id: true },
      }),
    ]);
    const userIds = workspaceMembers.map((member) => member.userId);

    await this.prisma.$transaction(
      boards.flatMap((board) => [
        this.prisma.boardMember.deleteMany({
          where: {
            boardId: board.id,
            userId: { notIn: userIds },
          },
        }),
        this.prisma.boardMember.createMany({
          data: userIds.map((userId) => ({ boardId: board.id, userId })),
          skipDuplicates: true,
        }),
      ]),
    );
  }

  private handleError(error: unknown, context: string): never {
    // Re-throw known HTTP exceptions
    if (
      error instanceof ForbiddenException ||
      error instanceof NotFoundException ||
      error instanceof ConflictException ||
      error instanceof BadRequestException
    ) {
      throw error;
    }

    // Handle Prisma-specific errors
    if (error instanceof PrismaClientKnownRequestError) {
      this.logger.error(`Prisma error in ${context}: ${error.message}`);

      if (error.code === 'P2025') {
        throw new NotFoundException('Resource not found');
      }

      if (error.code === 'P2003') {
        throw new BadRequestException('Invalid reference to related resource');
      }
    }

    // Log generic errors
    if (error instanceof Error) {
      this.logger.error(`${context}: ${error.message}`);
    } else {
      this.logger.error(`${context}: Unknown error occurred`);
    }

    throw new InternalServerErrorException(context);
  }
}
