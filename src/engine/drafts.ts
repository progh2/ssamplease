export type DraftValue = string | number | boolean | string[];
export type Drafts = Record<string, Record<string, DraftValue>>;
export function sanitizeDrafts(value: unknown, taskIds: string[]): Drafts {
  if (!value || typeof value !== 'object') return {};
  const result: Drafts = {};
  for (const id of taskIds) {
    const entry = (value as Record<string, unknown>)[id];
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) continue;
    const fields: Record<string, DraftValue> = {};
    for (const [key, item] of Object.entries(entry).slice(0, 24)) {
      if (['__proto__', 'constructor', 'prototype'].includes(key)) continue;
      if (typeof item === 'boolean' || typeof item === 'number' && Number.isFinite(item)) fields[key] = item;
      else if (typeof item === 'string') fields[key] = item.slice(0, 2000);
      else if (Array.isArray(item) && item.length <= 30 && item.every(v => typeof v === 'string')) fields[key] = item.map(v => v.slice(0, 100));
    }
    result[id] = fields;
  }
  return result;
}
