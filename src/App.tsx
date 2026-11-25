import React, { useEffect, useRef, useState } from 'react';
import {
  Eye,
  Mail,
  Minus,
  Plus,
  RotateCcw,
  RotateCw,
  Send,
  Sparkles,
  Square,
  FileText,
  Trash2,
} from 'lucide-react';
import { InteractiveEnvelope } from './components/InteractiveEnvelope';
import { FlippablePostcard } from './components/PostcardFace';
import { RecipientView } from './components/RecipientView';
import { SendModal } from './components/SendModal';
import { STICKER_CATALOG } from './components/StickerLayer';
import { StudioSidebar } from './components/StudioSidebar';
import { DEFAULT_POSTCARD, TEMPLATE_PRESETS } from './data/presets';
import { PlacedSticker, PostcardData, StickerKind, TemplatePreset } from './types';
import { extractShortCardIdFromUrl, fetchCardFromServer } from './utils/api';
import { playCardFlip } from './utils/audio';
import {
  clearCardFromBrowserUrl,
  clearDraft,
  decodePostcardFromHash,
  loadDraft,
  saveDraft,
} from './utils/share';

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
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
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
      placedStickers: prev.placedStickers,
      signatureSvg: prev.signatureSvg,
      spotifyUrl: prev.spotifyUrl,
      voiceNote: prev.voiceNote,
      unlockAt: prev.unlockAt,
      unlockNote: prev.unlockNote,
    }));
  };

  const handleAddSticker = (kind: StickerKind) => {
    const targetSide: 'front' | 'back' = stageView === 'back' ? 'back' : 'front';
    if (stageView === 'envelope') {
      setStageView('front');
    }
    const catalogItem = STICKER_CATALOG.find((c) => c.kind === kind);
    const id = `stk_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    const existingCount = (card.placedStickers || []).filter((s) => s.side === targetSide).length;
    const offset = (existingCount % 5) * 6;
    const newSticker: PlacedSticker = {
      id,
      kind,
      side: targetSide,
      x: Math.min(82, 24 + offset),
      y: Math.min(80, 24 + offset),
      rotation: catalogItem?.defaultRotation ?? 0,
      scale: 1,
    };
    setCard((prev) => ({
      ...prev,
      placedStickers: [...(prev.placedStickers || []), newSticker],
    }));
    setSelectedStickerId(id);
  };

  const handleMoveSticker = (id: string, x: number, y: number) => {
    setCard((prev) => ({
      ...prev,
      placedStickers: (prev.placedStickers || []).map((s) =>
        s.id === id ? { ...s, x, y } : s
      ),
    }));
  };

  const handleAdjustSelectedSticker = (delta: { rotation?: number; scale?: number }) => {
    if (!selectedStickerId) return;
    setCard((prev) => ({
      ...prev,
      placedStickers: (prev.placedStickers || []).map((s) => {
        if (s.id !== selectedStickerId) return s;
        return {
          ...s,
          rotation: delta.rotation !== undefined ? s.rotation + delta.rotation : s.rotation,
          scale:
            delta.scale !== undefined
              ? Math.min(1.8, Math.max(0.55, Math.round((s.scale + delta.scale) * 100) / 100))
              : s.scale,
        };
      }),
    }));
  };

  const handleDeleteSelectedSticker = () => {
    if (!selectedStickerId) return;
    setCard((prev) => ({
      ...prev,
      placedStickers: (prev.placedStickers || []).filter((s) => s.id !== selectedStickerId),
    }));
    setSelectedStickerId(null);
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
    setSelectedStickerId(null);
    clearDraft();
    clearCardFromBrowserUrl();
    setCard({ ...DEFAULT_POSTCARD });
    setStageView('envelope');
    setEnvelopeClosedInStudio(false);
  };

  const handleReplyFromRecipient = () => {
    clearCardFromBrowserUrl();
    setIsRecipientFromLink(false);
    setSharedCardError(null);
    setCard((prev) => {
      const basePreset =
        TEMPLATE_PRESETS.find((p) => p.id === prev.theme)?.data || DEFAULT_POSTCARD;
      const previousSender = prev.senderSignoff.split('\n').pop()?.trim();
      return {
        ...basePreset,
        recipientName: previousSender ? `Sevgili ${previousSender},` : 'Sevgili Dostum,',
        recipientAddress1: '',
        recipientAddress2: '',
        message: 'Mektubunu aldım, çok mutlu oldum!\n\n',
        senderSignoff: 'sevgilerle,\n',
      };
    });
    setMode('studio');
    setStageView('back');
  };

  const selectedSticker =
    selectedStickerId && stageView !== 'envelope'
      ? (card.placedStickers || []).find(
          (s) => s.id === selectedStickerId && s.side === stageView
        )
      : null;

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
        onBackToStudio={() => {
          clearCardFromBrowserUrl();
          setMode('studio');
        }}
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
            onClick={() => {
              setSelectedStickerId(null);
              setStageView('envelope');
            }}
          >
            <Mail size={14} />
            <span>Zarf</span>
          </button>
          <button
            type="button"
            className={`switch-btn ${stageView === 'front' ? 'active' : ''}`}
            onClick={() => {
              setSelectedStickerId(null);
              setStageView('front');
            }}
          >
            <Square size={14} />
            <span>Ön Yüz</span>
          </button>
          <button
            type="button"
            className={`switch-btn ${stageView === 'back' ? 'active' : ''}`}
            onClick={() => {
              setSelectedStickerId(null);
              setStageView('back');
            }}
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
              setSelectedStickerId(null);
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
                  editableStickers
                  selectedStickerId={selectedStickerId}
                  onSelectSticker={setSelectedStickerId}
                  onMoveSticker={handleMoveSticker}
                  onFlip={() => {
                    if (card.soundEnabled) playCardFlip();
                    setSelectedStickerId(null);
                    setStageView((prev) => (prev === 'front' ? 'back' : 'front'));
                  }}
                />

                {selectedSticker ? (
                  <div className="sticker-floating-toolbar">
                    <span className="toolbar-hint">Sürükle veya ayarla:</span>
                    <button
                      type="button"
                      className="icon-pill-btn"
                      title="Sola döndür"
                      onClick={() => handleAdjustSelectedSticker({ rotation: -12 })}
                    >
                      <RotateCcw size={14} />
                    </button>
                    <button
                      type="button"
                      className="icon-pill-btn"
                      title="Sağa döndür"
                      onClick={() => handleAdjustSelectedSticker({ rotation: 12 })}
                    >
                      <RotateCw size={14} />
                    </button>
                    <button
                      type="button"
                      className="icon-pill-btn"
                      title="Küçült"
                      onClick={() => handleAdjustSelectedSticker({ scale: -0.15 })}
                    >
                      <Minus size={14} />
                    </button>
                    <button
                      type="button"
                      className="icon-pill-btn"
                      title="Büyüt"
                      onClick={() => handleAdjustSelectedSticker({ scale: 0.15 })}
                    >
                      <Plus size={14} />
                    </button>
                    <button
                      type="button"
                      className="icon-pill-btn danger"
                      title="Stickerı sil"
                      onClick={handleDeleteSelectedSticker}
                    >
                      <Trash2 size={14} />
                    </button>
                    <button
                      type="button"
                      className="pill-btn primary small"
                      onClick={() => setSelectedStickerId(null)}
                    >
                      Tamam
                    </button>
                  </div>
                ) : (
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
                )}
              </div>
            )}
          </div>
        </main>

        {/* Right Editor Sidebar */}
        <StudioSidebar
          card={card}
          stageView={stageView}
          onChange={handlePatchCard}
          onApplyPreset={handleApplyPreset}
          onSwitchStageView={(view) => {
            setSelectedStickerId(null);
            setStageView(view);
          }}
          onAddSticker={handleAddSticker}
          onClearStickers={() => {
            setSelectedStickerId(null);
            handlePatchCard({ placedStickers: [] });
          }}
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
