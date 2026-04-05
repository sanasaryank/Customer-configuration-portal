import type { Translation } from './common';

// Applies to: integrationTypes, restaurantTypes, hotelTypes, menuTypes,
// priceSegments, productGroups, customerGroups, customerStatus

export interface DictionaryListItem {
  id: string;
  name: Translation;
  description: string;
  isBlocked: boolean;
}

export interface DictionaryItem extends DictionaryListItem {
  hash: string;
}

export interface DictionaryCreatePayload {
  id?: string;
  name: Translation;
  description: string;
  isBlocked: boolean;
}

export interface DictionaryUpdatePayload extends DictionaryCreatePayload {
  id: string;
  hash: string;
}

// All dictionary endpoint keys
export type DictionaryKey =
  | 'integrationTypes'
  | 'restaurantTypes'
  | 'hotelTypes'
  | 'menuTypes'
  | 'priceSegments'
  | 'productGroups'
  | 'customerGroups'
  | 'customerStatus'
  | 'countries'
  | 'cities'
  | 'districts';
