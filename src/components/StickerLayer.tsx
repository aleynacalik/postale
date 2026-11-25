import React, { useRef } from 'react';
import { PlacedSticker, StickerKind } from '../types';

export interface StickerCatalogItem {
  kind: StickerKind;
  label: string;
  category: 'washi' | 'sticker';
  defaultRotation: number;
}

export const STICKER_CATALOG: StickerCatalogItem[] = [
  { kind: 'washi-pink', label: 'Pudra Bant', category: 'washi', defaultRotation: -16 },
  { kind: 'washi-mint', label: 'Buz Yeşili Bant', category: 'washi', defaultRotation: 14 },
  { kind: 'washi-grid', label: 'Kareli Bant', category: 'washi', defaultRotation: -10 },
  { kind: 'washi-gold', label: 'Altın Yaldız Bant', category: 'washi', defaultRotation: 18 },
  { kind: 'sticker-star', label: 'Yıldız', category: 'sticker', defaultRotation: -8 },
  { kind: 'sticker-heart', label: 'Kalp', category: 'sticker', defaultRotation: 10 },
  { kind: 'sticker-bow', label: 'Fiyonk', category: 'sticker', defaultRotation: -6 },
  { kind: 'sticker-daisy', label: 'Papatya', category: 'sticker', defaultRotation: 6 },
  { kind: 'sticker-airmail', label: 'Air Mail', category: 'sticker', defaultRotation: -11 },
  { kind: 'sticker-sparkle', label: 'Parıltı', category: 'sticker', defaultRotation: 0 },
  { kind: 'sticker-kiss', label: 'Ruj İzi', category: 'sticker', defaultRotation: 12 },
  { kind: 'sticker-sun', label: 'Güneş', category: 'sticker', defaultRotation: -5 },
];

export function isWashiKind(kind: StickerKind): boolean {
  return kind.startsWith('washi-');
}

