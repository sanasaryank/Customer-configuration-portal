import { get, post } from './client';
import { ENDPOINTS } from '../constants/endpoints';
import type { WorkingDaysResponse, WorkingDayPayload } from '../types/workingDays';

export async function getWorkingDays(countryId: string): Promise<WorkingDaysResponse> {
  return get<WorkingDaysResponse>(`${ENDPOINTS.WORKING_DAYS}/${countryId}`);
}

export async function postWorkingDay(
  countryId: string,
  payload: WorkingDayPayload,
): Promise<void> {
  return post<void>(`${ENDPOINTS.WORKING_DAYS}/${countryId}`, payload);
}
