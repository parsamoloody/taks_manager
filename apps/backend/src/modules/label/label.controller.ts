import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { User } from '@prisma/client';
import { GetUser } from 'src/common/decorator';
import { JwtGuard } from 'src/guard';
import { CreateLabelDto, UpdateLabelDto } from './dto/label.dto';
import { LabelService } from './label.service';

@ApiTags('Labels')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('label/:boardId')
export class LabelController {
  constructor(private readonly labelService: LabelService) {}

  @Get()
  @ApiOperation({ summary: 'List labels for a board' })
  findAll(@Param('boardId') boardId: string, @GetUser() user: User) {
    return this.labelService.findAll(boardId, user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a board label' })
  create(
    @Param('boardId') boardId: string,
    @GetUser() user: User,
    @Body() dto: CreateLabelDto,
  ) {
    return this.labelService.create(boardId, user.id, dto);
  }

  @Patch(':labelId')
  @ApiOperation({ summary: 'Update a board label' })
  update(
    @Param('boardId') boardId: string,
    @Param('labelId') labelId: string,
    @GetUser() user: User,
    @Body() dto: UpdateLabelDto,
  ) {
    return this.labelService.update(boardId, labelId, user.id, dto);
  }

  @Delete(':labelId')
  @ApiOperation({ summary: 'Delete a board label' })
  remove(
    @Param('boardId') boardId: string,
    @Param('labelId') labelId: string,
    @GetUser() user: User,
  ) {
    return this.labelService.remove(boardId, labelId, user.id);
  }
}
