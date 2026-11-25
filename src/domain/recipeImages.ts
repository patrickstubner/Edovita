import { z } from 'zod';
import {
  httpsUrlSchema,
  isSafeRecordKey,
  recipeIdSchema,
} from './schemas.ts';
import type { RecipeId } from './types.ts';

/** Zielbudget für alle lokal gebündelten Rezeptbilder gemäss Nachtrag v5.11 (7,4 MB). */
export const RECIPE_IMAGE_BUDGET_BYTES = 7_400_000;

export const RECIPE_IMAGE_SOURCES = ['Pexels', 'Unsplash'] as const;
export type RecipeImageSource = (typeof RECIPE_IMAGE_SOURCES)[number];

export const RECIPE_IMAGE_LICENSES = [
  'Pexels License',
  'Unsplash License',
] as const;
export type RecipeImageLicense = (typeof RECIPE_IMAGE_LICENSES)[number];

/** Nur gültige WebP-Dateinamen ohne Pfadtrenner oder Query-Parameter. */
export const RECIPE_IMAGE_FILENAME_RE = /^[a-z][a-z0-9_]{1,39}(?:-thumb)?\.webp$/;

const ALLOWED_IMAGE_SOURCE_HOSTS: Readonly<
  Record<RecipeImageSource, readonly string[]>
> = {
  Pexels: ['pexels.com', 'www.pexels.com'],
  Unsplash: ['unsplash.com', 'www.unsplash.com'],
};

const imageDimensionSchema = z.strictObject({
  width: z.number().int().positive().max(4000),
  height: z.number().int().positive().max(4000),
});

export const recipeImageManifestEntrySchema = z
  .strictObject({
    recipeId: recipeIdSchema,
    source: z.enum(RECIPE_IMAGE_SOURCES),
    photoId: z.union([z.number().int().positive(), z.string().min(1).max(64)]),
    originalUrl: httpsUrlSchema,
    photographer: z.string().min(1).max(160).nullable(),
    photographerSource: z.string().min(1).max(200).optional(),
    license: z.enum(RECIPE_IMAGE_LICENSES),
    retrieved: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Abrufdatum muss YYYY-MM-DD sein.'),
    files: z.strictObject({
      full: z.string().regex(RECIPE_IMAGE_FILENAME_RE, 'Ungültiger Vollbild-Dateiname.'),
      thumb: z.string().regex(RECIPE_IMAGE_FILENAME_RE, 'Ungültiger Miniatur-Dateiname.'),
    }),
    bytes: z.strictObject({
      full: z.number().int().positive(),
      thumb: z.number().int().positive(),
    }),
    dimensions: z.strictObject({
      full: imageDimensionSchema,
      thumb: imageDimensionSchema,
    }),
  })
  .superRefine((entry, ctx) => {
    const expectedFull = `${entry.recipeId}.webp`;
    const expectedThumb = `${entry.recipeId}-thumb.webp`;
    if (entry.files.full !== expectedFull) {
      ctx.addIssue({
        code: 'custom',
        path: ['files', 'full'],
        message: `Vollbild-Datei muss "${expectedFull}" heissen.`,
      });
    }
    if (entry.files.thumb !== expectedThumb) {
      ctx.addIssue({
        code: 'custom',
        path: ['files', 'thumb'],
        message: `Miniatur-Datei muss "${expectedThumb}" heissen.`,
      });
    }
    const expectedLicense =
      entry.source === 'Pexels' ? 'Pexels License' : 'Unsplash License';
    if (entry.license !== expectedLicense) {
      ctx.addIssue({
        code: 'custom',
        path: ['license'],
        message: `Quelle "${entry.source}" verlangt Lizenz "${expectedLicense}".`,
      });
    }
    try {
      const host = new URL(entry.originalUrl).hostname.toLowerCase();
      const allowedHosts = ALLOWED_IMAGE_SOURCE_HOSTS[entry.source];
      if (!allowedHosts.includes(host)) {
        ctx.addIssue({
          code: 'custom',
          path: ['originalUrl'],
          message: `Ursprungs-URL muss zu ${allowedHosts.join(' oder ')} gehören.`,
        });
      }
    } catch {
      ctx.addIssue({
        code: 'custom',
        path: ['originalUrl'],
        message: 'Ungültige Ursprungs-URL.',
      });
    }
  });

