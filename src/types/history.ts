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

/**
 * Leaf diff node: the terminal node of a diff tree.
 * Both `old` and `new` are the raw backend-provided values
 * (scalars serialised to string, arrays kept as arrays).
 * The string "<missing>" signals an absent value.
 */
export interface LeafDiffNode {
  old: JsonValue;
  new: JsonValue;
}

/**
 * Nested diff node: each key maps to either a LeafDiffNode or
 * another NestedDiffNode.  Keys may be real field names OR
 * array-item match labels produced by the backend
 * (e.g. "id=10", "new:id=15", "best_match#1", "old:#1").
 */
export type NestedDiffNode = {
  [key: string]: LeafDiffNode | NestedDiffNode;
};

// GET /historyItem/{id} response — nested diff object
export type HistoryDetail = NestedDiffNode;

// ── License moving history ─────────────────────────────────────────────────

import type { CustomerLicenseProduct, CustomerConnectionInfo } from './customer';

// Item in GET /history/licenseMoving response
export interface LicenseMovingItem {
  date: number;       // Unix timestamp in SECONDS
  from: string;       // customerId
  to: string;         // customerId
  user: string;       // employeeId
  license: CustomerLicenseProduct & { connectionInfo: CustomerConnectionInfo };
}
