export type SchemaKind =
  | 'string'
  | 'integer'
  | 'number'
  | 'boolean'
  | 'null'
  | 'object'
  | 'array'
  | 'map'
  | 'date'
  | 'time'
  | 'datetime'
  | 'date-time';

export interface SchemaNode {
  kind: SchemaKind;
  nullable?: boolean;
  enum?: unknown[];
  // string
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: string;
  // integer / number
  min?: number;
  max?: number;
  // array
  items?: SchemaNode;
  minItems?: number;
  maxItems?: number;
  // object
  fields?: Record<string, SchemaNode>;
  required?: string[];
  allowExtra?: boolean;
  // map
  values?: SchemaNode;
  keyPattern?: string;
  keyEnum?: string[];
}

export type HttpMethod = 'POST' | 'PUT' | 'PATCH';

export interface MethodRuleSet {
  forbid_fields: string[];
  add_required: string[];
  remove_required: string[];
}

export type MethodRules = Partial<Record<HttpMethod, MethodRuleSet>>;

export function emptyMethodRuleSet(): MethodRuleSet {
  return { forbid_fields: [], add_required: [], remove_required: [] };
}

export interface ValidatorListItem {
  id: string;
  version: string;
  endpoint: string;
  schema: SchemaNode;
  method_rules?: MethodRules;
}

export interface ValidatorItem extends ValidatorListItem {
  hash: string;
}

export interface ValidatorCreatePayload {
  id?: string;
  version: string;
  endpoint: string;
  schema: SchemaNode;
  method_rules?: MethodRules;
}

export interface ValidatorUpdatePayload extends ValidatorCreatePayload {
  hash: string;
}
