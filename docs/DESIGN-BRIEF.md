# Dizayn brief — FinanceOS veb tətbiqi

Bu sənəd `financeos-web`-in tam dizaynını (auth daxil, bütün 9 səhifə) aparmaq üçün lazım olan bütün kontekstdir — brend, ton, texniki məhdudiyyətlər, səhifə siyahısı, mobil tələblər və əvvəlki cəhddən konkret geri bildirim. Yeni dizayn sessiyası (impeccable və ya başqa bir yolla) buradan başlamalıdır, sual-cavab təkrarlamadan.

## Məhsul

**Nə:** Fərdi və freelancer istifadəçilər üçün maliyyə idarəetmə platformasının veb client-i. Backend (`financeos-core`) ayrıca repo-dadır və Command → Event → Projection memarlığı ilə işləyir — bu repo yalnız onun REST endpoint-lərini çağırır, biznes məntiqi saxlamır.

**İstifadəçi:** Fərdi şəxs və ya freelancer, öz gəlir/xərclərini, bir neçə hesabını (bank, nağd, kart), büdcəsini və maliyyə hədəflərini izləyir. Çox güman gündəlik/həftəlik tezlikdə, əksər hallarda telefondan istifadə edəcək (bank tətbiqlərinə baxma vərdişi ilə eyni ssenari).

**Baza dil/valyuta:** Azərbaycan dili (`az-AZ`), default baza valyuta AZN. Hazırda tək dil dəstəklənir, i18n planlaşdırılmayıb.

## Brend

- **Ad:** **FinanceOS** — bu, finaldır, dəyişdirilməsin.
- **Loqo/vizual aktivlər:** Yoxdur. Hazırda yalnız mətn əsaslı wordmark var. Yeni loqomark (simvol/monoqram) təklif oluna bilər, amma bu qərar dizayn mərhələsinin özündə veriləcək — mövcud heç bir sənədləşdirilmiş loqo qaydası yoxdur.
- **Ton:** **Müasir və isti (fintech-startup)** — Revolut/Wise səviyyəsində canlı, dostcasına, lakin hələ də etibarlı. Ciddi/soyuq bank tərzi (Mercury/Brex) yox, amma generic "SaaS gray" da yox.
- **Mühüm:** Marka **görünməlidir** — hər səhifədə hiss olunan, təkrarlanan bir vizual imza (rəng, forma, tipoqrafiya davranışı) lazımdır. Sadəcə neytral boz/qara ilə "təmiz" görünmək kifayət etmir (aşağıdakı "Əvvəlki cəhddən nəticə" bölməsinə bax).

## Əvvəlki cəhddən nəticə (təkrarlanmasın)

Auth səhifələri (login/register/forgot-password/reset-password) artıq bir dəfə yenidən dizayn edildi (split-screen: tünd panel + forma, shadcn/Base UI komponentləri, impeccable detector ilə yoxlanılıb — texniki cəhətdən təmizdir, build/lint keçir). İstifadəçi nəticəni **"pis deyil, amma daha yaxşı ola bilərdi"** qiymətləndirdi, konkret səbəblər:

1. **Çox sadə/boş görünürdü** — sol brend paneli tək bir cümlə + tək bir nəhəng şəffaf simvoldan ibarət idi, vizual maraq/zənginlik çatmırdı.
2. **Vizual şəxsiyyət zəif idi** — istifadə olunan naviqasiya rəngi (tünd-göy + kəhrəba) shadcn-in default "neutral" bazası üzərində qurulmuşdu, real, düşünülmüş bir brend hissi vermirdi. "İstənilən fintech app" kimi görünürdü, FinanceOS kimi yox.
3. **Tipoqrafiya/detallar zəif idi** — başlıq ölçüləri, boşluq ritmi, mikro-detallar (ikon seçimi, keçidlər) diqqətlə qurulmuş bir tipoqrafik miqyas hissi vermirdi.

Yeni dizayn bunları həll etməlidir: daha zəngin/məzmunlu tərtibat (təkcə mətn deyil), FinanceOS-a məxsus, təkrarlana bilən bir vizual imza, və düşünülmüş tipoqrafik miqyas (başlıq/mətn ölçüləri, çəkilər, boşluqlar arasında aydın, ardıcıl pilləkən).

