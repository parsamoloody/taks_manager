import { BadRequestException, Injectable } from '@nestjs/common';
import { ActionTokenType } from '@prisma/client';
import { createHash, randomBytes } from 'node:crypto';

import { PrismaService } from 'src/common/prisma/prisma.service';

interface IssueActionTokenInput {
  type: ActionTokenType;
  email: string;
  ttlMs: number;
  userId?: string;
  workspaceId?: string;
}

@Injectable()
export class ActionTokenService {
  constructor(private readonly prisma: PrismaService) {}

  async issue(input: IssueActionTokenInput) {
    const email = input.email.trim().toLowerCase();
    const token = randomBytes(32).toString('hex');
    const tokenHash = this.hash(token);
    const expiresAt = new Date(Date.now() + input.ttlMs);

    await this.prisma.actionToken.deleteMany({
      where: {
        type: input.type,
        email,
        usedAt: null,
        ...(input.userId ? { userId: input.userId } : {}),
        ...(input.workspaceId ? { workspaceId: input.workspaceId } : {}),
      },
    });

    const record = await this.prisma.actionToken.create({
      data: {
        type: input.type,
        tokenHash,
        email,
        expiresAt,
        userId: input.userId,
        workspaceId: input.workspaceId,
      },
    });

    return { token, record };
  }

  async findValid(token: string, type: ActionTokenType) {
    if (!token?.trim()) {
      throw new BadRequestException('Token is required');
    }

    const record = await this.prisma.actionToken.findUnique({
      where: { tokenHash: this.hash(token) },
    });

    if (
      !record ||
      record.type !== type ||
      record.usedAt ||
      record.expiresAt <= new Date()
    ) {
      throw new BadRequestException('Token is invalid or expired');
    }

    return record;
  }

  hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
