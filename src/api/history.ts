import { get } from './client';
import { ENDPOINTS } from '../constants/endpoints';
import type { HistoryListItem, HistoryDetail, LicenseMovingItem } from '../types/history';

// GET /history — all action history items
export async function getAllHistory(): Promise<HistoryListItem[]> {
  const result = await get<unknown>(ENDPOINTS.HISTORY_ACTIONS);
  if (Array.isArray(result)) return result as HistoryListItem[];
  return [];
}

// GET /history/{objectId} — action history for one object
export async function getHistoryByObject(
  objectId: string,
): Promise<HistoryListItem[]> {
  const result = await get<unknown>(`${ENDPOINTS.HISTORY_ACTIONS_BY_OBJECT}/${objectId}`);
  if (Array.isArray(result)) return result as HistoryListItem[];
  return [];
}

// GET /historyItem/{id} — diff object for a single history item
export async function getHistoryItem(id: number): Promise<HistoryDetail> {
  return get<HistoryDetail>(`${ENDPOINTS.HISTORY_ITEM}/${id}`);
}

// GET /moveLicense — all license moving history items
export async function getLicenseMovingHistory(): Promise<LicenseMovingItem[]> {
  const result = await get<unknown>(ENDPOINTS.HISTORY_LICENSE_MOVING);
  if (Array.isArray(result)) return result as LicenseMovingItem[];
  return [];
}
