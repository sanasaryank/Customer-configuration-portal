// GET /workingDays/{countryId} response — plain array of non-working day YYYY-MM-DD strings (holidays/days off)
export type WorkingDaysResponse = string[];

// POST /workingDays/{countryId} payload
export interface WorkingDayPayload {
  date: string; // YYYY-MM-DD
  action: 'add' | 'remove';
}
