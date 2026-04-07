import { API_BASE } from '../constants/endpoints';
import { ROUTES } from '../constants/routes';

const debugHeaders: Record<string, string> = import.meta.env.DEV
  ? { 'X-Origin': 'cpp.apihub.am' }
  : {};

const HTTP_STATUS_DESCRIPTIONS: Record<number, string> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  408: 'Request Timeout',
  409: 'Conflict',
  410: 'Gone',
  422: 'Unprocessable Entity',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
};

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

async function handleResponse<T>(res: Response, skipRedirect = false): Promise<T> {
  if (res.status === 401 && !skipRedirect) {
    window.location.href = ROUTES.LOGIN;
    return undefined as unknown as T;
  }
  if (!res.ok) {
    const fallback =
      res.statusText ||
      HTTP_STATUS_DESCRIPTIONS[res.status] ||
      `HTTP ${res.status}`;
    let message = fallback;
    try {
      const body = await res.json();
      if (typeof body?.code === 'number' && typeof body?.message === 'string' && body.message) {
        message = body.message;
      }
    } catch {
      // ignore parse errors — use fallback
    }
    // 502: backend is down — force local logout and redirect to login
    if (res.status === 502 && !skipRedirect) {
      const err = new HttpError(res.status, message);
      scheduleLocalLogout();
      throw err;
    }
    throw new HttpError(res.status, message);
  }
  // 204 or empty body
  const text = await res.text();
  if (!text) return undefined as unknown as T;
  return JSON.parse(text) as T;
}

/**
 * Schedule a local-only logout: clear React Query cache and redirect to login.
 * Uses a debounce so concurrent 502s don't trigger multiple redirects.
 */
let logoutTimer: ReturnType<typeof setTimeout> | null = null;
function scheduleLocalLogout() {
  if (logoutTimer) return;
  logoutTimer = setTimeout(() => {
    logoutTimer = null;
    window.location.href = ROUTES.LOGIN;
  }, 100);
}

export async function get<T>(path: string, skipRedirect = false): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...debugHeaders },
  });
  return handleResponse<T>(res, skipRedirect);
}

export async function post<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...debugHeaders },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return handleResponse<T>(res);
}

export async function postWithHeader<T>(
  path: string,
  headers: Record<string, string>,
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: { ...headers, ...debugHeaders },
  });
  return handleResponse<T>(res);
}

export async function put<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...debugHeaders },
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res);
}

export async function del(path: string): Promise<void> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...debugHeaders },
  });
  await handleResponse<void>(res);
}
