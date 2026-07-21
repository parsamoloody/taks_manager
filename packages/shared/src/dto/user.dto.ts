export interface User {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  email: string;
}

export interface UserDto {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  avatar: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  avatar?: string;
  password?: string;
}
