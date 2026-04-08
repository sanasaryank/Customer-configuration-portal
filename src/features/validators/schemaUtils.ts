import type { SchemaNode, MethodRuleSet } from '../../types/validator';

/**
 * Recursively strip `undefined` values from a schema node
 * so JSON.stringify produces clean output.
 */
export function cleanSchema(node: SchemaNode): Record<string, unknown> {
  const result: Record<string, unknown> = { kind: node.kind };

  if (node.nullable !== undefined) result.nullable = node.nullable;
  if (node.enum !== undefined) result.enum = node.enum;

  // string
  if (node.minLength !== undefined) result.minLength = node.minLength;
  if (node.maxLength !== undefined) result.maxLength = node.maxLength;
  if (node.pattern !== undefined) result.pattern = node.pattern;
  if (node.format !== undefined) result.format = node.format;

  // integer / number
  if (node.min !== undefined) result.min = node.min;
  if (node.max !== undefined) result.max = node.max;

  // array
  if (node.items !== undefined) result.items = cleanSchema(node.items);
  if (node.minItems !== undefined) result.minItems = node.minItems;
  if (node.maxItems !== undefined) result.maxItems = node.maxItems;

  // object
  if (node.fields !== undefined) {
    const fields: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(node.fields)) {
      fields[k] = cleanSchema(v);
    }
    result.fields = fields;
  }
  if (node.required !== undefined && node.required.length > 0) result.required = node.required;
  if (node.allowExtra !== undefined) result.allowExtra = node.allowExtra;

  // map
  if (node.values !== undefined) result.values = cleanSchema(node.values);
  if (node.keyPattern !== undefined) result.keyPattern = node.keyPattern;
  if (node.keyEnum !== undefined && node.keyEnum.length > 0) result.keyEnum = node.keyEnum;

  return result;
}

/**
 * Collect all dot-separated field paths from a SchemaNode tree.
 * Traverses object fields, and also recurses through array items and map values
 * when those contain objects (at any depth).
 */
export function collectFieldPaths(node: SchemaNode, prefix = ''): string[] {
  const paths: string[] = [];
  collectFieldPathsInner(node, prefix, paths);
  return paths;
}

function collectFieldPathsInner(node: SchemaNode, prefix: string, paths: string[]): void {
  if (node.kind === 'object' && node.fields) {
    for (const [name, child] of Object.entries(node.fields)) {
      const path = prefix ? `${prefix}.${name}` : name;
      paths.push(path);
      collectFieldPathsInner(child, path, paths);
    }
  } else if (node.kind === 'array' && node.items) {
    collectFieldPathsInner(node.items, prefix, paths);
  } else if (node.kind === 'map' && node.values) {
    collectFieldPathsInner(node.values, prefix, paths);
  }
}

/**
 * Collect paths that are marked as required in the base schema.
 * Traverses through arrays and maps transparently.
 */
export function collectRequiredPaths(node: SchemaNode, prefix = ''): string[] {
  const paths: string[] = [];
  collectRequiredPathsInner(node, prefix, paths);
  return paths;
}

function collectRequiredPathsInner(node: SchemaNode, prefix: string, paths: string[]): void {
  if (node.kind === 'object' && node.fields) {
    const requiredSet = new Set(node.required ?? []);
    for (const [name, child] of Object.entries(node.fields)) {
      const path = prefix ? `${prefix}.${name}` : name;
      if (requiredSet.has(name)) {
        paths.push(path);
      }
      collectRequiredPathsInner(child, path, paths);
    }
  } else if (node.kind === 'array' && node.items) {
    collectRequiredPathsInner(node.items, prefix, paths);
  } else if (node.kind === 'map' && node.values) {
    collectRequiredPathsInner(node.values, prefix, paths);
  }
}

/**
 * Apply method-specific rules to a base schema, producing the effective schema
 * for a given HTTP method.
 *
 * - forbid_fields: fields at these paths are removed from the result
 * - add_required: paths added to the required arrays at the appropriate level
 * - remove_required: paths removed from the required arrays
 */
