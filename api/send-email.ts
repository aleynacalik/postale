import nodemailer from 'nodemailer';
import {
  ApiRequest,
  ApiResponse,
  checkMemoryRateLimit,
  checkPersistentEmailLimits,
  getClientIp,
  getPublicOrigin,
  getSupabaseConfig,
  isAllowedOrigin,
  recordEmailLog,
  renderSafeEmailHtml,
  ServerCardPreview,
  sha256,
} from './_lib/security.js';

interface EmailRequestBody {
  to?: string;
  replyTo?: string;
  subject?: string;
  introNote?: string;
  fromName?: string;
  cardId?: string;
  website?: string; // Honeypot field — humans leave this empty
}

function isValidEmail(email: string): boolean {
  return email.length <= 160 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sanitizeHeaderText(val: string, fallback: string, maxLen = 90): string {
  const cleaned = val.replace(/[\r\n"<>]/g, '').trim().slice(0, maxLen);
  return cleaned || fallback;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  // 1. Block cross-site third-party callers
  if (!isAllowedOrigin(req)) {
    return res.status(403).json({ ok: false, error: 'Yetkisiz istek kaynağı.' });
  }

  const body: EmailRequestBody =
    typeof req.body === 'string'
      ? (JSON.parse(req.body) as EmailRequestBody)
      : ((req.body || {}) as EmailRequestBody);

  // 2. Honeypot bot trap
  if (typeof body.website === 'string' && body.website.trim().length > 0) {
    return res.status(400).json({ ok: false, error: 'Geçersiz istek.' });
  }

  const to = (body.to || '').trim().toLowerCase();
  const rawReplyTo = (body.replyTo || '').trim().toLowerCase();
  const replyTo = rawReplyTo && isValidEmail(rawReplyTo) ? rawReplyTo : undefined;
  const cardId = (body.cardId || '').trim().toLowerCase();
  const fromName = sanitizeHeaderText(body.fromName || 'Postale', 'Postale', 50);
  const subject = sanitizeHeaderText(
    body.subject || 'Sana interaktif bir kartpostal geldi ✉',
    'Sana interaktif bir kartpostal geldi ✉',
    110
  );
  const introNote = (body.introNote || '').trim().slice(0, 320);

  if (!to || !isValidEmail(to)) {
    return res.status(400).json({ ok: false, error: 'Geçerli bir alıcı e-posta adresi girin.' });
  }

  // 3. Require a real saved Postale card ID (prevents open phishing/spam relay!)
  if (!/^[a-z0-9_-]{4,20}$/.test(cardId)) {
    return res.status(400).json({
      ok: false,
      error: 'Geçerli bir kartpostal kaydı bulunamadı. Sayfayı yenileyip tekrar dene.',
    });
  }

  // 4. Burst + persistent rate limiting (protects Gmail daily quota & recipients)
  const ipHash = sha256(getClientIp(req));
  const recipientHash = sha256(to);

  if (!checkMemoryRateLimit(`email-burst:${ipHash}`, 3, 60 * 1000)) {
    return res.status(429).json({
      ok: false,
      error: 'Çok hızlı gönderim yapıyorsun. Lütfen 1 dakika bekleyip tekrar dene.',
    });
  }

  const persistentCheck = await checkPersistentEmailLimits(ipHash, recipientHash);
  if (!persistentCheck.allowed) {
    return res.status(429).json({
      ok: false,
      error: persistentCheck.reason || 'Gönderim limitine ulaşıldı.',
    });
  }

  // 5. Fetch the verified card from Supabase & build HTML strictly on the server
  const supabase = getSupabaseConfig();
  if (!supabase) {
    return res.status(501).json({
      ok: false,
      configured: false,
      error: 'Veritabanı (Supabase) yapılandırılmadı.',
    });
  }

  let storedCard: ServerCardPreview;
  try {
    const cardRes = await fetch(
      `${supabase.url}/rest/v1/cards?id=eq.${encodeURIComponent(cardId)}&select=data&limit=1`,
      { headers: supabase.headers }
    );
    if (!cardRes.ok) {
      return res.status(502).json({ ok: false, error: 'Kartpostal doğrulanamadı.' });
    }
    const rows = (await cardRes.json()) as { data?: ServerCardPreview }[];
    if (!rows.length || !rows[0].data) {
      return res.status(404).json({ ok: false, error: 'Bu kartpostal bulunamadı.' });
    }
    storedCard = rows[0].data;
  } catch {
    return res.status(502).json({ ok: false, error: 'Kartpostal doğrulanırken hata oluştu.' });
  }

  // Lock the CTA link strictly to our own origin + verified cardId
  const shareUrl = `${getPublicOrigin(req)}/m/${cardId}`;
  const html = renderSafeEmailHtml(storedCard, shareUrl, introNote, fromName);
  const text = `${introNote || 'Sana özel bir dijital kartpostal hazırladım!'}\n\nZarfı açıp mektubu okumak için tıkla:\n${shareUrl}\n\n— Postale ile gönderildi`;

  // Persist optional replyToEmail onto the card so recipient can reply in 1 click
  if (replyTo) {
    try {
      await fetch(`${supabase.url}/rest/v1/cards?id=eq.${encodeURIComponent(cardId)}`, {
        method: 'PATCH',
        headers: {
          ...supabase.headers,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          data: {
            ...storedCard,
            replyToEmail: replyTo,
          },
        }),
      });
    } catch {
      // Non-blocking
    }
  }

  // Provider 1: Gmail SMTP
  const gmailUser = process.env.GMAIL_USER?.trim().replace(/^["']|["']$/g, '');
  const gmailPass = process.env.GMAIL_APP_PASSWORD?.replace(/[^a-zA-Z0-9]/g, '');

  if (gmailUser && gmailPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: gmailUser,
          pass: gmailPass,
        },
      });

      const info = await transporter.sendMail({
        from: `"${fromName} (Postale)" <${gmailUser}>`,
        to,
        ...(replyTo ? { replyTo: `"${fromName}" <${replyTo}>` } : {}),
        subject,
        text,
        html,
      });

      await recordEmailLog(ipHash, recipientHash, cardId);

      return res.status(200).json({
        ok: true,
        provider: 'gmail',
        id: info.messageId,
      });
    } catch (err) {
      const errMsg =
        err instanceof Error ? err.message : 'Gmail üzerinden gönderilemedi.';

      return res.status(502).json({
        ok: false,
        provider: 'gmail',
        error: `Gmail gönderim hatası: ${errMsg}`,
      });
    }
  }

  // Provider 2: Resend API (Optional upgrade when using a custom domain)
  const resendKey = process.env.RESEND_API_KEY?.trim();
  if (resendKey) {
    const resendFrom =
      process.env.RESEND_FROM?.trim() || `${fromName} <onboarding@resend.dev>`;

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: resendFrom,
          to: [to],
          ...(replyTo ? { reply_to: replyTo } : {}),
          subject,
          html,
          text,
        }),
      });

      const data = (await response.json()) as { id?: string; message?: string };
      if (!response.ok) {
        return res.status(response.status).json({
          ok: false,
          provider: 'resend',
          error: data.message || 'Resend üzerinden gönderilemedi.',
        });
      }

      await recordEmailLog(ipHash, recipientHash, cardId);

      return res.status(200).json({ ok: true, provider: 'resend', id: data.id });
    } catch (err) {
      return res.status(502).json({
        ok: false,
        provider: 'resend',
        error: err instanceof Error ? err.message : 'Resend bağlantı hatası.',
      });
    }
  }

  return res.status(501).json({
    ok: false,
    configured: false,
    error:
      'Sunucu e-posta ayarı henüz yapılmadı. Vercel ortam değişkenlerine GMAIL_USER ve GMAIL_APP_PASSWORD ekleyin.',
  });
}
