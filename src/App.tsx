import React, { useEffect, useRef, useState } from 'react';
import {
  Eye,
  Mail,
  RotateCcw,
  RotateCw,
  Send,
  Sparkles,
  Square,
  FileText,
} from 'lucide-react';
import { InteractiveEnvelope } from './components/InteractiveEnvelope';
import { FlippablePostcard } from './components/PostcardFace';
import { RecipientView } from './components/RecipientView';
import { SendModal } from './components/SendModal';
import { StudioSidebar } from './components/StudioSidebar';
import { DEFAULT_POSTCARD } from './data/presets';
import { PostcardData, TemplatePreset } from './types';
import { extractShortCardIdFromUrl, fetchCardFromServer } from './utils/api';
import { playCardFlip } from './utils/audio';
import { clearDraft, decodePostcardFromHash, loadDraft, saveDraft } from './utils/share';

type AppMode = 'studio' | 'recipient';
type StageView = 'envelope' | 'front' | 'back';

export default function App() {
  const [mode, setMode] = useState<AppMode>('studio');
  const [isRecipientFromLink, setIsRecipientFromLink] = useState(false);
  const [loadingSharedCard, setLoadingSharedCard] = useState(false);
  const [sharedCardError, setSharedCardError] = useState<string | null>(null);
  const [stageView, setStageView] = useState<StageView>('envelope');
  const [envelopeClosedInStudio, setEnvelopeClosedInStudio] = useState(false);
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const resetTimerRef = useRef<number | null>(null);

  const [card, setCard] = useState<PostcardData>(() => {
    const fromHash = decodePostcardFromHash(window.location.hash);
    if (fromHash) return fromHash;
    const saved = loadDraft();
    return saved || DEFAULT_POSTCARD;
  });

  // Detect short link (/m/abc1234) or hash link (#m=...)
  useEffect(() => {
    const shortId = extractShortCardIdFromUrl();
    if (shortId) {
      setLoadingSharedCard(true);
      setSharedCardError(null);
      fetchCardFromServer(shortId).then((res) => {
        setLoadingSharedCard(false);
        if (res.ok && res.card) {
          setCard(res.card);
          setMode('recipient');
          setIsRecipientFromLink(true);
        } else {
          setSharedCardError(res.error || 'Bu kartpostal bulunamadı.');
        }
      });
      return;
    }

    const checkHash = () => {
      const shared = decodePostcardFromHash(window.location.hash);
      if (shared) {
        setCard(shared);
        setMode('recipient');
        setIsRecipientFromLink(true);
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  // Auto-save draft when editing in studio
  useEffect(() => {
    if (mode === 'studio' && !loadingSharedCard && !sharedCardError) {
      saveDraft(card);
    }
  }, [card, mode, loadingSharedCard, sharedCardError]);

  const handlePatchCard = (patch: Partial<PostcardData>) => {
    setCard((prev) => ({ ...prev, ...patch }));
  };

  const handleApplyPreset = (preset: TemplatePreset) => {
    setCard((prev) => ({
      ...preset.data,
      customPhoto: prev.customPhoto,
      customStamp: prev.customStamp,
    }));
  };

  const handleResetDesign = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      if (resetTimerRef.current) window.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = window.setTimeout(() => {
        setConfirmReset(false);
      }, 3500);
      return;
    }
    if (resetTimerRef.current) window.clearTimeout(resetTimerRef.current);
    setConfirmReset(false);
    clearDraft();
    setCard({ ...DEFAULT_POSTCARD });
    setStageView('envelope');
    setEnvelopeClosedInStudio(false);
  };

  const handleReplyFromRecipient = () => {
    window.history.replaceState(null, '', '/');
    setIsRecipientFromLink(false);
    setSharedCardError(null);
    setCard((prev) => ({
      ...prev,
      recipientName: prev.senderSignoff.split('\n').pop()?.trim() || 'Sevgili Dostum,',
      message: 'Mektubunu aldım, çok mutlu oldum!\n\n',
      senderSignoff: 'sevgilerle,\n',
    }));
    setMode('studio');
    setStageView('back');
  };

  if (loadingSharedCard) {
    return (
      <div className="shared-status-screen">
        <div className="shared-status-card">
          <span className="status-envelope-icon">✉</span>
          <h2>Mektubun hazırlanıyor...</h2>
          <p>Zarfın masaya bırakılıyor, birkaç saniye içinde açılacak.</p>
        </div>
      </div>
    );
  }

  if (sharedCardError) {
    return (
      <div className="shared-status-screen">
        <div className="shared-status-card">
          <span className="status-envelope-icon">✉</span>
          <h2>Kartpostal bulunamadı</h2>
          <p>{sharedCardError}</p>
          <button
            type="button"
            className="pill-btn primary"
            onClick={() => {
              window.history.replaceState(null, '', '/');
              setSharedCardError(null);
              setMode('studio');
            }}
          >
            Yeni Kartpostal Hazırla
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'recipient') {
    return (
      <RecipientView
        card={card}
        isPreview={!isRecipientFromLink}
        onBackToStudio={() => setMode('studio')}
        onReply={handleReplyFromRecipient}
      />
    );
  }

  return (
    <div className={`studio-app ${card.backdropDark ? 'stage-dark' : 'stage-light'}`}>
      {/* Top Bar */}
      <header className="studio-header">
        <div className="studio-brand">
          <span className="brand-mark">✉</span>
          <div>
            <h1>Postale</h1>
            <span className="brand-sub">Dijital Kartpostal & Zarf Stüdyosu</span>
          </div>
        </div>

        {/* Center Stage View Switcher */}
        <div className="stage-switcher" role="group" aria-label="Sahne görünümü">
          <button
            type="button"
            className={`switch-btn ${stageView === 'envelope' ? 'active' : ''}`}
            onClick={() => setStageView('envelope')}
          >
            <Mail size={14} />
            <span>Zarf</span>
          </button>
          <button
            type="button"
            className={`switch-btn ${stageView === 'front' ? 'active' : ''}`}
            onClick={() => setStageView('front')}
          >
            <Square size={14} />
            <span>Ön Yüz</span>
          </button>
          <button
            type="button"
            className={`switch-btn ${stageView === 'back' ? 'active' : ''}`}
            onClick={() => setStageView('back')}
          >
            <FileText size={14} />
            <span>Arka Yüz</span>
          </button>
        </div>

        {/* Right Actions */}
        <div className="studio-actions">
          <button
            type="button"
            className={`pill-btn ghost ${confirmReset ? 'danger-confirm' : ''}`}
            onClick={handleResetDesign}
            title="Tüm değişiklikleri ve yüklenen görselleri sıfırla"
          >
            <RotateCcw size={14} />
            <span>{confirmReset ? 'Emin misin? Tıkla' : 'Sıfırla'}</span>
          </button>
          <button
            type="button"
            className="pill-btn ghost"
            onClick={() => {
              setIsRecipientFromLink(false);
              setMode('recipient');
            }}
          >
            <Eye size={15} />
            <span>Alıcı Gözüyle Aç</span>
          </button>
          <button
            type="button"
            className="pill-btn primary"
            onClick={() => setSendModalOpen(true)}
          >
            <Send size={15} />
            <span>Gönder & Paylaş</span>
          </button>
        </div>
      </header>

      {/* Main Studio Body */}
      <div className="studio-workspace">
        {/* Live Canvas Stage */}
        <main className={`studio-stage ${card.backdropDark ? 'theme-dark' : 'theme-light'}`}>
          <div className="stage-paper-grain" />

          <div className="stage-center">
            {stageView === 'envelope' ? (
              <div className="studio-envelope-preview">
                <InteractiveEnvelope
                  card={card}
                  stage={envelopeClosedInStudio ? 'closed' : 'peeking'}
                  onClickEnvelope={() => setEnvelopeClosedInStudio((v) => !v)}
                  interactiveHint="İçini görmek için tıkla"
                />
                <div className="stage-caption-row">
                  <button
                    type="button"
                    className="pill-btn ghost small"
                    onClick={() => setEnvelopeClosedInStudio((v) => !v)}
                  >
                    <Sparkles size={13} />
                    <span>{envelopeClosedInStudio ? 'Zarfı Arala' : 'Zarfı Mühürle'}</span>
                  </button>
                  <button
                    type="button"
                    className="pill-btn ghost small"
                    onClick={() => {
                      setIsRecipientFromLink(false);
                      setMode('recipient');
                    }}
                  >
                    <Eye size={13} />
                    <span>Tam Açılış Animasyonunu İzle</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="studio-card-preview">
                <FlippablePostcard
                  card={card}
                  isFlipped={stageView === 'back'}
                  onFlip={() => {
                    if (card.soundEnabled) playCardFlip();
                    setStageView((prev) => (prev === 'front' ? 'back' : 'front'));
                  }}
                />
                <div className="stage-caption-row">
                  <button
                    type="button"
                    className="pill-btn ghost small"
                    onClick={() => {
                      if (card.soundEnabled) playCardFlip();
                      setStageView((prev) => (prev === 'front' ? 'back' : 'front'));
                    }}
                  >
                    <RotateCw size={13} />
                    <span>{stageView === 'front' ? 'Arka Yüzü Çevir' : 'Ön Yüzü Çevir'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Right Editor Sidebar */}
        <StudioSidebar
          card={card}
          onChange={handlePatchCard}
          onApplyPreset={handleApplyPreset}
          onSwitchStageView={(view) => setStageView(view)}
        />
      </div>

      {sendModalOpen && (
        <SendModal
          card={card}
          onClose={() => setSendModalOpen(false)}
          onPreviewOpen={() => {
            setIsRecipientFromLink(false);
            setMode('recipient');
          }}
        />
      )}
    </div>
  );
}
