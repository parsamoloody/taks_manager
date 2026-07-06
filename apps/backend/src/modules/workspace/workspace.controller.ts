import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CreateOrUpdateWorkspaceDto } from './dto/workspace.dto';
import { GetUser } from 'src/common/decorator';
import type { User } from '@prisma/client';
import { WorkspaceService } from './workspace.service';
import { JwtGuard } from 'src/guard';

@Controller('workspace')
export class WorkspaceController {
  constructor(private workspaceService: WorkspaceService) { }

  @UseGuards(JwtGuard)
  @Post()
  createWorkspace(
    @Body() dto: CreateOrUpdateWorkspaceDto,
    @GetUser() user: User,
  ) {
    return this.workspaceService.createWorkspace(user.id, dto);
  }

  @UseGuards(JwtGuard)
  @Get()
  findAll(@GetUser() user: User) {
    return this.workspaceService.findAll(user.id);
  }

  @UseGuards(JwtGuard)
  @Delete()
  remove(
    @GetUser() user: User,
    @Param() workspaceId: string
  ) {
    return this.workspaceService.remove(user.id, workspaceId);
  }
}
