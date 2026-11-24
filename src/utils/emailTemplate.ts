import { PostcardData } from '../types';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function generateEmailHtml(
  card: PostcardData,
  shareUrl: string,
  introNote: string,
  senderName: string
): string {
  const safeSender = escapeHtml(senderName || 'Bir arkadaşın');
  const safeMotto = escapeHtml(card.envelopeMotto || 'Sana bir kartpostal var');
  const safeIntro = escapeHtml(
    introNote || 'Senin için özel olarak hazırlanmış interaktif bir dijital kartpostal bıraktım.'
  );
  const safeSubtag = escapeHtml(card.envelopeSubtag || '[ÖZEL POSTA]');
  const safeUrl = escapeHtml(shareUrl);
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
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:20px 32px 24px 32px;">
              <a href="${safeUrl}" style="display:block;text-decoration:none;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:400px;background-color:${card.envelopeColor};border-radius:10px;border:1px solid rgba(0,0,0,0.08);box-shadow:0 12px 28px rgba(0,0,0,0.16);">
                  <tr>
                    <td align="center" style="padding:46px 24px 36px 24px;">
                      <p style="margin:0 0 6px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:10px;letter-spacing:1.8px;color:${card.envelopeTextColor};opacity:0.75;">
                        ${safeSubtag}
                      </p>
                      <p style="margin:0;font-size:28px;font-style:italic;color:${card.envelopeTextColor};line-height:1.25;">
                        ${safeMotto}
                      </p>
                      <div style="margin:24px auto 0 auto;width:44px;height:44px;line-height:44px;border-radius:50%;background-color:${card.waxSealColor};color:#FBF8F3;font-size:16px;font-weight:bold;text-align:center;">
                        ${escapeHtml(card.waxSealInitial || '✉')}
                      </div>
                    </td>
                  </tr>
                </table>
              </a>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:8px 32px 38px 32px;">
              <a href="${safeUrl}" style="display:inline-block;padding:14px 32px;background-color:${card.waxSealColor};color:#FFFFFF;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:14px;font-weight:600;letter-spacing:0.4px;text-decoration:none;border-radius:999px;">
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

export function buildMailtoUrl(
  recipientEmail: string,
  subject: string,
  introNote: string,
  shareUrl: string
): string {
  const safeSubject = subject || 'Sana interaktif bir kartpostal geldi ✉';
  const body = `${introNote || 'Sana özel bir dijital kartpostal hazırladım!'}\n\nZarfı açıp mektubu okumak için tıkla:\n${shareUrl}\n\n— Postale ile gönderildi`;
  return `mailto:${encodeURIComponent(recipientEmail)}?subject=${encodeURIComponent(
    safeSubject
  )}&body=${encodeURIComponent(body)}`;
}
