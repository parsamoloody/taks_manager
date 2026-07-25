import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { clearAccessToken, getAccessToken } from "~/server/auth/session";
import {
  BackendApiError,
  getErrorMessage,
  isUnauthorizedError,
} from "~/server/api/client";
import {
  parseRequestFields,
  RequestBodyError,
  type RequestFields,
} from "./form";

export interface MutationResult {
  ok: boolean;
  intent?: string;
  message?: string;
  redirectTo?: string;
}

interface MutationContext {
  req: NextApiRequest;
  res: NextApiResponse<MutationResult>;
  fields: RequestFields;
}

interface AuthMutationContext extends MutationContext {
  token: string;
}

type MutationCallback = (
  context: MutationContext,
) => MutationResult | Promise<MutationResult>;

type AuthMutationCallback = (
  context: AuthMutationContext,
) => MutationResult | Promise<MutationResult>;

export function setPrivateNoStore(
  response:
    | NextApiResponse
    | {
        setHeader(
          name: string,
          value: number | string | readonly string[],
        ): unknown;
      },
) {
  response.setHeader(
    "Cache-Control",
    "private, no-store, max-age=0, must-revalidate",
  );
  response.setHeader("Pragma", "no-cache");
  response.setHeader("Expires", "0");
  response.setHeader("Vary", "Cookie");
}

function firstHeader(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function isSameOrigin(request: NextApiRequest) {
  const fetchSite = firstHeader(request.headers["sec-fetch-site"]);
  if (fetchSite === "cross-site") return false;

  const origin = firstHeader(request.headers.origin);
  if (!origin) return true;

  try {
    const originUrl = new URL(origin);
    const forwardedHost = firstHeader(request.headers["x-forwarded-host"]);
    const host = (forwardedHost ?? request.headers.host)?.split(",")[0]?.trim();
    if (!host || originUrl.host !== host) return false;

    const forwardedProto = firstHeader(request.headers["x-forwarded-proto"])
      ?.split(",")[0]
      ?.trim();
    const encrypted = Boolean(
      (
        request.socket as
          (typeof request.socket & { encrypted?: boolean }) | undefined
      )?.encrypted,
    );
    const protocol = forwardedProto ?? (encrypted ? "https" : "http");
    return originUrl.protocol === `${protocol}:`;
  } catch {
    return false;
  }
}

export function sendMethodNotAllowed(
  response: NextApiResponse,
  allowed: readonly string[],
) {
  response.setHeader("Allow", allowed);
  return response.status(405).json({
    ok: false,
    message: "Method not allowed.",
  });
}

export function sendApiError(response: NextApiResponse, error: unknown) {
  const status =
    error instanceof RequestBodyError
      ? error.status
      : error instanceof BackendApiError &&
          error.status >= 400 &&
          error.status <= 599
        ? error.status
        : 500;
  const message =
    status === 500
      ? "Something went wrong. Please try again."
      : getErrorMessage(error);

  return response.status(status).json({ ok: false, message });
}

function prepareMutation(request: NextApiRequest, response: NextApiResponse) {
  setPrivateNoStore(response);

  if (request.method !== "POST") {
    sendMethodNotAllowed(response, ["POST"]);
    return false;
  }

  if (!isSameOrigin(request)) {
    response.status(403).json({
      ok: false,
      message: "Cross-origin mutation requests are not allowed.",
    });
    return false;
  }

  return true;
}

export function withMutation(
  callback: MutationCallback,
): NextApiHandler<MutationResult> {
  return async function mutationHandler(
    request: NextApiRequest,
    response: NextApiResponse<MutationResult>,
  ) {
    if (!prepareMutation(request, response)) return;

    try {
      const fields = parseRequestFields(request);
      const result = await callback({
        req: request,
        res: response,
        fields,
      });
      if (!response.writableEnded) response.status(200).json(result);
    } catch (error) {
      if (!response.writableEnded) sendApiError(response, error);
    }
  };
}

export function withAuthMutation(
  callback: AuthMutationCallback,
): NextApiHandler<MutationResult> {
  return async function authenticatedMutationHandler(
    request: NextApiRequest,
    response: NextApiResponse<MutationResult>,
  ) {
    if (!prepareMutation(request, response)) return;

    const token = getAccessToken(request);
    if (!token) {
      response.status(401).json({
        ok: false,
        message: "Unauthorized",
        redirectTo: "/login",
      });
      return;
    }

    try {
      const fields = parseRequestFields(request);
      const result = await callback({
        req: request,
        res: response,
        fields,
        token,
      });
      if (!response.writableEnded) response.status(200).json(result);
    } catch (error) {
      if (isUnauthorizedError(error)) clearAccessToken(response);
      if (!response.writableEnded) sendApiError(response, error);
    }
  };
}
