import { get, post, put } from './client';
import { DICT_ENDPOINT_MAP } from '../constants/endpoints';
import type {
  DictionaryItem,
  DictionaryListItem,
  DictionaryCreatePayload,
  DictionaryUpdatePayload,
  DictionaryKey,
} from '../types/dictionary';

export async function getDictionary(
  key: DictionaryKey,
): Promise<DictionaryListItem[]> {
  const result = await get<unknown>(DICT_ENDPOINT_MAP[key]);
  if (Array.isArray(result)) return result as DictionaryListItem[];
  return [];
}

export async function getDictionaryItem(
  key: DictionaryKey,
  id: string,
): Promise<DictionaryItem> {
  return get<DictionaryItem>(`${DICT_ENDPOINT_MAP[key]}/${id}`);
}

export async function createDictionaryItem(
  key: DictionaryKey,
  payload: DictionaryCreatePayload,
): Promise<DictionaryItem> {
  return post<DictionaryItem>(DICT_ENDPOINT_MAP[key], payload);
}

export async function updateDictionaryItem(
  key: DictionaryKey,
  id: string,
  payload: DictionaryUpdatePayload,
): Promise<DictionaryItem> {
  return put<DictionaryItem>(`${DICT_ENDPOINT_MAP[key]}/${id}`, payload);
}