## Mobil — məcburidir, ikinci dərəcəli deyil

İstifadəçilər əsasən telefondan istifadə edəcək. "Masaüstü tərtibatını kiçiltmək" strategiyası qəbul edilmir. Konkret tələblər:

- Hər səhifə **390px enində** (adi telefon) tam işlək və oxunaqlı olmalıdır, üfüqi scroll olmadan (cədvəl/kod bloku istisna, onlar da öz konteynerində).
- Toxunma hədəfləri ən azı 44×44px.
- Naviqasiya problemi: hazırkı `Nav` komponenti 8 linki düz sırada göstərir (Dashboard, Hesablar, Əməliyyatlar, Kateqoriyalar, Büdcə, Hədəflər, İdxal, Ayarlar) — bu, mobil enində sığmır. Yeni dizayn bunun üçün konkret həll təklif etməlidir (alt tab bar, çəkmə/drawer, və ya başqa bir nümunə) — sadəcə "responsive edək" demək kifayət deyil.
- Data-sıx səhifələr (Ledger-in əməliyyat cədvəli, Budget-in allocation sətirləri, Import-un icmal cədvəli) üçün mobil-spesifik tərtibat lazımdır (məs. cədvəl → kart siyahısına çevrilməsi), sadəcə kiçildilmiş masaüstü versiyası deyil.
- Formalar (əksər səhifədə var) mobil klaviatura ilə rahat işləməlidir: düzgün `inputMode`/`type`, kifayət qədər böyük toxunma sahəsi, klaviatura açıldıqda submit düyməsinin görünən qalması.

## Səhifə-səhifə funksionallıq

Aşağıdakılar **mövcud kodun faktiki inventarıdır** — dizayn hər elementi əhatə etməlidir. Endpoint xəritəsi: `docs/PAGES.md`.

### Ümumi shell (bütün qorunan səhifələr)

- **Nav** (`src/components/layout/nav.tsx`): solda "FinanceOS" wordmark + 8 link (Dashboard · Hesablar · Əməliyyatlar · Kateqoriyalar · Büdcə · Hədəflər · İdxal · Ayarlar), sağda istifadəçi email-i + "Çıxış" düyməsi. Aktiv link yalnız font çəkisi ilə fərqlənir.
- **Məzmun sahəsi:** `max-w-4xl`, mərkəzləşdirilmiş.
- **Auth gate:** token yoxdursa `/login`-ə yönləndirilir; yoxlama müddətində tam ekran "Yüklənir..." mətni.
- **Hər səhifənin başı:** H1 + `InfoNote` (yeni istifadəçi üçün 2–3 cümləlik izah qutusu).

### Təkrarlanan pattern-lər (dizayn sistemi bunları həll etməlidir)

| Pattern | Hazırkı həll | Problem |
|---|---|---|
| Yüklənmə | "Yüklənir..." boz mətn | Skeleton yoxdur |
| Xəta | Qırmızı mətn (`ErrorText`) | İkon/struktur yoxdur |
| Boş hal | "Hələ hesab yoxdur." boz mətn | Dizayn edilməyib |
| Təsdiq | **Native `window.confirm()`** — 5 yerdə (hesab arxivləmə, hədəf tamamla/imtina, büdcə deaktiv, təhlükəli zona) | Brauzerin öz dialoqu, dizayna aid deyil — əvəzlənməlidir |
| Select sahələri | Xam `<select>` + inline Tailwind class | `Input` komponenti ilə uyğunsuz, fokus halı yoxdur |
| Submit düyməsi | Mətn dəyişir ("Əlavə olunur...") | Spinner/disabled halı zəif |
| İkon seçimi | İstifadəçi **emoji** yazır (kateqoriya ikonu) | Real ikon sistemi ilə ziddiyyət — həll lazımdır |

### 1–4. Auth səhifələri (artıq yenidən dizayn olunub, amma təkrar baxılmalıdır)

