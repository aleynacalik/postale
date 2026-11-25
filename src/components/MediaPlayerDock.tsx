import React, { useEffect, useRef, useState } from 'react';
import { Disc3, Pause, Play } from 'lucide-react';
import { parseSpotifyUrl } from '../utils/media';

interface MediaPlayerDockProps {
  spotifyUrl: string;
  voiceNote: string | null;
  senderName?: string;
}

function formatSec(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export const MediaPlayerDock: React.FC<MediaPlayerDockProps> = ({
  spotifyUrl,
  voiceNote,
  senderName,
}) => {
  const parsedSpotify = parseSpotifyUrl(spotifyUrl);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  if (!parsedSpotify && !voiceNote) return null;

  const toggleVoice = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  };

  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div className="media-player-dock">
      {voiceNote && (
        <div className="vinyl-voice-card">
          <audio
            ref={audioRef}
            src={voiceNote}
            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
            onEnded={() => {
              setPlaying(false);
              setCurrentTime(0);
            }}
          />

          <div className={`vinyl-disc ${playing ? 'is-spinning' : ''}`} aria-hidden="true">
            <Disc3 size={22} />
          </div>

          <div className="vinyl-info">
            <div className="vinyl-title-row">
              <strong>{senderName ? `${senderName} — Sesli Not` : 'Gönderenin Sesli Notu'}</strong>
              <span className="vinyl-time">
                {formatSec(currentTime)}
                {duration > 0 ? ` / ${formatSec(duration)}` : ''}
              </span>
            </div>
            <div className="vinyl-progress-track">
              <div className="vinyl-progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <button
            type="button"
            className="vinyl-play-btn"
            onClick={toggleVoice}
            aria-label={playing ? 'Duraklat' : 'Sesli notu dinle'}
          >
            {playing ? <Pause size={16} /> : <Play size={16} />}
          </button>
        </div>
      )}

      {parsedSpotify && (
        <div className="spotify-dock-card">
          <iframe
            title="Mektubun Şarkısı"
            src={parsedSpotify.embedUrl}
            width="100%"
            height="80"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="spotify-embed-frame"
          />
        </div>
      )}
    </div>
  );
};
