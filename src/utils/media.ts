export interface ParsedSpotify {
  type: 'track' | 'album' | 'playlist' | 'episode';
  id: string;
  embedUrl: string;
}

export function parseSpotifyUrl(raw: string): ParsedSpotify | null {
  const input = raw.trim();
  if (!input) return null;

  // Matches https://open.spotify.com/track/ID, https://open.spotify.com/intl-tr/track/ID, or spotify:track:ID
  const uriMatch = input.match(/^spotify:(track|album|playlist|episode):([a-zA-Z0-9]{10,32})$/i);
  if (uriMatch) {
    const type = uriMatch[1].toLowerCase() as ParsedSpotify['type'];
    const id = uriMatch[2];
    return {
      type,
      id,
      embedUrl: `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`,
    };
  }

  const urlMatch = input.match(
    /open\.spotify\.com\/(?:intl-[a-z]{2}\/)?(track|album|playlist|episode)\/([a-zA-Z0-9]{10,32})/i
  );
  if (urlMatch) {
    const type = urlMatch[1].toLowerCase() as ParsedSpotify['type'];
    const id = urlMatch[2];
    return {
      type,
      id,
      embedUrl: `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`,
    };
  }

  return null;
}

export function formatUnlockDateTr(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function getCountdownParts(targetIso: string, nowMs: number) {
  const targetMs = new Date(targetIso).getTime();
  const diff = Math.max(0, targetMs - nowMs);
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { diff, days, hours, minutes, seconds };
}

export function toLocalDateTimeInputValue(isoString: string | null): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}
