import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserDto } from './dto/user.dto';
import { UserService } from './user.service';

@ApiTags('User')
@Controller('User')
export class UserController {
  constructor(private UserService: UserService) { }

  @Get('/:id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Find user by id' })
  findById(@Param('id') id: string) {
    return this.UserService.findById(id);
  }
}
