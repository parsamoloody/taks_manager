import {
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import * as argon from 'argon2';
import { UpdateUserDto } from './dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        omit: { hashedPassword: true },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return user;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException();
    }
  }

  async update(id: string, dto: UpdateUserDto) {
    try {
      const { password, ...profile } = dto;
      const hashedPassword = password ? await argon.hash(password) : undefined;

      return await this.prisma.user.update({
        where: { id },
        data: {
          ...profile,
          ...(hashedPassword && { hashedPassword }),
        },
        omit: { hashedPassword: true },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Email already in use');
        }
        if (error.code === 'P2025') {
          throw new NotFoundException('User not found');
        }
      }
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException();
    }
  }
}
