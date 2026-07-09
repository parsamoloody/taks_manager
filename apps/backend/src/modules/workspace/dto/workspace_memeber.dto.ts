import { IsEmail } from 'class-validator';
import type { AddWorkspaceMemberDto as SharedDto } from '@repo/shared';

export class AddWorkspaceMemberDto implements SharedDto {
  @IsEmail()
  email: string;
}