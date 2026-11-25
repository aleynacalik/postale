import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Lock,
  MailOpen,
  Music,
  PenLine,
  RotateCcw,
  RotateCw,
  Unlock,
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
import { formatUnlockDateTr, getCountdownParts } from '../utils/media';
import { EnvelopeStage, InteractiveEnvelope } from './InteractiveEnvelope';
import { MediaPlayerDock } from './MediaPlayerDock';
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
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [bypassLock, setBypassLock] = useState(false);
  const [shakeLocked, setShakeLocked] = useState(false);
  const timerRef = useRef<number | null>(null);

  const unlockTimeMs = card.unlockAt ? new Date(card.unlockAt).getTime() : 0;
  const isTimeLocked = Boolean(
    card.unlockAt && !Number.isNaN(unlockTimeMs) && unlockTimeMs > nowMs && !bypassLock
  );

  // Live 1-second ticker while Time Capsule lock is active
  useEffect(() => {
    if (!isTimeLocked) return;
    const interval = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => window.clearInterval(interval);
  }, [isTimeLocked]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      stopAmbientChime();
    };
  }, []);

  const handleOpenEnvelope = () => {
    if (stage !== 'closed') return;
    if (isTimeLocked) {
      if (soundOn) playSealPop();
      setShakeLocked(true);
      window.setTimeout(() => setShakeLocked(false), 520);
      return;
    }

    if (soundOn) {
      playSealPop();
      window.setTimeout(() => playPaperRustle(), 180);
    }
    if (card.ambientMusic && soundOn && !card.voiceNote && !card.spotifyUrl) {
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

  const countdown = isTimeLocked && card.unlockAt ? getCountdownParts(card.unlockAt, nowMs) : null;
  const senderDisplay = card.senderSignoff.split('\n').pop()?.trim() || undefined;

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
                {card.recipientName
                  ? `${card.recipientName.replace(/,$/, '')} için`
                  : 'Sana özel bir posta'}
              </span>
              <h1 className="ceremony-heading">
                {isTimeLocked
                  ? 'Zaman kapsüllü bir mektubun var'
                  : stage === 'closed'
                    ? 'Mühürlü bir mektubun var'
                    : 'Zarf açılıyor...'}
              </h1>
            </div>

            <div className={shakeLocked ? 'envelope-locked-shake' : ''}>
              <InteractiveEnvelope
                card={card}
                stage={stage}
                onClickEnvelope={handleOpenEnvelope}
                interactiveHint={isTimeLocked ? undefined : 'Zarfı açmak için tıkla'}
              />
            </div>

            {isTimeLocked && countdown && card.unlockAt && (
              <div className="time-capsule-card">
                <div className="capsule-header">
                  <Lock size={14} />
                  <span>
                    Bu mektup <strong>{formatUnlockDateTr(card.unlockAt)}</strong> tarihinde açılacak
                  </span>
                </div>

                <div className="capsule-countdown-grid">
                  <div className="capsule-unit">
                    <strong>{String(countdown.days).padStart(2, '0')}</strong>
                    <span>Gün</span>
                  </div>
                  <div className="capsule-unit">
                    <strong>{String(countdown.hours).padStart(2, '0')}</strong>
                    <span>Saat</span>
                  </div>
                  <div className="capsule-unit">
                    <strong>{String(countdown.minutes).padStart(2, '0')}</strong>
                    <span>Dk</span>
                  </div>
                  <div className="capsule-unit">
                    <strong>{String(countdown.seconds).padStart(2, '0')}</strong>
                    <span>Sn</span>
                  </div>
                </div>

                {card.unlockNote && <p className="capsule-note">“{card.unlockNote}”</p>}

                {isPreview && (
                  <button
                    type="button"
                    className="pill-btn ghost small"
                    onClick={() => setBypassLock(true)}
                  >
                    <Unlock size={13} />
                    <span>Önizleme: Kilidi Geçip Aç</span>
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="extracted-showcase">
            <div className="extracted-card-wrap">
              <FlippablePostcard card={card} isFlipped={isFlipped} onFlip={handleFlip} />
            </div>

            <MediaPlayerDock
              spotifyUrl={card.spotifyUrl}
              voiceNote={card.voiceNote}
              senderName={senderDisplay}
            />

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
