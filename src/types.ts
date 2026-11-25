export type ThemeId =
  | 'blush-vintage'
  | 'ice-mint'
  | 'istanbul-cream'
  | 'terracotta-sun'
  | 'midnight-velvet';

export type CardStyle =
  | 'vintage-oval'
  | 'editorial-showcase'
  | 'arch-frame'
  | 'classic-border';

export type ClosureType = 'wax-seal' | 'bread-clip' | 'stamp-tab' | 'minimal';

export type HandwritingFont = 'caveat' | 'reenie' | 'homemade' | 'cormorant';

export type PhotoFilter = 'vintage' | 'bw' | 'fade' | 'original';

export type DoodleId = 'stars' | 'squiggle' | 'hearts' | 'sparkles';

export type PhotoPresetId =
  | 'california-palms'
  | 'bosphorus-sunset'
  | 'mediterranean-arch'
  | 'botanical-dream'
  | 'midnight-stars';

export type StampPresetId =
  | 'vintage-portrait'
  | 'silver-cake'
  | 'crescent-moon'
  | 'ottoman-tulip'
  | 'coastal-ferry';

export type StickerKind =
  | 'washi-pink'
  | 'washi-mint'
  | 'washi-grid'
  | 'washi-gold'
  | 'sticker-star'
  | 'sticker-heart'
  | 'sticker-bow'
  | 'sticker-daisy'
  | 'sticker-airmail'
  | 'sticker-sparkle'
  | 'sticker-kiss'
  | 'sticker-sun';

export interface PlacedSticker {
  id: string;
  kind: StickerKind;
  side: 'front' | 'back';
  x: number; // 0..100 percentage of card width
  y: number; // 0..100 percentage of card height
  rotation: number; // degrees
  scale: number; // 0.6..1.8
}

export interface PostcardData {
  theme: ThemeId;
  cardStyle: CardStyle;
  backdropDark: boolean;

  // Envelope
  envelopeColor: string;
  envelopeInnerColor: string;
  envelopeTextColor: string;
  envelopeTag: string;
  envelopeSubtag: string;
  envelopeMotto: string;
  closure: ClosureType;
  waxSealColor: string;
  waxSealInitial: string;
  paperGrain: number;

  // Postcard Front
  cardFrameColor: string;
  cardPaperColor: string;
  cardInkColor: string;
  titleText: string;
  titleColor: string;
  titleOutline: boolean;
  topSubtitle: string;
  dateLine: string;
  bottomLeftText: string;
  bottomRightText: string;
  repeatBorderText: string;
  photoPreset: PhotoPresetId;
  customPhoto: string | null;
  photoFilter: PhotoFilter;
  photoZoom: number;
  photoOffsetY: number;
  doodles: DoodleId[];

  // Postcard Back
  backHeader: string;
  backSubheader: string;
  message: string;
  handwritingFont: HandwritingFont;
  recipientName: string;
  recipientAddress1: string;
  recipientAddress2: string;
  senderSignoff: string;
  signatureSvg: string | null;
  stampPreset: StampPresetId;
  customStamp: string | null;
  stampMonochrome: boolean;
  postmarkCity: string;
  postmarkDate: string;

  // Draggable Washi Tapes & Stickers
  placedStickers: PlacedSticker[];

  // Music, Voice Note & Time Capsule
  spotifyUrl: string;
  voiceNote: string | null; // Base64 audio data URI (<= 15s)
  unlockAt: string | null; // ISO datetime string for Time Capsule lock
  unlockNote: string;

  // Experience
  soundEnabled: boolean;
  ambientMusic: boolean;

  // Optional reply-to email stored when sender enables replies
  replyToEmail?: string | null;
}

export interface TemplatePreset {
  id: ThemeId;
  name: string;
  subtitle: string;
  swatch: [string, string, string];
  data: PostcardData;
}
