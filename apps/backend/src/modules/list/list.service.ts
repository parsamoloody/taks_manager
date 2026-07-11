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
import type { CreateListDto, UpdateListDto } from './dto/list.dto';

@Injectable()
export class ListService {
    private readonly logger = new Logger(ListService.name);

    constructor(private readonly prisma: PrismaService) { }

    async create(boardId: string, userId: string, dto: CreateListDto) {
        try {
            if (!boardId || !userId) {
                throw new BadRequestException('Board ID and User ID are required');
            }

            if (!dto?.title?.trim()) {
                throw new BadRequestException('List title is required');
            }

            if (!Number.isInteger(dto.order)) {
                throw new BadRequestException('List order must be an integer');
            }

            await this.ensureBoardAccess(boardId, userId);

            const list = await this.prisma.list.create({
                data: {
                    boardId,
                    title: dto.title.trim(),
                    order: dto.order,
                },
            });

            this.logger.log(`List created successfully: ${list.id}`);
            return list;
        } catch (error) {
            this.handleError(error, 'Failed to create list');
        }
    }

    async findAll(boardId: string, userId: string) {
        try {
            if (!boardId || !userId) {
                throw new BadRequestException('Board ID and User ID are required');
            }

            await this.ensureBoardAccess(boardId, userId);

            return this.prisma.list.findMany({
                where: { boardId },
                orderBy: { order: 'asc' },
            });
        } catch (error) {
            this.handleError(error, 'Failed to retrieve lists');
        }
    }

    async findOne(boardId: string, listId: string, userId: string) {
        try {
            if (!boardId || !listId || !userId) {
                throw new BadRequestException('Board ID, List ID, and User ID are required');
            }

            await this.ensureBoardAccess(boardId, userId);

            const list = await this.prisma.list.findFirst({
                where: {
                    id: listId,
                    boardId,
                },
            });

            if (!list) {
                throw new NotFoundException('List not found');
            }

            return list;
        } catch (error) {
            this.handleError(error, 'Failed to retrieve list');
        }
    }

    async update(boardId: string, listId: string, userId: string, dto: UpdateListDto) {
        try {
            if (!boardId || !listId || !userId) {
                throw new BadRequestException('Board ID, List ID, and User ID are required');
            }

            if (!dto || Object.keys(dto).length === 0) {
                throw new BadRequestException('At least one field is required');
            }

            if (dto.title !== undefined && !dto.title.trim()) {
                throw new BadRequestException('List title is required');
            }

            if (dto.order !== undefined && !Number.isInteger(dto.order)) {
                throw new BadRequestException('List order must be an integer');
            }

            await this.ensureBoardAccess(boardId, userId);

            const existingList = await this.prisma.list.findFirst({
                where: {
                    id: listId,
                    boardId,
                },
            });

            if (!existingList) {
                throw new NotFoundException('List not found');
            }

            const updatedList = await this.prisma.list.update({
                where: {
                    id: listId,
                },
                data: {
                    ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
                    ...(dto.order !== undefined ? { order: dto.order } : {}),
                },
            });

            this.logger.log(`List updated successfully: ${listId}`);
            return updatedList;
        } catch (error) {
            this.handleError(error, 'Failed to update list');
        }
    }

    async remove(boardId: string, listId: string, userId: string) {
        try {
            if (!boardId || !listId || !userId) {
                throw new BadRequestException('Board ID, List ID, and User ID are required');
            }

            await this.ensureBoardAccess(boardId, userId);

            const existingList = await this.prisma.list.findFirst({
                where: {
                    id: listId,
                    boardId,
                },
            });

            if (!existingList) {
                throw new NotFoundException('List not found');
            }

            await this.prisma.list.delete({
                where: {
                    id: listId,
                },
            });

            this.logger.log(`List deleted successfully: ${listId}`);
            return {
                message: 'List deleted successfully',
                listId,
                boardId,
            };
        } catch (error) {
            this.handleError(error, 'Failed to delete list');
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
            if (
                error instanceof ForbiddenException ||
                error instanceof NotFoundException
            ) {
                throw error;
            }

            this.logger.error(`Error checking board access: ${error}`);
            throw new InternalServerErrorException('Failed to verify board access');
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
