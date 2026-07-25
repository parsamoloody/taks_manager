import type { UpdateUserDto, UserDto } from "@repo/shared";
import { requestJson } from "./client";

export function getCurrentUser(token: string) {
  return requestJson<UserDto>("user/current", { token });
}

export function updateCurrentUser(token: string, payload: UpdateUserDto) {
  return requestJson<UserDto>("user/current", {
    method: "PATCH",
    token,
    json: payload,
  });
}
