import LZString from 'lz-string';
import { DEFAULT_POSTCARD, TEMPLATE_PRESETS } from '../data/presets';
import { PostcardData } from '../types';

const DRAFT_STORAGE_KEY = 'postale_draft_v1';

// Delta-encode against the base template preset so share URLs stay much shorter
export function encodePostcardToHash(data: PostcardData): string {
  const basePreset =
    TEMPLATE_PRESETS.find((p) => p.id === data.theme)?.data || DEFAULT_POSTCARD;

  const diff: Record<string, unknown> = { theme: data.theme };
  (Object.keys(data) as (keyof PostcardData)[]).forEach((key) => {
    if (key === 'theme') return;
    const val = data[key];
    const baseVal = basePreset[key];
    if (JSON.stringify(val) !== JSON.stringify(baseVal)) {
      diff[key] = val;
    }
  });

  const json = JSON.stringify(diff);
  const compressed = LZString.compressToEncodedURIComponent(json);
  return `#m=${compressed}`;
}

export function decodePostcardFromHash(hash: string): PostcardData | null {
  try {
    if (!hash || !hash.includes('m=')) return null;
    const raw = hash.replace(/^#/, '').split('m=')[1]?.split('&')[0];
    if (!raw) return null;
    const json = LZString.decompressFromEncodedURIComponent(raw);
    if (!json) return null;
    const parsed = JSON.parse(json) as Partial<PostcardData>;
    const basePreset =
      TEMPLATE_PRESETS.find((p) => p.id === parsed.theme)?.data || DEFAULT_POSTCARD;
    return { ...basePreset, ...parsed };
  } catch {
    return null;
  }
}

export function buildShareUrl(data: PostcardData): string {
  const base = `${window.location.origin}${window.location.pathname}`;
  return `${base}${encodePostcardToHash(data)}`;
}

export function saveDraft(data: PostcardData) {
  try {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage quota issues with very large photos
  }
}

export function loadDraft(): PostcardData | null {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PostcardData>;
    const basePreset =
      TEMPLATE_PRESETS.find((p) => p.id === parsed.theme)?.data || DEFAULT_POSTCARD;
    return { ...basePreset, ...parsed };
  } catch {
    return null;
  }
}
