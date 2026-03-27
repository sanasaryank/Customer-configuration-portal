import type { JsonValue } from './common';

export type HistoryActionType = 'create' | 'update' | 'delete';

// Item in GET /history or GET /history/{objectId} response
export interface HistoryListItem {
  id: number;
  date: number; // Unix timestamp in SECONDS
  userId: string;
  actionType: HistoryActionType;
  objectType: string;
  objectId: string;
}

// Single field diff in GET /historyItem/{id} response
export interface HistoryDiffEntry {
  oldState: {
    field: string; // may be nested: "field1->field2->field3"
    value: JsonValue;
  };
  newState: {
    field: string;
    value: JsonValue;
  };
}

// GET /historyItem/{id} response is an array of diffs
export type HistoryDetail = HistoryDiffEntry[];
