import { get, post } from './client';
import { ENDPOINTS } from '../constants/endpoints';
import type { WorkingDaysResponse, WorkingDayPayload } from '../types/workingDays';

export async function getWorkingDays(): Promise<WorkingDaysResponse> {
  return get<WorkingDaysResponse>(ENDPOINTS.WORKING_DAYS);
}

export async function postWorkingDay(
  payload: WorkingDayPayload,
): Promise<void> {
  return post<void>(ENDPOINTS.WORKING_DAYS, payload);
}