export const recipeImageManifestSchema = z.strictObject({
  format: z.literal(1),
  asOf: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Datum muss YYYY-MM-DD sein.'),
  timezone: z.string().min(1),
  license: z.string().min(1),
  internalOnly: z.literal(true),
  note: z.string().min(1),
  budgetBytes: z.number().int().positive().max(RECIPE_IMAGE_BUDGET_BYTES),
  placeholders: z.array(recipeIdSchema),
  images: z.array(recipeImageManifestEntrySchema),
});

export type RecipeImageManifestEntry = z.infer<
  typeof recipeImageManifestEntrySchema
>;
export type RecipeImageManifest = z.infer<typeof recipeImageManifestSchema>;

export interface WebpInspectionResult {
  readonly valid: boolean;
  readonly width: number;
  readonly height: number;
  readonly hasExif: boolean;
  readonly hasXmp: boolean;
  readonly hasGpsMarker: boolean;
  readonly chunks: readonly string[];
}

function readAscii(bytes: Uint8Array, offset: number, length: number): string {
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += String.fromCharCode(bytes[offset + i] ?? 0);
  }
  return out;
}

function readUint16LE(bytes: Uint8Array, offset: number): number {
  return (bytes[offset] ?? 0) | ((bytes[offset + 1] ?? 0) << 8);
}

function readUint32LE(bytes: Uint8Array, offset: number): number {
  return (
    ((bytes[offset] ?? 0) |
      ((bytes[offset + 1] ?? 0) << 8) |
      ((bytes[offset + 2] ?? 0) << 16) |
      ((bytes[offset + 3] ?? 0) << 24)) >>>
    0
  );
}

function containsAsciiSequence(bytes: Uint8Array, needle: string): boolean {
  const len = needle.length;
  if (len === 0 || bytes.length < len) {
    return false;
  }
  outer: for (let i = 0; i <= bytes.length - len; i += 1) {
    for (let j = 0; j < len; j += 1) {
      if (bytes[i + j] !== needle.charCodeAt(j)) {
        continue outer;
      }
    }
    return true;
  }
  return false;
}

/**
 * Prüft eine WebP-Datei rein auf Basis der RIFF/WEBP-Binärstruktur (ohne Fremdpakete):
 * - gültiger RIFF/WEBP-Kopf
 * - exakte Bildmasse (`VP8X`, `VP8 `, `VP8L`)
 * - keinerlei `EXIF`-/`XMP `-Chunks, keine VP8X-EXIF/XMP-Flags und keine `Exif\0\0`/`GPSInfo`-Marker.
 */
