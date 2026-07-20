import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { CreateOrUpdateWorkspaceDto } from './dto/workspace.dto';
import { WorkspaceRole } from '@repo/shared';

@Injectable()
export class WorkspaceService {
  private readonly logger = new Logger(WorkspaceService.name);

  constructor(private prisma: PrismaService) {}

  async createWorkspace(
    userId: string,
    dto: CreateOrUpdateWorkspaceDto,
  ) {
    try {

      if (!userId) {
        throw new BadRequestException('User ID is required');
      }

      if (!dto.name || dto.name.trim() === '') {
        throw new BadRequestException('Workspace name is required');
      }

      const createdWorkspace =
        await this.prisma.workspace.create({
          data: {
            name: dto.name,
            logo: dto.logo?.trim() || null,
            members: {
              create: {
                userId,
                role: WorkspaceRole.OWNER,
              },
            },
          },
          include: {
            members: {
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
            },
          },
        });

      this.logger.log(
        `Workspace created successfully: ${createdWorkspace.id} by user: ${userId}`,
      );

      return createdWorkspace;
    } catch (error) {
      this.handleError(error, 'Failed to create workspace');
    }
  }

  async updateWorkspace(
    userId: string,
    workspaceId: string,
    dto: CreateOrUpdateWorkspaceDto,
  ) {
    try {

      if (!userId || !workspaceId) {
        throw new BadRequestException(
          'User ID and Workspace ID are required',
        );
      }

      if (!dto.name || dto.name.trim() === '') {
        throw new BadRequestException('Workspace name is required');
      }

      await this.ensureOwner(workspaceId, userId);

      const updatedWorkspace =
        await this.prisma.workspace.update({
          where: {
            id: workspaceId,
          },
          data: {
            name: dto.name,
            logo: dto.logo?.trim() || null,
          },
          include: {
            members: {
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
            },
          },
        });

      this.logger.log(
        `Workspace updated successfully: ${workspaceId} by user: ${userId}`,
      );

      return updatedWorkspace;
    } catch (error) {
      this.handleError(error, 'Failed to update workspace');
    }
  }

  async findAll(userId: string) {
    try {

      if (!userId) {
        throw new BadRequestException('User ID is required');
      }

      const workspaces = await this.prisma.workspace.findMany(
        {
          where: {
            members: {
              some: {
                userId,
              },
            },
          },
          include: {
            members: {
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
            },
          },
        },
      );

      this.logger.log(
        `Retrieved ${workspaces.length} workspaces for user: ${userId}`,
      );

      return workspaces;
    } catch (error) {
      this.handleError(
        error,
        'Failed to retrieve workspaces',
      );
    }
  }

  async remove(
    workspaceId: string,
    userId: string,
  ) {
    try {

      if (!workspaceId || !userId) {
        throw new BadRequestException(
          'Workspace ID and User ID are required',
        );
      }

      await this.ensureOwner(workspaceId, userId);

      await this.prisma.workspace.delete({
        where: {
          id: workspaceId,
        },
      });

      this.logger.log(
        `Workspace deleted successfully: ${workspaceId} by user: ${userId}`,
      );

      return {
        message: 'Workspace deleted successfully',
        workspaceId,
      };
    } catch (error) {
      this.handleError(error, 'Failed to delete workspace');
    }
  }

  async update(
    userId: string,
    workspaceId: string,
    dto: CreateOrUpdateWorkspaceDto,
  ) {
    try {

      if (!userId || !workspaceId) {
        throw new BadRequestException(
          'User ID and Workspace ID are required',
        );
      }

      if (!dto.name || dto.name.trim() === '') {
        throw new BadRequestException('Workspace name is required');
      }

      await this.ensureOwner(workspaceId, userId);

      const updatedWorkspace =
        await this.prisma.workspace.update({
          where: {
            id: workspaceId,
          },
          data: {
            name: dto.name,
            logo: dto.logo,
          },
          include: {
            members: true,
          },
        });

      this.logger.log(
        `Workspace updated successfully: ${workspaceId} by user: ${userId}`,
      );

      return updatedWorkspace;
    } catch (error) {
      this.handleError(error, 'Failed to update workspace');
    }
  }

  private async ensureOwner(
    workspaceId: string,
    userId: string,
  ): Promise<void> {
    try {

      if (!workspaceId || !userId) {
        throw new BadRequestException(
          'Workspace ID and User ID are required',
        );
      }

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
        throw new NotFoundException(
          'Workspace not found or user is not a member',
        );
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

      this.logger.error(
        `Error checking workspace ownership: ${error}`,
      );
      throw new InternalServerErrorException(
        'Failed to verify workspace ownership',
      );
    }
  }

  private handleError(error: unknown, context: string): never {

    if (
      error instanceof ForbiddenException ||
      error instanceof NotFoundException ||
      error instanceof BadRequestException
    ) {
      throw error;
    }

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
        throw new BadRequestException(
          'Workspace with this name already exists',
        );
      }
    }

    if (error instanceof Error) {
      this.logger.error(`${context}: ${error.message}`);
    } else {
      this.logger.error(`${context}: Unknown error occurred`);
    }

    throw new InternalServerErrorException(context);
  }
}
