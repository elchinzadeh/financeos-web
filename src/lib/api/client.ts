const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

let unauthorizedHandler: (() => void) | null = null;

/** (app) layout auth-context-i qeydiyyatdan keçirir, 401 cavabında çağırılır. */
export function registerUnauthorizedHandler(handler: () => void) {
  unauthorizedHandler = handler;
}

interface ApiFetchOptions {
  method?: 'GET' | 'POST';
  body?: unknown;
  token?: string | null;
}

interface BackendErrorBody {
  message?: string | string[];
  error?: string;
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (res.status === 401) {
    unauthorizedHandler?.();
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as BackendErrorBody | null;
    const message = Array.isArray(body?.message) ? body.message.join(', ') : (body?.message ?? res.statusText);
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) {
    return undefined as T;
  }
  return (await res.json()) as T;
}
