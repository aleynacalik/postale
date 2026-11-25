import React, { useEffect, useMemo, useState } from 'react';
import {
  Check,
  Code2,
  Copy,
  ExternalLink,
  Loader2,
  Mail,
  Send,
  Sparkles,
  X,
} from 'lucide-react';
import { PostcardData } from '../types';
import { saveCardToServer, sendPostcardEmail } from '../utils/api';
import { buildMailtoUrl, generateEmailHtml } from '../utils/emailTemplate';
import { formatUnlockDateTr } from '../utils/media';
import { buildShareUrl } from '../utils/share';

// Cache saved card fingerprints in memory so reopening SendModal without edits reuses the same short link
const savedCardCache = new Map<string, { id: string; shortUrl: string }>();

interface SendModalProps {
  card: PostcardData;
  initialRecipientEmail?: string;
  onClose: () => void;
  onPreviewOpen: () => void;
}

export const SendModal: React.FC<SendModalProps> = ({
  card,
  initialRecipientEmail = '',
  onClose,
  onPreviewOpen,
}) => {
  const [recipientEmail, setRecipientEmail] = useState(initialRecipientEmail);
  const [senderReplyEmail, setSenderReplyEmail] = useState('');
  const [senderName, setSenderName] = useState(() => {
    const lastLine = card.senderSignoff.split('\n').pop()?.trim() || '';
    return lastLine && lastLine !== 'İsmin' ? lastLine : '';
  });
  const [subject, setSubject] = useState('Sana interaktif bir kartpostal geldi ✉');
  const [introNote, setIntroNote] = useState(
    'Senin için özel bir dijital kartpostal hazırladım. Aşağıdaki zarfa tıklayıp açabilirsin!'
  );

  const cardFingerprint = useMemo(() => JSON.stringify(card), [card]);
  const cachedEntry = savedCardCache.get(cardFingerprint);

  const [shortUrl, setShortUrl] = useState<string | null>(cachedEntry?.shortUrl || null);
  const [cardId, setCardId] = useState<string | null>(cachedEntry?.id || null);
  const [honeypot, setHoneypot] = useState('');
  const [creatingShortLink, setCreatingShortLink] = useState(!cachedEntry);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [copiedRichEmail, setCopiedRichEmail] = useState(false);

  const [sendingEmail, setSendingEmail] = useState(false);
  const [sendResult, setSendResult] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const fallbackShareUrl = useMemo(() => buildShareUrl(card), [card]);
  const activeShareUrl = shortUrl || fallbackShareUrl;

  // Automatically save to Supabase (reusing cached short link if card didn't change)
  useEffect(() => {
    const existing = savedCardCache.get(cardFingerprint);
    if (existing) {
      setShortUrl(existing.shortUrl);
      setCardId(existing.id);
      setCreatingShortLink(false);
      return;
    }

    let active = true;
    setShortUrl(null);
    setCardId(null);
    setCreatingShortLink(true);
    saveCardToServer(card).then((res) => {
      if (!active) return;
      if (res.ok && res.shortUrl && res.id) {
        savedCardCache.set(cardFingerprint, { id: res.id, shortUrl: res.shortUrl });
        setShortUrl(res.shortUrl);
        setCardId(res.id);
      }
      setCreatingShortLink(false);
    });
    return () => {
      active = false;
    };
  }, [card, cardFingerprint]);

  const emailHtml = useMemo(
    () => generateEmailHtml(card, activeShareUrl, introNote, senderName),
    [card, activeShareUrl, introNote, senderName]
  );

  const mailtoUrl = useMemo(
    () => buildMailtoUrl(recipientEmail, subject, introNote, activeShareUrl),
    [recipientEmail, subject, introNote, activeShareUrl]
  );

  const futureUnlockLabel = useMemo(() => {
    if (!card.unlockAt) return null;
    const t = new Date(card.unlockAt).getTime();
    if (Number.isNaN(t) || t <= Date.now()) return null;
    return formatUnlockDateTr(card.unlockAt);
  }, [card.unlockAt]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(activeShareUrl);
      setCopiedLink(true);
      window.setTimeout(() => setCopiedLink(false), 2200);
    } catch {
      // Fallback
    }
  };

  const handleCopyRichEmail = async () => {
    try {
      const htmlBlob = new Blob([emailHtml], { type: 'text/html' });
      const textBlob = new Blob(
        [`${introNote}\n\nZarfı açmak için tıkla: ${activeShareUrl}`],
        { type: 'text/plain' }
      );
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': htmlBlob,
          'text/plain': textBlob,
        }),
      ]);
      setCopiedRichEmail(true);
      window.setTimeout(() => setCopiedRichEmail(false), 2600);
    } catch {
      await handleCopyHtml();
    }
  };

  const handleCopyHtml = async () => {
    try {
      await navigator.clipboard.writeText(emailHtml);
      setCopiedHtml(true);
      window.setTimeout(() => setCopiedHtml(false), 2200);
    } catch {
      // Fallback
    }
  };

  const handleDirectSendEmail = async () => {
    const cleanTo = recipientEmail.trim();
    if (!cleanTo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanTo)) {
      setSendResult({
        type: 'error',
        message: 'Lütfen geçerli bir alıcı e-posta adresi gir.',
      });
      return;
    }

    const cleanReplyTo = senderReplyEmail.trim();
    if (cleanReplyTo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanReplyTo)) {
      setSendResult({
        type: 'error',
        message: 'Kendi e-posta adresin geçersiz görünüyor (isteğe bağlı, boş da bırakabilirsin).',
      });
      return;
    }

    setSendingEmail(true);
    setSendResult(null);

    let verifiedCardId = cardId;
    if (!verifiedCardId) {
      const saved = await saveCardToServer(card);
      if (saved.ok && saved.shortUrl && saved.id) {
        savedCardCache.set(cardFingerprint, { id: saved.id, shortUrl: saved.shortUrl });
        setShortUrl(saved.shortUrl);
        setCardId(saved.id);
        verifiedCardId = saved.id;
      }
    }

    if (!verifiedCardId) {
      setSendingEmail(false);
      setSendResult({
        type: 'error',
        message:
          'Kartpostal kaydedilemedi. Doğrudan e-posta gönderimi Vercel + Supabase üzerinde çalışır; aşağıdaki “Görsel Maili Kopyala” butonunu kullanabilirsin.',
      });
      return;
    }

    const res = await sendPostcardEmail({
      to: cleanTo,
      replyTo: cleanReplyTo || undefined,
      cardId: verifiedCardId,
      subject,
      introNote,
      fromName: senderName || 'Postale',
      website: honeypot,
    });

    setSendingEmail(false);

    if (res.ok) {
      setSendResult({
        type: 'success',
        message: `Kartpostalın ${cleanTo} adresine başarıyla gönderildi! ✉`,
      });
    } else {
      setSendResult({
        type: 'error',
        message:
          res.error ||
          'Doğrudan gönderim yapılamadı. Aşağıdaki “Görsel Maili Kopyala” seçeneğini kullanabilirsin.',
      });
    }
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    `${introNote}\n\nZarfı açmak için tıkla: ${activeShareUrl}`
  )}`;

  const hasLargeCustomMedia = !shortUrl && activeShareUrl.length > 14000;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="send-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="modal-kicker">GÖNDER & PAYLAŞ</span>
            <h2>İnteraktif Mektubunu Gönder</h2>
          </div>
          <button type="button" className="icon-close-btn" onClick={onClose} aria-label="Kapat">
            <X size={18} />
          </button>
        </div>

        <div className="modal-grid">
          {/* Left column: Share link & direct email form */}
          <div className="modal-form-col">
            <div className="modal-section">
              <div className="label-badge-row">
                <label className="field-label">1. Kişiye Özel İnteraktif Link</label>
                {creatingShortLink ? (
                  <span className="status-pill neutral">
                    <Loader2 size={11} className="spin" /> Link hazırlanıyor...
                  </span>
                ) : shortUrl ? (
                  <span className="status-pill success">✓ Kısa Link Aktif</span>
                ) : null}
              </div>
              <p className="field-help">
                Bu link açıldığında alıcı önce mühürlü zarfını görür, tıklayınca kartpostal içinden çıkar.
              </p>
              <div className="copy-link-row">
                <input
                  type="text"
                  readOnly
                  value={creatingShortLink ? 'Kısa link oluşturuluyor...' : activeShareUrl}
                  className="text-input mono"
                />
                <button
                  type="button"
                  className="pill-btn primary small"
                  onClick={handleCopyLink}
                  disabled={creatingShortLink}
                >
                  {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedLink ? 'Kopyalandı' : 'Kopyala'}</span>
                </button>
              </div>
              {hasLargeCustomMedia && (
                <p className="field-warn">
                  Özel fotoğraf yüklendiği için link uzundur; Vercel + Supabase bağlandığında otomatik kısa linke dönüşür.
                </p>
              )}
              <div className="quick-share-row">
                <a
                  href={creatingShortLink ? undefined : whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-disabled={creatingShortLink}
                  className={`pill-btn ghost small ${creatingShortLink ? 'is-disabled-link' : ''}`}
                  onClick={(e) => {
                    if (creatingShortLink) e.preventDefault();
                  }}
                >
                  <ExternalLink size={14} />
                  <span>WhatsApp ile Gönder</span>
                </a>
                <button
                  type="button"
                  className="pill-btn ghost small"
                  onClick={() => {
                    onClose();
                    onPreviewOpen();
                  }}
                >
                  <Sparkles size={14} />
                  <span>Açılış Deneyimini Test Et</span>
                </button>
              </div>
            </div>

            <div className="modal-divider" />

            <div className="modal-section">
              <div className="label-badge-row">
                <label className="field-label">2. Tek Tıkla E-posta Gönder</label>
                {initialRecipientEmail && (
                  <span className="status-pill success">✓ Cevap adresi hazır</span>
                )}
              </div>

              <div className="form-row-2">
                <div>
                  <span className="mini-label">Gönderen Adı</span>
                  <input
                    type="text"
                    className="text-input"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Adın"
                  />
                </div>
                <div>
                  <span className="mini-label">Alıcı E-posta</span>
                  <input
                    type="email"
                    className="text-input"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="arkadasin@mail.com"
                  />
                </div>
              </div>

              <div className="form-field">
                <span className="mini-label">
                  Senin E-postan <em>(isteğe bağlı — alıcı sana direkt cevap dönebilsin diye)</em>
                </span>
                <input
                  type="email"
                  className="text-input"
                  value={senderReplyEmail}
                  onChange={(e) => setSenderReplyEmail(e.target.value)}
                  placeholder="senin@mailin.com"
                />
              </div>

              <div className="form-field">
                <span className="mini-label">E-posta Konusu</span>
                <input
                  type="text"
                  className="text-input"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div className="form-field">
                <span className="mini-label">Mail Giriş Notu</span>
                <textarea
                  rows={2}
                  className="text-input"
                  value={introNote}
                  onChange={(e) => setIntroNote(e.target.value)}
                />
              </div>

              {/* Hidden honeypot field against automated spam bots */}
              <input
                type="text"
                name="website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  left: '-9999px',
                  width: '1px',
                  height: '1px',
                  opacity: 0,
                  pointerEvents: 'none',
                }}
              />

              {sendResult && (
                <div className={`send-feedback ${sendResult.type}`}>
                  {sendResult.message}
                </div>
              )}

              <button
                type="button"
                className="pill-btn primary full"
                onClick={handleDirectSendEmail}
                disabled={sendingEmail}
              >
                {sendingEmail ? <Loader2 size={15} className="spin" /> : <Send size={15} />}
                <span>
                  {sendingEmail ? 'Kartpostal Gönderiliyor...' : 'Doğrudan E-posta Gönder ✉'}
                </span>
              </button>

              <div className="email-action-row">
                <button type="button" className="pill-btn ghost small" onClick={handleCopyRichEmail}>
                  {copiedRichEmail ? <Check size={14} /> : <Mail size={14} />}
                  <span>
                    {copiedRichEmail ? 'Kopyalandı! (⌘V)' : 'Görsel Maili Kopyala (⌘V)'}
                  </span>
                </button>
                <a href={mailtoUrl} className="pill-btn ghost small">
                  <ExternalLink size={14} />
                  <span>Mail Uygulaması</span>
                </a>
                <button type="button" className="pill-btn ghost small" onClick={handleCopyHtml}>
                  {copiedHtml ? <Check size={14} /> : <Code2 size={14} />}
                  <span>{copiedHtml ? 'HTML Kopyalandı!' : 'HTML'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right column: Realistic Email Inbox Preview */}
          <div className="modal-preview-col">
            <div className="inbox-mockup">
              <div className="inbox-chrome">
                <div className="chrome-dots">
                  <span />
                  <span />
                  <span />
                </div>
                <span className="chrome-title">
                  <Mail size={12} /> Gelen Kutusu Önizlemesi
                </span>
              </div>

              <div className="inbox-meta">
                <div>
                  <strong>Konu:</strong> {subject}
                </div>
                <div>
                  <strong>Kimden:</strong> {senderName || 'Postale'} (Postale)
                </div>
                <div>
                  <strong>Kime:</strong> {recipientEmail || 'alici@ornek.com'}
                </div>
                {senderReplyEmail.trim() && (
                  <div>
                    <strong>Yanıt Adresi:</strong> {senderReplyEmail.trim()}
                  </div>
                )}
              </div>

              <div
                className="inbox-email-canvas"
                style={{
                  backgroundColor: card.backdropDark ? '#111316' : '#F4ECE8',
                }}
              >
                <div
                  className="email-card-inner"
                  style={{
                    backgroundColor: card.backdropDark ? '#191C22' : '#FFFFFF',
                    color: card.backdropDark ? '#F5F2EC' : '#2C2324',
                  }}
                >
                  <span className="email-kicker">POSTALE • DİJİTAL POSTA</span>
                  <h3>{senderName || 'Bir arkadaşın'} sana bir mektup gönderdi</h3>
                  <p className="email-intro">{introNote}</p>

                  {futureUnlockLabel && (
                    <span className="email-capsule-pill">
                      ⏳ Zaman Kapsülü • {futureUnlockLabel} tarihinde açılır
                    </span>
                  )}

                  {/* Mini clickable envelope inside the email */}
                  <button
                    type="button"
                    className="email-mini-envelope"
                    style={{
                      backgroundColor: card.envelopeColor,
                      color: card.envelopeTextColor,
                    }}
                    onClick={() => {
                      onClose();
                      onPreviewOpen();
                    }}
                  >
                    <div
                      className="mini-env-flap"
                      style={{ borderTopColor: card.envelopeInnerColor }}
                    />
                    <span className="mini-env-subtag">{card.envelopeSubtag}</span>
                    <span className="mini-env-motto">{card.envelopeMotto}</span>
                    <span
                      className="mini-env-seal"
                      style={{ backgroundColor: card.waxSealColor }}
                    >
                      {card.waxSealInitial || '✉'}
                    </span>
                  </button>

                  <button
                    type="button"
                    className="email-cta-btn"
                    style={{ backgroundColor: card.waxSealColor }}
                    onClick={() => {
                      onClose();
                      onPreviewOpen();
                    }}
                  >
                    Zarfı Aç ve Kartpostalı Oku ✉
                  </button>
                  <span className="email-footnote">
                    Önizlemede de çalışır — zarfa tıklayıp deneyimi gör!
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
