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
import type { User } from '@prisma/client';
import { GetUser } from 'src/common/decorator';
import { JwtGuard } from 'src/guard';

import { TaskService } from './task.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';

@ApiTags('task')
@ApiBearerAuth()
@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @UseGuards(JwtGuard)
  @Post(':boardId/:listId')
  @ApiOperation({ summary: 'Create a task in a list' })
  @ApiParam({ name: 'boardId', description: 'Board identifier' })
  @ApiParam({ name: 'listId', description: 'List identifier' })
  @ApiBody({ type: CreateTaskDto })
  create(
    @Param('boardId') boardId: string,
    @Param('listId') listId: string,
    @Body() dto: CreateTaskDto,
    @GetUser() currentUser: User,
  ) {
    return this.taskService.create(boardId, listId, currentUser.id, dto);
  }

  @UseGuards(JwtGuard)
  @Get(':boardId/:listId')
  @ApiOperation({ summary: 'List all tasks in a list' })
  @ApiParam({ name: 'boardId', description: 'Board identifier' })
  @ApiParam({ name: 'listId', description: 'List identifier' })
  findAll(
    @Param('boardId') boardId: string,
    @Param('listId') listId: string,
    @GetUser() currentUser: User,
  ) {
    return this.taskService.findAll(boardId, listId, currentUser.id);
  }

  @UseGuards(JwtGuard)
  @Get(':boardId/:listId/:taskId')
  @ApiOperation({ summary: 'Get a task by id' })
  @ApiParam({ name: 'boardId', description: 'Board identifier' })
  @ApiParam({ name: 'listId', description: 'List identifier' })
  @ApiParam({ name: 'taskId', description: 'Task identifier' })
  findOne(
    @Param('boardId') boardId: string,
    @Param('listId') listId: string,
    @Param('taskId') taskId: string,
    @GetUser() currentUser: User,
  ) {
    return this.taskService.findOne(boardId, listId, taskId, currentUser.id);
  }

  @UseGuards(JwtGuard)
  @Put(':boardId/:listId/:taskId')
  @ApiOperation({ summary: 'Update a task' })
  @ApiParam({ name: 'boardId', description: 'Board identifier' })
  @ApiParam({ name: 'listId', description: 'List identifier' })
  @ApiParam({ name: 'taskId', description: 'Task identifier' })
  @ApiBody({ type: UpdateTaskDto })
  update(
    @Param('boardId') boardId: string,
    @Param('listId') listId: string,
    @Param('taskId') taskId: string,
    @Body() dto: UpdateTaskDto,
    @GetUser() currentUser: User,
  ) {
    return this.taskService.update(boardId, listId, taskId, currentUser.id, dto);
  }

  @UseGuards(JwtGuard)
  @Delete(':boardId/:listId/:taskId')
  @ApiOperation({ summary: 'Delete a task' })
  @ApiParam({ name: 'boardId', description: 'Board identifier' })
  @ApiParam({ name: 'listId', description: 'List identifier' })
  @ApiParam({ name: 'taskId', description: 'Task identifier' })
  remove(
    @Param('boardId') boardId: string,
    @Param('listId') listId: string,
    @Param('taskId') taskId: string,
    @GetUser() currentUser: User,
  ) {
    return this.taskService.remove(boardId, listId, taskId, currentUser.id);
  }
}
