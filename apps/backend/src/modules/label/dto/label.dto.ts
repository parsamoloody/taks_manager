import type {
  CreateLabelDto as SharedCreateLabelDto,
  UpdateLabelDto as SharedUpdateLabelDto,
} from '@repo/shared';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsHexColor,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateLabelDto implements SharedCreateLabelDto {
  @ApiProperty({ example: 'Bug' })
  @IsString()
  @MinLength(1)
  @MaxLength(30)
  name: string;

  @ApiProperty({ example: '#f43f5e' })
  @IsHexColor()
  color: string;
}

export class UpdateLabelDto implements SharedUpdateLabelDto {
  @ApiPropertyOptional({ example: 'Critical bug' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(30)
  name?: string;

  @ApiPropertyOptional({ example: '#ef4444' })
  @IsOptional()
  @IsHexColor()
  color?: string;
}
