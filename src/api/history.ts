import { get } from './client';
import { ENDPOINTS } from '../constants/endpoints';
import type { HistoryListItem, HistoryDetail } from '../types/history';

// GET /history — all history items
export async function getAllHistory(): Promise<HistoryListItem[]> {
  const result = await get<unknown>(ENDPOINTS.HISTORY);
  if (Array.isArray(result)) return result as HistoryListItem[];
  return [];
}

// GET /history/{objectId} — history for one object
export async function getHistoryByObject(
  objectId: string,
): Promise<HistoryListItem[]> {
  const result = await get<unknown>(`${ENDPOINTS.HISTORY}/${objectId}`);
  if (Array.isArray(result)) return result as HistoryListItem[];
  return [];
}

// GET /historyItem/{id} — diff array for a single history item
export async function getHistoryItem(id: number): Promise<HistoryDetail> {
  return get<HistoryDetail>(`${ENDPOINTS.HISTORY_ITEM}/${id}`);
}
