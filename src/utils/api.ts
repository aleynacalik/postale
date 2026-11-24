import { DEFAULT_POSTCARD, TEMPLATE_PRESETS } from '../data/presets';
import { PostcardData } from '../types';

export interface SaveCardResult {
  ok: boolean;
  id?: string;
  shortUrl?: string;
  configured?: boolean;
  error?: string;
}

export interface SendEmailResult {
  ok: boolean;
  provider?: string;
  configured?: boolean;
  error?: string;
}

export function extractShortCardIdFromUrl(): string | null {
  const pathMatch = window.location.pathname.match(/\/m\/([a-z0-9_-]{4,20})\/?$/i);
  if (pathMatch?.[1]) return pathMatch[1].toLowerCase();

  const searchParams = new URLSearchParams(window.location.search);
  const queryId = searchParams.get('m');
  if (queryId && /^[a-z0-9_-]{4,20}$/i.test(queryId)) {
    return queryId.toLowerCase();
  }
  return null;
}

export async function saveCardToServer(card: PostcardData): Promise<SaveCardResult> {
  try {
    const res = await fetch('/api/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ card }),
    });

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return { ok: false, configured: false };
    }

    const data = (await res.json()) as {
      ok?: boolean;
      id?: string;
      configured?: boolean;
      error?: string;
    };

    if (!res.ok || !data.ok || !data.id) {
      return {
        ok: false,
        configured: data.configured ?? res.status !== 501,
        error: data.error,
      };
    }

    const shortUrl = `${window.location.origin}/m/${data.id}`;
    return { ok: true, id: data.id, shortUrl, configured: true };
  } catch {
    return { ok: false, configured: false };
  }
}

export async function fetchCardFromServer(id: string): Promise<{
  ok: boolean;
  card?: PostcardData;
  error?: string;
}> {
  try {
    const res = await fetch(`/api/cards?id=${encodeURIComponent(id)}`);
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return { ok: false, error: 'Kartpostal servisine ulaşılamadı.' };
    }

    const data = (await res.json()) as {
      ok?: boolean;
      card?: Partial<PostcardData>;
      error?: string;
    };

    if (!res.ok || !data.ok || !data.card) {
      return { ok: false, error: data.error || 'Kartpostal bulunamadı.' };
    }

    const basePreset =
      TEMPLATE_PRESETS.find((p) => p.id === data.card?.theme)?.data || DEFAULT_POSTCARD;
    return { ok: true, card: { ...basePreset, ...data.card } };
  } catch {
    return { ok: false, error: 'Bağlantı hatası oluştu.' };
  }
}

export async function sendPostcardEmail(payload: {
  to: string;
  subject: string;
  html: string;
  text: string;
  fromName: string;
}): Promise<SendEmailResult> {
  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return {
        ok: false,
        configured: false,
        error: 'Doğrudan e-posta gönderimi Vercel üzerinde aktif olur.',
      };
    }

    const data = (await res.json()) as SendEmailResult;
    if (!res.ok || !data.ok) {
      return {
        ok: false,
        configured: data.configured ?? res.status !== 501,
        error: data.error || 'E-posta gönderilemedi.',
      };
    }

    return { ok: true, provider: data.provider, configured: true };
  } catch {
    return {
      ok: false,
      configured: false,
      error: 'Sunucuya bağlanılamadı.',
    };
  }
}
