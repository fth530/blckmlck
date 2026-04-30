# Block Rush — Gerçekçi Durum Raporu

_Tarih: 29 Nisan 2026 | Kaynak: Kaynak kodu doğrudan incelenerek hazırlandı_

---

## Özet: Nerede Duruyoruz?

Dürüst olmak gerekirse: **oyun şu anda yayınlanamaz durumda**. Ekran düzeni hâlâ tam oturmuyor, onboarding yok, monetizasyon işlevsel değil, analitik yok, App Store'da yok. Bunların hiçbirini yapmadan organik indirme almayı beklemek gerçekçi değil.

Bu rapor hayali tehditler değil, koddan okuduğum somut eksikler ve çözümleri üzerine kurulu.

---

## 1. Kritik Teknik Sorunlar (Yayın Engelleyici)

### 1.1 Layout Hâlâ Bozuk

Konuşmanın tamamı layout'u düzeltmeye harcandı. Tahtanın ekrana tam oturmaması bir "küçük bug" değil — bu, oyunun ilk izlenimini oluşturan şey. Birisi oyunu açıp tahta küçük ve ortalanmamışsa, anında siliyor.

**Kökten neden:** `boardDim` JavaScript'te statik hesaplanıyordu; `PowerUpBar`, `TimerBar` gibi dinamik elementler hesaba katılmıyordu. Bu session'da `width: '100%', aspectRatio: 1` yaklaşımına geçildi — doğru yön, ama simulator'de doğrulanmadı.

### 1.2 Tutorial Var Ama Hiç Gösterilmiyor

`TutorialOverlay.tsx` dosyası var, 200+ satır kod var, TR/EN çevirisi var. **Hiçbir ekranda kullanılmıyor.** `GameScreen.tsx`'e import bile edilmemiş. Yeni kullanıcı oyunu açıyor, hiçbir açıklama görmeden boş bir tahtayla karşılaşıyor.

Mobil oyunlarda Day-1 retention'ı en çok öldüren şey kötü onboarding'dir. Üstelik mevcut tutorial da yanlış: **4 slayt halinde metin kartları gösteriyor**. Endüstri standardı, kullanıcıya adım adım gerçek hamle yaptırmak — "şu parçayı buraya sürükle" diye okla işaret etmek. Metin okuyan yok.

### 1.3 Çizgi Temizleme Animasyonu Bu Session'a Kadar Çalışmıyordu

`GameBoard`'daki hücre flash animasyonu (`clearingRows` / `clearingCols` prop'ları) `GameScreen.tsx`'te hiç bağlanmamıştı. Bu session'da düzeltildi. Ama bu şu anlama geliyor: **oyun temel feedback mekanizmasından yoksun çalışıyordu** — çizgi temizlenince görsel hiçbir şey olmuyor, sadece ses.

### 1.4 Performans: Yanlış Animasyon Altyapısı

Oyundaki her şey React Native `Animated` API kullanıyor: drag, partikül efektler, tahta sallantısı, tray animasyonları. Bu JS thread'de çalışır. Eş zamanlı birden fazla animasyon + drag = **orta seviye cihazlarda kekeme, yaşlı cihazlarda oynanamaz.**

`react-native-reanimated` **bağımlılıklarda var ama hiç kullanılmıyor.** Bu kütüphane UI thread'de çalışır, 60/120fps garanti eder. Drag & drop de `PanResponder` (JS thread) kullanıyor, `react-native-gesture-handler` (native thread) kullanmıyor.

Rakipler (Block Blast!, 1010!) bu konuda yatırım yapmış. Bizim oyun onlarla kıyaslandığında "plastik" hissettiriyor.

---

## 2. Oynanış Açısından Eksikler

### 2.1 Parça Yerleştirme Hâlâ Zor

Kullanıcı bunu konuşma boyunca defalarca söyledi: "rahat hareket ettirip koyamıyorum." Snap toleransı eklendi (±1 hücre), ama ana sorun farklı: **parçayı bırakma noktası ile görünen nokta arasında belirsizlik var.** `LIFT_OFFSET_Y = 30` ile parça parmağın biraz yukarısına kalkıyor ama bu offset yeterince büyük değil.

Block Blast! ve Woody'de parça parmağın çok daha yukarısına kalkıyor (80-100px), ghost cells büyük ve net görünüyor, snap zone geniş. Bizimkini kıyasla "kaygan" hissettiriyor.

### 2.2 Rotasyon Keşfedilemez

