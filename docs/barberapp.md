# Berber Randevu Sistemi — Derinlemesine Plan

## Context

Sıfırdan yeni bir proje: bir berber dükkanının kullanacağı **müşteri randevu sistemi** + **berber/işletme sahibi için yönetim dashboard'u**. Mevcut kod yok (greenfield). Karar verilenler:

- **Platform:** Web (responsive) — hem müşteri hem dashboard aynı web app içinde
- **Kapsam:** Tek dükkan (çok kiracılı SaaS değil), ama dükkan içinde birden fazla berber/koltuk desteklenecek
- **Backend:** Supabase (Postgres + Auth + Realtime + Edge Functions)
- **Müşteri özellikleri:** online randevu + hizmet/berber seçimi, SMS/WhatsApp ile onay + hatırlatma, geçmiş randevular + favori berber (kapora/online ödeme yok — randevu onayı doğrudan SMS/WhatsApp üzerinden)

Bu planın amacı: ürünü uçtan uca (akışlar, veri modeli, mimari, ekranlar, kenar durumlar) netleştirmek. Bir sonraki adım — kullanıcının belirttiği gibi — bu plan üzerinden bir **mockup** üretmek olacak; gerçek kodlama mockup onaylandıktan sonra başlar.

## Ürün Kapsamı

### Roller
- **Müşteri (customer):** telefon OTP ile kayıt/giriş, randevu alır, geçmişini görür.
- **Berber (barber/staff):** kendi takvimini görür, kendi randevularını yönetir.
- **İşletme sahibi (owner/admin):** her şeye erişir — hizmetler, berberler, çalışma saatleri, tüm randevular, analitik, ayarlar.

Roller `staff` tablosunda tek bir `role` kolonu ile ayrılır (owner | barber) — ayrı tablo/tenant yapısına gerek yok.

### Çekirdek akışlar
1. **Müşteri randevu alma:** Hizmet seç → Berber seç (ya da "farketmez") → Uygun tarih/saat seç → Bildirim kanalı seç (WhatsApp/SMS) → Onayla → aynı kanaldan anlık onay mesajı
2. **Berber/owner takvim yönetimi:** Günlük/haftalık takvimde randevuları gör, onayla/iptal et/tamamlandı işaretle/no-show işaretle, elden (walk-in) randevu oluştur
3. **Hatırlatma:** Randevudan 24 saat ve 2 saat önce otomatik SMS/WhatsApp
4. **Müşteri geçmişi:** Geçmiş/gelecek randevular, favori berber, tekrar randevu alma

## Ekran Listesi (mockup için referans)

**Müşteri tarafı:**
1. Ana sayfa (dükkan bilgisi, "Randevu Al" CTA)
2. Hizmet seçimi
3. Berber seçimi ("farketmez" opsiyonu dahil)
4. Tarih/saat slot seçici (müsaitliğe göre)
5. Randevu özeti + bildirim kanalı seçimi (WhatsApp/SMS) + onay mesajı önizlemesi
6. Giriş/Kayıt (telefon OTP)
7. Randevularım (yaklaşan / geçmiş liste)
8. Randevu detayı (iptal/yeniden planla)
9. Profilim (favori berber, iletişim bilgisi)

**Dashboard (berber/owner):**
1. Giriş (email/parola)
2. Takvim görünümü (gün/hafta, berbere göre filtre)
3. Randevu detay modalı (onayla/iptal/tamamlandı/no-show, not ekle)
4. Yeni/elden randevu formu
5. Hizmet yönetimi (liste + ekle/düzenle)
6. Berber/personel yönetimi (liste + ekle/düzenle + çalışma saati/izin)
7. Müşteri listesi (arama, geçmiş görüntüleme — hafif CRM)
8. Analitik (gelir, popüler hizmetler, yoğun saatler)
9. Dükkan ayarları (çalışma saatleri, tatil günleri, SMS/WhatsApp onay+hatırlatma şablonları)

## Veri Modeli (Supabase / Postgres)

Tek dükkan olduğu için `shops` tablosu yok — dükkan bilgisi tek satırlık `shop_settings` içinde tutulur.

