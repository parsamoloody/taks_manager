import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type { AddWorkspaceMemberDto as SharedDto } from '@repo/shared';

export class AddWorkspaceMemberDto implements SharedDto {
  @ApiProperty({ example: 'member@example.com' })
  @IsEmail()
  email: string;
}

export class AcceptWorkspaceInvitationDto {
  @ApiProperty({ example: 'workspace-invitation-token' })
  @IsString()
  @IsNotEmpty()
  token: string;
}