export function inspectWebpMetadata(bytes: Uint8Array): WebpInspectionResult {
  if (
    bytes.length < 12 ||
    readAscii(bytes, 0, 4) !== 'RIFF' ||
    readAscii(bytes, 8, 4) !== 'WEBP'
  ) {
    return {
      valid: false,
      width: 0,
      height: 0,
      hasExif: false,
      hasXmp: false,
      hasGpsMarker: false,
      chunks: [],
    };
  }

  const chunks: string[] = [];
  let pos = 12;
  let width = 0;
  let height = 0;
  let hasExif = false;
  let hasXmp = false;

  while (pos + 8 <= bytes.length) {
    const fourcc = readAscii(bytes, pos, 4);
    const size = readUint32LE(bytes, pos + 4);
    const dataStart = pos + 8;
    if (dataStart + size > bytes.length) {
      return {
        valid: false,
        width: 0,
        height: 0,
        hasExif,
        hasXmp,
        hasGpsMarker: false,
        chunks,
      };
    }
    chunks.push(fourcc);

    if (fourcc === 'EXIF') {
      hasExif = true;
    } else if (fourcc === 'XMP ') {
      hasXmp = true;
    } else if (fourcc === 'VP8X' && size >= 10) {
      const flags = bytes[dataStart] ?? 0;
      if ((flags & 0x08) !== 0) hasExif = true;
      if ((flags & 0x04) !== 0) hasXmp = true;
      width =
        1 +
        ((bytes[dataStart + 4] ?? 0) |
          ((bytes[dataStart + 5] ?? 0) << 8) |
          ((bytes[dataStart + 6] ?? 0) << 16));
      height =
        1 +
        ((bytes[dataStart + 7] ?? 0) |
          ((bytes[dataStart + 8] ?? 0) << 8) |
          ((bytes[dataStart + 9] ?? 0) << 16));
    } else if (fourcc === 'VP8 ' && size >= 10 && width === 0) {
      if (
        bytes[dataStart + 3] === 0x9d &&
        bytes[dataStart + 4] === 0x01 &&
        bytes[dataStart + 5] === 0x2a
      ) {
        width = readUint16LE(bytes, dataStart + 6) & 0x3fff;
        height = readUint16LE(bytes, dataStart + 8) & 0x3fff;
      }
    } else if (fourcc === 'VP8L' && size >= 5 && width === 0) {
      const bits = readUint32LE(bytes, dataStart + 1);
      width = 1 + (bits & 0x3fff);
      height = 1 + ((bits >> 14) & 0x3fff);
    }

    pos = dataStart + size + (size % 2);
  }

  const hasRawExif = containsAsciiSequence(bytes, 'Exif\0\0');
  const hasGpsMarker = containsAsciiSequence(bytes, 'GPSInfo');

  return {
    valid: width > 0 && height > 0,
    width,
    height,
    hasExif: hasExif || hasRawExif,
    hasXmp,
    hasGpsMarker,
    chunks,
  };
}

export interface RawRecipeImagesBundle {
  readonly manifest: unknown;
  /** Alle auf der Platte vorhandenen Dateien unter `content/images/recipes/` (Dateiname → Rohbytes). */
  readonly files: Readonly<Record<string, Uint8Array>>;
  /** Alle bekannten Rezept-IDs des Katalogs. */
  readonly knownRecipeIds: readonly RecipeId[];
  /** Optional gesetzte `recipe.image`-Felder (`recipeId -> image`). */
  readonly recipeImageFields?: Readonly<Record<string, string | undefined>>;
}

export interface RecipeImagesValidationReport {
  readonly ok: boolean;
  readonly errors: string[];
  readonly totalBytes: number;
  readonly validated: RecipeImageManifest | null;
}

/**
 * Vollständige Inhalts- und Sicherheitsprüfung für Rezeptbilder (Issue #33 & Nachtrag v5.11):
 * - Manifest-Schema & zulässige Lizenz (Pexels / Unsplash, passende Ursprungs-Domain)
 * - jede Rezept-ID im Manifest existiert im Rezeptkatalog
 * - jede Bilddatei auf der Platte ist im Manifest eingetragen (kein Bild ohne Manifest)
 * - jede Manifest-Datei existiert, hat gültiges WebP-Format, passende Grösse/Masse und 0 EXIF/XMP/GPS
 * - Gesamtgrösse innerhalb des Budgets (`budgetBytes <= 7,4 MB`)
 * - optionales `recipe.image`-Feld stimmt mit `recipe.id` überein und hat einen Manifest-Eintrag.
 */
