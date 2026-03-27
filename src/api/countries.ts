import { get, post, put, del } from './client';
import { ENDPOINTS } from '../constants/endpoints';
import type {
  Country,
  CountryListItem,
  CountryCreatePayload,
  CountryUpdatePayload,
} from '../types/country';

export async function getCountries(): Promise<CountryListItem[]> {
  return get<CountryListItem[]>(ENDPOINTS.COUNTRIES);
}

export async function getCountry(id: string): Promise<Country> {
  return get<Country>(`${ENDPOINTS.COUNTRIES}/${id}`);
}

export async function createCountry(payload: CountryCreatePayload): Promise<Country> {
  return post<Country>(ENDPOINTS.COUNTRIES, payload);
}

export async function updateCountry(
  id: string,
  payload: CountryUpdatePayload,
): Promise<Country> {
  return put<Country>(`${ENDPOINTS.COUNTRIES}/${id}`, payload);
}

export async function deleteCountry(id: string): Promise<void> {
  return del(`${ENDPOINTS.COUNTRIES}/${id}`);
}
