# BarberApp — USTA Berber Randevu Sistemi

Bu dosya, projeye daha sonra dahil olacak herhangi bir AI modelinin (veya insanın) sıfırdan context toplamadan kaldığı yerden devam edebilmesi için yazıldı. Kod yazmadan önce bu dosyayı ve `docs/barberapp.md`'yi oku.

## Proje Nedir

Tek bir berber dükkanı (marka adı: **USTA**) için iki parçalı bir sistem:
1. **Müşteri tarafı** — online randevu alma (hizmet + berber + tarih/saat seçimi)
2. **Berber/işletme sahibi paneli** — takvim, hizmet/personel yönetimi, analitik

Repo: `https://github.com/enginsemihd/barberapp` (public)

## Şu Ana Kadar Yapılanlar

### 1. Derinlemesine plan — `docs/barberapp.md`
Ürünün tamamını kapsayan plan: roller, kullanıcı akışları, ekran listesi, veri modeli (Supabase/Postgres tablo taslakları), rezervasyon çakışma mantığı, bildirim akışı, kenar durumlar, geliştirme aşamaları. **Bu dosya hâlâ geçerli — randevu/takvim/veri modeli kararları için referans kaynağı budur.**

Orijinal planda backend olarak **Next.js + Supabase + Twilio** öngörülmüştü. Bu karar aşağıdaki "Mimari Notu" bölümünde güncellendi — bkz. altta.

### 2. İnteraktif mockup — `docs/mockup.html` ve `public/index.html`
İki dosya da aynı içerik, farklı sarmalama:
- `docs/mockup.html`: Claude Artifact olarak yayınlanan fragment (title+style+body, otomatik HTML sarmalanıyor)
- `public/index.html`: Aynı mockup'ın bağımsız, tam `<html>` dokümanı hâli — statik hosting (Vercel) için

Mockup, saf HTML/CSS/vanilla JS ile yapıldı (framework yok). İçeriği:
- **Müşteri akışı (telefon çerçevesi, 6 ekran):** Ana Sayfa → Hizmet Seçimi → Berber Seçimi → Tarih/Saat → Onay & Bildirim (WhatsApp/SMS kanal seçici + mesaj önizlemesi) → Randevularım
- **Berber Paneli (masaüstü çerçevesi, 4 ekran):** Takvim (3 berber sütunlu haftalık görünüm), Hizmetler tablosu, Berberler, Analitik

Fiyatlar Gaziantep Berberler Esnaf Odası'nın 2026 resmi tarifesine göre: Saç Kesimi 350₺, Sakal Tıraşı 250₺, Saç+Sakal 500₺, Çocuk Kesimi 300₺, Saç Yıkama&Fön 250₺, Ustura Sakal 300₺, Damat Tıraşı 3.000₺.

### 3. Altyapı durumu
- **GitHub:** `enginsemihd/barberapp`, public, bağlı ve push edilmiş durumda.
- **Vercel:** `barberapp` projesi oluşturuldu, `public/index.html` deploy edildi ANCAK varsayılan "Deployment Protection" (Vercel Authentication) açık — link şu an login duvarına takılıyor. **Kullanıcı Vercel dashboard'dan Settings → Deployment Protection → Vercel Authentication'ı kapatacak** (henüz teyit edilmedi). GitHub reposu ile Vercel projesi arasında Git entegrasyonu da henüz kurulmadı (kullanıcıya adımlar verildi, tamamlanma durumu belirsiz).
- Not: Kullanılan Vercel MCP bağlantısı, kullanıcının gerçek Vercel hesabının sadece bir kısmını görebiliyor (`list_projects` sadece `stocktrack`'i döndürüyor, `barberapp`'i bile göremiyor). Bu yüzden proje silme/git-bağlama gibi işlemler bu oturumdan otomatik yapılamadı, kullanıcıya manuel adımlar verildi.

## Alınan Önemli Kararlar (Karar Günlüğü)

| Karar | Ne değişti | Neden |
|---|---|---|
| Kapora/online ödeme kaldırıldı | Randevu onayı artık ödemeye bağlı değil, doğrudan SMS/WhatsApp'tan geliyor | Kullanıcı talebi — basitlik, ödeme altyapısı gereksiz karmaşıklık |
| Onay + hatırlatma kanalı: WhatsApp veya SMS (müşteri seçiyor) | `customers.notification_channel` alanı eklendi | Kullanıcı talebi |
| Fiyatlar Gaziantep resmi tarifesine göre güncellendi | Bkz. yukarıki fiyat listesi | Gerçekçilik — kullanıcı Gaziantep'te bir berber için yapıyor |
| Tek dükkan, çok-berber | `shops` tablosu yok, `shop_settings` tekil satır; `staff` tablosunda `role` (owner\|barber) | Kullanıcı kapsamı: SaaS değil, tek dükkan |

## Mimari Notu — WhatsApp/IVR Katmanı Güncellemesi (YENİ, henüz plana işlenmedi)

