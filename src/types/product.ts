import type { Translation } from './common';

export type LicenseFieldKind =
  | 'string'
  | 'number'
  | 'date'
  | 'time'
  | 'datetime'
  | 'boolean';

export interface LicenseTemplateField {
  name: string;
  kind: LicenseFieldKind;
  required: boolean;
}

export interface ProductListItem {
  id: string;
  groupId: string;
  name: Translation;
  isBlocked: boolean;
  licenseTemplate: LicenseTemplateField[];
  hasUsers: boolean;
  description: string;
  tags: string[];
}

export interface Product extends ProductListItem {
  hash: string;
}

export interface ProductCreatePayload {
  id?: string;
  groupId: string;
  name: Translation;
  isBlocked: boolean;
  licenseTemplate: LicenseTemplateField[];
  hasUsers: boolean;
  description: string;
  tags: string[];
}

export interface ProductUpdatePayload extends ProductCreatePayload {
  hash: string;
}
