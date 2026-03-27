import type { Translation } from './common';

// Shape returned by GET /employees and in list (no hash)
export interface EmployeeListItem {
  id: string;
  username: string;
  name: Translation;
  role: 'admin' | 'superadmin';
  isBlocked: boolean;
  description: string;
}

// Shape returned by GET /employees/{id}, POST, PUT (includes hash)
export interface Employee extends EmployeeListItem {
  hash: string;
}

// POST payload — password required
export interface EmployeeCreatePayload {
  id?: string;
  username: string;
  password: string;
  name: Translation;
  role: 'admin' | 'superadmin';
  isBlocked: boolean;
  description: string;
}

// PUT payload — password optional, hash required
export interface EmployeeUpdatePayload {
  id: string;
  username: string;
  password?: string;
  name: Translation;
  role: 'admin' | 'superadmin';
  isBlocked: boolean;
  description: string;
  hash: string;
}
