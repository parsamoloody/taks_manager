const DEFAULT_API_BASE_URL = "http://localhost:4000";
const DEFAULT_TIMEOUT_MS = 10_000;

export interface RequestOptions extends Omit<RequestInit, "body"> {
  json?: unknown;
  token?: string;
  timeoutMs?: number;
}

export class BackendApiError extends Error {
  readonly status: number;
  readonly details: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "BackendApiError";
    this.status = status;
    this.details = details;
  }
}

function normalizeBaseUrl(value: string) {
  return value.replace(/\/+$/, "");
}

export function getApiBaseUrl() {
  const configured =
    [process.env.API_URL, process.env.VITE_API_URL].find((value) =>
      value?.trim(),
    ) ?? DEFAULT_API_BASE_URL;
  return normalizeBaseUrl(configured.trim());
}

function getDefaultTimeoutMs() {
  const configured = Number(process.env.API_TIMEOUT_MS);
  return Number.isFinite(configured) && configured > 0
    ? configured
    : DEFAULT_TIMEOUT_MS;
}

function messageFromPayload(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object" && "message" in payload) {
    const message = (payload as { message?: unknown }).message;
    if (Array.isArray(message)) return message.map(String).join(", ");
    if (message !== undefined && message !== null) return String(message);
  }

  if (typeof payload === "string" && payload.trim()) return payload;
  return fallback;
}

export async function fetchBackend(
  path: string,
  options: RequestInit & { timeoutMs?: number } = {},
) {
  const { timeoutMs = getDefaultTimeoutMs(), signal, ...requestInit } = options;
  const controller = new AbortController();
  const abortFromCaller = () => controller.abort(signal?.reason);
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  if (signal) {
    if (signal.aborted) abortFromCaller();
    else signal.addEventListener("abort", abortFromCaller, { once: true });
  }

  try {
    return await fetch(`${getApiBaseUrl()}/${path.replace(/^\/+/, "")}`, {
      ...requestInit,
      cache: "no-store",
      signal: controller.signal,
    });
  } catch (error) {
    if (controller.signal.aborted) {
      throw new BackendApiError(
        504,
        signal?.aborted
          ? "The backend request was cancelled."
          : "The backend request timed out.",
        error,
      );
    }

    throw new BackendApiError(
      502,
      "The backend service is unavailable.",
      error,
    );
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", abortFromCaller);
  }
}

export async function requestJson<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { json, token, headers, timeoutMs, ...rest } = options;
  const finalHeaders = new Headers(headers);

  finalHeaders.set("Accept", "application/json");
  if (json !== undefined) finalHeaders.set("Content-Type", "application/json");
  if (token) finalHeaders.set("Authorization", `Bearer ${token}`);

  const response = await fetchBackend(path, {
    ...rest,
    headers: finalHeaders,
    body: json !== undefined ? JSON.stringify(json) : undefined,
    timeoutMs,
  });

  if (response.status === 204) {
    if (!response.ok) {
      throw new BackendApiError(response.status, response.statusText);
    }
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") ?? "";
  let payload: unknown;

  if (contentType.includes("application/json")) {
    try {
      payload = await response.json();
    } catch {
      payload = undefined;
    }
  } else {
    payload = await response.text();
  }

  if (!response.ok) {
    throw new BackendApiError(
      response.status,
      messageFromPayload(
        payload,
        response.statusText || "Backend request failed.",
      ),
      payload,
    );
  }

  return payload as T;
}

export function isUnauthorizedError(error: unknown) {
  return error instanceof BackendApiError && error.status === 401;
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (Array.isArray(message)) return message.map(String).join(", ");
    if (message !== undefined && message !== null) return String(message);
  }
  return "Something went wrong. Please try again.";
}
