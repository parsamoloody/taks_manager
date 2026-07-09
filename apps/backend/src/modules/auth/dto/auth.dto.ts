import type { AuthDto as AuthDtoType } from '@repo/shared';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class AuthDto implements AuthDtoType {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsEmail()
  @IsNotEmpty()
  password: string;
}
