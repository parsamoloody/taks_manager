import type { NextApiRequest } from "next";

export type RequestFields = Record<string, unknown>;

export class RequestBodyError extends Error {
  readonly status = 400;

  constructor(message: string) {
    super(message);
    this.name = "RequestBodyError";
  }
}

function isRecord(value: unknown): value is RequestFields {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function fromSearchParams(params: URLSearchParams): RequestFields {
  const fields: RequestFields = {};

  for (const key of new Set(params.keys())) {
    const values = params.getAll(key);
    fields[key] = values.length > 1 ? values : (values[0] ?? "");
  }

  return fields;
}

export function parseRequestFields(request: NextApiRequest): RequestFields {
  const body: unknown = request.body;

  if (isRecord(body)) return body;
  if (body === undefined || body === null || body === "") return {};

  const text = Buffer.isBuffer(body)
    ? body.toString("utf8")
    : typeof body === "string"
      ? body
      : "";

  if (!text) {
    throw new RequestBodyError("Request body must be a JSON object.");
  }

  const contentType = request.headers["content-type"] ?? "";
  if (contentType.includes("application/x-www-form-urlencoded")) {
    return fromSearchParams(new URLSearchParams(text));
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new RequestBodyError("Request body contains invalid JSON.");
  }

  if (!isRecord(parsed)) {
    throw new RequestBodyError("Request body must be a JSON object.");
  }

  return parsed;
}

export function fieldString(
  fields: RequestFields,
  name: string,
  fallback = "",
) {
  const value = fields[name];
  if (value === undefined || value === null) return fallback;
  if (Array.isArray(value)) {
    const first = value[0];
    return first === undefined || first === null ? fallback : String(first);
  }
  return String(value);
}

export function fieldTrimmedString(
  fields: RequestFields,
  name: string,
  fallback = "",
) {
  return fieldString(fields, name, fallback).trim();
}

export function fieldNumber(fields: RequestFields, name: string, fallback = 0) {
  const raw = fields[name];
  if (raw === undefined || raw === null || raw === "") return fallback;
  const value = Number(Array.isArray(raw) ? raw[0] : raw);
  return Number.isFinite(value) ? value : fallback;
}

export function fieldStrings(fields: RequestFields, name: string) {
  const value = fields[name];
  if (value === undefined || value === null || value === "") return [];
  return (Array.isArray(value) ? value : [value])
    .filter((item) => item !== undefined && item !== null && item !== "")
    .map(String);
}