Çift tıklama ile parça döndürme var, ama **bunu kullanıcıya söyleyen hiçbir şey yok.** Tutorial gösterilmiyor, parçaların üzerinde döndür ikonu yok. Büyük ihtimalle kullanıcıların %95'i bu özelliğin var olduğunu bilmeden oyunu bırakıyor.

### 2.3 Game Over Çok Ani Geliyor

Üç parçanın hiçbiri sığmadığında oyun bitiyor. Uyarı yok, son şans yok. Block Blast! oyun bitmeden önce "son hamle" animasyonu yapıyor, Woody "devam etmek ister misin?" diye soruyor (rewarded ad). Bizde sadece modal açılıyor. Kullanıcı hayal kırıklığını oyunla değil kendisiyle yaşıyor ve bir daha açmıyor.

### 2.4 Mod Farklılıkları Yüzeysel

- **Classic:** Standart oyun.
- **Zen:** Tahta dolsa bile oyun bitmiyor. İyi fikir ama "neden oynuyorum?" motivasyonu vermiyor.
- **Timed:** 60 saniyelik geri sayım. Temel deneyim aynı.

1010! ve Block Blast!'ın farklı board boyutları, farklı temizleme kuralları, "duo" modları var. Bizimki mode seçimini kozmetik düzeyde bırakıyor.

---

## 3. Monetizasyon: Teoride Var, Pratikte İşlevsiz

### 3.1 Coin Sistemi Yanlış Ayarlanmış

Oyun bitişinde `score / 10` coin kazanılıyor. 1000 puan = 100 coin. En ucuz tema 200 coin = 2 oyunla açılıyor. Bu çok hızlı, değer algısını yok ediyor. Alternatif olarak çok düşük de olabilir, kullanıcı fark etmeyebilir — çünkü oyun içinde coin kazandığını gösteren hiçbir görsel yok.

### 3.2 Rewarded Reklam Yok — Bu En Büyük Gelir Kaybı

Bu türdeki oyunların %80'i şunu yapıyor:
- Oyun bitince: "1 reklam izle → devam et (3 yeni parça)"
- Parça yenile: "1 reklam izle → 3 yeni parça al"

Bu mekanizma **churn'ü düşürür, geliri artırır, kullanıcıyı zorlamamış hissettirir.** Bizde IAP yok, rewarded reklam yok. Mağazada sadece sabit coin-tema dönüşümü var.

### 3.3 Mağaza Yapısı Tek Boyutlu

6 tema var, tümü sadece renk paleti değişikliği. Oynanışa hiçbir etkisi yok. Rakipler tema paketi yanında özel efektler, ses paketleri, XP booster satıyor. Bizimki salt estetik — satın alma motivasyonu düşük.

---

## 4. Büyüme ve Organik İndirme

### 4.1 App Store'da Yok

En temel gerçek: **oyun App Store'da değil.** Organik indirme almanın tek yolu budur. Bunun için eksikler:
- Apple Developer hesabı ($99/yıl)
- Uygulama ikonu — şu an `app.json`'da placeholder
- En az 3 ekran görüntüsü — yok
- Açıklama ve anahtar kelimeler — yok
- Preview video — yok

### 4.2 Görsel Kimlik Yok

"Block Rush" + gradient logo tamamen jenerik. App Store'da "block puzzle" aramasında yüzlerce benzer uygulama çıkıyor. Woody'nin ahşap dokusu var, 1010!'ın sade minimalizmi var, Block Blast!'ın enerji dolu renk patlaması var. Block Rush'ın **hangi grupta olduğu belli değil.**

İkon click-through rate (CTR) App Store'da en kritik metriktir — kötü ikon = düşük CTR = düşük indirme = düşük sıralama = organik trafik yok. Döngü kırılamaz.

### 4.3 Viral Loop Yok

Skor paylaşma var (`Share.share` metin mesajı) — ama görsel paylaşım kartı yok. Rakipler board thumbnail + skor + tarih içeren bir kart oluşturuyor. Bunlar TikTok'ta ve Instagram'da organik yayılıyor. Block Blast!'ın 2023-2024 viral büyümesi neredeyse tamamen bu kanaldan geldi.

### 4.4 Analitik Yok

Hiçbir analytics entegrasyonu yok (Firebase, Mixpanel vb.). Şu soruların cevabı yok:
- İlk oturumda kaç dakika kalıyorlar?
- Hangi modda daha fazla vakit geçiriyorlar?
- Hangi noktada çıkıyorlar?

Kör uçuş yapıyoruz. İyileştirme yapamayız çünkü neyi düzeltmemiz gerektiğini bilmiyoruz.