- **`shop_settings`**: name, address, phone, logo_url, timezone, cancellation_window_hours
- **`staff`**: id, user_id (FK auth.users), name, photo_url, bio, phone, role (owner|barber), is_active
- **`services`**: id, name, description, duration_minutes, price, category, is_active
- **`staff_services`**: staff_id, service_id (hangi berber hangi hizmeti verir — override süre/fiyat opsiyonel)
- **`staff_schedules`**: staff_id, day_of_week, start_time, end_time (haftalık tekrarlayan müsaitlik)
- **`staff_time_off`**: staff_id, start_datetime, end_datetime, reason (izin/tatil istisnaları)
- **`customers`**: id, user_id (FK auth.users), name, phone, email, notification_channel (whatsapp|sms), notes, created_at
- **`appointments`**: id, customer_id, staff_id, service_id, start_time, end_time, status (pending|confirmed|completed|cancelled|no_show), price, notes, created_at
- **`notifications_log`**: id, appointment_id, type (sms|whatsapp), purpose (confirmation|reminder_24h|reminder_2h), sent_at, status
- **`whitelist_numbers`** (Faz 9): phone, label — IVR'da bu numaralardan gelen aramalar menü okunmadan doğrudan berberin kişisel cebine yönlendirilir

RLS: müşteriler yalnızca kendi `appointments`/`customers` kayıtlarını görür/düzenler; `staff` rolündekiler kendi randevularını, `owner` hepsini görür.

## Mimari & Teknoloji