- **`/login`** — Email, Parol; "Şifrəni unutmusunuz?" linki; "Qeydiyyatdan keçin" linki.
- **`/register`** — Email, Parol (min 8), Baza valyuta (default `AZN`, 3 hərf); `locale` gizli sahədir (`az-AZ`).
- **`/forgot-password`** — Email → göndərildikdən sonra təsdiq halı (email mövcud olsun-olmasın eyni mesaj, sızdırmama).
- **`/reset-password?token=...`** — 3 hal: token yoxdur (xəta) / forma (Yeni parol + təkrar) / uğur.

### 5. Dashboard — `/dashboard`

- **Cəmi kartı:** baza valyutada xalis dəyər (böyük rəqəm) + valyuta kodu.
- **Hesab kartları** (2 sütun grid): hesab adı, `balans + valyuta`, altında `≈ çevrilmiş dəyər baza valyutada`.
- Hallar: yüklənir / xəta / "Hələ hesab yoxdur."
- **Dizayn qeydi:** bu, istifadəçinin ilk gördüyü ekrandır — hazırda ən zəif səhifədir (sadəcə 2 sətir mətn). Brend və məlumat iyerarxiyası burada ən çox lazımdır.

### 6. Accounts — `/accounts`

- **"Yeni hesab" forması** (üfüqi, wrap): Ad (mətn) · Tip (select: `ACCOUNT_TYPES`) · Valyuta (mətn, default AZN) · "Hesab aç" düyməsi.
- **Hesab siyahısı:** hər biri bir sətir-kart — ad (+ arxivlənibsə "(arxivlənib)" etiketi), altında `tip · balans valyuta`; sağda "Arxivlə" düyməsi (yalnız aktiv hesablarda, `window.confirm` ilə).
- Hallar: yüklənir / xəta / boş.

### 7. Ledger — `/ledger` (ən mürəkkəb səhifə)

- **4 tab-lı forma kartı:**
  - **Gəlir / Xərc:** Hesab (select) · Kateqoriya (select, növə görə filtrlənir, "Kateqoriyasız" seçimi var) · Məbləğ · Qeyd (istəyə görə).
  - **Transfer:** Mənbə hesab · Hədəf hesab · Məbləğ (mənbə valyutasında) · Qeyd. Ən azı 2 hesab tələb olunur.
  - **Düzəliş:** Hesab · Düzəliş (işarəli, məs. `-12.50`) · Qeyd.
  - Hesab yoxdursa: "Əməliyyat qeyd etmək üçün əvvəlcə bir hesab açın."
- **Filtr sətri:** hesab select ("Bütün hesablar") + "Balansı yenidən hesabla" düyməsi + nəticə mətni ("N balans düzəldildi").
- **Əməliyyat cədvəli** (tarixə görə azalan): Tarix · Hesab · Kateqoriya · İstiqamət (Kredit = yaşıl, Debit = qırmızı) · Məbləğ · Qeyd.
- **Mobil:** 6 sütunlu cədvəl 390px-ə sığmır — kart siyahısına çevrilməlidir. 4 tab da dar ekranda yer problemidir.

### 8. Categories — `/categories`

- **"Yeni kateqoriya" forması:** Ad · Növ (Xərc/Gəlir) · Valideyn (select — seçilmiş növə görə reaktiv filtrlənir, adlar girintili göstərilir) · İkon (emoji) · "Əlavə et".
- **İki sütun:** Gəlir və Xərc — hər biri **iyerarxik ağac** (hər səviyyə 16px girinti).
- **Hər sətirdə 2 əməliyyat:**
  - "Redaktə" → inline forma (Ad · İkon · Valideyn) + Saxla/Ləğv et.
  - "Sil" → **4 strategiya seçimi**: `reassign` (başqa kateqoriyaya köçür — seçiləndə hədəf kateqoriya select-i görünür) · `uncategorize` · `delete` · `archive`.
- **Mobil:** 2 sütun → 1 sütun; ağac girintisi + inline redaktə forması dar ekranda ciddi problemdir.

### 9. Budget — `/budget`

