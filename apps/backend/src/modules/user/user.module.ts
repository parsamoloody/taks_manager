import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from 'src/common/strategy/strategy/jwt.strategy';

@Module({
  imports: [PassportModule],
  controllers: [UserController],
  providers: [UserService, JwtService, JwtStrategy],
  exports: [UserService],
})
export class UserModule {}
