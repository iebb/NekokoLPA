// Browser stub for MMKV-backed storage (src/shared/storage.ts). Previews have
// no native storage layer, so each instance is an in-memory map: components
// that read a preference mount and render their default state instead of
// throwing at import time.
type Store = {
  getString(k: string): string | undefined;
  getBoolean(k: string): boolean | undefined;
  getNumber(k: string): number | undefined;
  set(k: string, v: unknown): void;
  remove(k: string): boolean;
  contains(k: string): boolean;
  getAllKeys(): string[];
  clearAll(): void;
  addOnValueChangedListener(cb: (key: string) => void): {remove(): void};
};

export function createMMKV(_opts?: {id?: string}): Store {
  const mem = new Map<string, unknown>();
  return {
    getString: k => mem.get(k) as string | undefined,
    getBoolean: k => mem.get(k) as boolean | undefined,
    getNumber: k => mem.get(k) as number | undefined,
    set: (k, v) => void mem.set(k, v),
    remove: k => mem.delete(k),
    contains: k => mem.has(k),
    getAllKeys: () => [...mem.keys()],
    clearAll: () => mem.clear(),
    addOnValueChangedListener: () => ({remove: () => {}}),
  };
}

export const MMKV = createMMKV;
