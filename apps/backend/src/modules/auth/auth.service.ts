import {
  ConflictException,
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
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
  ) { }

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
