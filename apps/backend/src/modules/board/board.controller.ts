import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { GetUser } from 'src/common/decorator';
import type { User } from '@prisma/client';
import { JwtGuard } from 'src/guard';

import { BoardService } from './board.service';
import { CreateBoardDto } from './dto/create_board.dto';
import { UpdateBoardDto } from './dto/update_board.dto';

@Controller('board')
export class BoardController {

    constructor(private boardService: BoardService) { }

    @UseGuards(JwtGuard)
    @Post(':workspaceId')
    create(
        @Param('workspaceId') workspaceId: string,
        @Body() dto: CreateBoardDto,
        @GetUser() currentUser: User
    ) {
        return this.boardService.create(
            workspaceId,
            currentUser.id,
            dto,
        );
    }

    @UseGuards(JwtGuard)
    @Get(':workspaceId')
    findAll(
        @Param('workspaceId') workspaceId: string,
        @GetUser() currentUser: User
    ) {
        return this.boardService.findAll(
            workspaceId,
            currentUser.id,
        );
    }

    @UseGuards(JwtGuard)
    @Get(':workspaceId/:boardId')
    findOne(
        @Param('workspaceId') workspaceId: string,
        @Param('boardId') boardId: string,
        @GetUser() currentUser: User
    ) {
        return this.boardService.findOne(
            workspaceId,
            boardId,
            currentUser.id,
        );
    }

    @UseGuards(JwtGuard)
    @Put(':boardId')
    update(
        @Param('boardId') boardId: string,
        @Body() dto: UpdateBoardDto,
        @GetUser() currentUser: User
    ) {
        return this.boardService.update(
            boardId,
            currentUser.id,
            dto,
        );
    }

    @UseGuards(JwtGuard)
    @Delete(':boardId')
    remove(
        @Param('boardId') boardId: string,
        @GetUser() currentUser: User
    ) {
        return this.boardService.remove(
            boardId,
            currentUser.id,
        );
    }

}
