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
  stampPreset: StampPresetId;
  customStamp: string | null;
  stampMonochrome: boolean;
  postmarkCity: string;
  postmarkDate: string;

  // Experience
  soundEnabled: boolean;
  ambientMusic: boolean;
}

export interface TemplatePreset {
  id: ThemeId;
  name: string;
  subtitle: string;
  swatch: [string, string, string];
  data: PostcardData;
}
