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
import { AddBoardMemberDto } from './dto/create_board_member.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class BoardMemberService {
  private readonly logger = new Logger(BoardMemberService.name);

  constructor(private readonly prisma: PrismaService) {}

  async addMember(
    boardId: string,
    dto: AddBoardMemberDto,
    currentUserId: string,
  ) {
    try {
      // Validate inputs
      if (!boardId || !currentUserId) {
        throw new BadRequestException(
          'Board ID and User ID are required',
        );
      }

      if (!dto.email) {
        throw new BadRequestException('Email is required');
      }

      // Verify current user has access to board
      await this.ensureBoardAccess(boardId, currentUserId);

      // Find user by email
      const user = await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });

      if (!user) {
        this.logger.warn(
          `User not found with email: ${dto.email}`,
        );
        throw new NotFoundException(
          'User with this email does not exist',
        );
      }

      const board = await this.prisma.board.findUnique({
        where: { id: boardId },
        select: { workspaceId: true },
      });
      const workspaceMember = board
        ? await this.prisma.workspaceMember.findUnique({
            where: {
              workspaceId_userId: {
                workspaceId: board.workspaceId,
                userId: user.id,
              },
            },
          })
        : null;

      if (!workspaceMember) {
        throw new BadRequestException(
          'User must be a workspace member before joining this board',
        );
      }

      // Check if user already has access
      const existingMember =
        await this.prisma.boardMember.findUnique({
          where: {
            boardId_userId: {
              boardId,
              userId: user.id,
            },
          },
        });

      if (existingMember) {
        throw new ConflictException(
          'User already has access to this board',
        );
      }

      // Add user to board
      const newMember = await this.prisma.boardMember.create({
        data: {
          boardId,
          userId: user.id,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });

      this.logger.log(
        `User ${user.id} added to board ${boardId} by user ${currentUserId}`,
      );

      return newMember;
    } catch (error) {
      this.handleError(
        error,
        'Failed to add member to board',
      );
    }
  }

  async findAll(boardId: string, currentUserId: string) {
    try {
      // Validate input
      if (!boardId) {
        throw new BadRequestException('Board ID is required');
      }

      await this.ensureBoardAccess(boardId, currentUserId);

      const members =
        await this.prisma.boardMember.findMany({
          where: {
            boardId,
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        });

      this.logger.log(
        `Retrieved ${members.length} members for board: ${boardId}`,
      );

      return members;
    } catch (error) {
      this.handleError(error, 'Failed to retrieve board members');
    }
  }

  async removeMember(
    boardId: string,
    userId: string,
    currentUserId: string,
  ) {
    try {
      // Validate inputs
      if (!boardId || !userId || !currentUserId) {
        throw new BadRequestException(
          'Board ID, User ID, and current User ID are required',
        );
      }

      // Verify current user has access to board
      await this.ensureBoardAccess(boardId, currentUserId);

      // Prevent self-removal
      if (userId === currentUserId) {
        throw new ForbiddenException(
          'You cannot remove yourself from the board',
        );
      }

      // Find the member to remove
      const member =
        await this.prisma.boardMember.findUnique({
          where: {
            boardId_userId: {
              boardId,
              userId,
            },
          },
        });

      if (!member) {
        throw new NotFoundException(
          'Board member not found',
        );
      }

      // Remove member from board
      await this.prisma.boardMember.delete({
        where: {
          boardId_userId: {
            boardId,
            userId,
          },
        },
      });

      this.logger.log(
        `User ${userId} removed from board ${boardId} by user ${currentUserId}`,
      );

      return {
        message: 'Member removed successfully',
        userId,
        boardId,
      };
    } catch (error) {
      this.handleError(error, 'Failed to remove member from board');
    }
  }

  private async ensureBoardAccess(
    boardId: string,
    userId: string,
  ): Promise<void> {
    try {
      // Validate inputs
      if (!boardId || !userId) {
        throw new BadRequestException(
          'Board ID and User ID are required',
        );
      }

      // Fetch board with workspace info
      const board = await this.prisma.board.findUnique({
        where: {
          id: boardId,
        },
        include: {
          workspace: {
            include: {
              members: true,
            },
          },
        },
      });

      if (!board) {
        throw new NotFoundException('Board not found');
      }

      // Check if user is a workspace member
      const isWorkspaceMember =
        board.workspace.members.some(
          (member) => member.userId === userId,
        );

      if (!isWorkspaceMember) {
        throw new ForbiddenException(
          'You are not a member of this workspace',
        );
      }

      // For private boards, check if user is a board member
      if (board.visibility === 'PRIVATE') {
        const boardMember =
          await this.prisma.boardMember.findUnique({
            where: {
              boardId_userId: {
                boardId,
                userId,
              },
            },
          });

        if (!boardMember) {
          throw new ForbiddenException(
            'You do not have access to this private board',
          );
        }
      }
    } catch (error) {
      if (
        error instanceof ForbiddenException ||
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(
        `Error checking board access: ${error}`,
      );
      throw new InternalServerErrorException(
        'Failed to verify board access',
      );
    }
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
      this.logger.error(
        `Prisma error in ${context}: ${error.message}`,
      );

      if (error.code === 'P2025') {
        throw new NotFoundException('Resource not found');
      }

      if (error.code === 'P2003') {
        throw new BadRequestException(
          'Invalid reference to related resource',
        );
      }

      if (error.code === 'P2002') {
        throw new ConflictException(
          'This resource already exists',
        );
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
