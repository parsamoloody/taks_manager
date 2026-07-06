import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateOrUpdateWorkspaceDto } from './dto/workspace.dto';
import { WorkspaceRole } from '@repo/shared-types';

@Injectable()
export class WorkspaceService {
    constructor(private prisma: PrismaService) { }

    async createWorkspace(userId: string, dto: CreateOrUpdateWorkspaceDto) {
        try {
            const createdWorkspace = await this.prisma.workspace.create({
                data: {
                    name: dto.name,
                    logo: dto.logo,
                    members: {
                        create: {
                            userId,
                            role: WorkspaceRole.OWNER,
                        },
                    },
                },
                include: {
                    members: true,
                },

            });
            return createdWorkspace
        } catch (e) {
            throw new InternalServerErrorException
        }
    }

    async findAll(userId: string) {
        try {
            return this.prisma.workspace.findMany({
                where: {
                    members: {
                        some: {
                            userId,
                        },
                    },
                },
                include: {
                    members: true,
                },
            });
        } catch (e) {
            throw new InternalServerErrorException
        }
    }

    async remove(workspaceId: string, userId: string) {
        try {
            await this.ensureOwner(workspaceId, userId);
            await this.prisma.workspace.delete({ where: { id: workspaceId } })
            return {
                message: 'Workspace deleted successfully',
            };
        } catch (e) {
            throw new InternalServerErrorException
        }
    }

    async update(
        userId: string,
        workspaceId: string,
        dto: CreateOrUpdateWorkspaceDto
    ) {
        try {
            await this.ensureOwner(workspaceId, userId);
            return await this.prisma.workspace.update({
                where: {
                    id: workspaceId
                },
                data: dto
            })
        } catch (e) {
            throw new InternalServerErrorException
        }
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
                'Only the workspace owner can perform this action',
            );
        }
    }
}