export const StickerGraphic: React.FC<{ kind: StickerKind }> = ({ kind }) => {
  switch (kind) {
    case 'washi-pink':
      return (
        <svg viewBox="0 0 140 38" className="sticker-svg">
          <path
            d="M4 3 L136 2 L133 9 L137 16 L134 24 L138 35 L3 36 L6 27 L2 19 L5 11 Z"
            fill="#E9A8B8"
            fillOpacity="0.74"
          />
          <g stroke="#FFFFFF" strokeWidth="2.5" opacity="0.45">
            <line x1="18" y1="3" x2="8" y2="36" />
            <line x1="38" y1="3" x2="28" y2="36" />
            <line x1="58" y1="3" x2="48" y2="36" />
            <line x1="78" y1="3" x2="68" y2="36" />
            <line x1="98" y1="3" x2="88" y2="36" />
            <line x1="118" y1="3" x2="108" y2="36" />
          </g>
        </svg>
      );

    case 'washi-mint':
      return (
        <svg viewBox="0 0 140 38" className="sticker-svg">
          <path
            d="M3 4 L137 3 L134 11 L138 20 L133 29 L136 35 L4 36 L1 27 L6 18 L2 10 Z"
            fill="#A6CBCB"
            fillOpacity="0.76"
          />
          <g fill="#FFFFFF" opacity="0.55">
            <circle cx="22" cy="14" r="2.2" />
            <circle cx="44" cy="24" r="2.2" />
            <circle cx="68" cy="13" r="2.2" />
            <circle cx="92" cy="25" r="2.2" />
            <circle cx="116" cy="15" r="2.2" />
          </g>
        </svg>
      );

    case 'washi-grid':
      return (
        <svg viewBox="0 0 140 38" className="sticker-svg">
          <path
            d="M4 3 L136 4 L133 13 L137 22 L134 34 L3 35 L6 25 L2 14 Z"
            fill="#F3E8D2"
            fillOpacity="0.82"
          />
          <g stroke="#9D8C75" strokeWidth="1" opacity="0.42">
            <line x1="4" y1="13" x2="136" y2="13" />
            <line x1="4" y1="24" x2="136" y2="24" />
            <line x1="22" y1="3" x2="22" y2="35" />
            <line x1="44" y1="3" x2="44" y2="35" />
            <line x1="66" y1="3" x2="66" y2="35" />
            <line x1="88" y1="3" x2="88" y2="35" />
            <line x1="110" y1="3" x2="110" y2="35" />
          </g>
        </svg>
      );

    case 'washi-gold':
      return (
        <svg viewBox="0 0 140 38" className="sticker-svg">
          <defs>
            <linearGradient id="washiGoldGrad" x1="0" y1="0" x2="1" y2="0.4">
              <stop offset="0%" stopColor="#DFC27D" stopOpacity="0.82" />
              <stop offset="50%" stopColor="#F4E2B0" stopOpacity="0.86" />
              <stop offset="100%" stopColor="#C8A55B" stopOpacity="0.82" />
            </linearGradient>
          </defs>
          <path
            d="M5 4 L135 2 L138 14 L133 24 L137 35 L3 36 L6 23 L2 12 Z"
            fill="url(#washiGoldGrad)"
          />
          <g fill="#FFFFFF" opacity="0.65">
            <polygon points="32,12 34,17 39,19 34,21 32,26 30,21 25,19 30,17" />
            <polygon points="74,10 76,15 81,17 76,19 74,24 72,19 67,17 72,15" />
            <polygon points="112,13 114,18 119,20 114,22 112,27 110,22 105,20 110,18" />
          </g>
        </svg>
      );

    case 'sticker-star':
      return (
        <svg viewBox="0 0 80 80" className="sticker-svg">
          <path
            d="M40 7 L46 29 L69 20 L54 40 L74 52 L50 53 L56 75 L40 58 L22 73 L29 51 L8 44 L29 36 L19 15 L37 30 Z"
            fill="#F8E18B"
            stroke="#261D1E"
            strokeWidth="2.6"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'sticker-heart':
      return (
        <svg viewBox="0 0 80 80" className="sticker-svg">
          <path
            d="M40 67 C16 51 11 33 20 21 C27 12 36 16 40 25 C44 16 53 12 60 21 C69 33 64 51 40 67 Z"
            fill="#D85B6F"
            stroke="#261D1E"
            strokeWidth="2.4"
            strokeLinejoin="round"
          />
          <path
            d="M25 27 Q29 22 33 25"
            stroke="#FFFFFF"
            strokeWidth="2.4"
            strokeLinecap="round"
            fill="none"
            opacity="0.7"
          />
        </svg>
      );

    case 'sticker-bow':
      return (
        <svg viewBox="0 0 92 72" className="sticker-svg">
          <path
            d="M46 34 C32 14 10 14 12 30 C14 42 32 42 46 34 Z"
            fill="#F2BAC9"
            stroke="#2D2024"
            strokeWidth="2.2"
          />
          <path
            d="M46 34 C60 14 82 14 80 30 C78 42 60 42 46 34 Z"
            fill="#F2BAC9"
            stroke="#2D2024"
            strokeWidth="2.2"
          />
          <path
            d="M42 38 L24 64 L34 60 L45 40 Z"
            fill="#E7A4B6"
            stroke="#2D2024"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M50 38 L68 64 L58 60 L47 40 Z"
            fill="#E7A4B6"
            stroke="#2D2024"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <circle cx="46" cy="34" r="6" fill="#E397AC" stroke="#2D2024" strokeWidth="2.2" />
        </svg>
      );

    case 'sticker-daisy':
      return (
        <svg viewBox="0 0 80 80" className="sticker-svg">
          <g fill="#FFFDF8" stroke="#2A2220" strokeWidth="1.9">
            <ellipse cx="40" cy="18" rx="8" ry="14" />
            <ellipse cx="40" cy="62" rx="8" ry="14" />
            <ellipse cx="18" cy="40" rx="14" ry="8" />
            <ellipse cx="62" cy="40" rx="14" ry="8" />
            <ellipse cx="24" cy="24" rx="8" ry="13" transform="rotate(-45 24 24)" />
            <ellipse cx="56" cy="56" rx="8" ry="13" transform="rotate(-45 56 56)" />
            <ellipse cx="56" cy="24" rx="8" ry="13" transform="rotate(45 56 24)" />
            <ellipse cx="24" cy="56" rx="8" ry="13" transform="rotate(45 24 56)" />
          </g>
          <circle cx="40" cy="40" r="11" fill="#F2C95D" stroke="#2A2220" strokeWidth="2" />
        </svg>
      );

    case 'sticker-airmail':
      return (
        <svg viewBox="0 0 110 46" className="sticker-svg">
          <rect x="2" y="2" width="106" height="42" rx="4" fill="#2A5885" />
          <rect x="6" y="6" width="98" height="34" rx="2" fill="none" stroke="#F8F4EC" strokeWidth="1.5" strokeDasharray="4 2" />
          <text
            x="55"
            y="22"
            textAnchor="middle"
            fill="#F8F4EC"
            fontSize="11"
            fontWeight="700"
            letterSpacing="2"
            fontFamily="sans-serif"
          >
            PAR AVION
          </text>
          <text
            x="55"
            y="34"
            textAnchor="middle"
            fill="#F4C7C3"
            fontSize="7.5"
            fontWeight="600"
            letterSpacing="1.6"
            fontFamily="sans-serif"
          >
            AIR MAIL ✈
          </text>
        </svg>
      );

    case 'sticker-sparkle':
      return (
        <svg viewBox="0 0 80 80" className="sticker-svg">
          <path
            d="M36 8 Q39 36 66 39 Q39 42 36 70 Q33 42 6 39 Q33 36 36 8 Z"
            fill="#F7E5B7"
            stroke="#241D1C"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <path
            d="M62 12 Q64 20 72 22 Q64 24 62 32 Q60 24 52 22 Q60 20 62 12 Z"
            fill="#241D1C"
          />
        </svg>
      );

    case 'sticker-kiss':
      return (
        <svg viewBox="0 0 92 60" className="sticker-svg">
          <path
            d="M10 31 C22 14 36 16 46 24 C56 16 70 14 82 31 C68 27 56 30 46 31 C36 30 24 27 10 31 Z"
            fill="#C73E56"
          />
          <path
            d="M14 34 C28 50 64 50 78 34 C64 38 54 35 46 35 C38 35 28 38 14 34 Z"
            fill="#B53249"
          />
        </svg>
      );

    case 'sticker-sun':
    default:
      return (
        <svg viewBox="0 0 80 80" className="sticker-svg">
          <g stroke="#D98A3C" strokeWidth="3" strokeLinecap="round">
            <line x1="40" y1="6" x2="40" y2="16" />
            <line x1="40" y1="64" x2="40" y2="74" />
            <line x1="6" y1="40" x2="16" y2="40" />
            <line x1="64" y1="40" x2="74" y2="40" />
            <line x1="16" y1="16" x2="23" y2="23" />
            <line x1="57" y1="57" x2="64" y2="64" />
            <line x1="64" y1="16" x2="57" y2="23" />
            <line x1="23" y1="57" x2="16" y2="64" />
          </g>
          <circle cx="40" cy="40" r="17" fill="#F5C96B" stroke="#2D201A" strokeWidth="2.2" />
          <circle cx="34" cy="37" r="1.8" fill="#2D201A" />
          <circle cx="46" cy="37" r="1.8" fill="#2D201A" />
          <path d="M34 45 Q40 50 46 45" stroke="#2D201A" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      );
  }
};

interface StickerLayerProps {
  stickers: PlacedSticker[];
  side: 'front' | 'back';
  editable?: boolean;
  selectedStickerId?: string | null;
  onSelectSticker?: (id: string | null) => void;
  onMoveSticker?: (id: string, x: number, y: number) => void;
}

export const StickerLayer: React.FC<StickerLayerProps> = ({
  stickers,
  side,
  editable = false,
  selectedStickerId = null,
  onSelectSticker,
  onMoveSticker,
}) => {
  const layerRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ id: string; moved: boolean } | null>(null);

  const sideStickers = stickers.filter((s) => s.side === side);
  if (!sideStickers.length) return null;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, id: string) => {
    if (!editable) return;
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { id, moved: false };
    onSelectSticker?.(id);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>, id: string) => {
    if (!editable || !dragRef.current || dragRef.current.id !== id) return;
    if (!layerRef.current) return;
    e.stopPropagation();
    const rect = layerRef.current.getBoundingClientRect();
    const x = Math.min(96, Math.max(4, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(94, Math.max(6, ((e.clientY - rect.top) / rect.height) * 100));
    dragRef.current.moved = true;
    onMoveSticker?.(id, Math.round(x * 10) / 10, Math.round(y * 10) / 10);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!editable) return;
    e.stopPropagation();
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    dragRef.current = null;
  };

  return (
    <div ref={layerRef} className={`placed-sticker-layer ${editable ? 'is-editable' : ''}`}>
      {sideStickers.map((sticker) => {
        const isWashi = isWashiKind(sticker.kind);
        const isSelected = editable && selectedStickerId === sticker.id;
        return (
          <div
            key={sticker.id}
            className={`placed-sticker-item ${isWashi ? 'is-washi' : 'is-badge'} ${
              isSelected ? 'is-selected' : ''
            }`}
            style={{
              left: `${sticker.x}%`,
              top: `${sticker.y}%`,
              transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg) scale(${sticker.scale})`,
            }}
            onClick={(e) => {
              if (editable) e.stopPropagation();
            }}
            onPointerDown={(e) => handlePointerDown(e, sticker.id)}
            onPointerMove={(e) => handlePointerMove(e, sticker.id)}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <StickerGraphic kind={sticker.kind} />
          </div>
        );
      })}
    </div>
  );
};
