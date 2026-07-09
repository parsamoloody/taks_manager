import type { CreateBoardDto as SharedCreateBoardDto } from "@repo/shared";
import { BoardVisibility } from "@repo/shared";

import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class CreateBoardDto implements SharedCreateBoardDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @IsEnum(BoardVisibility)
  visibility: BoardVisibility;
}