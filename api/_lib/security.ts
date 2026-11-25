import crypto from 'node:crypto';

export interface ApiRequest {
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
  query?: Record<string, string | string[] | undefined>;
  body?: unknown;
}

export interface ApiResponse {
  status: (code: number) => ApiResponse;
  json: (data: unknown) => void;
  setHeader: (name: string, value: string) => void;
}

export function getHeader(req: ApiRequest, name: string): string {
  const val = req.headers?.[name.toLowerCase()] ?? req.headers?.[name];
  if (Array.isArray(val)) return val[0] || '';
  return val || '';
}

export function getClientIp(req: ApiRequest): string {
  const forwarded = getHeader(req, 'x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIp = getHeader(req, 'x-real-ip');
  if (realIp) return realIp.trim();
  return 'unknown';
}

export function sha256(value: string): string {
  const salt = process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 16) || 'postale-salt';
  return crypto.createHash('sha256').update(`${salt}:${value}`).digest('hex').slice(0, 32);
}

export function isAllowedOrigin(req: ApiRequest): boolean {
  const origin = getHeader(req, 'origin');
  if (!origin) return true; // Same-origin or non-browser requests without Origin header
  const host = getHeader(req, 'x-forwarded-host') || getHeader(req, 'host');
  if (!host) return true;
  try {
    const parsed = new URL(origin);
    return parsed.host.toLowerCase() === host.toLowerCase();
  } catch {
    return false;
  }
}

export function getPublicOrigin(req: ApiRequest): string {
  const host = getHeader(req, 'x-forwarded-host') || getHeader(req, 'host') || 'postale-theta.vercel.app';
  const proto = getHeader(req, 'x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
  return `${proto}://${host}`;
}

// Fast in-memory burst rate limiter (protects against rapid loops within an instance)
const memoryBuckets = new Map<string, number[]>();

export function checkMemoryRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const cutoff = now - windowMs;
  const timestamps = (memoryBuckets.get(key) || []).filter((t) => t > cutoff);
  if (timestamps.length >= limit) {
    memoryBuckets.set(key, timestamps);
    return false;
  }
  timestamps.push(now);
  memoryBuckets.set(key, timestamps);
  return true;
}

export function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL?.replace(/\/+$/, '').trim();
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)?.trim();
  if (!url || !key) return null;
  const headers: Record<string, string> = { apikey: key };
  if (key.split('.').length === 3) {
    headers.Authorization = `Bearer ${key}`;
  }
  return { url, headers };
}

export interface PersistentLimitCheck {
  allowed: boolean;
  reason?: string;
}

export async function checkPersistentEmailLimits(
  ipHash: string,
  recipientHash: string
): Promise<PersistentLimitCheck> {
  const cfg = getSupabaseConfig();
  if (!cfg) return { allowed: true };

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  try {
    const [ipHourRes, recHourRes, globalDayRes] = await Promise.all([
      fetch(
        `${cfg.url}/rest/v1/email_logs?ip_hash=eq.${encodeURIComponent(ipHash)}&created_at=gte.${encodeURIComponent(oneHourAgo)}&select=id`,
        { headers: cfg.headers }
      ),
      fetch(
        `${cfg.url}/rest/v1/email_logs?recipient_hash=eq.${encodeURIComponent(recipientHash)}&created_at=gte.${encodeURIComponent(oneHourAgo)}&select=id`,
        { headers: cfg.headers }
      ),
      fetch(
        `${cfg.url}/rest/v1/email_logs?created_at=gte.${encodeURIComponent(oneDayAgo)}&select=id`,
        { headers: cfg.headers }
      ),
    ]);

    // If email_logs table hasn't been created yet (404/400), degrade gracefully to memory limiter
    if (!ipHourRes.ok || !recHourRes.ok || !globalDayRes.ok) {
      return { allowed: true };
    }

    const [ipRows, recRows, globalRows] = (await Promise.all([
      ipHourRes.json(),
      recHourRes.json(),
      globalDayRes.json(),
    ])) as [unknown[], unknown[], unknown[]];

    if (ipRows.length >= 6) {
      return {
        allowed: false,
        reason: 'Saatlik gönderim limitine ulaştın (en fazla 6 e-posta/saat). Biraz sonra tekrar dene.',
      };
    }

    if (recRows.length >= 3) {
      return {
        allowed: false,
        reason: 'Aynı e-posta adresine kısa sürede çok fazla mektup gönderildi. Lütfen biraz bekle.',
      };
    }

    if (globalRows.length >= 250) {
      return {
        allowed: false,
        reason: 'Bugünkü günlük posta kotası doldu. Yarın tekrar deneyebilir veya linki kopyalayabilirsin.',
      };
    }

    return { allowed: true };
  } catch {
    return { allowed: true };
  }
}

