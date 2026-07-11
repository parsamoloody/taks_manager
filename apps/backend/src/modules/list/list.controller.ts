import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/common/decorator';
import type { User } from '@prisma/client';
import { JwtGuard } from 'src/guard';

import { ListService } from './list.service';
import { CreateListDto, UpdateListDto } from './dto/list.dto';

@ApiTags('list')
@ApiBearerAuth()
@Controller('list')
export class ListController {
  constructor(private readonly listService: ListService) {}

  @UseGuards(JwtGuard)
  @Post(':boardId')
  @ApiOperation({ summary: 'Create a list in a board' })
  @ApiParam({ name: 'boardId', description: 'Board identifier' })
  @ApiBody({ type: CreateListDto })
  create(
    @Param('boardId') boardId: string,
    @Body() dto: CreateListDto,
    @GetUser() currentUser: User,
  ) {
    return this.listService.create(boardId, currentUser.id, dto);
  }

  @UseGuards(JwtGuard)
  @Get(':boardId')
  @ApiOperation({ summary: 'List all lists in a board' })
  @ApiParam({ name: 'boardId', description: 'Board identifier' })
  findAll(
    @Param('boardId') boardId: string,
    @GetUser() currentUser: User,
  ) {
    return this.listService.findAll(boardId, currentUser.id);
  }

  @UseGuards(JwtGuard)
  @Get(':boardId/:listId')
  @ApiOperation({ summary: 'Get a list by id' })
  @ApiParam({ name: 'boardId', description: 'Board identifier' })
  @ApiParam({ name: 'listId', description: 'List identifier' })
  findOne(
    @Param('boardId') boardId: string,
    @Param('listId') listId: string,
    @GetUser() currentUser: User,
  ) {
    return this.listService.findOne(boardId, listId, currentUser.id);
  }

  @UseGuards(JwtGuard)
  @Put(':boardId/:listId')
  @ApiOperation({ summary: 'Update a list' })
  @ApiParam({ name: 'boardId', description: 'Board identifier' })
  @ApiParam({ name: 'listId', description: 'List identifier' })
  @ApiBody({ type: UpdateListDto })
  update(
    @Param('boardId') boardId: string,
    @Param('listId') listId: string,
    @Body() dto: UpdateListDto,
    @GetUser() currentUser: User,
  ) {
    return this.listService.update(boardId, listId, currentUser.id, dto);
  }

  @UseGuards(JwtGuard)
  @Delete(':boardId/:listId')
  @ApiOperation({ summary: 'Delete a list' })
  @ApiParam({ name: 'boardId', description: 'Board identifier' })
  @ApiParam({ name: 'listId', description: 'List identifier' })
  remove(
    @Param('boardId') boardId: string,
    @Param('listId') listId: string,
    @GetUser() currentUser: User,
  ) {
    return this.listService.remove(boardId, listId, currentUser.id);
  }
}
