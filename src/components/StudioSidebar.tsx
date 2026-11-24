import React, { useRef, useState } from 'react';
import {
  ImagePlus,
  Mail,
  PenTool,
  Sparkles,
  Stamp,
  Trash2,
  Volume2,
} from 'lucide-react';
import {
  ENVELOPE_SWATCHES,
  PHOTO_PRESETS,
  STAMP_PRESETS,
  TEMPLATE_PRESETS,
} from '../data/presets';
import {
  CardStyle,
  ClosureType,
  DoodleId,
  HandwritingFont,
  PhotoFilter,
  PostcardData,
  TemplatePreset,
} from '../types';
import { playPaperRustle } from '../utils/audio';
import { compressImageFile } from '../utils/image';

type EditorTab = 'envelope' | 'front' | 'back' | 'atmosphere';

interface StudioSidebarProps {
  card: PostcardData;
  onChange: (patch: Partial<PostcardData>) => void;
  onApplyPreset: (preset: TemplatePreset) => void;
  onSwitchStageView: (view: 'envelope' | 'front' | 'back') => void;
}

const DOODLE_OPTIONS: { id: DoodleId; label: string }[] = [
  { id: 'stars', label: 'El Çizimi Yıldız' },
  { id: 'squiggle', label: 'Karalama' },
  { id: 'hearts', label: 'Kalp' },
  { id: 'sparkles', label: 'Parıltı' },
];

const HANDWRITING_OPTIONS: { id: HandwritingFont; label: string; sample: string }[] = [
  { id: 'caveat', label: 'Caveat', sample: 'Sevgilerle...' },
  { id: 'reenie', label: 'Reenie', sample: 'Not bıraktım' },
  { id: 'homemade', label: 'El Yazısı', sample: 'Özledim seni' },
  { id: 'cormorant', label: 'Editoryal İtalik', sample: 'Özel Davet' },
];

const CARD_STYLE_OPTIONS: { id: CardStyle; label: string }[] = [
  { id: 'vintage-oval', label: 'Vintage Oval' },
  { id: 'editorial-showcase', label: 'Editoryal Davet' },
  { id: 'arch-frame', label: 'Kemer Çerçeve' },
  { id: 'classic-border', label: 'Klasik Tam Kart' },
];

const CLOSURE_OPTIONS: { id: ClosureType; label: string }[] = [
  { id: 'wax-seal', label: 'Mühür' },
  { id: 'bread-clip', label: 'Klipsli Pul' },
  { id: 'stamp-tab', label: 'Pul Sekmesi' },
  { id: 'minimal', label: 'Sade' },
];

const FILTER_OPTIONS: { id: PhotoFilter; label: string }[] = [
  { id: 'vintage', label: 'Vintage Film' },
  { id: 'bw', label: 'Siyah-Beyaz' },
  { id: 'fade', label: 'Yumuşak Pastel' },
  { id: 'original', label: 'Orijinal' },
];