export async function recordEmailLog(ipHash: string, recipientHash: string, cardId: string) {
  const cfg = getSupabaseConfig();
  if (!cfg) return;
  try {
    await fetch(`${cfg.url}/rest/v1/email_logs`, {
      method: 'POST',
      headers: {
        ...cfg.headers,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        ip_hash: ipHash,
        recipient_hash: recipientHash,
        card_id: cardId,
      }),
    });
  } catch {
    // Non-blocking audit log
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function safeHexColor(val: unknown, fallback: string): string {
  if (typeof val === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(val.trim())) {
    return val.trim();
  }
  return fallback;
}

export interface ServerCardPreview {
  backdropDark?: boolean;
  envelopeColor?: string;
  envelopeTextColor?: string;
  envelopeSubtag?: string;
  envelopeMotto?: string;
  waxSealColor?: string;
  waxSealInitial?: string;
  unlockAt?: string | null;
}

export function renderSafeEmailHtml(
  card: ServerCardPreview,
  shareUrl: string,
  introNote: string,
  senderName: string
): string {
  const safeSender = escapeHtml(senderName.slice(0, 60) || 'Bir arkadaşın');
  const safeMotto = escapeHtml(String(card.envelopeMotto || 'Sana bir kartpostal var').slice(0, 80));
  const safeIntro = escapeHtml(
    introNote.slice(0, 320) ||
      'Senin için özel olarak hazırlanmış interaktif bir dijital kartpostal bıraktım.'
  );
  const safeSubtag = escapeHtml(String(card.envelopeSubtag || '[ÖZEL POSTA]').slice(0, 50));
  const safeInitial = escapeHtml(String(card.waxSealInitial || '✉').slice(0, 3));
  const safeUrl = escapeHtml(shareUrl);

  let capsuleBanner = '';
  if (card.unlockAt) {
    const unlockDate = new Date(card.unlockAt);
    if (!Number.isNaN(unlockDate.getTime()) && unlockDate.getTime() > Date.now()) {
      const formatted = new Intl.DateTimeFormat('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(unlockDate);
      capsuleBanner = `<p style="margin:14px 0 0 0;display:inline-block;padding:6px 14px;border-radius:999px;background-color:rgba(158,63,82,0.12);color:#8C2D42;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:12px;font-weight:600;">⏳ Zaman Kapsülü • ${escapeHtml(formatted)} tarihinde açılır</p>`;
    }
  }

  const envelopeColor = safeHexColor(card.envelopeColor, '#E8C5CC');
  const envelopeTextColor = safeHexColor(card.envelopeTextColor, '#3A262B');
  const waxSealColor = safeHexColor(card.waxSealColor, '#9E3F52');

  const bgOuter = card.backdropDark ? '#111316' : '#F4ECE8';
  const cardBg = card.backdropDark ? '#191C22' : '#FFFFFF';
  const textMain = card.backdropDark ? '#F5F2EC' : '#2C2324';
  const textMuted = card.backdropDark ? '#A5AAB4' : '#7A6C6E';

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeSender} sana bir kartpostal gönderdi</title>
</head>
<body style="margin:0;padding:0;background-color:${bgOuter};font-family:Georgia,'Times New Roman',serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:${bgOuter};padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="540" cellspacing="0" cellpadding="0" style="max-width:540px;width:100%;background-color:${cardBg};border-radius:16px;overflow:hidden;box-shadow:0 18px 50px rgba(0,0,0,0.14);">
          <tr>
            <td align="center" style="padding:36px 32px 16px 32px;">
              <p style="margin:0 0 8px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:11px;letter-spacing:2.4px;text-transform:uppercase;color:${textMuted};">
                POSTALE • DİJİTAL POSTA
              </p>
              <h1 style="margin:0;font-size:24px;font-weight:500;color:${textMain};line-height:1.35;">
                ${safeSender} sana bir mektup gönderdi
              </h1>
              <p style="margin:12px 0 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:14px;line-height:1.6;color:${textMuted};">
                ${safeIntro}
              </p>
              ${capsuleBanner}
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:20px 32px 24px 32px;">
              <a href="${safeUrl}" style="display:block;text-decoration:none;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:400px;background-color:${envelopeColor};border-radius:10px;border:1px solid rgba(0,0,0,0.08);box-shadow:0 12px 28px rgba(0,0,0,0.16);">
                  <tr>
                    <td align="center" style="padding:46px 24px 36px 24px;">
                      <p style="margin:0 0 6px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:10px;letter-spacing:1.8px;color:${envelopeTextColor};opacity:0.75;">
                        ${safeSubtag}
                      </p>
                      <p style="margin:0;font-size:28px;font-style:italic;color:${envelopeTextColor};line-height:1.25;">
                        ${safeMotto}
                      </p>
                      <div style="margin:24px auto 0 auto;width:44px;height:44px;line-height:44px;border-radius:50%;background-color:${waxSealColor};color:#FBF8F3;font-size:16px;font-weight:bold;text-align:center;">
                        ${safeInitial}
                      </div>
                    </td>
                  </tr>
                </table>
              </a>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:8px 32px 38px 32px;">
              <a href="${safeUrl}" style="display:inline-block;padding:14px 32px;background-color:${waxSealColor};color:#FFFFFF;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:14px;font-weight:600;letter-spacing:0.4px;text-decoration:none;border-radius:999px;">
                Zarfı Aç ve Kartpostalı Oku ✉
              </a>
              <p style="margin:18px 0 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:11px;color:${textMuted};">
                Zarfı tıkladığında mektubun interaktif olarak açılacak.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
