import type { AuthDto } from "@repo/shared";
import { requestJson } from "./client";


interface AuthResponse {
  access_token?: string;
  email?: string;
  id?: string;
  message?: string;
}

export async function signIn(payload: AuthDto) {
  return requestJson<AuthResponse>("auth/signin", {
    method: "POST",
    json: payload,
  });
}

export async function signUp(payload: AuthDto) {
  return requestJson<AuthResponse>("auth/signup", {
    method: "POST",
    json: payload,
  });
}

export function getErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message?: string }).message);
  }

  return "Something went wrong. Please try again.";
}
