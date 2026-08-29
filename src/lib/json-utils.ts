export function safeJsonParse<T = any>(value: any, fallback: T = {} as T): T {
  if (!value) return fallback;
  if (typeof value === 'object') return value as T;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' ? parsed : fallback;
  } catch {
    return fallback;
  }
}
