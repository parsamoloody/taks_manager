import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { GetUser } from 'src/common/decorator';
import { JwtGuard } from 'src/guard';
import { BoardMemberService } from './board_member.service';
import { AddBoardMemberDto } from './dto/create_board_member.dto';

@Controller('board-member')
export class BoardMemberController {
  constructor(
    private readonly boardMembersService: BoardMemberService,
  ) { }

  @UseGuards(JwtGuard)
  @Post(':boardId')
  addMember(
    @Param('boardId') boardId: string,
    @Body() dto: AddBoardMemberDto,
    @GetUser() currentUser: string
  ) {
    return this.boardMembersService.addMember(
      boardId,
      dto,
      currentUser,
    );
  }

  @UseGuards(JwtGuard)
  @Get()
  findAll(
    @Param('boardId') boardId: string,
  ) {
    return this.boardMembersService.findAll(boardId);
  }

  @UseGuards(JwtGuard)
  @Delete(':userId')
  removeMember(
    @Param('boardId') boardId: string,
    @Param('userId') userId: string,
    @GetUser() currentUser: string
  ) {
    return this.boardMembersService.removeMember(
      boardId,
      userId,
      currentUser,
    );
  }
}