- **"Yeni büdcə" forması:** Ad · Şablon (select, "Xüsusi" seçimi ilə) · Prioritet (number) · Başlanğıc tarixi (date) · Bitmə tarixi (date, istəyə görə) · **dinamik allocation sətirləri** (hər sətir: Kateqoriya select + Faiz % input; sətir əlavə et/sil). Şablon seçiləndə sətirlər avtomatik doldurulur.
- **Büdcə kartları:** ad · `Şablon|Xüsusi · tarix aralığı` · sağda "Deaktiv et" (qırmızı) · allocation siyahısı (`kateqoriya: faiz%`) · prioritet input + "Saxla" · "Yoxla" düyməsi.
- **"Yoxla" nəticəsi** (kart daxilində açılır): dövr aralığı + dövr gəliri, sonra hər allocation üçün `actual / limit (faiz%)` — limit aşılıbsa qırmızı + "— limit aşılıb".
- **Mobil:** dinamik kateqoriya+faiz cütləri olan forma ən çətin mobil elementlərdən biridir.

### 10. Goals — `/goals`

- **"Yeni hədəf" forması:** Ad · Hədəf məbləği · Valyuta (default istifadəçinin baza valyutası) · Hədəf tarixi (date, istəyə görə) · Bağlı hesab (select, istəyə görə).
- **Status filtri** (tab): Hamısı · Aktiv · Tamamlanıb · İmtina edilib (server-side filtr).
- **Hədəf kartları** (2 sütun): ad · `məbləğ valyuta · tarix · bağlı hesab` · sağda status etiketi · **tərəqqi zolağı** + `cari / hədəf valyuta (N%)` · aktiv hədəflərdə "Tamamla" və "İmtina et" düymələri.

### 11. Import (bank çıxarışı) — `/import`

Üç addımlı axın, hamısı eyni səhifədə:

1. **Yükləmə forması:** Hesab (select) · Bank (select — hazırda yalnız Leobank) · Fayl (CSV file input) · "Önizlə" düyməsi.
2. **İcmal ekranı:**
   - Xülasə sətri: `N sətir, N fərqli tacir/təsvir, N dublikat (avtomatik seçimdən çıxarılıb), N balans uyğunsuzluğu` + "Hamısını seç" / "Seçimi ləğv et".
   - **Qruplaşdırılmış cədvəl:** checkbox (qarışıq seçimdə `indeterminate`) · Tacir/Təsvir · Cəm məbləğ · Kateqoriya (select + "+ Yeni" → **modal**: Ad, İkon) · **Bayraqlar** (rozetlər: `Dublikat` amber, `Daxili köçürmə` purple, `Balans uyğunsuzluğu` qırmızı) · "Gələcək üçün xatırla" checkbox + "Detallar" aç/bağla.
   - **Detallar açılanda:** qrupdakı fərdi sətirlər — checkbox · tarix — məbləğ · Qeyd input · dublikat rozeti.
3. **Nəticə:** yaşıl kart — `N sətir idxal olundu, N artıq mövcud olduğu üçün ötürüldü, N seçilmədiyi üçün idxal edilmədi` + "Yeni fayl yüklə".

- **Mobil:** redaktə oluna bilən 6 sütunlu cədvəl — bütün tətbiqdəki ən ağır mobil problem, tamamilə yenidən düşünülməlidir.

### 12. Settings — `/settings`

- **"Hesab məlumatı" kartı:** Email · Baza valyuta · Dil · Client (etiket–dəyər siyahısı, statik).
- **"FX Kursları" kartı:** forma (Baza valyuta · Kotirovka valyuta · Kurs · Tarix — istəyə görə, default bugün) + cədvəl (Cüt · Kurs · Tarix · Mənbə).
- **"Təhlükəli Zona" kartı** (qırmızı kənar): iki əməliyyat, hər biri başlıq + izah + **Parol** input + qırmızı düymə + `window.confirm`:
  - "Hesabı deaktiv et" — bütün sessiyalar ləğv olunur.
  - "Bütün məlumatları sil" — geri dönməz tam silinmə.

## Texniki kontekst (dizaynı məhdudlaşdıran faktlar)

