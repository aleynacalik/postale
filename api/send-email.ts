// Optional Vercel Serverless Function example for real email delivery via Resend
// Deploy to Vercel and set RESEND_API_KEY in your project environment variables.

interface EmailRequestBody {
  to: string;
  subject: string;
  html: string;
  fromName?: string;
}

export default async function handler(req: { method?: string; body?: EmailRequestBody }, res: { status: (code: number) => { json: (data: unknown) => void } }) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'RESEND_API_KEY is not configured' });
  }

  const { to, subject, html, fromName } = req.body || {};
  if (!to || !subject || !html) {
    return res.status(400).json({ error: 'Missing required fields: to, subject, html' });
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `${fromName || 'Postale'} <posta@yourdomain.com>`,
      to: [to],
      subject,
      html,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    return res.status(response.status).json({ error: data });
  }

  return res.status(200).json({ ok: true, id: data.id });
}