### 4.5 Push Bildirim Yok

Daily Challenge her gün sıfırlanıyor ama kullanıcıya bildirim gitmiyor. "Bugünkü meydan okuma seni bekliyor 🎯" mesajı day-7 retention'a %15-20 katkı sağlıyor. `expo-notifications` bağımlılıklarda bile yok.

---

## 5. Rakiplerle Karşılaştırma

| Özellik | Block Blast! | 1010! | Woody | **Block Rush** |
|---|---|---|---|---|
| Layout düzgünlüğü | ✅ | ✅ | ✅ | ❌ Hâlâ sorunlu |
| İnteraktif onboarding | ✅ | ✅ | ✅ | ❌ Hiç yok |
| Çizgi temizleme efekti | ✅ Konfeti | ✅ Parlama | ✅ | ⚠️ Yeni düzeltildi |
| 60fps drag (native) | ✅ | ✅ | ✅ | ❌ JS thread |
| Rotasyon görünür butonu | ✅ | ❌ | ❌ | ❌ Gizli özellik |
| Game over lifeline (rewarded) | ✅ | ❌ | ✅ | ❌ |
| Görsel paylaşım kartı | ✅ | ❌ | ❌ | ❌ |
| Push bildirim | ✅ | ✅ | ✅ | ❌ |
| Analytics | ✅ | ✅ | ✅ | ❌ |
| App Store'da mevcut | ✅ | ✅ | ✅ | ❌ |

---

## 6. Öncelik Sırası

### Yayın Şartı (Bunlar Olmadan Çıkmayın)

1. **Layout'u doğrula** — Simulator'de onay alınmadan geçilmemeli. Tek cihazda değil, SE, 16, 16 Pro Max'te test.
2. **İnteraktif tutorial** — Metinli slaytı at. İlk 3 hamlede kullanıcıyı elle yönlendir: ok işareti + highlight. Slayt tutorial Day-1 churn'ü önlemez.
3. **Uygulama ikonu + splash** — Placeholder ile yayın yapılmaz.
4. **App Store listesi** — Açıklama, screenshot, anahtar kelimeler. ASO olmadan yayın = damlaya damlaya göl olmaz, burada damla bile yok.

### Kısa Vadeli (İlk 2 Hafta)

5. **Drag & drop native'e taşı** — `react-native-gesture-handler` + `Reanimated`. En çok hissiyatı etkileyen değişiklik.
6. **Çizgi temizleme efektini güçlendir** — Tüm temizlenen satır/sütun hücrelerinde konfeti + renk seli. Bu oyunu bağımlı yapan şeydir.
7. **Rotasyon ikonu** — Tray'deki her parçada küçük döndür butonu. Gizli özellik olmaktan çıkar.
8. **Rewarded ad: "son şans"** — Oyun bitince "1 video izle → 3 yeni parça." En hızlı gelir ve retention dengesi.

### Orta Vadeli (İlk Ay)

9. **Firebase Analytics** — Veri olmadan karar alınamaz.
10. **Görsel paylaşım kartı** — `react-native-view-shot` ile board + skor + tarih. TikTok içeriği buradan gelir.
11. **Push bildirim** — `expo-notifications`, günlük challenge hatırlatıcısı.
12. **Görsel kimlik** — Bir yön seç (neon arcade / kağıt çizimi / ahşap) ve tüm asset'leri o yönde yenile. Farklılaşma buradan başlar.

---

## 7. Sonuç

Block Rush iyi bir temel üzerinde duruyor: smart piece generation, combo sistemi, daily challenge, achievements, çoklu mod, tema sistemi — bunlar rakipleriyle rekabet edebilir düzeyde.

Ama **temel deneyim hâlâ kırık:**

- Tahta düzgün görünmüyor
- Kullanıcı nasıl oynayacağını bilmiyor
- Oyun tatmin edici hissettirmiyor
- Kimse bulamıyor

Bu dört sorundan biriyle yayına çıkmak, gerisinin seni öldürmesine izin vermek demek. Sırayla çözmek gerekiyor.

**Gerçekçi hedef:** 2-3 haftalık yoğun çalışmayla yayına hazır hale getirilebilir. Bu çalışmanın %60'ı teknik değil — ikon, screenshot, ASO, analitik, interaktif tutorial. Bunlar "göründüğünden kolay" değil ama atlanırsa tüm teknik iyileştirme boşa gider.

---

_Bu rapor kaynak kod incelemesine dayanmaktadır. Simulator testi ve gerçek kullanıcı testi ayrıca yapılmalıdır._
