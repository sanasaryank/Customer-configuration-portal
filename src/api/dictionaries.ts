import { get, post, put, del } from './client';
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
  return get<DictionaryListItem[]>(DICT_ENDPOINT_MAP[key]);
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

export async function deleteDictionaryItem(
  key: DictionaryKey,
  id: string,
): Promise<void> {
  return del(`${DICT_ENDPOINT_MAP[key]}/${id}`);
}
