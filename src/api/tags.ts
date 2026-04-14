import { get, post, put } from './client';
import { TAG_ENDPOINT_MAP } from '../constants/endpoints';
import type {
  TagListItem,
  TagDictionaryItem,
  TagCreatePayload,
  TagUpdatePayload,
  TagDictionaryKey,
} from '../types/tag';

export async function getTags(
  key: TagDictionaryKey,
): Promise<TagListItem[]> {
  const result = await get<unknown>(TAG_ENDPOINT_MAP[key]);
  if (Array.isArray(result)) return result as TagListItem[];
  return [];
}

export async function getTagItem(
  key: TagDictionaryKey,
  id: string,
): Promise<TagDictionaryItem> {
  return get<TagDictionaryItem>(`${TAG_ENDPOINT_MAP[key]}/${id}`);
}

export async function createTag(
  key: TagDictionaryKey,
  payload: TagCreatePayload,
): Promise<TagDictionaryItem> {
  return post<TagDictionaryItem>(TAG_ENDPOINT_MAP[key], payload);
}

export async function updateTag(
  key: TagDictionaryKey,
  id: string,
  payload: TagUpdatePayload,
): Promise<TagDictionaryItem> {
  return put<TagDictionaryItem>(`${TAG_ENDPOINT_MAP[key]}/${id}`, payload);
}
