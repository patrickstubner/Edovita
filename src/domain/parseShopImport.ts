import {
  QR_ID_RE,
  UNSAFE_QR_NAME_RE,
  isSafeRecordKey,
  shopStateSchema,
} from './schemas.ts';
import type { ImportShopItem, Result, ShopImportError } from './types.ts';

const IMPORT_FRAGMENT_RE = /#\/einkauf#import=([A-Za-z0-9_-]+)$/;
const MAX_BASE64_LENGTH = 4000;
const MAX_JSON_LENGTH = 3000;
const MAX_ITEMS = 40;
const MAX_ID_LENGTH = 40;
const MAX_NAME_LENGTH = 80;

function decodeBase64UrlToUtf8(input: string): string {
  const padded =
    input.replace(/-/g, '+').replace(/_/g, '/') +
    '='.repeat((4 - (input.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}

function encodeUtf8ToBase64Url(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Validiert ein geteiltes Einkaufslisten-Fragment (`#/einkauf#import=<base64url>`).
 * Alle 7 Ablehnungsgründe gemäss docs/architektur/testplan.md & prototype/vendor/edo-qr.js:
 * `format`, `size`, `parse`, `schema`, `count`, `id`, `name`.
 */
export function parseShopImport(
  fragment: string,
): Result<ImportShopItem[], ShopImportError> {
  const match = IMPORT_FRAGMENT_RE.exec(String(fragment ?? ''));
  if (!match || !match[1]) {
    return { ok: false, error: 'format' };
  }

  if (match[1].length > MAX_BASE64_LENGTH) {
    return { ok: false, error: 'size' };
  }

  let jsonText: string;
  try {
    jsonText = decodeBase64UrlToUtf8(match[1]);
  } catch {
    return { ok: false, error: 'parse' };
  }

  if (jsonText.length > MAX_JSON_LENGTH) {
    return { ok: false, error: 'size' };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    return { ok: false, error: 'parse' };
  }

  if (
    !parsed ||
    typeof parsed !== 'object' ||
    Array.isArray(parsed) ||
    !Object.hasOwn(parsed, 'v') ||
    !Object.hasOwn(parsed, 'items')
  ) {
    return { ok: false, error: 'schema' };
  }

  const record = parsed as Record<string, unknown>;
  if (record.v !== 1 || !Array.isArray(record.items)) {
    return { ok: false, error: 'schema' };
  }

  if (record.items.length > MAX_ITEMS) {
    return { ok: false, error: 'count' };
  }

  const items: ImportShopItem[] = [];

  for (let i = 0; i < record.items.length; i += 1) {
    const rawItem = record.items[i];
    if (!rawItem || typeof rawItem !== 'object' || Array.isArray(rawItem)) {
      return { ok: false, error: 'schema' };
    }

    const entry = rawItem as Record<string, unknown>;
    const entryId = Object.hasOwn(entry, 'id') ? entry.id : undefined;
    const entryName = Object.hasOwn(entry, 'n') ? entry.n : undefined;
    const entryState = Object.hasOwn(entry, 'st') ? entry.st : undefined;

    if (entryId !== undefined && typeof entryId !== 'string') {
      return { ok: false, error: 'id' };
    }
    if (entryName !== undefined && typeof entryName !== 'string') {
      return { ok: false, error: 'name' };
    }

    const rawId = entryId ?? '';
    const rawName = entryName ?? '';

    if (rawId.length > MAX_ID_LENGTH) {
      return { ok: false, error: 'id' };
    }
    if (rawId.length > 0 && (!QR_ID_RE.test(rawId) || !isSafeRecordKey(rawId))) {
      return { ok: false, error: 'id' };
    }

    if (rawName.length > MAX_NAME_LENGTH || UNSAFE_QR_NAME_RE.test(rawName)) {
      return { ok: false, error: 'name' };
    }

    const stateCandidate = entryState === undefined ? 'open' : entryState;
    const stateCheck = shopStateSchema.safeParse(stateCandidate);
    if (!stateCheck.success) {
      return { ok: false, error: 'schema' };
    }

    const id = rawId || `i${i}`;
    const name = rawName.trim() || id;
    if (UNSAFE_QR_NAME_RE.test(name)) {
      return { ok: false, error: 'name' };
    }

    items.push({
      id,
      name,
      st: stateCheck.data,
    });
  }

  return { ok: true, value: items };
}

/**
 * Kodiert Einkaufsartikel als kompaktes URL-Fragment für QR-Codes (max. 40 Artikel).
 */
export function encodeShopImport(items: readonly ImportShopItem[]): string {
  const payload = {
    v: 1 as const,
    items: items.slice(0, MAX_ITEMS).map((it) => ({
      id: it.id.slice(0, MAX_ID_LENGTH),
      n: it.name.slice(0, MAX_NAME_LENGTH),
      st: it.st,
    })),
  };
  const b64 = encodeUtf8ToBase64Url(JSON.stringify(payload));
  return `#/einkauf#import=${b64}`;
}
