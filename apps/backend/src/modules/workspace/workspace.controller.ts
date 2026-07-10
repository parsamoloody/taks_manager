import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CreateOrUpdateWorkspaceDto } from './dto/workspace.dto';
import { GetUser } from 'src/common/decorator';
import type { User } from '@prisma/client';
import { WorkspaceService } from './workspace.service';
import { JwtGuard } from 'src/guard';

@ApiTags('Workspaces')
@ApiBearerAuth()
@Controller('workspace')
export class WorkspaceController {
  constructor(private workspaceService: WorkspaceService) { }

  @UseGuards(JwtGuard)
  @Post()
  @ApiOperation({ summary: 'Create a workspace' })
  @ApiBody({ type: CreateOrUpdateWorkspaceDto })
  createWorkspace(
    @Body() dto: CreateOrUpdateWorkspaceDto,
    @GetUser() user: User,
  ) {
    return this.workspaceService.createWorkspace(user.id, dto);
  }

  @UseGuards(JwtGuard)
  @Get()
  @ApiOperation({ summary: 'List workspaces for the current user' })
  findAll(@GetUser() user: User) {
    return this.workspaceService.findAll(user.id);
  }

  @UseGuards(JwtGuard)
  @Put(':workspaceId')
  @ApiOperation({ summary: 'Update a workspace' })
  @ApiParam({ name: 'workspaceId', description: 'Workspace identifier' })
  @ApiBody({ type: CreateOrUpdateWorkspaceDto })
  update(
    @GetUser() user: User,
    @Param('workspaceId') workspaceId: string,
    @Body() dto: CreateOrUpdateWorkspaceDto
  ) {
    return this.workspaceService.updateWorkspace(user.id, workspaceId, dto);
  }

  @UseGuards(JwtGuard)
  @Delete("/:workspaceId")
  remove(
    @GetUser() user: User,
    @Param("workspaceId") workspaceId: string
  ) {
    return this.workspaceService.remove(user.id, workspaceId);
  }
}
