import React from 'react';
import { PostcardData } from '../types';
import { DoodleOverlay, PhotoArtwork } from './Artwork';
import { PostageStamp } from './PostageStamp';
import { StickerLayer } from './StickerLayer';

interface PostcardFaceProps {
  card: PostcardData;
  showClippedStamp?: boolean;
  editableStickers?: boolean;
  selectedStickerId?: string | null;
  onSelectSticker?: (id: string | null) => void;
  onMoveSticker?: (id: string, x: number, y: number) => void;
}

const FONT_CLASS_MAP: Record<PostcardData['handwritingFont'], string> = {
  caveat: 'hw-caveat',
  reenie: 'hw-reenie',
  homemade: 'hw-homemade',
  cormorant: 'hw-cormorant',
};

export const PostcardFront: React.FC<PostcardFaceProps> = ({
  card,
  showClippedStamp = true,
  editableStickers = false,
  selectedStickerId = null,
  onSelectSticker,
  onMoveSticker,
}) => {
  const filterClass = `photo-filter-${card.photoFilter}`;
  const imgStyle: React.CSSProperties = {
    transform: `scale(${card.photoZoom})`,
    objectPosition: `50% ${card.photoOffsetY}%`,
  };

  if (card.cardStyle === 'editorial-showcase') {
    const motif = (card.repeatBorderText || 'postale').trim();
    const repeatItems = Array.from({ length: 6 }, () => motif);
    const titleLines = (card.titleText || 'Coming\nsoon').split('\n');

    return (
      <div
        className="postcard-surface postcard-editorial"
        style={{
          backgroundColor: card.cardPaperColor,
          color: card.cardInkColor,
        }}
      >
        <div
          className="paper-grain-overlay"
          style={{ opacity: card.paperGrain * 0.45 }}
        />

        {/* Repeating script top border (Reference 1) */}
        <div className="editorial-repeat-bar">
          {repeatItems.map((word, idx) => (
            <React.Fragment key={idx}>
              <span>{word}</span>
              {idx < repeatItems.length - 1 && <em className="repeat-star">★</em>}
            </React.Fragment>
          ))}
        </div>

        <div className="editorial-body">
          <p className="editorial-eyebrow">{card.topSubtitle}</p>
          <p className="editorial-date">{card.dateLine}</p>

          <h2 className="editorial-headline" style={{ color: card.titleColor }}>
            {titleLines.map((line, i) => (
              <span key={i} className={`editorial-line editorial-line-${i}`}>
                {line}
              </span>
            ))}
          </h2>
        </div>

        {/* Repeating script bottom border */}
        <div className="editorial-repeat-bar editorial-repeat-bottom">
          {repeatItems.map((word, idx) => (
            <React.Fragment key={idx}>
              <span>{word}</span>
              {idx < repeatItems.length - 1 && <em className="repeat-star">★</em>}
            </React.Fragment>
          ))}
        </div>

        {/* Clipped stamp on the right edge (Reference 1!) */}
        {showClippedStamp && (
          <div className="editorial-clipped-stamp">
            <PostageStamp
              preset={card.stampPreset}
              customStamp={card.customStamp}
              monochrome={card.stampMonochrome}
              withBreadClip={card.closure === 'bread-clip' || card.closure === 'stamp-tab'}
              size="md"
            />
          </div>
        )}

        <DoodleOverlay doodles={card.doodles} color={card.cardInkColor} />
        <StickerLayer
          stickers={card.placedStickers || []}
          side="front"
          editable={editableStickers}
          selectedStickerId={selectedStickerId}
          onSelectSticker={onSelectSticker}
          onMoveSticker={onMoveSticker}
        />
      </div>
    );
  }

  return (
    <div
      className={`postcard-surface postcard-framed postcard-layout-${card.cardStyle}`}
      style={{
        backgroundColor: card.cardPaperColor,
        color: card.cardInkColor,
      }}
    >
      <div
        className="postcard-inner-frame"
        style={{ backgroundColor: card.cardFrameColor }}
      >
        {/* Top micro subtitle */}
        <div className="front-top-subtitle">{card.topSubtitle}</div>

        {/* Photo window (Oval, Arch, or Classic) */}
        <div className={`front-photo-window window-${card.cardStyle}`}>
          <div className={`front-photo-media ${filterClass}`}>
            {card.customPhoto ? (
              <img src={card.customPhoto} alt={card.titleText} style={imgStyle} />
            ) : (
              <PhotoArtwork preset={card.photoPreset} />
            )}
          </div>
          <div className="photo-vintage-sheen" />
        </div>

        {/* Overlapping calligraphic title (Reference 2!) */}
        <div
          className={`front-script-title ${card.titleOutline ? 'has-outline' : ''}`}
          style={{ color: card.titleColor }}
        >
          {card.titleText}
        </div>

        {/* Bottom hairline with year & studio credit */}
        <div className="front-bottom-meta">
          <span>{card.bottomLeftText}</span>
          <span className="front-bottom-rule" />
          <span className="front-bottom-right">{card.bottomRightText}</span>
        </div>
      </div>

      <div
        className="paper-grain-overlay"
        style={{ opacity: card.paperGrain * 0.55 }}
      />
      <DoodleOverlay doodles={card.doodles} color={card.cardInkColor} />
      <StickerLayer
        stickers={card.placedStickers || []}
        side="front"
        editable={editableStickers}
        selectedStickerId={selectedStickerId}
        onSelectSticker={onSelectSticker}
        onMoveSticker={onMoveSticker}
      />
    </div>
  );
};

