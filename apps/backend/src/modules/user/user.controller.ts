import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { User } from '@prisma/client';
import { GetUser } from 'src/common/decorator';
import { JwtGuard } from 'src/guard';
import { UpdateUserDto } from './dto/user.dto';
import { UserService } from './user.service';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('current')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the current user' })
  getCurrent(@GetUser() user: User) {
    return user;
  }

  @Patch('current')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update the current user' })
  updateCurrent(@GetUser('id') userId: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(userId, dto);
  }

  @Get('/:id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Find user by id' })
  findById(@Param('id') id: string) {
    return this.userService.findById(id);
  }
}
