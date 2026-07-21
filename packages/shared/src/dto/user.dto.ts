export interface User {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  email: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  avatar?: string;
  password?: string;
}
