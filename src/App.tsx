import React, { useEffect, useState } from 'react';
import {
  Eye,
  Mail,
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
import { playCardFlip } from './utils/audio';
import { decodePostcardFromHash, loadDraft, saveDraft } from './utils/share';

type AppMode = 'studio' | 'recipient';
type StageView = 'envelope' | 'front' | 'back';

export default function App() {
  const [mode, setMode] = useState<AppMode>('studio');
  const [isRecipientFromLink, setIsRecipientFromLink] = useState(false);
  const [stageView, setStageView] = useState<StageView>('envelope');
  const [envelopeClosedInStudio, setEnvelopeClosedInStudio] = useState(false);
  const [sendModalOpen, setSendModalOpen] = useState(false);

  const [card, setCard] = useState<PostcardData>(() => {
    const fromHash = decodePostcardFromHash(window.location.hash);
    if (fromHash) return fromHash;
    const saved = loadDraft();
    return saved || DEFAULT_POSTCARD;
  });

  // Detect shared link on initial load or hash change
  useEffect(() => {
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
    if (mode === 'studio') {
      saveDraft(card);
    }
  }, [card, mode]);

  const handlePatchCard = (patch: Partial<PostcardData>) => {
    setCard((prev) => ({ ...prev, ...patch }));
  };

  const handleApplyPreset = (preset: TemplatePreset) => {
    setCard((prev) => ({
      ...preset.data,
      // Keep user's custom uploaded media if they want? Actually preset resets cleanly for true template preview
      customPhoto: prev.customPhoto,
      customStamp: prev.customStamp,
    }));
  };

  const handleReplyFromRecipient = () => {
    // Clear hash and open studio pre-populated as a reply
    window.history.replaceState(null, '', window.location.pathname);
    setIsRecipientFromLink(false);
    setCard((prev) => ({
      ...prev,
      recipientName: prev.senderSignoff.split('\n').pop()?.trim() || 'Sevgili Dostum,',
      message: 'Mektubunu aldım, çok mutlu oldum!\n\n',
      senderSignoff: 'sevgilerle,\n',
    }));
    setMode('studio');
    setStageView('back');
  };

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