- **Next.js (App Router, TypeScript)** — SSR ile müşteri sayfaları SEO dostu, `/dashboard` route grubu auth korumalı
- **Tailwind CSS + shadcn/ui** — hızlı, temiz UI; mockup'a doğrudan taşınabilir
- **Supabase**: Postgres + Auth (müşteri: telefon OTP, staff: email/parola) + Edge Functions + pg_cron (hatırlatma job'u)
- **TanStack Query** — veri çekme/cache
- **react-hook-form + zod** — form validasyonu
- **Takvim UI**: FullCalendar (dashboard'daki gün/hafta görünümü için)
- **WhatsApp**: Meta WhatsApp Cloud API (resmi API) — Twilio değil
- **SMS + Sesli arama (IVR)**: Sanal santral sağlayıcısı (Netgsm/Bulutfon) — yeni bir **0850'li numara** üzerinden hem SMS hem IVR/DTMF çalışır. Berberin kişisel numarası aynı kalır; WhatsApp Business "Kişilerim Dışındakiler" otomatik yanıtıyla bot linkine (`wa.me/90850...`) yönlendirilir, meşgul/açılmayan aramalar operatör üzerinden 0850'ye yönlendirilir.
- Webhook'lar (`/api/whatsapp/webhook`, `/api/ivr/webhook`) **ayrı bir Express servisi değil**, Next.js API routes içinde yaşar — tek deploy birimi, tek veri modeli erişimi (bkz. "Sıradaki Adım")
- **Hosting**: Vercel (Next.js ile native entegrasyon)

## Rezervasyon / Çakışma Mantığı

- Müsait slotlar tek bir Postgres fonksiyonu (`get_available_slots(staff_id, service_id, date)`) üzerinden hesaplanır — hem müşteri akışı hem elden randevu formu aynı fonksiyonu kullanır (tek doğruluk kaynağı)
- Çifte rezervasyonu önlemek için `appointments` üzerinde `staff_id` + zaman aralığına göre bir **EXCLUDE constraint** (tstzrange, GiST) kullanılır — race condition'da bile veritabanı seviyesinde engellenir
- Slot granülaritesi: 15 dakika; son slot, kapanış saatinden hizmet süresi kadar önce bitmeli

## Bildirim Akışı (Onay + Hatırlatma)

- **Onay:** Müşteri randevuyu onayladığı an bir Edge Function tetiklenir → randevu `confirmed` olur → müşterinin tercih ettiği kanaldan (Meta Cloud API/WhatsApp ya da santral/SMS) anlık onay mesajı gönderilir → `notifications_log`'a `confirmation` olarak yazılır
- **Hatırlatma:** pg_cron her birkaç dakikada bir çalışan bir Edge Function tetikler → yaklaşan (24s/2s) randevuları bulur → aynı tercih edilen kanaldan gönderir → `notifications_log`'a `reminder_24h`/`reminder_2h` olarak yazılır
- Ödeme/kapora yok — randevu, oluşturulduğu anda (ya da owner onayıyla) `confirmed` durumuna geçer
- **Gelen WhatsApp/arama akışı** (müşteri randevu almak için 0850'yi mesajlar/arar): ayrı bir kanal, "Geliştirme Aşamaları"nda Faz 9 — çekirdek uygulamadaki aynı `get_available_slots` RPC'sini ve `appointments` tablosunu kullanır, kendi veri modeli icat etmez

## Kenar Durumlar

- Zaman dilimi: tek dükkan → tek timezone, DB'de UTC saklanır, arayüzde yerel saat gösterilir
- İptal politikası: `cancellation_window_hours` içinde iptal serbest; sonrasında iptal edilirse owner'a bildirim gider (yaptırım yok, kapora olmadığı için)
- No-show: owner işaretler, tekrarlayan no-show'lar müşteri profilinde görünür (gelecekte otomatik engelleme için temel)
- Randevu oluşturmak için hesap zorunlu (telefon OTP) — geçmiş/favori özelliği bunu gerektiriyor, misafir rezervasyonu yok
- Owner aynı zamanda berber olabilir (role birleşimi `staff` tablosunda doğal olarak destekleniyor)
- Dükkan geneli kapalı günler (resmi tatil vb.) `staff_time_off`'ta tüm berberler için toplu kayıt olarak ya da ayrı bir `shop_closures` tablosuyla ele alınabilir (basit tutmak için başlangıçta tüm berberlere toplu izin girilecek)

## Sıradaki Adım — Build Sırası (2026-07-26 karar)

Çekirdek uygulama (Faz 1-8) **önce**, WhatsApp/IVR bot katmanı (Faz 9) **sonra**. Gerekçe: WhatsApp/IVR botunun "hangi saat boş" sorusuna cevap verebilmesi için gerçek randevu/müsaitlik verisi (Faz 1-3'te kurulur) şart — önce bot yapılırsa mock veriye bağlanır, çekirdek app hazır olunca yeniden bağlanması gerekir (çifte iş).

**Paralel yürüyebilecek, kodlamayı beklemeyen işler** (kullanıcı tarafında, şimdi başlatılabilir):
- Santral sağlayıcısı (Netgsm/Bulutfon) seçimi + 0850 numara başvurusu
- Meta WhatsApp Business hesabı/numara onay başvurusu

Bu iki başvuru süreci yavaş işleyebilir; kodlama Faz 1-8'i beklerken paralelde ilerlerlerse Faz 9'a gelindiğinde blokaj olmaz.

## Geliştirme Aşamaları

1. **Temel kurulum:** Next.js scaffold, Supabase proje oluşturma, migration'lar (şema + RLS), auth kurulumu
2. **Admin çekirdek:** dükkan ayarları, hizmet CRUD, berber CRUD, çalışma saati/izin yönetimi
3. **Rezervasyon motoru:** müsaitlik RPC fonksiyonu, müşteri randevu akışı, çakışma önleme
4. **Dashboard çekirdek:** takvim görünümü, randevu aksiyonları, elden randevu formu
5. **Müşteri hesabı:** kayıt/giriş, geçmiş randevular, favori berber, iptal/yeniden planlama
6. **Bildirimler:** Meta WhatsApp Cloud API + santral SMS entegrasyonu, anlık onay mesajı, pg_cron hatırlatma job'u
7. **Analitik:** gelir/popüler hizmet/yoğun saat raporları
8. **Cila/QA:** responsive kontrol, boş/yükleniyor/hata durumları
9. **WhatsApp Bot + IVR:** `whitelist_numbers` tablosu, `/api/whatsapp/webhook` (Meta Cloud API mesaj dinleme + buton/liste akışı), `/api/ivr/webhook` (santral DTMF akışı, TTS yanıtları), Caller ID whitelist yönlendirmesi — Faz 1-8'deki `get_available_slots` RPC ve `appointments` tablosu üzerine kurulur, yeni veri modeli icat edilmez

> **Not:** Bu aşamalar plan onayından sonraki gerçek implementasyon için. Kullanıcının bir sonraki isteği — mockup — bu ekran listesi ve akışlar temel alınarak, kodlamadan önce ayrı bir adımda yapılacak.

## Doğrulama

- Şema + RLS: Supabase'de migration uygulandıktan sonra `list_tables` ve `get_advisors` ile kontrol
- Rezervasyon akışı: müsaitlik fonksiyonuna aynı anda iki istek göndererek çakışma constraint'inin çalıştığı test edilir
- Uçtan uca: tarayıcıda müşteri akışı (hizmet seç → randevu al → SMS geldi mi) ve dashboard akışı (randevu göründü mü, durum değişikliği yansıdı mı) manuel test edilir
