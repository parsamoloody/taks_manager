import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

import type { CreateOrUpdateWorkspaceDto as SharedCreateOrUpdateWorkspaceDto } from '@repo/shared';

export class CreateOrUpdateWorkspaceDto implements SharedCreateOrUpdateWorkspaceDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name: string;

  @IsOptional()
  @IsString()
  // @MaxLength(255)
  logo?: string;
}