export function validateRecipeImages(
  bundle: RawRecipeImagesBundle,
): RecipeImagesValidationReport {
  const errors: string[] = [];
  const parsed = recipeImageManifestSchema.safeParse(bundle.manifest);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      errors.push(
        `images/manifest.json[${issue.path.join('.')}]: ${issue.message}`,
      );
    }
    return { ok: false, errors, totalBytes: 0, validated: null };
  }

  const manifest = parsed.data;
  const knownSet = new Set<string>(bundle.knownRecipeIds);
  const seenRecipeIds = new Set<string>();
  const referencedFiles = new Set<string>();
  let totalBytes = 0;

  for (const placeholderId of manifest.placeholders) {
    if (!knownSet.has(placeholderId)) {
      errors.push(
        `images/manifest.json: Platzhalter-ID "${placeholderId}" existiert nicht im Rezeptkatalog.`,
      );
    }
  }

  for (const entry of manifest.images) {
    if (!isSafeRecordKey(entry.recipeId)) {
      errors.push(`images/manifest.json: unsichere Rezept-ID "${entry.recipeId}".`);
      continue;
    }
    if (seenRecipeIds.has(entry.recipeId)) {
      errors.push(
        `images/manifest.json: doppelter Eintrag für Rezept "${entry.recipeId}".`,
      );
      continue;
    }
    seenRecipeIds.add(entry.recipeId);

    if (!knownSet.has(entry.recipeId)) {
      errors.push(
        `images/manifest.json: unbekannte Rezept-ID "${entry.recipeId}" (nicht im Rezeptkatalog).`,
      );
    }

    const variants = [
      ['full', entry.files.full, entry.bytes.full, entry.dimensions.full],
      ['thumb', entry.files.thumb, entry.bytes.thumb, entry.dimensions.thumb],
    ] as const;

    for (const [variant, fileName, expectedBytes, expectedDims] of variants) {
      referencedFiles.add(fileName);
      if (!Object.hasOwn(bundle.files, fileName)) {
        errors.push(
          `images/recipes/${fileName}: Datei aus Manifest (${entry.recipeId}.${variant}) fehlt.`,
        );
        continue;
      }
      const raw = bundle.files[fileName]!;
      totalBytes += raw.length;
      if (raw.length !== expectedBytes) {
        errors.push(
          `images/recipes/${fileName}: Dateigrösse ${raw.length} B weicht vom Manifest (${expectedBytes} B) ab.`,
        );
      }
      const info = inspectWebpMetadata(raw);
      if (!info.valid) {
        errors.push(
          `images/recipes/${fileName}: ungültige WebP-Datei.`,
        );
        continue;
      }
      if (info.hasExif || info.hasXmp || info.hasGpsMarker) {
        errors.push(
          `images/recipes/${fileName}: Metadaten (EXIF/XMP/GPS) gefunden – müssen entfernt sein.`,
        );
      }
      if (
        info.width !== expectedDims.width ||
        info.height !== expectedDims.height
      ) {
        errors.push(
          `images/recipes/${fileName}: Masse ${info.width}×${info.height} weichen vom Manifest (${expectedDims.width}×${expectedDims.height}) ab.`,
        );
      }
    }
  }

  for (const fileName of Object.keys(bundle.files)) {
    if (!RECIPE_IMAGE_FILENAME_RE.test(fileName)) {
      errors.push(
        `images/recipes/${fileName}: unzulässiger Dateiname (nur <recipeId>.webp oder <recipeId>-thumb.webp).`,
      );
      continue;
    }
    if (!referencedFiles.has(fileName)) {
      errors.push(
        `images/recipes/${fileName}: Bilddatei ohne Eintrag in manifest.json.`,
      );
    }
  }

  if (totalBytes > manifest.budgetBytes) {
    errors.push(
      `images/recipes: Gesamtgrösse ${totalBytes} B überschreitet das Budget (${manifest.budgetBytes} B).`,
    );
  }

  if (bundle.recipeImageFields) {
    for (const [recipeId, imageField] of Object.entries(
      bundle.recipeImageFields,
    )) {
      if (imageField === undefined) continue;
      if (imageField !== recipeId) {
        errors.push(
          `recipes/${recipeId}/recipe.json: image "${imageField}" muss der eigenen Rezept-ID "${recipeId}" entsprechen.`,
        );
      } else if (!seenRecipeIds.has(imageField)) {
        errors.push(
          `recipes/${recipeId}/recipe.json: image "${imageField}" hat keinen Eintrag in images/recipes/manifest.json.`,
        );
      }
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    totalBytes,
    validated: errors.length === 0 ? manifest : null,
  };
}
