import { openDB } from 'idb';

export const dbPromise = openDB('wallpapers-db', 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('wallpapers')) {
      db.createObjectStore('wallpapers');
    }
  },
});

export async function saveWallpaper(id: string, blob: Blob) {
  const db = await dbPromise;
  await db.put('wallpapers', blob, id);
}

export async function getWallpaper(id: string): Promise<Blob | undefined> {
  const db = await dbPromise;
  return db.get('wallpapers', id);
}

export async function getAllWallpapers() {
  const db = await dbPromise;
  const keys = await db.getAllKeys('wallpapers');
  const wallpapers = [];
  for (const key of keys) {
    const blob = await db.get('wallpapers', key);
    if (blob) {
      wallpapers.push({ id: key.toString(), blob });
    }
  }
  return wallpapers;
}

export async function deleteWallpaper(id: string) {
  const db = await dbPromise;
  await db.delete('wallpapers', id);
}
