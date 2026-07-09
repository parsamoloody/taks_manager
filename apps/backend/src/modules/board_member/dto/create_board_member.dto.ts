import { AddBoardMemberDto as _AddBoardMemberDto } from '@repo/shared';
import { IsEmail } from 'class-validator';

export class AddBoardMemberDto implements _AddBoardMemberDto {
  @IsEmail()
  email: string;
}