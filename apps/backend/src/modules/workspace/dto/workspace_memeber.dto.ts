import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type { AddWorkspaceMemberDto as SharedDto } from '@repo/shared';

export class AddWorkspaceMemberDto implements SharedDto {
  @ApiProperty({ example: 'member@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ required: false, example: 'board-id' })
  @IsOptional()
  @IsString()
  boardId?: string;
}

export class AcceptWorkspaceInvitationDto {
  @ApiProperty({ example: 'workspace-invitation-token' })
  @IsString()
  @IsNotEmpty()
  token: string;
}