- **Stack:** Next.js 16 (App Router), React 19, Tailwind CSS v4 (CSS-first `@theme`, `tailwind.config.js` yoxdur), TanStack Query, react-hook-form + zod.
- **Komponent vəziyyəti — hibrid, qərar tələb edir:**
  - `src/components/ui/*` — orijinal, əl ilə yazılmış minimal primitiv-lər (Button, Input, Card, Field, ErrorText, InfoNote, Modal), 9 səhifənin hamısında istifadə olunur.
  - `src/components/shadcn/*` — bu sessiyada əlavə olunmuş shadcn/Base UI komponentləri (Button, Input, Label, Field, Separator), **hazırda yalnız auth səhifələrində** istifadə olunur. `components.json`-da `ui` alias-ı bilərəkdən `@/components/shadcn`-a yönləndirilib ki, orijinal `ui/` qovluğu ilə toqquşmasın (ilk `shadcn init` sınağı `ui/button.tsx`-i sükutla əvəz edib bütün tətbiqi sındırmışdı — bu təkrarlanmamalıdır).
  - **Açıq qərar:** bütün tətbiq `shadcn/Base UI`-a keçsin, yoxsa hazırkı minimal `ui/` sistemi genişləndirilsin? Bu, dizayn mərhələsində həll olunmalıdır, kod tərəfi hər iki variantı dəstəkləyir.
- **Dizayn token-ləri:** `src/app/globals.css`-də shadcn-in CSS dəyişənləri (`--primary`, `--background`, `--ring` və s.) artıq mövcuddur və hələ yalnız auth səhifələrində istifadə olunur — qalan 9 səhifə hələ də sərt-kodlanmış `zinc-*`/`red-*` Tailwind rənglərini işlədir. Yeni dizayn bu token sistemini bütün tətbiqə genişləndirməlidir.
- **Font:** Geist (sans + mono), `next/font/google` ilə yüklənib, `--font-geist-sans`/`--font-geist-mono` dəyişənləri `<html>`-ə tətbiq olunur. Əvvəllər `globals.css`-dəki səhv (`font-family: Arial`, sonra `shadcn init`-in dövri istinad bug-ı) buna mane olurdu — indi düzəldilib, Geist real işləyir.
- **İkon kitabxanası:** `lucide-react` artıq asılılıq kimi mövcuddur (shadcn ilə gəlib) — emoji/unicode ikon əvəzinə bunlardan istifadə olunmalıdır.
- **Auth modeli:** Bearer token `localStorage`-da saxlanılır (server-side middleware qorunması yoxdur, bilərəkdən qəbul edilmiş məhdudiyyət). `(app)` route qrupu client-side yoxlama edir.
- **Dark mode:** Tailwind/shadcn token-ləri `.dark` sinfi üçün artıq scaffold edilib, amma heç bir toggle UI yoxdur və heç yerdə `.dark` sinfi tətbiq olunmur. Hazırda **tələb olunmur**, gələcək üçün qapı açıq saxlanılıb.

## Məzmun xarakteri

- Pul məbləğləri hər yerdə görünür — `tabular-nums`, düzgün onluq/valyuta formatlaması, müsbət/mənfi fərqləndirmə (rəng + işarə) diqqətlə düşünülməlidir.
- Çox-valyutalı göstərim (əsas + çevrilmiş dəyər ikisi bir yerdə, məs. Dashboard-dakı hesab kartları) tez-tez rast gəlinir.
- Formalar hər səhifədə var — vahid label/error/description nümunəsi lazımdır (auth-da `Field`/`FieldError` başlanğıc nöqtəsi ola bilər, amma genişlənməlidir: checkbox, select, dinamik sətir siyahısı `useFieldArray` kimi formalar da var, məs. Budget/Import).
- Boş hallar (yeni istifadəçi, hələ heç bir hesab/əməliyyat yoxdur) hər səhifədə nəzərə alınmalıdır — hazırda `InfoNote` ilə mətn izahı verilir, bu, yenidən düşünülə bilər.

## Açıq qalan suallar (dizayn mərhələsində həll olunacaq)

- Konkret rəng palitrası/aksent rəng (yalnız "müasir və isti" istiqaməti verilib, dəqiq HEX/OKLCH dəyərləri yoxdur).
- Loqomark lazımdırmı, yoxsa tipoqrafiya-əsaslı wordmark kifayətdirmi.
- `src/components/ui/*` vs `src/components/shadcn/*` — tam miqrasiya, yoxsa hibrid saxlanılsın.
- Dashboard-a qrafik (xalis dəyər trendi) əlavə olunsunmu, yoxsa MVP-dən kənar saxlanılsın (bax `financeos-core/docs/decisions/0003-mvp-scope.md`).
