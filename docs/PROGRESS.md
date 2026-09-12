# Progress

Bu fayl status lövhəsidir, changelog deyil (dəyişikliklərin tarixçəsi üçün git-ə bax). Mənalı bir iş bitəndə, ya da scope-a dair qərar veriləndə bu faylı yenilə. Qısa yaz — bir sətir kifayətdir, detal lazımdırsa ADR-ə keçid ver.

## Slice statusu

| Slice | Status | Qeyd |
|---|---|---|
| Layihə scaffold-u | Tətbiq olundu | `pnpm create next-app` — Next.js (App Router, TS, Tailwind, ESLint), bax `docs/decisions/0001-frontend-foundation.md` |
| Slice 1: Auth + Dashboard + Accounts | Tətbiq olundu | Login/Register, `AuthContext`, Dashboard (`GET /net-worth`), Accounts (list/open/archive). Bax `docs/PAGES.md` |
| Slice 2: Ledger | Tətbiq olundu | Əməliyyat siyahısı + gəlir/xərc/transfer/adjust formaları + reconcile. Bax `docs/PAGES.md` |
| Slice 3: Categories | Tətbiq olundu | Gəlir/Xərc sütunları (sistem+öz), yeni kateqoriya forması (valideyn seçimi ilə). Bax `docs/PAGES.md` |
| Slice 4: Budget | Tətbiq olundu | Şablon/xüsusi büdcə yaratma, prioritet, "Yoxla" (limit/actual/breached), deaktivasiya. Bax `docs/PAGES.md` |
| Slice 5: Goals | Tətbiq olundu | Status filtri, hədəf yaratma (bağlı hesabla), tərəqqi zolağı, tamamla/imtina. Bax `docs/PAGES.md` |
| Slice 6: Settings (FX rates, deaktivasiya/silmə) | Tətbiq olundu | Hesab məlumatı, FX kurs cədvəli+forması, təhlükəli zona (deaktivasiya/silmə). Bax `docs/PAGES.md` |
| AI Assistant client | Başlanmayıb | `financeos-core/docs/MODULES.md` §9 |

Planlaşdırılmış 6 slice-in hamısı tamamlanıb. Qalan iş: AI Assistant client (ayrı, daha böyük qərar — bax aşağıda) və `financeos-core/docs/PROGRESS.md`-dəki backend-only açıq maddələr (parol sıfırlama, FX cron — hər ikisi xarici provider tələb etdiyi üçün bloklanıb).

## Növbəti addımlar

- [x] Next.js layihəsini scaffold et
- [x] Frontend context sənədləri (`CLAUDE.md`, `.claude/rules/`, `docs/decisions/`, `docs/PAGES.md`)
- [x] `src/lib/api/client.ts` — mərkəzləşdirilmiş fetch wrapper (auth header, xəta formatı)
- [x] `src/lib/auth/auth-context.tsx` — token saxlanması, `/auth/me` ilə doğrulama
- [x] Login/Register səhifələri
- [x] `(app)` qorunan layout + nav
- [x] Dashboard səhifəsi (`GET /net-worth`)
- [x] Accounts səhifəsi (list/open/archive)
- [x] Slice 1 yoxlama: `pnpm build`/`lint` təmiz, backend `:3000` + frontend `:3001` paralel işə salınıb, register→open-account→net-worth axını real sorğularla təsdiqləndi (backend cavabları frontend-in `lib/api` tipləri ilə eynidir), CORS preflight yoxlanıldı, test datası silindi
- [ ] Tam brauzer click-through testi (bu sessiyada hər iki slice API-səviyyəli yoxlanıldı, real brauzer sessiyası hələ yoxlanılmayıb)
- [x] Slice 2: Ledger — `lib/api/{ledger,categories}.ts`, gəlir/xərc/transfer/düzəliş formaları, əməliyyat cədvəli, hesab filtri, reconcile düyməsi
- [x] Slice 3: Categories — `createCategory()`, Gəlir/Xərc sütunları, yeni kateqoriya forması, nav-a link əlavə olundu
- [x] Slice 4: Budget — `lib/api/budget.ts`, şablon-əsaslı/xüsusi büdcə forması (`useFieldArray` ilə allocation sətirləri), büdcə kartları (prioritet, "Yoxla", deaktivasiya)
- [x] Slice 5: Goals — `lib/api/goals.ts`, status filtri, hədəf forması (bağlı hesab istəyə görə), tərəqqi zolağı, tamamla/imtina
- [x] Slice 6: Settings — `lib/api/fx-rates.ts`, `auth.ts`-ə `deactivateAccount`/`deleteAllData`, hesab məlumatı bölməsi, FX kurs cədvəli+forması, təhlükəli zona (parol təsdiqli deaktivasiya/silmə)
- [ ] AI Assistant client (ayrı qərar tələb edir — chat UI dizaynı, streaming yanaşması)

