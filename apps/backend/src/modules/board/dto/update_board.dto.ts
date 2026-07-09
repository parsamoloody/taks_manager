import type { UpdateBoardDto as SharedUpdateBoardDto } from "@repo/shared";
import { BoardVisibility } from "@repo/shared";

import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class UpdateBoardDto implements SharedUpdateBoardDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @IsOptional()
  @IsEnum(BoardVisibility)
  visibility?: BoardVisibility;
}