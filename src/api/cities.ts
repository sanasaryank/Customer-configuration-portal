import { get, post, put, del } from './client';
import { ENDPOINTS } from '../constants/endpoints';
import type {
  City,
  CityListItem,
  CityCreatePayload,
  CityUpdatePayload,
} from '../types/city';

export async function getCities(): Promise<CityListItem[]> {
  return get<CityListItem[]>(ENDPOINTS.CITIES);
}

export async function getCity(id: string): Promise<City> {
  return get<City>(`${ENDPOINTS.CITIES}/${id}`);
}

export async function createCity(payload: CityCreatePayload): Promise<City> {
  return post<City>(ENDPOINTS.CITIES, payload);
}

export async function updateCity(
  id: string,
  payload: CityUpdatePayload,
): Promise<City> {
  return put<City>(`${ENDPOINTS.CITIES}/${id}`, payload);
}

export async function deleteCity(id: string): Promise<void> {
  return del(`${ENDPOINTS.CITIES}/${id}`);
}
