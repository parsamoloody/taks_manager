import { IsEmail } from 'class-validator';
import type { AddWorkspaceMemberDto as SharedDto } from '@repo/shared-types';

export class AddWorkspaceMemberDto implements SharedDto {
  @IsEmail()
  email: string;
}