import crypto from 'node:crypto';

interface ApiRequest {
  method?: string;
  query?: Record<string, string | string[] | undefined>;
  body?: unknown;
}

interface ApiResponse {
  status: (code: number) => ApiResponse;
  json: (data: unknown) => void;
  setHeader: (name: string, value: string) => void;
}

const ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789';

function generateShortId(length = 7): string {
  const bytes = crypto.randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return out;
}

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL?.replace(/\/+$/, '').trim();
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)?.trim();
  if (!url || !key) return null;
  const headers: Record<string, string> = { apikey: key };
  // Legacy JWT keys (eyJ...) require Authorization: Bearer, while new sb_secret_ keys must ONLY use apikey
  if (key.split('.').length === 3) {
    headers.Authorization = `Bearer ${key}`;
  }
  return { url, headers };
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader('Cache-Control', 'no-store');

  const config = getSupabaseConfig();
  if (!config) {
    return res.status(501).json({
      ok: false,
      configured: false,
      error: 'Veritabanı (Supabase) henüz yapılandırılmadı.',
    });
  }

  // GET /api/cards?id=abc1234
  if (req.method === 'GET') {
    const rawId = Array.isArray(req.query?.id) ? req.query?.id[0] : req.query?.id;
    const id = (rawId || '').trim().toLowerCase();

    if (!/^[a-z0-9_-]{4,20}$/.test(id)) {
      return res.status(400).json({ ok: false, error: 'Geçersiz kartpostal kodu.' });
    }

    try {
      const response = await fetch(
        `${config.url}/rest/v1/cards?id=eq.${encodeURIComponent(id)}&select=id,data,created_at&limit=1`,
        {
          headers: config.headers,
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        return res.status(502).json({ ok: false, error: `Veritabanı okuma hatası: ${errText}` });
      }

      const rows = (await response.json()) as { id: string; data: unknown }[];
      if (!rows.length) {
        return res.status(404).json({ ok: false, error: 'Kartpostal bulunamadı.' });
      }

      return res.status(200).json({ ok: true, id: rows[0].id, card: rows[0].data });
    } catch (err) {
      return res.status(500).json({
        ok: false,
        error: err instanceof Error ? err.message : 'Sunucu hatası.',
      });
    }
  }

  // POST /api/cards
  if (req.method === 'POST') {
    const body =
      typeof req.body === 'string'
        ? (JSON.parse(req.body) as { card?: unknown })
        : ((req.body || {}) as { card?: unknown });

    if (!body.card || typeof body.card !== 'object') {
      return res.status(400).json({ ok: false, error: 'Kartpostal verisi eksik.' });
    }

    const serialized = JSON.stringify(body.card);
    if (serialized.length > 2_500_000) {
      return res.status(413).json({
        ok: false,
        error: 'Kartpostal boyutu çok büyük. Daha küçük bir görsel deneyin.',
      });
    }

    const id = generateShortId(7);

    try {
      const response = await fetch(`${config.url}/rest/v1/cards`, {
        method: 'POST',
        headers: {
          ...config.headers,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          id,
          data: body.card,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        return res.status(502).json({
          ok: false,
          error: `Kartpostal kaydedilemedi: ${errText}`,
        });
      }

      return res.status(201).json({ ok: true, id });
    } catch (err) {
      return res.status(500).json({
        ok: false,
        error: err instanceof Error ? err.message : 'Kayıt sırasında sunucu hatası.',
      });
    }
  }

  return res.status(405).json({ ok: false, error: 'Method not allowed' });
}
