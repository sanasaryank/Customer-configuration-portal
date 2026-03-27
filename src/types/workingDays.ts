// GET /workingDays response
export interface WorkingDaysResponse {
  dates: string[]; // YYYY-MM-DD strings
}

// POST /workingDays payload
export interface WorkingDayPayload {
  date: string; // YYYY-MM-DD
  action: 'add' | 'remove';
}
