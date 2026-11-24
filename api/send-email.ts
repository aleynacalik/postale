import nodemailer from 'nodemailer';

interface ApiRequest {
  method?: string;
  body?: unknown;
}

interface ApiResponse {
  status: (code: number) => ApiResponse;
  json: (data: unknown) => void;
  setHeader: (name: string, value: string) => void;
}

interface EmailRequestBody {
  to?: string;
  subject?: string;
  html?: string;
  text?: string;
  fromName?: string;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sanitizeHeaderName(name: string): string {
  return name.replace(/[\r\n"<>]/g, '').trim().slice(0, 60) || 'Postale';
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const body: EmailRequestBody =
    typeof req.body === 'string'
      ? (JSON.parse(req.body) as EmailRequestBody)
      : ((req.body || {}) as EmailRequestBody);

  const to = (body.to || '').trim();
  const subject = (body.subject || 'Sana interaktif bir kartpostal geldi ✉').trim();
  const html = body.html || '';
  const text = body.text || '';
  const fromName = sanitizeHeaderName(body.fromName || 'Postale');

  if (!to || !isValidEmail(to)) {
    return res.status(400).json({ ok: false, error: 'Geçerli bir alıcı e-posta adresi girin.' });
  }

  if (!html) {
    return res.status(400).json({ ok: false, error: 'E-posta içeriği eksik.' });
  }

  // Provider 1: Gmail SMTP (Zero-cost, works for sending to any recipient without buying a domain)
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
        subject,
        text,
        html,
      });

      return res.status(200).json({
        ok: true,
        provider: 'gmail',
        id: info.messageId,
      });
    } catch (err) {
      const [localPart, domainPart] = gmailUser.split('@');
      const maskedUser =
        localPart && domainPart
          ? `${localPart.slice(0, 3)}***@${domainPart}`
          : gmailUser;
      const errMsg =
        err instanceof Error ? err.message : 'Gmail üzerinden gönderilemedi.';

      return res.status(502).json({
        ok: false,
        provider: 'gmail',
        error: `Gmail gönderim hatası (${maskedUser} • şifre ${gmailPass.length} karakter): ${errMsg}`,
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