Kullanıcı, bildirim/iletişim katmanı için **çok daha somut ve farklı bir mimari** getirdi. `docs/barberapp.md`'deki "Twilio ile SMS/WhatsApp" kararı bunun yerine aşağıdakiyle **değiştirilecek**:

### Telefon/numara mimarisi
- Sanal santral sağlayıcısından (Netgsm, Bulutfon vb.) yeni bir **0850'li numara** alınacak — bot ve IVR bu numara üzerinden çalışacak.
- Berberin kişisel numarası değişmiyor:
  - **WhatsApp:** Business hesabında "Kişilerim Dışındakiler" otomatik yanıtıyla müşterilere bot linki (`wa.me/90850...`) gönderilecek.
  - **Arama:** Berber meşgul/açmıyor durumunda GSM operatörü üzerinden çağrı 0850'li IVR numarasına koşullu yönlendirilecek.
- **WhatsApp entegrasyonu:** Meta WhatsApp Cloud API (resmi API) — Twilio değil.
- **IVR entegrasyonu:** Santral sağlayıcısının webhook/XML tabanlı IVR + DTMF altyapısı.

### A. WhatsApp Bot Akışı
1. Müşteri 0850 numarasına mesaj atar
2. Bot karşılar, gün seçtirir
3. DB'den o gün için boş saatler çekilir (bkz. `docs/barberapp.md` → `get_available_slots` RPC mantığı — aynı fonksiyon burada da kullanılmalı)
4. Müşteriye WhatsApp buton/liste formatında saatler sunulur
5. Seçim → DB'ye kayıt + onay mesajı

### B. IVR Akışı
1. Müşteri 0850'yi arar (doğrudan ya da yönlendirmeyle)
2. Santral, backend'e webhook (HTTP POST/GET) atar
3. Backend TTS/ses yanıtı döner: "Randevu almak için 1'i tuşlayın"
4. DTMF ('1') geldiğinde backend boş saatleri hesaplar, tuşlama menüsü döner ("14:00 için 1'i, 15:00 için 2'yi tuşlayın")
5. Son tuşlamayla DB'ye kayıt + kapanış anonsu + çağrı sonlandırma

### C. Whitelist (opsiyonel)
IVR webhook'una gelen çağrının `Caller ID`'si "özel numaralar" tablosunda varsa, IVR menüsü hiç okunmadan çağrı doğrudan berberin kişisel cebine yönlendirilir (Call Forward/Dial komutu döner).

### Teknik görev listesi (bu katman için)
1. Express.js sunucu + route mimarisi (mevcut plandaki Next.js API route'ları yerine ayrı bir Express servisi olarak mı, yoksa Next.js API routes içine mi gireceği **henüz karara bağlanmadı** — sıradaki netleştirilmesi gereken soru)
2. `POST /api/whatsapp/webhook` — Meta WhatsApp Cloud API mesajlarını dinler/yanıtlar
3. `POST /api/ivr/webhook` — santralden gelen çağrı/DTMF verisini dinler, XML/JSON yanıt döner
4. Randevu + müsaitlik veri modeli — **`docs/barberapp.md`'deki `appointments`, `staff_schedules`, `staff_time_off` tablolarıyla aynı şema kullanılmalı, ayrı bir DB modeli icat edilmemeli** (kullanıcının önerdiği "MongoDB veya PostgreSQL" — mevcut plan zaten Postgres/Supabase seçmişti, bu korunmalı, tutarlılık için)
5. Yeni tablo: `whitelist_numbers` (personal/özel numaralar) — whitelist özelliği için

### Çözülmemiş sorular (bir sonraki oturumda netleştirilmeli)
- Bu Express katmanı, mevcut Next.js uygulamasının içine mi (API routes) yoksa ayrı bir mikroservis olarak mı kurulacak?
- IVR santral sağlayıcısı hangisi olacak (Netgsm/Bulutfon) — her birinin webhook payload formatı farklı, seçim yapılınca entegrasyon kodu ona göre yazılmalı
- Meta WhatsApp Cloud API için Business hesabı/numara başvurusu yapıldı mı — bağımlılık bu onaya bağlı

## Sıradaki Adımlar

1. Vercel deployment protection kapatma + GitHub-Vercel git entegrasyonu — kullanıcı tarafında tamamlanacak
2. `docs/barberapp.md`'yi bu README'deki WhatsApp/IVR kararlarıyla güncelle (plan dosyasına resmi olarak işlenmeli)
3. Yukarıdaki "Çözülmemiş sorular" netleşince Express/Next.js API route + webhook implementasyonuna başla
4. Mockup onaylandıktan sonra gerçek kodlamaya geç (`docs/barberapp.md` → "Geliştirme Aşamaları" bölümü)

## Proje Yapısı

```
BarberApp/
├── README.md              (bu dosya — genel context)
├── docs/
│   ├── barberapp.md        (derinlemesine plan — veri modeli, akışlar, mimari)
│   └── mockup.html         (Artifact fragment — Claude'da yayınlanan versiyon)
└── public/
    └── index.html          (mockup'ın bağımsız statik hosting versiyonu — Vercel'e deploy edilen budur)
```
