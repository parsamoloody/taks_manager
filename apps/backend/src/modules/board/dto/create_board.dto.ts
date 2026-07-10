import type { CreateBoardDto as SharedCreateBoardDto } from "@repo/shared";
import { BoardVisibility } from "@repo/shared";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class CreateBoardDto implements SharedCreateBoardDto {
  @ApiProperty({ example: 'Sprint Planning' })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  name: string;

  @ApiPropertyOptional({ example: 'Board for planning the next sprint' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiProperty({ enum: BoardVisibility, example: BoardVisibility.PRIVATE })
  @IsEnum(BoardVisibility)
  visibility: BoardVisibility;
}