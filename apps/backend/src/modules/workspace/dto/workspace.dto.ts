import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import type { CreateOrUpdateWorkspaceDto as SharedCreateOrUpdateWorkspaceDto } from '@repo/shared';

export class CreateOrUpdateWorkspaceDto implements SharedCreateOrUpdateWorkspaceDto {
  @ApiProperty({ example: 'Product Team' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name: string;

  @ApiPropertyOptional({ example: 'https://example.com/logo.png' })
  @IsOptional()
  @IsString()
  // @MaxLength(255)
  logo?: string;
}
