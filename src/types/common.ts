// Translation object — keys must remain exactly ARM / ENG / RUS
export interface Translation {
  ARM: string;
  ENG: string;
  RUS: string;
}

// Safe JSON value type (used in history diff values)
export type JsonPrimitive = string | number | boolean | null;
export type JsonArray = JsonValue[];
export type JsonObject = { [key: string]: JsonValue };
export type JsonValue = JsonPrimitive | JsonArray | JsonObject;

// Pagination state for client-side list operations
export interface PaginationState {
  page: number;
  pageSize: number;
}

// Sort state for client-side list operations
export interface SortState {
  key: string;
  direction: 'asc' | 'desc';
}

// Generic list operation state
export interface ListState {
  search: string;
  sort: SortState | null;
  pagination: PaginationState;
}

// Language codes — must match translation object keys exactly
export type LangCode = 'ARM' | 'ENG' | 'RUS';

// API error shape
export interface ApiError {
  status: number;
  message: string;
}
