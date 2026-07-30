import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import * as argon from 'argon2';
import { AuthDto, ResetPasswordDto } from './dto/auth.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { ActionTokenType } from '@prisma/client';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ActionTokenService } from '../notification/action-token.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private readonly actionTokens: ActionTokenService,
    private readonly notifications: NotificationService,
  ) {}

  async signup(dto: AuthDto) {
    try {
      const hashedPassword = await argon.hash(dto.password);
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hashedPassword,
        },
        omit: {
          hashedPassword: true,
        },
      });
      const token = await this.signToken(user.id, user.email);
      return {
        ...user,
        access_token: token.access_token,
      };
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new ConflictException('Credentials taken');
        }

        if (e instanceof HttpException) {
          throw e;
        }
      }

      throw new InternalServerErrorException();
    }
  }

  async signin(dto: AuthDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (!user) {
        throw new ForbiddenException('Credentials incorrect');
      }

      const passwordMatches = await argon.verify(
        user.hashedPassword,
        dto.password,
      );

      if (!passwordMatches) {
        throw new ForbiddenException('Credentials incorrect');
      }

      return this.signToken(user.id, user.email);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException();
    }
  }

  async requestPasswordReset(emailInput: string) {
    const email = emailInput.trim().toLowerCase();

    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true },
      });

      if (user) {
        const ttlMinutes =
          this.config.get<number>('notifications.passwordResetTtlMinutes') ??
          30;
        const { token, record } = await this.actionTokens.issue({
          type: ActionTokenType.PASSWORD_RESET,
          email: user.email,
          userId: user.id,
          ttlMs: ttlMinutes * 60_000,
        });

        await this.notifications.sendPasswordReset({
          to: user.email,
          token,
          expiresAt: record.expiresAt,
        });
      }
    } catch (error) {
      this.logger.error(
        `Failed to queue password reset: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }

    return {
      message:
        'If an account exists for that email, a password reset link has been sent',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    try {
      const token = await this.actionTokens.findValid(
        dto.token,
        ActionTokenType.PASSWORD_RESET,
      );

      if (!token.userId) {
        throw new ForbiddenException('Password reset token is invalid');
      }

      const userId = token.userId;
      const hashedPassword = await argon.hash(dto.password);

      await this.prisma.$transaction(async (transaction) => {
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

        await transaction.user.update({
          where: { id: userId },
          data: { hashedPassword },
        });
      });

      return { message: 'Password reset successfully' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to reset password');
    }
  }

  private async signToken(
    userId: string,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
    };
    const secret = this.config.getOrThrow<string>('jwt.secret');
    const expiresIn =
      this.config.getOrThrow<JwtSignOptions['expiresIn']>('jwt.ttl');
    const token = await this.jwt.signAsync(payload, {
      expiresIn,
      secret,
    });

    return { access_token: token };
  }
}
