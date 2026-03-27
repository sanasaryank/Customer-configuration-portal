import React from 'react';
import type { JsonValue } from '../types/common';

/**
 * Render a single JSON value from history diff.
 * - Primitive: render as string
 * - Array: render as comma-joined list
 * - Object: render as formatted JSON block
 */
export function renderDiffValue(value: JsonValue): React.ReactNode {
  if (value === null) return React.createElement('span', { className: 'text-gray-400 italic' }, 'null');
  if (typeof value === 'boolean') return React.createElement('span', null, value ? 'true' : 'false');
  if (typeof value === 'number') return React.createElement('span', null, String(value));
  if (typeof value === 'string') return React.createElement('span', null, value || '—');

  if (Array.isArray(value)) {
    if (value.length === 0) return React.createElement('span', { className: 'text-gray-400 italic' }, '[]');
    return React.createElement(
      'ul',
      { className: 'list-disc list-inside space-y-0.5' },
      value.map((item, i) =>
        React.createElement('li', { key: i }, renderDiffValue(item)),
      ),
    );
  }

  // Object
  return React.createElement(
    'pre',
    {
      className:
        'bg-gray-50 border border-gray-200 rounded p-2 text-xs overflow-x-auto whitespace-pre-wrap',
    },
    JSON.stringify(value, null, 2),
  );
}

/**
 * Parse a nested field path like "generalInfo->name->ARM" into a readable display string.
 */
export function formatFieldPath(field: string): string {
  return field.split('->').join(' → ');
}
