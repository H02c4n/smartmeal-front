/**
 * API istemcisi. Server ve browser'da farklı base URL kullanır:
 *  - Browser: relative (/api/...) → Next.js rewrites backend'e proxy'ler
 *  - Server (Node): absolute (INTERNAL_API_BASE_URL) → doğrudan backend
 * Cookie'ler browser'da same-origin olarak gider.
 */

export type ApiError = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
};

export class ApiRequestError extends Error {
  status: number;
  code: string;
  details?: Record<string, unknown>;

  constructor(status: number, error: ApiError) {
    super(error.message);
    this.name = "ApiRequestError";
    this.status = status;
    this.code = error.code;
    this.details = error.details;
  }
}

function baseUrl(): string {
  if (typeof window === "undefined") {
    return process.env.INTERNAL_API_BASE_URL ?? "http://localhost:8000";
  }
  return ""; // browser: relative → proxy
}

function getCsrfToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };

  const method = (options.method ?? "GET").toUpperCase();
  if (method !== "GET" && method !== "HEAD") {
    const csrf = getCsrfToken();
    if (csrf) headers["X-CSRFToken"] = csrf;
  }

  const res = await fetch(`${baseUrl()}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const err: ApiError =
      data?.error ?? {
        code: "UNKNOWN_ERROR",
        message: `HTTP ${res.status} ${res.statusText}`,
      };
    throw new ApiRequestError(res.status, err);
  }
  return data as T;
}