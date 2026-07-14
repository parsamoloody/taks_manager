// app/lib/api/auth.ts — no cookie logic here anymore, just the request
import type { AuthDto } from "@repo/shared";
import { requestJson } from "./client";

interface AuthResponse {
  access_token: string;
  email: string;
  id: string;
}

export function signIn(payload: AuthDto) {
  return requestJson<AuthResponse>("auth/signin", { method: "POST", json: payload });
}

export function signUp(payload: AuthDto) {
  return requestJson<AuthResponse>("auth/signup", { method: "POST", json: payload });
}