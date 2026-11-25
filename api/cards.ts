import crypto from 'node:crypto';
import {
  ApiRequest,
  ApiResponse,
  checkMemoryRateLimit,
  getClientIp,
  getSupabaseConfig,
  isAllowedOrigin,
  sha256,
} from './_lib/security.js';

const ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789';

function generateShortId(length = 7): string {
  const bytes = crypto.randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return out;
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
    if (!isAllowedOrigin(req)) {
      return res.status(403).json({ ok: false, error: 'Yetkisiz istek kaynağı.' });
    }

    const ipHash = sha256(getClientIp(req));
    if (!checkMemoryRateLimit(`cards:${ipHash}`, 20, 60 * 60 * 1000)) {
      return res.status(429).json({
        ok: false,
        error: 'Çok fazla kartpostal oluşturdun. Lütfen biraz sonra tekrar dene.',
      });
    }

    const body =
      typeof req.body === 'string'
        ? (JSON.parse(req.body) as { card?: unknown })
        : ((req.body || {}) as { card?: unknown });

    if (!body.card || typeof body.card !== 'object') {
      return res.status(400).json({ ok: false, error: 'Kartpostal verisi eksik.' });
    }

    const serialized = JSON.stringify(body.card);
    if (serialized.length > 2_000_000) {
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