export const PostcardBack: React.FC<PostcardFaceProps> = ({
  card,
  editableStickers = false,
  selectedStickerId = null,
  onSelectSticker,
  onMoveSticker,
}) => {
  const hwClass = FONT_CLASS_MAP[card.handwritingFont] || 'hw-caveat';

  return (
    <div
      className="postcard-surface postcard-back"
      style={{
        backgroundColor: card.cardFrameColor,
        color: card.cardInkColor,
      }}
    >
      <div
        className="postcard-back-sheet"
        style={{ backgroundColor: card.cardPaperColor }}
      >
        <div className="back-header-block">
          <h3 className="back-title">{card.backHeader || 'POSTCARD'}</h3>
          <p className="back-subtitle">{card.backSubheader || 'The Digital Mail'}</p>
        </div>

        <div className="back-stamp-slot">
          <PostageStamp
            preset={card.stampPreset}
            customStamp={card.customStamp}
            monochrome={card.stampMonochrome}
            withPostmark
            postmarkCity={card.postmarkCity}
            postmarkDate={card.postmarkDate}
            size="md"
          />
        </div>

        <div className="back-columns">
          {/* Left column: handwritten letter */}
          <div className={`back-message-col ${hwClass}`}>
            <p className="back-message-text">{card.message}</p>
          </div>

          <div className="back-vertical-divider" />

          {/* Right column: address lines + signoff / drawn signature */}
          <div className="back-address-col">
            <div className="address-lines">
              <div className={`address-line ${hwClass}`}>{card.recipientName}</div>
              <div className={`address-line ${hwClass}`}>{card.recipientAddress1}</div>
              <div className={`address-line ${hwClass}`}>{card.recipientAddress2}</div>
              <div className="address-line" />
            </div>

            <div className="back-signoff-area">
              {card.signatureSvg ? (
                <svg
                  viewBox="0 0 300 110"
                  className="drawn-signature-svg"
                  aria-label="Gönderenin imzası"
                >
                  <path
                    d={card.signatureSvg}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <div className={`back-signoff ${hwClass}`}>{card.senderSignoff}</div>
              )}
            </div>
          </div>
        </div>

        <div className="back-footer-credit">DESIGNED WITH POSTALE STUDIO</div>
      </div>

      <div
        className="paper-grain-overlay"
        style={{ opacity: card.paperGrain * 0.52 }}
      />
      <StickerLayer
        stickers={card.placedStickers || []}
        side="back"
        editable={editableStickers}
        selectedStickerId={selectedStickerId}
        onSelectSticker={onSelectSticker}
        onMoveSticker={onMoveSticker}
      />
    </div>
  );
};

export const FlippablePostcard: React.FC<{
  card: PostcardData;
  isFlipped: boolean;
  onFlip: () => void;
  showClippedStamp?: boolean;
  editableStickers?: boolean;
  selectedStickerId?: string | null;
  onSelectSticker?: (id: string | null) => void;
  onMoveSticker?: (id: string, x: number, y: number) => void;
}> = ({
  card,
  isFlipped,
  onFlip,
  showClippedStamp = true,
  editableStickers = false,
  selectedStickerId = null,
  onSelectSticker,
  onMoveSticker,
}) => {
  return (
    <div
      className={`flip-card-scene ${isFlipped ? 'is-flipped' : ''}`}
      onClick={() => {
        if (editableStickers && selectedStickerId) {
          onSelectSticker?.(null);
          return;
        }
        onFlip();
      }}
      role="button"
      tabIndex={0}
      aria-label={isFlipped ? 'Kartpostalın ön yüzünü çevir' : 'Kartpostalın arka yüzünü çevir'}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onFlip();
        }
      }}
    >
      <div className="flip-card-inner">
        <div className="flip-card-face flip-card-front" aria-hidden={isFlipped}>
          <PostcardFront
            card={card}
            showClippedStamp={showClippedStamp}
            editableStickers={editableStickers}
            selectedStickerId={selectedStickerId}
            onSelectSticker={onSelectSticker}
            onMoveSticker={onMoveSticker}
          />
        </div>
        <div className="flip-card-face flip-card-back" aria-hidden={!isFlipped}>
          <PostcardBack
            card={card}
            editableStickers={editableStickers}
            selectedStickerId={selectedStickerId}
            onSelectSticker={onSelectSticker}
            onMoveSticker={onMoveSticker}
          />
        </div>
      </div>
    </div>
  );
};
