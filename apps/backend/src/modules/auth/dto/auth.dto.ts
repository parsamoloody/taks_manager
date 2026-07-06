import type { AuthDto as AuthDtoType } from '@repo/shared-types';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class AuthDto implements AuthDtoType {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsEmail()
  @IsNotEmpty()
  password: string;
}
