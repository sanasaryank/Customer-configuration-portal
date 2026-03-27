import type { Translation } from './common';

export interface CityListItem {
  id: string;
  countryId: string;
  name: Translation;
  description: string;
  isBlocked: boolean;
}

export interface City extends CityListItem {
  hash: string;
}

export interface CityCreatePayload {
  id?: string;
  countryId: string;
  name: Translation;
  description: string;
  isBlocked: boolean;
}

export interface CityUpdatePayload extends CityCreatePayload {
  id: string;
  hash: string;
}
