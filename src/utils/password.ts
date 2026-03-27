/**
 * Safely omit write-only password fields from a payload object when the value is empty.
 *
 * Per spec §2.5:
 * - if field is not sent -> do not change value
 * - if field is sent as "" -> also do not change value
 * - backend never returns password fields
 *
 * Usage: call omitEmptyPassword(payload, ['password', 'serverPassword'])
 * before sending to the API on edit (PUT).
 */
export function omitEmptyPasswords<T extends Record<string, unknown>>(
  payload: T,
  passwordKeys: string[],
): Partial<T> {
  const result = { ...payload };
  for (const key of passwordKeys) {
    const value = result[key as keyof T];
    if (value === '' || value === null || value === undefined) {
      delete result[key as keyof T];
    }
  }
  return result;
}

/**
 * Omit password from a nested object within a payload.
 * Used for customer connectionInfo passwords.
 */
export function omitEmptyPasswordsNested<
  T extends Record<string, unknown>,
  K extends keyof T,
>(
  payload: T,
  nestedKey: K,
  passwordKeys: string[],
): T {
  const nested = payload[nestedKey];
  if (!nested || typeof nested !== 'object' || Array.isArray(nested)) {
    return payload;
  }
  const cleaned: Record<string, unknown> = { ...(nested as Record<string, unknown>) };
  for (const key of passwordKeys) {
    const value = cleaned[key];
    if (value === '' || value === null || value === undefined) {
      delete cleaned[key];
    }
  }
  return { ...payload, [nestedKey]: cleaned };
}
