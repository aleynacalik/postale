import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  MailOpen,
  Music,
  PenLine,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { PostcardData } from '../types';
import {
  playCardFlip,
  playPaperRustle,
  playSealPop,
  startAmbientChime,
  stopAmbientChime,
} from '../utils/audio';
import { EnvelopeStage, InteractiveEnvelope } from './InteractiveEnvelope';
import { FlippablePostcard } from './PostcardFace';

interface RecipientViewProps {
  card: PostcardData;
  isPreview?: boolean;
  onBackToStudio?: () => void;
  onReply: () => void;
}

export const RecipientView: React.FC<RecipientViewProps> = ({
  card,
  isPreview = false,
  onBackToStudio,
  onReply,
}) => {
  const [stage, setStage] = useState<EnvelopeStage>('closed');
  const [isFlipped, setIsFlipped] = useState(false);
  const [soundOn, setSoundOn] = useState(card.soundEnabled);
  const [musicOn, setMusicOn] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      stopAmbientChime();
    };
  }, []);

  const handleOpenEnvelope = () => {
    if (stage !== 'closed') return;
    if (soundOn) {
      playSealPop();
      window.setTimeout(() => playPaperRustle(), 180);
    }
    if (card.ambientMusic && soundOn) {
      setMusicOn(true);
      startAmbientChime();
    }
    setStage('opening');
    timerRef.current = window.setTimeout(() => {
      setStage('extracted');
    }, 1450);
  };

  const handleReplay = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setIsFlipped(false);
    setStage('closed');
  };

  const handleFlip = () => {
    if (soundOn) playCardFlip();
    setIsFlipped((prev) => !prev);
  };

  const toggleMusic = () => {
    if (musicOn) {
      stopAmbientChime();
      setMusicOn(false);
    } else {
      startAmbientChime();
      setMusicOn(true);
    }
  };

  return (
    <div className={`recipient-screen ${card.backdropDark ? 'theme-dark' : 'theme-light'}`}>
      <div className="recipient-backdrop-grain" />

      {/* Top subtle floating navigation */}
      <header className="recipient-topbar">
        <div className="recipient-brand">
          {isPreview && onBackToStudio ? (
            <button type="button" className="pill-btn ghost" onClick={onBackToStudio}>
              <ArrowLeft size={16} />
              <span>Stüdyoya Dön</span>
            </button>
          ) : (
            <span className="brand-wordmark">Postale</span>
          )}
        </div>

        <div className="recipient-controls">
          <button
            type="button"
            className={`icon-pill-btn ${musicOn ? 'active' : ''}`}
            onClick={toggleMusic}
            title={musicOn ? 'Melodiyi durdur' : 'Yumuşak melodi çal'}
          >
            <Music size={15} />
          </button>
          <button
            type="button"
            className="icon-pill-btn"
            onClick={() => {
              const next = !soundOn;
              setSoundOn(next);
              if (!next && musicOn) {
                stopAmbientChime();
                setMusicOn(false);
              }
            }}
            title={soundOn ? 'Sesleri kapat' : 'Sesleri aç'}
          >
            {soundOn ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>
        </div>
      </header>

      {/* Main interactive stage */}
      <main className="recipient-stage">
        {stage !== 'extracted' ? (
          <div className="ceremony-wrap">
            <div className="ceremony-intro">
              <span className="ceremony-kicker">
                {card.recipientName ? `${card.recipientName.replace(/,$/, '')} için` : 'Sana özel bir posta'}
              </span>
              <h1 className="ceremony-heading">
                {stage === 'closed' ? 'Mühürlü bir mektubun var' : 'Zarf açılıyor...'}
              </h1>
            </div>

            <InteractiveEnvelope
              card={card}
              stage={stage}
              onClickEnvelope={handleOpenEnvelope}
              interactiveHint="Zarfı açmak için tıkla"
            />
          </div>
        ) : (
          <div className="extracted-showcase">
            <div className="extracted-card-wrap">
              <FlippablePostcard card={card} isFlipped={isFlipped} onFlip={handleFlip} />
            </div>

            <p className="flip-helper-note">
              <MailOpen size={14} />
              <span>
                {isFlipped
                  ? 'Ön yüzdeki tasarımı görmek için kartpostala tıkla'
                  : 'Arkasına yazılmış el yazısı notu okumak için kartpostala tıkla'}
              </span>
            </p>

            <div className="extracted-actions">
              <button type="button" className="pill-btn primary" onClick={handleFlip}>
                <RotateCw size={15} />
                <span>{isFlipped ? 'Ön Yüzü Gör' : 'Arka Yüzü Çevir & Oku'}</span>
              </button>

              <button type="button" className="pill-btn ghost" onClick={handleReplay}>
                <RotateCcw size={15} />
                <span>Zarfı Tekrar Aç</span>
              </button>

              <button type="button" className="pill-btn ghost" onClick={onReply}>
                <PenLine size={15} />
                <span>Cevap Kartpostalı Hazırla</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
