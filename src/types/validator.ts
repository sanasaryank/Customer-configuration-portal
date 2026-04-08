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

export interface ValidatorListItem {
  id: string;
  version: string;
  endpoint: string;
  schema: SchemaNode;
}

export interface ValidatorItem extends ValidatorListItem {
  hash: string;
}

export interface ValidatorCreatePayload {
  id?: string;
  version: string;
  endpoint: string;
  schema: SchemaNode;
}

export interface ValidatorUpdatePayload extends ValidatorCreatePayload {
  hash: string;
}
