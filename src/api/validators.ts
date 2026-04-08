import { get, post, put, del } from './client';
import { ENDPOINTS } from '../constants/endpoints';
import type {
  ValidatorItem,
  ValidatorListItem,
  ValidatorCreatePayload,
  ValidatorUpdatePayload,
} from '../types/validator';

export async function getValidators(): Promise<ValidatorListItem[]> {
  const result = await get<unknown>(ENDPOINTS.VALIDATORS);
  if (Array.isArray(result)) return result as ValidatorListItem[];
  return [];
}

export async function getValidator(id: string): Promise<ValidatorItem> {
  return get<ValidatorItem>(`${ENDPOINTS.VALIDATORS}/${id}`);
}

export async function createValidator(
  payload: ValidatorCreatePayload,
): Promise<ValidatorListItem> {
  return post<ValidatorListItem>(ENDPOINTS.VALIDATORS, payload);
}

export async function updateValidator(
  id: string,
  payload: ValidatorUpdatePayload,
): Promise<ValidatorListItem> {
  return put<ValidatorListItem>(`${ENDPOINTS.VALIDATORS}/${id}`, payload);
}

export async function deleteValidator(id: string): Promise<void> {
  return del(`${ENDPOINTS.VALIDATORS}/${id}`);
}
