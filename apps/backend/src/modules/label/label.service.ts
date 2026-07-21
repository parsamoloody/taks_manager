import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateLabelDto, UpdateLabelDto } from './dto/label.dto';

@Injectable()
export class LabelService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(boardId: string, userId: string) {
    await this.ensureBoardAccess(boardId, userId);
    return this.prisma.label.findMany({
      where: { boardId },
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
    });
  }

  async create(boardId: string, userId: string, dto: CreateLabelDto) {
    await this.ensureBoardAccess(boardId, userId);
    await this.ensureUniqueName(boardId, dto.name);
    return this.prisma.label.create({ data: { boardId, ...dto } });
  }

  async update(
    boardId: string,
    labelId: string,
    userId: string,
    dto: UpdateLabelDto,
  ) {
    await this.ensureLabel(boardId, labelId);
    await this.ensureBoardAccess(boardId, userId);
    if (dto.name) await this.ensureUniqueName(boardId, dto.name, labelId);

    return this.prisma.label.update({
      where: { id: labelId },
      data: dto,
    });
  }

  async remove(boardId: string, labelId: string, userId: string) {
    await this.ensureLabel(boardId, labelId);
    await this.ensureBoardAccess(boardId, userId);
    await this.prisma.label.delete({ where: { id: labelId } });
    return { message: 'Label deleted successfully', labelId };
  }

  private async ensureLabel(boardId: string, labelId: string) {
    const label = await this.prisma.label.findFirst({
      where: { id: labelId, boardId },
    });
    if (!label) throw new NotFoundException('Label not found');
  }

  private async ensureUniqueName(
    boardId: string,
    name: string,
    excludeId?: string,
  ) {
    const existing = await this.prisma.label.findFirst({
      where: {
        boardId,
        name: { equals: name, mode: 'insensitive' },
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
    if (existing)
      throw new ConflictException('A label with this name already exists');
  }

  private async ensureBoardAccess(boardId: string, userId: string) {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      include: { workspace: { include: { members: true } }, members: true },
    });
    if (!board) throw new NotFoundException('Board not found');

    const isWorkspaceMember = board.workspace.members.some(
      (member) => member.userId === userId,
    );
    const isBoardMember = board.members.some(
      (member) => member.userId === userId,
    );
    if (
      !isWorkspaceMember ||
      (board.visibility === 'PRIVATE' && !isBoardMember)
    ) {
      throw new ForbiddenException('You do not have access to this board');
    }
  }
}
