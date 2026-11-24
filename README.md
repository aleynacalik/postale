# Postale — İnteraktif Dijital Kartpostal & Zarf Stüdyosu

Dokulu kağıt hissi, el çizimi detaylar, özel pul & posta damgası ve interaktif 3D zarf açılış deneyimi sunan dijital kartpostal stüdyosu.

## Özellikler
- **5 Hazır Koleksiyon:** Blush Vintage, Ice Mint Showcase, İstanbul Akşamı, Terracotta Yaz, Midnight Velvet
- **Tasarım Stüdyosu:**
  - Zarf rengi, kağıt dokusu, mühür veya klipsli pul kapatma seçenekleri
  - Ön yüz için 4 farklı düzen (Vintage Oval, Editoryal Davetiye, Kemer Çerçeve, Klasik)
  - Kendi fotoğrafını yükleme + film filtresi + yakınlaştırma/konum ayarı
  - Kendi fotoğrafından tırtıklı posta pulu üretme + şehir/tarih damgası
  - 4 farklı el yazısı fontu ve el çizimi doodle/sticker'lar
- **İnteraktif Alıcı Deneyimi:**
  - Mühürlü/klipsli zarfa tıklayınca 3D kapak açılır, kağıt hışırtısı sesiyle kartpostal dışarı çıkar
  - Kartpostala tıklayarak 3D ön-arka çevirme
  - Cevap kartpostalı hazırlama akışı
- **Paylaşım & E-posta:**
  - Sunucusuz çalışan sıkıştırılmış paylaşım linki + WhatsApp paylaşımı
  - Canlı Gelen Kutusu (Inbox) önizlemesi, `mailto:` gönderimi ve Resend/SendGrid uyumlu HTML e-posta şablonu (`api/send-email.ts`)

## Çalıştırma

```bash
npm install
npm run dev
```

## Gerçek E-posta Gönderimi (Opsiyonel)
Projeyi Vercel'e deploy edip `RESEND_API_KEY` ortam değişkenini eklediğinizde `api/send-email.ts` üzerinden doğrudan e-posta gönderilebilir.
