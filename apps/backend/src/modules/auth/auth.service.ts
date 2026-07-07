import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import * as argon from 'argon2';
import { AuthDto } from './dto/auth.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
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
          throw new ForbiddenException('Credentials taken');
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
      const pwMatches = await argon.verify(user.hashedPassword, dto.password);
      if (!pwMatches) {
        throw new ForbiddenException('Credentials incorrect');
      }

      return this.signToken(user.id, user.email);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2011') {
          throw new ForbiddenException('User not found');
        }
      }
      throw new InternalServerErrorException();
    }
  }

  async signToken(
    userId: string,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
    };
    const secret = this.config.get('jwt.secret');
    const token = await this.jwt.signAsync(payload, {
      expiresIn: this.config.get('jwt.ttl'),
      secret,
    });

    return { access_token: token };
  }
}
