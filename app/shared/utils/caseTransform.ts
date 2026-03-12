// snake_case ↔ camelCase transforms for API boundary

function snakeToCamel(str: string): string {
  return str.replace(/_([a-z0-9])/g, (_, char) => char.toUpperCase());
}

function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export function snakeToCamelDeep<T>(obj: unknown): T {
  if (Array.isArray(obj)) {
    return obj.map((item) => snakeToCamelDeep(item)) as T;
  }
  if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
    const entries = Object.entries(obj as Record<string, JsonValue>);
    return Object.fromEntries(
      entries.map(([key, value]) => [snakeToCamel(key), snakeToCamelDeep(value)])
    ) as T;
  }
  return obj as T;
}

export function camelToSnakeDeep<T>(obj: unknown): T {
  if (Array.isArray(obj)) {
    return obj.map((item) => camelToSnakeDeep(item)) as T;
  }
  if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
    const entries = Object.entries(obj as Record<string, JsonValue>);
    return Object.fromEntries(
      entries.map(([key, value]) => [camelToSnake(key), camelToSnakeDeep(value)])
    ) as T;
  }
  return obj as T;
}
