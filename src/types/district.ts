import type { Translation } from './common';

export interface DistrictListItem {
  id: string;
  cityId: string;
  name: Translation;
  description: string;
  isBlocked: boolean;
}

export interface District extends DistrictListItem {
  hash: string;
}

export interface DistrictCreatePayload {
  id?: string;
  cityId: string;
  name: Translation;
  description: string;
  isBlocked: boolean;
}

export interface DistrictUpdatePayload extends DistrictCreatePayload {
  id: string;
  hash: string;
}
