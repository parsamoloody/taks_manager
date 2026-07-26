import { createHmac, timingSafeEqual } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";

const COOKIE_NAME = "__session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

type SessionRequest = Pick<IncomingMessage, "headers">;
type SessionResponse = Pick<ServerResponse, "getHeader" | "setHeader">;

interface SessionPayload {
  accessToken: string;
  expiresAt: number;
}

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET env var must be set");
  }
  return secret;
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret())
    .update(value)
    .digest("base64url");
}

function parseCookies(header: string | string[] | undefined) {
  const cookies = new Map<string, string>();
  const cookieHeader = Array.isArray(header) ? header.join(";") : header;

  for (const entry of cookieHeader?.split(";") ?? []) {
    const separator = entry.indexOf("=");
    if (separator < 0) continue;

    const name = entry.slice(0, separator).trim();
    const rawValue = entry.slice(separator + 1).trim();
    if (!name) continue;

    try {
      cookies.set(name, decodeURIComponent(rawValue));
    } catch {
      // Ignore malformed cookies instead of failing the whole request.
    }
  }

  return cookies;
}

function encodeSession(payload: SessionPayload) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

function decodeSession(value: string): SessionPayload | undefined {
  const separator = value.lastIndexOf(".");
  if (separator <= 0) return undefined;

  const encoded = value.slice(0, separator);
  const receivedSignature = value.slice(separator + 1);
  const expectedSignature = sign(encoded);
  const receivedBuffer = Buffer.from(receivedSignature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    receivedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(receivedBuffer, expectedBuffer)
  ) {
    return undefined;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    ) as Partial<SessionPayload>;

    if (
      typeof payload.accessToken !== "string" ||
      !payload.accessToken ||
      typeof payload.expiresAt !== "number" ||
      payload.expiresAt <= Date.now()
    ) {
      return undefined;
    }

    return {
      accessToken: payload.accessToken,
      expiresAt: payload.expiresAt,
    };
  } catch {
    return undefined;
  }
}

function appendSetCookie(response: SessionResponse, cookie: string) {
  const current = response.getHeader("Set-Cookie");

  if (Array.isArray(current)) {
    response.setHeader("Set-Cookie", [...current.map(String), cookie]);
    return;
  }

  if (current !== undefined) {
    response.setHeader("Set-Cookie", [String(current), cookie]);
    return;
  }

  response.setHeader("Set-Cookie", cookie);
}

function serializeCookie(value: string, maxAge: number, expires: Date) {
  const secure = process.env.APP_ENV === "production" ? "; Secure" : "";
  return (
    [
      `${COOKIE_NAME}=${encodeURIComponent(value)}`,
      "Path=/",
      "HttpOnly",
      "SameSite=Lax",
      `Max-Age=${maxAge}`,
      `Expires=${expires.toUTCString()}`,
      "Priority=High",
    ].join("; ") + secure
  );
}

export function getSession(request: SessionRequest) {
  const value = parseCookies(request.headers.cookie).get(COOKIE_NAME);
  return value ? decodeSession(value) : undefined;
}

export function getAccessToken(request: SessionRequest) {
  return getSession(request)?.accessToken;
}

export function setAccessToken(response: SessionResponse, accessToken: string) {
  if (!accessToken) throw new Error("An access token is required");

  const expiresAt = Date.now() + SESSION_TTL_SECONDS * 1_000;
  const value = encodeSession({ accessToken, expiresAt });
  appendSetCookie(
    response,
    serializeCookie(value, SESSION_TTL_SECONDS, new Date(expiresAt)),
  );
}

export function clearAccessToken(response: SessionResponse) {
  appendSetCookie(response, serializeCookie("", 0, new Date(0)));
}

export const sessionCookieName = COOKIE_NAME;
export const sessionTtlSeconds = SESSION_TTL_SECONDS;
