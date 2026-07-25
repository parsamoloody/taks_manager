import type { NextApiRequest, NextApiResponse } from "next";
import { fetchBackend, isUnauthorizedError } from "~/server/api/client";
import { clearAccessToken, getAccessToken } from "~/server/auth/session";
import {
  isSameOrigin,
  sendApiError,
  sendMethodNotAllowed,
  setPrivateNoStore,
} from "~/server/http/handlers";

const ALLOWED_METHODS = [
  "GET",
  "HEAD",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
] as const;

function getForwardPath(request: NextApiRequest) {
  const value = request.query.path;
  const segments = Array.isArray(value) ? value : value ? [value] : [];
  if (segments.length === 0) return undefined;
  return segments.map((segment) => encodeURIComponent(segment)).join("/");
}

function getQueryString(request: NextApiRequest) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(request.query)) {
    if (key === "path" || value === undefined) continue;
    for (const item of Array.isArray(value) ? value : [value]) {
      search.append(key, item);
    }
  }

  const query = search.toString();
  return query ? `?${query}` : "";
}

function getForwardBody(request: NextApiRequest) {
  if (request.method === "GET" || request.method === "HEAD") return undefined;
  if (
    request.body === undefined ||
    request.body === null ||
    request.body === ""
  ) {
    return undefined;
  }
  if (Buffer.isBuffer(request.body)) return request.body.toString();
  if (typeof request.body === "string") return request.body;
  return JSON.stringify(request.body);
}

export default async function proxy(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  setPrivateNoStore(response);

  const method = request.method?.toUpperCase();
  if (!method || !(ALLOWED_METHODS as readonly string[]).includes(method)) {
    sendMethodNotAllowed(response, ALLOWED_METHODS);
    return;
  }

  if (!["GET", "HEAD"].includes(method) && !isSameOrigin(request)) {
    response.status(403).json({
      ok: false,
      message: "Cross-origin mutation requests are not allowed.",
    });
    return;
  }

  const token = getAccessToken(request);
  if (!token) {
    response.status(401).json({ message: "Unauthorized" });
    return;
  }

  const path = getForwardPath(request);
  if (!path) {
    response.status(400).json({ message: "A backend path is required." });
    return;
  }

  const headers = new Headers();
  headers.set("Authorization", `Bearer ${token}`);
  headers.set(
    "Accept",
    typeof request.headers.accept === "string"
      ? request.headers.accept
      : "application/json",
  );

  const body = getForwardBody(request);
  if (body !== undefined) {
    headers.set(
      "Content-Type",
      typeof request.headers["content-type"] === "string"
        ? request.headers["content-type"]
        : "application/json",
    );
  }

  try {
    const upstream = await fetchBackend(`${path}${getQueryString(request)}`, {
      method,
      headers,
      body,
    });

    if (upstream.status === 401) clearAccessToken(response);

    const contentType = upstream.headers.get("content-type");
    if (contentType) response.setHeader("Content-Type", contentType);
    response.status(upstream.status);

    if (
      method === "HEAD" ||
      upstream.status === 204 ||
      upstream.status === 304
    ) {
      response.end();
      return;
    }

    const payload = Buffer.from(await upstream.arrayBuffer());
    response.send(payload);
  } catch (error) {
    if (isUnauthorizedError(error)) clearAccessToken(response);
    sendApiError(response, error);
  }
}