export const StudioSidebar: React.FC<StudioSidebarProps> = ({
  card,
  onChange,
  onApplyPreset,
  onSwitchStageView,
}) => {
  const [activeTab, setActiveTab] = useState<EditorTab>('envelope');
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const stampInputRef = useRef<HTMLInputElement | null>(null);

  const handleTabChange = (tab: EditorTab) => {
    setActiveTab(tab);
    if (tab === 'envelope') onSwitchStageView('envelope');
    if (tab === 'front') onSwitchStageView('front');
    if (tab === 'back') onSwitchStageView('back');
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file, 640, 0.78);
      onChange({ customPhoto: compressed });
      onSwitchStageView('front');
    } catch {
      // Ignore invalid file
    }
    e.target.value = '';
  };

  const handleStampUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file, 220, 0.76);
      onChange({ customStamp: compressed });
    } catch {
      // Ignore invalid file
    }
    e.target.value = '';
  };

  const toggleDoodle = (id: DoodleId) => {
    const exists = card.doodles.includes(id);
    onChange({
      doodles: exists
        ? card.doodles.filter((d) => d !== id)
        : [...card.doodles, id],
    });
  };

  return (
    <aside className="studio-sidebar">
      <nav className="sidebar-tabs" role="tablist">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'envelope' ? 'active' : ''}`}
          onClick={() => handleTabChange('envelope')}
        >
          <Mail size={15} />
          <span>Zarf & Stil</span>
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'front' ? 'active' : ''}`}
          onClick={() => handleTabChange('front')}
        >
          <Sparkles size={15} />
          <span>Ön Yüz</span>
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'back' ? 'active' : ''}`}
          onClick={() => handleTabChange('back')}
        >
          <PenTool size={15} />
          <span>Not & Pul</span>
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'atmosphere' ? 'active' : ''}`}
          onClick={() => handleTabChange('atmosphere')}
        >
          <Volume2 size={15} />
          <span>Ses</span>
        </button>
      </nav>

      <div className="sidebar-scroll">
        {activeTab === 'envelope' && (
          <div className="panel-stack">
            <section className="control-group">
              <label className="group-label">Hazır Koleksiyonlar</label>
              <div className="preset-grid">
                {TEMPLATE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    className={`preset-card ${card.theme === preset.id ? 'active' : ''}`}
                    onClick={() => onApplyPreset(preset)}
                  >
                    <div className="preset-swatches">
                      {preset.swatch.map((hex, i) => (
                        <span key={i} style={{ backgroundColor: hex }} />
                      ))}
                    </div>
                    <div className="preset-info">
                      <strong>{preset.name}</strong>
                      <span>{preset.subtitle}</span>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section className="control-group">
              <label className="group-label">Zarf Kağıt Rengi</label>
              <div className="swatch-row">
                {ENVELOPE_SWATCHES.map((s) => (
                  <button
                    key={s.name}
                    type="button"
                    title={s.name}
                    className={`color-dot ${
                      card.envelopeColor.toLowerCase() === s.color.toLowerCase() ? 'active' : ''
                    }`}
                    style={{ backgroundColor: s.color }}
                    onClick={() =>
                      onChange({
                        envelopeColor: s.color,
                        envelopeInnerColor: s.inner,
                        envelopeTextColor: s.text,
                      })
                    }
                  />
                ))}
                <label className="color-picker-dot" title="Özel renk seç">
                  <input
                    type="color"
                    value={card.envelopeColor}
                    onChange={(e) => onChange({ envelopeColor: e.target.value })}
                  />
                  <span>+</span>
                </label>
              </div>
            </section>

            <section className="control-group">
              <label className="group-label">Kapatma Detayı</label>
              <div className="chip-grid">
                {CLOSURE_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    className={`chip-btn ${card.closure === opt.id ? 'active' : ''}`}
                    onClick={() => onChange({ closure: opt.id })}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {card.closure === 'wax-seal' && (
                <div className="inline-controls">
                  <div>
                    <span className="mini-label">Mühür Harfi</span>
                    <input
                      type="text"
                      maxLength={2}
                      className="text-input compact"
                      value={card.waxSealInitial}
                      onChange={(e) => onChange({ waxSealInitial: e.target.value })}
                    />
                  </div>
                  <div>
                    <span className="mini-label">Mühür Rengi</span>
                    <input
                      type="color"
                      className="color-input-bar"
                      value={card.waxSealColor}
                      onChange={(e) => onChange({ waxSealColor: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </section>

            <section className="control-group">
              <label className="group-label">Zarf Ön Yazısı</label>
              <div className="form-field">
                <span className="mini-label">Kaligrafik Motto</span>
                <input
                  type="text"
                  className="text-input"
                  value={card.envelopeMotto}
                  onChange={(e) => onChange({ envelopeMotto: e.target.value })}
                  placeholder="Why be normal?"
                />
              </div>
              <div className="form-row-2">
                <div>
                  <span className="mini-label">Üst Etiket</span>
                  <input
                    type="text"
                    className="text-input"
                    value={card.envelopeTag}
                    onChange={(e) => onChange({ envelopeTag: e.target.value })}
                    placeholder="(2026)"
                  />
                </div>
                <div>
                  <span className="mini-label">Alt Etiket</span>
                  <input
                    type="text"
                    className="text-input"
                    value={card.envelopeSubtag}
                    onChange={(e) => onChange({ envelopeSubtag: e.target.value })}
                    placeholder="[ÖZEL POSTA]"
                  />
                </div>
              </div>
            </section>

            <section className="control-group">
              <div className="range-header">
                <label className="group-label">Kağıt Dokusu (Grain)</label>
                <span className="range-val">{Math.round(card.paperGrain * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={card.paperGrain}
                onChange={(e) => onChange({ paperGrain: Number(e.target.value) })}
                className="studio-slider"
              />

              <label className="toggle-row">
                <span>Karanlık Galeri Arka Planı</span>
                <input
                  type="checkbox"
                  checked={card.backdropDark}
                  onChange={(e) => onChange({ backdropDark: e.target.checked })}
                />
              </label>
            </section>
          </div>
        )}

        {activeTab === 'front' && (
          <div className="panel-stack">
            <section className="control-group">
              <label className="group-label">Kartpostal Düzeni</label>
              <div className="chip-grid">
                {CARD_STYLE_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    className={`chip-btn ${card.cardStyle === opt.id ? 'active' : ''}`}
                    onClick={() => onChange({ cardStyle: opt.id })}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </section>

            {card.cardStyle !== 'editorial-showcase' && (
              <section className="control-group">
                <label className="group-label">Fotoğraf & Sahne</label>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handlePhotoUpload}
                />
                <div className="upload-row">
                  <button
                    type="button"
                    className="pill-btn primary small full"
                    onClick={() => photoInputRef.current?.click()}
                  >
                    <ImagePlus size={15} />
                    <span>{card.customPhoto ? 'Fotoğrafı Değiştir' : 'Kendi Fotoğrafını Yükle'}</span>
                  </button>
                  {card.customPhoto && (
                    <button
                      type="button"
                      className="icon-pill-btn danger"
                      title="Fotoğrafı kaldır"
                      onClick={() => onChange({ customPhoto: null })}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                {!card.customPhoto && (
                  <div className="chip-grid">
                    {PHOTO_PRESETS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className={`chip-btn ${card.photoPreset === p.id ? 'active' : ''}`}
                        onClick={() => onChange({ photoPreset: p.id })}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                )}

                <div className="form-field">
                  <span className="mini-label">Film Filtresi</span>
                  <div className="chip-grid">
                    {FILTER_OPTIONS.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        className={`chip-btn ${card.photoFilter === f.id ? 'active' : ''}`}
                        onClick={() => onChange({ photoFilter: f.id })}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {card.customPhoto && (
                  <div className="slider-stack">
                    <div className="range-header">
                      <span className="mini-label">Yakınlaştır</span>
                      <span className="range-val">{card.photoZoom.toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={2.2}
                      step={0.05}
                      value={card.photoZoom}
                      onChange={(e) => onChange({ photoZoom: Number(e.target.value) })}
                      className="studio-slider"
                    />
                    <div className="range-header">
                      <span className="mini-label">Dikey Konum</span>
                      <span className="range-val">{card.photoOffsetY}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={2}
                      value={card.photoOffsetY}
                      onChange={(e) => onChange({ photoOffsetY: Number(e.target.value) })}
                      className="studio-slider"
                    />
                  </div>
                )}
              </section>
            )}

            <section className="control-group">
              <label className="group-label">Başlık & Yazılar</label>
              <div className="form-field">
                <span className="mini-label">Ana Başlık</span>
                {card.cardStyle === 'editorial-showcase' ? (
                  <textarea
                    rows={2}
                    className="text-input"
                    value={card.titleText}
                    onChange={(e) => onChange({ titleText: e.target.value })}
                  />
                ) : (
                  <input
                    type="text"
                    className="text-input"
                    value={card.titleText}
                    onChange={(e) => onChange({ titleText: e.target.value })}
                  />
                )}
              </div>

              <div className="form-field">
                <span className="mini-label">Üst Küçük Başlık</span>
                <input
                  type="text"
                  className="text-input"
                  value={card.topSubtitle}
                  onChange={(e) => onChange({ topSubtitle: e.target.value })}
                />
              </div>

              {card.cardStyle === 'editorial-showcase' ? (
                <div className="form-row-2">
                  <div>
                    <span className="mini-label">Tarih / Saat</span>
                    <input
                      type="text"
                      className="text-input"
                      value={card.dateLine}
                      onChange={(e) => onChange({ dateLine: e.target.value })}
                    />
                  </div>
                  <div>
                    <span className="mini-label">Kenar Şeridi Kelimesi</span>
                    <input
                      type="text"
                      className="text-input"
                      value={card.repeatBorderText}
                      onChange={(e) => onChange({ repeatBorderText: e.target.value })}
                    />
                  </div>
                </div>
              ) : (
                <div className="form-row-2">
                  <div>
                    <span className="mini-label">Sol Alt (Yıl)</span>
                    <input
                      type="text"
                      className="text-input"
                      value={card.bottomLeftText}
                      onChange={(e) => onChange({ bottomLeftText: e.target.value })}
                    />
                  </div>
                  <div>
                    <span className="mini-label">Sağ Alt İmza</span>
                    <input
                      type="text"
                      className="text-input"
                      value={card.bottomRightText}
                      onChange={(e) => onChange({ bottomRightText: e.target.value })}
                    />
                  </div>
                </div>
              )}

              <div className="inline-controls">
                <div>
                  <span className="mini-label">Çerçeve Rengi</span>
                  <input
                    type="color"
                    className="color-input-bar"
                    value={card.cardFrameColor}
                    onChange={(e) => onChange({ cardFrameColor: e.target.value })}
                  />
                </div>
                <div>
                  <span className="mini-label">Başlık Rengi</span>
                  <input
                    type="color"
                    className="color-input-bar"
                    value={card.titleColor}
                    onChange={(e) => onChange({ titleColor: e.target.value })}
                  />
                </div>
              </div>

              {card.cardStyle !== 'editorial-showcase' && (
                <label className="toggle-row">
                  <span>Retro Kontur Çizgisi (Outline)</span>
                  <input
                    type="checkbox"
                    checked={card.titleOutline}
                    onChange={(e) => onChange({ titleOutline: e.target.checked })}
                  />
                </label>
              )}
            </section>

            <section className="control-group">
              <label className="group-label">El Çizimi Sticker & Doodle</label>
              <div className="chip-grid">
                {DOODLE_OPTIONS.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    className={`chip-btn ${card.doodles.includes(d.id) ? 'active' : ''}`}
                    onClick={() => toggleDoodle(d.id)}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'back' && (
          <div className="panel-stack">
            <section className="control-group">
              <label className="group-label">El Yazısı Mesajın</label>
              <textarea
                rows={5}
                className="text-input"
                value={card.message}
                onChange={(e) => onChange({ message: e.target.value })}
                placeholder="İçinden geçenleri yaz..."
              />

              <span className="mini-label">El Yazısı Fontu</span>
              <div className="font-grid">
                {HANDWRITING_OPTIONS.map((font) => (
                  <button
                    key={font.id}
                    type="button"
                    className={`font-card ${card.handwritingFont === font.id ? 'active' : ''}`}
                    onClick={() => onChange({ handwritingFont: font.id })}
                  >
                    <span className={`font-preview hw-${font.id}`}>{font.sample}</span>
                    <small>{font.label}</small>
                  </button>
                ))}
              </div>
            </section>

            <section className="control-group">
              <label className="group-label">Adres & Gönderen</label>
              <div className="form-field">
                <span className="mini-label">Alıcı Hitabı</span>
                <input
                  type="text"
                  className="text-input"
                  value={card.recipientName}
                  onChange={(e) => onChange({ recipientName: e.target.value })}
                />
              </div>
              <div className="form-field">
                <span className="mini-label">Adres Satırı 1</span>
                <input
                  type="text"
                  className="text-input"
                  value={card.recipientAddress1}
                  onChange={(e) => onChange({ recipientAddress1: e.target.value })}
                />
              </div>
              <div className="form-field">
                <span className="mini-label">Adres Satırı 2</span>
                <input
                  type="text"
                  className="text-input"
                  value={card.recipientAddress2}
                  onChange={(e) => onChange({ recipientAddress2: e.target.value })}
                />
              </div>
              <div className="form-field">
                <span className="mini-label">İmza (Sağ Alt)</span>
                <textarea
                  rows={2}
                  className="text-input"
                  value={card.senderSignoff}
                  onChange={(e) => onChange({ senderSignoff: e.target.value })}
                />
              </div>
            </section>

            <section className="control-group">
              <label className="group-label">Özel Pul & Posta Damgası</label>
              <input
                ref={stampInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleStampUpload}
              />
              <div className="upload-row">
                <button
                  type="button"
                  className="pill-btn ghost small full"
                  onClick={() => stampInputRef.current?.click()}
                >
                  <Stamp size={15} />
                  <span>{card.customStamp ? 'Pul Fotoğrafını Değiştir' : 'Kendi Fotoğrafından Pul Yap'}</span>
                </button>
                {card.customStamp && (
                  <button
                    type="button"
                    className="icon-pill-btn danger"
                    title="Özel pulu kaldır"
                    onClick={() => onChange({ customStamp: null })}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              {!card.customStamp && (
                <div className="chip-grid">
                  {STAMP_PRESETS.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className={`chip-btn ${card.stampPreset === s.id ? 'active' : ''}`}
                      onClick={() => onChange({ stampPreset: s.id })}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}

              <label className="toggle-row">
                <span>Siyah-Beyaz Vintage Pul Efekti</span>
                <input
                  type="checkbox"
                  checked={card.stampMonochrome}
                  onChange={(e) => onChange({ stampMonochrome: e.target.checked })}
                />
              </label>

              <div className="form-row-2">
                <div>
                  <span className="mini-label">Damga Şehri</span>
                  <input
                    type="text"
                    className="text-input"
                    value={card.postmarkCity}
                    onChange={(e) => onChange({ postmarkCity: e.target.value })}
                  />
                </div>
                <div>
                  <span className="mini-label">Damga Tarihi</span>
                  <input
                    type="text"
                    className="text-input"
                    value={card.postmarkDate}
                    onChange={(e) => onChange({ postmarkDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div>
                  <span className="mini-label">Üst Başlık</span>
                  <input
                    type="text"
                    className="text-input"
                    value={card.backHeader}
                    onChange={(e) => onChange({ backHeader: e.target.value })}
                  />
                </div>
                <div>
                  <span className="mini-label">Alt Başlık</span>
                  <input
                    type="text"
                    className="text-input"
                    value={card.backSubheader}
                    onChange={(e) => onChange({ backSubheader: e.target.value })}
                  />
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'atmosphere' && (
          <div className="panel-stack">
            <section className="control-group">
              <label className="group-label">Taktil Ses Deneyimi</label>
              <p className="field-help">
                Alıcı zarfa tıklayıp açtığında gerçekçi kağıt hışırtısı ve kart çevirme sesi duyulur.
              </p>

              <label className="toggle-row">
                <span>Kağıt Hışırtısı & Mühür Sesi</span>
                <input
                  type="checkbox"
                  checked={card.soundEnabled}
                  onChange={(e) => onChange({ soundEnabled: e.target.checked })}
                />
              </label>

              <label className="toggle-row">
                <span>Açılışta Yumuşak Müzik Kutusu</span>
                <input
                  type="checkbox"
                  checked={card.ambientMusic}
                  onChange={(e) => onChange({ ambientMusic: e.target.checked })}
                />
              </label>

              <button
                type="button"
                className="pill-btn ghost small"
                onClick={() => playPaperRustle()}
              >
                <Volume2 size={14} />
                <span>Kağıt Sesini Dinle</span>
              </button>
            </section>
          </div>
        )}
      </div>
    </aside>
  );
};
