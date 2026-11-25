import React, { useEffect, useRef, useState } from 'react';
import { Mic, Pause, Play, Square, Trash2 } from 'lucide-react';

interface VoiceRecorderProps {
  value: string | null;
  onChange: (audioDataUri: string | null) => void;
}

const MAX_SECONDS = 15;

function pickSupportedMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined') return undefined;
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
  ];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type));
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ value, onChange }) => {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      audioRef.current?.pause();
    };
  }, []);

  const stopRecording = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
    setRecording(false);
  };

  const startRecording = async () => {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('Bu tarayıcı ses kaydını desteklemiyor.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const mimeType = pickSupportedMimeType();
      const recorder = new MediaRecorder(stream, {
        ...(mimeType ? { mimeType } : {}),
        audioBitsPerSecond: 28000,
      });
      recorderRef.current = recorder;

      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) chunksRef.current.push(ev.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || mimeType || 'audio/webm',
        });
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            onChange(reader.result);
          }
        };
        reader.readAsDataURL(blob);
      };

      recorder.start();
      setRecording(true);
      setSeconds(0);

      let elapsed = 0;
      timerRef.current = window.setInterval(() => {
        elapsed += 1;
        setSeconds(elapsed);
        if (elapsed >= MAX_SECONDS) {
          stopRecording();
        }
      }, 1000);
    } catch {
      setError('Mikrofon izni verilmedi. Tarayıcı ayarından mikrofona izin verip tekrar dene.');
    }
  };

  const togglePlayPreview = () => {
    if (!value) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(value);
      audioRef.current.onended = () => setPlaying(false);
    }
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.src = value;
      audioRef.current.play().catch(() => setPlaying(false));
      setPlaying(true);
    }
  };

  const handleDelete = () => {
    audioRef.current?.pause();
    setPlaying(false);
    onChange(null);
  };

  return (
    <div className="voice-recorder-box">
      {!value && !recording && (
        <button type="button" className="pill-btn ghost small full" onClick={startRecording}>
          <Mic size={14} />
          <span>15 sn Sesli Not Kaydet</span>
        </button>
      )}

      {recording && (
        <div className="voice-recording-bar">
          <span className="rec-dot" />
          <span className="rec-timer">
            Kaydediliyor • 0:{String(seconds).padStart(2, '0')} / 0:{MAX_SECONDS}
          </span>
          <button type="button" className="pill-btn primary small" onClick={stopRecording}>
            <Square size={12} />
            <span>Bitir</span>
          </button>
        </div>
      )}

      {value && !recording && (
        <div className="voice-saved-bar">
          <button type="button" className="icon-pill-btn" onClick={togglePlayPreview}>
            {playing ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <div className="voice-saved-meta">
            <strong>Sesli not hazır</strong>
            <span>Alıcı zarfı açınca plak oynatıcıda dinleyebilir</span>
          </div>
          <button
            type="button"
            className="icon-pill-btn danger"
            onClick={handleDelete}
            title="Sesli notu sil"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}

      {error && <p className="field-warn">{error}</p>}
    </div>
  );
};
