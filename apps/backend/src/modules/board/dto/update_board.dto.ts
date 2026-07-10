import type { UpdateBoardDto as SharedUpdateBoardDto } from "@repo/shared";
import { BoardVisibility } from "@repo/shared";
import { ApiPropertyOptional } from '@nestjs/swagger';

import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class UpdateBoardDto implements SharedUpdateBoardDto {
  @ApiPropertyOptional({ example: 'Updated board name' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  name?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiPropertyOptional({ enum: BoardVisibility, example: BoardVisibility.WORKSPACE })
  @IsOptional()
  @IsEnum(BoardVisibility)
  visibility?: BoardVisibility;
}