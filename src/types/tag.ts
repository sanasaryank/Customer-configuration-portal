import type { Translation } from './common';

export interface TagItem {
  id: string;
  name: Translation;
  description: string;
  isBlocked: boolean;
}

export interface TagListItem {
  id: string;
  name: Translation;
  items: TagItem[];
  description: string;
  isBlocked: boolean;
}

export interface TagDictionaryItem extends TagListItem {
  hash: string;
}

export interface TagCreatePayload {
  name: Translation;
  items: TagItem[];
  description: string;
  isBlocked: boolean;
}

export interface TagUpdatePayload extends TagCreatePayload {
  hash: string;
}

export type TagDictionaryKey = 'customerTags' | 'productTags';
