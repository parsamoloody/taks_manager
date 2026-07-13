import ky, { type Options } from "ky";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export const apiClient = ky.create({
  prefix: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  retry: 1,
  timeout: 10000,
});

export async function requestJson<T>(path: string, options?: Options) {
  try {
    return (await apiClient(path, options).json()) as T;
  } catch (error) {
    if (error && typeof error === "object" && "response" in error) {
      const httpError = error as {
        response?: Response;
        message?: string;
      };

      const response = httpError.response;
      if (response) {
        const message = await response.text().catch(() => "Request failed");
        throw new ApiError(message || httpError.message || "Request failed", response.status, message);
      }
    }

    throw new ApiError("Request failed", 500, error);
  }
}
