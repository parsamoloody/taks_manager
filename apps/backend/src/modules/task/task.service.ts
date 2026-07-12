import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { PrismaService } from 'src/common/prisma/prisma.service';

import type { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(boardId: string, listId: string, userId: string, dto: CreateTaskDto) {
    try {
      if (!boardId || !listId || !userId) {
        throw new BadRequestException('Board ID, List ID, and User ID are required');
      }

      if (!dto?.title?.trim()) {
        throw new BadRequestException('Task title is required');
      }

      if (!Number.isInteger(dto.order)) {
        throw new BadRequestException('Task order must be an integer');
      }

      await this.ensureBoardAccess(boardId, userId);
      await this.ensureListInBoard(boardId, listId);

      const task = await this.prisma.task.create({
        data: {
          listId,
          title: dto.title.trim(),
          description: dto.description?.trim() || null,
          order: dto.order,
          priority: dto.priority ?? 'MEDIUM',
          startDate: dto.startDate ?? undefined,
          dueDate: dto.dueDate ?? undefined,
          createdById: userId,
        },
      });

      this.logger.log(`Task created successfully: ${task.id}`);
      return task;
    } catch (error) {
      this.handleError(error, 'Failed to create task');
    }
  }

  async findAll(boardId: string, listId: string, userId: string) {
    try {
      if (!boardId || !listId || !userId) {
        throw new BadRequestException('Board ID, List ID, and User ID are required');
      }

      await this.ensureBoardAccess(boardId, userId);
      await this.ensureListInBoard(boardId, listId);

      return this.prisma.task.findMany({
        where: { listId },
        orderBy: { order: 'asc' },
      });
    } catch (error) {
      this.handleError(error, 'Failed to retrieve tasks');
    }
  }

  async findOne(boardId: string, listId: string, taskId: string, userId: string) {
    try {
      if (!boardId || !listId || !taskId || !userId) {
        throw new BadRequestException('Board ID, List ID, Task ID, and User ID are required');
      }

      await this.ensureBoardAccess(boardId, userId);
      await this.ensureListInBoard(boardId, listId);

      const task = await this.prisma.task.findFirst({
        where: {
          id: taskId,
          listId,
        },
      });

      if (!task) {
        throw new NotFoundException('Task not found');
      }

      return task;
    } catch (error) {
      this.handleError(error, 'Failed to retrieve task');
    }
  }

  async update(boardId: string, listId: string, taskId: string, userId: string, dto: UpdateTaskDto) {
    try {
      if (!boardId || !listId || !taskId || !userId) {
        throw new BadRequestException('Board ID, List ID, Task ID, and User ID are required');
      }

      if (!dto || Object.keys(dto).length === 0) {
        throw new BadRequestException('At least one field is required');
      }

      if (dto.title !== undefined && !dto.title.trim()) {
        throw new BadRequestException('Task title is required');
      }

      if (dto.order !== undefined && !Number.isInteger(dto.order)) {
        throw new BadRequestException('Task order must be an integer');
      }

      await this.ensureBoardAccess(boardId, userId);
      await this.ensureListInBoard(boardId, listId);

      const existingTask = await this.prisma.task.findFirst({
        where: {
          id: taskId,
          listId,
        },
      });

      if (!existingTask) {
        throw new NotFoundException('Task not found');
      }

      const updatedTask = await this.prisma.task.update({
        where: { id: taskId },
        data: {
          ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
          ...(dto.description !== undefined ? { description: dto.description?.trim() || null } : {}),
          ...(dto.order !== undefined ? { order: dto.order } : {}),
          ...(dto.priority !== undefined ? { priority: dto.priority } : {}),
          ...(dto.startDate !== undefined ? { startDate: dto.startDate ?? null } : {}),
          ...(dto.dueDate !== undefined ? { dueDate: dto.dueDate ?? null } : {}),
          ...(dto.status !== undefined ? { status: dto.status } : {}),
        },
      });

      this.logger.log(`Task updated successfully: ${taskId}`);
      return updatedTask;
    } catch (error) {
      this.handleError(error, 'Failed to update task');
    }
  }

  async remove(boardId: string, listId: string, taskId: string, userId: string) {
    try {
      if (!boardId || !listId || !taskId || !userId) {
        throw new BadRequestException('Board ID, List ID, Task ID, and User ID are required');
      }

      await this.ensureBoardAccess(boardId, userId);
      await this.ensureListInBoard(boardId, listId);

      const existingTask = await this.prisma.task.findFirst({
        where: {
          id: taskId,
          listId,
        },
      });

      if (!existingTask) {
        throw new NotFoundException('Task not found');
      }

      await this.prisma.task.delete({
        where: { id: taskId },
      });

      this.logger.log(`Task deleted successfully: ${taskId}`);
      return {
        message: 'Task deleted successfully',
        taskId,
        listId,
        boardId,
      };
    } catch (error) {
      this.handleError(error, 'Failed to delete task');
    }
  }

  private async ensureBoardAccess(boardId: string, userId: string): Promise<void> {
    try {
      const board = await this.prisma.board.findUnique({
        where: { id: boardId },
        include: {
          workspace: {
            include: {
              members: true,
            },
          },
          members: true,
        },
      });

      if (!board) {
        throw new NotFoundException('Board not found');
      }

      const isWorkspaceMember = board.workspace.members.some(
        (member) => member.userId === userId,
      );

      if (!isWorkspaceMember) {
        throw new ForbiddenException('You are not a member of this workspace');
      }

      if (board.visibility === 'PRIVATE') {
        const isBoardMember = board.members.some((member) => member.userId === userId);

        if (!isBoardMember) {
          throw new ForbiddenException('You do not have access to this private board');
        }
      }
    } catch (error) {
      if (error instanceof ForbiddenException || error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(`Error checking board access: ${error}`);
      throw new InternalServerErrorException('Failed to verify board access');
    }
  }

  private async ensureListInBoard(boardId: string, listId: string): Promise<void> {
    try {
      const list = await this.prisma.list.findFirst({
        where: {
          id: listId,
          boardId,
        },
      });

      if (!list) {
        throw new NotFoundException('List not found in this board');
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(`Error checking list access: ${error}`);
      throw new InternalServerErrorException('Failed to verify list access');
    }
  }

  private handleError(error: unknown, context: string): never {
    if (error instanceof ForbiddenException) {
      throw error;
    }

    if (error instanceof NotFoundException) {
      throw error;
    }

    if (error instanceof BadRequestException) {
      throw error;
    }

    if (error instanceof PrismaClientKnownRequestError) {
      this.logger.error(`Prisma error in ${context}: ${error.message}`);

      if (error.code === 'P2025') {
        throw new NotFoundException('Resource not found');
      }

      if (error.code === 'P2003') {
        throw new BadRequestException('Invalid foreign key reference');
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
