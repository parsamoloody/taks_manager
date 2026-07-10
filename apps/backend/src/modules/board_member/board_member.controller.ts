import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/common/decorator';
import { JwtGuard } from 'src/guard';
import { BoardMemberService } from './board_member.service';
import { AddBoardMemberDto } from './dto/create_board_member.dto';
import type { User } from '@prisma/client';

@ApiTags('Board Members')
@ApiBearerAuth()
@Controller('board-member')
export class BoardMemberController {
  constructor(
    private readonly boardMembersService: BoardMemberService,
  ) { }

  @UseGuards(JwtGuard)
  @Post(':boardId')
  @ApiOperation({ summary: 'Add a member to a board' })
  @ApiParam({ name: 'boardId', description: 'Board identifier' })
  @ApiBody({ type: AddBoardMemberDto })
  addMember(
    @Param('boardId') boardId: string,
    @Body() dto: AddBoardMemberDto,
    @GetUser() currentUser: User
  ) {
    return this.boardMembersService.addMember(
      boardId,
      dto,
      currentUser.id,
    );
  }

  @UseGuards(JwtGuard)
  @Get(':boardId')
  @ApiOperation({ summary: 'List members of a board' })
  @ApiParam({ name: 'boardId', description: 'Board identifier' })
  findAll(
    @Param('boardId') boardId: string,
  ) {
    return this.boardMembersService.findAll(boardId);
  }

  @UseGuards(JwtGuard)
  @Delete(':userId')
  @ApiOperation({ summary: 'Remove a member from a board' })
  @ApiParam({ name: 'boardId', description: 'Board identifier' })
  @ApiParam({ name: 'userId', description: 'Member user identifier' })
  removeMember(
    @Param('boardId') boardId: string,
    @Param('userId') userId: string,
    @GetUser() currentUser: User
  ) {
    return this.boardMembersService.removeMember(
      boardId,
      userId,
      currentUser.id,
    );
  }
}
