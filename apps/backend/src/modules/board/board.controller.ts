import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/common/decorator';
import type { User } from '@prisma/client';
import { JwtGuard } from 'src/guard';

import { BoardService } from './board.service';
import { CreateBoardDto } from './dto/create_board.dto';
import { UpdateBoardDto } from './dto/update_board.dto';

@ApiTags('Boards')
@ApiBearerAuth()
@Controller('board')
export class BoardController {

    constructor(private boardService: BoardService) { }

    @UseGuards(JwtGuard)
    @Post(':workspaceId')
    @ApiOperation({ summary: 'Create a board in a workspace' })
    @ApiParam({ name: 'workspaceId', description: 'Workspace identifier' })
    @ApiBody({ type: CreateBoardDto })
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
    @ApiOperation({ summary: 'List boards in a workspace' })
    @ApiParam({ name: 'workspaceId', description: 'Workspace identifier' })
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
    @ApiOperation({ summary: 'Get a board by id' })
    @ApiParam({ name: 'workspaceId', description: 'Workspace identifier' })
    @ApiParam({ name: 'boardId', description: 'Board identifier' })
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
    @ApiOperation({ summary: 'Update a board' })
    @ApiParam({ name: 'boardId', description: 'Board identifier' })
    @ApiBody({ type: UpdateBoardDto })
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
    @ApiOperation({ summary: 'Delete a board' })
    @ApiParam({ name: 'boardId', description: 'Board identifier' })
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
