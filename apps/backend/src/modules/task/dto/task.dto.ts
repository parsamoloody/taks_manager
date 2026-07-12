import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { TaskPriority, TaskStatus } from '@repo/shared';
import type {
  CreateTaskDto as SharedCreateTaskDto,
  UpdateTaskDto as SharedUpdateTaskDto,
} from '@repo/shared';

export class CreateTaskDto implements SharedCreateTaskDto {
  @ApiProperty({ example: 'Design API endpoints' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  title!: string;

  @ApiPropertyOptional({ example: 'Outline the required endpoints and validation rules' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  order!: number;

  @ApiPropertyOptional({ enum: TaskPriority, example: TaskPriority.MEDIUM })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiPropertyOptional({ example: '2026-07-15T00:00:00.000Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @ApiPropertyOptional({ example: '2026-07-20T00:00:00.000Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dueDate?: Date;

  @ApiPropertyOptional({ example: ['label-id'] })
  @IsOptional()
  lables?: SharedCreateTaskDto[];

  @ApiPropertyOptional({ example: ['user-id'] })
  @IsOptional()
  @IsString({ each: true })
  assignee?: string[];
}

export class UpdateTaskDto extends CreateTaskDto implements SharedUpdateTaskDto {
  @ApiPropertyOptional({ enum: TaskStatus, example: TaskStatus.PENDING })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;
}