export function applyMethodRules(
  baseSchema: SchemaNode,
  rules: MethodRuleSet | undefined,
): SchemaNode {
  if (!rules) return baseSchema;

  // Deep clone to avoid mutations
  let result: SchemaNode = JSON.parse(JSON.stringify(baseSchema));

  // 1. Remove forbidden fields
  for (const path of rules.forbid_fields) {
    result = removeFieldAtPath(result, path.split('.'));
  }

  // 2. Add required
  for (const path of rules.add_required) {
    result = addRequiredAtPath(result, path.split('.'));
  }

  // 3. Remove required
  for (const path of rules.remove_required) {
    result = removeRequiredAtPath(result, path.split('.'));
  }

  return result;
}

/**
 * Resolve a child node for a given field name, transparently passing through
 * array items and map values to reach the underlying object.
 */
function resolveChild(node: SchemaNode, fieldName: string): SchemaNode | undefined {
  if (node.kind === 'object' && node.fields) {
    return node.fields[fieldName];
  }
  if (node.kind === 'array' && node.items) {
    return resolveChild(node.items, fieldName);
  }
  if (node.kind === 'map' && node.values) {
    return resolveChild(node.values, fieldName);
  }
  return undefined;
}

/**
 * Update a child node inside a parent, transparently passing through
 * array items and map values wrappers.
 */
function updateChild(node: SchemaNode, fieldName: string, updater: (child: SchemaNode) => SchemaNode): SchemaNode {
  if (node.kind === 'object' && node.fields && node.fields[fieldName]) {
    return { ...node, fields: { ...node.fields, [fieldName]: updater(node.fields[fieldName]) } };
  }
  if (node.kind === 'array' && node.items) {
    return { ...node, items: updateChild(node.items, fieldName, updater) };
  }
  if (node.kind === 'map' && node.values) {
    return { ...node, values: updateChild(node.values, fieldName, updater) };
  }
  return node;
}

function removeFieldAtPath(node: SchemaNode, segments: string[]): SchemaNode {
  if (segments.length === 0) return node;

  // Transparently pass through array/map to reach the object
  if (node.kind === 'array' && node.items) {
    return { ...node, items: removeFieldAtPath(node.items, segments) };
  }
  if (node.kind === 'map' && node.values) {
    return { ...node, values: removeFieldAtPath(node.values, segments) };
  }

  if (node.kind !== 'object' || !node.fields) return node;

  if (segments.length === 1) {
    const fieldName = segments[0];
    const { [fieldName]: _, ...rest } = node.fields;
    const required = (node.required ?? []).filter((r) => r !== fieldName);
    return { ...node, fields: rest, required };
  }

  const [head, ...tail] = segments;
  if (!resolveChild(node, head)) return node;
  return updateChild(node, head, (child) => removeFieldAtPath(child, tail));
}

function addRequiredAtPath(node: SchemaNode, segments: string[]): SchemaNode {
  if (segments.length === 0) return node;

  if (node.kind === 'array' && node.items) {
    return { ...node, items: addRequiredAtPath(node.items, segments) };
  }
  if (node.kind === 'map' && node.values) {
    return { ...node, values: addRequiredAtPath(node.values, segments) };
  }

  if (node.kind !== 'object') return node;

  if (segments.length === 1) {
    const fieldName = segments[0];
    const required = node.required ?? [];
    if (required.includes(fieldName)) return node;
    return { ...node, required: [...required, fieldName] };
  }

  const [head, ...tail] = segments;
  if (!resolveChild(node, head)) return node;
  return updateChild(node, head, (child) => addRequiredAtPath(child, tail));
}

function removeRequiredAtPath(node: SchemaNode, segments: string[]): SchemaNode {
  if (segments.length === 0) return node;

  if (node.kind === 'array' && node.items) {
    return { ...node, items: removeRequiredAtPath(node.items, segments) };
  }
  if (node.kind === 'map' && node.values) {
    return { ...node, values: removeRequiredAtPath(node.values, segments) };
  }

  if (node.kind !== 'object') return node;

  if (segments.length === 1) {
    const fieldName = segments[0];
    const required = (node.required ?? []).filter((r) => r !== fieldName);
    return { ...node, required };
  }

  const [head, ...tail] = segments;
  if (!resolveChild(node, head)) return node;
  return updateChild(node, head, (child) => removeRequiredAtPath(child, tail));
}
