import type { AuthDto as AuthDtoType } from '@repo/shared';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class AuthDto implements AuthDtoType {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'strongPassword123' })
  @IsEmail()
  @IsNotEmpty()
  password: string;
}
