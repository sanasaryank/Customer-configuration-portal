import { get, post, put, del } from './client';
import { ENDPOINTS } from '../constants/endpoints';
import type {
  District,
  DistrictListItem,
  DistrictCreatePayload,
  DistrictUpdatePayload,
} from '../types/district';

export async function getDistricts(): Promise<DistrictListItem[]> {
  return get<DistrictListItem[]>(ENDPOINTS.DISTRICTS);
}

export async function getDistrict(id: string): Promise<District> {
  return get<District>(`${ENDPOINTS.DISTRICTS}/${id}`);
}

export async function createDistrict(
  payload: DistrictCreatePayload,
): Promise<District> {
  return post<District>(ENDPOINTS.DISTRICTS, payload);
}

export async function updateDistrict(
  id: string,
  payload: DistrictUpdatePayload,
): Promise<District> {
  return put<District>(`${ENDPOINTS.DISTRICTS}/${id}`, payload);
}

export async function deleteDistrict(id: string): Promise<void> {
  return del(`${ENDPOINTS.DISTRICTS}/${id}`);
}
