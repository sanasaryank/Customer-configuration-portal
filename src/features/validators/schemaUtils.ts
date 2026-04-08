import type { SchemaNode } from '../../types/validator';

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
