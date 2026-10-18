export function normalizeHttpUrl(value: string): string | null {
  const candidate = value.trim();
  if (!candidate) return null;
  try {
    const url = new URL(candidate.includes('://') ? candidate : `https://${candidate}`);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}

export function parseStoredJson<T>(key: string, fallback: T): T {
  const value = localStorage.getItem(key);
  if (!value) return fallback;
  try { return JSON.parse(value) as T; } catch {
    localStorage.removeItem(key);
    return fallback;
  }
}
import type { ShortcutData } from '../types';


export function migrateShortcuts(value: unknown): ShortcutData[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
    .map((item) => ({
      name: typeof item.name === 'string' ? item.name : 'Shortcut',
      url: typeof item.url === 'string' ? item.url : '',
      imageUrl: typeof item.imageUrl === 'string'
        ? item.imageUrl
        : typeof item.imageURl === 'string' ? item.imageURl : '',
    }))
    .filter((item) => item.url.length > 0);
}
