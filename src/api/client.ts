import { API_BASE } from '../constants/endpoints';
import { ROUTES } from '../constants/routes';

const debugHeaders: Record<string, string> = import.meta.env.DEV
  ? { 'X-Origin': 'cpp.apihub.am' }
  : {};

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

async function handleResponse<T>(res: Response, skipRedirectOn401 = false): Promise<T> {
  if (res.status === 401 && !skipRedirectOn401) {
    window.location.href = ROUTES.LOGIN;
    return undefined as unknown as T;
  }
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      if (typeof body?.message === 'string') message = body.message;
      else if (typeof body?.error === 'string') message = body.error;
    } catch {
      // ignore parse errors
    }
    throw new HttpError(res.status, message);
  }
  // 204 or empty body
  const text = await res.text();
  if (!text) return undefined as unknown as T;
  return JSON.parse(text) as T;
}

export async function get<T>(path: string, skipRedirectOn401 = false): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...debugHeaders },
  });
  return handleResponse<T>(res, skipRedirectOn401);
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
