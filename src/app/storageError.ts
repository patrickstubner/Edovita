/**
 * Generische Fehlercodes für die lokalen Speicher-Provider (G1).
 * Es werden niemals Rohdaten, Original-Fehlermeldungen oder Stacktraces
 * an die UI durchgereicht.
 */
export type StorageErrorCode =
  | 'storage.error.read'
  | 'storage.error.write'
  | 'storage.error.quota';

function isQuotaError(err: unknown): boolean {
  if (!err || typeof err !== 'object') {
    return false;
  }
  const maybe = err as { name?: unknown; code?: unknown; inner?: unknown };
  if (maybe.name === 'QuotaExceededError' || maybe.code === 22) {
    return true;
  }
  if (maybe.inner && typeof maybe.inner === 'object') {
    const inner = maybe.inner as { name?: unknown; code?: unknown };
    if (inner.name === 'QuotaExceededError' || inner.code === 22) {
      return true;
    }
  }
  return false;
}

export function classifyStorageError(
  err: unknown,
  phase: 'read' | 'write',
): StorageErrorCode {
  if (isQuotaError(err)) {
    return 'storage.error.quota';
  }
  return phase === 'read' ? 'storage.error.read' : 'storage.error.write';
}
