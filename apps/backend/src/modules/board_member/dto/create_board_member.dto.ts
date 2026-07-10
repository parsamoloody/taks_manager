import { AddBoardMemberDto as _AddBoardMemberDto } from '@repo/shared';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class AddBoardMemberDto implements _AddBoardMemberDto {
  @ApiProperty({ example: 'member@example.com' })
  @IsEmail()
  email: string;
}