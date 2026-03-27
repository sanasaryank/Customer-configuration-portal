import { get, post, postWithHeader } from './client';
import { ENDPOINTS } from '../constants/endpoints';
import type { CurrentUser } from '../types/auth';

// POST /login — uses Basic Authorization header only
export async function login(username: string, password: string): Promise<void> {
  const credentials = btoa(`${username}:${password}`);
  await postWithHeader<void>(ENDPOINTS.LOGIN, {
    Authorization: `Basic ${credentials}`,
  });
}

// POST /logout
export async function logout(): Promise<void> {
  await post<void>(ENDPOINTS.LOGOUT);
}

// GET /me
export async function getMe(): Promise<CurrentUser> {
  return get<CurrentUser>(ENDPOINTS.ME);
}
