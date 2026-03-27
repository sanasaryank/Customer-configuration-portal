import type { Translation } from './common';

export interface CountryListItem {
  id: string;
  name: Translation;
  description: string;
  isBlocked: boolean;
}

export interface Country extends CountryListItem {
  hash: string;
}

export interface CountryCreatePayload {
  id?: string;
  name: Translation;
  description: string;
  isBlocked: boolean;
}

export interface CountryUpdatePayload extends CountryCreatePayload {
  id: string;
  hash: string;
}
