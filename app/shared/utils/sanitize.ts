import DOMPurify from 'dompurify';

/**
 * Strip all HTML/script tags from a string value.
 */
export function sanitizeString(value: string): string {
  return DOMPurify.sanitize(value, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}

/**
 * Deep-walk an object and sanitize all string fields.
 * Non-string values are passed through unchanged.
 */
export function sanitizeFormValues<T extends Record<string, unknown>>(values: T): T {
  const result: Record<string, unknown> = {};

  for (const [key, val] of Object.entries(values)) {
    if (typeof val === 'string') {
      result[key] = sanitizeString(val);
    } else if (Array.isArray(val)) {
      result[key] = val.map((item) =>
        typeof item === 'string'
          ? sanitizeString(item)
          : item && typeof item === 'object'
            ? sanitizeFormValues(item as Record<string, unknown>)
            : item,
      );
    } else if (val && typeof val === 'object' && !(val instanceof Date)) {
      result[key] = sanitizeFormValues(val as Record<string, unknown>);
    } else {
      result[key] = val;
    }
  }

  return result as T;
}
