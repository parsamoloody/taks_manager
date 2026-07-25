import type { UserDto } from "@repo/shared";

export interface BasePageProps {
  user: UserDto | null;
}
