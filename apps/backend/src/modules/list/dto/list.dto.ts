import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';
import type { CreateListDto as SharedCreateListDto, UpdateListDto as SharedUpdateListDto } from '@repo/shared';

export class CreateListDto implements SharedCreateListDto {
  @ApiProperty({ example: 'Backlog' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  title: string;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  order: number;
}

export class UpdateListDto implements SharedUpdateListDto {
  @ApiPropertyOptional({ example: 'In Progress' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  title: string;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  order: number;
}