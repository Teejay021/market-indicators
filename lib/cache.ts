type Entry = { expires: number; data: any };
const store = new Map<string, Entry>();

export function getCached(key: string) {

  const hit = store.get(key);

  if (!hit) return null;

  if (Date.now() > hit.expires) { store.delete(key); return null; }

  return hit.data;
}

export function setCached(key: string, data: any, ttlSec: number) {
  store.set(key, { data, expires: Date.now() + ttlSec * 1000 });
}


export function cacheKey(url: string) { return url; }

