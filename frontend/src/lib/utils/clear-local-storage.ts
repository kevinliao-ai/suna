const ANISORA_LOCAL_STORAGE_KEYS = [
  'auth-tracking-storage',
  'anisora-active-tool',
] as const;

export function clearUserLocalStorage() {
  if (typeof window === 'undefined') return;

  for (const key of ANISORA_LOCAL_STORAGE_KEYS) {
    localStorage.removeItem(key);
  }
}
