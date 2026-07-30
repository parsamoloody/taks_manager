import type { AuthDto } from "@repo/shared";
import { requestJson } from "./client";

interface AuthResponse {
  access_token: string;
  email?: string;
  id?: string;
}

interface MessageResponse {
  message: string;
}

export function signIn(payload: AuthDto) {
  return requestJson<AuthResponse>("auth/signin", {
    method: "POST",
    json: payload,
  });
}

export function signUp(payload: AuthDto) {
  return requestJson<AuthResponse>("auth/signup", {
    method: "POST",
    json: payload,
  });
}

export function requestPasswordReset(email: string) {
  return requestJson<MessageResponse>("auth/forgot-password", {
    method: "POST",
    json: { email },
  });
}

export function resetPassword(payload: { token: string; password: string }) {
  return requestJson<MessageResponse>("auth/reset-password", {
    method: "POST",
    json: payload,
  });
}
