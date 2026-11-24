// Pure Web Audio API tactile paper foley & soft ambient music box

let audioCtx: AudioContext | null = null;
let ambientTimer: number | null = null;
let ambientRunning = false;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function playPaperRustle() {
  const ctx = getCtx();
  if (!ctx) return;

  const duration = 0.55;
  const sampleRate = ctx.sampleRate;
  const bufferSize = Math.floor(sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
  const data = buffer.getChannelData(0);

  // Soft pink-ish noise
  let b0 = 0;
  let b1 = 0;
  let b2 = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.997 * b0 + white * 0.029;
    b1 = 0.985 * b1 + white * 0.032;
    b2 = 0.95 * b2 + white * 0.048;
    const env = Math.sin((i / bufferSize) * Math.PI) * Math.pow(1 - i / bufferSize, 0.5);
    data[i] = (b0 + b1 + b2 + white * 0.08) * env * 0.55;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1200, ctx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(2400, ctx.currentTime + 0.25);
  filter.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + duration);
  filter.Q.value = 1.2;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.01, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.28, ctx.currentTime + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start();
}

export function playSealPop() {
  const ctx = getCtx();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(240, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(95, ctx.currentTime + 0.09);

  gain.gain.setValueAtTime(0.16, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.11);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.12);
}

export function playCardFlip() {
  const ctx = getCtx();
  if (!ctx) return;

  const duration = 0.22;
  const sampleRate = ctx.sampleRate;
  const bufferSize = Math.floor(sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    const t = i / bufferSize;
    const env = Math.sin(t * Math.PI) * (1 - t * 0.6);
    data[i] = (Math.random() * 2 - 1) * env * 0.22;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 1600;

  const gain = ctx.createGain();
  gain.gain.value = 0.25;

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start();
}

const CHIME_NOTES = [523.25, 659.25, 783.99, 987.77, 783.99, 659.25, 587.33, 493.88];

export function startAmbientChime() {
  if (ambientRunning) return;
  const ctx = getCtx();
  if (!ctx) return;
  ambientRunning = true;

  let step = 0;
  const playNote = () => {
    if (!ambientRunning) return;
    const c = getCtx();
    if (!c) return;
    const freq = CHIME_NOTES[step % CHIME_NOTES.length];
    step += 1;

    const osc = c.createOscillator();
    const osc2 = c.createOscillator();
    const gain = c.createGain();

    osc.type = 'sine';
    osc2.type = 'triangle';
    osc.frequency.value = freq;
    osc2.frequency.value = freq * 2;

    const now = c.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.035, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(c.destination);

    osc.start(now);
    osc2.start(now);
    osc.stop(now + 2.5);
    osc2.stop(now + 2.5);

    ambientTimer = window.setTimeout(playNote, 1350);
  };

  playNote();
}

export function stopAmbientChime() {
  ambientRunning = false;
  if (ambientTimer !== null) {
    window.clearTimeout(ambientTimer);
    ambientTimer = null;
  }
}
