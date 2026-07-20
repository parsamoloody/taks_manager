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
import { CreateBoardDto } from './dto/create_board.dto';
import { UpdateBoardDto } from './dto/update_board.dto';

@Injectable()
export class BoardService {
    private readonly logger = new Logger(BoardService.name);
    constructor(
        private prisma: PrismaService,
    ) { }

    async create(
        workspaceId: string,
        userId: string,
        dto: CreateBoardDto,
    ) {
        try {

            if (!workspaceId || !userId) {
                throw new BadRequestException(
                    'Workspace ID and User ID are required',
                );
            }

            await this.ensureMember(workspaceId, userId);

            const board = await this.prisma.board.create({
                data: {
                    workspaceId,
                    name: dto.name,
                    description: dto.description,
                    visibility: dto.visibility,
                    members: {
                        create: {
                            userId,
                        }
                    }
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
                                }
                            }
                        }
                    }
                },
            });

            if (board.visibility !== 'PRIVATE') {
                await this.syncBoardMembers(board.id, workspaceId);
            }

            this.logger.log(
                `Board created successfully: ${board.id} by user: ${userId}`,
            );
            return board;
        } catch (error) {
            this.handleError(error, 'Failed to create board');
        }
    }

    async findAll(workspaceId: string, userId: string) {
        try {

            if (!workspaceId || !userId) {
                throw new BadRequestException(
                    'Workspace ID and User ID are required',
                );
            }

            await this.ensureMember(workspaceId, userId);

            const boards = await this.prisma.board.findMany({
                where: {
                    workspaceId,
                    OR: [
                        // WORKSPACE boards - all workspace members can see
                        {
                            visibility: 'WORKSPACE',
                        },
                        // PRIVATE boards - only board members can see
                        {
                            AND: [
                                {
                                    visibility: 'PRIVATE',
                                },
                                {
                                    members: {
                                        some: {
                                            userId,
                                        },
                                    },
                                },
                            ],
                        },
                    ],
                },
                orderBy: {
                    createdAt: 'asc',
                },
                include: {
                    members: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                    avatar: true,
                                },
                            },
                        },
                    },
                }
            });

            this.logger.log(
                `Retrieved ${boards.length} boards for workspace: ${workspaceId}`,
            );
            return boards;
        } catch (error) {
            this.handleError(error, 'Failed to retrieve boards');
        }
    }

    async findOne(
        workspaceId: string,
        boardId: string,
        userId: string,
    ) {
        try {

            if (!workspaceId || !boardId || !userId) {
                throw new BadRequestException(
                    'Workspace ID, Board ID, and User ID are required',
                );
            }

            await this.ensureMember(workspaceId, userId);

            const board = await this.prisma.board.findFirst({
                where: {
                    id: boardId,
                    workspaceId,
                    OR: [
                        // WORKSPACE boards - all workspace members can see
                        {
                            visibility: 'WORKSPACE',
                        },
                        // PRIVATE boards - only board members can see
                        {
                            AND: [
                                {
                                    visibility: 'PRIVATE',
                                },
                                {
                                    members: {
                                        some: {
                                            userId,
                                        },
                                    },
                                },
                            ],
                        },
                    ],
                },
                include: {
                    members: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                    avatar: true,
                                },
                            },
                        },
                    },
                    lists: {
                        orderBy: {
                            createdAt: 'asc',
                        },
                    },
                },
            });

            if (!board) {
                throw new NotFoundException('Board not found');
            }

            this.logger.log(`Retrieved board: ${boardId}`);
            return board;
        } catch (error) {
            this.handleError(error, 'Failed to retrieve board');
        }
    }

    async update(
        boardId: string,
        userId: string,
        dto: UpdateBoardDto,
    ) {
        try {

            if (!boardId || !userId) {
                throw new BadRequestException(
                    'Board ID and User ID are required',
                );
            }

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
                    members: true,
                },
            });

            // Check if user has access based on visibility
            if (board) {
                if (board.visibility === 'PRIVATE') {
                    const isMember = board.members.some(
                        (member) => member.userId === userId,
                    );
                    if (!isMember) {
                        throw new ForbiddenException(
                            'You do not have access to this private board',
                        );
                    }
                }
            }

            if (!board) {
                throw new NotFoundException('Board not found');
            }

            await this.ensureMember(board.workspaceId, userId);

            const updatedBoard = await this.prisma.board.update({
                where: {
                    id: boardId,
                },
                data: dto,
            });

            if (updatedBoard.visibility !== 'PRIVATE') {
                await this.syncBoardMembers(updatedBoard.id, updatedBoard.workspaceId);
            }

            this.logger.log(
                `Board updated successfully: ${boardId} by user: ${userId}`,
            );
            return updatedBoard;
        } catch (error) {
            this.handleError(error, 'Failed to update board');
        }
    }

    async remove(boardId: string, userId: string) {
        try {

            if (!boardId || !userId) {
                throw new BadRequestException(
                    'Board ID and User ID are required',
                );
            }

            const board = await this.prisma.board.findUnique({
                where: {
                    id: boardId,
                },
                include: {
                    members: true,
                },
            });

            // Check if user has access based on visibility
            if (board) {
                if (board.visibility === 'PRIVATE') {
                    const isMember = board.members.some(
                        (member) => member.userId === userId,
                    );
                    if (!isMember) {
                        throw new ForbiddenException(
                            'You do not have access to this private board',
                        );
                    }
                }
            }

            if (!board) {
                throw new NotFoundException('Board not found');
            }

            await this.ensureMember(board.workspaceId, userId);

            await this.prisma.board.delete({
                where: {
                    id: boardId,
                },
            });

            this.logger.log(
                `Board deleted successfully: ${boardId} by user: ${userId}`,
            );

            return {
                message: 'Board deleted successfully',
                boardId,
            };
        } catch (error) {
            this.handleError(error, 'Failed to delete board');
        }
    }

    private async ensureMember(
        workspaceId: string,
        userId: string,
    ): Promise<void> {
        try {
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
                throw new ForbiddenException(
                    'You are not a member of this workspace',
                );
            }
        } catch (error) {
            if (error instanceof ForbiddenException) {
                throw error;
            }
            this.logger.error(
                `Error checking workspace membership: ${error}`,
            );
            throw new InternalServerErrorException(
                'Failed to verify workspace membership',
            );
        }
    }

    private async syncBoardMembers(
        boardId: string,
        workspaceId: string,
    ): Promise<void> {
        const workspaceMembers = await this.prisma.workspaceMember.findMany({
            where: { workspaceId },
            select: { userId: true },
        });
        const userIds = workspaceMembers.map((member) => member.userId);

        await this.prisma.$transaction([
            this.prisma.boardMember.deleteMany({
                where: {
                    boardId,
                    userId: { notIn: userIds },
                },
            }),
            this.prisma.boardMember.createMany({
                data: userIds.map((userId) => ({ boardId, userId })),
                skipDuplicates: true,
            }),
        ]);
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
            this.logger.error(
                `Prisma error in ${context}: ${error.message}`,
            );

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
