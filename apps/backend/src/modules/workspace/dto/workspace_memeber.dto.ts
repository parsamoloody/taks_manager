import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type { AddWorkspaceMemberDto as SharedDto } from '@repo/shared';

export class AddWorkspaceMemberDto implements SharedDto {
  @ApiProperty({ example: 'member@example.com' })
  @IsEmail()
  email: string;
}