import type { Translation } from './common';

export interface CurrentUser {
  id: string;
  username: string;
  name: Translation;
  role: 'admin' | 'superadmin';
}
