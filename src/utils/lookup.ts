import type { LangCode } from '../types/common';
import { resolveTranslation } from './translation';

export interface HasIdAndName {
  id: string;
  name: { ARM: string; ENG: string; RUS: string };
}

/**
 * Build a Map<id, displayName> from a list of entities that have id and a Translation name.
 */
export function buildLookupMap(
  items: HasIdAndName[] | null | undefined,
  lang: LangCode,
): Map<string, string> {
  const map = new Map<string, string>();
  if (!Array.isArray(items)) return map;
  for (const item of items) {
    map.set(item.id, resolveTranslation(item.name, lang));
  }
  return map;
}

/**
 * Resolve a single ID to a name string, returning the ID itself as fallback.
 */
export function resolveId(
  id: string | null | undefined,
  map: Map<string, string>,
): string {
  if (!id) return '—';
  return map.get(id) ?? id;
}

/**
 * Resolve an array of IDs to name strings joined by the given separator.
 */
export function resolveIds(
  ids: string[],
  map: Map<string, string>,
  separator = ', ',
): string {
  if (!ids || ids.length === 0) return '—';
  return ids.map((id) => map.get(id) ?? id).join(separator);
}

/**
 * Build select options from a list with id + Translation name.
 */
export function buildSelectOptions(
  items: HasIdAndName[] | null | undefined,
  lang: LangCode,
): { value: string; label: string }[] {
  if (!Array.isArray(items)) return [];
  return items.map((item) => ({
    value: item.id,
    label: resolveTranslation(item.name, lang),
  }));
}
