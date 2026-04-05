import React from 'react';
import type { JsonValue } from '../types/common';
import type { LeafDiffNode, NestedDiffNode } from '../types/history';

// ─── Constants ────────────────────────────────────────────────────────────────

/** The sentinel string the backend uses to represent an absent value. */
export const MISSING_SENTINEL = '<missing>';

/**
 * Regex that matches backend-generated array-item match labels such as:
 *   id=10  |  new:id=15  |  old:#1  |  best_match#1  |  #3
 * These are NOT normal entity field names and need visual distinction.
 */
const ARRAY_ITEM_LABEL_RE = /^(new:|old:|best_match#|id=|#\d)/;

// ─── Type guards ──────────────────────────────────────────────────────────────

/**
 * Returns true when `node` is a leaf diff node (has both "old" and "new" keys).
 * Arrays are never leaves; only plain objects qualify.
 */
export function isLeafDiffNode(node: unknown): node is LeafDiffNode {
  if (node === null || typeof node !== 'object' || Array.isArray(node)) return false;
  const obj = node as Record<string, unknown>;
  return Object.prototype.hasOwnProperty.call(obj, 'old') &&
         Object.prototype.hasOwnProperty.call(obj, 'new');
}

/**
 * Returns true when `node` is a non-empty nested diff object (not a leaf, not an array).
 */
export function isNestedDiffNode(node: unknown): node is NestedDiffNode {
  if (node === null || typeof node !== 'object' || Array.isArray(node)) return false;
  if (isLeafDiffNode(node)) return false;
  return Object.keys(node as object).length > 0;
}

// ─── Value renderer ───────────────────────────────────────────────────────────

/**
 * Renders the raw `old` or `new` value from a leaf diff node:
 * - "<missing>" → styled missing marker
 * - array        → pretty-printed JSON block (atomic arrays are not further diffed)
 * - other        → string representation
 */
export function renderDiffValue(value: JsonValue): React.ReactNode {
  if (value === null) {
    return <span className="text-gray-400 italic">null</span>;
  }
  if (typeof value === 'string') {
    if (value === MISSING_SENTINEL) {
      return (
        <span className="inline-flex items-center rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono text-gray-400 italic">
          &lt;missing&gt;
        </span>
      );
    }
    return <span>{value || '—'}</span>;
  }
  if (typeof value === 'boolean') return <span>{value ? 'true' : 'false'}</span>;
  if (typeof value === 'number') return <span>{String(value)}</span>;
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-gray-400 italic font-mono">[]</span>;
    }
    return (
      <pre className="bg-gray-50 border border-gray-200 rounded p-2 text-xs overflow-x-auto whitespace-pre-wrap">
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }
  // Plain object value (rare; backend normally stringifies scalars)
  return (
    <pre className="bg-gray-50 border border-gray-200 rounded p-2 text-xs overflow-x-auto whitespace-pre-wrap">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

// ─── Internal sub-components ──────────────────────────────────────────────────

/** Header for a nested section (field group or array-item group). */
function SectionLabel({ label }: { label: string }) {
  const isArrayItem = ARRAY_ITEM_LABEL_RE.test(label);
  return (
    <div
      className={
        isArrayItem
          ? 'px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border-b border-indigo-100'
          : 'px-3 py-1.5 text-xs font-mono font-semibold text-gray-600 bg-gray-100 border-b border-gray-200'
      }
    >
      {label}
    </div>
  );
}

/** Renders one leaf diff row (field label + old/new side-by-side). */
function LeafDiffRow({
  label,
  node,
  t,
}: {
  label: string | undefined;
  node: LeafDiffNode;
  t: (key: string) => string;
}) {
  return (
    <div className="rounded-md border border-gray-200 overflow-hidden">
      {label !== undefined && (
        <div className="bg-gray-50 px-3 py-2 text-xs font-mono font-semibold text-gray-700 border-b border-gray-200">
          {label}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
        <div className="p-3">
          <p className="text-xs font-medium text-gray-500 mb-1">{t('history.oldValue')}</p>
          <div className="text-sm text-gray-800">{renderDiffValue(node.old)}</div>
        </div>
        <div className="p-3 bg-green-50/30">
          <p className="text-xs font-medium text-gray-500 mb-1">{t('history.newValue')}</p>
          <div className="text-sm text-gray-800">{renderDiffValue(node.new)}</div>
        </div>
      </div>
    </div>
  );
}

// ─── Public recursive renderer ────────────────────────────────────────────────

export interface DiffNodeRendererProps {
  /** Key/label for this node (undefined only at the very root call). */
  label?: string;
  node: LeafDiffNode | NestedDiffNode;
  /** i18n translator; accepts `(key: string) => string` for easy testing. */
  t: (key: string) => string;
}

/**
 * Recursively renders a diff tree node.
 *
 * - Leaf nodes   → old/new row card
 * - Nested nodes → labelled section card containing recursively rendered children
 * - Empty nodes  → renders nothing
 */
export function DiffNodeRenderer({
  label,
  node,
  t,
}: DiffNodeRendererProps): React.ReactElement | null {
  // ── Leaf ──────────────────────────────────────────────────────────────────
  if (isLeafDiffNode(node)) {
    return <LeafDiffRow label={label} node={node} t={t} />;
  }

  // ── Nested object ─────────────────────────────────────────────────────────
  const entries = Object.entries(node as NestedDiffNode).filter(
    ([, child]) => isLeafDiffNode(child) || isNestedDiffNode(child),
  );

  if (entries.length === 0) return null;

  const children = entries.map(([key, child]) => (
    <DiffNodeRenderer
      key={key}
      label={key}
      node={child as LeafDiffNode | NestedDiffNode}
      t={t}
    />
  ));

  // Root-level call (no label): just stack children
  if (label === undefined) {
    return <div className="space-y-3">{children}</div>;
  }

  // Labelled nested section: wrap in a bordered card with a section header
  return (
    <div className="rounded-md border border-gray-200 overflow-hidden">
      <SectionLabel label={label} />
      <div className="p-2 space-y-2">{children}</div>
    </div>
  );
}