## Log

*(ən yenisi əvvəldə — sessiya/qərar başına bir sətir, aidiyyatı olan ADR-ə keçid ver)*

- Slice 6 (Settings) tətbiq olundu — planlaşdırılmış 6 slice-in sonuncusu: `lib/api/fx-rates.ts` (`listFxRates`, `upsertFxRate`), `lib/api/auth.ts`-ə `deactivateAccount`/`deleteAllData` əlavə olundu. `/settings` səhifəsi: hesab məlumatı (statik, `AuthContext`-dən), FX kursları (cədvəl+əlavə/yeniləmə forması), Təhlükəli Zona (deaktivasiya və data silinməsi — hər ikisi parol input-u + `window.confirm` ilə iki səviyyəli təsdiq, uğur olduqda sessiya təmizlənib `/login`-ə yönləndirilir). Nav-dan "tezliklə" placeholder məntiqi (bütün linklər indi aktiv olduğu üçün) silindi. `pnpm build`/`lint` təmiz. Backend+frontend paralel, FX kurs əlavəsi+siyahısı, yanlış/düzgün parolla deaktivasiya (401→200→sonrakı sorğular 401) və ayrıca istifadəçi ilə delete-data (401→200→401) axınları curl ilə yoxlanıldı; qlobal FX test sətri (`EUR/AZN`, `delete-data` ilə silinmir, çünki istifadəçiyə bağlı deyil) əl ilə `psql`-lə təmizləndi.
- Slice 5 (Goals) tətbiq olundu: `lib/api/goals.ts` (`createGoal`, `listGoals`, `completeGoal`, `abandonGoal`). `/goals` səhifəsi: status tab-ları (Hamısı/Aktiv/Tamamlanıb/İmtina, server-side `?status=` filtri), "Yeni hədəf" forması (valyuta default `user.baseCurrency`, bağlı hesab istəyə görə), hədəf kartları (tərəqqi zolağı `progress.percent` varsa, yalnız aktiv hədəflərdə Tamamla/İmtina düymələri). Nav-a "Hədəflər" linki aktivləşdirildi. `pnpm build`/`lint` təmiz. Backend+frontend paralel, bağlı hesabla hədəf yaratma → progress 0%-dən 25%-ə (gəlir yazıldıqdan sonra) → status filtri → tamamlama axını curl ilə yoxlanıldı, test datası silindi.
- Slice 4 (Budget) tətbiq olundu: `lib/api/budget.ts` (`getTemplates`, `createBudget`, `listBudgets`, `checkBudget`, `updateBudgetPriority`, `deactivateBudget`). `/budget` səhifəsi: "Yeni büdcə" forması (şablon seçəndə `useFieldArray` ilə allocation sətirləri şablonun bucket-lərindən prefill olunur, kateqoriya hər sətirdə əl ilə seçilir; "Xüsusi"-də sərbəst sətir əlavə/sil), büdcə kartları (allocation-lar, prioritet dəyişmə, "Yoxla" düyməsi limit/actual/breached göstərir, deaktivasiya). Percent/priority sahələri `z.coerce.number()` əvəzinə string+regex saxlanıldı (react-hook-form+zodResolver-in input/output tip uyğunsuzluğu problemi, layihənin digər formalarındakı eyni pattern). `pnpm build`/`lint` təmiz. Backend+frontend paralel, tam axın (şablonlar → xərc kateqoriyalı büdcə yarat → gəlir+xərc qeyd et → limit aşımı düzgün aşkarlandı → prioritet dəyiş → deaktiv et) curl ilə yoxlanıldı, test datası silindi.
- Slice 3 (Categories) tətbiq olundu: `lib/api/categories.ts`-ə `createCategory()` əlavə olundu. `/categories` səhifəsi: Gəlir/Xərc iki sütun (sistem kateqoriyalar "sistem" etiketi ilə), "Yeni kateqoriya" forması (ad, kind, valideyn seçimi — yalnız seçilmiş kind-dəki mövcud kateqoriyalar, `useWatch` ilə reaktiv filtrlənir, icon istəyə görə). Nav-a "Kateqoriyalar" linki əlavə olundu. `pnpm build`/`lint` təmiz. Backend+frontend paralel, seed edilmiş 8 sistem kateqoriyası + valideynli yeni kateqoriya yaratma + uyğunsuz `kind`-lə valideyn seçəndə 400 gözləndiyi kimi curl ilə yoxlanıldı, test datası silindi.
- Slice 2 (Ledger) tətbiq olundu: `lib/api/ledger.ts` (`listEntries`, `recordIncome`, `recordExpense`, `transfer`, `adjustBalance`, `reconcile`), `lib/api/categories.ts` (`listCategories`). `/ledger` səhifəsi: hesab filtri, 4 tab-lı forma (Gəlir/Xərc — ortaq `EntryForm`, kateqoriya `kind`-ə görə filtrlənir; Transfer; Düzəliş), əməliyyat cədvəli (hesab/kateqoriya adları `accounts`/`categories` siyahıları ilə join edilir), "Balansı yenidən hesabla" düyməsi. Uğurlu mutasiyalardan sonra `['ledger-entries']`+`['accounts']`+`['net-worth']` invalidasiya olunur. `pnpm build`/`lint` təmiz. Backend+frontend paralel işə salınıb, iki hesab + gəlir/xərc(kateqoriyalı)/transfer/adjust/reconcile tam axını curl ilə yoxlanıldı, balanslar gözlənilən qiymətlərlə üst-üstə düşdü, test datası silindi.
- Slice 1 tətbiq olundu: `lib/api/{client,auth,accounts,net-worth}.ts` (backend DTO-larının əl ilə güzgüsü, bax `docs/decisions/0001-frontend-foundation.md`), `AuthContext` (localStorage token + `/auth/me` doğrulaması, 401-də avtomatik logout), Login/Register formaları (`react-hook-form`+`zod`), qorunan `(app)` shell + nav, Dashboard (`GET /net-worth`), Accounts (list/open/archive, TanStack Query ilə invalidasiya). `pnpm build`/`lint` təmiz. Backend+frontend paralel işə salınıb, real register→open-account→net-worth axını curl ilə (frontend-in çağırdığı eyni endpoint/format) yoxlanıldı, CORS preflight təsdiqləndi, test datası `POST /auth/delete-data` ilə təmizləndi.
- Layihə scaffold edildi (Next.js 16, App Router, TS, Tailwind, ESLint, pnpm), frontend context sənədləri yaradıldı: `CLAUDE.md`, `.claude/rules/api-integration.md`, `.claude/rules/ui-conventions.md`, `docs/decisions/0001-frontend-foundation.md`, `docs/PAGES.md`. Backend-də bu seçimin tələb etdiyi yeganə dəyişiklik (CORS) `financeos-core`-un öz `docs/decisions/0014-cors-for-web-client.md`-də sənədləşdirilib.
